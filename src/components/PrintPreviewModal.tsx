import React, { useState, useEffect } from 'react';
import {
  Printer,
  FileDown,
  ExternalLink,
  X,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  Maximize2,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
  Loader2,
  Info
} from 'lucide-react';
import { ExamData } from '../types/exam';
import { ExamPaperView } from './ExamPaperView';
import { paginateQuestions } from '../utils/pagination';
import { executePrintExam, createPrintableBlobUrl } from '../utils/printManager';

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: ExamData;
  showSolutions: boolean;
  onToggleSolutions: () => void;
  onDownloadPdf: () => void;
  isExportingPdf: boolean;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  isOpen,
  onClose,
  exam,
  showSolutions,
  onToggleSolutions,
  onDownloadPdf,
  isExportingPdf
}) => {
  const [scale, setScale] = useState<number>(0.72);
  const [selectedPage, setSelectedPage] = useState<number>(0); // 0 = All pages
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [printError, setPrintError] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string>('');

  const pages = paginateQuestions(
    exam.questions,
    exam.layout,
    exam.header,
    exam.evaluationTable,
    exam.signatures
  );
  const totalPages = pages.length;
  const totalPoints = exam.questions.reduce((sum, q) => sum + (Number(q.points) || 0), 0);

  // Generate printable blob URL on open / exam change
  useEffect(() => {
    if (!isOpen) return;

    try {
      const url = createPrintableBlobUrl(exam);
      setBlobUrl(url);
    } catch (e) {
      console.warn('Blob URL oluşturulamadı:', e);
    }
  }, [isOpen, exam, showSolutions]);

  // Escape key listener to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePrintClick = async () => {
    setIsPrinting(true);
    setPrintError(null);

    try {
      const res = await executePrintExam(exam);
      if (!res.success) {
        setPrintError(
          res.error || 'Tarayıcı güvenlik kısıtlaması nedeniyle doğrudan yazdırma penceresi açılamadı. Lütfen "Yeni Sekmede Aç & Yazdır" veya "PDF İndir" seçeneğini kullanınız.'
        );
      }
    } catch (err: any) {
      setPrintError('Yazdırma işlemi başlatılamadı. Lütfen alternatif butonları kullanınız.');
    } finally {
      setIsPrinting(false);
    }
  };

  const isLandscape = exam.layout.layoutMode === 'two-exams-a4';

  return (
    <div className="no-print fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex flex-col justify-between overflow-hidden animate-in fade-in duration-200">
      {/* 1. Üst Başlık & Kontrol Çubuğu */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-white shrink-0 shadow-md">
        {/* Sol: Başlık ve Sınav Bilgileri */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shrink-0">
            <Printer className="w-5 h-5 text-indigo-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide">
                PDF Önizleme & Yazdırma
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-semibold">
                {isLandscape ? 'A4 Yatay (2 Nüsha)' : 'A4 Dikey Standart'}
              </span>
              {exam.header.examGroup && (
                <span className="px-1.5 py-0.5 rounded bg-violet-500/30 text-violet-200 border border-violet-500/30 text-[10px] font-bold">
                  {exam.header.examGroup}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              {totalPages} Sayfa • {exam.questions.length} Soru • Toplam {totalPoints} Puan
            </p>
          </div>
        </div>

        {/* Orta: Sayfa Seçimi, Çözüm Gösterimi ve Zoom */}
        <div className="flex items-center gap-2">
          {/* Sayfa Gezintisi */}
          {totalPages > 1 && (
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setSelectedPage(0)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  selectedPage === 0
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
              >
                Tüm Sayfalar
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                <button
                  key={`page-btn-${pNum}`}
                  type="button"
                  onClick={() => setSelectedPage(pNum)}
                  className={`px-2 py-1 rounded-md transition-colors ${
                    selectedPage === pNum
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                  }`}
                  title={`${pNum}. Sayfayı Görüntüle`}
                >
                  {pNum}. Sayfa
                </button>
              ))}
            </div>
          )}

          {/* Cevap Anahtarı Toggle */}
          <button
            type="button"
            onClick={onToggleSolutions}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              showSolutions
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Soru çözümlerini kağıtta göster / gizle"
          >
            {showSolutions ? <Eye className="w-3.5 h-3.5 text-amber-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
            <span className="hidden sm:inline">
              {showSolutions ? 'Cevap Anahtarı Açık' : 'Cevap Anahtarı Kapalı'}
            </span>
          </button>

          {/* Zoom Kontrolleri */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg overflow-hidden text-slate-300 text-xs">
            <button
              type="button"
              onClick={() => setScale((s) => Math.max(0.4, Number((s - 0.1).toFixed(2))))}
              className="p-1.5 hover:bg-slate-700 text-slate-300"
              title="Uzaklaştır"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono text-[11px] text-slate-300">{Math.round(scale * 100)}%</span>
            <button
              type="button"
              onClick={() => setScale((s) => Math.min(1.2, Number((s + 0.1).toFixed(2))))}
              className="p-1.5 hover:bg-slate-700 text-slate-300"
              title="Yakınlaştır"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setScale(0.72)}
              className="p-1.5 hover:bg-slate-700 text-slate-300 border-l border-slate-700"
              title="Sığdır"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Sağ: Aksiyon Butonları & Kapat */}
        <div className="flex items-center gap-2">
          {/* Yazdır (Birincil Buton) */}
          <button
            type="button"
            onClick={handlePrintClick}
            disabled={isPrinting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-950/40 transition-all cursor-pointer active:scale-95 disabled:opacity-60"
            title="Yazıcıya gönder veya tarayıcı yazdırma penceresini aç"
          >
            {isPrinting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Yazdırılıyor...</span>
              </>
            ) : (
              <>
                <Printer className="w-4 h-4 text-white" />
                <span>Yazıcıya Gönder (Yazdır)</span>
              </>
            )}
          </button>

          {/* Yeni Sekmede Aç & Yazdır */}
          <a
            href={blobUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              const url = createPrintableBlobUrl(exam);
              setBlobUrl(url);
              e.currentTarget.href = url;
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 font-medium text-xs transition-colors cursor-pointer"
            title="Önizlemeyi ayrı bir sekmede temiz şekilde açar ve otomatik yazdırır"
          >
            <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Yeni Sekmede Yazdır</span>
            <span className="sm:hidden">Ayrı Sekme</span>
          </a>

          {/* PDF Olarak İndir */}
          <button
            type="button"
            onClick={() => {
              onDownloadPdf();
            }}
            disabled={isExportingPdf}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950/30 transition-all cursor-pointer active:scale-95 disabled:opacity-60"
            title="Sınavı yüksek çözünürlüklü A4 PDF dosyası olarak bilgisayarınıza kaydeder"
          >
            {isExportingPdf ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                <span className="hidden sm:inline">İndiriliyor...</span>
              </>
            ) : (
              <>
                <FileDown className="w-3.5 h-3.5 text-white" />
                <span className="hidden sm:inline">PDF İndir</span>
              </>
            )}
          </button>

          {/* Kapat Butonu */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors ml-1"
            title="Önizleme Penceresini Kapat (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 2. Bilgi & Uyarı Şeridi */}
      <div className="bg-slate-800/90 border-b border-slate-700/80 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
        <div className="flex items-center gap-2 text-slate-300">
          <Info className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>
            <strong>Baskı İpucu:</strong> Yazıcı penceresi açıldığında <strong>Kenar Boşlukları: Yok / Varsayılan</strong> ve <strong>Ölçek: %100</strong> seçtiğinizde MEB standartlarında tam sığar.
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-400 text-[11px]">
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            A4 Kağıdına Tam Uyumlu
          </span>
          <span>•</span>
          <span>Sayfa Boyutu: {isLandscape ? '297 × 210 mm (Yatay)' : '210 × 297 mm (Dikey)'}</span>
        </div>
      </div>

      {/* Tarayıcı Kısıtlaması Varsa Gösterilen İkaz */}
      {printError && (
        <div className="bg-amber-950/80 border-b border-amber-700/80 px-4 py-2.5 text-amber-200 text-xs flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Tarayıcınızın güvenlik ayarları nedeniyle doğrudan yazdırma engellendi. Aşağıdaki 2 yöntemden biriyle anında yazdırabilirsiniz:
            </span>
          </div>
          <div className="flex items-center gap-2">
            {blobUrl && (
              <a
                href={blobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Yeni Sekmede Aç & Yazdır</span>
              </a>
            )}
            <button
              type="button"
              onClick={onDownloadPdf}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>PDF Olarak İndir</span>
            </button>
            <button
              type="button"
              onClick={() => setPrintError(null)}
              className="p-1 text-amber-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Ana Önizleme Alanı (Scrollable Workspace) */}
      <main className="flex-1 bg-slate-950/90 overflow-y-auto overflow-x-auto p-6 md:p-10 flex flex-col items-center justify-start">
        <div className="w-full flex flex-col items-center">
          <ExamPaperView
            exam={exam}
            scale={scale}
            isPrintPreview={true}
            filterPageNumber={selectedPage}
          />
        </div>
      </main>

      {/* 4. Alt Hızlı Eylemler Çubuğu */}
      <footer className="bg-slate-900 border-t border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs text-slate-400 shrink-0">
        <div className="flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-indigo-400" />
          <span>
            {selectedPage > 0 ? `${selectedPage}. Sayfa Önizlemesi` : `Toplam ${totalPages} Sayfa A4 Önizleniyor`}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
          >
            Düzenlemeye Dön
          </button>
          <button
            type="button"
            onClick={handlePrintClick}
            disabled={isPrinting}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Yazıcıya Gönder</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
