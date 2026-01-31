export interface Question {
  id: string;
  text: string;
  imageUrl?: string;
  options: string[];
  correctAnswer: string; // "A", "B", "C", etc.
  points: number;
}

export interface ExamHeader {
  schoolName: string;
  teacherName: string;
  subject: string;
  grade: string; // Turma
  date: string;
  instructions: string;
}

export interface Exam {
  id: string;
  title: string;
  createdAt: number;
  header: ExamHeader;
  questions: Question[];
}

export interface GradingResult {
  studentName: string;
  totalScore: number;
  maxScore: number;
  matches: {
    questionIndex: number; // 1-based
    correctLetter: string;
    studentLetter: string; // "A", "B" or "BRANCO"/"ANULADA"
    isCorrect: boolean;
  }[];
}