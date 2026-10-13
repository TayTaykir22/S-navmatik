import { ExamBackup, ExamData } from '../types/exam';

const STORAGE_KEY_BACKUPS = 'sinavmatik_backups';
const STORAGE_KEY_AUTO_ENABLED = 'sinavmatik_auto_backup_enabled';
const MAX_BACKUPS = 20;

export function getAutoBackupEnabled(): boolean {
  try {
    const val = localStorage.getItem(STORAGE_KEY_AUTO_ENABLED);
    if (val === null) return true; // Varsayılan olarak açık
    return val === 'true';
  } catch (e) {
    return true;
  }
}

export function setAutoBackupEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY_AUTO_ENABLED, String(enabled));
  } catch (e) {
    console.warn('LocalStorage erişim hatası:', e);
  }
}

export function getBackups(): ExamBackup[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BACKUPS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (e) {
    console.error('Yedekler okunamadı:', e);
    return [];
  }
}

export function saveBackup(exam: ExamData, source: 'auto' | 'manual' = 'auto'): ExamBackup | null {
  if (!exam || !exam.questions) return null;

  try {
    const now = new Date();
    const formattedDate = now.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const totalPoints = exam.questions.reduce((sum, q) => sum + (Number(q.points) || 0), 0);
    const title = exam.title || `${exam.header.courseName || 'Sınav'} ${exam.header.gradeClass || ''}`.trim() || 'Sınav Yedeği';

    const backupItem: ExamBackup = {
      id: `backup-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      formattedDate,
      source,
      examTitle: title,
      courseName: exam.header.courseName || '',
      gradeClass: exam.header.gradeClass || '',
      questionCount: exam.questions.length,
      totalPoints,
      data: JSON.parse(JSON.stringify(exam))
    };

    const existingBackups = getBackups();
    const updated = [backupItem, ...existingBackups].slice(0, MAX_BACKUPS);

    localStorage.setItem(STORAGE_KEY_BACKUPS, JSON.stringify(updated));
    return backupItem;
  } catch (e) {
    console.error('Yedek kaydedilirken hata oluştu:', e);
    return null;
  }
}

export function deleteBackup(id: string): ExamBackup[] {
  try {
    const current = getBackups();
    const filtered = current.filter((b) => b.id !== id);
    localStorage.setItem(STORAGE_KEY_BACKUPS, JSON.stringify(filtered));
    return filtered;
  } catch (e) {
    console.error('Yedek silinemedi:', e);
    return [];
  }
}

export function clearAllBackups(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_BACKUPS);
  } catch (e) {
    console.error('Yedekler temizlenemedi:', e);
  }
}

export function downloadBackupAsJson(backup: ExamBackup): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup.data, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  const safeTitle = (backup.examTitle || 'Sinav_Yedek').replace(/[\s/]/g, '_');
  const safeDate = backup.formattedDate.replace(/[\s:.]/g, '-');
  downloadAnchor.setAttribute('download', `${safeTitle}_Yedek_${safeDate}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
