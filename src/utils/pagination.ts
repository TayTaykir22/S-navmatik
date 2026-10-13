import { Question, PageLayoutSettings, LayoutMode, ExamHeader, EvaluationTableSettings, TeacherSignatureSettings } from '../types/exam';

export interface PageData {
  pageIndex: number;
  pageNumber: number;
  totalPages: number;
  isFirstPage: boolean;
  isLastPage: boolean;
  layoutMode: LayoutMode;
  questions: Question[];
  leftQuestions?: Question[];
  rightQuestions?: Question[];
  hasHeader: boolean;
  hasContinuationHeader: boolean;
  hasEvaluationTable: boolean;
  hasSignatures: boolean;
  estimatedHeight: number;
  maxCapacity: number;
}

/**
 * Estimates the vertical height in pixels of a single question
 */
export function estimateQuestionHeight(
  q: Question,
  isTwoColumn: boolean,
  fontSize: 'xs' | 'sm' | 'base' = 'sm'
): number {
  // Question number & points bar
  let height = 28;

  // Text height estimation
  const charsPerLine = isTwoColumn ? 42 : 88;
  const lineSpacing = fontSize === 'xs' ? 16 : fontSize === 'base' ? 22 : 18;
  const textLines = (q.text || '').split('\n').reduce((acc, line) => {
    return acc + Math.max(1, Math.ceil((line.length || 1) / charsPerLine));
  }, 0);
  height += textLines * lineSpacing;

  // Question Image if present
  if (q.image?.url) {
    if (q.image.position === 'top' || q.image.position === 'below-text') {
      height += 120;
    } else if (q.image.position === 'right') {
      const imgHeight = 110;
      const textH = textLines * lineSpacing;
      if (imgHeight > textH) {
        height += imgHeight - textH;
      }
    }
  }

  // Answer space height
  const lineCount = q.answerSpace?.lineCount || 4;
  const answerHeight = Math.max(45, lineCount * 22);
  height += answerHeight;
  if (q.answerSpace?.hintText) {
    height += 16;
  }

  // Margins and separator
  height += 16;

  return height;
}

/**
 * Distributes questions across multiple A4 pages dynamically
 */
export function paginateQuestions(
  questions: Question[],
  layout?: PageLayoutSettings,
  header?: ExamHeader,
  evaluationTable?: EvaluationTableSettings,
  signatures?: TeacherSignatureSettings
): PageData[] {
  const safeLayout: PageLayoutSettings = layout || {
    layoutMode: 'single-column',
    fontFamily: 'sans',
    fontSize: 'sm',
    showColumnDivider: true,
    showPageNumbers: true,
    compactSpacing: false,
    showSolutions: false
  };
  const safeHeader: ExamHeader = header || {
    ministryTitle: '',
    district: '',
    schoolName: 'İSTİKLAL ORTAOKULU',
    academicYear: '2026-2027 EĞİTİM VE ÖĞRETİM YILI',
    termExam: '1. DÖNEM 1. ORTAK YAZILI SINAVI',
    courseName: '',
    gradeClass: '',
    examDate: '09/10/2026',
    durationMinutes: 40,
    examGroup: 'A GRUBU',
    logoLeft: '',
    logoRight: '',
    scenario: '',
    showStudentInfoBox: true,
    showHeaderBorder: true
  };
  const safeEval: EvaluationTableSettings = evaluationTable || {
    enabled: false,
    showCommentBox: false,
    commentBoxLabel: ''
  };
  const safeSignatures: TeacherSignatureSettings = signatures || {
    enabled: false,
    instructionsText: '',
    teachers: [],
    showPrincipal: false,
    principalTitle: '',
    principalName: ''
  };

  const safeQuestions = Array.isArray(questions) ? questions : [];

  if (safeQuestions.length === 0) {
    return [
      {
        pageIndex: 0,
        pageNumber: 1,
        totalPages: 1,
        isFirstPage: true,
        isLastPage: true,
        layoutMode: safeLayout.pageLayoutOverrides?.[1] || safeLayout.layoutMode || 'two-column',
        questions: [],
        leftQuestions: [],
        rightQuestions: [],
        hasHeader: true,
        hasContinuationHeader: false,
        hasEvaluationTable: Boolean(safeEval.enabled),
        hasSignatures: Boolean(safeSignatures.enabled),
        estimatedHeight: 0,
        maxCapacity: 1000
      }
    ];
  }

  const fontSize = safeLayout.fontSize || 'sm';

  // Helper to determine layout mode for a 1-based page number
  const getLayoutForPage = (pageNumber: number): LayoutMode => {
    return safeLayout.pageLayoutOverrides?.[pageNumber] || safeLayout.layoutMode || 'two-column';
  };

  // Fixed question count per page override if configured
  if (safeLayout.questionsPerPage && safeLayout.questionsPerPage > 0) {
    const pagesQuestions: Question[][] = [];
    let currentChunk: Question[] = [];

    for (let i = 0; i < safeQuestions.length; i++) {
      const q = safeQuestions[i];
      currentChunk.push(q);

      if (q.pageBreakAfter || currentChunk.length >= safeLayout.questionsPerPage || i === safeQuestions.length - 1) {
        pagesQuestions.push(currentChunk);
        currentChunk = [];
      }
    }

    return createPagesFromChunks(pagesQuestions, safeLayout, safeEval, safeSignatures);
  }

  // Dimension budgets:
  const continuationHeaderHeight = safeLayout.showContinuationHeader !== false ? 45 : 0;
  const footerOverhead = (safeEval.enabled ? 85 : 0) + (safeSignatures.enabled ? 85 : 0) + 30;

  // Let's first test if ALL questions fit on a SINGLE page:
  const page1Mode = getLayoutForPage(1);
  const isPage1TwoExams = page1Mode === 'two-exams-a4';
  const isPage1TwoCol = page1Mode === 'two-column';
  const page1PrintableHeight = isPage1TwoExams ? 680 : 1020;
  const page1HeaderHeight = isPage1TwoExams ? 100 : safeHeader.showHeaderBorder ? 125 : 105;
  const page1ColumnFactor = isPage1TwoCol ? 1.88 : 1.0;

  const totalQuestionWeightPage1 = safeQuestions.reduce(
    (sum, q) => sum + estimateQuestionHeight(q, isPage1TwoCol, fontSize),
    0
  );
  const hasManualPageBreak = safeQuestions.some((q) => q.pageBreakAfter);
  const singlePageCapacity = (page1PrintableHeight - page1HeaderHeight - footerOverhead) * page1ColumnFactor;

  if (!hasManualPageBreak && totalQuestionWeightPage1 <= singlePageCapacity) {
    // Fits on 1 page!
    return createPagesFromChunks([safeQuestions], safeLayout, safeEval, safeSignatures);
  }

  // Multi-page distribution algorithm taking into account each page's specific layout mode
  const pagesQuestions: Question[][] = [];
  let currentPageQuestions: Question[] = [];
  let currentAccumulatedWeight = 0;
  let currentPageIndex = 0;

  for (let i = 0; i < safeQuestions.length; i++) {
    const q = safeQuestions[i];
    const pageNumber = currentPageIndex + 1;
    const currentMode = getLayoutForPage(pageNumber);
    const isCurrentTwoExams = currentMode === 'two-exams-a4';
    const isCurrentTwoCol = currentMode === 'two-column';
    const currentColumnFactor = isCurrentTwoCol ? 1.88 : 1.0;
    const currentPrintableHeight = isCurrentTwoExams ? 680 : 1020;

    const qWeight = estimateQuestionHeight(q, isCurrentTwoCol, fontSize);
    const isFirstPage = currentPageIndex === 0;

    const currentHeaderHeight = isFirstPage ? page1HeaderHeight : continuationHeaderHeight;
    const isPotentiallyLastPage = i >= safeQuestions.length - 2;
    const reservedFooter = isPotentiallyLastPage ? footerOverhead : 0;
    const pageCapacity = (currentPrintableHeight - currentHeaderHeight - reservedFooter) * currentColumnFactor;

    const wouldExceed =
      currentPageQuestions.length > 0 &&
      currentAccumulatedWeight + qWeight > pageCapacity;

    if (wouldExceed || (currentPageQuestions.length > 0 && currentPageQuestions[currentPageQuestions.length - 1].pageBreakAfter)) {
      pagesQuestions.push(currentPageQuestions);
      currentPageQuestions = [q];
      currentAccumulatedWeight = qWeight;
      currentPageIndex++;
    } else {
      currentPageQuestions.push(q);
      currentAccumulatedWeight += qWeight;
    }
  }

  if (currentPageQuestions.length > 0) {
    pagesQuestions.push(currentPageQuestions);
  }

  return createPagesFromChunks(pagesQuestions, safeLayout, safeEval, safeSignatures);
}

function createPagesFromChunks(
  pagesQuestions: Question[][],
  layout: PageLayoutSettings,
  evaluationTable: EvaluationTableSettings,
  signatures: TeacherSignatureSettings
): PageData[] {
  const totalPages = pagesQuestions.length;

  return pagesQuestions.map((qList, index) => {
    const pageNumber = index + 1;
    const isFirstPage = index === 0;
    const isLastPage = index === totalPages - 1;

    // Check layout mode for this specific page
    const pageMode: LayoutMode = layout.pageLayoutOverrides?.[pageNumber] || layout.layoutMode || 'two-column';
    const isTwoColumn = pageMode === 'two-column';

    let leftQuestions: Question[] | undefined = undefined;
    let rightQuestions: Question[] | undefined = undefined;

    if (isTwoColumn) {
      const half = Math.ceil(qList.length / 2);
      leftQuestions = qList.slice(0, half);
      rightQuestions = qList.slice(half);
    }

    return {
      pageIndex: index,
      pageNumber,
      totalPages,
      isFirstPage,
      isLastPage,
      layoutMode: pageMode,
      questions: qList,
      leftQuestions,
      rightQuestions,
      hasHeader: isFirstPage || Boolean(layout.repeatFullHeaderOnAllPages),
      hasContinuationHeader: !isFirstPage && !layout.repeatFullHeaderOnAllPages && layout.showContinuationHeader !== false,
      hasEvaluationTable: isLastPage && Boolean(evaluationTable?.enabled),
      hasSignatures: isLastPage && Boolean(signatures?.enabled),
      estimatedHeight: 0,
      maxCapacity: 1000
    };
  });
}
