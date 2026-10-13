import React, { useRef } from 'react';
import { LayoutMode } from '../types/exam';
import {
  Printer,
  Shuffle,
  Download,
  Upload,
  BookOpen,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Columns,
  SplitSquareVertical,
  AlignJustify,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  FileDown,
  FileText,
  Loader2,
  Save,
  History
} from 'lucide-react';

interface TopBarProps {
  layoutMode: LayoutMode;
  onChangeLayoutMode: (mode: LayoutMode) => void;
  onDownloadPdf: () => void;
  onPrint: () => void;
  isExportingPdf?: boolean;
  onAddQuestion: () => void;
  onGenerateGroupB: () => void;
  onShuffleQuestions?: (targetGroup?: 'B' | 'C') => void;
  currentGroup?: string;
  onSwitchGroup?: (group: 'A GRUBU' | 'B GRUBU' | 'C GRUBU' | '') => void;
  onExportJson: () => void;
  onImportJson: (jsonData: any) => void;
  totalPoints: number;
  onBalancePoints: () => void;
  scale: number;
  onChangeScale: (newScale: number) => void;
  showSolutions: boolean;
  onToggleSolutions: () => void;
  totalPages?: number;
  workspaceMode?: 'split' | 'paper';
  onToggleWorkspaceMode?: () => void;
  autoBackupEnabled?: boolean;
  onToggleAutoBackup?: () => void;
  onOpenBackupModal?: () => void;
  backupCount?: number;
  lastBackupTime?: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  layoutMode,
  onChangeLayoutMode,
  onDownloadPdf,
  onPrint,
  isExportingPdf = false,
  onAddQuestion,
  onGenerateGroupB,
  onShuffleQuestions,
  currentGroup,
  onSwitchGroup,
  onExportJson,
  onImportJson,
  totalPoints,
  onBalancePoints,
  scale,
  onChangeScale,
  showSolutions,
  onToggleSolutions,
  totalPages = 1,
  workspaceMode = 'split',
  onToggleWorkspaceMode,
  autoBackupEnabled = true,
  onToggleAutoBackup,
  onOpenBackupModal,
  backupCount = 0,
  lastBackupTime
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        onImportJson(json);
      } catch (err) {
        alert('Geçersiz sınav dosyası! Lütfen geçerli bir JSON şablonu yükleyin.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header className="no-print bg-slate-900 text-white border-b border-slate-800 px-2 sm:px-3 py-1.5 flex items-center justify-between gap-1.5 sm:gap-2 shadow-md sticky top-0 z-40 overflow-x-auto">
      {/* Sol: Logo & Başlık (Kompakt ve Tek Satır) */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-500/30">
          <BookOpen className="w-4 h-4 text-white" />
        </div>
        <div className="flex items-center gap-1.5">
          <h1 className="font-bold text-xs sm:text-sm tracking-tight text-white">
            SınavMatik
          </h1>
          <span className="text-[9px] font-semibold px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hidden sm:inline">
            MEB Uyumlu
          </span>
        </div>
      </div>

      {/* Orta Sol: Sütun / Sayfa Modu Hızlı Seçici (Daima Görünür, Kompakt) */}
      <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700/80 shrink-0">
        {[
          { id: 'two-column', label: 'Çift Sütun', icon: Columns, tooltip: 'A4 Dikey Çift Sütun' },
          { id: 'two-exams-a4', label: '2 Kopya', icon: SplitSquareVertical, tooltip: '1 Sayfaya 2 Eşit Sınav (A4 Yatay)' },
          { id: 'single-column', label: 'Tek Sütun', icon: AlignJustify, tooltip: 'A4 Tek Geniş Sütun' }
        ].map((item) => {
          const Icon = item.icon;
          const isActive = layoutMode === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeLayoutMode(item.id as LayoutMode)}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
              title={item.tooltip}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Görünüm Modu: Bölünmüş vs Kağıt Odaklı */}
      {onToggleWorkspaceMode && (
        <button
          type="button"
          onClick={onToggleWorkspaceMode}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer shrink-0 ${
            workspaceMode === 'paper'
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-bold'
              : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
          }`}
          title={
            workspaceMode === 'paper'
              ? 'Sol düzenleme panelini tekrar aç (Bölünmüş Mod)'
              : 'Doğrudan A4 kağıt üzerinde düzenleme moduna geç (Genişletilmiş Sayfa)'
          }
        >
          {workspaceMode === 'paper' ? (
            <>
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bölünmüş</span>
            </>
          ) : (
            <>
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Tam Kağıt</span>
            </>
          )}
        </button>
      )}

      {/* Puan & Sayfa Sayısı Rozetleri */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Kağıt / Sayfa Sayısı Göstergesi */}
        <div
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700/80 text-xs font-medium"
          title="Sınavın toplam A4 kağıt sayısı (Baskıda bu kadar sayfa çıkar)"
        >
          <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
          <span>{totalPages} Sayfa</span>
        </div>

        {totalPoints === 100 ? (
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 text-xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>100 P</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={onBalancePoints}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-950/80 text-amber-300 border border-amber-700/50 text-xs font-medium hover:bg-amber-900/60 transition-colors cursor-pointer"
            title="Puanları 100'e otomatik eşitlemek için tıklayın"
          >
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>{totalPoints} P</span>
            <span className="text-[10px] underline ml-0.5 hidden sm:inline">Eşitle</span>
          </button>
        )}
      </div>

      {/* Sağ: Aksiyon Butonları */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Cevap Anahtarı Toggle */}
        <button
          type="button"
          onClick={onToggleSolutions}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
            showSolutions
              ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
          }`}
          title="Soruların çözümlerini kağıtta göster / gizle"
        >
          {showSolutions ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span className="hidden md:inline">{showSolutions ? 'Cevaplar Açık' : 'Cevaplar'}</span>
        </button>

        {/* A, B, C Grubu Seçimi & Karıştırma - KÜÇÜK VE KOMPAKT ALAN */}
        <div className="flex items-center gap-0.5 bg-slate-800 p-0.5 rounded-lg border border-slate-700/80">
          <button
            type="button"
            onClick={() => onSwitchGroup?.('A GRUBU')}
            className={`w-6 h-6 rounded text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
              currentGroup === 'A GRUBU' || (!currentGroup && currentGroup !== 'B GRUBU' && currentGroup !== 'C GRUBU')
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
            title="A Grubu (Sabit / Orijinal Sıra)"
          >
            A
          </button>
          <button
            type="button"
            onClick={() => onSwitchGroup?.('B GRUBU')}
            className={`w-6 h-6 rounded text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
              currentGroup === 'B GRUBU'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
            title="B Grubu (1. Karışık Sıra)"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => onSwitchGroup?.('C GRUBU')}
            className={`w-6 h-6 rounded text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
              currentGroup === 'C GRUBU'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
            title="C Grubu (2. Karışık Sıra)"
          >
            C
          </button>

          <div className="w-[1px] h-3 bg-slate-700 mx-0.5" />

          {/* Kompakt Karıştırma Butonu */}
          <button
            type="button"
            onClick={() => {
              if (currentGroup === 'C GRUBU') {
                onShuffleQuestions ? onShuffleQuestions('C') : onGenerateGroupB();
              } else if (currentGroup === 'B GRUBU') {
                onShuffleQuestions ? onShuffleQuestions('B') : onGenerateGroupB();
              } else {
                onShuffleQuestions ? onShuffleQuestions('B') : onGenerateGroupB();
              }
            }}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-slate-700/80 hover:bg-indigo-600 text-slate-200 hover:text-white transition-colors cursor-pointer"
            title={
              currentGroup === 'C GRUBU'
                ? "C grubundaki soruların sırasını yeniden karıştır"
                : currentGroup === 'B GRUBU'
                ? "B grubundaki soruların sırasını yeniden karıştır"
                : "Soruları karıştırıp B grubuna aktar"
            }
          >
            <Shuffle className="w-3 h-3 text-indigo-400" />
            <span className="text-[10px] font-semibold hidden lg:inline">
              {currentGroup === 'C GRUBU' ? 'C Karıştır' : currentGroup === 'B GRUBU' ? 'B Karıştır' : 'Karıştır'}
            </span>
          </button>
        </div>

        {/* İçe / Dışa Aktar */}
        <div className="flex items-center border border-slate-700 rounded-lg overflow-hidden bg-slate-800">
          <button
            type="button"
            onClick={onExportJson}
            className="p-1.5 hover:bg-slate-700 text-slate-300"
            title="Sınavı JSON olarak kaydet (düzenlenebilir dosya)"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 hover:bg-slate-700 text-slate-300 border-l border-slate-700"
            title="Kaydedilmiş sınav dosyasını yükle (JSON)"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
        </div>

        {/* 2 Dakikada Bir Otomatik Yedekleme Aç/Kapat Butonu & Geçmiş */}
        <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700/80 shrink-0">
          <button
            type="button"
            onClick={onToggleAutoBackup}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              autoBackupEnabled
                ? 'bg-emerald-600 text-white shadow-xs hover:bg-emerald-500'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
            }`}
            title={
              autoBackupEnabled
                ? 'Otomatik Yedekleme: AÇIK (2 dakikada bir otomatik kaydedilir). Kapatmak için tıklayın.'
                : 'Otomatik Yedekleme: KAPALI. Açmak için tıklayın.'
            }
          >
            <Save className={`w-3.5 h-3.5 ${autoBackupEnabled ? 'text-white' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">
              {autoBackupEnabled ? 'Oto Yedek: Açık' : 'Oto Yedek: Kapalı'}
            </span>
            <span className="sm:hidden">
              {autoBackupEnabled ? 'Yedek: Açık' : 'Yedek: Kpl'}
            </span>
          </button>

          {/* Yedek Geçmişi & Yönetimi Butonu */}
          {onOpenBackupModal && (
            <button
              type="button"
              onClick={onOpenBackupModal}
              className="p-1 hover:bg-slate-700 text-slate-300 hover:text-white rounded border-l border-slate-700 transition-colors cursor-pointer relative"
              title={
                lastBackupTime
                  ? `Yedek Geçmişi (Son Yedek: ${lastBackupTime})`
                  : 'Yedek Geçmişi & Yönetimi (Geri Yükle / İndir)'
              }
            >
              <History className="w-3.5 h-3.5 text-indigo-400" />
              {backupCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-[8px] font-bold px-1 rounded-full leading-tight">
                  {backupCount}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Zoom Kontrolleri */}
        <div className="hidden 2xl:flex items-center border border-slate-700 rounded-lg overflow-hidden bg-slate-800 text-slate-300 text-xs">
          <button
            type="button"
            onClick={() => onChangeScale(Math.max(0.4, scale - 0.1))}
            className="p-1 hover:bg-slate-700"
            title="Uzaklaştır"
          >
            <ZoomOut className="w-3 h-3" />
          </button>
          <span className="px-1.5 font-mono text-[10px] text-slate-400">{Math.round(scale * 100)}%</span>
          <button
            type="button"
            onClick={() => onChangeScale(Math.min(1.5, scale + 0.1))}
            className="p-1 hover:bg-slate-700"
            title="Yakınlaştır"
          >
            <ZoomIn className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => onChangeScale(0.85)}
            className="p-1 hover:bg-slate-700 border-l border-slate-700"
            title="Sığdır"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>

        {/* Ana PDF Önizleme & PDF İndir Butonları */}
        <div className="flex items-center gap-1">
          {/* PDF Önizleme Butonu */}
          <button
            type="button"
            onClick={onPrint}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all transform active:scale-95 cursor-pointer shrink-0"
            title="Sınavı tam sayfa olarak canlı PDF / baskı modunda önizleyin"
          >
            <Eye className="w-3.5 h-3.5 text-white" />
            <span>PDF Önizle</span>
          </button>

          {/* Doğrudan PDF İndir Butonu */}
          <button
            type="button"
            onClick={onDownloadPdf}
            disabled={isExportingPdf}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all transform active:scale-95 disabled:opacity-60 cursor-pointer shrink-0"
            title="Sınavı bilgisayarınıza .pdf dosyası olarak doğrudan indirir"
          >
            {isExportingPdf ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                <span className="hidden sm:inline">İndiriliyor...</span>
              </>
            ) : (
              <>
                <FileDown className="w-3.5 h-3.5 text-white" />
                <span>PDF İndir</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
