import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Star,
  Trash2,
  Edit2,
  Tag,
  Search,
  ExternalLink,
  Sparkles,
  FileText,
  Filter,
} from 'lucide-react';
import { useNoteSyncStore } from '../store/useNoteSyncStore';
import type { Note } from '../types';

interface NoteListProps {
  onJumpToTimestamp: (timestamp: number) => void;
  onEditNote: (note: Note) => void;
}

export const NoteList: React.FC<NoteListProps> = ({ onJumpToTimestamp, onEditNote }) => {
  const {
    notes,
    activeVideo,
    searchQuery,
    selectedCategory,
    deleteNote,
    toggleFavoriteNote,
  } = useNoteSyncStore();

  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  if (!activeVideo) {
    return (
      <div className="p-8 text-center text-zinc-400 text-xs font-sans">
        Select a video to view its timestamped notes.
      </div>
    );
  }

  // Filter notes belonging to active video
  let videoNotes = notes.filter((n) => n.videoId === activeVideo.id);

  // Favorites filter
  if (showOnlyFavorites) {
    videoNotes = videoNotes.filter((n) => n.isFavorite);
  }

  // Category filter
  if (selectedCategory !== 'All') {
    videoNotes = videoNotes.filter((n) => n.category === selectedCategory);
  }

  // Search Query filter
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    videoNotes = videoNotes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.formattedTime.includes(q) ||
        n.category.toLowerCase().includes(q)
    );
  }

  const getNoteColorClass = (color?: string) => {
    switch (color) {
      case 'blue':
        return 'border-l-4 border-l-sky-400 bg-white dark:bg-zinc-900';
      case 'green':
        return 'border-l-4 border-l-emerald-400 bg-white dark:bg-zinc-900';
      case 'pink':
        return 'border-l-4 border-l-pink-400 bg-white dark:bg-zinc-900';
      case 'purple':
        return 'border-l-4 border-l-purple-400 bg-white dark:bg-zinc-900';
      case 'orange':
        return 'border-l-4 border-l-orange-400 bg-white dark:bg-zinc-900';
      default:
        return 'border-l-4 border-l-amber-400 bg-white dark:bg-zinc-900';
    }
  };

  return (
    <div className="space-y-3 font-sans">
      {/* Top Header Row with Favorites Filter */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center space-x-1.5">
          <FileText className="w-3.5 h-3.5" />
          <span>Notes & Highlights ({videoNotes.length})</span>
        </h2>

        <div className="flex items-center space-x-2">
          {/* Favorites Filter Toggle */}
          <button
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
            className={`flex items-center space-x-1 text-[11px] px-2 py-0.5 rounded-full border transition-all ${
              showOnlyFavorites
                ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800 font-semibold'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200'
            }`}
            title="Filter Favorites Only"
          >
            <Star className={`w-3 h-3 ${showOnlyFavorites ? 'text-amber-500 fill-amber-500' : ''}`} />
            <span>Starred</span>
          </button>

          {selectedCategory !== 'All' && (
            <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-medium">
              {selectedCategory}
            </span>
          )}
        </div>
      </div>

      {videoNotes.length === 0 ? (
        <div className="border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center space-y-2 bg-zinc-50/50 dark:bg-zinc-900/40">
          <Sparkles className="w-6 h-6 text-zinc-400 mx-auto" />
          <p className="text-xs text-zinc-500 font-medium">
            No notes found matching current filters.
          </p>
          <p className="text-[11px] text-zinc-400">
            Press <kbd className="font-mono bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 rounded">N</kbd> or write above to create a timestamped note.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {videoNotes.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-2xs hover:shadow-md transition-all space-y-2.5 ${getNoteColorClass(
                  note.color
                )}`}
              >
                {/* Header Row: Timestamp Badge & CRUD Actions */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => onJumpToTimestamp(note.timestamp)}
                    className="flex items-center space-x-1.5 px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-lg text-xs font-mono font-semibold transition-all group/ts"
                    title="Click to jump to video timestamp"
                  >
                    <Clock className="w-3.5 h-3.5 text-indigo-500 group-hover/ts:scale-110 transition-transform" />
                    <span>{note.formattedTime}</span>
                    <ExternalLink className="w-3 h-3 text-zinc-400 ml-0.5" />
                  </button>

                  <div className="flex items-center space-x-1">
                    {/* Category Pill */}
                    <span className="text-[10px] px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-md font-medium">
                      {note.category}
                    </span>

                    {/* Favorite Star Button */}
                    <button
                      onClick={() => toggleFavoriteNote(note.id)}
                      className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-amber-500 transition-colors"
                      title="Toggle Favorite"
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          note.isFavorite ? 'text-amber-400 fill-amber-400' : ''
                        }`}
                      />
                    </button>

                    {/* Edit Button */}
                    <button
                      onClick={() => onEditNote(note)}
                      className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                      title="Edit Note"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-red-500 transition-colors"
                      title="Delete Note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Title & Markdown Content */}
                <div>
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                    {note.title}
                  </h3>
                  <div className="mt-1 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap font-sans">
                    {note.content}
                  </div>
                </div>

                {/* Attached Screenshot Thumbnail */}
                {note.screenshot && (
                  <div
                    onClick={() => onJumpToTimestamp(note.screenshot!.timestamp)}
                    className="relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 cursor-pointer group/sc max-w-sm"
                    title="Click to jump to screenshot timestamp"
                  >
                    <img
                      src={note.screenshot.dataUrl}
                      alt={`Screenshot at ${note.screenshot.formattedTime}`}
                      className="w-full h-28 object-cover group-hover/sc:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/sc:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Jump to {note.screenshot.formattedTime}</span>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
