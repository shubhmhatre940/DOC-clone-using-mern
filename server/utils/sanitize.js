import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitizes rich HTML document content before persisting to MongoDB.
 * Strips out <script>, inline event handlers (onerror, onclick), javascript: URLs,
 * while strictly preserving legitimate document formatting (headings, lists, tables,
 * images, styles, colors, links, etc.).
 *
 * @param {string|any} content - The HTML or raw content to sanitize
 * @returns {string|any} - Sanitized safe content
 */
export function sanitizeContent(content) {
  if (typeof content !== 'string') {
    return content;
  }

  if (!content.trim()) {
    return content;
  }

  return DOMPurify.sanitize(content, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'hr',
      'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'sub', 'sup',
      'span', 'div', 'blockquote', 'pre', 'code', 'mark',
      'ul', 'ol', 'li',
      'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
      'a', 'img', 'audio', 'video', 'source', 'figure', 'figcaption'
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'src', 'alt', 'title', 'class', 'style', 'dir',
      'width', 'height', 'data-*', 'colspan', 'rowspan', 'border', 'align',
      'controls', 'preload'
    ],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit', 'onkeydown'],
    ALLOW_DATA_ATTR: true
  });
}

export default sanitizeContent;
