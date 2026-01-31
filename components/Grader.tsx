import React, { useState } from 'react';
import { Exam, GradingResult } from '../types';
import { Camera, Upload, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { gradeExamImage } from '../services/geminiService';

interface Props {
  exams: Exam[];
}

export const Grader: React.FC<Props> = ({ exams }) => {
  const [selectedExamId, setSelectedExamId] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GradingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedExam = exams.find(e => e.id === selectedExamId);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => setImage(ev.target?.result as string);
      reader.readAsDataURL(e.target.files[0]);
      setResult(null);
      setError(null);
    }
  };

  const processImage = async () => {
    if (!image || !selectedExam) return;
    setLoading(true);
    setError(null);
    
    try {
      const base64 = image.split(',')[1];
      const res = await gradeExamImage(selectedExam, base64);
      setResult(res);
    } catch (err: any) {
      setError(err.message || "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto h-full overflow-y-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Camera className="text-brand-600" /> Corretor Automático
      </h2>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <label className="block text-sm font-bold text-gray-700 mb-2">Selecione o Gabarito (Prova)</label>
            <select 
              className="w-full p-2 border rounded-md mb-4"
              value={selectedExamId}
              onChange={e => { setSelectedExamId(e.target.value); setResult(null); }}
            >
              <option value="">-- Selecione uma prova --</option>
              {exams.map(e => (
                <option key={e.id} value={e.id}>{e.title}</option>
              ))}
            </select>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 hover:bg-white transition-colors relative">
               {image ? (
                 <img src={image} className="max-h-64 mx-auto object-contain" />
               ) : (
                 <div className="py-8">
                    <Upload className="mx-auto text-gray-400 mb-2" size={48} />
                    <p className="text-gray-500 font-medium">Clique para enviar foto do gabarito</p>
                    <p className="text-xs text-gray-400">Formatos: JPG, PNG</p>
                 </div>
               )}
               <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleFile} />
            </div>

            <button
              onClick={processImage}
              disabled={!image || !selectedExamId || loading}
              className={`w-full mt-4 py-3 rounded-lg font-bold flex items-center justify-center gap-2 text-white ${!image || !selectedExamId ? 'bg-gray-300' : 'bg-brand-600 hover:bg-brand-700'}`}
            >
              {loading ? <Loader2 className="animate-spin" /> : <RefreshCw />}
              {loading ? 'Corrigindo...' : 'Corrigir Agora'}
            </button>
            {error && <p className="mt-2 text-red-500 text-sm text-center">{error}</p>}
          </div>
        </div>

        <div>
          {result ? (
            <div className="bg-white p-6 rounded-lg shadow-lg border border-brand-100 animate-in fade-in slide-in-from-bottom-4">
               <div className="text-center mb-6 border-b pb-4">
                  <p className="text-sm text-gray-500 uppercase tracking-wide">Resultado da Correção</p>
                  <h3 className="text-2xl font-black text-gray-800">{result.studentName}</h3>
                  <div className="mt-2 inline-block bg-brand-50 px-4 py-1 rounded-full text-brand-700 font-bold text-xl">
                    Nota: {result.totalScore} <span className="text-sm font-normal">/ {result.maxScore}</span>
                  </div>
               </div>

               <div className="grid grid-cols-4 gap-2">
                  {result.matches.map((m) => (
                    <div key={m.questionIndex} className={`p-2 rounded border text-center ${m.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                       <div className="text-xs text-gray-500 font-bold">Q{m.questionIndex}</div>
                       <div className={`font-black text-lg ${m.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                         {m.studentLetter}
                       </div>
                       {!m.isCorrect && (
                         <div className="text-[10px] text-gray-400">Gab: {m.correctLetter}</div>
                       )}
                    </div>
                  ))}
               </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50">
               <p>O resultado aparecerá aqui</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};