import React, { useState, useRef } from 'react';
import {
  Question,
  AnswerSpaceType,
  QuestionImage,
  getQuestionImages,
  ImageAspectRatio,
  ImageObjectFit,
  ImagePosition,
  splitQuestionText,
  PageLayoutSettings,
  ExamHeader,
  EvaluationTableSettings,
  TeacherSignatureSettings
} from '../types/exam';
import { paginateQuestions, estimateQuestionHeight } from '../utils/pagination';
import { SymbolPicker } from './SymbolPicker';
import { QUESTION_DIAGRAMS } from '../data/questionBank';
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Image as ImageIcon,
  Sparkles,
  Calculator,
  Grid,
  AlignLeft,
  FileQuestion,
  HelpCircle,
  Eye,
  CheckCircle2,
  AlertCircle,
  Shuffle,
  Crop,
  ArrowLeft,
  ArrowRight,
  Maximize2,
  Layers,
  Link as LinkIcon,
  X,
  Check,
  RefreshCw,
  Sliders,
  Type,
  Bold,
  Wand2,
  GripVertical,
  MoveHorizontal
} from 'lucide-react';

interface QuestionEditorProps {
  questions: Question[];
  onChange: (updated: Question[]) => void;
  onShuffleQuestions?: (target?: 'B' | 'C') => void;
  currentGroup?: string;
  selectedQuestionId?: string;
  onSelectQuestionId?: (id: string) => void;
  header?: ExamHeader;
  layout?: PageLayoutSettings;
  onUpdateLayout?: (updated: PageLayoutSettings) => void;
  evaluationTable?: EvaluationTableSettings;
  signatures?: TeacherSignatureSettings;
}

export const QuestionEditor: React.FC<QuestionEditorProps> = ({
  questions,
  onChange,
  onShuffleQuestions,
  currentGroup,
  selectedQuestionId: controlledSelectedId,
  onSelectQuestionId,
  header,
  layout,
  onUpdateLayout,
  evaluationTable,
  signatures
}) => {
  const [internalSelectedId, setInternalSelectedId] = useState<string>(
    questions[0]?.id || ''
  );

  const selectedQuestionId = controlledSelectedId !== undefined ? controlledSelectedId : internalSelectedId;
  const setSelectedQuestionId = (id: string) => {
    setInternalSelectedId(id);
    if (onSelectQuestionId) {
      onSelectQuestionId(id);
    }
  };
  const [showSymbolPicker, setShowSymbolPicker] = useState<boolean>(false);
  const [textMode, setTextMode] = useState<'split' | 'single'>('split');
  const [activeTextTarget, setActiveTextTarget] = useState<'premise' | 'stem' | 'single'>('stem');
  const [selectedImageId, setSelectedImageId] = useState<string>('');
  const [isAddingUrl, setIsAddingUrl] = useState<boolean>(false);
  const [imageUrlInput, setImageUrlInput] = useState<string>('');
  const [showDiagramMenu, setShowDiagramMenu] = useState<boolean>(false);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);
  const singleTextareaRef = useRef<HTMLTextAreaElement>(null);

  const selectedQuestion = questions.find((q) => q.id === selectedQuestionId) || questions[0];

  const totalPoints = questions.reduce((sum, q) => sum + (Number(q.points) || 0), 0);

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    const updated = questions.map((q) => (q.id === id ? { ...q, ...updates } : q));
    onChange(updated);
  };

  // Resolving premise (normal font) and stem (bold font)
  const resolvedParts = selectedQuestion
    ? splitQuestionText(selectedQuestion.text || '')
    : { premise: '', stem: '' };

  const currentPremise =
    selectedQuestion?.premise !== undefined
      ? selectedQuestion.premise
      : resolvedParts.premise;

  const currentStem =
    selectedQuestion?.stem !== undefined
      ? selectedQuestion.stem
      : (resolvedParts.stem || selectedQuestion?.text || '');

  const handlePremiseChange = (newPremise: string) => {
    if (!selectedQuestion) return;
    const combined = [newPremise.trim(), currentStem.trim()].filter(Boolean).join('\n');
    updateQuestion(selectedQuestion.id, {
      premise: newPremise,
      stem: currentStem,
      text: combined
    });
  };

  const handleStemChange = (newStem: string) => {
    if (!selectedQuestion) return;
    const combined = [currentPremise.trim(), newStem.trim()].filter(Boolean).join('\n');
    updateQuestion(selectedQuestion.id, {
      premise: currentPremise,
      stem: newStem,
      text: combined
    });
  };

  const handleAutoSplit = () => {
    if (!selectedQuestion) return;
    const parts = splitQuestionText(selectedQuestion.text || '');
    updateQuestion(selectedQuestion.id, {
      premise: parts.premise,
      stem: parts.stem || selectedQuestion.text,
      text: selectedQuestion.text
    });
  };

  const handleSingleTextChange = (val: string) => {
    if (!selectedQuestion) return;
    const parts = splitQuestionText(val);
    updateQuestion(selectedQuestion.id, {
      text: val,
      premise: parts.premise,
      stem: parts.stem
    });
  };

  const handleWrapBoldInSingleText = () => {
    if (!selectedQuestion || !singleTextareaRef.current) return;
    const textarea = singleTextareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const fullText = selectedQuestion.text || '';
    if (start === end) {
      const newText = fullText.substring(0, start) + '**kalın metin**' + fullText.substring(end);
      handleSingleTextChange(newText);
    } else {
      const selected = fullText.substring(start, end);
      const newText = fullText.substring(0, start) + `**${selected}**` + fullText.substring(end);
      handleSingleTextChange(newText);
    }
  };

  const addEmptyQuestion = () => {
    const nextNumber = questions.length + 1;
    const newQ: Question = {
      id: `q-${Date.now()}`,
      number: nextNumber,
      text: `${nextNumber}. Soru öncülü...\nBuna göre sonucu bulunuz.`,
      premise: `${nextNumber}. Soru öncülü ve verileri buraya yazınız...`,
      stem: `Buna göre istenen sonucu işlem basamaklarını göstererek bulunuz.`,
      points: 10,
      answerSpace: {
        type: 'lined',
        lineCount: 5,
        showBorder: true,
        boxHeightPx: 95,
        hintText: 'Çözüm:'
      },
      solutionNotes: ''
    };
    const nextList = [...questions, newQ];
    onChange(nextList);
    setSelectedQuestionId(newQ.id);
  };

  const deleteQuestion = (id: string) => {
    if (questions.length <= 1) {
      alert('Sınavda en az bir soru bulunmalıdır.');
      return;
    }
    const filtered = questions
      .filter((q) => q.id !== id)
      .map((q, idx) => ({ ...q, number: idx + 1 }));
    onChange(filtered);
    if (selectedQuestionId === id) {
      setSelectedQuestionId(filtered[0]?.id || '');
    }
  };

  const duplicateQuestion = (q: Question) => {
    const newQ: Question = {
      ...q,
      id: `q-${Date.now()}`,
      number: questions.length + 1
    };
    const nextList = [...questions, newQ].map((item, idx) => ({ ...item, number: idx + 1 }));
    onChange(nextList);
    setSelectedQuestionId(newQ.id);
  };

  const reorderQuestion = (fromIndex: number, toIndex: number) => {
    if (
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= questions.length ||
      toIndex >= questions.length
    ) {
      return;
    }

    const list = [...questions];
    const [moved] = list.splice(fromIndex, 1);
    list.splice(toIndex, 0, moved);

    const renumbered = list.map((item, idx) => ({ ...item, number: idx + 1 }));
    onChange(renumbered);
    setSelectedQuestionId(moved.id);
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= questions.length) return;

    reorderQuestion(index, targetIndex);
  };

  // Equalize points to exactly 100
  const equalizePointsTo100 = () => {
    if (questions.length === 0) return;
    const base = Math.floor(100 / questions.length);
    const remainder = 100 - base * questions.length;

    const updated = questions.map((q, idx) => ({
      ...q,
      points: idx < remainder ? base + 1 : base
    }));
    onChange(updated);
  };

  const handleInsertSymbol = (sym: string) => {
    if (!selectedQuestion) return;
    if (textMode === 'single') {
      handleSingleTextChange((selectedQuestion.text || '') + sym);
    } else if (activeTextTarget === 'premise') {
      handlePremiseChange((currentPremise || '') + sym);
    } else {
      handleStemChange((currentStem || '') + sym);
    }
  };

  // Question images resolution
  const questionImages = selectedQuestion ? getQuestionImages(selectedQuestion) : [];
  const activeImage =
    questionImages.find((img) => img.id === selectedImageId) || questionImages[0] || null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedQuestion) return;

    const currentImages = getQuestionImages(selectedQuestion);
    const fileList = Array.from(files);

    const promises = fileList.map((file, idx) => {
      return new Promise<QuestionImage>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          resolve({
            id: `img-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
            url: dataUrl,
            alt: file.name || 'Soru Görseli',
            caption:
              currentImages.length + fileList.length > 1
                ? `Şekil ${currentImages.length + idx + 1}`
                : '',
            position: currentImages.length === 0 ? 'right' : 'below-text',
            size: 'medium',
            widthPercent: currentImages.length === 0 ? 40 : 45,
            aspectRatio: 'auto',
            objectFit: 'contain',
            showBorder: true
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then((newImages) => {
      const merged = [...currentImages, ...newImages];
      updateQuestion(selectedQuestion.id, {
        images: merged,
        image: merged[0]
      });
      setSelectedImageId(newImages[0]?.id || merged[0]?.id || '');
      if (fileInputRef.current) fileInputRef.current.value = '';
    });
  };

  const handleReplaceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedQuestion || !activeImage) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      updateActiveImageProps({
        url: dataUrl,
        alt: file.name
      });
      if (replaceFileInputRef.current) replaceFileInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  const handleAddDiagram = (key: keyof typeof QUESTION_DIAGRAMS, name: string) => {
    if (!selectedQuestion) return;
    const currentImages = getQuestionImages(selectedQuestion);
    const newImg: QuestionImage = {
      id: `diag-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      url: QUESTION_DIAGRAMS[key],
      alt: name,
      caption: name,
      position: currentImages.length === 0 ? 'right' : 'below-text',
      size: 'medium',
      widthPercent: currentImages.length === 0 ? 40 : 45,
      aspectRatio: 'auto',
      objectFit: 'contain',
      showBorder: true
    };
    const merged = [...currentImages, newImg];
    updateQuestion(selectedQuestion.id, {
      images: merged,
      image: merged[0]
    });
    setSelectedImageId(newImg.id || '');
    setShowDiagramMenu(false);
  };

  const updateActiveImageProps = (updates: Partial<QuestionImage>) => {
    if (!selectedQuestion || !activeImage) return;
    const currentImages = getQuestionImages(selectedQuestion);
    const updated = currentImages.map((img) =>
      img.id === activeImage.id ? { ...img, ...updates } : img
    );
    updateQuestion(selectedQuestion.id, {
      images: updated,
      image: updated[0]
    });
  };

  const handleDeleteImage = (imgId: string) => {
    if (!selectedQuestion) return;
    const currentImages = getQuestionImages(selectedQuestion);
    const filtered = currentImages.filter((img) => img.id !== imgId);
    updateQuestion(selectedQuestion.id, {
      images: filtered,
      image: filtered[0] || undefined
    });
    if (selectedImageId === imgId) {
      setSelectedImageId(filtered[0]?.id || '');
    }
  };

  const handleMoveImage = (index: number, direction: 'left' | 'right') => {
    if (!selectedQuestion) return;
    const currentImages = [...getQuestionImages(selectedQuestion)];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentImages.length) return;
    const [moved] = currentImages.splice(index, 1);
    currentImages.splice(targetIndex, 0, moved);
    updateQuestion(selectedQuestion.id, {
      images: currentImages,
      image: currentImages[0]
    });
  };

  const handleRemoveAllImages = () => {
    if (!selectedQuestion) return;
    updateQuestion(selectedQuestion.id, {
      images: [],
      image: undefined
    });
    setSelectedImageId('');
  };

  const handleAddUrlImage = () => {
    if (!selectedQuestion || !imageUrlInput.trim()) return;
    const currentImages = getQuestionImages(selectedQuestion);
    const newImg: QuestionImage = {
      id: `url-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      url: imageUrlInput.trim(),
      alt: 'Web Görseli',
      caption: currentImages.length > 0 ? `Şekil ${currentImages.length + 1}` : '',
      position: currentImages.length === 0 ? 'right' : 'below-text',
      size: 'medium',
      widthPercent: currentImages.length === 0 ? 40 : 45,
      aspectRatio: 'auto',
      objectFit: 'contain',
      showBorder: true
    };
    const merged = [...currentImages, newImg];
    updateQuestion(selectedQuestion.id, {
      images: merged,
      image: merged[0]
    });
    setSelectedImageId(newImg.id || '');
    setImageUrlInput('');
    setIsAddingUrl(false);
  };

  const togglePageBreakAfter = (qId: string) => {
    const targetQ = questions.find((q) => q.id === qId);
    if (!targetQ) return;
    updateQuestion(qId, {
      pageBreakAfter: !targetQ.pageBreakAfter
    });
  };

  const effectiveLayout: PageLayoutSettings = layout || {
    layoutMode: 'single-column',
    fontFamily: 'sans',
    fontSize: 'sm',
    showColumnDivider: true,
    showPageNumbers: true,
    compactSpacing: false,
    showSolutions: false,
    showContinuationHeader: true
  };
  const effectiveHeader: ExamHeader = header || {
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
  const effectiveEval: EvaluationTableSettings = evaluationTable || {
    enabled: false,
    showCommentBox: false,
    commentBoxLabel: ''
  };
  const effectiveSignatures: TeacherSignatureSettings = signatures || {
    enabled: false,
    instructionsText: '',
    teachers: [],
    showPrincipal: false,
    principalTitle: 'Okul Müdürü',
    principalName: ''
  };

  const computedPages = paginateQuestions(
    questions,
    effectiveLayout,
    effectiveHeader,
    effectiveEval,
    effectiveSignatures
  );

  return (
    <div className="space-y-4">
      {/* Puan Durumu ve Hızlı Aksiyonlar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          {totalPoints === 100 ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Toplam: 100 Puan (Tam)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              Toplam: {totalPoints} Puan
            </span>
          )}
          <span className="text-xs text-slate-400 font-medium">({questions.length} Soru)</span>
        </div>

        <div className="flex items-center gap-1.5">
          {onShuffleQuestions && (
            <div className="flex items-center gap-1">
              {currentGroup === 'C GRUBU' ? (
                <button
                  type="button"
                  onClick={() => onShuffleQuestions('C')}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                  title="A grubu sabit kalır, sadece C grubu sorularının yeri rastgele karıştırılır"
                >
                  <Shuffle className="w-3 h-3 text-emerald-600" />
                  <span>C'yi Karıştır</span>
                </button>
              ) : currentGroup === 'B GRUBU' ? (
                <button
                  type="button"
                  onClick={() => onShuffleQuestions('B')}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 rounded-lg border border-violet-200 transition-colors cursor-pointer"
                  title="A grubu sabit kalır, sadece B grubu sorularının yeri rastgele karıştırılır"
                >
                  <Shuffle className="w-3 h-3 text-violet-600" />
                  <span>B'yi Karıştır</span>
                </button>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onShuffleQuestions('B')}
                    className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 rounded-lg border border-violet-200 transition-colors cursor-pointer"
                    title="A grubu sabit kalır, B grubunun soruları rastgele karıştırılır"
                  >
                    <Shuffle className="w-3 h-3 text-violet-600" />
                    <span>B'yi Karıştır</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onShuffleQuestions('C')}
                    className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                    title="A grubu sabit kalır, C grubunun soruları rastgele karıştırılır"
                  >
                    <Shuffle className="w-3 h-3 text-emerald-600" />
                    <span>C'yi Karıştır</span>
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={equalizePointsTo100}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors cursor-pointer"
            title="Soruların puanlarını toplamı 100 olacak şekilde eşit paylaştırır"
          >
            <Calculator className="w-3 h-3" />
            100'e Eşitle
          </button>

          <button
            type="button"
            onClick={addEmptyQuestion}
            className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Soru Ekle
          </button>
        </div>
      </div>

      {/* Soru Seçici & Sıralama: Küçük A4 Sayfaları (Soruların Sayfadaki Alanı & Sadece Soru Numarası) */}
      <div className="space-y-2.5 bg-slate-100/80 p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700 px-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <div className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center text-[10px] font-mono shadow-2xs">
              A4
            </div>
            <span>Soru Seçici &amp; Sıralama (Küçük A4 Sayfaları)</span>
            <span className="text-[11px] text-slate-500 font-normal">
              ({questions.length} Soru • {computedPages.length} Sayfa)
            </span>
          </div>

          <div className="text-[10.5px] text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1.5">
            <MoveHorizontal className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>Sol okla (▲) soru numarası -1 düşer, sağ okla (▼) +1 eklenir. İsterseniz tutup sürükleyerek de sıralayabilirsiniz.</span>
          </div>
        </div>

        {/* Yan Yana Küçük A4 Sayfaları (Yatay Kaydırılabilir) */}
        <div className="flex gap-3.5 overflow-x-auto pb-2 pt-1 px-1 scrollbar-thin scroll-smooth items-stretch">
          {computedPages.map((page) => {
            const pageQuestions = page.questions;
            return (
              <div
                key={`page-${page.pageNumber}`}
                className="relative shrink-0 w-[190px] sm:w-[205px] h-[280px] bg-white rounded-xl border border-slate-300 shadow-xs flex flex-col p-2 select-none overflow-hidden transition-all duration-150 hover:shadow-md"
              >
                {/* Minyatür A4 Sayfa Üst Başlığı (Kompakt Çerçeve & Yan Yana Başlıklar) */}
                {page.isFirstPage ? (
                  <div className="shrink-0 border border-slate-300 rounded p-1 mb-1.5 bg-slate-50/90 text-center space-y-0.5">
                    <div className="text-[7.5px] font-black uppercase text-slate-900 truncate leading-tight">
                      {effectiveHeader.schoolName || 'İSTİKLAL ORTAOKULU'}
                    </div>
                    {/* 2026-2027 EĞİTİM VE ÖĞRETİM YILI - 1. DÖNEM 1. ORTAK YAZILI SINAVI (Yan Yana) */}
                    <div className="text-[6.5px] font-bold text-slate-600 truncate leading-tight flex items-center justify-center gap-0.5">
                      <span className="truncate">{effectiveHeader.academicYear || '2026-2027 EĞİTİM ÖĞRETİM YILI'}</span>
                      <span className="text-slate-400">-</span>
                      <span className="truncate">{effectiveHeader.termExam || '1. DÖNEM 1. ORTAK YAZILI'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="shrink-0 border-b border-slate-200 pb-0.5 mb-1.5 flex items-center justify-between text-[7.5px] font-bold text-slate-500">
                    <span className="bg-slate-100 px-1 py-0.2 rounded font-mono">{page.pageNumber}. SAYFA</span>
                    <span className="text-[6.5px] text-slate-400">MEB Ortak Sınav</span>
                  </div>
                )}

                {/* Soru Alanı: Soruların A4 Sayfasında Kapladığı Gerçek Alan & SADECE SORU NUMARASI */}
                <div className="flex-1 flex flex-col gap-1 overflow-hidden min-h-0">
                  {pageQuestions.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-[9px] text-slate-400 italic">
                      Bu sayfada soru yok
                    </div>
                  ) : (
                    pageQuestions.map((q) => {
                      const isSelected = selectedQuestion?.id === q.id;
                      const globalIdx = questions.findIndex((item) => item.id === q.id);
                      const isDragged = draggedIdx === globalIdx;
                      const isDragOver = dragOverIdx === globalIdx && draggedIdx !== globalIdx;
                      const qHeightWeight = estimateQuestionHeight(
                        q,
                        effectiveLayout.layoutMode === 'two-column',
                        effectiveLayout.fontSize
                      );

                      return (
                        <div
                          key={q.id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', String(globalIdx));
                            e.dataTransfer.effectAllowed = 'move';
                            setDraggedIdx(globalIdx);
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = 'move';
                            if (dragOverIdx !== globalIdx) {
                              setDragOverIdx(globalIdx);
                            }
                          }}
                          onDragEnter={() => {
                            setDragOverIdx(globalIdx);
                          }}
                          onDragLeave={() => {
                            if (dragOverIdx === globalIdx) {
                              setDragOverIdx(null);
                            }
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            const fromStr = e.dataTransfer.getData('text/plain');
                            const fromIdx = fromStr !== '' ? parseInt(fromStr, 10) : draggedIdx;
                            if (fromIdx !== null && !isNaN(fromIdx) && fromIdx !== globalIdx) {
                              reorderQuestion(fromIdx, globalIdx);
                            }
                            setDraggedIdx(null);
                            setDragOverIdx(null);
                          }}
                          onDragEnd={() => {
                            setDraggedIdx(null);
                            setDragOverIdx(null);
                          }}
                          onClick={() => {
                            setSelectedQuestionId(q.id);
                            onSelectQuestionId?.(q.id);
                          }}
                          style={{
                            flex: `${Math.max(1, qHeightWeight)} 1 0%`
                          }}
                          className={`relative rounded-md cursor-pointer transition-all duration-150 select-none flex flex-col items-center justify-center border ${
                            isSelected
                              ? 'border-2 border-indigo-600 bg-indigo-50/90 text-indigo-700 shadow-2xs ring-1 ring-indigo-400/50'
                              : 'border-dashed border-slate-300 bg-slate-50/60 hover:bg-indigo-50/30 hover:border-indigo-400 text-slate-800'
                          } ${
                            isDragged ? 'opacity-35 scale-95 border-dashed border-indigo-500' : ''
                          } ${
                            isDragOver ? 'border-2 border-violet-500 bg-violet-100 text-violet-800 scale-102 shadow-md z-10' : ''
                          }`}
                          title={`Soru ${q.number} (${q.points} Puan)\n• Düzenlemek için tıklayın\n• Yerini değiştirmek için tutup sürükleyin (Örn: 1. soruyu 3. soruya taşıyın)`}
                        >
                          {/* SADECE SORU NUMARASI VE SOLUNDA YUKARI OK (-1), SAĞINDA AŞAĞI OK (+1) BUTONLARI */}
                          <div className="flex items-center justify-center gap-1.5 w-full px-1">
                            {/* Sol: Yukarı Ok Butonu (-1 Soru Düşür / Sırasını Bir Önceki Yap) */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveQuestion(globalIdx, 'up');
                              }}
                              disabled={globalIdx <= 0}
                              className={`shrink-0 w-4 h-4 rounded flex items-center justify-center transition-all cursor-pointer ${
                                globalIdx <= 0
                                  ? 'opacity-20 cursor-not-allowed text-slate-400'
                                  : 'bg-white/90 hover:bg-indigo-600 text-slate-700 hover:text-white border border-slate-300 shadow-2xs hover:border-indigo-600 active:scale-95'
                              }`}
                              title={
                                globalIdx <= 0
                                  ? 'İlk soru (daha yukarı taşınamaz)'
                                  : `Soru ${q.number}'nin numarasını 1 düşür (-1 Soru / ${q.number - 1}. Soru yap)`
                              }
                            >
                              <ChevronUp className="w-3 h-3 stroke-[2.5]" />
                            </button>

                            {/* Ortada Soru Numarası */}
                            <div className="flex flex-col items-center justify-center pointer-events-none min-w-[20px]">
                              <span
                                className={`font-black text-sm md:text-base leading-none tracking-tight ${
                                  isSelected ? 'text-indigo-700 font-black' : 'text-slate-800 font-extrabold'
                                }`}
                              >
                                {q.number}
                              </span>
                              {isSelected && (
                                <span className="text-[7.5px] font-bold text-indigo-600 mt-0.5 tracking-tight leading-none">
                                  Seçili
                                </span>
                              )}
                            </div>

                            {/* Sağ: Aşağı Ok Butonu (+1 Soru Ekle / Sırasını Bir Sonraki Yap) */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveQuestion(globalIdx, 'down');
                              }}
                              disabled={globalIdx >= questions.length - 1}
                              className={`shrink-0 w-4 h-4 rounded flex items-center justify-center transition-all cursor-pointer ${
                                globalIdx >= questions.length - 1
                                  ? 'opacity-20 cursor-not-allowed text-slate-400'
                                  : 'bg-white/90 hover:bg-indigo-600 text-slate-700 hover:text-white border border-slate-300 shadow-2xs hover:border-indigo-600 active:scale-95'
                              }`}
                              title={
                                globalIdx >= questions.length - 1
                                  ? 'Son soru (daha aşağı taşınamaz)'
                                  : `Soru ${q.number}'nin numarasına +1 ekle (+1 Soru / ${q.number + 1}. Soru yap)`
                              }
                            >
                              <ChevronDown className="w-3 h-3 stroke-[2.5]" />
                            </button>
                          </div>

                          {/* Sayfa Sonu Rozeti (varsa ince alt çizgi) */}
                          {q.pageBreakAfter && (
                            <div
                              className="absolute bottom-0 inset-x-0 h-1 bg-amber-400/90 rounded-b"
                              title="Bu sorudan sonra sayfa sonu var"
                            />
                          )}

                          {/* Drag-Over Drop Göstergesi */}
                          {isDragOver && (
                            <div className="absolute inset-0 bg-violet-600/95 text-white rounded-md flex flex-col items-center justify-center z-20 animate-in fade-in duration-100">
                              <span className="text-[9px] font-bold">{globalIdx + 1}. Soru Ol</span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Minyatür A4 Sayfa Alt Numarası ve Bu Sayfa İçin Sütun/Düzen Seçici */}
                <div className="shrink-0 pt-1 mt-1 border-t border-slate-100 flex items-center justify-between text-[7.5px] text-slate-500 font-mono">
                  <span className="font-bold">{page.pageNumber}. Sayfa ({pageQuestions.length} Soru)</span>
                  {onUpdateLayout && (
                    <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded border border-slate-200">
                      {[
                        { id: 'two-column', label: 'Çift', title: 'Çift Sütunlu Sayfa' },
                        { id: 'single-column', label: 'Tek', title: 'Tek Sütunlu Sayfa' },
                        { id: 'two-exams-a4', label: '2Kp', title: 'A4 2 Kopya (Yatay)' }
                      ].map((opt) => {
                        const isCurrent = (page.layoutMode || effectiveLayout.layoutMode) === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const newOverrides = { ...(effectiveLayout.pageLayoutOverrides || {}) };
                              if (opt.id === effectiveLayout.layoutMode) {
                                delete newOverrides[page.pageNumber];
                              } else {
                                newOverrides[page.pageNumber] = opt.id as any;
                              }
                              onUpdateLayout({
                                ...effectiveLayout,
                                pageLayoutOverrides: newOverrides
                              });
                            }}
                            className={`px-1 py-0.2 rounded transition-colors text-[7px] cursor-pointer ${
                              isCurrent
                                ? 'bg-indigo-600 text-white font-bold'
                                : 'text-slate-600 hover:bg-slate-200'
                            }`}
                            title={`${page.pageNumber}. Sayfa: ${opt.title}`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Yeni Soru Ekle Minyatür Kartı (A4 Boyutunda) */}
          <div
            onClick={addEmptyQuestion}
            className="shrink-0 w-[110px] sm:w-[120px] h-[280px] rounded-xl border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-white/70 hover:bg-indigo-50/40 text-slate-400 hover:text-indigo-600 cursor-pointer flex flex-col items-center justify-center gap-2 transition-all p-3 text-center group shadow-2xs"
            title="Sınavın sonuna yeni bir boş soru ekle"
          >
            <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white text-slate-500 flex items-center justify-center transition-colors shadow-2xs border border-slate-200 group-hover:border-indigo-600">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-700 group-hover:text-indigo-700">
                Soru Ekle
              </span>
              <span className="block text-[9.5px] text-slate-400 group-hover:text-indigo-500/80">
                +{questions.length + 1}. Soru
              </span>
            </div>
          </div>
        </div>

        {/* Seçili Soru Hızlı Sıralama & Taşıma Çubuğu (Örn: 1. Soruyu 3. Sıraya Taşı) */}
        {selectedQuestion && (
          <div className="bg-white px-3 py-2 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-2xs">
                {selectedQuestion.number}
              </span>
              <div className="flex flex-col">
                <span className="font-bold text-slate-800 leading-tight">
                  Soru {selectedQuestion.number}
                </span>
                <span className="text-[10px] text-slate-500">
                  {selectedQuestion.points} Puan • {selectedQuestion.answerSpace?.lineCount || 5} Satır
                </span>
              </div>
            </div>

            {/* Hızlı Sıra Değiştirici: Dropdown & Butonlar */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                <span className="text-[11px] font-semibold text-slate-600">Sıraya Taşı:</span>
                <select
                  value={questions.findIndex((item) => item.id === selectedQuestion.id)}
                  onChange={(e) => {
                    const currentIdx = questions.findIndex((item) => item.id === selectedQuestion.id);
                    const targetIdx = parseInt(e.target.value, 10);
                    if (!isNaN(targetIdx) && targetIdx !== currentIdx) {
                      reorderQuestion(currentIdx, targetIdx);
                    }
                  }}
                  className="text-xs font-bold text-indigo-700 bg-white border border-slate-300 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  title="Seçili soruyu doğrudan istediğiniz soru sırasına taşır (Örn: 1'den 3'e)"
                >
                  {questions.map((_, i) => (
                    <option key={i} value={i}>
                      {i + 1}. Sıraya ({i + 1})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={questions.findIndex((item) => item.id === selectedQuestion.id) === 0}
                  onClick={() => {
                    const idx = questions.findIndex((item) => item.id === selectedQuestion.id);
                    if (idx > 0) moveQuestion(idx, 'up');
                  }}
                  className="px-2 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center gap-0.5"
                  title="Bir önceki soruyla yer değiştir"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Öne</span>
                </button>
                <button
                  type="button"
                  disabled={questions.findIndex((item) => item.id === selectedQuestion.id) === questions.length - 1}
                  onClick={() => {
                    const idx = questions.findIndex((item) => item.id === selectedQuestion.id);
                    if (idx < questions.length - 1) moveQuestion(idx, 'down');
                  }}
                  className="px-2 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center gap-0.5"
                  title="Bir sonraki soruyla yer değiştir"
                >
                  <span>Sonra</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => togglePageBreakAfter(selectedQuestion.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors cursor-pointer flex items-center gap-1 ${
                  selectedQuestion.pageBreakAfter
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                }`}
                title="Bu sorudan sonra yeni sayfaya geçişi aç/kapat"
              >
                <span>✂️</span>
                <span>{selectedQuestion.pageBreakAfter ? 'Sayfa Sonu Var' : 'Sayfa Sonu'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Seçili Soru Detay Düzenleyicisi */}
      {selectedQuestion && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
          {/* Soru Üst Başlığı & Kontroller */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                #{selectedQuestion.number}
              </span>
              <h3 className="font-semibold text-slate-800 text-sm">
                Soru {selectedQuestion.number} Düzenlemesi
              </h3>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Doğrudan Sıra Seçici (Örn: 1. soruyu 3. soru yap) */}
              <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200 text-xs text-slate-600">
                <span className="text-[10.5px] font-medium text-slate-500">Konum:</span>
                <select
                  value={questions.findIndex((q) => q.id === selectedQuestion.id)}
                  onChange={(e) => {
                    const currentIdx = questions.findIndex((q) => q.id === selectedQuestion.id);
                    reorderQuestion(currentIdx, Number(e.target.value));
                  }}
                  className="bg-transparent font-bold text-indigo-700 outline-none cursor-pointer text-xs py-0.5"
                  title="Sorunun sınavdaki sırasını doğrudan değiştirin (Örn: 1. soruyu 3. soru yap)"
                >
                  {questions.map((_, i) => (
                    <option key={i} value={i}>
                      {i + 1}. Soru Yap
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    const idx = questions.findIndex((q) => q.id === selectedQuestion.id);
                    moveQuestion(idx, 'up');
                  }}
                  disabled={questions.findIndex((q) => q.id === selectedQuestion.id) === 0}
                  className="p-1 hover:bg-slate-100 rounded text-slate-500 disabled:opacity-30"
                  title="Yukarı taşı"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const idx = questions.findIndex((q) => q.id === selectedQuestion.id);
                    moveQuestion(idx, 'down');
                  }}
                  disabled={questions.findIndex((q) => q.id === selectedQuestion.id) === questions.length - 1}
                  className="p-1 hover:bg-slate-100 rounded text-slate-500 disabled:opacity-30"
                  title="Aşağı taşı"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => duplicateQuestion(selectedQuestion)}
                className="p-1 hover:bg-slate-100 rounded text-slate-600"
                title="Soruyu çoğalt"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => deleteQuestion(selectedQuestion.id)}
                className="p-1 hover:bg-red-50 rounded text-red-600 ml-1"
                title="Soruyu sil"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Soru Puanı ve Ders Kategorisi */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Soru Puan Değeri</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={selectedQuestion.points}
                  onChange={(e) =>
                    updateQuestion(selectedQuestion.id, { points: Math.max(1, Number(e.target.value)) })
                  }
                  className="w-24 px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-800 font-bold focus:ring-2 focus:ring-indigo-500"
                  min="1"
                  max="100"
                />
                <span className="text-slate-500 font-medium">Puan</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Öğrenim Çıktısı (Kazanım)
              </label>
              <input
                type="text"
                value={selectedQuestion.subject || ''}
                onChange={(e) => updateQuestion(selectedQuestion.id, { subject: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Örn: MAT.10.1.1 veya Fonksiyon kavramını açıklar..."
              />
            </div>
          </div>

          {/* Soru Metni & Açıklaması (Öncül Normal, Soru Kökü Kalın) */}
          <div className="space-y-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
            {/* Üst Başlık, Mod Butonları & Sembol Ekle */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs pb-2 border-b border-slate-200/80">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">Soru Metni & Açıklaması</span>
                <span className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded font-medium">
                  Öncül Normal • Kök Kalın
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Mod Seçici: Ayrılmış (Öncül & Kök) vs Tek Metin */}
                <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setTextMode('split')}
                    className={`px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer ${
                      textMode === 'split'
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Öncül metnini ve soru kökünü ayrı yönetin (Öncül normal, soru kökü kalın olur)"
                  >
                    Öncül & Soru Kökü
                  </button>
                  <button
                    type="button"
                    onClick={() => setTextMode('single')}
                    className={`px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer ${
                      textMode === 'single'
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Tüm metni tek bir kutuda düzenleyin"
                  >
                    Tek Metin
                  </button>
                </div>

                {/* Sembol Ekle Butonu (Varsayılan Olarak Gizli) */}
                <button
                  type="button"
                  onClick={() => setShowSymbolPicker(!showSymbolPicker)}
                  className={`text-[11px] font-semibold px-2 py-1 rounded-lg border flex items-center gap-1 transition-all cursor-pointer ${
                    showSymbolPicker
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 hover:text-indigo-600'
                  }`}
                  title="Matematiksel ve bilimsel sembol klavyesini aç / kapat"
                >
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  <span>{showSymbolPicker ? 'Sembolleri Gizle' : 'Sembol Ekle'}</span>
                </button>
              </div>
            </div>

            {/* İhtiyaç Halinde Açılan Sembol Klavyesi */}
            {showSymbolPicker && (
              <div className="animate-in fade-in duration-200">
                <SymbolPicker onInsertSymbol={handleInsertSymbol} />
              </div>
            )}

            {/* 1. Ayrılmış Mod (Öncül Normal, Soru Kökü Kalın) */}
            {textMode === 'split' ? (
              <div className="space-y-3">
                {/* Soru Öncülü (Normal Yazı Tipi) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                      <span>Soru Öncülü / Bilgi Metni (Normal Font)</span>
                    </label>
                    <span className="text-[10px] text-slate-500 italic">
                      Problem durumu, açıklamalar, veriler
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={currentPremise}
                    onFocus={() => setActiveTextTarget('premise')}
                    onChange={(e) => handlePremiseChange(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-800 text-xs font-normal focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white leading-relaxed"
                    placeholder="Örn: Yandaki şekilde verilen ABC dik üçgeninde |AB| = 6 cm ve |BC| = 8 cm'dir..."
                  />
                </div>

                {/* Soru Kökü (Kalın / Vurgulu Yazı Tipi) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-slate-950 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                      <span>Soru Kökü (Kalın / Vurgulu Font)</span>
                    </label>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      Baskıda Kalın Basılır
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={currentStem}
                    onFocus={() => setActiveTextTarget('stem')}
                    onChange={(e) => handleStemChange(e.target.value)}
                    className="w-full p-2.5 border-2 border-indigo-200 focus:border-indigo-500 rounded-lg text-slate-950 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-indigo-50/20 leading-relaxed"
                    placeholder="Örn: Buna göre |AC| = x hipotenüs uzunluğunu Pisagor teoremini uygulayarak bulunuz."
                  />
                </div>

                {/* Hızlı Aksiyon: Otomatik Ayır Butonu */}
                {selectedQuestion.text && !selectedQuestion.premise && (
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={handleAutoSplit}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-semibold hover:underline cursor-pointer"
                      title="Mevcut metni 'Buna göre' ifadesinden otomatik olarak öncül ve soru köküne ayır"
                    >
                      <Wand2 className="w-3 h-3 text-indigo-500" />
                      <span>Metni 'Buna göre'den Otomatik Ayır</span>
                    </button>
                  </div>
                )}

                {/* Kağıttaki Canlı Görünüm Önizleme Kutusu */}
                <div className="p-2.5 bg-slate-100 rounded-lg border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[10.5px] font-bold text-slate-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3 text-slate-500" />
                      <span>Kağıttaki Tipografik Görünüm:</span>
                    </span>
                    <span className="text-[9.5px] text-slate-400 font-normal">
                      Öncül normal, soru kökü kalın
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-md border border-slate-200 shadow-2xs space-y-1 text-[11.5px] leading-relaxed">
                    {currentPremise && (
                      <div className="font-normal text-slate-800 whitespace-pre-line">
                        {currentPremise}
                      </div>
                    )}
                    {currentStem && (
                      <div className="font-bold text-slate-950 whitespace-pre-line">
                        {currentStem}
                      </div>
                    )}
                    {!currentPremise && !currentStem && (
                      <div className="text-slate-400 italic text-[11px]">
                        Yukarıdaki kutulara öncül ve soru kökünü yazabilirsiniz...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* 2. Tek Metin Modu */
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500">
                    İstediğiniz kısmı seçip <strong>Kalın Yap</strong> butonuna tıklayabilirsiniz.
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleWrapBoldInSingleText}
                      className="px-2 py-0.5 rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                      title="Seçili metni kalın yapar (**kalın metin**)"
                    >
                      <Bold className="w-3 h-3" />
                      <span>Kalın Yap</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleAutoSplit();
                        setTextMode('split');
                      }}
                      className="px-2 py-0.5 rounded border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] flex items-center gap-1 font-semibold cursor-pointer"
                      title="Öncül ve soru kökünü ayrı alanlara aktarır"
                    >
                      <Wand2 className="w-3 h-3" />
                      <span>Ayrı Moda Geç</span>
                    </button>
                  </div>
                </div>

                <textarea
                  ref={singleTextareaRef}
                  rows={4}
                  value={selectedQuestion.text}
                  onFocus={() => setActiveTextTarget('single')}
                  onChange={(e) => handleSingleTextChange(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-800 text-xs font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed bg-white"
                  placeholder="Sorunuzu yazınız... Kalın yapmak istediğiniz kelimeleri **kalın** şeklinde yazabilirsiniz."
                />
              </div>
            )}
          </div>

          {/* Soru Görselleri / Şemaları Stüdyosu */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
            {/* Başlık ve Hızlı Aksiyonlar */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
              <div className="flex items-center gap-2 font-semibold text-slate-800">
                <div className="p-1.5 rounded-md bg-indigo-100 text-indigo-700">
                  <ImageIcon className="w-3.5 h-3.5" />
                </div>
                <span>Soru Görselleri & Şemaları</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    questionImages.length > 0
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {questionImages.length > 0
                    ? `${questionImages.length} Görsel`
                    : 'Görsel Yok'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium text-[11px] flex items-center gap-1 shadow-2xs transition-colors"
                  title="Bilgisayardan bir veya birden fazla görsel ekle"
                >
                  <Plus className="w-3 h-3" />
                  <span>Görsel Yükle</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowDiagramMenu(!showDiagramMenu)}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium border transition-colors flex items-center gap-1 ${
                    showDiagramMenu
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <Layers className="w-3 h-3 text-amber-600" />
                  <span>Hazır Şema</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAddingUrl(!isAddingUrl)}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium border transition-colors flex items-center gap-1 ${
                    isAddingUrl
                      ? 'bg-sky-100 text-sky-800 border-sky-300'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                  title="Web'den resim URL adresi ekle"
                >
                  <LinkIcon className="w-3 h-3 text-sky-600" />
                  <span>URL</span>
                </button>

                {questionImages.length > 0 && (
                  <button
                    type="button"
                    onClick={handleRemoveAllImages}
                    className="p-1 hover:bg-red-50 text-red-600 rounded transition-colors"
                    title="Bu sorudaki tüm görselleri kaldır"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Gizli Dosya Girişleri */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              multiple
              className="hidden"
            />
            <input
              type="file"
              ref={replaceFileInputRef}
              onChange={handleReplaceImageUpload}
              accept="image/*"
              className="hidden"
            />

            {/* Hazır Şema Seçim Menüsü */}
            {showDiagramMenu && (
              <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-amber-900 text-[11px] flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    Hazır Vektörel Şema Ekle:
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowDiagramMenu(false)}
                    className="text-amber-700 hover:text-amber-900 p-0.5 rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {[
                    { key: 'rightTriangle', name: 'Dik Üçgen (Geometri)' },
                    { key: 'physicsCircuit', name: 'Elektrik Devresi (Fizik)' },
                    { key: 'cartesianPlane', name: 'Koordinat Düzlemi' },
                    { key: 'barChart', name: 'Sütun Grafiği' },
                    { key: 'numberLine', name: 'Sayı Doğrusu' }
                  ].map((diag) => (
                    <button
                      key={diag.key}
                      type="button"
                      onClick={() => handleAddDiagram(diag.key as any, diag.name)}
                      className="px-2 py-1.5 bg-white hover:bg-amber-100/80 border border-amber-200 rounded text-left text-[11px] text-amber-950 font-medium transition-colors flex items-center gap-1.5 shadow-2xs"
                    >
                      <Plus className="w-3 h-3 text-amber-600 shrink-0" />
                      <span className="truncate">{diag.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Web URL Girişi */}
            {isAddingUrl && (
              <div className="p-2.5 bg-sky-50 border border-sky-200 rounded-lg flex items-center gap-2">
                <input
                  type="url"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="https://example.com/resim.png"
                  className="flex-1 px-2.5 py-1.5 bg-white border border-sky-300 rounded text-slate-800 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddUrlImage();
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddUrlImage}
                  disabled={!imageUrlInput.trim()}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded font-medium text-xs shadow-2xs"
                >
                  Ekle
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingUrl(false)}
                  className="p-1.5 text-slate-500 hover:text-slate-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Görsel Yoksa Boş Durum */}
            {questionImages.length === 0 ? (
              <div className="p-4 bg-white border border-dashed border-slate-300 rounded-xl text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-xs">
                    Bu soruya görsel veya şema eklenmemiş
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Birden fazla görsel yükleyebilir, en-boy oranlarını ve sığdırma modlarını dilediğiniz gibi ayarlayabilirsiniz.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-xs flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Resim Yükle (Tek veya Çoklu)
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDiagramMenu(true)}
                    className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-lg font-medium text-xs flex items-center gap-1.5"
                  >
                    <Layers className="w-3.5 h-3.5 text-amber-600" />
                    Hazır Şablon Şema Seç
                  </button>
                </div>
              </div>
            ) : (
              /* Görseller Varsa: Çoklu Görsel Şeridi + Aktif Görsel Ayar Stüdyosu */
              <div className="space-y-3">
                {/* Çoklu Görsel Şeridi (Thumbnails & Ordering) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-medium">Sorudaki Görseller (Düzenlemek için seçiniz):</span>
                    <span>{questionImages.length} adet görsel</span>
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
                    {questionImages.map((img, idx) => {
                      const isActive = activeImage?.id === img.id;
                      return (
                        <div
                          key={img.id || idx}
                          onClick={() => setSelectedImageId(img.id || '')}
                          className={`group relative shrink-0 p-1.5 rounded-lg border cursor-pointer transition-all flex items-center gap-2 ${
                            isActive
                              ? 'bg-indigo-50/80 border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs'
                              : 'bg-white hover:bg-slate-100/80 border-slate-200'
                          }`}
                        >
                          {/* Mini Thumbnail */}
                          <div className="w-12 h-10 bg-slate-100 rounded border border-slate-200/80 overflow-hidden flex items-center justify-center">
                            <img
                              src={img.url}
                              alt={img.alt || `Görsel ${idx + 1}`}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>

                          {/* Bilgi */}
                          <div className="text-left pr-1 min-w-[70px]">
                            <div className="flex items-center gap-1">
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                  isActive
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-200 text-slate-700'
                                }`}
                              >
                                #{idx + 1}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                %{img.widthPercent || 40}
                              </span>
                            </div>
                            <span className="text-[10.5px] font-medium text-slate-700 truncate block max-w-[85px] mt-0.5">
                              {img.caption || `Görsel ${idx + 1}`}
                            </span>
                          </div>

                          {/* Sıralama ve Silme Hızlı Düğmeleri */}
                          <div className="flex flex-col gap-0.5 opacity-70 group-hover:opacity-100">
                            {questionImages.length > 1 && (
                              <div className="flex gap-0.5">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMoveImage(idx, 'left');
                                  }}
                                  className="p-0.5 hover:bg-slate-200 rounded disabled:opacity-20 text-slate-600"
                                  title="Sola taşı"
                                >
                                  <ArrowLeft className="w-2.5 h-2.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === questionImages.length - 1}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMoveImage(idx, 'right');
                                  }}
                                  className="p-0.5 hover:bg-slate-200 rounded disabled:opacity-20 text-slate-600"
                                  title="Sağa taşı"
                                >
                                  <ArrowRight className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteImage(img.id || '');
                              }}
                              className="p-0.5 hover:bg-red-100 text-red-600 rounded"
                              title="Bu görseli kaldır"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Başka Görsel Ekle Butonu */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="shrink-0 h-[52px] px-3 bg-white hover:bg-indigo-50 border border-dashed border-indigo-300 hover:border-indigo-500 rounded-lg text-indigo-700 text-[11px] font-medium flex items-center gap-1.5 transition-colors"
                      title="Yeni görsel ekle"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Görsel Ekle</span>
                    </button>
                  </div>
                </div>

                {/* Aktif Görsel Detaylı Ayar Stüdyosu */}
                {activeImage && (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-3 shadow-2xs">
                    {/* Önizleme & Hızlı Bilgi Şeridi */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        {/* Canlı Oran Önizleme Çerçevesi */}
                        <div
                          style={{
                            aspectRatio:
                              activeImage.aspectRatio &&
                              activeImage.aspectRatio !== 'auto' &&
                              activeImage.aspectRatio !== 'custom'
                                ? activeImage.aspectRatio.replace(':', '/')
                                : undefined,
                            height:
                              activeImage.aspectRatio === 'custom' &&
                              activeImage.customHeightPx
                                ? `${Math.min(60, activeImage.customHeightPx)}px`
                                : undefined
                          }}
                          className="w-16 h-14 bg-slate-50 border border-slate-300 rounded p-0.5 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs"
                        >
                          <img
                            src={activeImage.url}
                            alt="Önizleme"
                            style={{
                              aspectRatio:
                                activeImage.aspectRatio &&
                                activeImage.aspectRatio !== 'auto' &&
                                activeImage.aspectRatio !== 'custom'
                                  ? activeImage.aspectRatio.replace(':', '/')
                                  : undefined
                            }}
                            className={`max-h-full max-w-full ${
                              activeImage.objectFit === 'cover'
                                ? 'object-cover'
                                : activeImage.objectFit === 'fill'
                                ? 'object-fill'
                                : 'object-contain'
                            }`}
                          />
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-800 text-xs">
                              {activeImage.caption || 'Seçili Görsel Ayarları'}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold">
                              Oran: {activeImage.aspectRatio || 'Orijinal'}
                            </span>
                          </div>
                          <p className="text-[10.5px] text-slate-500 mt-0.5">
                            Genişlik: %{activeImage.widthPercent || 40} &bull; Konum:{' '}
                            {activeImage.position === 'right'
                              ? 'Sağda'
                              : activeImage.position === 'top'
                              ? 'En Üstte'
                              : 'Metnin Altında'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => replaceFileInputRef.current?.click()}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium flex items-center gap-1 transition-colors"
                          title="Bu görselin yerine başka bir dosya seç"
                        >
                          <RefreshCw className="w-3 h-3 text-slate-500" />
                          <span>Resmi Değiştir</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(activeImage.id || '')}
                          className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded text-[11px] font-medium flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3 h-3 text-red-500" />
                          <span>Sil</span>
                        </button>
                      </div>
                    </div>

                    {/* 1. EN - BOY ORANI (ASPECT RATIO) SEÇİMİ (Kullanıcı Talebi) */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="font-semibold text-slate-800 flex items-center gap-1.5 text-[11px]">
                          <Crop className="w-3.5 h-3.5 text-indigo-600" />
                          <span>En / Boy Oranı (Aspect Ratio)</span>
                        </label>
                        <span className="text-[10.5px] text-slate-400">
                          {activeImage.aspectRatio === 'auto' || !activeImage.aspectRatio
                            ? 'Orijinal doğal oran korunuyor'
                            : `${activeImage.aspectRatio} formatında sabitlendi`}
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { id: 'auto', label: 'Orijinal (Auto)', desc: 'Doğal' },
                          { id: '1/1', label: '1:1 Kare', desc: 'Kare' },
                          { id: '4/3', label: '4:3 Şema', desc: 'Standart' },
                          { id: '16/9', label: '16:9 Geniş', desc: 'Geniş' },
                          { id: '3/2', label: '3:2 Fotoğraf', desc: 'Klasik' },
                          { id: '2/1', label: '2:1 Şerit', desc: 'Yatay' },
                          { id: '3/4', label: '3:4 Dikey', desc: 'Dikey' },
                          { id: 'custom', label: 'Özel Yükseklik', desc: 'Serbest' }
                        ].map((ratio) => {
                          const isSelected =
                            (activeImage.aspectRatio || 'auto') === ratio.id ||
                            (ratio.id === '1/1' && activeImage.aspectRatio === '1:1') ||
                            (ratio.id === '4/3' && activeImage.aspectRatio === '4:3') ||
                            (ratio.id === '16/9' && activeImage.aspectRatio === '16:9');
                          return (
                            <button
                              key={ratio.id}
                              type="button"
                              onClick={() =>
                                updateActiveImageProps({
                                  aspectRatio: ratio.id as any
                                })
                              }
                              className={`px-2 py-1.5 rounded-lg border text-left transition-all ${
                                isSelected
                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs font-bold'
                                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                              }`}
                            >
                              <div className="text-[11px] truncate">{ratio.label}</div>
                              <div
                                className={`text-[9.5px] truncate ${
                                  isSelected ? 'text-indigo-100' : 'text-slate-400'
                                }`}
                              >
                                {ratio.desc}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Özel Yükseklik Seçilmişse Slider */}
                      {activeImage.aspectRatio === 'custom' && (
                        <div className="mt-2 p-2 bg-indigo-50/70 rounded-lg border border-indigo-200 flex items-center justify-between gap-3">
                          <span className="text-[11px] font-medium text-indigo-950 shrink-0">
                            Sabit Yükseklik (px):
                          </span>
                          <input
                            type="range"
                            min="50"
                            max="260"
                            step="5"
                            value={activeImage.customHeightPx || 120}
                            onChange={(e) =>
                              updateActiveImageProps({
                                customHeightPx: Number(e.target.value)
                              })
                            }
                            className="flex-1 accent-indigo-600"
                          />
                          <span className="text-[11px] font-mono font-bold text-indigo-700 shrink-0">
                            {activeImage.customHeightPx || 120} px
                          </span>
                        </div>
                      )}
                    </div>

                    {/* 2. GÖRSEL SIĞDIRMA (OBJECT FIT) */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <Maximize2 className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Görsel Sığdırma (Object Fit)</span>
                        </span>
                        <span className="text-slate-400 text-[10px]">
                          Şema ve formüller için 'Tam Sığdır' tavsiye edilir
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          {
                            id: 'contain',
                            label: 'Tam Sığdır (Kırpmasız)',
                            desc: 'Şema bozulmaz'
                          },
                          {
                            id: 'cover',
                            label: 'Doldur (Kırparak)',
                            desc: 'Alanı kaplar'
                          },
                          {
                            id: 'fill',
                            label: 'Uzat / Ger',
                            desc: 'Orana göre yayar'
                          }
                        ].map((fit) => {
                          const isSelected = (activeImage.objectFit || 'contain') === fit.id;
                          return (
                            <button
                              key={fit.id}
                              type="button"
                              onClick={() =>
                                updateActiveImageProps({
                                  objectFit: fit.id as any
                                })
                              }
                              className={`px-2 py-1.5 rounded-lg border text-left transition-all ${
                                isSelected
                                  ? 'bg-slate-900 text-white border-slate-900 font-semibold shadow-2xs'
                                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                              }`}
                            >
                              <div className="text-[11px]">{fit.label}</div>
                              <div
                                className={`text-[9.5px] ${
                                  isSelected ? 'text-slate-300' : 'text-slate-400'
                                }`}
                              >
                                {fit.desc}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 3. KONUM & GENİŞLİK AYARI */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                      {/* Konum */}
                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-slate-700">
                          Sayfadaki Konum
                        </label>
                        <div className="flex gap-1">
                          {[
                            { id: 'right', label: 'Sağda (Metin Yanı)' },
                            { id: 'below-text', label: 'Metnin Altında' },
                            { id: 'top', label: 'En Üstte' }
                          ].map((pos) => {
                            const isSelected = activeImage.position === pos.id;
                            return (
                              <button
                                key={pos.id}
                                type="button"
                                onClick={() =>
                                  updateActiveImageProps({
                                    position: pos.id as any
                                  })
                                }
                                className={`flex-1 px-2 py-1.5 rounded-lg border text-[11px] font-medium transition-all ${
                                  isSelected
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                                }`}
                              >
                                {pos.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Genişlik % */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <label className="font-semibold text-slate-700">
                            Genişlik Oranı
                          </label>
                          <span className="font-mono font-bold text-indigo-700">
                            %{activeImage.widthPercent || 40}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="15"
                            max="100"
                            step="5"
                            value={activeImage.widthPercent || 40}
                            onChange={(e) =>
                              updateActiveImageProps({
                                widthPercent: Number(e.target.value)
                              })
                            }
                            className="flex-1 accent-indigo-600"
                          />
                        </div>
                        {/* Hızlı Önayar Butonları */}
                        <div className="flex gap-1 justify-between pt-0.5">
                          {[25, 35, 45, 60, 75, 100].map((pct) => (
                            <button
                              key={pct}
                              type="button"
                              onClick={() => updateActiveImageProps({ widthPercent: pct })}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                                activeImage.widthPercent === pct
                                  ? 'bg-indigo-100 text-indigo-800 border-indigo-300 font-bold'
                                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              %{pct}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 4. ŞEKİL BAŞLIĞI (CAPTION) & ÇERÇEVE */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1 border-t border-slate-100 items-center">
                      <div className="sm:col-span-8 space-y-1">
                        <label className="block text-[11px] font-semibold text-slate-700">
                          Şekil Başlığı / Alt Yazı (Örn: "Şekil 1: ABC Üçgeni")
                        </label>
                        <input
                          type="text"
                          value={activeImage.caption || ''}
                          onChange={(e) =>
                            updateActiveImageProps({
                              caption: e.target.value
                            })
                          }
                          placeholder="Örn: Şekil 1 veya Grafik A"
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>

                      <div className="sm:col-span-4 flex items-center pt-4 sm:pt-0">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={activeImage.showBorder ?? true}
                            onChange={(e) =>
                              updateActiveImageProps({
                                showBorder: e.target.checked
                              })
                            }
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                          />
                          <span className="text-[11px] font-medium text-slate-700">
                            İnce Çerçeve Göster
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cevap & Çözüm Boşluğu Ayarları */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/70">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Grid className="w-3.5 h-3.5 text-indigo-600" />
                Öğrenci Çözüm / Cevap Boşluğu
              </span>
              <span className="text-[11px] text-slate-400">Yazılıda öğrencinin yazacağı alan</span>
            </div>

            {/* Boşluk Tipi Seçimi */}
            <div>
              <label className="block text-slate-600 font-medium mb-1">Boşluk Türü</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'lined', label: 'Çizgili (Satırlı)', icon: AlignLeft },
                  { id: 'squared', label: 'Kareli (Matematik)', icon: Grid },
                  { id: 'dotted', label: 'Noktalı', icon: HelpCircle },
                  { id: 'blank', label: 'Düz Beyaz Boşluk', icon: FileQuestion }
                ].map((type) => {
                  const Icon = type.icon;
                  const isSelected = selectedQuestion.answerSpace.type === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() =>
                        updateQuestion(selectedQuestion.id, {
                          answerSpace: {
                            ...selectedQuestion.answerSpace,
                            type: type.id as AnswerSpaceType
                          }
                        })
                      }
                      className={`p-2 rounded-lg border text-center transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-4 h-4 mx-auto mb-0.5" />
                      <span className="text-[10px] block font-medium leading-tight">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Satır Sayısı & Yükseklik */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Boşluk Yüksekliği / Satır: {selectedQuestion.answerSpace.lineCount} Satır (~{selectedQuestion.answerSpace.boxHeightPx}px)
                </label>
                <input
                  type="range"
                  min="2"
                  max="12"
                  value={selectedQuestion.answerSpace.lineCount}
                  onChange={(e) => {
                    const lines = Number(e.target.value);
                    updateQuestion(selectedQuestion.id, {
                      answerSpace: {
                        ...selectedQuestion.answerSpace,
                        lineCount: lines,
                        boxHeightPx: Math.max(50, lines * 22)
                      }
                    });
                  }}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Kutu İpucu Metni</label>
                <input
                  type="text"
                  value={selectedQuestion.answerSpace.hintText || ''}
                  onChange={(e) =>
                    updateQuestion(selectedQuestion.id, {
                      answerSpace: {
                        ...selectedQuestion.answerSpace,
                        hintText: e.target.value
                      }
                    })
                  }
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-800 bg-white"
                  placeholder="Örn: Çözüm Alanı: / Cevap:"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-600 font-medium">Çözüm Alanı Kenarlık Çizgisi</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedQuestion.answerSpace.showBorder}
                  onChange={(e) =>
                    updateQuestion(selectedQuestion.id, {
                      answerSpace: {
                        ...selectedQuestion.answerSpace,
                        showBorder: e.target.checked
                      }
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>

          {/* Öğretmen Çözüm Notu / Cevap Anahtarı */}
          <div className="space-y-1 text-xs">
            <label className="text-slate-600 font-medium flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-indigo-600" />
              <span>Öğretmen Çözüm / Cevap Anahtarı Notu (Opsiyonel)</span>
            </label>
            <textarea
              rows={2}
              value={selectedQuestion.solutionNotes || ''}
              onChange={(e) => updateQuestion(selectedQuestion.id, { solutionNotes: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg text-slate-800 bg-amber-50/40 text-xs focus:ring-2 focus:ring-amber-400"
              placeholder="Cevap anahtarı çıktısı alındığında görüntülenecek doğru çözüm ve yanıt..."
            />
          </div>

          {/* A4 Kağıt Bölme (Sayfa Sonu) */}
          <div className="p-3 rounded-xl border border-indigo-200 bg-indigo-50/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-600 text-white shadow-xs">
                <FileQuestion className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block">
                  Bu Sorudan Sonra Yeni Sayfaya Geç (2. / 3. Kağıt)
                </span>
                <span className="text-[11px] text-slate-500">
                  Sonraki soruyu doğrudan yeni bir A4 sayfasına taşır
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(selectedQuestion.pageBreakAfter)}
                onChange={(e) =>
                  updateQuestion(selectedQuestion.id, { pageBreakAfter: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
