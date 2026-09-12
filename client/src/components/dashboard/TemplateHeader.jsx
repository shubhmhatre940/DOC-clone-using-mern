import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDocument } from '../../api/documents';
import { Plus } from 'lucide-react';

const TemplateHeader = () => {
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  const handleCreateBlank = async () => {
    if (creating) return;
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

  return (
    <section className="bg-[#f1f3f4] py-6 px-4 md:px-8 border-b border-gray-200">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-gray-700">Start a new document</h2>
        </div>

        <div className="flex items-start gap-6">
          {/* Blank Document Card */}
          <div className="flex flex-col items-start">
            <button
              onClick={handleCreateBlank}
              disabled={creating}
              className="group relative flex h-36 w-28 sm:h-44 sm:w-34 items-center justify-center rounded-md border border-gray-300 bg-white shadow-xs transition hover:border-[#1a73e8] hover:shadow-md focus:outline-none cursor-pointer disabled:opacity-60"
            >
              {creating ? (
                <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              ) : (
                <div className="relative flex items-center justify-center">
                  {/* Google colored plus icon */}
                  <svg
                    className="w-10 h-10 transition-transform group-hover:scale-110"
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
            <span className="mt-2 text-xs font-medium text-gray-800">Blank document</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TemplateHeader;
