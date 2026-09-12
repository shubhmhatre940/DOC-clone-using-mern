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
        // html-to-docx expects the body HTML content directly
        let docHtml = content && content.trim() ? content : '<p></p>';
        // Replace page break divs with page-break-before style for Word
        docHtml = docHtml.replace(/<div class="page-break"[^>]*><\/div>/gi, '<br style="page-break-before: always; clear: both;" />');

        const rawDocx = await HTMLtoDOCX(docHtml, null, {
          title: docTitle,
          margins: { top: 1440, right: 1440, bottom: 1440, left: 1440 } // 1 inch = 1440 twips
        });

        let docxBuffer = Buffer.from(rawDocx);

        // Ensure ECMA-376 schema validity by positioning <w:sectPr> at the end of <w:body>
        try {
          const zip = await JSZip.loadAsync(docxBuffer);
          let docXml = await zip.file('word/document.xml').async('text');
          const sectPrMatch = docXml.match(/<w:sectPr>[\s\S]*?<\/w:sectPr>/);
          if (sectPrMatch) {
            docXml = docXml.replace(sectPrMatch[0], '');
            docXml = docXml.replace('</w:body>', sectPrMatch[0] + '</w:body>');
            zip.file('word/document.xml', docXml);
            docxBuffer = await zip.generateAsync({ type: 'nodebuffer' });
          }
        } catch (zipErr) {
          console.warn('[DOCX Post-process]:', zipErr.message);
        }

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(safeTitle)}.docx"`);
        res.setHeader('Content-Length', docxBuffer.length);
        return res.end(docxBuffer);
      }

      case 'pdf': {
        const fullHtml = generateHtmlDocument(docTitle, content);
        const browser = await puppeteer.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
        });
        try {
          const page = await browser.newPage();
          await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
          const u8Array = await page.pdf({
            format: 'Letter',
            margin: {
              top: '1in',
              right: '1in',
              bottom: '1in',
              left: '1in'
            },
            printBackground: true
          });

          // Puppeteer page.pdf() returns Uint8Array; convert explicitly to Node Buffer
          // and send with res.end() to avoid Express converting Uint8Array to a JSON object
          const pdfBuffer = Buffer.from(u8Array);
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(safeTitle)}.pdf"`);
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
