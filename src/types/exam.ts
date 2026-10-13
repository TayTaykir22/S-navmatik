export type LayoutMode = 'two-column' | 'two-exams-a4' | 'single-column';
export type AnswerSpaceType = 'lined' | 'squared' | 'dotted' | 'blank';
export type ImagePosition = 'below-text' | 'right' | 'top';

export interface ExamHeader {
  ministryTitle: string;
  district?: string;
  schoolName: string;
  academicYear: string;
  termExam: string;
  scenario?: string; // Senaryo Alanı (Örn: "1. Senaryo")
  courseName: string;
  gradeClass: string;
  examDate: string;
  durationMinutes: number;
  examGroup: string; // e.g. "A GRUBU" or ""
  logoLeft: string; // url or svg identifier
  logoRight: string; // url or svg identifier or empty
  showStudentInfoBox: boolean; // Öğrenci Adı Soyadı, Sınıfı, No, Aldığı Not
  showHeaderBorder: boolean;
}

export type ImageAspectRatio = 'auto' | '1/1' | '4/3' | '16/9' | '3/2' | '2/1' | '3/4' | 'custom';
export type ImageObjectFit = 'contain' | 'cover' | 'fill';

export interface QuestionImage {
  id?: string;
  url: string;
  alt?: string;
  caption?: string; // Örn: "Şekil 1", "Grafik A"
  position: ImagePosition;
  size?: 'small' | 'medium' | 'large';
  widthPercent: number; // 15 - 100
  aspectRatio?: ImageAspectRatio | string;
  objectFit?: ImageObjectFit;
  customHeightPx?: number;
  showBorder?: boolean;
}

export interface AnswerSpace {
  type: AnswerSpaceType;
  lineCount: number; // e.g. 4 - 20
  showBorder: boolean;
  boxHeightPx: number; // approx pixel height
  hintText?: string;
}

export interface Question {
  id: string;
  number: number;
  text: string;
  premise?: string; // Soru Öncülü / Bilgi Paragrafı (Normal Font)
  stem?: string; // Soru Kökü (Kalın Font)
  points: number;
  subject?: string;
  image?: QuestionImage; // Geriye dönük uyumluluk
  images?: QuestionImage[]; // Birden fazla görsel desteği
  answerSpace: AnswerSpace;
  solutionNotes?: string;
  pageBreakAfter?: boolean; // Bu sorudan sonra yeni A4 kağıdına geçiş yap
}

export function splitQuestionText(text: string): { premise: string; stem: string } {
  if (!text) return { premise: '', stem: '' };

  const keywords = [
    'Buna göre,',
    'Buna göre;',
    'Buna göre',
    'buna göre,',
    'buna göre'
  ];

  for (const kw of keywords) {
    const idx = text.indexOf(kw);
    if (idx > 0) {
      return {
        premise: text.substring(0, idx).trim(),
        stem: text.substring(idx).trim()
      };
    }
  }

  return {
    premise: '',
    stem: text
  };
}

export function getQuestionImages(q: Question): QuestionImage[] {
  if (Array.isArray(q.images) && q.images.length > 0) {
    return q.images;
  }
  if (q.image && q.image.url) {
    return [
      {
        id: (q.image as any).id || 'img-legacy',
        url: q.image.url,
        alt: q.image.alt || 'Soru Görseli',
        caption: (q.image as any).caption || '',
        position: q.image.position || 'right',
        size: q.image.size || 'small',
        widthPercent: q.image.widthPercent || 40,
        aspectRatio: (q.image as any).aspectRatio || 'auto',
        objectFit: (q.image as any).objectFit || 'contain',
        customHeightPx: (q.image as any).customHeightPx,
        showBorder: (q.image as any).showBorder ?? true
      }
    ];
  }
  return [];
}

export interface EvaluationTableSettings {
  enabled: boolean;
  showCommentBox: boolean;
  commentBoxLabel: string;
  rubricNotes?: string;
}

export interface TeacherSignature {
  name: string;
  title: string;
}

export interface TeacherSignatureSettings {
  enabled: boolean;
  instructionsText: string;
  teachers: TeacherSignature[];
  showPrincipal: boolean;
  principalTitle: string;
  principalName: string;
}

export interface PageLayoutSettings {
  layoutMode: LayoutMode;
  fontFamily: 'serif' | 'sans';
  fontSize: 'xs' | 'sm' | 'base';
  showColumnDivider: boolean;
  showPageNumbers: boolean;
  compactSpacing: boolean;
  showSolutions: boolean; // Cevap anahtarı modu
  paginationMode?: 'auto' | 'fixed-count';
  questionsPerPage?: number; // 0 = otomatik, >0 ise her sayfaya sabit soru adedi
  showContinuationHeader?: boolean; // 2. ve 3. sayfalarda kompakt devam başlığı göster
  repeatFullHeaderOnAllPages?: boolean;
  pageLayoutOverrides?: Record<number, LayoutMode>; // Her sayfa için özel düzen (Örn: 1. sayfa çift sütun, 2. sayfa tek sütun)
}

export function getPageLayoutMode(layout?: PageLayoutSettings, pageNumber: number = 1): LayoutMode {
  if (!layout) return 'two-column';
  if (layout.pageLayoutOverrides && layout.pageLayoutOverrides[pageNumber]) {
    return layout.pageLayoutOverrides[pageNumber];
  }
  return layout.layoutMode || 'two-column';
}

export interface ExamData {
  id: string;
  title: string;
  header: ExamHeader;
  questions: Question[];
  groupAQuestions?: Question[]; // A Grubu orijinal sabit soruları
  groupBOrder?: string[]; // B Grubu için karıştırılmış soru ID sırası
  groupCOrder?: string[]; // C Grubu için karıştırılmış soru ID sırası
  evaluationTable: EvaluationTableSettings;
  signatures: TeacherSignatureSettings;
  layout: PageLayoutSettings;
  updatedAt: string;
}

export interface ExamBackup {
  id: string;
  timestamp: number;
  formattedDate: string;
  source: 'auto' | 'manual';
  examTitle: string;
  courseName: string;
  gradeClass: string;
  questionCount: number;
  totalPoints: number;
  data: ExamData;
}

