import React, { useState, useRef, useEffect } from 'react';
import { Users } from 'lucide-react';

/**
 * Enhanced ActiveUsers component mimicking Google Docs collaborator avatar stack
 * with interactive hover tooltips and overflow dropdown list.
 */
const ActiveUsers = ({ users = [] }) => {
  const [hoveredUserId, setHoveredUserId] = useState(null);
  const [isOverflowOpen, setIsOverflowOpen] = useState(false);
  const overflowRef = useRef(null);

  // Close overflow popover on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (overflowRef.current && !overflowRef.current.contains(e.target)) {
        setIsOverflowOpen(false);
      }
    };
    if (isOverflowOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOverflowOpen]);

  if (!users || users.length === 0) {
    return null;
  }

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const MAX_VISIBLE = 4;
  const visibleUsers = users.slice(0, MAX_VISIBLE);
  const overflowUsers = users.slice(MAX_VISIBLE);

  return (
    <div className="flex items-center -space-x-2 pl-1 select-none relative">
      {visibleUsers.map((u, index) => {
        const uId = u.clientId || index;
        const isHovered = hoveredUserId === uId;

        return (
          <div
            key={uId}
            className="relative"
            onMouseEnter={() => setHoveredUserId(uId)}
            onMouseLeave={() => setHoveredUserId(null)}
          >
            {/* Avatar Pill */}
            <div
              className="w-7 h-7 rounded-full text-white text-[11px] font-semibold flex items-center justify-center ring-2 ring-white shadow-xs cursor-pointer transition-all duration-150 transform hover:scale-110 hover:z-30 relative"
              style={{
                backgroundColor: u.color || '#1a73e8',
                zIndex: isHovered ? 40 : visibleUsers.length - index
              }}
            >
              {getInitials(u.name)}
            </div>

            {/* Google Docs Styled Tooltip */}
            {isHovered && (
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                <div className="bg-gray-900 text-white rounded-lg px-2.5 py-1.5 shadow-xl text-center whitespace-nowrap min-w-[120px]">
                  <p className="text-xs font-semibold leading-tight">{u.name || 'Anonymous'}</p>
                  {u.email && (
                    <p className="text-[10px] text-gray-300 font-normal leading-tight mt-0.5">
                      {u.email}
                    </p>
                  )}
                  <span className="inline-flex items-center gap-1 text-[9px] text-emerald-400 font-medium mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Active now
                  </span>
                </div>
                {/* Arrow */}
                <div className="w-2 h-2 bg-gray-900 rotate-45 mx-auto -mt-6" />
              </div>
            )}
          </div>
        );
      })}

      {/* Overflow Badge (+N) */}
      {overflowUsers.length > 0 && (
        <div className="relative" ref={overflowRef} style={{ zIndex: 10 }}>
          <button
            type="button"
            onClick={() => setIsOverflowOpen((prev) => !prev)}
            className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 text-[11px] font-semibold flex items-center justify-center ring-2 ring-white cursor-pointer transition-colors shadow-xs"
            title={`${overflowUsers.length} more active collaborators`}
          >
            +{overflowUsers.length}
          </button>

          {/* Overflow Popover Dropdown */}
          {isOverflowOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 z-50 p-2 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-gray-100 text-xs font-semibold text-gray-700">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>Other active collaborators ({overflowUsers.length})</span>
              </div>
              <div className="max-h-48 overflow-y-auto divide-y divide-gray-50 py-1">
                {overflowUsers.map((u, idx) => (
                  <div
                    key={u.clientId || idx}
                    className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 transition"
                  >
                    <div
                      className="w-6 h-6 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0"
                      style={{ backgroundColor: u.color || '#1a73e8' }}
                    >
                      {getInitials(u.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-gray-900 truncate">
                        {u.name || 'Anonymous'}
                      </p>
                      {u.email && (
                        <p className="text-[10px] text-gray-500 truncate">{u.email}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActiveUsers;
