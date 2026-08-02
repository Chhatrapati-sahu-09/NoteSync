import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { VideoPlayer } from './components/VideoPlayer';
import { NoteEditor } from './components/NoteEditor';
import { NoteList } from './components/NoteList';
import { StickyNotesDrawer } from './components/StickyNotesDrawer';
import { AIModal } from './components/AIModal';
import { ExportModal } from './components/ExportModal';
import { ScreenshotGalleryModal } from './components/ScreenshotGalleryModal';
import type { Note, Screenshot } from './types';
import { useNoteSyncStore } from './store/useNoteSyncStore';
import { AuthScreen } from './components/AuthScreen';
import { useEffect } from 'react';

export function App() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [screenshotGalleryOpen, setScreenshotGalleryOpen] = useState(false);
  const [seekTime, setSeekTime] = useState<number | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [attachedScreenshot, setAttachedScreenshot] = useState<Screenshot | null>(null);

  const { activeVideo, token, fetchWorkspaceData, theme } = useNoteSyncStore();

  useEffect(() => {
    if (token) {
      fetchWorkspaceData();
    }
  }, [token]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  if (!token) {
    return <AuthScreen />;
  }

  const handleJumpToTimestamp = (ts: number) => {
    setSeekTime(ts);
  };

  const handleCaptureScreenshot = (
    dataUrl: string,
    timestamp: number,
    formattedTime: string
  ) => {
    setAttachedScreenshot({
      id: 'sc-' + Date.now(),
      timestamp,
      formattedTime,
      dataUrl,
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors">
      {/* Notion Top Navigation Bar */}
      <Header
        onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        onOpenScreenshotGallery={() => setScreenshotGalleryOpen(true)}
      />

      {/* Main Responsive Workspace Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Workspace Sidebar */}
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Center & Right Content Grid */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Top Active Video Title Banner */}
            {activeVideo && (
              <div className="space-y-1 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <h1 className="text-lg md:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  {activeVideo.title}
                </h1>
                <div className="flex items-center space-x-2 text-xs text-zinc-500">
                  <span>Categories:</span>
                  <div className="flex items-center space-x-1 flex-wrap gap-1">
                    {activeVideo.categories.map((c) => (
                      <span
                        key={c}
                        className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-full font-medium text-[10px]"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Split Responsive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left: Video Player & Note Editor */}
              <div className="lg:col-span-7 space-y-6">
                <VideoPlayer
                  seekTime={seekTime}
                  onSeekHandled={() => setSeekTime(null)}
                  onCaptureScreenshot={handleCaptureScreenshot}
                />

                <NoteEditor
                  editingNote={editingNote}
                  onCancelEdit={() => setEditingNote(null)}
                  attachedScreenshot={attachedScreenshot}
                  onClearAttachedScreenshot={() => setAttachedScreenshot(null)}
                />
              </div>

              {/* Right: Timestamped Notes Panel */}
              <div className="lg:col-span-5 bg-zinc-50/50 dark:bg-zinc-900/30 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 min-h-[450px]">
                <NoteList
                  onJumpToTimestamp={handleJumpToTimestamp}
                  onEditNote={(note) => setEditingNote(note)}
                />
              </div>
            </div>
          </div>
        </main>

        {/* Sticky Notes Sidebar Drawer */}
        <StickyNotesDrawer />
      </div>

      {/* AI Assistant Modal */}
      <AIModal />

      {/* Export Notes Modal */}
      <ExportModal />

      {/* Frame Screenshot Bookmarks Gallery Modal */}
      <ScreenshotGalleryModal
        isOpen={screenshotGalleryOpen}
        onClose={() => setScreenshotGalleryOpen(false)}
        onJumpToTimestamp={handleJumpToTimestamp}
      />
    </div>
  );
}

export default App;
