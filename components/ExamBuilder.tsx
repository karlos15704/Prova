import React, { useState, useRef } from 'react';
import { Plus, Trash2, Save, ImageIcon, X, GripVertical, Upload } from 'lucide-react';
import { Exam, Question, QuestionType } from '../types';

interface ExamBuilderProps {
  currentExam: Exam;
  onUpdateExam: (exam: Exam) => void;
  onSave: () => void;
}

export const ExamBuilder: React.FC<ExamBuilderProps> = ({ currentExam, onUpdateExam, onSave }) => {
  const [activeTab, setActiveTab] = useState<'header' | 'questions'>('header');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [activeQuestionIdForImage, setActiveQuestionIdForImage] = useState<string | null>(null);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      text: '',
      imageUrl: undefined,
      type: QuestionType.MULTIPLE_CHOICE,
      options: ['', '', '', ''], // Start with 4
      correctAnswer: 'A',
      points: 1.0,
    };
    onUpdateExam({
      ...currentExam,
      questions: [...currentExam.questions, newQuestion],
    });
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    onUpdateExam({
      ...currentExam,
      questions: currentExam.questions.map((q) => (q.id === id ? { ...q, ...updates } : q)),
    });
  };

  const removeQuestion = (id: string) => {
    if (window.confirm('Tem certeza que deseja remover esta questão?')) {
      onUpdateExam({
        ...currentExam,
        questions: currentExam.questions.filter((q) => q.id !== id),
      });
    }
  };

  const handleOptionChange = (qId: string, optIndex: number, value: string) => {
    const question = currentExam.questions.find(q => q.id === qId);
    if (!question) return;
    
    const newOptions = [...question.options];
    newOptions[optIndex] = value;
    updateQuestion(qId, { options: newOptions });
  };

  const addOption = (qId: string) => {
    const question = currentExam.questions.find(q => q.id === qId);
    if (!question) return;
    updateQuestion(qId, { options: [...question.options, ''] });
  };

  const removeOption = (qId: string, optIndex: number) => {
    const question = currentExam.questions.find(q => q.id === qId);
    if (!question || question.options.length <= 1) return;
    
    const newOptions = question.options.filter((_, i) => i !== optIndex);
    // Reset correct answer if it becomes invalid (simple logic: reset to A)
    updateQuestion(qId, { options: newOptions, correctAnswer: 'A' });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeQuestionIdForImage) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        updateQuestion(activeQuestionIdForImage, { imageUrl: ev.target?.result as string });
        setActiveQuestionIdForImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        onUpdateExam({
          ...currentExam,
          header: { ...currentExam.header, logoUrl: ev.target?.result as string }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerImageUpload = (qId: string) => {
    setActiveQuestionIdForImage(qId);
    setTimeout(() => fileInputRef.current?.click(), 0);
  };

  const handleHeaderChange = (field: string, value: string) => {
    onUpdateExam({
      ...currentExam,
      header: { ...currentExam.header, [field]: value },
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
      <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
      
      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('header')}
          className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${
            activeTab === 'header'
              ? 'text-accent border-b-2 border-accent bg-blue-50/50'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          Cabeçalho
        </button>
        <button
          onClick={() => setActiveTab('questions')}
          className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${
            activeTab === 'questions'
              ? 'text-accent border-b-2 border-accent bg-blue-50/50'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          Questões ({currentExam.questions.length})
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
        {activeTab === 'header' && (
          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg mb-4">
              <label className="block text-sm font-bold text-slate-700 mb-1">Título da Prova (Interno)</label>
              <input
                type="text"
                value={currentExam.title}
                onChange={(e) => onUpdateExam({ ...currentExam, title: e.target.value })}
                className="w-full rounded-lg border-slate-300 shadow-sm focus:border-accent p-2 border font-bold"
                placeholder="Ex: Prova Bimestral 1"
              />
            </div>

            <div className="border-t border-slate-200 pt-4">
                <h3 className="text-slate-500 font-bold mb-3 uppercase text-xs tracking-wider">Dados do Cabeçalho Impresso</h3>
                
                <div className="mb-6 flex flex-col items-center p-4 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50">
                    <span className="text-sm font-bold text-slate-700 mb-2">Logotipo da Escola</span>
                    {currentExam.header.logoUrl ? (
                        <div className="relative group">
                            <img src={currentExam.header.logoUrl} alt="Logo" className="h-24 object-contain mb-2 border bg-white p-1" />
                            <button 
                                onClick={() => onUpdateExam({...currentExam, header: {...currentExam.header, logoUrl: undefined}})}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ) : (
                        <div className="w-full text-center">
                           <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-2 text-slate-400">
                              <ImageIcon size={24} />
                           </div>
                           <p className="text-xs text-slate-500 mb-3">Nenhum logo selecionado</p>
                        </div>
                    )}
                    <button 
                        onClick={() => logoInputRef.current?.click()}
                        className="text-sm bg-white border border-slate-300 text-slate-700 font-medium py-2 px-4 rounded hover:bg-slate-100 transition-colors flex items-center gap-2"
                    >
                        <Upload size={16} /> {currentExam.header.logoUrl ? 'Alterar Logo' : 'Enviar Logo'}
                    </button>
                </div>

                <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Escola (Texto)</label>
                <input
                    type="text"
                    value={currentExam.header.schoolName}
                    onChange={(e) => handleHeaderChange('schoolName', e.target.value)}
                    className="w-full rounded-lg border-slate-300 shadow-sm focus:border-accent p-2 border"
                    placeholder="Caso não use logo, aparecerá este nome"
                />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Professor(a)</label>
                    <input
                    type="text"
                    value={currentExam.header.teacherName}
                    onChange={(e) => handleHeaderChange('teacherName', e.target.value)}
                    className="w-full rounded-lg border-slate-300 shadow-sm focus:border-accent p-2 border"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Disciplina</label>
                    <input
                    type="text"
                    value={currentExam.header.subject}
                    onChange={(e) => handleHeaderChange('subject', e.target.value)}
                    className="w-full rounded-lg border-slate-300 shadow-sm focus:border-accent p-2 border"
                    />
                </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Turma/Série</label>
                    <input
                    type="text"
                    value={currentExam.header.grade}
                    onChange={(e) => handleHeaderChange('grade', e.target.value)}
                    className="w-full rounded-lg border-slate-300 shadow-sm focus:border-accent p-2 border"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
                    <input
                    type="date"
                    value={currentExam.header.date}
                    onChange={(e) => handleHeaderChange('date', e.target.value)}
                    className="w-full rounded-lg border-slate-300 shadow-sm focus:border-accent p-2 border"
                    />
                </div>
                </div>
                <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Instruções Gerais</label>
                <textarea
                    value={currentExam.header.instructions}
                    onChange={(e) => handleHeaderChange('instructions', e.target.value)}
                    rows={4}
                    className="w-full rounded-lg border-slate-300 shadow-sm focus:border-accent p-2 border"
                />
                </div>
            </div>
          </div>
        )}

        {activeTab === 'questions' && (
          <div className="space-y-6 max-w-3xl mx-auto">
            {currentExam.questions.map((q, idx) => (
              <div key={q.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative group transition-all hover:shadow-md">
                <div className="absolute top-4 right-4 flex gap-2">
                    <button
                        onClick={() => removeQuestion(q.id)}
                        className="text-slate-300 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                        title="Remover questão"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-slate-900 text-white font-bold px-3 py-1 rounded text-sm">
                    #{idx + 1}
                  </span>
                  
                  <input
                    type="number"
                    step="0.1"
                    value={q.points}
                    onChange={(e) => updateQuestion(q.id, { points: parseFloat(e.target.value) })}
                    className="w-20 text-sm border-slate-200 rounded-lg p-1 text-right focus:border-accent focus:ring-accent"
                    placeholder="pts"
                  />
                  <span className="text-xs text-slate-400">pontos</span>
                </div>

                <div className="mb-4">
                  <textarea
                    value={q.text}
                    onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-accent focus:border-accent min-h-[80px]"
                    placeholder="Digite o enunciado da questão..."
                  />
                </div>

                {/* Image Section */}
                <div className="mb-4">
                    {q.imageUrl ? (
                        <div className="relative inline-block border rounded-lg overflow-hidden group/img">
                            <img src={q.imageUrl} alt="Questão" className="max-h-60 object-contain bg-slate-100" />
                            <button 
                                onClick={() => updateQuestion(q.id, { imageUrl: undefined })}
                                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={() => triggerImageUpload(q.id)}
                            className="text-sm flex items-center gap-2 text-accent hover:text-blue-700 font-medium py-2 px-3 rounded hover:bg-blue-50 transition-colors"
                        >
                            <ImageIcon size={16} /> Adicionar Imagem/Gráfico
                        </button>
                    )}
                </div>

                <div className="space-y-3 pl-4 border-l-4 border-slate-100">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Alternativas</label>
                    </div>
                    
                    {q.options.map((opt, optIdx) => {
                        const letter = String.fromCharCode(65 + optIdx);
                        const isCorrect = q.correctAnswer === letter;
                        return (
                            <div key={optIdx} className="flex items-center gap-3">
                                <button
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                                        isCorrect
                                        ? 'bg-green-500 text-white border-green-500 shadow-md shadow-green-200'
                                        : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                                    }`}
                                    onClick={() => updateQuestion(q.id, { correctAnswer: letter })}
                                    title="Marcar como correta"
                                >
                                    {letter}
                                </button>
                                <input
                                    type="text"
                                    value={opt}
                                    onChange={(e) => handleOptionChange(q.id, optIdx, e.target.value)}
                                    className={`flex-1 p-2 text-sm border rounded-md focus:ring-0 ${isCorrect ? 'border-green-300 bg-green-50/30 text-green-900 font-medium' : 'border-slate-200 focus:border-accent'}`}
                                    placeholder={`Opção ${letter}`}
                                />
                                <button 
                                    onClick={() => removeOption(q.id, optIdx)}
                                    className="text-slate-300 hover:text-red-400 p-1"
                                    disabled={q.options.length <= 1}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )
                    })}
                    
                    <button 
                        onClick={() => addOption(q.id)}
                        className="mt-2 text-xs font-bold text-accent hover:text-blue-700 flex items-center gap-1 py-1 px-2 rounded hover:bg-blue-50 w-fit"
                    >
                        <Plus size={14} /> Adicionar Alternativa
                    </button>
                </div>
              </div>
            ))}

            <button
              onClick={addQuestion}
              className="w-full py-6 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-bold hover:border-accent hover:text-accent hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={24} /> Adicionar Nova Questão
            </button>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-200 bg-white rounded-b-xl flex justify-between gap-3">
         <div className="text-sm text-slate-500 flex items-center px-2">
            {currentExam.questions.length} questões • Total: {currentExam.questions.reduce((a, b) => a + b.points, 0)} pts
         </div>
        <button 
          onClick={onSave}
          className="bg-accent hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all"
        >
          <Save size={18} /> Salvar no Banco de Dados
        </button>
      </div>
    </div>
  );
};