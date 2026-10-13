import React, { useRef } from 'react';
import { ExamHeader } from '../types/exam';
import { PRESET_LOGOS } from '../data/defaultLogos';
import { School, Calendar, Clock, Award, Image as ImageIcon, Upload, X, Shuffle, Bookmark } from 'lucide-react';

interface HeaderEditorProps {
  header: ExamHeader;
  onChange: (updated: ExamHeader) => void;
  onShuffleQuestions?: (target?: 'B' | 'C') => void;
  onSwitchGroup?: (group: 'A GRUBU' | 'B GRUBU' | 'C GRUBU' | '') => void;
}

export const HeaderEditor: React.FC<HeaderEditorProps> = ({
  header,
  onChange,
  onShuffleQuestions,
  onSwitchGroup
}) => {
  const leftFileInputRef = useRef<HTMLInputElement>(null);
  const rightFileInputRef = useRef<HTMLInputElement>(null);

  const handleFieldChange = (field: keyof ExamHeader, value: any) => {
    onChange({
      ...header,
      [field]: value
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, position: 'left' | 'right') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (position === 'left') {
        handleFieldChange('logoLeft', dataUrl);
      } else {
        handleFieldChange('logoRight', dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      {/* Okul ve Bakanlık Bilgileri */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-800 font-semibold text-sm">
          <School className="w-4 h-4 text-indigo-600" />
          <span>Kurum & Okul Başlığı</span>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-slate-800 font-bold">Okul Adı</label>
              <span className="text-[10.5px] text-slate-400">Sınav kağıdının ana kurum başlığı</span>
            </div>
            <input
              type="text"
              value={header.schoolName}
              onChange={(e) => handleFieldChange('schoolName', e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-black focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase tracking-wide"
              placeholder="İSTİKLAL ORTAOKULU"
            />
          </div>
        </div>
      </div>

      {/* Sınav, Senaryo ve Dönem Bilgileri */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-800 font-semibold text-sm">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <span>Sınav & Ders Bilgileri</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 text-xs">
          {/* Eğitim Öğretim Yılı ve Dönem/Sınav Türü (Altlı Üstlü) */}
          <div className="col-span-2 space-y-2 pb-2 border-b border-slate-100">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Eğitim Öğretim Yılı</label>
              <input
                type="text"
                value={header.academicYear}
                onChange={(e) => handleFieldChange('academicYear', e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="2024-2025 EĞİTİM VE ÖĞRETİM YILI"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Dönem & Sınav Türü</label>
              <input
                type="text"
                value={header.termExam}
                onChange={(e) => handleFieldChange('termExam', e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="1. DÖNEM 2. ORTAK KLASİK YAZILI SINAVI"
              />
            </div>
            <p className="text-[10.5px] text-slate-400 italic">
              * Bu iki başlık sınav kağıdının ortasında altlı üstlü resmi formatta yer alır.
            </p>
          </div>

          {/* Senaryo Alanı (MEB Senaryo Formatı) */}
          <div className="col-span-2 bg-indigo-50/70 p-2.5 rounded-xl border border-indigo-100 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-indigo-950 font-bold text-xs flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-indigo-600" />
                <span>Senaryo Alanı (MEB Sınav Senaryosu)</span>
              </label>
              <span className="text-[10px] text-indigo-700 font-semibold bg-indigo-100 px-2 py-0.5 rounded-full">
                MEB Ortak Yazılı
              </span>
            </div>
            <input
              type="text"
              value={header.scenario ?? '1. Senaryo'}
              onChange={(e) => handleFieldChange('scenario', e.target.value)}
              className="w-full px-2.5 py-1.5 border border-indigo-200 rounded-lg text-slate-900 font-bold bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs shadow-2xs"
              placeholder="Örn: 1. Senaryo veya Senaryo 2"
            />
            {/* Hızlı Seçim Butonları */}
            <div className="flex flex-wrap gap-1 pt-0.5">
              {['1. Senaryo', '2. Senaryo', '3. Senaryo', '4. Senaryo', 'Örnek Senaryo'].map((scen) => (
                <button
                  key={scen}
                  type="button"
                  onClick={() => handleFieldChange('scenario', scen)}
                  className={`px-2 py-0.5 rounded text-[10.5px] font-medium border transition-colors ${
                    (header.scenario || '1. Senaryo') === scen
                      ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-2xs'
                      : 'bg-white hover:bg-indigo-50 text-indigo-900 border-indigo-200'
                  }`}
                >
                  {scen}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Ders Adı</label>
            <input
              type="text"
              value={header.courseName}
              onChange={(e) => handleFieldChange('courseName', e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-bold text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="MATEMATİK"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Sınıf / Şube</label>
            <input
              type="text"
              value={header.gradeClass}
              onChange={(e) => handleFieldChange('gradeClass', e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="10 / A-B-C"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> Sınav Tarihi & Süresi
            </label>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={header.examDate}
                onChange={(e) => handleFieldChange('examDate', e.target.value)}
                className="w-1/2 px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="24.11.2024"
              />
              <div className="w-1/2 flex items-center gap-1 border border-slate-300 rounded-lg px-2 bg-slate-50">
                <input
                  type="number"
                  value={header.durationMinutes}
                  onChange={(e) => handleFieldChange('durationMinutes', Number(e.target.value))}
                  className="w-full py-1 text-slate-800 bg-transparent focus:outline-none"
                  min="10"
                  max="120"
                />
                <span className="text-slate-400 text-[11px]">Dk</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-slate-400" /> Sınav Grubu
              </span>
              {header.examGroup ? (
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded">
                  {header.examGroup} Aktif
                </span>
              ) : (
                <span className="text-[10px] font-medium text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                  Grupsuz (Başlıkta Grup Yazmaz)
                </span>
              )}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { val: 'A GRUBU', label: 'A Grubu (Sabit)' },
                { val: 'B GRUBU', label: 'B Grubu (Karışık)' },
                { val: 'C GRUBU', label: 'C Grubu (Karışık)' },
                { val: '', label: 'Grupsuz' }
              ].map((grp) => (
                <button
                  key={grp.val || 'grupsuz'}
                  type="button"
                  onClick={() => {
                    if (onSwitchGroup) {
                      onSwitchGroup(grp.val as any);
                    } else {
                      handleFieldChange('examGroup', grp.val);
                    }
                  }}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    header.examGroup === grp.val
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  {grp.label}
                </button>
              ))}
            </div>

            {/* B ve C Grubunu Karıştırma Butonları */}
            {onShuffleQuestions && (
              <div className="mt-2 pt-2 border-t border-slate-100 space-y-1.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => onShuffleQuestions('B')}
                    className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-violet-50 hover:bg-violet-100 text-violet-700 hover:text-violet-900 border border-violet-200 hover:border-violet-300 rounded-lg text-xs font-semibold shadow-2xs transition-all cursor-pointer group"
                    title="A grubu sabit kalır, sadece B grubunun soruları rastgele karıştırılır"
                  >
                    <Shuffle className="w-3.5 h-3.5 text-violet-600 group-hover:rotate-180 transition-transform duration-300" />
                    <span>B Grubunu Karıştır</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onShuffleQuestions('C')}
                    className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-900 border border-emerald-200 hover:border-emerald-300 rounded-lg text-xs font-semibold shadow-2xs transition-all cursor-pointer group"
                    title="A grubu sabit kalır, sadece C grubunun soruları rastgele karıştırılır"
                  >
                    <Shuffle className="w-3.5 h-3.5 text-emerald-600 group-hover:rotate-180 transition-transform duration-300" />
                    <span>C Grubunu Karıştır</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 leading-tight text-center">
                  💡 <strong>A grubu soruları sabit kalır</strong>; <strong>B</strong> ve <strong>C</strong> gruplarının soruları birbirinden bağımsız rastgele karıştırılır.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Okul ve MEB Logoları */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-800 font-semibold text-sm">
          <ImageIcon className="w-4 h-4 text-indigo-600" />
          <span>Başlık Logoları & Amblemler</span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          {/* Sol Logo */}
          <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
            <span className="font-medium text-slate-700 block">Sol Logo (MEB / Okul)</span>
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-2xs">
                {header.logoLeft ? (
                  <img src={header.logoLeft} alt="Sol Logo" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-[10px] text-slate-400">Yok</span>
                )}
              </div>
              <div className="space-y-1">
                <select
                  value={
                    PRESET_LOGOS.find((p) => p.dataUrl === header.logoLeft)?.id ||
                    (header.logoLeft ? 'custom' : 'none')
                  }
                  onChange={(e) => {
                    const found = PRESET_LOGOS.find((p) => p.id === e.target.value);
                    if (found) {
                      handleFieldChange('logoLeft', found.dataUrl);
                    }
                  }}
                  className="w-full text-xs px-2 py-1 border border-slate-300 rounded bg-white"
                >
                  {PRESET_LOGOS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                  {header.logoLeft && !PRESET_LOGOS.some((p) => p.dataUrl === header.logoLeft) && (
                    <option value="custom">Özel Yüklenen Logo</option>
                  )}
                </select>

                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => leftFileInputRef.current?.click()}
                    className="flex items-center gap-1 px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-[11px] text-slate-700"
                  >
                    <Upload className="w-3 h-3" /> Yükle
                  </button>
                  {header.logoLeft && (
                    <button
                      type="button"
                      onClick={() => handleFieldChange('logoLeft', '')}
                      className="p-1 hover:bg-red-50 text-red-600 rounded"
                      title="Logoyu kaldır"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <input
                  type="file"
                  ref={leftFileInputRef}
                  onChange={(e) => handleFileUpload(e, 'left')}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Sağ Logo */}
          <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
            <span className="font-medium text-slate-700 block">Sağ Logo (Okul Amblemi)</span>
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-2xs">
                {header.logoRight ? (
                  <img src={header.logoRight} alt="Sağ Logo" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-[10px] text-slate-400">Yok</span>
                )}
              </div>
              <div className="space-y-1">
                <select
                  value={
                    PRESET_LOGOS.find((p) => p.dataUrl === header.logoRight)?.id ||
                    (header.logoRight ? 'custom' : 'none')
                  }
                  onChange={(e) => {
                    const found = PRESET_LOGOS.find((p) => p.id === e.target.value);
                    if (found) {
                      handleFieldChange('logoRight', found.dataUrl);
                    }
                  }}
                  className="w-full text-xs px-2 py-1 border border-slate-300 rounded bg-white"
                >
                  {PRESET_LOGOS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                  {header.logoRight && !PRESET_LOGOS.some((p) => p.dataUrl === header.logoRight) && (
                    <option value="custom">Özel Yüklenen Logo</option>
                  )}
                </select>

                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => rightFileInputRef.current?.click()}
                    className="flex items-center gap-1 px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-[11px] text-slate-700"
                  >
                    <Upload className="w-3 h-3" /> Yükle
                  </button>
                  {header.logoRight && (
                    <button
                      type="button"
                      onClick={() => handleFieldChange('logoRight', '')}
                      className="p-1 hover:bg-red-50 text-red-600 rounded"
                      title="Logoyu kaldır"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <input
                  type="file"
                  ref={rightFileInputRef}
                  onChange={(e) => handleFileUpload(e, 'right')}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Öğrenci Bilgi Tablosu Ayarı */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-700 block">Öğrenci Bilgi Alanı</span>
            <span className="text-[11px] text-slate-400">Adı-Soyadı, No, Sınıfı ve Not kutucukları</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={header.showStudentInfoBox}
              onChange={(e) => handleFieldChange('showStudentInfoBox', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        <div className="pt-1 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-700 block">Başlık Çerçevesi</span>
            <span className="text-[11px] text-slate-400">Başlığın etrafında çift çizgili resmi çerçeve</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={header.showHeaderBorder}
              onChange={(e) => handleFieldChange('showHeaderBorder', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>
      </div>
    </div>
  );
};
