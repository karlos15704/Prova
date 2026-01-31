import React from 'react';
import { Exam, QuestionType } from '../types';
import { Printer, ArrowLeft } from 'lucide-react';

interface ExamPreviewProps {
  exam: Exam;
  onBack: () => void;
  showAnswerKey?: boolean;
}

export const ExamPreview: React.FC<ExamPreviewProps> = ({ exam, onBack, showAnswerKey = false }) => {
  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '___/___/_____';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  };

  const renderAnswerSheet = () => (
    <div className="max-w-[210mm] mx-auto bg-white shadow-xl print:shadow-none p-[1.5cm] min-h-[297mm] break-before-page print:w-full print:max-w-none print:m-0 print:h-auto mt-8 print:mt-0 font-serif">
        <div className="border-2 border-black p-6 rounded-lg">
            <h2 className="text-center font-black text-2xl uppercase mb-6 tracking-widest border-b-2 border-black pb-4 text-black">
                Folha de Respostas
            </h2>
            
            {/* Student ID Block */}
            <div className="grid grid-cols-1 gap-4 mb-8 text-black">
                <div className="border border-black rounded p-2">
                    <p className="text-xs uppercase font-bold mb-1">Nome do Aluno</p>
                    <div className="h-8 border-b border-black"></div>
                </div>
                <div className="flex gap-4">
                     <div className="border border-black rounded p-2 flex-1">
                        <p className="text-xs uppercase font-bold mb-1">Turma</p>
                        <div className="h-8 border-b border-black"></div>
                    </div>
                    <div className="border border-black rounded p-2 flex-1">
                        <p className="text-xs uppercase font-bold mb-1">Data</p>
                        <div className="h-8 border-b border-black"></div>
                    </div>
                </div>
            </div>

            <div className="text-center text-sm font-medium mb-6 bg-slate-100 p-2 rounded text-black border border-slate-300">
                Preencha completamente a bolinha correspondente à sua resposta. <br/>
                Exemplo: <span className="inline-block w-3 h-3 rounded-full bg-black mx-1 align-middle"></span>
            </div>

            {/* Bubbles Grid */}
            <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-black">
                {exam.questions.map((q, idx) => (
                    <div key={q.id} className="flex items-center justify-between border-b border-dashed border-gray-300 py-2">
                        <span className="font-bold w-8 text-right mr-4 text-lg">{idx + 1}.</span>
                        <div className="flex gap-4 flex-1 justify-end">
                            {q.options.map((_, optIdx) => {
                                const letter = String.fromCharCode(65 + optIdx);
                                return (
                                    <div key={optIdx} className="flex flex-col items-center gap-1 group">
                                        <div className="w-5 h-5 rounded-full border-2 border-black flex items-center justify-center text-[10px] font-bold hover:bg-black hover:text-white cursor-pointer transition-colors">
                                           {letter}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 text-center text-xs text-gray-500">
                Sistema ProfCorrector - Leitura Óptica
            </div>
        </div>
    </div>
  );

  return (
    <div className="bg-slate-100 min-h-screen pb-10 print:bg-white print:p-0 print:min-h-0">
      {/* Action Bar (Hidden when printing) */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center mb-8 print:hidden sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h2 className="font-semibold text-slate-800 text-lg">
            {showAnswerKey ? 'Gabarito Oficial' : 'Visualização da Prova'}
          </h2>
        </div>
        <button
          onClick={handlePrint}
          className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <Printer size={16} /> Imprimir (Prova + Gabarito)
        </button>
      </div>

      {/* A4 Page Representation - Question Sheet */}
      <div className="max-w-[210mm] mx-auto bg-white shadow-xl print:shadow-none p-[1.5cm] min-h-[297mm] print:w-full print:max-w-none print:m-0 print:h-auto font-serif">
        
        {/* Professional Exam Header */}
        <div className="border-2 border-black mb-8 text-black">
          {/* Top Section: Logo & School Name */}
          <div className="flex items-center p-4 border-b-2 border-black">
            <div className="flex-shrink-0 mr-6 h-28 w-48 flex items-center justify-center bg-white border border-black p-1 overflow-hidden">
                {exam.header.logoUrl ? (
                    <img src={exam.header.logoUrl} alt="Logo Escola" className="max-h-full max-w-full object-contain" />
                ) : (
                    <div className="text-center leading-tight">
                        <span className="block text-2xl font-bold">LOGO</span>
                        <span className="text-[10px] uppercase">da Escola</span>
                    </div>
                )}
            </div>
            <div className="flex-1 text-center self-center">
              <h1 className="text-3xl font-black uppercase tracking-wide leading-tight">{exam.header.schoolName || "NOME DA ESCOLA"}</h1>
            </div>
          </div>

          {/* Grid Section: Student & Exam Details */}
          <div className="text-sm font-medium leading-normal">
             {/* Row 1: Nome, Classe, Valor */}
             <div className="flex border-b border-black h-10">
                <div className="flex-grow p-1 pl-2 border-r border-black flex items-end overflow-hidden">
                   <span className="font-bold mr-2 mb-1">Nome:</span>
                   <div className="flex-1 mb-2 border-b-2 border-dotted border-black"></div>
                </div>
                <div className="w-32 p-1 pl-2 border-r border-black flex items-end">
                   <span className="font-bold mr-2 mb-1">Classe:</span>
                   <span className="mb-1">{exam.header.grade}</span>
                </div>
                <div className="w-24 p-1 pl-2 flex items-end">
                   <span className="font-bold mr-2 mb-1">Valor:</span>
                   <div className="flex-1 mb-2 border-b-2 border-dotted border-black"></div>
                </div>
             </div>

             {/* Row 2: Disciplina, Prof, Data, Nota */}
             <div className="flex border-b border-black h-10">
                <div className="flex-grow p-1 pl-2 border-r border-black flex items-end overflow-hidden">
                   <span className="font-bold mr-2 mb-1">Disciplina:</span>
                   <span className="mb-1 truncate">{exam.header.subject}</span>
                </div>
                <div className="flex-grow p-1 pl-2 border-r border-black flex items-end overflow-hidden">
                   <span className="font-bold mr-2 mb-1">Prof:</span>
                   <span className="mb-1 truncate">{exam.header.teacherName}</span>
                </div>
                <div className="w-36 p-1 pl-2 border-r border-black flex items-end">
                   <span className="font-bold mr-2 mb-1">Data:</span>
                   <span className="mb-1">{formatDate(exam.header.date)}</span>
                </div>
                <div className="w-24 p-1 pl-2 flex items-end">
                   <span className="font-bold mr-2 mb-1">Nota:</span>
                   <div className="flex-1 mb-2 border-b-2 border-dotted border-black"></div>
                </div>
             </div>
          </div>

          {/* Bottom Section: Instructions & Signature */}
          <div className="flex min-h-[140px]">
             <div className="flex-grow p-2 border-r border-black">
                <span className="font-bold underline mb-1 block">Instruções:</span>
                <div className="text-xs leading-relaxed whitespace-pre-line pl-2">
                   {exam.header.instructions ? exam.header.instructions : (
                      <ul className="list-disc pl-4 space-y-1">
                         <li>Faça letra legível;</li>
                         <li>Mantenha a limpeza e a organização da prova;</li>
                         <li>Evite rasuras e não deixe questões em branco.</li>
                      </ul>
                   )}
                </div>
             </div>
             <div className="w-48 flex flex-col">
                <div className="flex-1 border-b border-black p-2 flex flex-col justify-end pb-4">
                   <span className="font-bold text-xs block mb-1">Ass. do professor:</span>
                   <div className="w-full border-b border-black"></div>
                </div>
                <div className="h-10 flex items-center justify-center font-bold text-xl tracking-widest bg-gray-50 uppercase border-t-0">
                   PROVA
                </div>
             </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-8 text-black">
            {showAnswerKey && (
                <div className="bg-slate-100 border-2 border-black text-black p-4 rounded mb-6 text-center font-bold uppercase">
                    Gabarito do Professor
                </div>
            )}

            {exam.questions.map((q, idx) => (
                <div key={q.id} className={`break-inside-avoid ${showAnswerKey ? 'bg-slate-50 p-4 rounded border border-black' : ''}`}>
                    <div className="flex gap-3 mb-2">
                        <span className="font-bold text-lg">{idx + 1}.</span>
                        <div className="flex-1">
                            {q.imageUrl && (
                                <div className="mb-4">
                                    <img src={q.imageUrl} alt={`Imagem Questão ${idx + 1}`} className="max-w-full max-h-80 object-contain border border-gray-300" />
                                </div>
                            )}

                            <p className="mb-4 whitespace-pre-line leading-relaxed text-justify">{q.text}</p>
                            
                            <div className="space-y-1 ml-0">
                                {q.options.map((opt, optIdx) => {
                                    const letter = String.fromCharCode(65 + optIdx);
                                    const isCorrect = showAnswerKey && q.correctAnswer === letter;
                                    
                                    return (
                                        <div key={optIdx} className={`flex items-start gap-3 text-sm group pl-1 ${isCorrect ? 'font-bold' : ''}`}>
                                            <span className={`font-bold lowercase`}>{letter})</span>
                                            <span className={`mt-0 ${isCorrect ? 'underline decoration-2' : ''}`}>{opt}</span>
                                            {isCorrect && showAnswerKey && <span className="ml-2 text-[10px] font-bold uppercase bg-black text-white px-1 rounded print:border print:border-black print:text-black print:bg-transparent">Correta</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="text-xs font-bold text-gray-400 w-10 text-right print:hidden">
                            {q.points} pt
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Render Answer Sheet if strictly just previewing or printing */}
      {!showAnswerKey && renderAnswerSheet()}
    </div>
  );
};