import React, { useState } from 'react';
import { StickyNote, X, Plus, Trash2, Palette, Check } from 'lucide-react';
import { useNoteSyncStore } from '../store/useNoteSyncStore';

interface QuickSticky {
  id: string;
  text: string;
  color: string;
  createdAt: string;
}

export const StickyNotesDrawer: React.FC = () => {
  const { stickyNotesOpen, toggleStickyNotes } = useNoteSyncStore();

  const [stickies, setStickies] = useState<QuickSticky[]>([
    {
      id: 'sticky-1',
      text: '📌 Review timestamp 01:45 regarding optimistic UI patterns in React 19',
      color: 'yellow',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'sticky-2',
      text: '💡 Prepare slides for Friday system design sync meeting',
      color: 'pink',
      createdAt: new Date().toISOString(),
    },
  ]);

  const [newText, setNewText] = useState('');
  const [selectedColor, setSelectedColor] = useState('yellow');

  const addSticky = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const item: QuickSticky = {
      id: 'sticky-' + Date.now(),
      text: newText,
      color: selectedColor,
      createdAt: new Date().toISOString(),
    };

    setStickies([item, ...stickies]);
    setNewText('');
  };

  const deleteSticky = (id: string) => {
    setStickies(stickies.filter((s) => s.id !== id));
  };

  const getBgClass = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-sky-100 text-sky-950 dark:bg-sky-950/80 dark:text-sky-100 border-sky-300 dark:border-sky-800';
      case 'green':
        return 'bg-emerald-100 text-emerald-950 dark:bg-emerald-950/80 dark:text-emerald-100 border-emerald-300 dark:border-emerald-800';
      case 'pink':
        return 'bg-pink-100 text-pink-950 dark:bg-pink-950/80 dark:text-pink-100 border-pink-300 dark:border-pink-800';
      case 'purple':
        return 'bg-purple-100 text-purple-950 dark:bg-purple-950/80 dark:text-purple-100 border-purple-300 dark:border-purple-800';
      case 'orange':
        return 'bg-orange-100 text-orange-950 dark:bg-orange-950/80 dark:text-orange-100 border-orange-300 dark:border-orange-800';
      default:
        return 'bg-amber-100 text-amber-950 dark:bg-amber-950/80 dark:text-amber-100 border-amber-300 dark:border-amber-800';
    }
  };

  if (!stickyNotesOpen) return null;

  return (
    <div className="fixed right-0 top-14 bottom-0 w-80 bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl z-40 flex flex-col justify-between p-4 font-sans animate-in slide-in-from-right duration-200">
      <div className="space-y-4 overflow-y-auto pr-1">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center space-x-2">
            <StickyNote className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              Sticky Notes
            </h3>
          </div>
          <button
            onClick={toggleStickyNotes}
            className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Add Sticky Form */}
        <form onSubmit={addSticky} className="space-y-2 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60">
          <textarea
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Write a quick sticky note..."
            rows={2}
            className="w-full text-xs bg-transparent text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none resize-none"
          />
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-1">
              {['yellow', 'blue', 'green', 'pink', 'purple', 'orange'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  className={`w-3.5 h-3.5 rounded-full transition-transform ${
                    c === 'yellow'
                      ? 'bg-amber-300'
                      : c === 'blue'
                      ? 'bg-sky-300'
                      : c === 'green'
                      ? 'bg-emerald-300'
                      : c === 'pink'
                      ? 'bg-pink-300'
                      : c === 'purple'
                      ? 'bg-purple-300'
                      : 'bg-orange-300'
                  } ${selectedColor === c ? 'scale-125 ring-1 ring-zinc-800' : ''}`}
                />
              ))}
            </div>
            <button
              type="submit"
              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-md flex items-center space-x-1 shadow-2xs"
            >
              <Plus className="w-3 h-3" />
              <span>Stick</span>
            </button>
          </div>
        </form>

        {/* List of Stickies */}
        <div className="space-y-3">
          {stickies.map((sticky) => (
            <div
              key={sticky.id}
              className={`p-3.5 rounded-xl border shadow-xs relative group space-y-2 ${getBgClass(
                sticky.color
              )}`}
            >
              <p className="text-xs font-medium leading-relaxed">{sticky.text}</p>
              <div className="flex items-center justify-between pt-1 text-[10px] opacity-60">
                <span>{new Date(sticky.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <button
                  onClick={() => deleteSticky(sticky.id)}
                  className="opacity-0 group-hover:opacity-100 hover:text-red-600 transition-opacity"
                  title="Delete Sticky"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
