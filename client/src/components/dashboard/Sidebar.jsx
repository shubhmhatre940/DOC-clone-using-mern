import React from 'react';
import {
  FileText,
  Users,
  Star,
  Trash2,
  Folder,
  Home,
  X
} from 'lucide-react';

const Sidebar = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  ownedDocsCount = 0,
  sharedDocsCount = 0,
  starredDocsCount = 0,
  trashDocsCount = 0,
  folders = [],
  selectedFolderId = null,
  onSelectFolder
}) => {
  const mainNavItems = [
    {
      id: 'owned',
      label: 'My documents',
      icon: Home,
      count: ownedDocsCount
    },
    {
      id: 'shared',
      label: 'Shared with me',
      icon: Users,
      count: sharedDocsCount
    },
    {
      id: 'starred',
      label: 'Starred',
      icon: Star,
      count: starredDocsCount
    },
    {
      id: 'trash',
      label: 'Trash',
      icon: Trash2,
      count: trashDocsCount
    }
  ];

  return (
    <>
      {/* Mobile / Tablet Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs transition-opacity"
          onClick={onClose}
        ></div>
      )}

      {/* Floating Collapsible Drawer / Sidebar Panel */}
      <aside
        className={`fixed top-16 left-0 bottom-0 z-40 w-64 bg-white dark:bg-[#1e2024] border-r border-slate-200/80 dark:border-neutral-800 flex flex-col justify-between transition-transform duration-200 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* Header Mobile Close */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-neutral-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Workspace Menu
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id && selectedFolderId === null;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (onSelectFolder) onSelectFolder(null);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.count > 0 && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                          : 'bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Folders List in Sidebar */}
          <div>
            <div className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              <span>Folders</span>
              <span className="text-[10px] text-slate-400 font-normal">({folders.length})</span>
            </div>

            <div className="mt-1 space-y-1">
              {folders.length === 0 ? (
                <p className="px-3 py-2 text-xs text-slate-400 dark:text-slate-500 italic">
                  No custom folders
                </p>
              ) : (
                folders.map((folder) => {
                  const isFolderActive = selectedFolderId === folder._id;
                  return (
                    <button
                      key={folder._id}
                      onClick={() => {
                        setActiveTab('owned');
                        if (onSelectFolder) onSelectFolder(folder._id);
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                        isFolderActive
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Folder className={`w-3.5 h-3.5 ${isFolderActive ? 'text-blue-600 dark:text-blue-400' : 'text-amber-500'}`} />
                        <span className="truncate">{folder.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        {folder.docCount ?? 0}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-neutral-800 text-[11px] text-slate-400 dark:text-slate-500">
          DocFusion Workspace v2.0
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
