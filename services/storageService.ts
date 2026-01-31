import { Exam } from '../types';

const STORAGE_KEY = 'profcorrector_exams';

export const saveExamToStorage = (exam: Exam): void => {
  const existing = getExamsFromStorage();
  const index = existing.findIndex(e => e.id === exam.id);
  
  if (index >= 0) {
    existing[index] = exam;
  } else {
    existing.push(exam);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
};

export const getExamsFromStorage = (): Exam[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const getExamById = (id: string): Exam | undefined => {
  const exams = getExamsFromStorage();
  return exams.find(e => e.id === id);
};

export const deleteExamFromStorage = (id: string): void => {
  const exams = getExamsFromStorage().filter(e => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(exams));
};