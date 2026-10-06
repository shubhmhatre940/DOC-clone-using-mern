import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDocument, uploadDocument, getTemplates } from '../../api/documents';
import TemplatePreviewCard from './TemplatePreviewCard';
import { Plus, UploadCloud, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

const TemplateHeader = () => {
  const [creating, setCreating] = useState(false);
  const [creatingTemplateId, setCreatingTemplateId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAllTemplates, setShowAllTemplates] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const data = await getTemplates();
        setTemplates(data);
      } catch (err) {
        console.warn('Could not fetch templates from backend, using fallback:', err);
      }
    };
    fetchTemplates();
  }, []);

  const handleCreateFromTemplate = async (template) => {
    if (creating || uploading) return;
    try {
      setCreating(true);
      setCreatingTemplateId(template.id);
      const newDoc = await createDocument({
        title: template.defaultTitle || template.name || 'Untitled document',
        content: template.content || ''
      });
      navigate(`/document/${newDoc._id}`);
    } catch (err) {
      console.error('Failed to create document from template:', err);
      alert('Could not create document from template. Please try again.');
    } finally {
      setCreating(false);
      setCreatingTemplateId(null);
    }
  };

  const handleCreateBlank = async () => {
    if (creating || uploading) return;
    try {
      setCreating(true);
      const newDoc = await createDocument({ title: 'Untitled document', content: '' });
      navigate(`/document/${newDoc._id}`);
    } catch (err) {
      console.error('Failed to create new document:', err);
      alert('Could not create a new document. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side extension validation
    if (!file.name.toLowerCase().endsWith('.docx')) {
      alert('Could not read this file — please make sure it is a valid .docx file.');
      e.target.value = '';
      return;
    }

    try {
      setUploading(true);
      setUploadError(null);
      const formData = new FormData();
      formData.append('file', file);

      console.log('[Frontend Upload] Preparing to upload file:', file.name, 'size:', file.size);
      for (const [key, value] of formData.entries()) {
        console.log(`[Frontend Upload FormData] key: "${key}", value:`, value);
      }

      const createdDoc = await uploadDocument(formData);
      console.log('[Frontend Upload] Successfully created doc:', createdDoc?._id);
      navigate(`/document/${createdDoc._id}`);
    } catch (err) {
      console.error('Failed to upload docx file:', err);
      const serverMsg = err.response?.data?.message;
      const networkMsg = err.message;
      const errMsg = serverMsg || (networkMsg ? `Upload failed: ${networkMsg}` : 'Could not read this file — please make sure it is a valid .docx file.');
      setUploadError(errMsg);
      alert(errMsg);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const categories = ['All', ...new Set(templates.map((t) => t.category).filter(Boolean))];

  const filteredTemplates = selectedCategory === 'All'
    ? templates
    : templates.filter((t) => t.category === selectedCategory);

  // In collapsed mode, display up to 4 templates; when expanded, display all matching category
  const displayedTemplates = showAllTemplates ? filteredTemplates : filteredTemplates.slice(0, 4);

  return (
    <section className="bg-[#f1f3f4] dark:bg-[#191a1d] py-6 px-4 md:px-8 border-b border-gray-200 dark:border-neutral-800 transition-colors duration-200">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Start a new document</h2>

          {templates.length > 0 && (
            <button
              type="button"
              onClick={() => setShowAllTemplates((prev) => !prev)}
              className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition hover:bg-gray-200 dark:hover:bg-neutral-800 px-2.5 py-1 rounded-lg cursor-pointer"
            >
              <span>{showAllTemplates ? 'Hide template gallery' : 'Template gallery'}</span>
              {showAllTemplates ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>

        {/* Category Filters (visible when expanded) */}
        {showAllTemplates && categories.length > 1 && (
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-[#232529] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 border border-gray-200 dark:border-neutral-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-start gap-4 sm:gap-6 overflow-x-auto pb-2">
          {/* 1. Blank Document Card */}
          <div className="flex flex-col items-start shrink-0">
            <button
              onClick={handleCreateBlank}
              disabled={creating || uploading}
              className="group relative flex h-36 w-28 sm:h-44 sm:w-34 items-center justify-center rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-[#222428] shadow-xs transition-all duration-200 hover:border-blue-600 dark:hover:border-blue-500 hover:shadow-md focus:outline-none cursor-pointer disabled:opacity-60"
            >
              {creating && !creatingTemplateId ? (
                <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              ) : (
                <div className="relative flex items-center justify-center">
                  {/* Google colored plus icon */}
                  <svg
                    className="w-10 h-10 transition-transform duration-200 group-hover:scale-110"
                    viewBox="0 0 40 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M20 8V32" stroke="#4285F4" strokeWidth="4" strokeLinecap="round" />
                    <path d="M8 20H32" stroke="#EA4335" strokeWidth="4" strokeLinecap="round" />
                    <path d="M20 8V20H8" stroke="#FBBC05" strokeWidth="4" strokeLinecap="round" />
                    <path d="M20 20H32V32" stroke="#34A853" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                </div>
              )}
            </button>
            <span className="mt-2 text-xs font-semibold text-gray-800 dark:text-gray-200">Blank document</span>
          </div>

          {/* 2. Upload Word Document (.docx) Card */}
          <div className="flex flex-col items-start shrink-0">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              className="group relative flex h-36 w-28 sm:h-44 sm:w-34 flex-col items-center justify-center rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-[#222428] transition-all duration-200 hover:border-blue-600 dark:hover:border-blue-500 hover:shadow-md cursor-pointer"
            >
              {uploading ? (
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              ) : (
                <div className="w-11 h-11 rounded-full bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 transition-transform duration-200 group-hover:scale-110">
                  <UploadCloud className="w-6 h-6" />
                </div>
              )}
            </button>
            <span className="mt-2 text-xs font-semibold text-gray-800 dark:text-gray-200">Import Word (.docx)</span>
          </div>

          {/* 3. Pre-formatted Template Cards */}
          {displayedTemplates.map((template) => (
            <div key={template.id} className="flex flex-col items-start shrink-0">
              <button
                type="button"
                onClick={() => handleCreateFromTemplate(template)}
                disabled={creating || uploading}
                className="group relative flex h-36 w-28 sm:h-44 sm:w-34 items-center justify-center rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-[#222428] shadow-xs transition-all duration-200 hover:border-blue-600 dark:hover:border-blue-500 hover:shadow-md focus:outline-none cursor-pointer disabled:opacity-60 overflow-hidden"
                title={`Create from ${template.name} (${template.category || 'General'})`}
              >
                {creatingTemplateId === template.id ? (
                  <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                ) : (
                  <TemplatePreviewCard type={template.previewType || template.id} />
                )}
              </button>
              <span className="mt-2 text-xs font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[112px] sm:max-w-[136px]">
                {template.name}
              </span>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 capitalize font-medium">
                {template.category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TemplateHeader;

