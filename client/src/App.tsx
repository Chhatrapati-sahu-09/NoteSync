import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { VideoPlayer } from './components/VideoPlayer';
import { NoteEditor } from './components/NoteEditor';
import { NoteList } from './components/NoteList';
import { StickyNotesDrawer } from './components/StickyNotesDrawer';
import { AIModal } from './components/AIModal';
import { ExportModal } from './components/ExportModal';
import type { Note, Screenshot } from './types';
import { useNoteSyncStore } from './store/useNoteSyncStore';

export function App() {
  const [seekTime, setSeekTime] = useState<number | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [attachedScreenshot, setAttachedScreenshot] = useState<Screenshot | null>(null);

  const { activeVideo } = useNoteSyncStore();

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
      {/* Notion Top Header Bar */}
      <Header />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Navigation Sidebar */}
        <Sidebar />

        {/* Center & Right Content Grid */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Top Info Banner if Video Active */}
            {activeVideo && (
              <div className="space-y-1 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  {activeVideo.title}
                </h1>
                <div className="flex items-center space-x-2 text-xs text-zinc-500">
                  <span>Categories:</span>
                  <div className="flex items-center space-x-1">
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

            {/* Split Grid: Video Player + Editor (Left) & Notes List (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Video & Note Creator (7 cols) */}
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

              {/* Right Column: Timestamped Notes List (5 cols) */}
              <div className="lg:col-span-5 bg-zinc-50/50 dark:bg-zinc-900/30 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 min-h-[500px]">
                <NoteList
                  onJumpToTimestamp={handleJumpToTimestamp}
                  onEditNote={(note) => setEditingNote(note)}
                />
              </div>
            </div>
          </div>
        </main>

        {/* Sticky Notes Slide-over Drawer */}
        <StickyNotesDrawer />
      </div>

      {/* AI Intelligence Modal */}
      <AIModal />

      {/* Export Notes Modal */}
      <ExportModal />
    </div>
  );
}

export default App;
