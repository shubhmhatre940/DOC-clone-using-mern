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
  Loader2
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
  onSetZoom
}) => {
  const [activeMenu, setActiveMenu] = useState(null); // 'File' | 'Edit' | 'View' | null
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

      {/* Passive Menu Labels (Insert, Format, Tools, Extensions, Help) */}
      {['Insert', 'Format', 'Tools', 'Extensions', 'Help'].map((item) => (
        <button
          key={item}
          type="button"
          className="px-2 py-0.5 rounded hover:bg-gray-100 transition text-gray-700 hover:text-gray-900"
        >
          {item}
        </button>
      ))}
    </div>
  );
};

export default EditorMenuBar;
