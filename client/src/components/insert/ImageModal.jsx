import React, { useState } from 'react';
import { X, Image as ImageIcon, Upload, Globe, Loader2 } from 'lucide-react';

const ImageModal = ({ isOpen, onClose, editor }) => {
  const [tab, setTab] = useState('upload'); // 'upload' | 'url'
  const [url, setUrl] = useState('');
  const [filePreview, setFilePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, GIF, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFilePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleInsert = (e) => {
    e.preventDefault();
    const finalSrc = tab === 'upload' ? filePreview : url.trim();

    if (!finalSrc) {
      alert('Please select an image or provide a valid URL.');
      return;
    }

    if (editor) {
      editor.chain().focus().setImage({ src: finalSrc, alt: 'Document Image' }).run();
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4 animate-in fade-in duration-150 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="image-modal-title"
      >
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-blue-600" />
            <h2 id="image-modal-title" className="text-sm font-semibold text-gray-900">
              Insert image
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-gray-100 px-4 pt-1 bg-gray-50/50">
          <button
            type="button"
            onClick={() => setTab('upload')}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 transition cursor-pointer ${
              tab === 'upload'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Upload from computer
          </button>
          <button
            type="button"
            onClick={() => setTab('url')}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 transition cursor-pointer ${
              tab === 'url'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            By URL
          </button>
        </div>

        <form onSubmit={handleInsert} className="p-4 space-y-4 text-xs">
          {tab === 'upload' ? (
            <div>
              {filePreview ? (
                <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 p-2 flex flex-col items-center">
                  <img
                    src={filePreview}
                    alt="Preview"
                    className="max-h-48 rounded-lg object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => setFilePreview(null)}
                    className="mt-2 text-xs text-red-600 hover:underline"
                  >
                    Choose different image
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50/40 transition cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-xs font-medium text-gray-700">
                    Click to select an image
                  </span>
                  <span className="text-[11px] text-gray-400 mt-0.5">
                    PNG, JPG, GIF up to 10MB
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-gray-600 font-medium mb-1">Paste image URL</label>
              <input
                type="text"
                autoFocus
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/image.png"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          )}

          <div className="pt-2 border-t border-gray-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={(tab === 'upload' && !filePreview) || (tab === 'url' && !url.trim())}
              className="px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-xs disabled:opacity-50"
            >
              Insert
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImageModal;
