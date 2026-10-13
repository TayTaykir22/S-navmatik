import React, { useState } from 'react';
import { Question } from '../types/exam';
import { QUESTION_BANK, SUBJECT_OPTIONS, BankQuestionItem } from '../data/questionBank';
import { X, Sparkles, Plus, Check, Filter } from 'lucide-react';

interface RandomQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddQuestions: (newQuestions: Question[]) => void;
  currentCount: number;
}

export const RandomQuestionModal: React.FC<RandomQuestionModalProps> = ({
  isOpen,
  onClose,
  onAddQuestions,
  currentCount
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('Tümü');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('Tümü');
  const [randomCount, setRandomCount] = useState<number>(2);
  const [selectedBankIds, setSelectedBankIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const filteredBank = QUESTION_BANK.filter((item) => {
    const matchesSubject = selectedSubject === 'Tümü' || item.subject === selectedSubject;
    const matchesDiff = selectedDifficulty === 'Tümü' || item.difficulty === selectedDifficulty;
    return matchesSubject && matchesDiff;
  });

  const handleAddRandom = () => {
    if (filteredBank.length === 0) return;

    // Shuffle and pick
    const shuffled = [...filteredBank].sort(() => 0.5 - Math.random());
    const picked = shuffled.slice(0, Math.min(randomCount, shuffled.length));

    const converted: Question[] = picked.map((item, idx) => ({
      id: `q-rand-${Date.now()}-${idx}`,
      number: currentCount + idx + 1,
      text: item.text,
      points: item.points,
      subject: item.subject,
      image: item.image,
      answerSpace: {
        type: item.answerType,
        lineCount: item.lineCount,
        showBorder: true,
        boxHeightPx: Math.max(70, item.lineCount * 20),
        hintText: 'Çözüm Alanı:'
      },
      solutionNotes: item.solutionNotes
    }));

    onAddQuestions(converted);
    onClose();
  };

  const toggleSelectBankItem = (id: string) => {
    if (selectedBankIds.includes(id)) {
      setSelectedBankIds(selectedBankIds.filter((item) => item !== id));
    } else {
      setSelectedBankIds([...selectedBankIds, id]);
    }
  };

  const handleAddSelected = () => {
    const picked = QUESTION_BANK.filter((item) => selectedBankIds.includes(item.id));
    if (picked.length === 0) return;

    const converted: Question[] = picked.map((item, idx) => ({
      id: `q-bank-${Date.now()}-${idx}`,
      number: currentCount + idx + 1,
      text: item.text,
      points: item.points,
      subject: item.subject,
      image: item.image,
      answerSpace: {
        type: item.answerType,
        lineCount: item.lineCount,
        showBorder: true,
        boxHeightPx: Math.max(70, item.lineCount * 20),
        hintText: 'Çözüm Alanı:'
      },
      solutionNotes: item.solutionNotes
    }));

    onAddQuestions(converted);
    setSelectedBankIds([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden">
        {/* Modal Başlığı */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-base">Soru Bankasından Soru Ekle</h2>
              <p className="text-xs text-slate-500">
                Branş seçip tek tıkla rastgele sorular çekin veya listeden seçin
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filtreler & Hızlı Rastgele Çekme Kutusu */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/40 space-y-3">
          <div className="grid grid-cols-3 gap-2.5 text-xs">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Ders / Branş</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800 font-medium"
              >
                {SUBJECT_OPTIONS.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Zorluk Derecesi</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800"
              >
                <option value="Tümü">Tüm Seviyeler</option>
                <option value="Kolay">Kolay</option>
                <option value="Orta">Orta</option>
                <option value="Zor">Zor</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Rastgele Adet</label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setRandomCount(num)}
                    className={`flex-1 py-1 rounded-lg border text-xs font-semibold ${
                      randomCount === num
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-500">
              Bu kriterde <strong className="text-slate-800">{filteredBank.length}</strong> adet klasik soru bulundu
            </span>

            <button
              type="button"
              onClick={handleAddRandom}
              disabled={filteredBank.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {randomCount} Adet Rastgele Soru Ekle
            </button>
          </div>
        </div>

        {/* Soru Listesi (Tek Tek Seçebilme) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          <div className="text-xs font-semibold text-slate-600 flex items-center justify-between pb-1">
            <span>veya Listeden İstediğiniz Soruları Seçin:</span>
            {selectedBankIds.length > 0 && (
              <span className="text-indigo-600">{selectedBankIds.length} soru seçildi</span>
            )}
          </div>

          {filteredBank.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              Seçilen kriterlere uygun soru bulunamadı. Lütfen filtreleri değiştirin.
            </div>
          ) : (
            filteredBank.map((item) => {
              const isSelected = selectedBankIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleSelectBankItem(item.id)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-50/70 border-indigo-500 shadow-2xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="font-bold text-slate-800">{item.subject}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500">{item.category}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium">
                        {item.difficulty}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                        {item.points} Puan
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-700 leading-relaxed pl-5 line-clamp-2">{item.text}</p>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Alt Kısmı */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Vazgeç
          </button>

          <button
            type="button"
            onClick={handleAddSelected}
            disabled={selectedBankIds.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Seçilenleri Sınava Ekle ({selectedBankIds.length})
          </button>
        </div>
      </div>
    </div>
  );
};
