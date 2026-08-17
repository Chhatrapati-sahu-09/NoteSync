import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  Tag,
  Palette,
  Bold,
  Italic,
  Code,
  ListCheck,
  Quote,
  Heading2,
  PlusCircle,
  Trash2,
} from 'lucide-react';
import { useNoteSyncStore } from '../store/useNoteSyncStore';
import type { Note, Screenshot } from '../types';

interface NoteEditorProps {
  editingNote?: Note | null;
  onCancelEdit?: () => void;
  attachedScreenshot?: Screenshot | null;
  onClearAttachedScreenshot?: () => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  editingNote,
  onCancelEdit,
  attachedScreenshot,
  onClearAttachedScreenshot,
}) => {
  const { activeVideo, addNote, updateNote } = useNoteSyncStore();

  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const activeVideoRef = useRef(activeVideo);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Key Takeaway');
  const [color, setColor] = useState('yellow');
  const [timestamp, setTimestamp] = useState(0);

  const categories = ['Key Takeaway', 'Code Snippet', 'Summary', 'Question', 'General'];
  const colors = [
    { name: 'yellow', bg: 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800' },
    { name: 'blue', bg: 'bg-sky-100 dark:bg-sky-950/60 border-sky-300 dark:border-sky-800' },
    { name: 'green', bg: 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800' },
    { name: 'pink', bg: 'bg-pink-100 dark:bg-pink-950/60 border-pink-300 dark:border-pink-800' },
    { name: 'purple', bg: 'bg-purple-100 dark:bg-purple-950/60 border-purple-300 dark:border-purple-800' },
    { name: 'orange', bg: 'bg-orange-100 dark:bg-orange-950/60 border-orange-300 dark:border-orange-800' },
  ];

  // Sync activeVideo reference
  useEffect(() => {
    activeVideoRef.current = activeVideo;
  }, [activeVideo]);

  // Auto focus input when editing existing note or when attached screenshot is received
  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title);
      setContent(editingNote.content);
      setCategory(editingNote.category);
      setColor(editingNote.color || 'yellow');
      setTimestamp(editingNote.timestamp);
      titleInputRef.current?.focus();
    } else {
      if (activeVideo) {
        setTimestamp(activeVideo.currentTime);
      }
    }
  }, [editingNote, activeVideo, activeVideo?.id, activeVideo?.currentTime]);

  // Set screenshot timestamp if attached
  useEffect(() => {
    if (attachedScreenshot && !editingNote) {
      setTimestamp(attachedScreenshot.timestamp);
      titleInputRef.current?.focus();
    }
  }, [attachedScreenshot, editingNote]);

  // Keyboard shortcut listener for 'N' to spawn a new note & auto focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (targetTag === 'input' || targetTag === 'textarea' || targetTag === 'select') return;

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        const activeVid = activeVideoRef.current;
        if (activeVid) {
          setTimestamp(activeVid.currentTime);
          setTitle(`Note at ${formatTime(activeVid.currentTime)}`);
          setContent('');
          setTimeout(() => titleInputRef.current?.focus(), 50);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVideo || (!title && !content)) return;

    const formattedTime = formatTime(timestamp);

    if (editingNote) {
      updateNote(editingNote.id, {
        title: title || 'Untitled Note',
        content,
        category,
        color,
      });
      if (onCancelEdit) onCancelEdit();
    } else {
      addNote({
        videoId: activeVideo.id,
        timestamp,
        formattedTime,
        title: title || `Note at ${formattedTime}`,
        content,
        category,
        isFavorite: false,
        color,
        screenshot: attachedScreenshot || undefined,
      });

      setTitle('');
      setContent('');
      if (onClearAttachedScreenshot) onClearAttachedScreenshot();
    }
  };

  const insertFormatting = (syntaxPrefix: string, syntaxSuffix: string = '') => {
    setContent((prev) => `${prev}${syntaxPrefix}selected text${syntaxSuffix}`);
  };

  const activeColorObj = colors.find((c) => c.name === color) || colors[0];

  return (
    <div className={`rounded-2xl border p-4 shadow-xs transition-all ${activeColorObj.bg}`}>
      <form onSubmit={handleSave} className="space-y-3">
        {/* Top Header: Timestamp Badge & Color Selector */}
        <div className="flex items-center justify-between pb-1 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center space-x-2">
            <span className="flex items-center space-x-1 text-xs font-mono font-semibold px-2.5 py-1 bg-black/10 dark:bg-white/10 text-zinc-900 dark:text-zinc-100 rounded-md">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(timestamp)}</span>
            </span>
            <span className="text-[11px] text-zinc-500 font-medium hidden sm:inline">
              (Press <kbd className="font-mono bg-black/5 px-1 py-0.5 rounded">N</kbd> for instant timestamp note)
            </span>
          </div>

          {/* Color Palette Switcher */}
          <div className="flex items-center space-x-1">
            <Palette className="w-3.5 h-3.5 text-zinc-400 mr-1" />
            {colors.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => setColor(c.name)}
                className={`w-4 h-4 rounded-full transition-transform ${
                  c.name === 'yellow'
                    ? 'bg-amber-300'
                    : c.name === 'blue'
                    ? 'bg-sky-300'
                    : c.name === 'green'
                    ? 'bg-emerald-300'
                    : c.name === 'pink'
                    ? 'bg-pink-300'
                    : c.name === 'purple'
                    ? 'bg-purple-300'
                    : 'bg-orange-300'
                } ${color === c.name ? 'scale-125 ring-2 ring-zinc-800 dark:ring-zinc-200' : 'opacity-70 hover:opacity-100'}`}
                title={`Theme: ${c.name}`}
              />
            ))}
          </div>
        </div>

        {/* Note Title Input with auto focus */}
        <div>
          <input
            ref={titleInputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title (e.g., Key concept explanation...)"
            className="w-full bg-transparent text-sm font-semibold text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
          />
        </div>

        {/* Rich Format Toolbar */}
        <div className="flex items-center space-x-1 py-1 border-y border-black/5 dark:border-white/5 text-zinc-600 dark:text-zinc-400 text-xs overflow-x-auto">
          <button
            type="button"
            onClick={() => insertFormatting('**', '**')}
            className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded"
            title="Bold"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('*', '*')}
            className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded"
            title="Italic"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('### ')}
            className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded"
            title="Heading"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('```typescript\n', '\n```')}
            className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded"
            title="Code Block"
          >
            <Code className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('- [ ] ')}
            className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded"
            title="Task List"
          >
            <ListCheck className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('> ')}
            className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded"
            title="Callout Quote"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Note Content Input */}
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            placeholder="Type your notes, code snippets, or thoughts here..."
            className="w-full bg-transparent text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none resize-none"
          />
        </div>

        {/* Attached Screenshot Preview if present */}
        {attachedScreenshot && (
          <div className="relative rounded-lg overflow-hidden border border-black/10 dark:border-white/10 max-w-xs group">
            <img
              src={attachedScreenshot.dataUrl}
              alt="Attached Video Snapshot"
              className="w-full h-24 object-cover"
            />
            <div className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full text-xs">
              <button
                type="button"
                onClick={onClearAttachedScreenshot}
                className="hover:text-red-400"
                title="Remove Attached Frame"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
            <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
              Captured Frame @ {attachedScreenshot.formattedTime}
            </span>
          </div>
        )}

        {/* Category Pills & Action Buttons Row */}
        <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5">
          <div className="flex items-center space-x-1 overflow-x-auto">
            <Tag className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0 mr-1" />
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition-all ${
                  category === cat
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                    : 'bg-black/5 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:bg-black/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            {editingNote && onCancelEdit && (
              <button
                type="button"
                onClick={onCancelEdit}
                className="px-2.5 py-1 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-black/5 rounded-lg"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="flex items-center space-x-1 px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-xs font-semibold hover:opacity-90 shadow-xs transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{editingNote ? 'Update Note' : 'Add Note'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
