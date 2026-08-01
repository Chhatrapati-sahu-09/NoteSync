import React from 'react';
import {
  Search,
  Moon,
  Sun,
  Sparkles,
  Download,
  StickyNote,
  Video,
  PlusCircle,
  Command,
} from 'lucide-react';
import { useNoteSyncStore } from '../store/useNoteSyncStore';

export const Header: React.FC = () => {
  const {
    theme,
    toggleTheme,
    searchQuery,
    setSearchQuery,
    stickyNotesOpen,
    toggleStickyNotes,
    setAiModalOpen,
    setExportModalOpen,
    activeVideo,
  } = useNoteSyncStore();

  return (
    <header className="h-14 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 flex items-center justify-between sticky top-0 z-30 transition-colors">
      {/* Left: App Logo & Notion Breadcrumb */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 font-bold text-sm shadow-sm">
            N
          </div>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm tracking-tight">
            NoteSync
          </span>
        </div>

        <span className="text-zinc-300 dark:text-zinc-700">/</span>

        {activeVideo ? (
          <div className="flex items-center space-x-2 max-w-xs md:max-w-md truncate">
            <Video className="w-4 h-4 text-zinc-400 flex-shrink-0" />
            <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium truncate">
              {activeVideo.title}
            </span>
          </div>
        ) : (
          <span className="text-xs text-zinc-400">No active video</span>
        )}
      </div>

      {/* Middle: Notion Search bar */}
      <div className="hidden sm:flex items-center relative w-64 md:w-80">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search notes, timestamps..."
          className="w-full pl-9 pr-8 py-1.5 bg-zinc-100 dark:bg-zinc-800/60 border border-transparent focus:border-zinc-300 dark:focus:border-zinc-700 rounded-lg text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none transition-all"
        />
        <div className="absolute right-2.5 flex items-center space-x-0.5 text-[10px] text-zinc-400 bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0.5 rounded font-mono">
          <Command className="w-2.5 h-2.5" />
          <span>K</span>
        </div>
      </div>

      {/* Right: Quick Action Buttons */}
      <div className="flex items-center space-x-2">
        {/* Sticky Notes Sidebar Toggle */}
        <button
          onClick={toggleStickyNotes}
          className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            stickyNotesOpen
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
              : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
          title="Toggle Sticky Notes Sidebar"
        >
          <StickyNote className="w-4 h-4 text-amber-500" />
          <span className="hidden md:inline">Sticky Notes</span>
        </button>

        {/* AI Assistant */}
        <button
          onClick={() => setAiModalOpen(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-xs font-medium transition-all border border-indigo-200/60 dark:border-indigo-800/60"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>AI Insights</span>
        </button>

        {/* Export Modal */}
        <button
          onClick={() => setExportModalOpen(true)}
          className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium transition-all"
          title="Export Notes"
        >
          <Download className="w-4 h-4" />
          <span className="hidden md:inline">Export</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
