import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDocument, uploadDocument, getTemplates } from '../../api/documents';
import TemplatePreviewCard from './TemplatePreviewCard';
import { Plus, UploadCloud, Loader2, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { showToast } from '../ui/Toast';

const TemplateHeader = () => {
  const [creating, setCreating] = useState(false);
  const [creatingTemplateId, setCreatingTemplateId] = useState(null);
  const [uploading, setUploading] = useState(false);
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
      showToast(`Created document from ${template.name}`, 'success');
      navigate(`/document/${newDoc._id}`);
    } catch (err) {
      console.error('Failed to create document from template:', err);
      showToast('Could not create document from template', 'error');
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
      showToast('New document created', 'success');
      navigate(`/document/${newDoc._id}`);
    } catch (err) {
      console.error('Failed to create new document:', err);
      showToast('Could not create document', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.docx')) {
      showToast('Please select a valid .docx document', 'error');
      e.target.value = '';
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const createdDoc = await uploadDocument(formData);
      showToast(`Imported ${file.name}`, 'success');
      navigate(`/document/${createdDoc._id}`);
    } catch (err) {
      console.error('Failed to upload docx file:', err);
      showToast('Could not import Word document', 'error');
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

  const displayedTemplates = showAllTemplates ? filteredTemplates : filteredTemplates.slice(0, 4);

  return (
    <section className="bg-slate-100/70 dark:bg-[#161719] py-6 px-4 md:px-8 border-b border-slate-200/80 dark:border-neutral-800 transition-colors duration-200">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Start a new document
            </h2>
          </div>

          {templates.length > 0 && (
            <button
              type="button"
              onClick={() => setShowAllTemplates((prev) => !prev)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition hover:bg-blue-50 dark:hover:bg-blue-950/40 px-3 py-1.5 rounded-xl cursor-pointer"
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

        {/* Category Filters (visible when gallery expanded) */}
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
                    : 'bg-white dark:bg-[#202226] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-neutral-800 border border-slate-200 dark:border-neutral-700'
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
              className="group relative flex h-36 w-28 sm:h-44 sm:w-34 items-center justify-center rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-[#1e2024] shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md focus:outline-none cursor-pointer disabled:opacity-60"
            >
              {creating && !creatingTemplateId ? (
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-200">
                  <Plus className="w-7 h-7 stroke-[2.2]" />
                </div>
              )}
            </button>
            <span className="mt-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
              Blank document
            </span>
          </div>

          {/* 2. Import Word Document (.docx) */}
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
              className="group relative flex h-36 w-28 sm:h-44 sm:w-34 flex-col items-center justify-center rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-[#1e2024] shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md cursor-pointer"
            >
              {uploading ? (
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-200">
                  <UploadCloud className="w-6 h-6 stroke-[2]" />
                </div>
              )}
            </button>
            <span className="mt-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
              Import (.docx)
            </span>
          </div>

          {/* 3. Pre-formatted Template Cards */}
          {displayedTemplates.map((template) => (
            <div key={template.id} className="flex flex-col items-start shrink-0">
              <button
                type="button"
                onClick={() => handleCreateFromTemplate(template)}
                disabled={creating || uploading}
                className="group relative flex h-36 w-28 sm:h-44 sm:w-34 items-center justify-center rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-[#1e2024] shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md focus:outline-none cursor-pointer disabled:opacity-60 overflow-hidden"
              >
                {creatingTemplateId === template.id ? (
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                ) : (
                  <TemplatePreviewCard type={template.previewType || template.id} />
                )}
              </button>
              <span className="mt-2 text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[112px] sm:max-w-[136px]">
                {template.name}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 capitalize font-medium">
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
