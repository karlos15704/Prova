import { GoogleGenAI, Type } from "@google/genai";
import { Exam, GradingResult } from '../types';

export const gradeExamImage = async (exam: Exam, base64Image: string): Promise<GradingResult> => {
  // Inicialização segura
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key não encontrada");
  
  const ai = new GoogleGenAI({ apiKey });

  const questionCount = exam.questions.length;
  
  // Prompt super específico para evitar alucinações
  const systemPrompt = `
    Você é um scanner de gabaritos ópticos (OMR) de alta precisão.
    Sua tarefa é extrair as respostas marcadas em uma folha de respostas.
    
    Parâmetros:
    - Total de questões: ${questionCount}.
    - Opções possíveis: A, B, C, D, E.
    
    Regras de Leitura:
    1. Localize a grade de respostas numerada de 1 a ${questionCount}.
    2. Identifique qual bolinha/letra está preenchida (pintada) ou marcada com um X forte.
    3. Se houver mais de uma marcação na mesma linha -> Retorne "ANULADA".
    4. Se não houver marcação -> Retorne "BRANCO".
    5. Tente ler o nome do aluno escrito no cabeçalho. Se ilegível, retorne "Aluno Não Identificado".
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Image } },
          { text: `Analise a imagem. Extraia o nome do aluno e as respostas para as questões de 1 a ${questionCount}.` }
        ]
      },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            studentName: { type: Type.STRING },
            answers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  qNum: { type: Type.INTEGER, description: "Número da questão" },
                  selected: { type: Type.STRING, description: "Letra selecionada (A,B,C,D,E, BRANCO, ANULADA)" }
                }
              }
            }
          }
        }
      }
    });

    // Parse da resposta
    const data = JSON.parse(response.text || "{}");
    const extractedAnswers = data.answers || [];

    // Comparação determinística (Gabarito Oficial vs Resposta do Aluno)
    let totalScore = 0;
    const maxScore = exam.questions.reduce((acc, q) => acc + q.points, 0);

    const matches = exam.questions.map((q, idx) => {
      const qNum = idx + 1;
      const found = extractedAnswers.find((a: any) => a.qNum === qNum);
      const studentLetter = found ? found.selected.toUpperCase() : "BRANCO";
      const correctLetter = q.correctAnswer.toUpperCase();
      
      const isCorrect = studentLetter === correctLetter;
      if (isCorrect) totalScore += q.points;

      return {
        questionIndex: qNum,
        correctLetter,
        studentLetter,
        isCorrect
      };
    });

    return {
      studentName: data.studentName || "Aluno Desconhecido",
      totalScore,
      maxScore,
      matches
    };

  } catch (error) {
    console.error("Erro na correção:", error);
    throw new Error("Falha ao processar a imagem. Certifique-se que a foto está nítida e focada no gabarito.");
  }
};