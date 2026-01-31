import React, { useState, useEffect } from 'react';
import { PenTool, Eye, Database, Plus, Camera } from 'lucide-react';
import { Exam } from './types';
import { getExams, saveExam } from './services/storageService';
import { ExamBuilder } from './components/ExamBuilder';
import { ExamPreview } from './components/ExamPreview';
import { Grader } from './components/Grader';

const App = () => {
  const [view, setView] = useState<'list' | 'edit' | 'preview' | 'grader'>('list');
  const [exams, setExams] = useState<Exam[]>([]);
  const [currentExam, setCurrentExam] = useState<Exam | null>(null);

  // Load initial data
  useEffect(() => {
    setExams(getExams());
  }, []);

  const handleCreate = () => {
    const newExam: Exam = {
      id: Date.now().toString(),
      title: 'Nova Prova',
      createdAt: Date.now(),
      header: {
        schoolName: '',
        teacherName: '',
        subject: '',
        grade: '',
        date: new Date().toISOString().split('T')[0],
        instructions: ''
      },
      questions: []
    };
    setCurrentExam(newExam);
    setView('edit');
  };

  const handleSave = () => {
    if (currentExam) {
      saveExam(currentExam);
      setExams(getExams());
      alert('Prova salva com sucesso!');
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex-shrink-0 flex flex-col print:hidden z-20 shadow-xl">
        <div className="p-6 border-b border-slate-800">
           <h1 className="text-xl font-bold flex items-center gap-2">
             <PenTool className="text-brand-600" /> ProfCorrector
           </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
           <button onClick={() => setView('list')} className={`w-full text-left px-4 py-3 rounded flex items-center gap-3 ${view === 'list' ? 'bg-brand-600' : 'hover:bg-slate-800'}`}>
              <Database size={18} /> Minhas Provas
           </button>
           <button onClick={() => setView('grader')} className={`w-full text-left px-4 py-3 rounded flex items-center gap-3 ${view === 'grader' ? 'bg-brand-600' : 'hover:bg-slate-800'}`}>
              <Camera size={18} /> Corretor IA
           </button>
           
           {currentExam && (
             <div className="mt-8 pt-4 border-t border-slate-700">
                <p className="text-xs text-slate-500 uppercase font-bold mb-2 px-4">Editando Agora</p>
                <div className="px-4 mb-3 truncate font-medium text-slate-300">{currentExam.title}</div>
                <button onClick={() => setView('edit')} className={`w-full text-left px-4 py-2 rounded text-sm flex items-center gap-2 ${view === 'edit' ? 'text-brand-400 bg-slate-800' : 'text-slate-400'}`}>
                    Editar Questões
                </button>
                <button onClick={() => setView('preview')} className={`w-full text-left px-4 py-2 rounded text-sm flex items-center gap-2 ${view === 'preview' ? 'text-brand-400 bg-slate-800' : 'text-slate-400'}`}>
                    Imprimir / Visualizar
                </button>
             </div>
           )}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative w-full h-full">
         {view === 'list' && (
           <div className="p-8 h-full overflow-y-auto">
              <div className="flex justify-between items-center mb-8">
                 <h2 className="text-2xl font-bold text-gray-800">Banco de Provas</h2>
                 <button onClick={handleCreate} className="bg-brand-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-brand-700 shadow-lg">
                    <Plus size={20} /> Criar Nova
                 </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {exams.map(e => (
                   <div key={e.id} onClick={() => { setCurrentExam(e); setView('edit'); }} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-brand-300 cursor-pointer transition-all hover:shadow-md">
                      <h3 className="font-bold text-lg text-gray-800 mb-2">{e.title}</h3>
                      <div className="text-sm text-gray-500 space-y-1">
                        <p>{e.header.schoolName || 'Sem escola definida'}</p>
                        <p>{e.questions.length} questões</p>
                        <p className="text-xs mt-4 pt-2 border-t text-gray-400">Criado em: {new Date(e.createdAt).toLocaleDateString()}</p>
                      </div>
                   </div>
                 ))}
                 {exams.length === 0 && (
                   <div className="col-span-full text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-300">
                      <p className="text-gray-400 mb-4">Você ainda não criou nenhuma prova.</p>
                      <button onClick={handleCreate} className="text-brand-600 font-bold hover:underline">Começar Agora</button>
                   </div>
                 )}
              </div>
           </div>
         )}

         {view === 'edit' && currentExam && (
            <ExamBuilder exam={currentExam} setExam={setCurrentExam} onSave={handleSave} />
         )}

         {view === 'preview' && currentExam && (
            <ExamPreview exam={currentExam} onBack={() => setView('edit')} />
         )}

         {view === 'grader' && (
            <Grader exams={exams} />
         )}
      </main>
    </div>
  );
};

export default App;