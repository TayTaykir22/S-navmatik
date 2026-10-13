import React, { useState } from 'react';
import { ExamData, Question, QuestionImage, AnswerSpaceType, AnswerSpace, ExamHeader, getQuestionImages } from '../types/exam';
import { paginateQuestions, PageData } from '../utils/pagination';
import {
  Scissors,
  FileText,
  CornerDownRight,
  ArrowRight,
  SplitSquareVertical,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Layers,
  Copy,
  Edit3
} from 'lucide-react';

export interface ExamPaperViewProps {
  exam: ExamData;
  scale?: number;
  onUpdateQuestionText?: (id: string, newText: string) => void;
  onUpdateQuestionPremiseStem?: (id: string, premise: string, stem: string) => void;
  onUpdateQuestionPoints?: (id: string, points: number) => void;
  onUpdateQuestionAnswerSpace?: (id: string, updates: Partial<AnswerSpace>) => void;
  onUpdateQuestionSubject?: (id: string, subject: string) => void;
  onUpdateHeaderField?: (field: keyof ExamHeader, val: any) => void;
  onSelectQuestion?: (id: string) => void;
  selectedQuestionId?: string;
  onDeleteQuestion?: (id: string) => void;
  onDuplicateQuestion?: (q: Question) => void;
  onMoveQuestion?: (index: number, direction: 'up' | 'down') => void;
  onInsertQuestionAfter?: (index: number) => void;
  onTogglePageBreak?: (questionId: string) => void;
  onSwitchGroup?: (group: 'A GRUBU' | 'B GRUBU' | 'C GRUBU' | '') => void;
  isPrintPreview?: boolean;
  filterPageNumber?: number;
}

export const ExamPaperView: React.FC<ExamPaperViewProps> = ({
  exam,
  scale = 1,
  onUpdateQuestionText,
  onUpdateQuestionPremiseStem,
  onUpdateQuestionPoints,
  onUpdateQuestionAnswerSpace,
  onUpdateQuestionSubject,
  onUpdateHeaderField,
  onSelectQuestion,
  selectedQuestionId,
  onDeleteQuestion,
  onDuplicateQuestion,
  onMoveQuestion,
  onInsertQuestionAfter,
  onTogglePageBreak,
  onSwitchGroup,
  isPrintPreview = false,
  filterPageNumber = 0
}) => {
  const { header, questions, evaluationTable, signatures, layout } = exam;

  const fontClass = layout.fontFamily === 'serif' ? 'font-exam-serif' : 'font-exam-sans';
  const totalPoints = questions.reduce((sum, q) => sum + (Number(q.points) || 0), 0);
  const sheetClass = isPrintPreview ? 'preview-a4-sheet' : 'a4-sheet';

  // Paginate questions into discrete A4 sheets
  const allCalculatedPages: PageData[] = paginateQuestions(
    questions,
    layout,
    header,
    evaluationTable,
    signatures
  );

  const pages = filterPageNumber > 0
    ? allCalculatedPages.filter(p => p.pageNumber === filterPageNumber)
    : allCalculatedPages;

  // Render individual single question
  const renderQuestionItem = (q: Question, isHalfExam: boolean = false) => {
    const isSelected = selectedQuestionId === q.id;
    const qIndex = questions.findIndex((item) => item.id === q.id);
    const totalCount = questions.length;

    return (
      <div
        key={q.id}
        onClick={() => onSelectQuestion?.(q.id)}
        className={`avoid-break text-slate-900 border-b border-dashed border-slate-200/90 pb-2 mb-2 last:border-b-0 last:pb-0 relative group transition-all duration-150 ${
          isSelected
            ? 'ring-2 ring-indigo-500/85 bg-indigo-50/20 rounded-xl p-2 -m-2 z-10 shadow-sm'
            : 'hover:bg-slate-50/70 rounded-xl p-1.5 -m-1.5'
        }`}
      >
        {/* Floating Interactive Action Toolbar on Screen (no-print) */}
        {!isPrintPreview && (
          <div
            className={`no-print absolute -top-3.5 right-1 z-30 flex items-center gap-1 bg-slate-900 text-white rounded-lg px-2 py-0.5 text-[10px] shadow-lg border border-slate-700 transition-all duration-150 ${
              isSelected ? 'opacity-100 scale-100' : 'opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 pointer-events-none group-hover:pointer-events-auto'
            }`}
          >
            <span className="font-bold text-indigo-300">S.{q.number}</span>
            <span className="text-slate-600">|</span>

            {/* Puan Artır / Azalt */}
            <div className="flex items-center gap-0.5 text-[9.5px]" title="Puan Değeri">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateQuestionPoints?.(q.id, Math.max(1, q.points - 1));
                }}
                className="hover:text-amber-300 px-0.5 font-bold cursor-pointer"
              >
                -
              </button>
              <span className="font-mono font-bold text-amber-300">{q.points}p</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateQuestionPoints?.(q.id, q.points + 1);
                }}
                className="hover:text-amber-300 px-0.5 font-bold cursor-pointer"
              >
                +
              </button>
            </div>

            <span className="text-slate-600">|</span>

            {/* Çözüm Alanı Satır Sayısı & Tipi */}
            <div className="flex items-center gap-0.5 text-[9.5px]" title="Çözüm Satır Sayısı">
              <span className="text-slate-400">Satır:</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateQuestionAnswerSpace?.(q.id, {
                    lineCount: Math.max(2, (q.answerSpace.lineCount || 4) - 1)
                  });
                }}
                className="hover:text-sky-300 px-0.5 font-bold cursor-pointer"
              >
                -
              </button>
              <span className="font-mono text-sky-300">{q.answerSpace.lineCount || 4}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateQuestionAnswerSpace?.(q.id, {
                    lineCount: Math.min(25, (q.answerSpace.lineCount || 4) + 1)
                  });
                }}
                className="hover:text-sky-300 px-0.5 font-bold cursor-pointer"
              >
                +
              </button>
            </div>

            {/* Çözüm Tipi Geçişi */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const types: AnswerSpaceType[] = ['squared', 'lined', 'blank'];
                const curIdx = types.indexOf(q.answerSpace.type as any);
                const nextType = types[(curIdx + 1) % types.length];
                onUpdateQuestionAnswerSpace?.(q.id, { type: nextType });
              }}
              className="px-1 py-0.2 rounded bg-slate-800 hover:bg-slate-700 text-sky-200 text-[9px] cursor-pointer"
              title="Çözüm alanı deseni (Kareli / Çizgili / Boş)"
            >
              {q.answerSpace.type === 'squared' ? 'Kareli' : q.answerSpace.type === 'lined' ? 'Çizgili' : 'Boş'}
            </button>

            <span className="text-slate-600">|</span>

            {/* Konum / Taşı Butonları */}
            <div className="flex items-center">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (qIndex > 0) onMoveQuestion?.(qIndex, 'up');
                }}
                disabled={qIndex === 0}
                className="p-0.5 hover:text-indigo-300 disabled:opacity-20 cursor-pointer"
                title="Soruyu yukarı taşı"
              >
                <ChevronUp className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (qIndex < totalCount - 1) onMoveQuestion?.(qIndex, 'down');
                }}
                disabled={qIndex === totalCount - 1}
                className="p-0.5 hover:text-indigo-300 disabled:opacity-20 cursor-pointer"
                title="Soruyu aşağı taşı"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            <span className="text-slate-600">|</span>

            {/* Araya Yeni Soru Ekle */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onInsertQuestionAfter?.(qIndex);
              }}
              className="flex items-center gap-0.5 px-1 py-0.2 bg-emerald-700/80 hover:bg-emerald-600 text-white rounded text-[9px] cursor-pointer"
              title="Bu sorunun hemen altına yeni bir soru ekle"
            >
              <Plus className="w-2.5 h-2.5" />
              <span>Araya Ekle</span>
            </button>

            {/* Sayfa Böl / Makas */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onTogglePageBreak?.(q.id);
              }}
              className={`p-0.5 rounded cursor-pointer ${
                q.pageBreakAfter
                  ? 'bg-amber-600 text-white font-bold'
                  : 'hover:text-amber-300 text-slate-400'
              }`}
              title="Bu sorudan sonra yeni sayfaya geç (Sayfa sonu)"
            >
              <Scissors className="w-3 h-3" />
            </button>

            {/* Sil */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteQuestion?.(q.id);
              }}
              className="p-0.5 hover:text-red-400 text-slate-400 cursor-pointer ml-0.5"
              title="Soruyu sil"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Soru Üst Başlığı: Sol Soru No & Kazanım, Sağ Sayfa Sonu & Puan */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 font-bold flex-wrap">
            <span
              className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[11px] font-mono leading-none tracking-tight select-none ${
                isSelected ? 'bg-indigo-600 text-white shadow-2xs' : 'bg-slate-900 text-white'
              }`}
            >
              S.{q.number}
            </span>

            {/* Kazanım / Konu Alanı (Tıklanıp Doğrudan Düzenlenebilir) */}
            <span
              contentEditable={!isPrintPreview}
              suppressContentEditableWarning
              onBlur={(e) => {
                const text = e.currentTarget.innerText.replace(/^\(|\)$/g, '').trim();
                onUpdateQuestionSubject?.(q.id, text);
              }}
              className={`text-[10px] text-slate-500 font-normal italic transition-all rounded px-1 -mx-0.5 ${
                !isPrintPreview
                  ? 'cursor-text hover:text-slate-800 hover:ring-1 hover:ring-indigo-300 hover:bg-indigo-50/20 focus:ring-1 focus:ring-indigo-500 focus:bg-indigo-50/30'
                  : ''
              }`}
              title="Kazanımı doğrudan kağıt üzerinde düzenlemek için tıklayın"
            >
              {q.subject ? `(${q.subject})` : !isPrintPreview ? '(Kazanım ekle)' : ''}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Sayfa Sonu Varsa Rozet */}
            {q.pageBreakAfter && (
              <span
                className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 font-bold flex items-center gap-1 select-none"
                title="Bu sorudan sonra yeni kağıda geçer"
              >
                <Scissors className="w-2.5 h-2.5" />
                <span className="no-print">Sayfa Sonu</span>
              </span>
            )}

            {/* Puan Rozeti (Doğrudan Tıklanıp Düzenlenebilir) */}
            <span
              contentEditable={!isPrintPreview}
              suppressContentEditableWarning
              onBlur={(e) => {
                const num = parseInt(e.currentTarget.innerText.replace(/[^0-9]/g, ''), 10);
                if (!isNaN(num) && num > 0) {
                  onUpdateQuestionPoints?.(q.id, num);
                }
              }}
              className={`text-[11px] font-bold text-slate-800 shrink-0 font-mono tracking-tight bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300 transition-all ${
                !isPrintPreview
                  ? 'cursor-text hover:bg-indigo-50 hover:border-indigo-400 focus:ring-1.5 focus:ring-indigo-500 focus:bg-indigo-50/40'
                  : ''
              }`}
              title="Puanı doğrudan düzenlemek için tıklayın"
            >
              [ {q.points} P ]
            </span>
          </div>
        </div>

        {/* Soru Gövdesi & Tipografik Metin Alanı (Öncül Normal, Soru Kökü Kalın) */}
        <div className="space-y-1.5">
          {(() => {
            const allImages = getQuestionImages(q);
            const topImages = allImages.filter((img) => img.position === 'top');
            const rightImages = allImages.filter(
              (img) => img.position === 'right' || (!img.position && allImages.length === 1)
            );
            const belowImages = allImages.filter((img) => img.position === 'below-text');

            const renderFigure = (img: QuestionImage, parentPos: 'top' | 'right' | 'below-text', wrapperWidthOverride?: string) => {
              let aspectRatioVal: string | undefined = undefined;
              if (img.aspectRatio && img.aspectRatio !== 'auto' && img.aspectRatio !== 'custom') {
                aspectRatioVal = img.aspectRatio.replace(':', '/');
              }

              const objectFitClass =
                img.objectFit === 'cover'
                  ? 'object-cover'
                  : img.objectFit === 'fill'
                  ? 'object-fill'
                  : 'object-contain';

              const figureStyle: React.CSSProperties = {
                width: wrapperWidthOverride || `${img.widthPercent || (parentPos === 'right' ? 40 : 45)}%`,
                maxWidth: '100%'
              };

              const imgStyle: React.CSSProperties = {
                width: '100%',
                aspectRatio: aspectRatioVal,
                height: img.aspectRatio === 'custom' && img.customHeightPx ? `${img.customHeightPx}px` : undefined,
                maxHeight:
                  img.aspectRatio === 'custom' && img.customHeightPx
                    ? `${img.customHeightPx}px`
                    : parentPos === 'right'
                    ? '150px'
                    : '180px'
              };

              return (
                <figure
                  key={img.id || img.url}
                  style={figureStyle}
                  className="inline-flex flex-col items-center justify-center p-0.5 shrink-0"
                >
                  <div
                    className={`w-full flex items-center justify-center overflow-hidden bg-white ${
                      img.showBorder ?? true ? 'border border-slate-300 rounded' : ''
                    } p-0.5`}
                  >
                    <img
                      src={img.url}
                      alt={img.alt || img.caption || 'Soru Görseli'}
                      style={imgStyle}
                      className={`${objectFitClass} max-w-full block`}
                    />
                  </div>
                  {img.caption && (
                    <figcaption className="text-[9px] text-slate-600 italic font-medium text-center mt-0.5 leading-tight select-none">
                      {img.caption}
                    </figcaption>
                  )}
                </figure>
              );
            };

            const renderFormatted = (text: string) => {
              if (!text) return null;
              if (text.includes('**')) {
                const parts = text.split(/\*\*(.*?)\*\*/g);
                return parts.map((part, i) =>
                  i % 2 === 1 ? (
                    <strong key={i} className="font-bold text-slate-950 font-sans">
                      {part}
                    </strong>
                  ) : (
                    <span key={i}>{part}</span>
                  )
                );
              }
              return text;
            };

            return (
              <>
                {/* Top Images if any */}
                {topImages.length > 0 && (
                  <div className="flex flex-wrap items-end justify-center gap-2 my-1">
                    {topImages.map((img) => renderFigure(img, 'top'))}
                  </div>
                )}

                {/* Text and Right Images side-by-side */}
                <div className="flex gap-2 items-start">
                  <div
                    className={`flex-1 text-[12px] leading-relaxed ${
                      layout.fontSize === 'xs' ? 'text-[11px]' : layout.fontSize === 'base' ? 'text-[13px]' : 'text-[12px]'
                    }`}
                  >
                    {/* Soru Öncülü ve Soru Kökü Ayrılmış Mod (Varsayılan MEB Standardı) */}
                    {q.premise || q.stem ? (
                      <div className="space-y-1">
                        {/* Öncül Metni (Normal Font) - Doğrudan Tıklayıp Düzenleme */}
                        <div
                          contentEditable={!isPrintPreview}
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            const newPremise = e.currentTarget.innerText.trim();
                            onUpdateQuestionPremiseStem?.(q.id, newPremise, q.stem || '');
                          }}
                          className={`font-normal text-slate-800 whitespace-pre-line leading-relaxed outline-none transition-all rounded px-1 -mx-1 ${
                            !isPrintPreview
                              ? 'cursor-text hover:ring-1 hover:ring-indigo-300 hover:bg-indigo-50/15 focus:ring-1.5 focus:ring-indigo-500 focus:bg-indigo-50/25'
                              : ''
                          }`}
                          title="Soru öncülü metnini doğrudan kağıt üzerinde düzenlemek için tıklayın"
                        >
                          {renderFormatted(q.premise || '') || (!isPrintPreview && (
                            <span className="text-slate-400 italic text-[11px]">Soru öncülü metnini buraya yazın...</span>
                          ))}
                        </div>

                        {/* Soru Kökü (Kalın Font) - Doğrudan Tıklayıp Düzenleme */}
                        <div
                          contentEditable={!isPrintPreview}
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            const newStem = e.currentTarget.innerText.trim();
                            onUpdateQuestionPremiseStem?.(q.id, q.premise || '', newStem);
                          }}
                          className={`font-bold text-slate-950 whitespace-pre-line leading-relaxed outline-none transition-all rounded px-1 -mx-1 ${
                            !isPrintPreview
                              ? 'cursor-text hover:ring-1 hover:ring-indigo-400 hover:bg-indigo-50/20 focus:ring-1.5 focus:ring-indigo-500 focus:bg-indigo-50/30'
                              : ''
                          }`}
                          title="Soru kökünü doğrudan düzenleyin (Baskıda kalın çıkar)"
                        >
                          {renderFormatted(q.stem || '') || (!isPrintPreview && (
                            <span className="text-slate-400 italic text-[11px] font-bold">Soru kökü (vurgulu metin)...</span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      /* Tek Metin Modu - Doğrudan Tıklayıp Düzenleme */
                      <div
                        contentEditable={!isPrintPreview}
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          if (onUpdateQuestionText) {
                            onUpdateQuestionText(q.id, e.currentTarget.innerText.trim());
                          }
                        }}
                        className={`font-normal text-slate-900 whitespace-pre-line leading-relaxed outline-none transition-all rounded px-1 -mx-1 ${
                          !isPrintPreview
                            ? 'cursor-text hover:ring-1 hover:ring-indigo-300 hover:bg-indigo-50/15 focus:ring-1.5 focus:ring-indigo-500 focus:bg-indigo-50/25'
                            : ''
                        }`}
                        title="Soru metnini doğrudan kağıt üzerinde düzenlemek için tıklayın"
                      >
                        {renderFormatted(q.text) || (!isPrintPreview && (
                          <span className="text-slate-400 italic text-[11px]">Soru metnini buraya yazın...</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {rightImages.length > 0 && (
                    <div
                      style={{
                        width: `${Math.min(55, rightImages[0]?.widthPercent || 40)}%`
                      }}
                      className="shrink-0 flex flex-col items-center gap-1.5"
                    >
                      {rightImages.map((img) => renderFigure(img, 'right', '100%'))}
                    </div>
                  )}
                </div>

                {/* Below-text Images if any */}
                {belowImages.length > 0 && (
                  <div className="flex flex-wrap items-end justify-center gap-2 my-1.5">
                    {belowImages.map((img) => renderFigure(img, 'below-text'))}
                  </div>
                )}
              </>
            );
          })()}

          {/* Student Answer Space */}
          <div className="mt-1">
            {q.answerSpace.hintText && (
              <div className="text-[10px] text-slate-500 font-semibold mb-0.5">
                {q.answerSpace.hintText}
              </div>
            )}

            <div
              style={{
                height: `${Math.max(45, (q.answerSpace.lineCount || 4) * (isHalfExam ? 17 : 21))}px`
              }}
              className={`w-full rounded relative overflow-hidden transition-all ${
                q.answerSpace.showBorder ? 'border border-slate-300' : ''
              } ${
                q.answerSpace.type === 'lined'
                  ? 'lined-pattern bg-white'
                  : q.answerSpace.type === 'squared'
                  ? 'squared-pattern bg-white'
                  : q.answerSpace.type === 'dotted'
                  ? 'dotted-pattern bg-white'
                  : 'bg-white'
              }`}
            >
              {/* Teacher Solution Overlay in Answer Key Mode */}
              {layout.showSolutions && q.solutionNotes && (
                <div className="absolute inset-0 bg-amber-50/90 p-1.5 text-[11px] text-amber-950 font-mono font-medium overflow-hidden border border-amber-300">
                  <span className="font-bold block text-[10px] text-amber-800">[Öğretmen Çözüm / Cevap]:</span>
                  {q.solutionNotes}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Full Exam Header Component (Page 1)
  const renderExamHeader = (isHalfExam: boolean = false) => {
    return (
      <div
        className={`mb-2 text-slate-900 ${
          header.showHeaderBorder ? 'border-[1.5px] border-slate-900 p-2 rounded-xs' : 'pb-1.5 border-b-[1.5px] border-slate-900'
        }`}
      >
        <div className="flex items-center justify-between gap-2.5">
          {/* Sol Logo */}
          {header.logoLeft ? (
            <div className="w-11 h-11 md:w-12 md:h-12 shrink-0 flex items-center justify-center">
              <img src={header.logoLeft} alt="Kurum Logosu" className="max-h-11 max-w-11 md:max-h-12 md:max-w-12 object-contain" />
            </div>
          ) : (
            <div className="w-3" />
          )}

          {/* Orta Kurum & Sınav Bilgileri */}
          <div className="flex-1 text-center space-y-0.5 min-w-0">
            {/* Okul Adı */}
            <h2
              contentEditable={!isPrintPreview}
              suppressContentEditableWarning
              onBlur={(e) => onUpdateHeaderField?.('schoolName', e.currentTarget.innerText.trim())}
              className={`text-[12.5px] md:text-[13.5px] font-black tracking-wide uppercase text-slate-950 my-0 leading-tight outline-none transition-all rounded px-1 -mx-0.5 ${
                !isPrintPreview ? 'cursor-text hover:ring-1 hover:ring-indigo-400 hover:bg-indigo-50/20 focus:ring-2 focus:ring-indigo-500 focus:bg-indigo-50/30' : ''
              }`}
              title="Okul adını doğrudan kağıt üzerinde düzenlemek için tıklayın"
            >
              {header.schoolName || (!isPrintPreview ? <span className="text-slate-400 italic">OKUL ADI GİRİNİZ</span> : '')}
            </h2>

            {/* Eğitim Öğretim Yılı ve Dönem & Sınav Türü (Yan Yana) */}
            <div className="flex items-center justify-center flex-wrap gap-1 text-[9.5px] md:text-[10.5px] font-bold text-slate-900 leading-snug">
              <span
                contentEditable={!isPrintPreview}
                suppressContentEditableWarning
                onBlur={(e) => onUpdateHeaderField?.('academicYear', e.currentTarget.innerText.trim())}
                className={`uppercase tracking-wide outline-none transition-all rounded px-1 -mx-0.5 inline-block ${
                  !isPrintPreview ? 'cursor-text hover:ring-1 hover:ring-indigo-300 hover:bg-indigo-50/15 focus:ring-1.5 focus:ring-indigo-500 focus:bg-indigo-50/25' : ''
                }`}
                title="Eğitim öğretim yılını doğrudan kağıt üzerinde düzenlemek için tıklayın"
              >
                {header.academicYear || (!isPrintPreview ? <span className="text-slate-400 italic">2026-2027 EĞİTİM VE ÖĞRETİM YILI</span> : '')}
              </span>
              <span className="text-slate-400 font-semibold select-none">-</span>
              <span
                contentEditable={!isPrintPreview}
                suppressContentEditableWarning
                onBlur={(e) => onUpdateHeaderField?.('termExam', e.currentTarget.innerText.trim())}
                className={`uppercase tracking-wide outline-none transition-all rounded px-1 -mx-0.5 inline-block ${
                  !isPrintPreview ? 'cursor-text hover:ring-1 hover:ring-indigo-300 hover:bg-indigo-50/15 focus:ring-1.5 focus:ring-indigo-500 focus:bg-indigo-50/25' : ''
                }`}
                title="Dönem ve sınav türünü doğrudan kağıt üzerinde düzenlemek için tıklayın"
              >
                {header.termExam || (!isPrintPreview ? <span className="text-slate-400 italic">1. DÖNEM 1. ORTAK YAZILI SINAVI</span> : '')}
              </span>
            </div>
          </div>

          {/* Sağ Logo veya Boşluk */}
          {header.logoRight ? (
            <div className="w-11 h-11 md:w-12 md:h-12 shrink-0 flex items-center justify-center">
              <img src={header.logoRight} alt="Okul Logosu" className="max-h-11 max-w-11 md:max-h-12 md:max-w-12 object-contain" />
            </div>
          ) : (
            <div className="w-3" />
          )}
        </div>

        {/* Ders Detay & Öğrenci Bilgi Alanı */}
        <div className="mt-1.5 pt-1.5 border-t border-slate-800/80 grid grid-cols-12 gap-1 text-[10px] md:text-[10.5px]">
          {/* Ders Bilgileri */}
          <div className={`${header.showStudentInfoBox ? 'col-span-7' : 'col-span-12'} flex flex-col justify-between space-y-0.5`}>
            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
              {/* Ders Adı */}
              <div>
                <span className="font-bold text-slate-700">Ders: </span>
                <span
                  contentEditable={!isPrintPreview}
                  suppressContentEditableWarning
                  onBlur={(e) => onUpdateHeaderField?.('courseName', e.currentTarget.innerText.trim())}
                  className={`font-extrabold text-slate-950 uppercase outline-none transition-all rounded px-1 -mx-0.5 inline-block min-w-[60px] ${
                    !isPrintPreview ? 'cursor-text hover:ring-1 hover:ring-indigo-400 hover:bg-indigo-50/15 focus:ring-1.5 focus:ring-indigo-500 focus:bg-indigo-50/25' : ''
                  }`}
                  title="Ders adını doğrudan düzenlemek için tıklayın"
                >
                  {header.courseName || (!isPrintPreview ? <span className="text-slate-400 italic font-normal text-[9.5px]">[Ders Adını Yazın]</span> : '')}
                </span>
              </div>

              {/* Sınıf / Şube */}
              <div>
                <span className="font-bold text-slate-700">Sınıf/Şube: </span>
                <span
                  contentEditable={!isPrintPreview}
                  suppressContentEditableWarning
                  onBlur={(e) => onUpdateHeaderField?.('gradeClass', e.currentTarget.innerText.trim())}
                  className={`font-bold text-slate-900 outline-none transition-all rounded px-1 -mx-0.5 inline-block min-w-[45px] ${
                    !isPrintPreview ? 'cursor-text hover:ring-1 hover:ring-indigo-400 hover:bg-indigo-50/15 focus:ring-1.5 focus:ring-indigo-500 focus:bg-indigo-50/25' : ''
                  }`}
                  title="Sınıf / Şube bilgisini doğrudan düzenlemek için tıklayın"
                >
                  {header.gradeClass || (!isPrintPreview ? <span className="text-slate-400 italic font-normal text-[9.5px]">[Sınıf/Şube]</span> : '')}
                </span>
              </div>

              {/* Tarih */}
              <div>
                <span className="font-bold text-slate-700">Tarih: </span>
                <span
                  contentEditable={!isPrintPreview}
                  suppressContentEditableWarning
                  onBlur={(e) => onUpdateHeaderField?.('examDate', e.currentTarget.innerText.trim())}
                  className={`outline-none transition-all rounded px-1 -mx-0.5 inline-block min-w-[55px] ${
                    !isPrintPreview ? 'cursor-text hover:ring-1 hover:ring-indigo-400 hover:bg-indigo-50/15 focus:ring-1.5 focus:ring-indigo-500 focus:bg-indigo-50/25' : ''
                  }`}
                  title="Sınav tarihini doğrudan düzenlemek için tıklayın"
                >
                  {header.examDate || (!isPrintPreview ? <span className="text-slate-400 italic text-[9.5px]">GG/AA/YYYY</span> : '')}
                </span>
              </div>

              {/* Süre */}
              <div>
                <span className="font-bold text-slate-700">Süre: </span>
                <span
                  contentEditable={!isPrintPreview}
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const num = parseInt(e.currentTarget.innerText.replace(/[^0-9]/g, ''), 10);
                    if (!isNaN(num) && num > 0) {
                      onUpdateHeaderField?.('durationMinutes', num);
                    }
                  }}
                  className={`font-semibold outline-none transition-all rounded px-1 -mx-0.5 inline-block ${
                    !isPrintPreview ? 'cursor-text hover:ring-1 hover:ring-indigo-400 hover:bg-indigo-50/15 focus:ring-1.5 focus:ring-indigo-500 focus:bg-indigo-50/25' : ''
                  }`}
                  title="Sınav süresini (dakika) doğrudan düzenlemek için tıklayın"
                >
                  {header.durationMinutes}
                </span>
                <span> Dakika</span>
              </div>

              {/* Senaryo Alanı & Sınav Grubu */}
              <div className="col-span-2 flex items-center justify-between pt-0.5 border-t border-slate-200/80 mt-0.5">
                <div className="flex items-center gap-1.5">
                  {header.scenario ? (
                    <>
                      <span className="font-bold text-slate-700 text-[9.5px]">Senaryo: </span>
                      <span
                        contentEditable={!isPrintPreview}
                        suppressContentEditableWarning
                        onBlur={(e) => onUpdateHeaderField?.('scenario', e.currentTarget.innerText.trim())}
                        className={`font-extrabold text-slate-950 bg-slate-100 px-1 py-0.2 rounded border border-slate-300 text-[9.5px] font-mono outline-none ${
                          !isPrintPreview ? 'cursor-text hover:border-indigo-400 focus:ring-1 focus:ring-indigo-500' : ''
                        }`}
                        title="Senaryoyu düzenleyin"
                      >
                        {header.scenario}
                      </span>
                    </>
                  ) : !isPrintPreview ? (
                    <button
                      type="button"
                      onClick={() => onUpdateHeaderField?.('scenario', '1. Senaryo')}
                      className="text-[9.5px] text-slate-400 hover:text-indigo-600 font-medium hover:underline cursor-pointer"
                      title="Senaryo ibaresi eklemek için tıklayın"
                    >
                      + Senaryo Ekle
                    </button>
                  ) : null}
                </div>

                {/* Sınav Kitapçık Grubu (Tıklanabilir A, B, C Geçişi) */}
                {header.examGroup && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onSwitchGroup) {
                        if (header.examGroup === 'A GRUBU') onSwitchGroup('B GRUBU');
                        else if (header.examGroup === 'B GRUBU') onSwitchGroup('C GRUBU');
                        else onSwitchGroup('A GRUBU');
                      }
                    }}
                    className="px-1.5 py-0.5 bg-slate-900 hover:bg-indigo-700 text-white font-bold text-[9.5px] rounded cursor-pointer transition-colors shadow-2xs"
                    title="Kitapçık grubunu değiştir (A, B, C arasında tıkla geç)"
                  >
                    {header.examGroup} ⟳
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Öğrenci Bilgi Tablosu */}
          {header.showStudentInfoBox && (
            <div className="col-span-5 border border-slate-900 rounded bg-slate-50/50 p-1 text-[10px] space-y-0.5 font-mono">
              <div className="flex border-b border-slate-300 pb-0.5">
                <span className="w-20 font-bold text-slate-700">Adı Soyadı:</span>
                <span className="flex-1 border-b border-dotted border-slate-400"></span>
              </div>
              <div className="flex border-b border-slate-300 pb-0.5">
                <span className="w-20 font-bold text-slate-700">Sınıf / No:</span>
                <span className="flex-1 border-b border-dotted border-slate-400"></span>
              </div>
              <div className="flex items-center justify-between pt-0.5">
                <span className="font-bold text-slate-900">Aldığı Not:</span>
                <div className="w-16 h-5 border-2 border-slate-900 rounded bg-white flex items-center justify-center font-bold text-xs">
                  / 100
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render Compact Continuation Header (Page 2, 3...)
  const renderContinuationHeader = (pageNumber: number, totalPages: number) => {
    return (
      <div className="mb-3 pb-2 border-b-2 border-slate-800 text-slate-900 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 bg-slate-900 text-white font-bold text-[10px] rounded font-mono">
            {pageNumber}. SAYFA
          </span>
          <div className="font-bold text-slate-900 text-[11px] uppercase tracking-wide">
            {header.schoolName} — {header.courseName}
          </div>
        </div>

        {/* Compact Student Identification Bar for detached pages */}
        <div className="flex items-center gap-2.5 text-[10px] font-mono text-slate-700 shrink-0">
          <div>
            <span className="font-bold">Öğrenci:</span> _________________
          </div>
          <div>
            <span className="font-bold">No:</span> ______
          </div>
          {header.scenario && (
            <span className="px-1 bg-slate-100 border border-slate-300 text-slate-800 font-bold text-[9px] rounded">
              {header.scenario}
            </span>
          )}
          {header.examGroup && (
            <span className="px-1 bg-slate-200 border border-slate-400 text-slate-800 font-bold text-[9px] rounded">
              {header.examGroup}
            </span>
          )}
        </div>
      </div>
    );
  };

  // Render Student Points & Evaluation Matrix Table
  const renderEvaluationTable = () => {
    if (!evaluationTable.enabled) return null;

    return (
      <div className="avoid-break mt-2.5 pt-2 border-t-2 border-slate-900 text-slate-900">
        <div className="flex items-start gap-3">
          {/* Soru Bazlı Puan Tablosu */}
          <div className="flex-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-800 mb-1 flex items-center justify-between">
              <span>Öğrenci Puan Değerlendirme Çizelgesi</span>
              <span className="text-slate-500 font-normal">Toplam Soru: {questions.length}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse border border-slate-900 text-[10px] bg-white">
                <thead>
                  <tr className="bg-slate-100 font-bold text-slate-900">
                    <th className="border border-slate-800 px-1 py-0.5 w-14">Soru No</th>
                    {questions.map((q) => (
                      <th key={q.id} className="border border-slate-800 px-1 py-0.5 min-w-[22px]">
                        {q.number}
                      </th>
                    ))}
                    <th className="border border-slate-800 px-1.5 py-0.5 bg-slate-200 font-extrabold w-14">
                      TOPLAM
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Soru Değeri Satırı */}
                  <tr className="text-slate-700 bg-slate-50">
                    <td className="border border-slate-800 px-1 py-0.5 font-semibold text-slate-900">Puan</td>
                    {questions.map((q) => (
                      <td key={q.id} className="border border-slate-800 px-1 py-0.5 font-mono">
                        {q.points}
                      </td>
                    ))}
                    <td className="border border-slate-800 px-1 py-0.5 font-bold font-mono text-slate-950">
                      {totalPoints}
                    </td>
                  </tr>
                  {/* Öğrenci Aldığı Not Satırı */}
                  <tr className="h-6">
                    <td className="border border-slate-800 px-1 py-0.5 font-bold text-slate-900 bg-white">
                      Not
                    </td>
                    {questions.map((q) => (
                      <td key={q.id} className="border border-slate-800 px-1 py-0.5 bg-white">
                        {/* Empty box for teacher scoring */}
                      </td>
                    ))}
                    <td className="border-2 border-slate-900 px-1 py-0.5 bg-slate-100 font-bold"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Öğretmen Yorumu / Geribildirim Kutusu */}
          {evaluationTable.showCommentBox && (
            <div className="w-48 border border-slate-800 rounded p-1.5 bg-slate-50 text-[10px] flex flex-col justify-between shrink-0">
              <span className="font-bold text-slate-800 block mb-0.5">
                {evaluationTable.commentBoxLabel || 'Öğretmen Değerlendirmesi:'}
              </span>
              <div className="h-9 border-b border-dashed border-slate-400"></div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render Footer with Teacher Signature & Instructions
  const renderFooterSignatures = () => {
    if (!signatures.enabled) return null;

    return (
      <div className="avoid-break mt-2.5 pt-2 border-t border-slate-300 text-slate-900">
        {/* Yönergeler */}
        {signatures.instructionsText && (
          <div className="text-[10px] text-slate-700 italic mb-2 leading-relaxed">
            {signatures.instructionsText}
          </div>
        )}

        {/* İmzalar */}
        <div className="flex items-end justify-between pt-1 text-[11px]">
          {/* Ders Öğretmenleri */}
          <div className="flex gap-8">
            {signatures.teachers.map((teacher, idx) => (
              <div key={idx} className="text-center min-w-[120px]">
                <div className="font-bold text-slate-900">{teacher.name}</div>
                <div className="text-[10px] text-slate-600">{teacher.title}</div>
                <div className="mt-3 border-b border-dotted border-slate-500 w-24 mx-auto"></div>
                <span className="text-[9px] text-slate-400 block mt-0.5">İmza</span>
              </div>
            ))}
          </div>

          {/* Okul Müdürü Onayı */}
          {signatures.showPrincipal && (
            <div className="text-center min-w-[140px] border border-slate-800 rounded p-1 bg-white">
              <div className="text-[9px] font-bold uppercase text-slate-600">
                {signatures.principalTitle || 'UYGUNDUR'}
              </div>
              <div className="font-bold text-slate-900 text-[10px] mt-0.5">
                {signatures.principalName || 'Hakan ÇİÇEK'}
              </div>
              <div className="mt-3 border-b border-dotted border-slate-500 w-20 mx-auto"></div>
              <span className="text-[8px] text-slate-400 block mt-0.5">Mühür / İmza</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 1. DUAL EXAM COPY ON ONE A4 LANDSCAPE (A4 2x A5 Paper Saving Mode)
  return (
    <div
      className="exam-paper-scaler w-full flex flex-col items-center gap-8"
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'top center'
      }}
    >
      {pages.map((page, pageIdx) => {
        const isLastPage = pageIdx === pages.length - 1;
        const pageMode = page.layoutMode || layout.layoutMode || 'two-column';

        // 1. A4 Yatay 2 Kopya (Two Exams on One Sheet)
        if (pageMode === 'two-exams-a4') {
          return (
            <div key={`sheet-${page.pageNumber}`} className="flex flex-col items-center w-full">
              {/* Screen Page Badge */}
              <div className="no-print w-[297mm] mb-2 flex items-center justify-between text-xs px-2 text-slate-600 font-medium">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[11px]">
                    {page.pageNumber}. Kağıt (A4 Yatay - 2 Kopya)
                  </span>
                  <span className="text-slate-500">
                    {page.questions.length > 0
                      ? `Sorular: S.${page.questions[0]?.number} - S.${page.questions[page.questions.length - 1]?.number} (${page.questions.length} Soru)`
                      : 'Puan Tablosu & İmzalar'}
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-indigo-600">
                  Toplam {pages.length} Kağıt
                </span>
              </div>

              {/* Physical A4 Landscape Sheet */}
              <div
                className={`a4-paper-container ${sheetClass} a4-sheet-landscape mx-auto bg-white shadow-xl border border-slate-300 text-slate-900 ${fontClass} p-4 ${
                  !isLastPage ? 'a4-sheet-break' : ''
                }`}
                style={{
                  width: '297mm',
                  minHeight: '210mm'
                }}
              >
                <div className="grid grid-cols-2 gap-4 h-full relative">
                  {/* Middle dashed cutting line */}
                  <div className="absolute top-0 bottom-0 left-1/2 -ml-px w-px border-r-2 border-dashed border-slate-400 flex flex-col items-center justify-center pointer-events-none z-10">
                    <span className="bg-white p-1 rounded-full border border-slate-300 text-slate-500 my-auto text-[10px] flex items-center gap-1 shadow-xs">
                      <Scissors className="w-3 h-3 text-slate-600" />
                      <span>Buradan Kesiniz</span>
                    </span>
                  </div>

                  {/* 1. Nüsha (Sol Sınav) */}
                  <div className="pr-3 flex flex-col justify-between">
                    <div>
                      {page.isFirstPage
                        ? renderExamHeader(true)
                        : renderContinuationHeader(page.pageNumber, page.totalPages)}
                      <div className="space-y-1">
                        {page.questions.map((q) => renderQuestionItem(q, true))}
                      </div>
                    </div>
                    <div>
                      {!page.isLastPage && (
                        <div className="text-[10px] text-slate-500 font-medium text-right italic py-1 flex items-center justify-end gap-1">
                          <span>Sınav {page.pageNumber + 1}. sayfada devam etmektedir</span>
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      )}
                      {page.hasEvaluationTable && renderEvaluationTable()}
                      {page.hasSignatures && renderFooterSignatures()}
                      {layout.showPageNumbers && (
                        <div className="mt-1 text-center text-[9px] text-slate-400 font-mono">
                          - Sayfa {page.pageNumber} / {page.totalPages} -
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 2. Nüsha (Sağ Sınav - İkinci Öğrenci Nüshası) */}
                  <div className="pl-3 flex flex-col justify-between">
                    <div>
                      {page.isFirstPage
                        ? renderExamHeader(true)
                        : renderContinuationHeader(page.pageNumber, page.totalPages)}
                      <div className="space-y-1">
                        {page.questions.map((q) => renderQuestionItem(q, true))}
                      </div>
                    </div>
                    <div>
                      {!page.isLastPage && (
                        <div className="text-[10px] text-slate-500 font-medium text-right italic py-1 flex items-center justify-end gap-1">
                          <span>Sınav {page.pageNumber + 1}. sayfada devam etmektedir</span>
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      )}
                      {page.hasEvaluationTable && renderEvaluationTable()}
                      {page.hasSignatures && renderFooterSignatures()}
                      {layout.showPageNumbers && (
                        <div className="mt-1 text-center text-[9px] text-slate-400 font-mono">
                          - Sayfa {page.pageNumber} / {page.totalPages} -
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Visual Divider between physical pages */}
              {!isLastPage && (
                <div className="no-print my-6 flex items-center justify-center gap-3 w-[297mm]">
                  <div className="h-px bg-slate-300 flex-1 border-t border-dashed border-slate-400"></div>
                  <div className="bg-slate-800 text-white text-[11px] font-semibold px-3 py-1 rounded-full shadow-sm flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Sonraki Kağıda Geçiş ({page.pageNumber + 1}. Kağıt)</span>
                  </div>
                  <div className="h-px bg-slate-300 flex-1 border-t border-dashed border-slate-400"></div>
                </div>
              )}
            </div>
          );
        }

        // 2. Dikey A4 (Tek Sütun veya Çift Sütun)
        return (
          <div key={`page-${page.pageNumber}`} className="flex flex-col items-center w-full">
            {/* Screen Page Indicator Label */}
            <div className="no-print w-[210mm] mb-2 flex items-center justify-between text-xs px-2 text-slate-600 font-medium">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[11px] font-bold">
                  {page.pageNumber}. Sayfa ({pageMode === 'two-column' ? 'Çift Sütun' : 'Tek Sütun'})
                </span>
                <span className="text-slate-500">
                  {page.questions.length > 0
                    ? `Sorular: S.${page.questions[0]?.number} - S.${page.questions[page.questions.length - 1]?.number} (${page.questions.length} Soru)`
                    : 'Puan Tablosu & İmzalar'}
                </span>
              </div>
              <span className="text-[11px] font-semibold text-indigo-600">
                Toplam {pages.length} Sayfa
              </span>
            </div>

            {/* Physical A4 Sheet Container */}
            <div
              className={`a4-paper-container ${sheetClass} mx-auto bg-white shadow-xl border border-slate-300 text-slate-900 ${fontClass} p-6 flex flex-col justify-between ${
                !isLastPage ? 'a4-sheet-break' : ''
              }`}
              style={{
                width: '210mm',
                minHeight: '297mm'
              }}
            >
              <div>
                {/* Header: Full MEB Header on Page 1, Compact Continuation on Page 2+ */}
                {page.hasHeader
                  ? renderExamHeader(false)
                  : page.hasContinuationHeader
                  ? renderContinuationHeader(page.pageNumber, page.totalPages)
                  : null}

                {/* Soru Bölümü: Bu sayfanın layout moduna göre (Çift veya Tek Sütun) */}
                {pageMode === 'two-column' ? (
                  <div className="grid grid-cols-2 gap-4 relative mt-1">
                    {/* Ortadaki ayraç çizgi */}
                    {layout.showColumnDivider && (
                      <div className="absolute top-0 bottom-0 left-1/2 -ml-px w-px bg-slate-300" />
                    )}

                    {/* Sol Sütun */}
                    <div className="pr-2 space-y-1">
                      {page.leftQuestions?.map((q) => renderQuestionItem(q))}
                    </div>

                    {/* Sağ Sütun */}
                    <div className="pl-2 space-y-1">
                      {page.rightQuestions?.map((q) => renderQuestionItem(q))}
                    </div>
                  </div>
                ) : (
                  /* Tek Sütun */
                  <div className="space-y-2 mt-1">
                    {page.questions.map((q) => renderQuestionItem(q))}
                  </div>
                )}
              </div>

              {/* Alt Bölüm: Puan Değerlendirme Tablosu, İmzalar & Sayfa Numarası */}
              <div className="mt-3">
                {/* Eğer sonraki sayfaya devam ediyorsa bilgilendirme notu */}
                {!page.isLastPage && (
                  <div className="text-[10px] text-slate-500 font-medium text-right italic py-1 border-t border-slate-200 flex items-center justify-end gap-1">
                    <span>Sınav {page.pageNumber + 1}. sayfada devam etmektedir</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                  </div>
                )}

                {/* Son sayfada Puan Tablosu ve Öğretmen İmzaları */}
                {page.hasEvaluationTable && renderEvaluationTable()}
                {page.hasSignatures && renderFooterSignatures()}

                {/* Sayfa Numaralandırması: "- Sayfa X / Y -" */}
                {layout.showPageNumbers && (
                  <div className="mt-2 text-center text-[9px] text-slate-400 font-mono">
                    - Sayfa {page.pageNumber} / {page.totalPages} -
                  </div>
                )}
              </div>
            </div>

            {/* Visual Divider between physical pages on screen */}
            {!isLastPage && (
              <div className="no-print my-6 flex items-center justify-center gap-3 w-[210mm]">
                <div className="h-px bg-slate-300 flex-1 border-t border-dashed border-slate-400"></div>
                <div className="bg-slate-800 text-white text-[11px] font-semibold px-3 py-1 rounded-full shadow-sm flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Sonraki Kağıda Geçiş ({page.pageNumber + 1}. Kağıt)</span>
                </div>
                <div className="h-px bg-slate-300 flex-1 border-t border-dashed border-slate-400"></div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
