export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  // Keeping OPEN as a fallback, but UI focuses on MC for scantron
  OPEN = 'OPEN' 
}

export interface Question {
  id: string;
  text: string;
  imageUrl?: string; // Base64 or URL
  type: QuestionType;
  options: string[]; // Dynamic array for variable number of options
  correctAnswer: string; // The letter (A, B...)
  points: number;
}

export interface ExamHeader {
  schoolName: string;
  teacherName: string;
  subject: string;
  grade: string;
  date: string;
  instructions: string;
  logoUrl?: string;
}

export interface Exam {
  id: string;
  title: string; // Internal title for the DB
  createdAt: number;
  header: ExamHeader;
  questions: Question[];
}

export interface ScantronResult {
  studentName: string;
  answers: { questionIndex: number; selectedLetter: string }[];
}

export interface GradingResult {
  studentName: string;
  totalScore: number;
  maxScore: number;
  matches: {
    questionId: string;
    questionNumber: number;
    correctLetter: string;
    studentLetter: string;
    isCorrect: boolean;
    points: number;
  }[];
}