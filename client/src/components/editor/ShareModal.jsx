import React, { useState, useEffect } from 'react';
import {
  X,
  Link as LinkIcon,
  Check,
  Globe,
  Lock,
  User,
  Trash2,
  Send,
  Loader2,
  AlertCircle
} from 'lucide-react';
import {
  getCollaborators,
  addCollaborator,
  removeCollaborator,
  updateVisibility
} from '../../api/share';

const ShareModal = ({ isOpen, onClose, docId, docTitle, isOwner = true }) => {
  const [collaborators, setCollaborators] = useState([]);
  const [owner, setOwner] = useState(null);
  const [visibility, setVisibility] = useState('private');
  const [linkRole, setLinkRole] = useState('viewer');
  const [emailInput, setEmailInput] = useState('');
  const [selectedRole, setSelectedRole] = useState('editor');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  // Fetch current share status
  const fetchShareData = async () => {
    try {
      setLoading(true);
      const data = await getCollaborators(docId);
      setOwner(data.owner);
      setCollaborators(data.collaborators || []);
      setVisibility(data.visibility || 'private');
      setLinkRole(data.linkRole || 'viewer');
      setError(null);
    } catch (err) {
      console.error('Failed to fetch share settings:', err);
      setError('Could not load sharing settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && docId) {
      fetchShareData();
    }
  }, [isOpen, docId]);

  if (!isOpen) return null;

  // Invite or update collaborator
  const handleAddCollaborator = async (e) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    try {
      setSubmitting(true);
      setError(null);
      await addCollaborator(docId, emailInput.trim(), selectedRole);
      setEmailInput('');
      await fetchShareData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add collaborator');
    } finally {
      setSubmitting(false);
    }
  };

  // Remove collaborator
  const handleRemoveCollaborator = async (userId) => {
    try {
      setError(null);
      await removeCollaborator(docId, userId);
      await fetchShareData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove collaborator');
    }
  };

  // Change existing collaborator role
  const handleChangeRole = async (email, newRole) => {
    try {
      await addCollaborator(docId, email, newRole);
      await fetchShareData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change role');
    }
  };

  // Toggle visibility
  const handleVisibilityChange = async (newVisibility) => {
    try {
      setVisibility(newVisibility);
      await updateVisibility(docId, newVisibility, linkRole);
    } catch (err) {
      setError('Failed to update visibility');
      await fetchShareData();
    }
  };

  // Change link role
  const handleLinkRoleChange = async (newLinkRole) => {
    try {
      setLinkRole(newLinkRole);
      await updateVisibility(docId, visibility, newLinkRole);
    } catch (err) {
      setError('Failed to update link role');
      await fetchShareData();
    }
  };

  // Copy shareable link
  const handleCopyLink = () => {
    const url = `${window.location.origin}/document/${docId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-gray-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-gray-900 truncate">
              Share "{docTitle || 'Untitled document'}"
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 p-2.5 text-xs text-red-700 border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
            <p className="text-xs text-gray-500">Loading sharing settings...</p>
          </div>
        ) : (
          <div className="mt-4 space-y-6">
            {/* Add Collaborator Input (Owner only) */}
            {isOwner && (
              <form onSubmit={handleAddCollaborator} className="flex items-center gap-2">
                <input
                  type="email"
                  placeholder="Add people by email..."
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />

                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-blue-600 cursor-pointer"
                >
                  <option value="editor">Editor</option>
                  <option value="commenter">Commenter</option>
                  <option value="viewer">Viewer</option>
                </select>

                <button
                  type="submit"
                  disabled={submitting || !emailInput.trim()}
                  className="flex items-center gap-1.5 rounded-lg bg-[#1a73e8] px-3.5 py-2 text-sm font-medium text-white hover:bg-[#1557b0] transition disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* People with access list */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                People with access
              </h3>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {/* Document Owner */}
                {owner && (
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold shrink-0">
                        {owner.name ? owner.name[0].toUpperCase() : 'O'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">
                          {owner.name} <span className="text-gray-400">(you)</span>
                        </p>
                        <p className="text-[11px] text-gray-500 truncate">{owner.email}</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-gray-500 px-2 py-1 bg-gray-100 rounded">
                      Owner
                    </span>
                  </div>
                )}

                {/* Collaborators */}
                {collaborators.map((c) => {
                  const cUser = c.userId || {};
                  return (
                    <div
                      key={c._id || cUser._id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-semibold shrink-0">
                          {cUser.name ? cUser.name[0].toUpperCase() : 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-900 truncate">
                            {cUser.name || 'User'}
                          </p>
                          <p className="text-[11px] text-gray-500 truncate">{cUser.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isOwner ? (
                          <>
                            <select
                              value={c.role}
                              onChange={(e) => handleChangeRole(cUser.email, e.target.value)}
                              className="text-xs border border-gray-300 rounded px-2 py-1 bg-white text-gray-700 focus:outline-none"
                            >
                              <option value="editor">Editor</option>
                              <option value="commenter">Commenter</option>
                              <option value="viewer">Viewer</option>
                            </select>

                            <button
                              type="button"
                              onClick={() => handleRemoveCollaborator(cUser._id)}
                              className="p-1 rounded text-gray-400 hover:text-red-600 transition"
                              title="Remove access"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <span className="text-xs capitalize text-gray-600 px-2 py-1 bg-gray-100 rounded">
                            {c.role}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* General Access / Link Sharing */}
            <div className="pt-3 border-t border-gray-100">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                General access
              </h3>

              <div className="flex items-start justify-between gap-3 p-2 rounded-lg bg-gray-50 border border-gray-200">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-0.5 p-2 rounded-full bg-white border border-gray-200 text-gray-600 shrink-0">
                    {visibility === 'anyone-with-link' ? (
                      <Globe className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Lock className="w-4 h-4 text-gray-600" />
                    )}
                  </div>

                  <div>
                    {isOwner ? (
                      <select
                        value={visibility}
                        onChange={(e) => handleVisibilityChange(e.target.value)}
                        className="text-xs font-semibold text-gray-900 bg-transparent border-none focus:outline-none cursor-pointer"
                      >
                        <option value="private">Restricted</option>
                        <option value="anyone-with-link">Anyone with the link</option>
                      </select>
                    ) : (
                      <p className="text-xs font-semibold text-gray-900">
                        {visibility === 'anyone-with-link' ? 'Anyone with the link' : 'Restricted'}
                      </p>
                    )}

                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {visibility === 'anyone-with-link'
                        ? 'Anyone on the internet with this link can access'
                        : 'Only people with access can open with the link'}
                    </p>
                  </div>
                </div>

                {visibility === 'anyone-with-link' && isOwner && (
                  <select
                    value={linkRole}
                    onChange={(e) => handleLinkRoleChange(e.target.value)}
                    className="text-xs border border-gray-300 rounded px-2 py-1 bg-white text-gray-700 focus:outline-none"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                  </select>
                )}
              </div>
            </div>

            {/* Footer: Copy Link & Done */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-300 text-xs font-medium text-[#1a73e8] hover:bg-blue-50 transition"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">Link copied</span>
                  </>
                ) : (
                  <>
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Copy link</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-full bg-[#1a73e8] text-xs font-medium text-white hover:bg-[#1557b0] transition shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareModal;
