import React from 'react';
import { PageLayoutSettings, LayoutMode } from '../types/exam';
import { Columns, SplitSquareVertical, AlignJustify, Type, FileSpreadsheet, Eye } from 'lucide-react';

interface PageLayoutSettingsEditorProps {
  layout: PageLayoutSettings;
  onChange: (updated: PageLayoutSettings) => void;
}

export const PageLayoutSettingsEditor: React.FC<PageLayoutSettingsEditorProps> = ({
  layout,
  onChange
}) => {
  const handleFieldChange = (field: keyof PageLayoutSettings, value: any) => {
    onChange({
      ...layout,
      [field]: value
    });
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-800 font-semibold text-sm">
        <Columns className="w-4 h-4 text-indigo-600" />
        <span>Sayfa Düzeni & Yazdırma Biçimi</span>
      </div>

      <div className="space-y-3 text-xs">
        {/* Sayfa & Sütun Modu */}
        <div>
          <label className="block text-slate-700 font-semibold mb-1.5">
            A4 Kağıt & Sütun Düzeni (Genel Varsayılan):
          </label>
          <div className="grid grid-cols-1 gap-2">
            {[
              {
                id: 'two-column',
                title: 'Çift Sütunlu A4 (Dikey - Kağıttan %50 Tasarruf)',
                desc: 'A4 kağıdı dikey olarak iki eşit soru sütununa böler. Resmî MEB klasik yazılı formatıdır.',
                icon: Columns
              },
              {
                id: 'two-exams-a4',
                title: 'A4 Sayfa Bölme (Yatay 2 Eşit Nüsha)',
                desc: 'Tek bir A4 kağıdına yan yana 2 adet tam sınav basar. Ortadan kesilerek 1 yapraktan 2 öğrenciye sınav çıkar.',
                icon: SplitSquareVertical
              },
              {
                id: 'single-column',
                title: 'Tek Sütun Standart A4',
                desc: 'Geniş soru ve uzun kompozisyon / matematik çözümleri için tam sayfa genişliğinde sorular.',
                icon: AlignJustify
              }
            ].map((mode) => {
              const Icon = mode.icon;
              const isSelected = layout.layoutMode === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => handleFieldChange('layoutMode', mode.id as LayoutMode)}
                  className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 shadow-2xs ring-1 ring-indigo-500'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg mt-0.5 ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <span className="font-semibold text-slate-800 block text-xs">{mode.title}</span>
                    <span className="text-[11px] text-slate-500 mt-0.5 block leading-relaxed">{mode.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Her Sayfa İçin Ayrı Sütun & Kopya Ayarı (Sayfa Bazlı Özelleştirme) */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/90 space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 text-xs block">
                Her Sayfa İçin Özel Düzen (Sayfa Bazlı Ayar)
              </span>
              <span className="text-[11px] text-slate-500">
                Örn: 1. Sayfa Çift Sütun, 2. Sayfa Tek Sütun veya 2 Kopya
              </span>
            </div>
            {layout.pageLayoutOverrides && Object.keys(layout.pageLayoutOverrides).length > 0 && (
              <button
                type="button"
                onClick={() => handleFieldChange('pageLayoutOverrides', {})}
                className="text-[10px] text-red-600 hover:underline font-medium"
              >
                Özelleri Sıfırla
              </button>
            )}
          </div>

          <div className="space-y-2 pt-1">
            {[1, 2, 3, 4].map((pageNum) => {
              const currentOverride = layout.pageLayoutOverrides?.[pageNum];
              const effectiveMode = currentOverride || layout.layoutMode;

              return (
                <div
                  key={`page-override-${pageNum}`}
                  className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200 text-[11px]"
                >
                  <span className="font-bold text-slate-700">
                    {pageNum}. Sayfa:
                  </span>
                  <div className="flex items-center gap-1">
                    {[
                      { id: 'two-column', label: 'Çift Sütun' },
                      { id: 'single-column', label: 'Tek Sütun' },
                      { id: 'two-exams-a4', label: '2 Kopya' }
                    ].map((opt) => {
                      const isActive = effectiveMode === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            const newOverrides = { ...(layout.pageLayoutOverrides || {}) };
                            if (opt.id === layout.layoutMode) {
                              delete newOverrides[pageNum];
                            } else {
                              newOverrides[pageNum] = opt.id as LayoutMode;
                            }
                            handleFieldChange('pageLayoutOverrides', newOverrides);
                          }}
                          className={`px-2 py-1 rounded text-[10.5px] font-medium transition-all ${
                            isActive
                              ? 'bg-indigo-600 text-white font-bold shadow-2xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Yazı Tipi & Boyut */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-slate-600 font-medium mb-1 flex items-center gap-1">
              <Type className="w-3.5 h-3.5 text-slate-400" /> Yazı Tipi (Font)
            </label>
            <div className="flex gap-1">
              {[
                { id: 'serif', label: 'Klasik Serif (Resmi Sınav / Times)' },
                { id: 'sans', label: 'Modern Sans (Inter)' }
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => handleFieldChange('fontFamily', f.id)}
                  className={`flex-1 py-1.5 px-2 rounded-lg border text-center text-xs transition-colors ${
                    layout.fontFamily === f.id
                      ? 'bg-indigo-600 text-white border-indigo-600 font-medium'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Metin Boyutu</label>
            <div className="flex gap-1">
              {[
                { id: 'xs', label: 'Kompakt' },
                { id: 'sm', label: 'Standart' },
                { id: 'base', label: 'Geniş' }
              ].map((sz) => (
                <button
                  key={sz.id}
                  type="button"
                  onClick={() => handleFieldChange('fontSize', sz.id)}
                  className={`flex-1 py-1.5 px-2 rounded-lg border text-center text-xs transition-colors ${
                    layout.fontSize === sz.id
                      ? 'bg-indigo-600 text-white border-indigo-600 font-medium'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {sz.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Görsel Çizgiler & Ek Özellikler */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          {/* Çoklu Sayfa & A4 Bölme Ayarları */}
          <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 text-xs block">
                  A4 Kağıt Boyutu & Sayfalama (Çoklu Kağıt)
                </span>
                <span className="text-[11px] text-slate-500">
                  A4 kapasitesi aşıldığında otomatik 2., 3. kağıda geçer
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-200/70 text-indigo-800 font-semibold">
                Akıllı A4
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">
                Sayfa Başına Soru Dağıtımı:
              </label>
              <select
                value={layout.questionsPerPage || 0}
                onChange={(e) => handleFieldChange('questionsPerPage', Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              >
                <option value={0}>Otomatik (Soru ve Çözüm Boyutuna Göre Akıllı Böl)</option>
                <option value={2}>Sabit: Her Sayfada 2 Soru</option>
                <option value={3}>Sabit: Her Sayfada 3 Soru</option>
                <option value={4}>Sabit: Her Sayfada 4 Soru</option>
                <option value={5}>Sabit: Her Sayfada 5 Soru</option>
                <option value={6}>Sabit: Her Sayfada 6 Soru</option>
                <option value={8}>Sabit: Her Sayfada 8 Soru</option>
                <option value={10}>Sabit: Her Sayfada 10 Soru</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="font-medium text-slate-700 text-[11px] block">
                  2. ve 3. Kağıtlarda Devam Başlığı
                </span>
                <span className="text-[10px] text-slate-500">
                  Kağıtlar karışmasın diye üstte öğrenci adı/no bandı gösterir
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={layout.showContinuationHeader !== false}
                  onChange={(e) => handleFieldChange('showContinuationHeader', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium text-slate-700 block">Sütunlar Arası Ayraç Çizgisi</span>
              <span className="text-[11px] text-slate-400">Çift sütunlu modda iki sütun arasına dikey ince çizgi çeker</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={layout.showColumnDivider}
                onChange={(e) => handleFieldChange('showColumnDivider', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium text-slate-700 block">Sayfa Numaralandırması</span>
              <span className="text-[11px] text-slate-400">Alt bilgiye sayfa numaralarını ekler (Örn: Sayfa 1 / 2)</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={layout.showPageNumbers}
                onChange={(e) => handleFieldChange('showPageNumbers', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Cevap Anahtarı Modu */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 border border-amber-200">
            <div className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-amber-700" />
              <div>
                <span className="font-semibold text-amber-900 block">Öğretmen Cevap Anahtarı Çıktı Modu</span>
                <span className="text-[11px] text-amber-700">Çözüm ve yanıt notlarını boşlukların içine basar</span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={layout.showSolutions}
                onChange={(e) => handleFieldChange('showSolutions', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-amber-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-amber-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
