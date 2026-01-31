import { Exam } from '../types';

const KEY = 'PROFCORRECTOR_DATA_V2';

export const getExams = (): Exam[] => {
  try {
    const data = localStorage.getItem(KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveExam = (exam: Exam) => {
  const exams = getExams();
  const index = exams.findIndex(e => e.id === exam.id);
  if (index >= 0) {
    exams[index] = exam;
  } else {
    exams.push(exam);
  }
  localStorage.setItem(KEY, JSON.stringify(exams));
};

export const deleteExam = (id: string) => {
  const exams = getExams().filter(e => e.id !== id);
  localStorage.setItem(KEY, JSON.stringify(exams));
};