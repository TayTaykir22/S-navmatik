import { ExamData } from '../types/exam';

function getDocumentStyles(): string {
  const styles: string[] = [];
  document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
    styles.push((link as HTMLLinkElement).outerHTML);
  });
  document.querySelectorAll('style').forEach((style) => {
    styles.push((style as HTMLStyleElement).outerHTML);
  });
  return styles.join('\n');
}

export function setPrintOrientation(isLandscape: boolean): void {
  let styleEl = document.getElementById('sinavmatik-print-orientation') as HTMLStyleElement;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'sinavmatik-print-orientation';
    document.head.appendChild(styleEl);
  }
  styleEl.innerHTML = `@page { size: ${isLandscape ? 'A4 landscape' : 'A4 portrait'} !important; margin: 0 !important; }`;
}

export function generateCleanPrintHtml(exam: ExamData): string {
  const isLandscape = exam.layout.layoutMode === 'two-exams-a4';
  
  // Prefer background .a4-sheet to ensure all pages are rendered without duplication
  let rawSheets = Array.from(document.querySelectorAll<HTMLElement>('.a4-sheet'));
  if (!rawSheets || rawSheets.length === 0) {
    rawSheets = Array.from(document.querySelectorAll<HTMLElement>('.preview-a4-sheet'));
  }

  if (!rawSheets || rawSheets.length === 0) {
    return '<!DOCTYPE html><html><body><p>Yazdırılacak sınav sayfası bulunamadı.</p></body></html>';
  }

  const cleanedSheetsHtml = rawSheets.map((sheet) => {
    const clone = sheet.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('.no-print').forEach((el) => el.remove());
    clone.classList.remove('shadow-xl', 'border-slate-300', 'mx-auto');
    clone.style.boxShadow = 'none';
    clone.style.border = 'none';
    clone.style.margin = '0 auto';
    clone.style.transform = 'none';
    return clone.outerHTML;
  }).join('\n<div style="page-break-after: always; break-after: page;"></div>\n');

  const pageTitle = `${exam.header.schoolName || exam.header.courseName || 'Sinav'}_${exam.header.termExam || 'Yazili'}${exam.header.examGroup ? `_${exam.header.examGroup}` : ''}`;
  const styles = getDocumentStyles();

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageTitle} - Yazdır</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  ${styles}
  <style>
    @page {
      size: ${isLandscape ? 'A4 landscape' : 'A4 portrait'};
      margin: 0;
    }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
      color: #000000 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .no-print {
      display: none !important;
    }
    .a4-paper-container,
    .a4-sheet,
    .preview-a4-sheet {
      box-shadow: none !important;
      margin: 0 auto !important;
      border: none !important;
      page-break-after: always !important;
      break-after: page !important;
      width: ${isLandscape ? '297mm' : '210mm'} !important;
      max-width: ${isLandscape ? '297mm' : '210mm'} !important;
      min-height: ${isLandscape ? '210mm' : '297mm'} !important;
      box-sizing: border-box !important;
      overflow: hidden !important;
    }
    @media screen {
      body {
        background-color: #0f172a !important;
        padding: 24px 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 24px;
      }
      .a4-sheet, .preview-a4-sheet {
        background: #ffffff !important;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5) !important;
        border: 1px solid #cbd5e1 !important;
      }
      .print-floating-bar {
        position: fixed;
        top: 16px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 9999;
        background: #1e293b;
        color: white;
        padding: 8px 20px;
        border-radius: 9999px;
        display: flex;
        align-items: center;
        gap: 16px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4);
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 13px;
        font-weight: 500;
        border: 1px solid #334155;
      }
      .print-floating-btn {
        background: #4f46e5;
        color: white;
        border: none;
        padding: 8px 18px;
        border-radius: 9999px;
        cursor: pointer;
        font-weight: 700;
        font-size: 13px;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: background 0.15s ease;
      }
      .print-floating-btn:hover {
        background: #4338ca;
      }
    }
  </style>
</head>
<body>
  <div class="print-floating-bar no-print">
    <span>🖨️ Sınav Önizleme ve Yazdırma</span>
    <button class="print-floating-btn" onclick="window.print()">
      Hemen Yazdır (Ctrl + P)
    </button>
  </div>

  ${cleanedSheetsHtml}

  <script>
    window.addEventListener('load', function() {
      setTimeout(function() {
        try {
          window.print();
        } catch (e) {
          console.log('Auto-print dismissed or blocked:', e);
        }
      }, 500);
    });
  </script>
</body>
</html>`;
}

export function createPrintableBlobUrl(exam: ExamData): string {
  const html = generateCleanPrintHtml(exam);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  return URL.createObjectURL(blob);
}

export async function executePrintExam(exam: ExamData): Promise<{ success: boolean; fallbackNeeded?: boolean; error?: string }> {
  try {
    const isLandscape = exam.layout.layoutMode === 'two-exams-a4';
    setPrintOrientation(isLandscape);

    let rawSheets = Array.from(document.querySelectorAll<HTMLElement>('.a4-sheet'));
    if (!rawSheets.length) {
      rawSheets = Array.from(document.querySelectorAll<HTMLElement>('.preview-a4-sheet'));
    }
    if (!rawSheets || rawSheets.length === 0) {
      throw new Error('Sınav sayfası bulunamadı. Lütfen önizleme yüklenirken bekleyin.');
    }

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.left = '-9999px';
    iframe.style.top = '0';
    iframe.style.width = isLandscape ? '1122px' : '794px';
    iframe.style.height = isLandscape ? '794px' : '1122px';
    iframe.style.border = '0';
    iframe.style.visibility = 'visible';
    iframe.setAttribute('title', 'Sınav Yazdırma Servisi');
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) {
      throw new Error('Yazdırma çerçevesi oluşturulamadı.');
    }

    const printHtml = generateCleanPrintHtml(exam);
    doc.open();
    doc.write(printHtml);
    doc.close();

    await new Promise<void>((resolve) => {
      let resolved = false;
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve();
        }
      }, 1000);

      iframe.onload = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          resolve();
        }
      };
    });

    await new Promise((r) => setTimeout(r, 300));

    if (iframe.contentWindow) {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } else {
      throw new Error('Yazdırma penceresi açılamadı.');
    }

    setTimeout(() => {
      try {
        iframe.remove();
      } catch (e) {}
    }, 5000);

    return { success: true };
  } catch (iframeErr: any) {
    console.warn('Iframe print error, attempting native window.print fallback:', iframeErr);

    try {
      window.print();
      return { success: true };
    } catch (windowPrintErr: any) {
      console.error('All direct print attempts failed:', windowPrintErr);
      return {
        success: false,
        fallbackNeeded: true,
        error: windowPrintErr?.message || 'Tarayıcı güvenlik kısıtlaması nedeniyle yazdırma penceresi açılamadı.'
      };
    }
  }
}
