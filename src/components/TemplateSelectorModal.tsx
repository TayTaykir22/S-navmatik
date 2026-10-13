import React from 'react';
import { PRESET_EXAMS } from '../data/presetExams';
import { ExamData } from '../types/exam';
import { X, FileText, CheckCircle2, Copy } from 'lucide-react';

interface TemplateSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: ExamData) => void;
}

export const TemplateSelectorModal: React.FC<TemplateSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-base">Hazır Sınav Şablonları</h2>
              <p className="text-xs text-slate-500">
                Önceden MEB formatına uygun tasarlanmış hazır sınavı seçip düzenleyin
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

        <div className="p-4 overflow-y-auto space-y-3">
          {PRESET_EXAMS.map((tpl) => (
            <div
              key={tpl.id}
              onClick={() => {
                onSelectTemplate(tpl);
                onClose();
              }}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 cursor-pointer transition-all flex items-start gap-3 group"
            >
              <div className="p-2.5 rounded-lg bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white text-slate-600 transition-colors mt-0.5">
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 text-sm group-hover:text-indigo-900">
                    {tpl.title}
                  </h3>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                    {tpl.questions.length} Soru
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>{tpl.header.schoolName}</span>
                  <span>•</span>
                  <span>{tpl.header.courseName}</span>
                  <span>•</span>
                  <span className="text-indigo-600 font-medium">
                    {tpl.layout.layoutMode === 'two-column'
                      ? 'Çift Sütun A4'
                      : tpl.layout.layoutMode === 'two-exams-a4'
                      ? 'A4 İkiye Böl (2 Kopya)'
                      : 'Tek Sütun'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
