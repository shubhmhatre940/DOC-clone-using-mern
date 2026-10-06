import HTMLtoDOCX from 'html-to-docx';
import puppeteer from 'puppeteer';
import JSZip from 'jszip';

/**
 * Format document HTML into a clean standalone HTML5 page for browser viewing/saving
 */
const generateHtmlDocument = (title, bodyContent) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 40px auto;
      max-width: 816px;
      padding: 20px;
      color: #202124;
      line-height: 1.6;
      background-color: #fff;
    }
    h1 { font-size: 2em; margin-bottom: 0.5em; font-weight: 600; color: #111827; }
    h2 { font-size: 1.5em; margin-top: 1em; margin-bottom: 0.5em; font-weight: 600; color: #1f2937; }
    h3 { font-size: 1.25em; margin-top: 1em; margin-bottom: 0.5em; font-weight: 600; color: #374151; }
    p { margin: 0.5em 0; }
    ul, ol { padding-left: 24px; margin: 0.5em 0; }
    blockquote { border-left: 3px solid #dadce0; margin: 1em 0; padding-left: 12px; color: #5f6368; }
    mark { background-color: #fef08a; padding: 2px 4px; border-radius: 2px; }
    .page-break {
      page-break-after: always;
      break-after: page;
      height: 0;
      margin: 0;
      border: none;
    }
    .doc-columns-1 {
      column-count: 1 !important;
    }
    .doc-columns-2 {
      column-count: 2 !important;
      column-gap: 2rem !important;
      column-rule: 1px solid #dadce0;
    }
    .doc-columns-3 {
      column-count: 3 !important;
      column-gap: 1.5rem !important;
      column-rule: 1px solid #dadce0;
    }
    .column-break {
      break-after: column;
      page-break-after: column;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1em 0;
    }
    th, td {
      border: 1px solid #dadce0;
      padding: 8px 12px;
      text-align: left;
    }
    th {
      background-color: #f8f9fa;
      font-weight: 600;
    }
    img {
      max-width: 100%;
      height: auto;
    }
  </style>
</head>
<body>
  ${bodyContent || '<p></p>'}
</body>
</html>`;
};

/**
 * Strip HTML and extract clean plain text with spacing
 */
const htmlToPlainText = (html) => {
  if (!html) return '';
  return html
    .replace(/<style([\s\S]*?)<\/style>/gi, '')
    .replace(/<script([\s\S]*?)<\/script>/gi, '')
    .replace(/<\/p>|<\/div>|<br\s*[\/]?>|<\/h[1-6]>|<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();
};

/**
 * @desc    Export document to PDF, DOCX, TXT, or HTML
 * @route   GET /api/documents/:id/export?format=pdf|docx|txt|html
 * @access  Private (Viewer access or higher)
 */
export const exportDocument = async (req, res) => {
  try {
    const document = req.doc; // Provided by checkDocAccess('viewer') middleware
    const format = (req.query.format || 'txt').toLowerCase();
    const docTitle = document.title || 'Untitled document';
    const content = document.content || '';

    const safeTitle = docTitle.replace(/[/\\?%*:|"<>]/g, '_').trim() || 'document';

    switch (format) {
      case 'txt': {
        const plainText = htmlToPlainText(content);
        const textBuffer = Buffer.from(plainText, 'utf-8');
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(safeTitle)}.txt"`);
        res.setHeader('Content-Length', textBuffer.length);
        return res.end(textBuffer);
      }

      case 'html': {
        const fullHtml = generateHtmlDocument(docTitle, content);
        const htmlBuffer = Buffer.from(fullHtml, 'utf-8');
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(safeTitle)}.html"`);
        res.setHeader('Content-Length', htmlBuffer.length);
        return res.end(htmlBuffer);
      }

      case 'docx': {
        // html-to-docx expects HTML content and options
        let docHtml = content && content.trim() ? content : '<p></p>';
        // Replace page break divs with page-break-before style for Word
        docHtml = docHtml.replace(/<div class="page-break"[^>]*><\/div>/gi, '<br style="page-break-before: always; clear: both;" />');

        const rawDocx = await HTMLtoDOCX(docHtml, null, {
          title: docTitle,
          margins: { top: 1440, right: 1440, bottom: 1440, left: 1440 } // 1 inch = 1440 twips
        });

        const docxBuffer = Buffer.from(rawDocx);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.docx"; filename*=UTF-8''${encodeURIComponent(safeTitle)}.docx`);
        res.setHeader('Content-Length', docxBuffer.length);
        return res.end(docxBuffer);
      }

      case 'pdf': {
        const fullHtml = generateHtmlDocument(docTitle, content);
        const pageSettings = document.pageSettings || {};
        const isLandscape = (req.query.orientation || pageSettings.orientation || 'portrait').toLowerCase() === 'landscape';
        const headerText = req.query.headerText !== undefined ? req.query.headerText : (pageSettings.headerText || '');
        const footerText = req.query.footerText !== undefined ? req.query.footerText : (pageSettings.footerText || '');
        const showPageNumbers = req.query.showPageNumbers !== undefined ? req.query.showPageNumbers === 'true' : !!pageSettings.showPageNumbers;
        const pageNumberPosition = req.query.pageNumberPosition || pageSettings.pageNumberPosition || 'footer-right';

        const hasHeader = !!headerText || (showPageNumbers && pageNumberPosition === 'header-right');
        const hasFooter = !!footerText || (showPageNumbers && pageNumberPosition !== 'header-right');
        const displayHeaderFooter = hasHeader || hasFooter;

        let headerTemplate = '<span></span>';
        if (hasHeader) {
          headerTemplate = `
            <div style="font-size: 9px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #5f6368; width: 100%; padding: 0 1in; box-sizing: border-box; display: flex; justify-content: space-between; align-items: center;">
              <span>${headerText}</span>
              ${showPageNumbers && pageNumberPosition === 'header-right' ? '<span><span class="pageNumber"></span> / <span class="totalPages"></span></span>' : '<span></span>'}
            </div>
          `;
        }

        let footerTemplate = '<span></span>';
        if (hasFooter) {
          const isCenter = pageNumberPosition === 'footer-center';
          footerTemplate = `
            <div style="font-size: 9px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #5f6368; width: 100%; padding: 0 1in; box-sizing: border-box; display: flex; justify-content: ${isCenter ? 'center' : 'space-between'}; align-items: center;">
              ${!isCenter && footerText ? `<span>${footerText}</span>` : (!isCenter ? '<span></span>' : '')}
              ${showPageNumbers && pageNumberPosition !== 'header-right' ? `<span>${isCenter && footerText ? footerText + ' — ' : ''}<span class="pageNumber"></span> / <span class="totalPages"></span></span>` : ''}
              ${!showPageNumbers && footerText && !isCenter ? '<span></span>' : ''}
            </div>
          `;
        }

        const browser = await puppeteer.launch({
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--font-render-hinting=none'
          ]
        });

        try {
          const page = await browser.newPage();
          await page.setContent(fullHtml, { waitUntil: 'domcontentloaded', timeout: 30000 });

          const u8Array = await page.pdf({
            format: 'Letter',
            landscape: isLandscape,
            displayHeaderFooter,
            headerTemplate,
            footerTemplate,
            margin: {
              top: displayHeaderFooter ? '1.2in' : '1in',
              right: '1in',
              bottom: displayHeaderFooter ? '1.2in' : '1in',
              left: '1in'
            },
            printBackground: true
          });

          const pdfBuffer = Buffer.from(u8Array);
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.pdf"; filename*=UTF-8''${encodeURIComponent(safeTitle)}.pdf`);
          res.setHeader('Content-Length', pdfBuffer.length);
          return res.end(pdfBuffer);
        } finally {
          await browser.close();
        }
      }

      default:
        return res.status(400).json({ message: `Unsupported export format: ${format}` });
    }
  } catch (error) {
    console.error('[Export Error]:', error);
    return res.status(500).json({ message: error.message || 'Failed to export document' });
  }
};
