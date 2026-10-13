import React from 'react';
import { EvaluationTableSettings } from '../types/exam';
import { Table, MessageSquare, CheckSquare } from 'lucide-react';

interface EvaluationTableEditorProps {
  settings: EvaluationTableSettings;
  onChange: (updated: EvaluationTableSettings) => void;
  questionCount: number;
}

export const EvaluationTableEditor: React.FC<EvaluationTableEditorProps> = ({
  settings,
  onChange,
  questionCount
}) => {
  const handleFieldChange = (field: keyof EvaluationTableSettings, value: any) => {
    onChange({
      ...settings,
      [field]: value
    });
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
          <Table className="w-4 h-4 text-indigo-600" />
          <span>Öğrenci Puan & Değerlendirme Tablosu</span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => handleFieldChange('enabled', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
        </label>
      </div>

      <p className="text-xs text-slate-500">
        Sınavın alt kısmında her soru için öğretmenin verdiği puanları kutucuklar içinde gösteren resmî puanlama matrisi oluşturur.
      </p>

      {settings.enabled && (
        <div className="space-y-3 pt-2 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <span className="font-medium text-slate-700 block">Tablo Önizlemesi</span>
            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse border border-slate-300 bg-white text-[11px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-semibold">
                    <th className="border border-slate-300 px-2 py-1">Soru</th>
                    {Array.from({ length: Math.min(questionCount, 10) }).map((_, i) => (
                      <th key={i} className="border border-slate-300 px-2 py-1">
                        S{i + 1}
                      </th>
                    ))}
                    {questionCount > 10 && <th className="border border-slate-300 px-2 py-1">...</th>}
                    <th className="border border-slate-300 px-2 py-1 bg-indigo-50 text-indigo-900">TOPLAM</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-300 px-2 py-1 font-medium bg-slate-50">Alınan Puan</td>
                    {Array.from({ length: Math.min(questionCount, 10) }).map((_, i) => (
                      <td key={i} className="border border-slate-300 px-2 py-1 text-slate-300">
                        ...
                      </td>
                    ))}
                    {questionCount > 10 && <td className="border border-slate-300 px-2 py-1 text-slate-300">...</td>}
                    <td className="border border-slate-300 px-2 py-1 font-bold text-slate-400">/ 100</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Öğretmen Yorumu & Notu Kutusu */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              <div>
                <span className="font-medium text-slate-700 block">Öğretmen Görüşü / Yorum Alanı</span>
                <span className="text-[11px] text-slate-400">Tablonun yanında öğretmenin el yazısıyla geribildirim yazabileceği kutu</span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showCommentBox}
                onChange={(e) => handleFieldChange('showCommentBox', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {settings.showCommentBox && (
            <div>
              <label className="block text-slate-600 font-medium mb-1">Yorum Kutusu Başlığı</label>
              <input
                type="text"
                value={settings.commentBoxLabel}
                onChange={(e) => handleFieldChange('commentBoxLabel', e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-800"
                placeholder="Öğretmen Değerlendirme & Gelişim Notu:"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
