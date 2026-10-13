import React, { useState } from 'react';
import {
  X,
  Save,
  RotateCcw,
  Download,
  Trash2,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { ExamBackup, ExamData } from '../types/exam';
import {
  getBackups,
  saveBackup,
  deleteBackup,
  clearAllBackups,
  downloadBackupAsJson,
  setAutoBackupEnabled
} from '../utils/backupManager';

interface BackupManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentExam: ExamData;
  autoBackupEnabled: boolean;
  onToggleAutoBackup: () => void;
  onRestoreExam: (exam: ExamData, dateStr: string) => void;
  onShowToast: (msg: string) => void;
}

export const BackupManagerModal: React.FC<BackupManagerModalProps> = ({
  isOpen,
  onClose,
  currentExam,
  autoBackupEnabled,
  onToggleAutoBackup,
  onRestoreExam,
  onShowToast
}) => {
  const [backups, setBackups] = useState<ExamBackup[]>(() => (isOpen ? getBackups() : []));
  const [confirmRestoreId, setConfirmRestoreId] = useState<string | null>(null);

  // Modal her açıldığında yedekleri tazele
  React.useEffect(() => {
    if (isOpen) {
      setBackups(getBackups());
      setConfirmRestoreId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleManualBackup = () => {
    const newBackup = saveBackup(currentExam, 'manual');
    if (newBackup) {
      setBackups(getBackups());
      onShowToast(`✅ Manuel yedek başarıyla oluşturuldu (${newBackup.formattedDate})`);
    } else {
      onShowToast('❌ Yedek kaydedilirken bir hata oluştu.');
    }
  };

  const handleDelete = (id: string) => {
    const remaining = deleteBackup(id);
    setBackups(remaining);
    onShowToast('Yedek silindi.');
  };

  const handleClearAll = () => {
    if (window.confirm('Tüm kayıtlı sınav yedekleri silinecek. Onaylıyor musunuz?')) {
      clearAllBackups();
      setBackups([]);
      onShowToast('Tüm yedek geçmişi temizlendi.');
    }
  };

  const handleRestore = (backup: ExamBackup) => {
    onRestoreExam(backup.data, backup.formattedDate);
    onShowToast(`✅ Sınav ${backup.formattedDate} tarihli yedeğe geri yüklendi!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Başlık Alanı */}
        <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/50 border border-indigo-400/30 flex items-center justify-center text-white shadow-inner">
              <ShieldCheck className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h2 className="font-bold text-base tracking-tight text-white flex items-center gap-2">
                Otomatik Yedekleme & Geçmiş
                <span className="text-[10px] bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-2 py-0.5 rounded-full font-medium">
                  2 Dakikada Bir
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Sınav içerikleriniz her 2 dakikada bir otomatik yedeklenir.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
            title="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Üst Denetim Paneli: Aç/Kapat Butonu & Manuel Yedek */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Otomatik Yedekle Aç / Kapat Tuşu */}
          <div className="flex items-center justify-between sm:justify-start gap-3 bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                Otomatik Yedekleme (2 dk)
              </span>
              <span className="text-[11px] text-slate-500">
                {autoBackupEnabled ? 'Her 2 dakikada bir otomatik kayıt alır' : 'Otomatik yedekleme duraklatıldı'}
              </span>
            </div>

            <button
              type="button"
              onClick={onToggleAutoBackup}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs ${
                autoBackupEnabled
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/20'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {autoBackupEnabled ? (
                <>
                  <ToggleRight className="w-4 h-4 text-emerald-200" />
                  <span>AÇIK</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-4 h-4 text-slate-500" />
                  <span>KAPALI</span>
                </>
              )}
            </button>
          </div>

          {/* Manuel Yedek Al Butonu */}
          <button
            type="button"
            onClick={handleManualBackup}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Şimdi Manuel Yedek Al</span>
          </button>
        </div>

        {/* Yedek Listesi */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 min-h-[220px]">
          <div className="flex items-center justify-between px-1 mb-1">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-slate-500" />
              Kayıtlı Yedek Noktaları ({backups.length})
            </span>
            {backups.length > 0 && (
              <span className="text-[11px] text-slate-400">
                En güncel 20 yedek saklanır
              </span>
            )}
          </div>

          {backups.length === 0 ? (
            <div className="py-12 px-4 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2.5" />
              <p className="text-sm font-semibold text-slate-700">Henüz kayıtlı bir yedek bulunmuyor</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                {autoBackupEnabled
                  ? 'Otomatik yedekleme açık. Sistem 2 dakika içinde otomatik ilk yedeği kaydedecektir.'
                  : 'Otomatik yedekleme kapalı. Yukarıdaki "Açık" butonuna tıklayarak veya "Şimdi Manuel Yedek Al" tuşu ile yedek oluşturabilirsiniz.'}
              </p>
            </div>
          ) : (
            backups.map((b) => {
              const isConfirming = confirmRestoreId === b.id;
              return (
                <div
                  key={b.id}
                  className="bg-white border border-slate-200 hover:border-indigo-300 rounded-xl p-3 shadow-2xs hover:shadow-sm transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        b.source === 'auto'
                          ? 'bg-blue-50 text-blue-600 border border-blue-200'
                          : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      }`}
                      title={b.source === 'auto' ? 'Otomatik (2 dakikalık periyot)' : 'Manuel Oluşturulan Yedek'}
                    >
                      {b.source === 'auto' ? (
                        <Clock className="w-4 h-4" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900">
                          {b.formattedDate}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                            b.source === 'auto'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {b.source === 'auto' ? 'Otomatik (2 dk)' : 'Manuel'}
                        </span>
                        {b.courseName && (
                          <span className="text-[11px] font-medium text-slate-600">
                            {b.courseName} {b.gradeClass}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                        <span>{b.questionCount} Soru</span>
                        <span>•</span>
                        <span>{b.totalPoints} Puan</span>
                        {b.examTitle && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-[200px]" title={b.examTitle}>
                              {b.examTitle}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Eylemler */}
                  <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    {isConfirming ? (
                      <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 p-1 rounded-lg">
                        <span className="text-[11px] font-medium text-amber-800 px-1">
                          Mevcut sınav değiştirilsin mi?
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRestore(b)}
                          className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-bold transition-colors cursor-pointer"
                        >
                          Evet, Yükle
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmRestoreId(null)}
                          className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-xs transition-colors cursor-pointer"
                        >
                          İptal
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setConfirmRestoreId(b.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white text-xs font-semibold border border-indigo-200 hover:border-indigo-600 transition-colors cursor-pointer"
                          title="Bu yedeği sınava geri yükle"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Geri Yükle</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => downloadBackupAsJson(b)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                          title="Bu yedeği JSON dosyası olarak indir"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(b.id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
                          title="Yedeği sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Alt Bilgi & Kapat */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          {backups.length > 0 ? (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Tüm Yedekleri Temizle</span>
            </button>
          ) : (
            <span className="text-xs text-slate-400">Veriler tarayıcınızda (yerel) güvenle saklanır.</span>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
