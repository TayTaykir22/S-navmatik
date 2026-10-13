import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toJpeg } from 'html-to-image';
import { ExamData } from '../types/exam';

export interface PdfExportProgress {
  currentPage: number;
  totalPages: number;
  statusText: string;
}

export interface PdfExportResult {
  success: boolean;
  blobUrl: string;
  fileName: string;
  error?: string;
}

/**
 * Generates a high-resolution, perfectly fitted A4 multi-page PDF directly from DOM.
 * Eliminates screen responsive downscaling, drop shadows, and gray borders so the
 * exam fits 100% of the A4 page without offset or whitespace.
 */
export async function exportExamToPdf(
  exam: ExamData,
  onProgress?: (progress: PdfExportProgress) => void
): Promise<PdfExportResult> {
  const isLandscape = exam.layout.layoutMode === 'two-exams-a4';
  let sheets = Array.from(document.querySelectorAll<HTMLElement>('.a4-sheet'));
  if (!sheets || sheets.length === 0) {
    sheets = Array.from(document.querySelectorAll<HTMLElement>('.preview-a4-sheet'));
  }
  if (!sheets || sheets.length === 0) {
    sheets = Array.from(document.querySelectorAll<HTMLElement>('.a4-paper-container'));
  }

  if (!sheets || sheets.length === 0) {
    throw new Error('Sınav sayfası bulunamadı. Lütfen sayfanın yüklendiğinden emin olun.');
  }

  const totalSheets = sheets.length;

  // Exact standard A4 dimensions at 96 DPI:
  // 1 mm = 3.779527559 px
  // 210 mm = 793.7px (~794px)
  // 297 mm = 1122.52px (~1123px)
  const a4WidthPx = isLandscape ? 1123 : 794;
  const a4HeightPx = isLandscape ? 794 : 1123;
  const pdfWidthMm = isLandscape ? 297 : 210;
  const pdfHeightMm = isLandscape ? 210 : 297;

  // Dedicated isolated off-screen/overlay render host directly attached to document.body.
  // This bypasses any parent flexbox, overflow-auto, or screen width constraints.
  const exportHost = document.createElement('div');
  exportHost.id = 'pdf-export-isolated-host';
  exportHost.style.position = 'fixed';
  exportHost.style.top = '0';
  exportHost.style.left = '0';
  exportHost.style.width = `${a4WidthPx}px`;
  exportHost.style.minWidth = `${a4WidthPx}px`;
  exportHost.style.maxWidth = `${a4WidthPx}px`;
  exportHost.style.height = `${a4HeightPx}px`;
  exportHost.style.minHeight = `${a4HeightPx}px`;
  exportHost.style.maxHeight = `${a4HeightPx}px`;
  exportHost.style.zIndex = '45'; // Under the loading modal overlay (z-50) so user sees only the loading progress
  exportHost.style.overflow = 'hidden';
  exportHost.style.backgroundColor = '#ffffff';
  exportHost.style.margin = '0';
  exportHost.style.padding = '0';
  exportHost.style.boxSizing = 'border-box';
  document.body.appendChild(exportHost);

  const pdf = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  try {
    for (let i = 0; i < totalSheets; i++) {
      const sheet = sheets[i];

      if (onProgress) {
        onProgress({
          currentPage: i + 1,
          totalPages: totalSheets,
          statusText: `${i + 1}. sayfa A4 formatında işleniyor...`
        });
      }

      // Check this specific sheet's orientation (two-exams-a4 uses a4-sheet-landscape)
      const sheetIsLandscape = sheet.classList.contains('a4-sheet-landscape');
      const currentWidthPx = sheetIsLandscape ? 1123 : 794;
      const currentHeightPx = sheetIsLandscape ? 794 : 1123;
      const currentPdfWidthMm = sheetIsLandscape ? 297 : 210;
      const currentPdfHeightMm = sheetIsLandscape ? 210 : 297;

      exportHost.style.width = `${currentWidthPx}px`;
      exportHost.style.minWidth = `${currentWidthPx}px`;
      exportHost.style.maxWidth = `${currentWidthPx}px`;
      exportHost.style.height = `${currentHeightPx}px`;
      exportHost.style.minHeight = `${currentHeightPx}px`;
      exportHost.style.maxHeight = `${currentHeightPx}px`;

      // Deep clone the sheet so the user's active UI is untouched
      const clone = sheet.cloneNode(true) as HTMLElement;

      // Remove any screen-only elements (e.g. edit hints, badges, split page buttons)
      clone.querySelectorAll('.no-print').forEach((el) => el.remove());

      // Strip shadows, outer borders, and screen-centering offsets
      clone.classList.remove('shadow-xl', 'border', 'border-slate-300', 'mx-auto');
      clone.style.width = `${currentWidthPx}px`;
      clone.style.minWidth = `${currentWidthPx}px`;
      clone.style.maxWidth = `${currentWidthPx}px`;
      clone.style.height = `${currentHeightPx}px`;
      clone.style.minHeight = `${currentHeightPx}px`;
      clone.style.maxHeight = `${currentHeightPx}px`;
      clone.style.boxSizing = 'border-box';
      clone.style.margin = '0';
      clone.style.border = 'none';
      clone.style.boxShadow = 'none';
      clone.style.transform = 'none';
      clone.style.backgroundColor = '#ffffff';
      clone.style.overflow = 'hidden';

      // Ensure standard padding for perfect MEB margins
      clone.style.padding = sheetIsLandscape ? '16px 20px' : '20px 24px';

      // Fallback for modern CSS color specifications if html2canvas parser encounters them
      clone.querySelectorAll('*').forEach((node: any) => {
        if (node.style) {
          if (node.style.color && node.style.color.includes('oklch')) {
            node.style.color = '#0f172a';
          }
          if (node.style.borderColor && node.style.borderColor.includes('oklch')) {
            node.style.borderColor = '#cbd5e1';
          }
        }
      });

      exportHost.innerHTML = '';
      exportHost.appendChild(clone);

      // Wait for any images (logos, diagrams) inside the clone to be fully loaded
      const images = Array.from(clone.querySelectorAll('img'));
      await Promise.all(
        images.map(
          (img) =>
            new Promise<void>((resolve) => {
              if (img.complete) {
                resolve();
              } else {
                img.onload = () => resolve();
                img.onerror = () => resolve();
              }
            })
        )
      );

      // Auto-fit check: if the teacher's content exceeds the physical A4 height,
      // gently scale down slightly so that NO text, diagram, or signature is cut off at the bottom.
      const contentHeight = clone.scrollHeight;
      if (contentHeight > currentHeightPx + 4) {
        const scaleFactor = Math.min(1, (currentHeightPx - 8) / contentHeight);
        clone.style.transform = `scale(${scaleFactor})`;
        clone.style.transformOrigin = 'top center';
      }

      // Small tick for browser layout engine to paint
      await new Promise((r) => setTimeout(r, 60));

      let imgData: string;

      try {
        const canvas = await html2canvas(exportHost, {
          scale: 2, // 2x gives 300 DPI high-definition crispness
          width: currentWidthPx,
          height: currentHeightPx,
          windowWidth: Math.max(window.innerWidth, currentWidthPx + 150),
          windowHeight: Math.max(window.innerHeight, currentHeightPx + 150),
          x: 0,
          y: 0,
          scrollX: 0,
          scrollY: 0,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false
        });

        imgData = canvas.toDataURL('image/jpeg', 0.98);
      } catch (h2cError) {
        console.warn('html2canvas render error, falling back to html-to-image on host:', h2cError);
        imgData = await toJpeg(exportHost, {
          quality: 0.98,
          pixelRatio: 2,
          backgroundColor: '#ffffff'
        });
      }

      if (i > 0) {
        pdf.addPage('a4', sheetIsLandscape ? 'landscape' : 'portrait');
      }

      // Fill the exact A4 canvas: from (0,0) to (currentPdfWidthMm, currentPdfHeightMm)
      pdf.addImage(imgData, 'JPEG', 0, 0, currentPdfWidthMm, currentPdfHeightMm, undefined, 'FAST');
    }

    if (onProgress) {
      onProgress({
        currentPage: totalSheets,
        totalPages: totalSheets,
        statusText: 'PDF dosyası kaydediliyor...'
      });
    }

    // Format friendly file name
    const cleanCourse = (exam.header.courseName || 'Sinav')
      .replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ_]/g, '_')
      .substring(0, 30);
    const cleanSchool = (exam.header.schoolName || '')
      .replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ_]/g, '_')
      .substring(0, 30);
    const cleanTerm = (exam.header.termExam || '')
      .replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ_]/g, '_')
      .substring(0, 30);
    const cleanGroup = exam.header.examGroup
      ? `_${exam.header.examGroup.replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ_]/g, '_')}`
      : '';

    const fileName = `${cleanSchool || cleanCourse}_${cleanTerm || 'Sinav'}${cleanGroup}.pdf`;

    const blob = pdf.output('blob');
    const blobUrl = URL.createObjectURL(blob);

    // Trigger download via anchor
    try {
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        try {
          a.remove();
        } catch (e) {}
      }, 500);
    } catch (downloadErr) {
      console.warn('Anchor download fallback needed:', downloadErr);
    }

    return {
      success: true,
      blobUrl,
      fileName
    };
  } finally {
    // Safely remove the isolated export host
    try {
      exportHost.remove();
    } catch (e) {}
  }
}

/**
 * Triggers browser print with fallback check
 */
export function printExamDocument(): { success: boolean; error?: string } {
  try {
    window.print();
    return { success: true };
  } catch (err: any) {
    console.error('Yazdırma işlemi başlatılamadı:', err);
    return {
      success: false,
      error: err?.message || 'Tarayıcı güvenlik kısıtlaması nedeniyle yazdırma penceresi açılamadı.'
    };
  }
}
