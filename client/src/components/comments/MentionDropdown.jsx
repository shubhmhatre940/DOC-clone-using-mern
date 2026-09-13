import React, { useState, useEffect, useRef } from 'react';
import { User, Shield } from 'lucide-react';

const USER_COLORS = [
  '#ea4335', '#4285f4', '#34a853', '#fbbc05',
  '#9333ea', '#ec4899', '#f97316', '#06b6d4'
];

function getUserColor(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return USER_COLORS[Math.abs(hash) % USER_COLORS.length];
}

function getInitials(name = '') {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : name.slice(0, 2).toUpperCase();
}

const MentionDropdown = ({
  collaborators = [],
  query = '',
  onSelect,
  onClose,
  position = 'top' // 'top' | 'bottom'
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef(null);

  const cleanQuery = query.toLowerCase().trim();
  const filtered = collaborators.filter((c) => {
    if (!cleanQuery) return true;
    const name = (c.name || '').toLowerCase();
    const email = (c.email || '').toLowerCase();
    return name.includes(cleanQuery) || email.includes(cleanQuery);
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [cleanQuery]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!filtered.length) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filtered.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        if (filtered[selectedIndex]) {
          e.preventDefault();
          onSelect(filtered[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [filtered, selectedIndex, onSelect, onClose]);

  if (filtered.length === 0) return null;

  const posClass =
    position === 'bottom'
      ? 'top-full mt-1.5'
      : 'bottom-full mb-1.5';

  return (
    <div
      ref={containerRef}
      className={`absolute left-0 right-0 ${posClass} z-50 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 max-h-48 overflow-y-auto animate-in fade-in zoom-in-95 duration-100 select-none`}
    >
      <div className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase text-gray-400 border-b border-gray-100 flex items-center justify-between">
        <span>Mention Collaborator</span>
        <span className="text-[9px] font-normal lowercase">Press Enter to select</span>
      </div>

      <div className="py-1">
        {filtered.map((user, idx) => {
          const uColor = getUserColor(user.name || user.email);
          const isSelected = idx === selectedIndex;

          return (
            <button
              key={user._id || idx}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(user);
              }}
              className={`w-full flex items-center justify-between px-3 py-1.5 text-left text-xs transition cursor-pointer ${
                isSelected ? 'bg-blue-50 text-blue-900' : 'hover:bg-gray-50 text-gray-800'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0 shadow-2xs"
                  style={{ backgroundColor: uColor }}
                >
                  {getInitials(user.name || user.email)}
                </div>
                <div className="truncate">
                  <span className="font-semibold block truncate leading-tight">
                    {user.name || 'User'}
                  </span>
                  {user.email && (
                    <span className="text-[10px] text-gray-400 block truncate -mt-0.5">
                      {user.email}
                    </span>
                  )}
                </div>
              </div>

              {user.role && (
                <span className="text-[10px] uppercase font-semibold tracking-wider text-gray-400 px-1.5 py-0.5 bg-gray-100 rounded ml-2 shrink-0">
                  {user.role}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MentionDropdown;
