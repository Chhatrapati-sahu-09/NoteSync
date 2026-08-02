import React from 'react';
import {
  Search,
  Moon,
  Sun,
  Sparkles,
  Download,
  StickyNote,
  Video,
  Menu,
  Command,
  Camera,
  LogOut,
} from 'lucide-react';
import { useNoteSyncStore } from '../store/useNoteSyncStore';

interface HeaderProps {
  onToggleMobileSidebar?: () => void;
  onOpenScreenshotGallery?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileSidebar, onOpenScreenshotGallery }) => {
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
    user,
    logout,
  } = useNoteSyncStore();

  return (
    <header className="h-14 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md px-3 md:px-4 flex items-center justify-between sticky top-0 z-30 transition-colors">
      {/* Left: Mobile Menu Toggle & Notion Breadcrumb */}
      <div className="flex items-center space-x-2.5">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            title="Toggle Sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 font-bold text-xs shadow-xs">
            N
          </div>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs md:text-sm tracking-tight hidden sm:inline">
            NoteSync
          </span>
        </div>

        <span className="text-zinc-300 dark:text-zinc-700 hidden sm:inline">/</span>

        {activeVideo ? (
          <div className="flex items-center space-x-1.5 max-w-[140px] sm:max-w-xs md:max-w-md truncate">
            <Video className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
            <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium truncate">
              {activeVideo.title}
            </span>
          </div>
        ) : (
          <span className="text-xs text-zinc-400">No active video</span>
        )}
      </div>

      {/* Middle: Search bar */}
      <div className="hidden sm:flex items-center relative w-48 md:w-80">
        <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search notes, timestamps..."
          className="w-full pl-8 pr-8 py-1.5 bg-zinc-100 dark:bg-zinc-800/60 border border-transparent focus:border-zinc-300 dark:focus:border-zinc-700 rounded-lg text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none transition-all"
        />
        <div className="absolute right-2.5 flex items-center space-x-0.5 text-[10px] text-zinc-400 bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0.5 rounded font-mono">
          <Command className="w-2.5 h-2.5" />
          <span>K</span>
        </div>
      </div>

      {/* Right: Quick Action Controls */}
      <div className="flex items-center space-x-1.5 sm:space-x-2">
        {/* Frame Screenshots Gallery */}
        {onOpenScreenshotGallery && (
          <button
            onClick={onOpenScreenshotGallery}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 transition-all border border-amber-200/60 dark:border-amber-800/60"
            title="View Frame Screenshot Bookmarks"
          >
            <Camera className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden lg:inline">Screenshots</span>
          </button>
        )}
        {/* Sticky Notes Sidebar */}
        <button
          onClick={toggleStickyNotes}
          className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            stickyNotesOpen
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
              : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
          title="Toggle Sticky Notes"
        >
          <StickyNote className="w-4 h-4 text-amber-500" />
          <span className="hidden lg:inline">Sticky Notes</span>
        </button>

        {/* AI Insights */}
        <button
          onClick={() => setAiModalOpen(true)}
          className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 text-xs font-medium transition-all border border-indigo-200/60 dark:border-indigo-800/60"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span className="hidden sm:inline">AI Insights</span>
        </button>

        {/* Export */}
        <button
          onClick={() => setExportModalOpen(true)}
          className="p-2 sm:px-2.5 sm:py-1.5 rounded-lg text-xs text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium transition-all flex items-center space-x-1"
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

        {/* User Identity & Logout */}
        {user && (
          <div className="flex items-center space-x-2 pl-2 border-l border-zinc-200 dark:border-zinc-800">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/40 uppercase">
              {user.username.substring(0, 2)}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[10px] font-bold leading-tight text-zinc-800 dark:text-zinc-200 truncate max-w-[80px]">
                {user.username}
              </span>
              <button
                onClick={logout}
                className="text-[9px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 font-medium text-left transition-colors cursor-pointer"
              >
                Log Out
              </button>
            </div>
            <button
              onClick={logout}
              className="sm:hidden p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
              title="Log Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
