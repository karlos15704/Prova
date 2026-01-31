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
    ATENÇÃO: Você é um sistema de Leitura Óptica (OMR).
    Sua única função é extrair letras marcadas em uma folha de gabarito (scantron).
    
    1. Analise a imagem. Busque por um cabeçalho com nome do aluno (pode ser manuscrito).
    2. Busque por uma grade de respostas numerada de 1 até ${questionCount}.
    3. Para cada número, identifique qual bolinha/letra foi preenchida ou marcada com X.
    4. Se houver rasura ou marcação dupla, marque como "ANULADA".
    5. Se não houver marcação, marque como "BRANCO".
    6. Retorne APENAS o JSON com os dados extraídos.
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
            text: `Extraia as respostas das questões 1 a ${questionCount}.`
          }
        ]
      },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            studentName: { type: Type.STRING, description: "Nome identificado no topo da folha" },
            answers: {
              type: Type.ARRAY,
              description: "Lista das respostas lidas",
              items: {
                type: Type.OBJECT,
                properties: {
                  questionIndex: { type: Type.INTEGER, description: "O número da questão (1, 2, 3...)" },
                  selectedLetter: { type: Type.STRING, description: "A letra identificada (A, B, C...) ou ANULADA/BRANCO" }
                }
              }
            }
          }
        }
      }
    });

    if (!response.text) {
      throw new Error("Falha na leitura óptica.");
    }

    const extraction = JSON.parse(response.text) as ScantronResult;

    // Now perform the deterministic grading locally (Math, not AI)
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
    console.error("Erro na leitura óptica:", error);
    throw error;
  }
};