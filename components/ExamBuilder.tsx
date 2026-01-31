import React from 'react';
import { Exam, Question } from '../types';
import { Plus, Trash2, Save, Image as ImageIcon, X } from 'lucide-react';

interface Props {
  exam: Exam;
  setExam: (e: Exam) => void;
  onSave: () => void;
}

export const ExamBuilder: React.FC<Props> = ({ exam, setExam, onSave }) => {
  
  const updateHeader = (field: string, value: string) => {
    setExam({ ...exam, header: { ...exam.header, [field]: value } });
  };

  const addQuestion = () => {
    const newQ: Question = {
      id: Math.random().toString(36).substr(2, 9),
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 'A',
      points: 1
    };
    setExam({ ...exam, questions: [...exam.questions, newQ] });
  };

  const updateQuestion = (qId: string, updates: Partial<Question>) => {
    setExam({
      ...exam,
      questions: exam.questions.map(q => q.id === qId ? { ...q, ...updates } : q)
    });
  };

  const handleImageUpload = (qId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      updateQuestion(qId, { imageUrl: e.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase">Título do Projeto</label>
          <input 
            value={exam.title}
            onChange={(e) => setExam({...exam, title: e.target.value})}
            className="text-xl font-bold bg-transparent border-none focus:ring-0 p-0 text-gray-800 placeholder-gray-400"
            placeholder="Ex: Prova de Matemática 1º Bimestre"
          />
        </div>
        <button onClick={onSave} className="bg-brand-600 text-white px-4 py-2 rounded-md font-medium hover:bg-brand-700 flex items-center gap-2">
          <Save size={18} /> Salvar
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
          <h3 className="text-blue-800 font-bold mb-4 flex items-center gap-2">Cabeçalho da Prova</h3>
          <div className="grid grid-cols-2 gap-4">
            <input 
              placeholder="Nome da Escola"
              className="p-2 border rounded w-full"
              value={exam.header.schoolName}
              onChange={e => updateHeader('schoolName', e.target.value)}
            />
            <input 
              placeholder="Professor(a)"
              className="p-2 border rounded w-full"
              value={exam.header.teacherName}
              onChange={e => updateHeader('teacherName', e.target.value)}
            />
            <input 
              placeholder="Disciplina"
              className="p-2 border rounded w-full"
              value={exam.header.subject}
              onChange={e => updateHeader('subject', e.target.value)}
            />
            <div className="flex gap-2">
                <input 
                placeholder="Turma"
                className="p-2 border rounded w-full"
                value={exam.header.grade}
                onChange={e => updateHeader('grade', e.target.value)}
                />
                <input 
                type="date"
                className="p-2 border rounded w-full"
                value={exam.header.date}
                onChange={e => updateHeader('date', e.target.value)}
                />
            </div>
            <textarea 
              placeholder="Instruções Gerais..."
              className="p-2 border rounded w-full col-span-2 h-20"
              value={exam.header.instructions}
              onChange={e => updateHeader('instructions', e.target.value)}
            />
          </div>
        </div>

        {/* Questions Section */}
        <div className="space-y-6">
          {exam.questions.map((q, idx) => (
            <div key={q.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow relative">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded">Questão {idx + 1}</span>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Pontos:</span>
                        <input 
                            type="number" 
                            value={q.points}
                            onChange={(e) => updateQuestion(q.id, { points: Number(e.target.value) })}
                            className="w-16 p-1 border rounded text-center text-sm"
                        />
                    </div>
                    <button 
                        onClick={() => {
                            if(confirm("Remover questão?")) 
                                setExam({...exam, questions: exam.questions.filter(qi => qi.id !== q.id)})
                        }}
                        className="text-gray-400 hover:text-red-500"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
              </div>

              <textarea 
                className="w-full p-3 border rounded-md mb-4 text-gray-700 min-h-[80px]"
                placeholder="Digite o enunciado da questão..."
                value={q.text}
                onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
              />

              {q.imageUrl ? (
                <div className="relative inline-block mb-4 border rounded group">
                  <img src={q.imageUrl} alt="Questão" className="max-h-48 object-contain" />
                  <button 
                    onClick={() => updateQuestion(q.id, { imageUrl: undefined })}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="mb-4">
                    <label className="cursor-pointer inline-flex items-center gap-2 text-sm text-brand-600 hover:text-brand-800 font-medium bg-blue-50 px-3 py-2 rounded">
                        <ImageIcon size={16} /> Adicionar Imagem
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageUpload(q.id, e.target.files[0])} />
                    </label>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {q.options.map((opt, optIdx) => {
                    const letter = String.fromCharCode(65 + optIdx);
                    return (
                        <div key={optIdx} className="flex items-center gap-2">
                            <button 
                                onClick={() => updateQuestion(q.id, { correctAnswer: letter })}
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border ${q.correctAnswer === letter ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-400 border-gray-300'}`}
                            >
                                {letter}
                            </button>
                            <input 
                                value={opt}
                                onChange={(e) => {
                                    const newOpts = [...q.options];
                                    newOpts[optIdx] = e.target.value;
                                    updateQuestion(q.id, { options: newOpts });
                                }}
                                className={`flex-1 p-2 border rounded text-sm ${q.correctAnswer === letter ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}
                                placeholder={`Alternativa ${letter}`}
                            />
                        </div>
                    )
                })}
              </div>
            </div>
          ))}

          <button 
            onClick={addQuestion}
            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-medium hover:border-brand-500 hover:text-brand-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={20} /> Adicionar Nova Questão
          </button>
        </div>
      </div>
    </div>
  );
};