import { GoogleGenAI, Type } from "@google/genai";
import { Exam, GradingResult, ScantronResult } from '../types';

const VISION_MODEL = "gemini-3-pro-image-preview";

export const gradeScantron = async (
  exam: Exam,
  imageBase64: string
): Promise<GradingResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // We only need the number of questions to tell the AI what to look for
  const questionCount = exam.questions.length;

  const systemPrompt = `
    VOCÊ É UM CORRETOR DE GABARITOS (OMR).
    Sua tarefa é analisar a imagem de uma Folha de Respostas e identificar quais letras foram marcadas.

    INSTRUÇÕES VISUAIS:
    1. Procure pela grade de respostas numerada de 1 a ${questionCount}.
    2. Para cada número, verifique as opções (A, B, C, D...).
    3. Uma opção é considerada "MARCADA" se a bolinha estiver totalmente preenchida (pintada) ou marcada com um X forte.
    4. Se a bolinha estiver vazia ou apenas com um ponto pequeno, é "NÃO MARCADA".
    
    REGRAS DE EXTRAÇÃO:
    - Retorne a letra selecionada para cada questão.
    - Se houver duas marcações na mesma linha: retorne "ANULADA".
    - Se não houver marcação: retorne "BRANCO".
    - Tente identificar o nome do aluno no cabeçalho (escrito à mão ou impresso).
    
    FORMATO DE RESPOSTA:
    Retorne APENAS um objeto JSON válido. Não use blocos de código markdown (\`\`\`json).
  `;

  try {
    const response = await ai.models.generateContent({
      model: VISION_MODEL,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: imageBase64
            }
          },
          {
            text: `Analise esta folha de respostas. Existem ${questionCount} questões. Identifique a alternativa correta para cada uma.`
          }
        ]
      },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            studentName: { type: Type.STRING, description: "Nome do aluno identificado" },
            answers: {
              type: Type.ARRAY,
              description: "Lista de respostas",
              items: {
                type: Type.OBJECT,
                properties: {
                  questionIndex: { type: Type.INTEGER, description: "Número da questão" },
                  selectedLetter: { type: Type.STRING, description: "Letra marcada (A, B, C, D, ANULADA, BRANCO)" }
                }
              }
            }
          }
        }
      }
    });

    if (!response.text) {
      throw new Error("A IA não retornou nenhum texto.");
    }

    // SANITIZATION: Remove markdown code blocks if present (Common cause of JSON parse errors)
    let cleanJson = response.text.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/^```json/, '').replace(/```$/, '');
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```/, '').replace(/```$/, '');
    }

    let extraction: ScantronResult;
    try {
        extraction = JSON.parse(cleanJson) as ScantronResult;
    } catch (e) {
        console.error("Erro ao fazer parse do JSON bruto:", cleanJson);
        throw new Error("Falha ao processar os dados retornados pela IA.");
    }

    // Now perform the deterministic grading locally
    let totalScore = 0;
    const maxScore = exam.questions.reduce((sum, q) => sum + q.points, 0);

    const matches = exam.questions.map((question, index) => {
      // Find the answer for this question number (index + 1)
      const studentAns = extraction.answers.find(a => a.questionIndex === (index + 1));
      const studentLetter = studentAns ? studentAns.selectedLetter.toUpperCase() : "BRANCO";
      const correctLetter = question.correctAnswer.toUpperCase();
      
      const isCorrect = studentLetter === correctLetter;
      const points = isCorrect ? question.points : 0;
      
      totalScore += points;

      return {
        questionId: question.id,
        questionNumber: index + 1,
        correctLetter,
        studentLetter,
        isCorrect,
        points
      };
    });

    return {
      studentName: extraction.studentName || "Aluno Não Identificado",
      totalScore,
      maxScore,
      matches
    };

  } catch (error) {
    console.error("Erro completo na leitura óptica:", error);
    throw error;
  }
};