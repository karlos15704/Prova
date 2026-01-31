import React, { useState, useRef } from 'react';
import { Loader2, CheckCircle, AlertCircle, FileCheck, Camera, ScanLine } from 'lucide-react';
import { Exam, GradingResult } from '../types';
import { gradeScantron } from '../services/geminiService';
import { getExamsFromStorage } from '../services/storageService';

export const Grader: React.FC = () => {
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGrading, setIsGrading] = useState(false);
  const [result, setResult] = useState<GradingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const savedExams = getExamsFromStorage();
  const selectedExam = savedExams.find(e => e.id === selectedExamId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setResult(null);
      setError(null);

      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreview(ev.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleGrade = async () => {
    if (!imagePreview || !selectedExam) return;

    setIsGrading(true);
    setError(null);
    setResult(null);

    try {
      const base64Data = imagePreview.split(',')[1];
      const gradingResult = await gradeScantron(selectedExam, base64Data);
      setResult(gradingResult);
    } catch (err) {
      setError("Não foi possível ler o gabarito. Verifique se a foto está focada e bem iluminada.");
      console.error(err);
    } finally {
      setIsGrading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col gap-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <ScanLine className="text-accent" /> Leitura Óptica de Gabarito
        </h2>

        {savedExams.length === 0 ? (
           <div className="text-center p-10 bg-slate-50 rounded-lg border border-dashed border-slate-300">
              <p className="text-slate-500">Nenhuma prova encontrada no banco de dados.</p>
              <p className="text-sm text-slate-400">Crie e salve uma prova primeiro.</p>
           </div>
        ) : (
            <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column: Input */}
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Selecione a Prova para Corrigir</label>
                    <select 
                        value={selectedExamId}
                        onChange={(e) => { setSelectedExamId(e.target.value); setResult(null); }}
                        className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-accent focus:border-accent shadow-sm"
                    >
                        <option value="">-- Selecione --</option>
                        {savedExams.map(exam => (
                            <option key={exam.id} value={exam.id}>
                                {exam.title} ({exam.questions.length} questões)
                            </option>
                        ))}
                    </select>
                </div>

                <div className={`transition-opacity ${!selectedExamId ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative ${
                            imagePreview ? 'border-accent bg-blue-50' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
                        }`}
                    >
                        {imagePreview ? (
                            <img src={imagePreview} alt="Preview" className="h-full w-full object-contain" />
                        ) : (
                            <div className="text-center p-4">
                            <div className="bg-white p-3 rounded-full shadow-sm inline-block mb-3">
                                <Camera className="w-8 h-8 text-accent" />
                            </div>
                            <p className="text-sm font-medium text-slate-700">Foto da Folha de Respostas</p>
                            </div>
                        )}
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            className="hidden" 
                            accept="image/*" 
                        />
                    </div>

                    <button
                        onClick={handleGrade}
                        disabled={!file || isGrading || !selectedExam}
                        className={`w-full mt-4 py-4 rounded-lg font-bold text-white flex items-center justify-center gap-2 shadow-lg transition-all ${
                            !file || isGrading || !selectedExam
                            ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                            : 'bg-slate-900 hover:bg-black shadow-slate-900/30'
                        }`}
                    >
                        {isGrading ? (
                            <>
                            <Loader2 className="animate-spin" /> Processando Imagem...
                            </>
                        ) : (
                            <>
                            <ScanLine /> Ler Gabarito
                            </>
                        )}
                    </button>
                    
                    {error && (
                    <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
                        <AlertCircle size={16} /> {error}
                    </div>
                    )}
                </div>
            </div>

            {/* Right Column: Results */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 min-h-[300px]">
                {!result && !isGrading && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center">
                    <ScanLine size={48} className="mb-4 opacity-20" />
                    <p>O sistema identificará as letras marcadas e calculará a nota.</p>
                    </div>
                )}
                
                {isGrading && (
                    <div className="h-full flex flex-col items-center justify-center space-y-4">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-accent rounded-full animate-spin"></div>
                    <p className="text-sm text-slate-500 animate-pulse">Lendo marcações ópticas...</p>
                    </div>
                )}

                {result && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-start border-b border-slate-200 pb-4 mb-4">
                    <div>
                        <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Aluno(a)</span>
                        <h3 className="text-xl font-bold text-slate-900">{result.studentName}</h3>
                    </div>
                    <div className="text-right">
                        <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Nota</span>
                        <div className={`text-4xl font-black ${result.totalScore >= result.maxScore * 0.6 ? 'text-green-600' : 'text-red-500'}`}>
                        {result.totalScore} <span className="text-lg text-slate-400 font-medium">/ {result.maxScore}</span>
                        </div>
                    </div>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-[400px] overflow-y-auto pr-2">
                    {result.matches.map((q) => (
                        <div key={q.questionId} className={`p-2 rounded border flex flex-col items-center justify-center text-center ${q.isCorrect ? 'bg-green-100 border-green-300 text-green-900' : 'bg-red-50 border-red-200 text-red-900'}`}>
                            <span className="text-xs font-bold text-slate-500 mb-1">#{q.questionNumber}</span>
                            <div className="font-mono text-lg font-black">{q.studentLetter}</div>
                            {!q.isCorrect && (
                                <div className="text-[10px] text-red-500 font-bold mt-1">Gab: {q.correctLetter}</div>
                            )}
                        </div>
                    ))}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-slate-200 text-xs text-slate-500 text-center">
                        Acertos: {result.matches.filter(m => m.isCorrect).length} de {result.matches.length}
                    </div>
                </div>
                )}
            </div>
            </div>
        )}
      </div>
    </div>
  );
};