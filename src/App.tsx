import React, { useState, useEffect, useRef } from 'react';
import { ExamData, LayoutMode, Question, AnswerSpace, ExamHeader, splitQuestionText } from './types/exam';
import { PRESET_EXAMS } from './data/presetExams';
import { OFFICIAL_MEB_LOGO } from './data/mebLogoData';
import { paginateQuestions } from './utils/pagination';
import {
  exportExamToPdf,
  printExamDocument,
  PdfExportProgress,
  PdfExportResult
} from './utils/pdfGenerator';
import { TopBar } from './components/TopBar';
import { HeaderEditor } from './components/HeaderEditor';
import { QuestionEditor } from './components/QuestionEditor';
import { EvaluationTableEditor } from './components/EvaluationTableEditor';
import { SignaturesEditor } from './components/SignaturesEditor';
import { PageLayoutSettingsEditor } from './components/PageLayoutSettingsEditor';
import { ExamPaperView } from './components/ExamPaperView';
import { PrintPreviewModal } from './components/PrintPreviewModal';
import { BackupManagerModal } from './components/BackupManagerModal';
import {
  getAutoBackupEnabled,
  setAutoBackupEnabled,
  getBackups,
  saveBackup
} from './utils/backupManager';
import {
  FileText,
  School,
  Table,
  PenTool,
  Columns,
  Eye,
  CheckCircle2,
  Printer,
  Sparkles,
  Info,
  FileDown,
  Loader2,
  ExternalLink,
  X,
  AlertTriangle,
  Download
} from 'lucide-react';

export default function App() {
  // Load initial exam from preset
  const [exam, setExam] = useState<ExamData>(() => {
    const initial = PRESET_EXAMS[0];
    const saved = localStorage.getItem('sinavmatik_current_exam');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          const merged: ExamData = {
            ...initial,
            ...parsed,
            header: {
              ...initial.header,
              ...(parsed.header || {})
            },
            layout: {
              ...initial.layout,
              ...(parsed.layout || {})
            },
            evaluationTable: {
              ...initial.evaluationTable,
              ...(parsed.evaluationTable || {})
            },
            signatures: {
              ...initial.signatures,
              ...(parsed.signatures || {})
            },
            questions: Array.isArray(parsed.questions) && parsed.questions.length > 0 ? parsed.questions : initial.questions
          };

          if (
            merged.header.schoolName === 'ATATÜRK ANADOLU LİSESİ' ||
            merged.header.schoolName === 'EDİRNE LİSESİ'
          ) {
            merged.header.schoolName = 'İSTİKLAL ORTAOKULU';
            merged.header.academicYear = '2026-2027 EĞİTİM VE ÖĞRETİM YILI';
            merged.header.termExam = '1. DÖNEM 1. ORTAK YAZILI SINAVI';
            merged.header.courseName = '';
            merged.header.gradeClass = '';
            merged.header.examDate = '09/10/2026';
            merged.header.scenario = '';
            merged.header.district = '';
          }
          if (merged.header.scenario === '1. Senaryo') {
            merged.header.scenario = '';
          }
          merged.header.ministryTitle = '';
          merged.header.logoLeft = OFFICIAL_MEB_LOGO;

          // Öğretmen ve Müdür bilgileri güncellemesi & başlangıçta kapalı gelme ayarı
          if (merged.signatures) {
            if (Array.isArray(merged.signatures.teachers)) {
              merged.signatures.teachers = merged.signatures.teachers.map((t: any) => {
                if (t.name === 'Mustafa KAYA' || (t.title && t.title.includes('Matematik Öğretmeni'))) {
                  return { name: 'Barış KIR', title: 'Sosyal Bilgiler Öğretmeni' };
                }
                if (t.name === 'Zeynep YILMAZ') {
                  return { name: 'Hamza ERDOĞAN', title: 'Zümre Başkanı' };
                }
                return t;
              });
            } else {
              merged.signatures.teachers = [
                { name: 'Barış KIR', title: 'Sosyal Bilgiler Öğretmeni' },
                { name: 'Hamza ERDOĞAN', title: 'Zümre Başkanı' }
              ];
            }

            if (merged.signatures.principalName === 'Ali Kemal DEMİR' || !merged.signatures.principalName || merged.signatures.principalName === 'Hüseyin ŞAHİN') {
              merged.signatures.principalName = 'Hakan ÇİÇEK';
            }

            const signaturesMigrated = localStorage.getItem('sinavmatik_signatures_defaults_v1');
            if (!signaturesMigrated) {
              merged.signatures.enabled = false;
              merged.signatures.showPrincipal = false;
              localStorage.setItem('sinavmatik_signatures_defaults_v1', 'true');
            }
          }

          merged.questions = merged.questions.map((q: any) => {
            if (q && q.premise === undefined && q.stem === undefined && q.text) {
              const parts = splitQuestionText(q.text);
              return { ...q, premise: parts.premise, stem: parts.stem };
            }
            return q;
          });

          if (!merged.groupAQuestions || merged.groupAQuestions.length === 0) {
            merged.groupAQuestions = [...merged.questions];
          } else {
            merged.groupAQuestions = merged.groupAQuestions.map((q: any) => {
              if (q && q.premise === undefined && q.stem === undefined && q.text) {
                const parts = splitQuestionText(q.text);
                return { ...q, premise: parts.premise, stem: parts.stem };
              }
              return q;
            });
          }
          return merged;
        }
      } catch (e) {
        console.warn('Failed to parse localStorage exam, resetting to preset', e);
      }
    }
    return {
      ...initial,
      groupAQuestions: [...initial.questions]
    };
  });

  const [activeTab, setActiveTab] = useState<'questions' | 'header' | 'eval' | 'signatures' | 'layout'>('questions');
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(exam.questions[0]?.id || null);
  const [workspaceMode, setWorkspaceMode] = useState<'split' | 'paper'>('split');
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');
  const [scale, setScale] = useState<number>(0.85);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [pdfProgress, setPdfProgress] = useState<PdfExportProgress | null>(null);
  const [pdfResult, setPdfResult] = useState<PdfExportResult | null>(null);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState<boolean>(false);

  // Otomatik Yedekleme State'leri (2 Dakikada bir)
  const [autoBackupEnabled, setAutoBackupEnabledState] = useState<boolean>(() => getAutoBackupEnabled());
  const [isBackupModalOpen, setIsBackupModalOpen] = useState<boolean>(false);
  const [lastBackupTime, setLastBackupTime] = useState<string | null>(null);
  const [backupCount, setBackupCount] = useState<number>(() => getBackups().length);

  // Auto-save exam to localStorage (Hızlı durum saklama)
  useEffect(() => {
    localStorage.setItem('sinavmatik_current_exam', JSON.stringify(exam));
  }, [exam]);

  // examRef ile 2 dakikalık periyodik yedeklemeyi kesintisiz çalıştırma
  const examRef = useRef(exam);
  useEffect(() => {
    examRef.current = exam;
  }, [exam]);

  // Her iki dakikada bir otomatik yedekleme (120 saniye = 120,000 ms)
  useEffect(() => {
    if (!autoBackupEnabled) return;

    const timer = setInterval(() => {
      const backup = saveBackup(examRef.current, 'auto');
      if (backup) {
        setLastBackupTime(backup.formattedDate);
        setBackupCount(getBackups().length);
        const timeOnly = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        showToast(`💾 Otomatik sınav yedeği alındı (${timeOnly})`);
      }
    }, 2 * 60 * 1000);

    return () => clearInterval(timer);
  }, [autoBackupEnabled]);

  const handleToggleAutoBackup = () => {
    setAutoBackupEnabledState((prev) => {
      const next = !prev;
      setAutoBackupEnabled(next);
      showToast(
        next
          ? '✅ Otomatik yedekleme AÇILDI (Her 2 dakikada bir yedek alınır)'
          : '⏸️ Otomatik yedekleme KAPATILDI'
      );
      return next;
    });
  };

  const handleRestoreBackupExam = (restoredExam: ExamData, dateStr: string) => {
    setExam(restoredExam);
    showToast(`✅ Sınav ${dateStr} tarihli yedeğe başarıyla geri yüklendi.`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  const totalPoints = exam.questions.reduce((sum, q) => sum + (Number(q.points) || 0), 0);

  // Calculate current pagination pages
  const calculatedPages = paginateQuestions(
    exam.questions,
    exam.layout,
    exam.header,
    exam.evaluationTable,
    exam.signatures
  );
  const totalPages = calculatedPages.length;

  // Handlers - Open Live Print Preview immediately
  const handlePrint = () => {
    setIsPrintPreviewOpen(true);
  };

  const handleDownloadPdf = async () => {
    try {
      setIsExportingPdf(true);
      setPdfProgress({
        currentPage: 1,
        totalPages: totalPages,
        statusText: 'A4 sayfaları hazırlanıyor...'
      });

      const result = await exportExamToPdf(exam, (progress) => {
        setPdfProgress(progress);
      });

      setPdfResult(result);
      showToast('✅ Sınav PDF dosyası başarıyla hazırlandı ve indirildi!');
    } catch (err: any) {
      console.error('PDF indirme hatası:', err);
      showToast('❌ PDF oluşturulamadı. Lütfen "Baskı Önizleme" penceresinden deneyiniz.');
      setIsPrintPreviewOpen(true);
    } finally {
      setIsExportingPdf(false);
      setPdfProgress(null);
    }
  };

  const handleTogglePageBreak = (qId: string) => {
    setExam((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === qId ? { ...q, pageBreakAfter: !q.pageBreakAfter } : q
      )
    }));
    showToast('Sayfa sonu / kağıt geçişi ayarlandı.');
  };

  const handleUpdateLayoutMode = (mode: LayoutMode) => {
    setExam((prev) => ({
      ...prev,
      layout: {
        ...prev.layout,
        layoutMode: mode
      }
    }));
    showToast(
      mode === 'two-column'
        ? 'A4 Çift Sütunlu Mod Aktif (%50 Tasarruf)'
        : mode === 'two-exams-a4'
        ? 'A4 İkiye Bölünen Mod Aktif (2 Kopya Yan Yana)'
        : 'Tek Sütun Standart Mod Aktif'
    );
  };

  const handleToggleSolutions = () => {
    setExam((prev) => ({
      ...prev,
      layout: {
        ...prev.layout,
        showSolutions: !prev.layout.showSolutions
      }
    }));
  };

  const handleBalancePoints = () => {
    if (exam.questions.length === 0) return;
    const count = exam.questions.length;
    const base = Math.floor(100 / count);
    const remainder = 100 - base * count;

    // Master A listesini dengele
    const masterA = (exam.groupAQuestions || exam.questions).map((q, idx) => ({
      ...q,
      points: idx < remainder ? base + 1 : base
    }));

    // Aktif soruları da master ile eşleştir
    const updatedActive = exam.questions.map((q) => {
      const match = masterA.find((m) => m.id === q.id);
      return match ? { ...q, points: match.points } : q;
    });

    setExam((prev) => ({
      ...prev,
      groupAQuestions: masterA,
      questions: updatedActive
    }));
    showToast('Tüm soruların puanları toplamı 100 olacak şekilde eşitlendi.');
  };

  // A, B ve C Grubu Mantığı:
  // "A grubu soruları sabit kalsın ve değişmesin, sadece B ve C grubu sorularının yeri değişsin"
  const handleShuffleQuestions = (targetGroup?: 'B' | 'C') => {
    // 1. A Grubu soruları referans alınır (SABİT KALIR VE ASLA DEĞİŞMEZ)
    const masterA = exam.groupAQuestions && exam.groupAQuestions.length > 0
      ? [...exam.groupAQuestions]
      : [...exam.questions];

    if (masterA.length <= 1) {
      showToast('Karıştırmak için sınavda en az 2 soru bulunmalıdır.');
      return;
    }

    const target = targetGroup || (exam.header.examGroup === 'C GRUBU' ? 'C' : 'B');

    // 2. Hedef grup için soru ID'lerini Fisher-Yates ile rastgele karıştır
    const shuffledIds = masterA.map((q) => q.id);
    for (let i = shuffledIds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledIds[i], shuffledIds[j]] = [shuffledIds[j], shuffledIds[i]];
    }

    // Eğer 2'den fazla soru varsa ve tesadüfen masterA ile aynı sırada kaldıysa ilk ikisini yer değiştir
    if (
      shuffledIds.length > 2 &&
      shuffledIds.every((id, idx) => id === masterA[idx].id)
    ) {
      [shuffledIds[0], shuffledIds[1]] = [shuffledIds[1], shuffledIds[0]];
    }

    // C grubu karıştırılıyorsa ve B ile birebir aynı olduysa C'yi daha da farklılaştır
    if (target === 'C' && exam.groupBOrder && exam.groupBOrder.length === shuffledIds.length && shuffledIds.length > 2) {
      if (shuffledIds.every((id, idx) => id === exam.groupBOrder![idx])) {
        const last = shuffledIds.length - 1;
        [shuffledIds[0], shuffledIds[last]] = [shuffledIds[last], shuffledIds[0]];
      }
    }

    // 3. Hedef grup sorularını oluştur (1, 2, 3.. şeklinde yeniden numaralandırılmış)
    const shuffledQuestions: Question[] = shuffledIds
      .map((id, idx) => {
        const found = masterA.find((q) => q.id === id);
        if (!found) return null;
        return {
          ...found,
          number: idx + 1,
          pageBreakAfter: false
        };
      })
      .filter(Boolean) as Question[];

    // 4. State'i güncelle: A grubu sabit tutuldu, hedef grup karıştırıldı ve aktif edildi
    if (target === 'C') {
      setExam((prev) => ({
        ...prev,
        header: {
          ...prev.header,
          examGroup: 'C GRUBU'
        },
        groupAQuestions: masterA, // A Grubu ASLA DEĞİŞMEZ (Sabit)
        groupCOrder: shuffledIds,
        questions: shuffledQuestions
      }));
      showToast('🎲 A grubu soruları sabit tutuldu. Sadece C grubu sorularının yeri karıştırıldı!');
    } else {
      setExam((prev) => ({
        ...prev,
        header: {
          ...prev.header,
          examGroup: 'B GRUBU'
        },
        groupAQuestions: masterA, // A Grubu ASLA DEĞİŞMEZ (Sabit)
        groupBOrder: shuffledIds,
        questions: shuffledQuestions
      }));
      showToast('🎲 A grubu soruları sabit tutuldu. Sadece B grubu sorularının yeri karıştırıldı!');
    }
  };

  const handleGenerateGroupB = () => handleShuffleQuestions('B');

  // A, B ve C Grubu Arasında Geçiş Yapma (A seçilince orijinal sabit liste, B ve C seçilince karışık liste)
  const handleSwitchGroup = (targetGroup: 'A GRUBU' | 'B GRUBU' | 'C GRUBU' | '') => {
    const masterA = exam.groupAQuestions && exam.groupAQuestions.length > 0
      ? [...exam.groupAQuestions]
      : [...exam.questions];

    if (targetGroup === 'C GRUBU') {
      let cOrder = exam.groupCOrder;
      // Eğer daha önce C karıştırılmamışsa karıştır
      if (!cOrder || cOrder.length !== masterA.length) {
        const shuffledIds = masterA.map((q) => q.id);
        for (let i = shuffledIds.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledIds[i], shuffledIds[j]] = [shuffledIds[j], shuffledIds[i]];
        }
        if (shuffledIds.length > 2 && shuffledIds.every((id, idx) => id === masterA[idx].id)) {
          [shuffledIds[0], shuffledIds[1]] = [shuffledIds[1], shuffledIds[0]];
        }
        cOrder = shuffledIds;
      }

      const cQuestions: Question[] = cOrder
        .map((id, idx) => {
          const found = masterA.find((q) => q.id === id);
          if (!found) return null;
          return { ...found, number: idx + 1, pageBreakAfter: false };
        })
        .filter(Boolean) as Question[];

      setExam((prev) => ({
        ...prev,
        header: { ...prev.header, examGroup: 'C GRUBU' },
        groupAQuestions: masterA,
        groupCOrder: cOrder,
        questions: cQuestions
      }));
      showToast('C Grubu aktif (Soruların karıştırılmış sırası).');
    } else if (targetGroup === 'B GRUBU') {
      let bOrder = exam.groupBOrder;
      // Eğer daha önce B karıştırılmamışsa karıştır
      if (!bOrder || bOrder.length !== masterA.length) {
        const shuffledIds = masterA.map((q) => q.id);
        for (let i = shuffledIds.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledIds[i], shuffledIds[j]] = [shuffledIds[j], shuffledIds[i]];
        }
        if (shuffledIds.length > 2 && shuffledIds.every((id, idx) => id === masterA[idx].id)) {
          [shuffledIds[0], shuffledIds[1]] = [shuffledIds[1], shuffledIds[0]];
        }
        bOrder = shuffledIds;
      }

      const bQuestions: Question[] = bOrder
        .map((id, idx) => {
          const found = masterA.find((q) => q.id === id);
          if (!found) return null;
          return { ...found, number: idx + 1, pageBreakAfter: false };
        })
        .filter(Boolean) as Question[];

      setExam((prev) => ({
        ...prev,
        header: { ...prev.header, examGroup: 'B GRUBU' },
        groupAQuestions: masterA,
        groupBOrder: bOrder,
        questions: bQuestions
      }));
      showToast('B Grubu aktif (Soruların karıştırılmış sırası).');
    } else {
      // A Grubu veya Grupsuz: Sabit orijinal A soruları gösterilir
      const aQuestions: Question[] = masterA.map((q, idx) => ({
        ...q,
        number: idx + 1
      }));

      setExam((prev) => ({
        ...prev,
        header: { ...prev.header, examGroup: targetGroup },
        groupAQuestions: masterA,
        questions: aQuestions
      }));
      showToast(targetGroup === 'A GRUBU' ? 'A Grubu aktif (Soruların orijinal sabit sırası).' : 'Grupsuz mod aktif.');
    }
  };

  // Soruların Güncellenmesi (İçerik düzenlemeleri hem A, hem B, hem C'de tutarlı kalır, sıra bağımsızdır)
  const handleQuestionsChange = (updatedQuestions: Question[]) => {
    setExam((prev) => {
      const isGroupB = prev.header.examGroup === 'B GRUBU';
      const isGroupC = prev.header.examGroup === 'C GRUBU';

      if (isGroupB || isGroupC) {
        // B veya C grubunda soru düzenlendiğinde soru içeriği güncellenir,
        // ancak A grubundaki orijinal sıra bozulmaz:
        const prevMasterA = prev.groupAQuestions || prev.questions;
        const newMasterA = prevMasterA.map((mA) => {
          const matchingUpdated = updatedQuestions.find((u) => u.id === mA.id);
          return matchingUpdated ? { ...matchingUpdated, number: mA.number } : mA;
        });

        // Yeni eklenen soru varsa masterA'ya ekle
        updatedQuestions.forEach((uQ) => {
          if (!newMasterA.some((mA) => mA.id === uQ.id)) {
            newMasterA.push({ ...uQ, number: newMasterA.length + 1 });
          }
        });

        // Silinen soru varsa masterA'dan filtrele
        const filteredMasterA = newMasterA.filter((mA) =>
          updatedQuestions.some((u) => u.id === mA.id)
        );

        if (isGroupC) {
          return {
            ...prev,
            groupAQuestions: filteredMasterA,
            groupCOrder: updatedQuestions.map((q) => q.id),
            questions: updatedQuestions
          };
        } else {
          return {
            ...prev,
            groupAQuestions: filteredMasterA,
            groupBOrder: updatedQuestions.map((q) => q.id),
            questions: updatedQuestions
          };
        }
      } else {
        // A grubunda düzenleme: A grubu doğrudan güncellenir
        return {
          ...prev,
          groupAQuestions: updatedQuestions,
          questions: updatedQuestions
        };
      }
    });
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exam, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    const filename = `${exam.header.courseName || 'Sinav'}_${exam.header.gradeClass || ''}_Sinav.json`
      .replace(/[\s/]/g, '_');
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Sınav şablon dosyası (JSON) bilgisayarınıza indirildi.');
  };

  const handleImportJson = (jsonData: any) => {
    if (jsonData && jsonData.questions && jsonData.header) {
      if (!jsonData.groupAQuestions || jsonData.groupAQuestions.length === 0) {
        jsonData.groupAQuestions = [...jsonData.questions];
      }
      setExam(jsonData);
      showToast('Sınav şablonu başarıyla yüklendi.');
    } else {
      showToast('❌ Geçersiz dosya formatı. Lütfen doğru bir JSON dosyası seçiniz.');
    }
  };

  const handleAddEmptyQuestion = () => {
    const currentMasterA = exam.groupAQuestions && exam.groupAQuestions.length > 0
      ? exam.groupAQuestions
      : exam.questions;
    const nextNum = currentMasterA.length + 1;
    const newQ: Question = {
      id: `q-${Date.now()}`,
      number: nextNum,
      text: `${nextNum}. Soru öncülü ve verileri...\nBuna göre sonucu bulunuz.`,
      premise: `${nextNum}. Soru öncülü ve verilen bilgileri buraya yazınız...`,
      stem: `Buna göre istenen sonucu işlem basamaklarını göstererek bulunuz.`,
      points: 10,
      answerSpace: {
        type: exam.layout.layoutMode === 'two-exams-a4' ? 'lined' : 'squared',
        lineCount: 5,
        showBorder: true,
        boxHeightPx: 95,
        hintText: 'Çözüm Alanı:'
      }
    };

    const newMasterA = [...currentMasterA, newQ];
    const newBOrder = exam.groupBOrder ? [...exam.groupBOrder, newQ.id] : undefined;
    const newCOrder = exam.groupCOrder ? [...exam.groupCOrder, newQ.id] : undefined;

    if (exam.header.examGroup === 'C GRUBU') {
      const updatedC = [...exam.questions, { ...newQ, number: exam.questions.length + 1 }];
      setExam((prev) => ({
        ...prev,
        groupAQuestions: newMasterA,
        groupBOrder: newBOrder,
        groupCOrder: newCOrder,
        questions: updatedC
      }));
    } else if (exam.header.examGroup === 'B GRUBU') {
      const updatedB = [...exam.questions, { ...newQ, number: exam.questions.length + 1 }];
      setExam((prev) => ({
        ...prev,
        groupAQuestions: newMasterA,
        groupBOrder: newBOrder,
        groupCOrder: newCOrder,
        questions: updatedB
      }));
    } else {
      setExam((prev) => ({
        ...prev,
        groupAQuestions: newMasterA,
        groupBOrder: newBOrder,
        groupCOrder: newCOrder,
        questions: newMasterA
      }));
    }

    setActiveTab('questions');
    showToast(`Soru ${nextNum} eklendi.`);
  };

  const handleUpdateQuestionInline = (id: string, newText: string) => {
    handleQuestionsChange(
      exam.questions.map((q) => (q.id === id ? { ...q, text: newText } : q))
    );
  };

  const handleUpdateQuestionPremiseStem = (id: string, premise: string, stem: string) => {
    const combinedText = [premise, stem].filter(Boolean).join('\n');
    handleQuestionsChange(
      exam.questions.map((q) =>
        q.id === id ? { ...q, premise, stem, text: combinedText } : q
      )
    );
  };

  const handleUpdateQuestionPoints = (id: string, points: number) => {
    handleQuestionsChange(
      exam.questions.map((q) => (q.id === id ? { ...q, points } : q))
    );
  };

  const handleUpdateQuestionAnswerSpace = (id: string, updates: Partial<AnswerSpace>) => {
    handleQuestionsChange(
      exam.questions.map((q) =>
        q.id === id ? { ...q, answerSpace: { ...q.answerSpace, ...updates } } : q
      )
    );
  };

  const handleUpdateQuestionSubject = (id: string, subject: string) => {
    handleQuestionsChange(
      exam.questions.map((q) => (q.id === id ? { ...q, subject } : q))
    );
  };

  const handleUpdateHeaderField = (field: keyof ExamHeader, val: any) => {
    setExam((prev) => ({
      ...prev,
      header: {
        ...prev.header,
        [field]: val
      }
    }));
  };

  const handleDeleteQuestion = (id: string) => {
    if (exam.questions.length <= 1) {
      showToast('En az 1 soru bulunmalıdır.');
      return;
    }
    const filtered = exam.questions.filter((q) => q.id !== id);
    const renumbered = filtered.map((q, idx) => ({ ...q, number: idx + 1 }));
    handleQuestionsChange(renumbered);
    if (selectedQuestionId === id) {
      setSelectedQuestionId(renumbered[0]?.id || null);
    }
    showToast('Soru silindi.');
  };

  const handleDuplicateQuestion = (qToDup: Question) => {
    const idx = exam.questions.findIndex((q) => q.id === qToDup.id);
    const newQ: Question = {
      ...qToDup,
      id: `q-${Date.now()}`,
      number: idx + 2
    };
    const newQuestions = [...exam.questions];
    newQuestions.splice(idx + 1, 0, newQ);
    const renumbered = newQuestions.map((q, i) => ({ ...q, number: i + 1 }));
    handleQuestionsChange(renumbered);
    setSelectedQuestionId(newQ.id);
    showToast(`Soru ${idx + 1} kopyalandı.`);
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= exam.questions.length) return;
    const newQuestions = [...exam.questions];
    const [moved] = newQuestions.splice(index, 1);
    newQuestions.splice(targetIndex, 0, moved);
    const renumbered = newQuestions.map((q, i) => ({ ...q, number: i + 1 }));
    handleQuestionsChange(renumbered);
    setSelectedQuestionId(moved.id);
  };

  const handleInsertQuestionAfter = (index: number) => {
    const newQ: Question = {
      id: `q-${Date.now()}`,
      number: index + 2,
      text: '',
      premise: '',
      stem: '',
      points: 10,
      answerSpace: {
        type: 'squared',
        lineCount: 5,
        showBorder: true,
        boxHeightPx: 100,
        hintText: 'Çözüm Alanı:'
      }
    };
    const newQuestions = [...exam.questions];
    newQuestions.splice(index + 1, 0, newQ);
    const renumbered = newQuestions.map((q, i) => ({ ...q, number: i + 1 }));
    handleQuestionsChange(renumbered);
    setSelectedQuestionId(newQ.id);
    setActiveTab('questions');
    showToast(`Araya yeni Soru ${index + 2} eklendi.`);
  };

  return (
    <div className="h-screen w-full bg-slate-100 flex flex-col font-sans overflow-hidden">
      {/* Üst Çubuk (Top Bar) */}
      <TopBar
        layoutMode={exam.layout.layoutMode}
        onChangeLayoutMode={handleUpdateLayoutMode}
        onDownloadPdf={handleDownloadPdf}
        onPrint={handlePrint}
        isExportingPdf={isExportingPdf}
        onAddQuestion={handleAddEmptyQuestion}
        onGenerateGroupB={handleGenerateGroupB}
        onShuffleQuestions={handleShuffleQuestions}
        currentGroup={exam.header.examGroup}
        onSwitchGroup={handleSwitchGroup}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        totalPoints={totalPoints}
        onBalancePoints={handleBalancePoints}
        scale={scale}
        onChangeScale={setScale}
        showSolutions={exam.layout.showSolutions}
        onToggleSolutions={handleToggleSolutions}
        totalPages={totalPages}
        workspaceMode={workspaceMode}
        onToggleWorkspaceMode={() =>
          setWorkspaceMode((prev) => (prev === 'split' ? 'paper' : 'split'))
        }
        autoBackupEnabled={autoBackupEnabled}
        onToggleAutoBackup={handleToggleAutoBackup}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        backupCount={backupCount}
        lastBackupTime={lastBackupTime || undefined}
      />

      {/* Toast Bildirimi */}
      {toastMessage && (
        <div className="no-print fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-medium border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mobil ve Dar Ekranlar için Görünüm Seçici Sekmeler (Ekran daraldığında önizleme kaybolmaz) */}
      <div className="md:hidden flex items-center justify-center bg-slate-900 border-b border-slate-800 p-1.5 gap-2 shrink-0 z-30">
        <button
          type="button"
          onClick={() => setMobileView('editor')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            mobileView === 'editor'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-300 hover:text-white bg-slate-800'
          }`}
        >
          <PenTool className="w-3.5 h-3.5" />
          <span>Sınavı Düzenle</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileView('preview')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            mobileView === 'preview'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-300 hover:text-white bg-slate-800'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>📄 PDF & Kağıt Önizle ({totalPages} Sayfa)</span>
        </button>
      </div>

      {/* Ana Çalışma Alanı: Sol Editör Paneli & Sağ Canlı Kağıt Önizlemesi */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0 w-full">
        {/* Sol Panel: Sınav Düzenleme Araçları (Kağıt modunda gizlenir, mobilde mobileView kontrolünde) */}
        {workspaceMode === 'split' && (
          <section
            className={`no-print w-full md:w-[480px] lg:w-[520px] bg-slate-50 border-r border-slate-200 flex-col shrink-0 h-full min-h-0 overflow-hidden animate-in fade-in duration-200 ${
              mobileView === 'preview' ? 'hidden md:flex' : 'flex'
            }`}
          >
            {/* Sekme Butonları */}
            <div className="flex border-b border-slate-200 bg-white px-2 pt-2 gap-1 overflow-x-auto scrollbar-thin shrink-0">
              {[
                { id: 'questions', label: `Sorular (${exam.questions.length})`, icon: FileText },
                { id: 'header', label: 'Okul & Antet', icon: School },
                { id: 'eval', label: 'Puan Tablosu', icon: Table },
                { id: 'signatures', label: 'Yönerge & İmza', icon: PenTool },
                { id: 'layout', label: 'Sayfa & Font', icon: Columns }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 shrink-0 ${
                      isActive
                        ? 'border-indigo-600 text-indigo-600 bg-slate-50'
                        : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Sekme İçeriği (Sol Tarafın Kendi İçinde Tamamen Bağımsız Kayması) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 overscroll-contain">
              {activeTab === 'questions' && (
                <QuestionEditor
                  questions={exam.questions}
                  onChange={handleQuestionsChange}
                  onShuffleQuestions={handleShuffleQuestions}
                  currentGroup={exam.header.examGroup}
                  selectedQuestionId={selectedQuestionId || undefined}
                  onSelectQuestionId={(id) => setSelectedQuestionId(id)}
                  header={exam.header}
                  layout={exam.layout}
                  onUpdateLayout={(updated) => setExam((prev) => ({ ...prev, layout: updated }))}
                  evaluationTable={exam.evaluationTable}
                  signatures={exam.signatures}
                />
              )}

              {activeTab === 'header' && (
                <HeaderEditor
                  header={exam.header}
                  onChange={(updated) => setExam((prev) => ({ ...prev, header: updated }))}
                  onShuffleQuestions={handleShuffleQuestions}
                  onSwitchGroup={handleSwitchGroup}
                />
              )}

              {activeTab === 'eval' && (
                <EvaluationTableEditor
                  settings={exam.evaluationTable}
                  onChange={(updated) => setExam((prev) => ({ ...prev, evaluationTable: updated }))}
                  questionCount={exam.questions.length}
                />
              )}

              {activeTab === 'signatures' && (
                <SignaturesEditor
                  signatures={exam.signatures}
                  onChange={(updated) => setExam((prev) => ({ ...prev, signatures: updated }))}
                />
              )}

              {activeTab === 'layout' && (
                <PageLayoutSettingsEditor
                  layout={exam.layout}
                  onChange={(updated) => setExam((prev) => ({ ...prev, layout: updated }))}
                />
              )}
            </div>

            {/* Hızlı Bilgi Şeridi */}
            <div className="p-3 bg-white border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-indigo-500" />
                <span>Doğrudan kağıt üzerindeki metinlere tıklayıp da düzenleyebilirsiniz!</span>
              </div>
            </div>
          </section>
        )}

        {/* Sağ Panel: Canlı A4 Baskı Önizlemesi (Sol Taraftan Tamamen Bağımsız Kaydırma) */}
        <section
          className={`flex-1 h-full min-h-0 bg-slate-200/80 overflow-y-auto overflow-x-auto p-4 sm:p-8 flex-col items-center justify-start overscroll-contain ${
            mobileView === 'editor' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Üst Önizleme Bilgi Çubuğu */}
          <div className="no-print sticky top-0 z-20 w-full max-w-[210mm] mb-4 flex items-center justify-between text-xs text-slate-600 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-xs border border-slate-200 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-semibold text-slate-800">Canlı PDF & A4 Baskı Önizlemesi</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500">
                {exam.layout.layoutMode === 'two-column'
                  ? 'A4 Çift Sütun Dikey'
                  : exam.layout.layoutMode === 'two-exams-a4'
                  ? 'A4 İkiye Böl (2 Kopya)'
                  : 'A4 Tek Sütun'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[11px]">
                {totalPages} Sayfa (A4)
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Tam Ekran PDF Önizleme Butonu */}
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs shadow-xs transition-colors cursor-pointer"
                title="Sınavı tam ekran PDF olarak canlı önizleyin veya yazıcıya gönderin"
              >
                <Eye className="w-3.5 h-3.5 text-white" />
                <span>PDF Önizle</span>
              </button>

              {/* Doğrudan PDF İndir Butonu */}
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isExportingPdf}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-2xs transition-all disabled:opacity-60 cursor-pointer"
                title="Sınavı bilgisayarınıza .pdf dosyası olarak doğrudan indirir"
              >
                {isExportingPdf ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>İndiriliyor...</span>
                  </>
                ) : (
                  <>
                    <FileDown className="w-3.5 h-3.5" />
                    <span>PDF İndir</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Fiziksel A4 Kağıt Bileşeni */}
          <div className="w-full flex justify-center pb-12">
            <ExamPaperView
              exam={exam}
              scale={scale}
              onUpdateQuestionText={handleUpdateQuestionInline}
              onUpdateQuestionPremiseStem={handleUpdateQuestionPremiseStem}
              onUpdateQuestionPoints={handleUpdateQuestionPoints}
              onUpdateQuestionAnswerSpace={handleUpdateQuestionAnswerSpace}
              onUpdateQuestionSubject={handleUpdateQuestionSubject}
              onUpdateHeaderField={handleUpdateHeaderField}
              onSelectQuestion={(id) => {
                setSelectedQuestionId(id);
              }}
              selectedQuestionId={selectedQuestionId || undefined}
              onDeleteQuestion={handleDeleteQuestion}
              onDuplicateQuestion={handleDuplicateQuestion}
              onMoveQuestion={handleMoveQuestion}
              onInsertQuestionAfter={handleInsertQuestionAfter}
              onTogglePageBreak={handleTogglePageBreak}
              onSwitchGroup={handleSwitchGroup}
            />
          </div>
        </section>
      </main>

      {/* PDF İndirme Yükleniyor Modalı */}
      {isExportingPdf && (
        <div className="no-print fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full text-center space-y-4 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
              <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                PDF Dosyası Hazırlanıyor...
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {pdfProgress?.statusText || 'Lütfen bekleyin, A4 sayfaları PDF formatına dönüştürülüyor.'}
              </p>
            </div>

            {/* Sayfa İlerleme Çubuğu */}
            {pdfProgress && (
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-emerald-600 h-2.5 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.round((pdfProgress.currentPage / pdfProgress.totalPages) * 100)}%`
                  }}
                ></div>
              </div>
            )}

            <div className="text-[11px] text-slate-400 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              ⚡ Tamamlandığında tarayıcınızın indirilenler klasörüne doğrudan kaydedilecektir.
            </div>
          </div>
        </div>
      )}

      {/* Hazırlanan PDF İndirme / Görüntüleme Bildirimi */}
      {pdfResult && (
        <div className="no-print fixed bottom-5 left-5 z-50 bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500/40 animate-in fade-in slide-in-from-bottom-3 max-w-md">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-xs text-white truncate">
              {pdfResult.fileName}
            </div>
            <div className="text-[11px] text-emerald-300">PDF dosyası hazır!</div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href={pdfResult.blobUrl}
              download={pdfResult.fileName}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
              title="Tekrar İndir"
            >
              <Download className="w-3.5 h-3.5" />
              <span>İndir</span>
            </a>
            <a
              href={pdfResult.blobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              title="Yeni Sekmede Aç / Görüntüle"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              type="button"
              onClick={() => setPdfResult(null)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Baskı Önizleme ve Canlı Yazdırma Modalı */}
      <PrintPreviewModal
        isOpen={isPrintPreviewOpen}
        onClose={() => setIsPrintPreviewOpen(false)}
        exam={exam}
        showSolutions={exam.layout.showSolutions}
        onToggleSolutions={handleToggleSolutions}
        onDownloadPdf={handleDownloadPdf}
        isExportingPdf={isExportingPdf}
      />

      {/* Otomatik Yedekleme ve Geçmiş Yöneticisi Modalı */}
      <BackupManagerModal
        isOpen={isBackupModalOpen}
        onClose={() => {
          setIsBackupModalOpen(false);
          setBackupCount(getBackups().length);
        }}
        currentExam={exam}
        autoBackupEnabled={autoBackupEnabled}
        onToggleAutoBackup={handleToggleAutoBackup}
        onRestoreExam={handleRestoreBackupExam}
        onShowToast={showToast}
      />
    </div>
  );
}
