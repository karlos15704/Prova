import React, { useState, useEffect } from 'react';
import { ExamBuilder } from './components/ExamBuilder';
import { ExamPreview } from './components/ExamPreview';
import { Grader } from './components/Grader';
import { Exam, QuestionType } from './types';
import { PenTool, Layout, FileCheck, Eye, Database, Trash2, PlusCircle, ScanLine } from 'lucide-react';
import { saveExamToStorage, getExamsFromStorage, deleteExamFromStorage } from './services/storageService';

// Safe ID generator compatible with all environments
const generateId = () => Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

// Empty template
const getNewExamTemplate = (): Exam => ({
  id: generateId(),
  title: 'Nova Prova',
  createdAt: Date.now(),
  header: {
    schoolName: '',
    teacherName: '',
    subject: '',
    grade: '',
    date: new Date().toISOString().split('T')[0],
    instructions: '',
    logoUrl: undefined,
  },
  questions: [],
});

const App: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [currentExam, setCurrentExam] = useState<Exam | null>(null);
  const [view, setView] = useState<'list' | 'edit' | 'preview' | 'grader'>('list');
  const [showAnswerKeyInPreview, setShowAnswerKeyInPreview] = useState(false);

  useEffect(() => {
    refreshExams();
  }, []);

  const refreshExams = () => {
    setExams(getExamsFromStorage());
  };

  const handleCreateNew = () => {
    const newExam = getNewExamTemplate();
    setCurrentExam(newExam);
    setView('edit');
  };

  const handleEdit = (exam: Exam) => {
    setCurrentExam(exam);
    setView('edit');
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja excluir esta prova?')) {
        deleteExamFromStorage(id);
        refreshExams();
        if (currentExam?.id === id) {
            setCurrentExam(null);
            setView('list');
        }
    }
  };

  const handleSave = () => {
    if (currentExam) {
        saveExamToStorage(currentExam);
        refreshExams();
        alert("Prova salva no banco de dados!");
        setView('list');
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 text-slate-900 font-sans overflow-hidden">
      
      {/* Sidebar - Navigation */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col print:hidden flex-shrink-0 z-20 shadow-xl">
        <div className="p-6 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2 text-white font-bold text-xl tracking-tight">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-900/50">
                <PenTool size={18} />
             </div>
             ProfCorrector
          </div>
          <p className="text-slate-500 text-xs mt-2 font-medium">Gestão de Provas & Gabaritos</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button
            onClick={() => setView('list')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${
              view === 'list' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Database size={18} /> Banco de Provas
          </button>
          
          <button
            onClick={handleCreateNew}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${
              view === 'edit' && !currentExam?.questions.length ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <PlusCircle size={18} /> Criar Nova Prova
          </button>

          {currentExam && (
            <div className="mt-6 pt-6 border-t border-slate-800">
                <div className="px-4 mb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Prova Atual</div>
                <div className="px-4 mb-4 text-sm font-bold text-white truncate opacity-80">{currentExam.title}</div>
                
                <button
                    onClick={() => setView('edit')}
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                    view === 'edit' ? 'text-blue-400 bg-blue-400/10' : 'text-slate-400 hover:text-white'
                    }`}
                >
                    <Layout size={16} /> Editar Questões
                </button>
                <button
                    onClick={() => { setView('preview'); setShowAnswerKeyInPreview(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                    view === 'preview' && !showAnswerKeyInPreview ? 'text-blue-400 bg-blue-400/10' : 'text-slate-400 hover:text-white'
                    }`}
                >
                    <Eye size={16} /> Imprimir Prova
                </button>
                <button
                    onClick={() => { setView('preview'); setShowAnswerKeyInPreview(true); }}
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                    view === 'preview' && showAnswerKeyInPreview ? 'text-blue-400 bg-blue-400/10' : 'text-slate-400 hover:text-white'
                    }`}
                >
                    <FileCheck size={16} /> Ver Gabarito
                </button>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-slate-800">
             <button
                onClick={() => setView('grader')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-bold ${
                view === 'grader' ? 'bg-teal-600 text-white shadow-lg' : 'text-teal-400 hover:bg-slate-800 hover:text-teal-300'
                }`}
            >
                <ScanLine size={18} /> Leitor de Gabarito
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative flex flex-col h-full w-full">
        {view === 'list' && (
             <div className="h-full overflow-hidden flex flex-col">
                <header className="h-20 bg-white border-b border-slate-200 flex items-center px-10 justify-between flex-shrink-0">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Banco de Provas</h1>
                        <p className="text-sm text-slate-500">Gerencie suas avaliações salvas</p>
                    </div>
                    <button onClick={handleCreateNew} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2">
                        <PlusCircle size={20} /> Nova Prova
                    </button>
                </header>
                <div className="flex-1 overflow-y-auto p-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {exams.length === 0 && (
                            <div className="col-span-full text-center py-20 text-slate-400 border-2 border-dashed border-slate-300 rounded-xl">
                                <Database size={48} className="mx-auto mb-4 opacity-30" />
                                <p className="text-lg">Nenhuma prova criada ainda.</p>
                            </div>
                        )}
                        {exams.map(exam => (
                            <div key={exam.id} 
                                onClick={() => handleEdit(exam)}
                                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group relative"
                            >
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={(e) => handleDelete(exam.id, e)}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <h3 className="font-bold text-lg text-slate-800 mb-2 pr-8">{exam.title}</h3>
                                <div className="space-y-1 text-sm text-slate-500 mb-4">
                                    <p>Disciplina: {exam.header.subject || 'Não definida'}</p>
                                    <p>Questões: {exam.questions.length}</p>
                                    <p>Data: {new Date(exam.createdAt).toLocaleDateString('pt-BR')}</p>
                                </div>
                                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                        Editar
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
             </div>
        )}

        {view === 'edit' && currentExam && (
           <div className="h-full overflow-hidden flex flex-col">
              <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 justify-between flex-shrink-0">
                 <h1 className="text-xl font-bold text-slate-800">Editor de Prova: {currentExam.title}</h1>
              </header>
              <div className="flex-1 overflow-hidden p-8">
                 <ExamBuilder 
                    currentExam={currentExam} 
                    onUpdateExam={setCurrentExam} 
                    onSave={handleSave}
                 />
              </div>
           </div>
        )}

        {view === 'preview' && currentExam && (
            <div className="h-full overflow-y-auto bg-slate-200/50">
               <ExamPreview 
                 exam={currentExam} 
                 onBack={() => setView('edit')} 
                 showAnswerKey={showAnswerKeyInPreview} 
               />
            </div>
        )}

        {view === 'grader' && (
            <div className="h-full overflow-hidden flex flex-col">
               <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 justify-between flex-shrink-0">
                 <h1 className="text-xl font-bold text-slate-800">Leitor Óptico de Gabaritos</h1>
              </header>
              <div className="flex-1 overflow-y-auto p-8">
                 <Grader />
              </div>
            </div>
        )}
      </main>

    </div>
  );
};

export default App;