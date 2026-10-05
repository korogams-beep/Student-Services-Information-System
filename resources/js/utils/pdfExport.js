import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Print an isolated document (COR or Official Receipt) without any of the surrounding UI
 * @param {string} elementId - DOM id of the paper/document container
 * @param {string} title - Window title for the print job
 */
export const printIsolatedElement = (elementId, title = 'Official Document') => {
  const element = document.getElementById(elementId);
  if (!element) {
    window.print();
    return;
  }

  // Create a hidden or popup iframe to completely isolate from parent page styles/sidebar
  const printIframe = document.createElement('iframe');
  printIframe.style.position = 'fixed';
  printIframe.style.right = '0';
  printIframe.style.bottom = '0';
  printIframe.style.width = '0';
  printIframe.style.height = '0';
  printIframe.style.border = '0';
  document.body.appendChild(printIframe);

  const doc = printIframe.contentWindow.document;
  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Courier+Prime&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif;
            background: #FFFFFF !important;
            color: #0F172A;
            padding: 24px 30px;
            font-size: 13.5px;
            line-height: 1.5;
          }
          .receipt-paper {
            background: #FFFFFF;
            border: 1.5px dashed #64748B;
            padding: 30px;
            border-radius: 8px;
            font-family: 'Courier Prime', 'Courier New', Courier, monospace;
            max-width: 520px;
            margin: 0 auto;
          }
          .cor-document {
            max-width: 800px;
            margin: 0 auto;
            padding: 30px 40px;
            background: #FFFFFF;
            border: 1px solid #CBD5E1;
            border-radius: 8px;
          }
          button, .no-print, input[type="checkbox"] { display: none !important; }
          @page {
            margin: 12mm 15mm;
            size: auto;
          }
          @media print {
            body { padding: 0; }
            .cor-document, .receipt-paper { border: none !important; }
          }
        </style>
      </head>
      <body>
        ${element.outerHTML}
      </body>
    </html>
  `);
  doc.close();

  // Wait for fonts and content to settle, then print
  setTimeout(() => {
    printIframe.contentWindow.focus();
    printIframe.contentWindow.print();
    setTimeout(() => {
      document.body.removeChild(printIframe);
    }, 1500);
  }, 350);
};

/**
 * Capture an element and download as a high-fidelity PDF
 * @param {string} elementId - DOM id to capture
 * @param {string} filename - Filename for download (e.g. 'COR_Maria_Santos.pdf')
 * @param {string} format - 'a4' or 'receipt'
 */
export const downloadPdfFromElement = async (elementId, filename = 'document.pdf', format = 'a4') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element #${elementId} not found for PDF export.`);
    return false;
  }

  try {
    const isReceipt = format === 'receipt';

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#FFFFFF',
      scrollX: 0,
      scrollY: 0,
      windowWidth: Math.max(document.documentElement.scrollWidth, 1280),
      windowHeight: Math.max(document.documentElement.scrollHeight, 1024),
      onclone: (clonedDoc) => {
        const clonedTarget = clonedDoc.getElementById(elementId);
        if (clonedTarget) {
          clonedTarget.style.boxShadow = 'none';
          clonedTarget.style.transform = 'none';
          clonedTarget.style.margin = '0 auto';
        }
      },
    });

    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: isReceipt ? [120, 210] : 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Balanced margins
    const margin = isReceipt ? 8 : 10;
    const availableWidth = pageWidth - (margin * 2);
    const availableHeight = pageHeight - (margin * 2);

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const aspectRatio = canvasWidth / canvasHeight;

    let renderWidth = availableWidth;
    let renderHeight = renderWidth / aspectRatio;

    // Smart Single-Sheet Auto-Fit:
    // If the document is only slightly taller than 1 page (up to 1.35x),
    // scale it down proportionally to fit 100% on a single clean page without being cut off!
    if (renderHeight > availableHeight && renderHeight <= availableHeight * 1.35) {
      renderHeight = availableHeight;
      renderWidth = renderHeight * aspectRatio;
      const xOffset = margin + (availableWidth - renderWidth) / 2;
      pdf.addImage(imgData, 'PNG', xOffset, margin, renderWidth, renderHeight, undefined, 'FAST');
    } else if (renderHeight <= availableHeight) {
      // Standard single page fit: center horizontally
      const xOffset = margin + (availableWidth - renderWidth) / 2;
      pdf.addImage(imgData, 'PNG', xOffset, margin, renderWidth, renderHeight, undefined, 'FAST');
    } else {
      // Multi-page document: slice across pages sequentially
      let heightLeft = renderHeight;
      let position = margin;

      pdf.addImage(imgData, 'PNG', margin, position, renderWidth, renderHeight, undefined, 'FAST');
      heightLeft -= availableHeight;

      while (heightLeft > 0) {
        position = margin - (renderHeight - heightLeft);
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position, renderWidth, renderHeight, undefined, 'FAST');
        heightLeft -= availableHeight;
      }
    }

    pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
    return true;
  } catch (error) {
    console.warn('html2canvas rendering fallback to direct print/download:', error);
    // Fallback: trigger print
    window.print();
    return false;
  }
};
