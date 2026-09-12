import React, { useState, useEffect, useRef } from 'react';
import {
  Copy,
  Download,
  Trash2,
  Edit3,
  Undo2,
  Redo2,
  Scissors,
  Clipboard,
  Check,
  Maximize2,
  Minimize2,
  ZoomIn,
  ChevronRight,
  Loader2,
  Info,
  Printer,
  Keyboard,
  History,
  Image as ImageIcon,
  Table as TableIcon,
  BarChart3,
  Mic,
  Volume2,
  Minus,
  Link,
  Bookmark,
  FileCode,
  LayoutGrid,
  FileText,
  Settings,
  Sliders,
  SpellCheck,
  GitCompare,
  Quote,
  SplitSquareVertical,
  Activity,
  Music
} from 'lucide-react';

const EditorMenuBar = ({
  // File actions
  onMakeCopy,
  onRename,
  onDelete,
  onExport,
  exportLoadingFormat,
  canDelete = true,
  canEdit = true,
  onOpenDetails,
  onOpenVersionHistory,
  onPrint,

  // Edit actions
  onUndo,
  onRedo,
  onCut,
  onCopyText,
  onPaste,
  onSelectAll,

  // View actions
  showToolbar = true,
  onToggleToolbar,
  isFullscreen = false,
  onToggleFullscreen,
  zoomLevel = 100,
  onSetZoom,

  // Insert actions
  onInsertLink,
  onInsertSymbol,
  onInsertHorizontalLine,
  onInsertImage,
  onInsertTable,
  onInsertAudio,
  onInsertChart,
  onInsertBookmark,
  onInsertPageBreak,
  onInsertBuildingBlock,

  // Tools actions
  onOpenWordCount,
  showLineNumbers = false,
  onToggleLineNumbers,
  onProofread,
  isVoiceTyping = false,
  onToggleVoiceTyping,
  onOpenCompare,
  onOpenCitations,
  onOpenPreferences,
  onOpenAccessibility,

  // Help actions
  onOpenShortcuts
}) => {
  const [activeMenu, setActiveMenu] = useState(null); // 'File' | 'Edit' | 'View' | 'Help' | null
  const [activeSubmenu, setActiveSubmenu] = useState(null); // 'download' | 'zoom' | null
  const menuBarRef = useRef(null);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target)) {
        setActiveMenu(null);
        setActiveSubmenu(null);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveMenu(null);
        setActiveSubmenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleMenuClick = (menuName) => {
    if (activeMenu === menuName) {
      setActiveMenu(null);
      setActiveSubmenu(null);
    } else {
      setActiveMenu(menuName);
      setActiveSubmenu(null);
    }
  };

  const handleMenuHover = (menuName) => {
    if (activeMenu !== null && activeMenu !== menuName) {
      setActiveMenu(menuName);
      setActiveSubmenu(null);
    }
  };

  const executeAction = (actionFn) => {
    setActiveMenu(null);
    setActiveSubmenu(null);
    if (typeof actionFn === 'function') {
      actionFn();
    }
  };

  const ZOOM_OPTIONS = [50, 75, 90, 100, 125, 150];

  return (
    <div ref={menuBarRef} className="flex items-center gap-0.5 text-[13px] text-gray-700 mt-0.5 relative select-none">
      {/* 1. FILE MENU */}
      <div className="relative">
        <button
          type="button"
          onClick={() => handleMenuClick('File')}
          onMouseEnter={() => handleMenuHover('File')}
          className={`px-2 py-0.5 rounded text-gray-700 hover:text-gray-900 transition ${
            activeMenu === 'File' ? 'bg-gray-200' : 'hover:bg-gray-100'
          }`}
        >
          File
        </button>

        {activeMenu === 'File' && (
          <div className="absolute left-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-sm shadow-lg py-1.5 z-50 text-[13px] text-gray-800">
            {/* Make a copy */}
            <button
              type="button"
              onClick={() => executeAction(onMakeCopy)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Copy className="w-4 h-4 text-gray-500" />
                Make a copy
              </span>
            </button>

            {/* Rename */}
            {canEdit && (
              <button
                type="button"
                onClick={() => executeAction(onRename)}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-gray-500" />
                  Rename
                </span>
              </button>
            )}

            {/* Download as Submenu */}
            <div
              className="relative"
              onMouseEnter={() => setActiveSubmenu('download')}
              onMouseLeave={() => setActiveSubmenu(null)}
            >
              <button
                type="button"
                onClick={() => setActiveSubmenu(activeSubmenu === 'download' ? null : 'download')}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-gray-500" />
                  Download
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              {/* Submenu Options */}
              {activeSubmenu === 'download' && (
                <div className="absolute left-full top-0 -ml-1 w-64 bg-white border border-gray-200 rounded-sm shadow-lg py-1.5 z-50">
                  <button
                    type="button"
                    disabled={!!exportLoadingFormat}
                    onClick={() => executeAction(() => onExport('pdf'))}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 disabled:opacity-60 transition text-left cursor-pointer"
                  >
                    <span>PDF Document (.pdf)</span>
                    {exportLoadingFormat === 'pdf' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    ) : (
                      <span className="text-[11px] text-gray-400 font-mono">PDF</span>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={!!exportLoadingFormat}
                    onClick={() => executeAction(() => onExport('docx'))}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 disabled:opacity-60 transition text-left cursor-pointer"
                  >
                    <span>Microsoft Word (.docx)</span>
                    {exportLoadingFormat === 'docx' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    ) : (
                      <span className="text-[11px] text-gray-400 font-mono">DOCX</span>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={!!exportLoadingFormat}
                    onClick={() => executeAction(() => onExport('txt'))}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 disabled:opacity-60 transition text-left cursor-pointer"
                  >
                    <span>Plain Text (.txt)</span>
                    {exportLoadingFormat === 'txt' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    ) : (
                      <span className="text-[11px] text-gray-400 font-mono">TXT</span>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={!!exportLoadingFormat}
                    onClick={() => executeAction(() => onExport('html'))}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 disabled:opacity-60 transition text-left cursor-pointer"
                  >
                    <span>Web Page (.html)</span>
                    {exportLoadingFormat === 'html' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    ) : (
                      <span className="text-[11px] text-gray-400 font-mono">HTML</span>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Version History */}
            <button
              type="button"
              onClick={() => executeAction(onOpenVersionHistory)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <History className="w-4 h-4 text-gray-500" />
                Version history
              </span>
            </button>

            {/* Document Details */}
            <button
              type="button"
              onClick={() => executeAction(onOpenDetails)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Info className="w-4 h-4 text-gray-500" />
                Document details
              </span>
            </button>

            <div className="my-1 border-t border-gray-200" />

            {/* Print */}
            <button
              type="button"
              onClick={() => executeAction(onPrint)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-gray-500" />
                Print
              </span>
              <span className="text-[11px] text-gray-400 font-mono">Ctrl+P</span>
            </button>

            {/* Delete / Move to Trash (Owner/Editor only) */}
            {canDelete && (
              <>
                <div className="my-1 border-t border-gray-200" />
                <button
                  type="button"
                  onClick={() => executeAction(onDelete)}
                  className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-red-50 text-red-600 transition text-left cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-red-500" />
                    Move to trash
                  </span>
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* 2. EDIT MENU */}
      <div className="relative">
        <button
          type="button"
          onClick={() => handleMenuClick('Edit')}
          onMouseEnter={() => handleMenuHover('Edit')}
          className={`px-2 py-0.5 rounded text-gray-700 hover:text-gray-900 transition ${
            activeMenu === 'Edit' ? 'bg-gray-200' : 'hover:bg-gray-100'
          }`}
        >
          Edit
        </button>

        {activeMenu === 'Edit' && (
          <div className="absolute left-0 top-full mt-1 w-60 bg-white border border-gray-200 rounded-sm shadow-lg py-1.5 z-50 text-[13px] text-gray-800">
            {/* Undo */}
            <button
              type="button"
              disabled={!canEdit}
              onClick={() => executeAction(onUndo)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 disabled:opacity-50 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Undo2 className="w-4 h-4 text-gray-500" />
                Undo
              </span>
              <span className="text-[11px] text-gray-400 font-mono">Ctrl+Z</span>
            </button>

            {/* Redo */}
            <button
              type="button"
              disabled={!canEdit}
              onClick={() => executeAction(onRedo)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 disabled:opacity-50 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Redo2 className="w-4 h-4 text-gray-500" />
                Redo
              </span>
              <span className="text-[11px] text-gray-400 font-mono">Ctrl+Y</span>
            </button>

            <div className="my-1 border-t border-gray-200" />

            {/* Cut */}
            <button
              type="button"
              disabled={!canEdit}
              onClick={() => executeAction(onCut)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 disabled:opacity-50 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Scissors className="w-4 h-4 text-gray-500" />
                Cut
              </span>
              <span className="text-[11px] text-gray-400 font-mono">Ctrl+X</span>
            </button>

            {/* Copy */}
            <button
              type="button"
              onClick={() => executeAction(onCopyText)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Copy className="w-4 h-4 text-gray-500" />
                Copy
              </span>
              <span className="text-[11px] text-gray-400 font-mono">Ctrl+C</span>
            </button>

            {/* Paste */}
            <button
              type="button"
              disabled={!canEdit}
              onClick={() => executeAction(onPaste)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 disabled:opacity-50 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Clipboard className="w-4 h-4 text-gray-500" />
                Paste
              </span>
              <span className="text-[11px] text-gray-400 font-mono">Ctrl+V</span>
            </button>

            <div className="my-1 border-t border-gray-200" />

            {/* Select All */}
            <button
              type="button"
              onClick={() => executeAction(onSelectAll)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span>Select all</span>
              <span className="text-[11px] text-gray-400 font-mono">Ctrl+A</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. VIEW MENU */}
      <div className="relative">
        <button
          type="button"
          onClick={() => handleMenuClick('View')}
          onMouseEnter={() => handleMenuHover('View')}
          className={`px-2 py-0.5 rounded text-gray-700 hover:text-gray-900 transition ${
            activeMenu === 'View' ? 'bg-gray-200' : 'hover:bg-gray-100'
          }`}
        >
          View
        </button>

        {activeMenu === 'View' && (
          <div className="absolute left-0 top-full mt-1 w-60 bg-white border border-gray-200 rounded-sm shadow-lg py-1.5 z-50 text-[13px] text-gray-800">
            {/* Show Toolbar Toggle */}
            <button
              type="button"
              onClick={() => executeAction(onToggleToolbar)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span className="w-4 flex justify-center">
                  {showToolbar && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </span>
                Show toolbar
              </span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => executeAction(onToggleFullscreen)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span className="w-4 flex justify-center">
                  {isFullscreen ? (
                    <Minimize2 className="w-3.5 h-3.5 text-gray-500" />
                  ) : (
                    <Maximize2 className="w-3.5 h-3.5 text-gray-500" />
                  )}
                </span>
                {isFullscreen ? 'Exit full screen' : 'Full screen'}
              </span>
            </button>

            {/* Zoom Submenu */}
            <div
              className="relative"
              onMouseEnter={() => setActiveSubmenu('zoom')}
              onMouseLeave={() => setActiveSubmenu(null)}
            >
              <button
                type="button"
                onClick={() => setActiveSubmenu(activeSubmenu === 'zoom' ? null : 'zoom')}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span className="w-4 flex justify-center">
                    <ZoomIn className="w-3.5 h-3.5 text-gray-500" />
                  </span>
                  Zoom ({zoomLevel}%)
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              {activeSubmenu === 'zoom' && (
                <div className="absolute left-full top-0 -ml-1 w-36 bg-white border border-gray-200 rounded-sm shadow-lg py-1.5 z-50">
                  {ZOOM_OPTIONS.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => executeAction(() => onSetZoom(val))}
                      className="w-full flex items-center justify-between px-3 py-1 hover:bg-gray-100 transition text-left text-xs cursor-pointer"
                    >
                      <span>{val}%</span>
                      {zoomLevel === val && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. INSERT MENU */}
      <div className="relative">
        <button
          type="button"
          onClick={() => handleMenuClick('Insert')}
          onMouseEnter={() => handleMenuHover('Insert')}
          className={`px-2 py-0.5 rounded text-gray-700 hover:text-gray-900 transition ${
            activeMenu === 'Insert' ? 'bg-gray-200' : 'hover:bg-gray-100'
          }`}
          aria-haspopup="true"
          aria-expanded={activeMenu === 'Insert'}
        >
          Insert
        </button>

        {activeMenu === 'Insert' && (
          <div className="absolute left-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-sm shadow-lg py-1.5 z-50 text-[13px] text-gray-800">
            {/* Image */}
            <button
              type="button"
              onClick={() => executeAction(onInsertImage)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-gray-500" />
                Image
              </span>
            </button>

            {/* Table */}
            <button
              type="button"
              onClick={() => executeAction(onInsertTable)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-gray-500" />
                Table
              </span>
            </button>

            {/* Chart */}
            <button
              type="button"
              onClick={() => executeAction(onInsertChart)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-gray-500" />
                Chart
              </span>
            </button>

            {/* Audio clip / button */}
            <button
              type="button"
              onClick={() => executeAction(onInsertAudio)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-gray-500" />
                Audio
              </span>
            </button>

            <div className="my-1 border-t border-gray-200" />

            {/* Horizontal line */}
            <button
              type="button"
              onClick={() => executeAction(onInsertHorizontalLine)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Minus className="w-4 h-4 text-gray-500" />
                Horizontal line
              </span>
            </button>

            {/* Link */}
            <button
              type="button"
              onClick={() => executeAction(onInsertLink)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Link className="w-4 h-4 text-gray-500" />
                Link
              </span>
              <span className="text-[11px] text-gray-400 font-mono">Ctrl+K</span>
            </button>

            {/* Special Characters / Symbols */}
            <button
              type="button"
              onClick={() => executeAction(onInsertSymbol)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-gray-500" />
                Special characters
              </span>
            </button>

            <div className="my-1 border-t border-gray-200" />

            {/* Bookmark */}
            <button
              type="button"
              onClick={() => executeAction(onInsertBookmark)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-gray-500" />
                Bookmark
              </span>
            </button>

            {/* Page Break */}
            <button
              type="button"
              onClick={() => executeAction(onInsertPageBreak)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <SplitSquareVertical className="w-4 h-4 text-gray-500" />
                Page break
              </span>
            </button>

            {/* Building blocks */}
            <button
              type="button"
              onClick={() => executeAction(onInsertBuildingBlock)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-gray-500" />
                Building blocks
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Passive Format button */}
      <button
        type="button"
        className="px-2 py-0.5 rounded hover:bg-gray-100 transition text-gray-700 hover:text-gray-900"
      >
        Format
      </button>

      {/* 5. TOOLS MENU */}
      <div className="relative">
        <button
          type="button"
          onClick={() => handleMenuClick('Tools')}
          onMouseEnter={() => handleMenuHover('Tools')}
          className={`px-2 py-0.5 rounded text-gray-700 hover:text-gray-900 transition ${
            activeMenu === 'Tools' ? 'bg-gray-200' : 'hover:bg-gray-100'
          }`}
          aria-haspopup="true"
          aria-expanded={activeMenu === 'Tools'}
        >
          Tools
        </button>

        {activeMenu === 'Tools' && (
          <div className="absolute left-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-sm shadow-lg py-1.5 z-50 text-[13px] text-gray-800">
            {/* Proofread */}
            <button
              type="button"
              onClick={() => executeAction(onProofread)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <SpellCheck className="w-4 h-4 text-gray-500" />
                Proofread
              </span>
            </button>

            {/* Word count */}
            <button
              type="button"
              onClick={() => executeAction(onOpenWordCount)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                Word count
              </span>
              <span className="text-[11px] text-gray-400 font-mono">Ctrl+Shift+C</span>
            </button>

            {/* Line numbers toggle */}
            <button
              type="button"
              onClick={() => executeAction(onToggleLineNumbers)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span className="w-4 flex justify-center">
                  {showLineNumbers && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </span>
                Line numbers
              </span>
            </button>

            <div className="my-1 border-t border-gray-200" />

            {/* Voice typing */}
            <button
              type="button"
              onClick={() => executeAction(onToggleVoiceTyping)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Mic className={`w-4 h-4 ${isVoiceTyping ? 'text-red-500 animate-pulse' : 'text-gray-500'}`} />
                Voice typing
              </span>
              <span className="text-[11px] text-gray-400 font-mono">Ctrl+Shift+S</span>
            </button>

            {/* Compare documents */}
            <button
              type="button"
              onClick={() => executeAction(onOpenCompare)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <GitCompare className="w-4 h-4 text-gray-500" />
                Compare documents
              </span>
            </button>

            {/* Citations */}
            <button
              type="button"
              onClick={() => executeAction(onOpenCitations)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Quote className="w-4 h-4 text-gray-500" />
                Citations
              </span>
            </button>

            <div className="my-1 border-t border-gray-200" />

            {/* Notification settings */}
            <button
              type="button"
              onClick={() => executeAction(onOpenPreferences)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-gray-500" />
                Notification settings
              </span>
            </button>

            {/* Preferences */}
            <button
              type="button"
              onClick={() => executeAction(onOpenPreferences)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-gray-500" />
                Preferences
              </span>
            </button>

            {/* Accessibility */}
            <button
              type="button"
              onClick={() => executeAction(onOpenAccessibility)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-gray-500" />
                Accessibility
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Passive Extensions button */}
      <button
        type="button"
        className="px-2 py-0.5 rounded hover:bg-gray-100 transition text-gray-700 hover:text-gray-900"
      >
        Extensions
      </button>

      {/* 4. HELP MENU */}
      <div className="relative">
        <button
          type="button"
          onClick={() => handleMenuClick('Help')}
          onMouseEnter={() => handleMenuHover('Help')}
          className={`px-2 py-0.5 rounded text-gray-700 hover:text-gray-900 transition ${
            activeMenu === 'Help' ? 'bg-gray-200' : 'hover:bg-gray-100'
          }`}
        >
          Help
        </button>

        {activeMenu === 'Help' && (
          <div className="absolute left-0 top-full mt-1 w-60 bg-white border border-gray-200 rounded-sm shadow-lg py-1.5 z-50 text-[13px] text-gray-800">
            <button
              type="button"
              onClick={() => executeAction(onOpenShortcuts)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-gray-500" />
                Keyboard shortcuts
              </span>
              <span className="text-[11px] text-gray-400 font-mono">Ctrl+/</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorMenuBar;
