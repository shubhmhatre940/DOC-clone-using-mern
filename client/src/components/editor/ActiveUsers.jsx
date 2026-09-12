import React from 'react';

/**
 * Renders avatar circles of currently active collaborators on the document
 */
const ActiveUsers = ({ users = [] }) => {
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

  return (
    <div className="flex items-center -space-x-2 overflow-hidden pl-1">
      {users.slice(0, 5).map((u, index) => (
        <div
          key={u.clientId || index}
          className="relative inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-[11px] font-bold ring-2 ring-white shadow-xs cursor-default transition-transform hover:scale-110 hover:z-10"
          style={{ backgroundColor: u.color || '#1a73e8' }}
          title={`${u.name || 'Anonymous'} (${u.email || 'Collaborator'})`}
        >
          {getInitials(u.name)}
        </div>
      ))}

      {users.length > 5 && (
        <div
          className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-200 text-gray-700 text-[11px] font-medium ring-2 ring-white"
          title={`${users.length - 5} more collaborators`}
        >
          +{users.length - 5}
        </div>
      )}
    </div>
  );
};

export default ActiveUsers;
