import React from 'react';
import { Exam } from '../types';
import { Printer, ArrowLeft } from 'lucide-react';

interface Props {
  exam: Exam;
  onBack: () => void;
}

export const ExamPreview: React.FC<Props> = ({ exam, onBack }) => {
  return (
    <div className="h-full flex flex-col bg-gray-100">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center no-print shadow-sm z-10">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft size={20} /> Voltar
        </button>
        <div className="font-bold text-lg text-gray-800">Visualização de Impressão</div>
        <button onClick={() => window.print()} className="bg-gray-900 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-black">
          <Printer size={18} /> Imprimir Prova
        </button>
      </div>

      <div className="flex-1 overflow-auto p-8 md:p-12 print:p-0">
        {/* Folha A4 Simulada */}
        <div className="bg-white shadow-2xl mx-auto max-w-[210mm] min-h-[297mm] p-[10mm] print:shadow-none print:w-full print:max-w-none">
            
            {/* Cabeçalho da Escola */}
            <div className="border-2 border-black mb-6 text-black">
                <div className="text-center border-b-2 border-black p-4">
                    <h1 className="text-2xl font-black uppercase tracking-wider">{exam.header.schoolName || "ESCOLA MODELO"}</h1>
                </div>
                <div className="flex text-sm">
                    <div className="flex-1 border-r border-black p-2">
                        <div className="mb-1"><span className="font-bold">Aluno(a):</span> __________________________________________________</div>
                        <div className="flex justify-between">
                            <span><span className="font-bold">Prof:</span> {exam.header.teacherName}</span>
                            <span><span className="font-bold">Turma:</span> {exam.header.grade}</span>
                            <span><span className="font-bold">Data:</span> {new Date(exam.header.date).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div className="w-24 p-2 flex flex-col justify-center items-center font-bold">
                        <span>NOTA</span>
                        <div className="h-8 w-16 border border-black mt-1"></div>
                    </div>
                </div>
                <div className="border-t border-black p-2 text-xs">
                    <span className="font-bold">Instruções:</span> {exam.header.instructions || "Utilize caneta azul ou preta. Não rasure o gabarito."}
                </div>
            </div>

            {/* Questões */}
            <div className="space-y-6 text-black">
                {exam.questions.map((q, idx) => (
                    <div key={q.id} className="avoid-break">
                        <div className="flex gap-2">
                            <span className="font-bold text-lg">{idx + 1}.</span>
                            <div className="flex-1">
                                <p className="whitespace-pre-wrap mb-2 text-justify leading-relaxed">{q.text}</p>
                                {q.imageUrl && (
                                    <img src={q.imageUrl} className="max-h-48 my-2 border border-gray-300" />
                                )}
                                <div className="space-y-1 ml-2">
                                    {q.options.map((opt, oIdx) => (
                                        <div key={oIdx} className="flex gap-2 text-sm">
                                            <span className="font-bold">{String.fromCharCode(65 + oIdx)})</span>
                                            <span>{opt}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <span className="text-xs font-bold pt-1">({q.points} pts)</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Gabarito (Rodapé / OMR) */}
            <div className="mt-12 break-inside-avoid border-t-2 border-dashed border-gray-400 pt-8">
                <div className="border-2 border-black rounded-lg p-4 max-w-lg mx-auto">
                    <h3 className="text-center font-black uppercase mb-4 text-sm border-b border-black pb-2">Folha de Respostas (Gabarito)</h3>
                    
                    <div className="flex justify-between text-xs mb-4">
                        <div>Aluno: ___________________________________</div>
                        <div>Turma: _______</div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                        {exam.questions.map((q, idx) => (
                            <div key={q.id} className="flex items-center justify-between border-b border-gray-200 pb-1">
                                <span className="font-bold w-6 text-right mr-2">{idx + 1}.</span>
                                <div className="flex gap-3">
                                    {['A','B','C','D'].map((letter) => (
                                        <div key={letter} className="flex flex-col items-center">
                                            <div className="w-4 h-4 rounded-full border border-black flex items-center justify-center text-[8px] font-bold mb-1">
                                                {letter}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="text-[10px] text-center mt-4 text-gray-500">
                        Preencha completamente a bolinha da alternativa correta.
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};