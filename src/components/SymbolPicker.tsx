import React from 'react';

interface SymbolPickerProps {
  onInsertSymbol: (symbol: string) => void;
}

const COMMON_SYMBOLS = [
  { group: 'Matematik', symbols: ['√', '∛', 'π', '²', '³', '⁴', '₁', '₂', '±', '≤', '≥', '≠', '≈', '∞', '·', '×', '÷', '∫', '∑', 'Δ', 'log', 'lim'] },
  { group: 'Geometri & Açı', symbols: ['∡', '∠', '△', '⊥', '∥', '°', 'radian', '≅', '∼', '⌀'] },
  { group: 'Kümeler & Mantık', symbols: ['∈', '∉', '⊂', '⊃', '∪', '∩', '∅', '∀', '∃', '⇒', '⇔', '∧', '∨', '¬'] },
  { group: 'Yunan Harfleri', symbols: ['α', 'β', 'θ', 'λ', 'μ', 'ω', 'ρ', 'σ', 'φ', 'Ω'] }
];

export const SymbolPicker: React.FC<SymbolPickerProps> = ({ onInsertSymbol }) => {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs">
      <div className="text-[11px] font-semibold text-slate-600 mb-1.5 flex items-center justify-between">
        <span>Hızlı Sembol & Formül Ekle:</span>
        <span className="text-slate-400 font-normal">Tıkla ve soruya ekle</span>
      </div>
      <div className="space-y-1.5">
        {COMMON_SYMBOLS.map((cat) => (
          <div key={cat.group} className="flex flex-wrap items-center gap-1">
            <span className="text-[10px] text-slate-400 w-16 shrink-0">{cat.group}:</span>
            <div className="flex flex-wrap gap-1">
              {cat.symbols.map((sym) => (
                <button
                  key={sym}
                  type="button"
                  onClick={() => onInsertSymbol(sym)}
                  className="px-1.5 py-0.5 min-w-[22px] text-center bg-white hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 border border-slate-200 rounded text-slate-700 font-mono transition-colors shadow-2xs"
                  title={`${sym} sembolünü ekle`}
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
