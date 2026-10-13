import React from 'react';
import { TeacherSignatureSettings, TeacherSignature } from '../types/exam';
import { PenTool, Plus, Trash2, FileText, CheckCircle } from 'lucide-react';

interface SignaturesEditorProps {
  signatures: TeacherSignatureSettings;
  onChange: (updated: TeacherSignatureSettings) => void;
}

export const SignaturesEditor: React.FC<SignaturesEditorProps> = ({ signatures, onChange }) => {
  const handleFieldChange = (field: keyof TeacherSignatureSettings, value: any) => {
    onChange({
      ...signatures,
      [field]: value
    });
  };

  const addTeacher = () => {
    const updated = [
      ...signatures.teachers,
      { name: 'Öğretmen Adı Soyadı', title: 'Ders Öğretmeni' }
    ];
    handleFieldChange('teachers', updated);
  };

  const updateTeacher = (index: number, field: keyof TeacherSignature, value: string) => {
    const updated = signatures.teachers.map((t, i) =>
      i === index ? { ...t, [field]: value } : t
    );
    handleFieldChange('teachers', updated);
  };

  const removeTeacher = (index: number) => {
    const updated = signatures.teachers.filter((_, i) => i !== index);
    handleFieldChange('teachers', updated);
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
          <PenTool className="w-4 h-4 text-indigo-600" />
          <span>Sınav Sonu Yönerge & İmza Bölümü</span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={signatures.enabled}
            onChange={(e) => handleFieldChange('enabled', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
        </label>
      </div>

      {signatures.enabled && (
        <div className="space-y-3.5 text-xs">
          {/* Yönergeler */}
          <div>
            <label className="block text-slate-600 font-medium mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Sınav Yönergesi & Kurallar (Öğrenciye Not)
            </label>
            <textarea
              rows={2}
              value={signatures.instructionsText}
              onChange={(e) => handleFieldChange('instructionsText', e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500"
              placeholder="1. Sınav süresi 40 dakikadır. 2. Cevaplarınızı ayrılan kutucuklara yazınız. Başarılar dileriz."
            />
          </div>

          {/* Öğretmen İmzaları */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-700">Ders & Zümre Öğretmenleri</span>
              <button
                type="button"
                onClick={addTeacher}
                className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-medium text-[11px]"
              >
                <Plus className="w-3 h-3" /> Öğretmen Ekle
              </button>
            </div>

            {signatures.teachers.map((teacher, idx) => (
              <div key={idx} className="flex gap-2 items-center bg-slate-50 p-2 rounded-lg border border-slate-200">
                <input
                  type="text"
                  value={teacher.name}
                  onChange={(e) => updateTeacher(idx, 'name', e.target.value)}
                  className="flex-1 px-2 py-1 bg-white border border-slate-300 rounded text-slate-800"
                  placeholder="Öğretmen Adı Soyadı"
                />
                <input
                  type="text"
                  value={teacher.title}
                  onChange={(e) => updateTeacher(idx, 'title', e.target.value)}
                  className="w-36 px-2 py-1 bg-white border border-slate-300 rounded text-slate-800"
                  placeholder="Ünvan (Ders Öğretmeni)"
                />
                {signatures.teachers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTeacher(idx)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                    title="Öğretmeni kaldır"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Okul Müdürü Onayı */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-700">Okul Müdürü Tasdik / Onay Alanı</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={signatures.showPrincipal}
                  onChange={(e) => handleFieldChange('showPrincipal', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {signatures.showPrincipal && (
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                <input
                  type="text"
                  value={signatures.principalTitle}
                  onChange={(e) => handleFieldChange('principalTitle', e.target.value)}
                  className="px-2 py-1 bg-white border border-slate-300 rounded text-slate-800"
                  placeholder="UYGUNDUR - Okul Müdürü"
                />
                <input
                  type="text"
                  value={signatures.principalName}
                  onChange={(e) => handleFieldChange('principalName', e.target.value)}
                  className="px-2 py-1 bg-white border border-slate-300 rounded text-slate-800 font-medium"
                  placeholder="Hakan ÇİÇEK"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
