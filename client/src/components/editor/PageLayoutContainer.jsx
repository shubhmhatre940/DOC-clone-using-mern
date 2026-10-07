import React, { useState, useEffect, useRef } from 'react';
import { FileText, Layout, Check, Edit2, Trash2 } from 'lucide-react';

const PageLayoutContainer = ({
  children,
  isPageless = false,
  orientation = 'portrait', // 'portrait' | 'landscape'
  headerText = '',
  footerText = '',
  showPageNumbers = false,
  pageNumberPosition = 'footer-right', // 'header-right' | 'footer-right' | 'footer-center'
  onUpdatePageSettings,
  isEditable = true,
  zoomLevel = 100,
  showLineNumbers = false,
  isReadingMode = false,
  editor = null,
  isEditingHeaderFooter = false,
  onCloseHeaderFooter,
  showHeaderFooter = false
}) => {
  const contentWrapperRef = useRef(null);
  const [pageCount, setPageCount] = useState(1);
  const [localHeaderText, setLocalHeaderText] = useState(headerText);
  const [localFooterText, setLocalFooterText] = useState(footerText);
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [isEditingFooter, setIsEditingFooter] = useState(false);

  useEffect(() => {
    setLocalHeaderText(headerText);
  }, [headerText]);

  useEffect(() => {
    setLocalFooterText(footerText);
  }, [footerText]);

  // Dimensions based on standard US Letter (96 DPI)
  // Portrait: 8.5in x 11in = 816px x 1056px
  // Landscape: 11in x 8.5in = 1056px x 816px
  const isLandscape = orientation === 'landscape';
  const pageWidth = isLandscape ? 1056 : 816;
  const pageHeight = isLandscape ? 816 : 1056;

  // Printable body height (excluding 1in top & bottom margins = 192px)
  const usableBodyHeight = pageHeight - 192;

  // Dynamically calculate page count based on content height and manual page breaks
  useEffect(() => {
    if (isPageless || isReadingMode) {
      setPageCount(1);
      return;
    }

    const calculatePages = () => {
      if (!contentWrapperRef.current) return;
      const editorElement = contentWrapperRef.current.querySelector('.tiptap');
      if (!editorElement) return;

      const scrollH = editorElement.scrollHeight;
      const countFromHeight = Math.max(1, Math.ceil(scrollH / Math.max(usableBodyHeight, 400)));

      // Count manual page-break divs
      const manualBreaks = editorElement.querySelectorAll('.page-break').length;
      const total = Math.max(1, Math.max(countFromHeight, manualBreaks + 1));
      setPageCount(total);
    };

    calculatePages();
    const interval = setInterval(calculatePages, 800);

    const observer = new ResizeObserver(() => {
      calculatePages();
    });

    if (contentWrapperRef.current) {
      observer.observe(contentWrapperRef.current);
    }

    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, [isPageless, isLandscape, isReadingMode, usableBodyHeight, children]);

  const handleSaveHeader = () => {
    setIsEditingHeader(false);
    if (onUpdatePageSettings && localHeaderText !== headerText) {
      onUpdatePageSettings({ headerText: localHeaderText });
    }
  };

  const handleSaveFooter = () => {
    setIsEditingFooter(false);
    if (onUpdatePageSettings && localFooterText !== footerText) {
      onUpdatePageSettings({ footerText: localFooterText });
    }
  };

  const handleRemoveHeader = () => {
    setLocalHeaderText('');
    setIsEditingHeader(false);
    if (onUpdatePageSettings) {
      onUpdatePageSettings({ headerText: '' });
    }
  };

  const handleRemoveFooter = () => {
    setLocalFooterText('');
    setIsEditingFooter(false);
    if (onUpdatePageSettings) {
      onUpdatePageSettings({ footerText: '' });
    }
  };

  const handleRemoveBoth = () => {
    setLocalHeaderText('');
    setLocalFooterText('');
    setIsEditingHeader(false);
    setIsEditingFooter(false);
    if (onUpdatePageSettings) {
      // Reset showHeaderFooter so the bands disappear from the document
      onUpdatePageSettings({ headerText: '', footerText: '', showHeaderFooter: false });
    }
    if (onCloseHeaderFooter) onCloseHeaderFooter();
  };

  // Synchronize when parent triggers header/footer editing modal
  useEffect(() => {
    if (isEditingHeaderFooter) {
      setIsEditingHeader(true);
      setIsEditingFooter(true);
    }
  }, [isEditingHeaderFooter]);

  // PAGELESS MODE RENDERING
  if (isPageless) {
    return (
      <div className="flex-1 overflow-auto py-6 px-4 flex flex-col items-center cursor-text">
        <div
          className={`w-full max-w-[920px] min-h-[950px] bg-white dark:bg-[#1e1f20] rounded-lg shadow-sm border border-gray-200 dark:border-[#383a3d] px-8 sm:px-16 py-10 transition-all duration-150 ${
            showLineNumbers && !isReadingMode ? 'show-line-numbers' : ''
          }`}
          style={{
            transform: zoomLevel !== 100 ? `scale(${zoomLevel / 100})` : undefined,
            transformOrigin: 'top center'
          }}
          onClick={() => isEditable && editor?.commands.focus()}
        >
          <div className="mb-4 pb-2 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between text-xs text-gray-400 select-none">
            <span className="flex items-center gap-1.5 font-medium text-gray-500">
              <Layout className="w-3.5 h-3.5" />
              Pageless view — Continuous scroll
            </span>
            <span className="text-[11px]">No page breaks or page limits</span>
          </div>
          {children}
        </div>
      </div>
    );
  }

  // READING MODE RENDERING
  if (isReadingMode) {
    return (
      <div className="flex-1 overflow-auto py-8 px-4 flex justify-center cursor-text">
        <div
          className="w-full max-w-[760px] min-h-[900px] bg-white rounded-lg shadow-sm border border-gray-200 px-8 sm:px-14 md:px-18 py-10 sm:py-16 text-[17px] leading-relaxed font-serif text-gray-900"
          style={{
            transform: zoomLevel !== 100 ? `scale(${zoomLevel / 100})` : undefined,
            transformOrigin: 'top center'
          }}
        >
          {children}
        </div>
      </div>
    );
  }

  // PAGINATED (PAGES) MODE RENDERING
  return (
    <div className="flex-1 overflow-auto py-6 sm:py-8 px-2 sm:px-4 flex flex-col items-center cursor-text">
      {/* Active Header/Footer Editing Toolbar Banner */}
      {(isEditingHeader || isEditingFooter || isEditingHeaderFooter) && (
        <div className="sticky top-0 z-30 mb-4 bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-2 flex flex-wrap items-center justify-between gap-3 shadow-md max-w-[850px] w-full text-xs text-blue-900 dark:text-blue-100 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="font-semibold">Headers &amp; Footers mode</span>
            <span className="text-blue-600 dark:text-blue-300 hidden sm:inline">
              — Content repeats on every page in Paginated view and PDF export.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRemoveBoth}
              title="Remove both header and footer from document"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-800/60 text-red-700 dark:text-red-300 font-medium transition cursor-pointer shadow-xs border border-red-200 dark:border-red-700"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove Header &amp; Footer
            </button>
            <button
              type="button"
              onClick={() => {
                handleSaveHeader();
                handleSaveFooter();
                if (onCloseHeaderFooter) onCloseHeaderFooter();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium transition cursor-pointer shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              Done
            </button>
          </div>
        </div>
      )}

      {/* Scaled Canvas Container */}
      <div
        className="flex flex-col items-center transition-all duration-150 relative"
        style={{
          transform: zoomLevel !== 100 ? `scale(${zoomLevel / 100})` : undefined,
          transformOrigin: 'top center'
        }}
        onClick={() => isEditable && editor?.commands.focus()}
      >
        {/* Document Sheet simulating continuous pages with discrete header & footer overlays */}
        <div
          ref={contentWrapperRef}
          className={`page-sheet bg-white dark:bg-[#1e1f20] border border-gray-200 dark:border-[#383a3d] rounded-xs relative transition-all duration-200 ${
            showLineNumbers ? 'show-line-numbers' : ''
          }`}
          style={{
            width: `${pageWidth}px`,
            minHeight: `${pageHeight}px`,
            paddingLeft: '64px',
            paddingRight: '64px',
            paddingTop: '64px',
            paddingBottom: '64px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Band — only rendered when user has opted in via Format menu */}
          {showHeaderFooter && (
            <div
              className={`mb-4 pb-2 border-b transition-colors select-none flex items-center justify-between text-xs ${
                isEditingHeader
                  ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-900/20 p-2 rounded'
                  : 'border-gray-200 dark:border-neutral-800 text-gray-500 hover:border-blue-300 cursor-pointer'
              }`}
              onDoubleClick={() => setIsEditingHeader(true)}
              title="Double-click to edit Header"
            >
              {isEditingHeader ? (
                <div className="w-full flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">Header:</span>
                  <input
                    type="text"
                    value={localHeaderText}
                    onChange={(e) => setLocalHeaderText(e.target.value)}
                    onBlur={handleSaveHeader}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveHeader()}
                    placeholder="Type header text (e.g., Company, Document Title)..."
                    className="flex-1 bg-white dark:bg-neutral-800 border border-blue-300 rounded px-2 py-1 text-xs text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleRemoveHeader}
                    title="Remove header"
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-800/60 text-red-600 dark:text-red-300 text-xs rounded border border-red-200 dark:border-red-700 transition"
                  >
                    <Trash2 className="w-3 h-3" />
                    Remove
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveHeader}
                    className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <>
                  <span className="truncate max-w-[70%] font-medium">
                    {headerText || (
                      <span className="text-gray-400 italic text-[11px]">
                        {isEditable ? 'Header (Double-click to edit)' : ''}
                      </span>
                    )}
                  </span>
                  {showPageNumbers && pageNumberPosition === 'header-right' && (
                    <span className="font-mono text-gray-500 text-[11px] bg-gray-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
                      Page 1 of {pageCount}
                    </span>
                  )}
                </>
              )}
            </div>
          )}

          {/* Primary TipTap ProseMirror Content Area */}
          <div className="min-h-[720px]">{children}</div>

          {/* Footer Band — only rendered when user has opted in via Format menu */}
          {showHeaderFooter && (
            <div
              className={`mt-6 pt-3 border-t transition-colors select-none flex items-center justify-between text-xs ${
                isEditingFooter
                  ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-900/20 p-2 rounded'
                  : 'border-gray-200 dark:border-neutral-800 text-gray-500 hover:border-blue-300 cursor-pointer'
              }`}
              onDoubleClick={() => setIsEditingFooter(true)}
              title="Double-click to edit Footer"
            >
              {isEditingFooter ? (
                <div className="w-full flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">Footer:</span>
                  <input
                    type="text"
                    value={localFooterText}
                    onChange={(e) => setLocalFooterText(e.target.value)}
                    onBlur={handleSaveFooter}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveFooter()}
                    placeholder="Type footer text (e.g., Confidential, Author)..."
                    className="flex-1 bg-white dark:bg-neutral-800 border border-blue-300 rounded px-2 py-1 text-xs text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleRemoveFooter}
                    title="Remove footer"
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-800/60 text-red-600 dark:text-red-300 text-xs rounded border border-red-200 dark:border-red-700 transition"
                  >
                    <Trash2 className="w-3 h-3" />
                    Remove
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveFooter}
                    className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <>
                  <span className="truncate max-w-[70%] font-medium">
                    {footerText || (
                      <span className="text-gray-400 italic text-[11px]">
                        {isEditable ? 'Footer (Double-click to edit)' : ''}
                      </span>
                    )}
                  </span>
                  {showPageNumbers && pageNumberPosition !== 'header-right' && (
                    <span
                      className={`font-mono text-gray-500 text-[11px] bg-gray-100 dark:bg-neutral-800 px-2 py-0.5 rounded ${
                        pageNumberPosition === 'footer-center' ? 'mx-auto' : ''
                      }`}
                    >
                      Page 1 of {pageCount}
                    </span>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Page status pill below document */}
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-400 select-none">
          <FileText className="w-3.5 h-3.5" />
          <span>
            {isLandscape ? 'Landscape' : 'Portrait'} ({pageWidth} × {pageHeight}px)
          </span>
          <span>•</span>
          <span>
            {pageCount} {pageCount === 1 ? 'page' : 'pages'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PageLayoutContainer;
