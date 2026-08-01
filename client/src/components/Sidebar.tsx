import React, { useState } from 'react';
import {
  Video,
  FileText,
  Plus,
  Tag,
  Star,
  Clock,
  ChevronLeft,
  ChevronRight,
  Upload,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useNoteSyncStore } from '../store/useNoteSyncStore';

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [videoTitleInput, setVideoTitleInput] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const {
    videos,
    activeVideoId,
    setActiveVideo,
    addVideo,
    notes,
    selectedCategory,
    setSelectedCategory,
  } = useNoteSyncStore();

  const categories = ['All', 'Key Takeaway', 'Code Snippet', 'Summary', 'Question'];

  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrlInput) return;

    addVideo({
      title: videoTitleInput || 'Untitled Video Note',
      url: videoUrlInput,
      duration: 300,
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
    });

    setVideoUrlInput('');
    setVideoTitleInput('');
    setShowUploadModal(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      addVideo({
        title: file.name.replace(/\.[^/.]+$/, ''),
        url: localUrl,
        duration: 300,
        thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=800&auto=format&fit=crop',
      });
      setShowUploadModal(false);
    }
  };

  if (collapsed) {
    return (
      <aside className="w-14 border-r border-zinc-200 dark:border-zinc-800 bg-[#f7f7f5] dark:bg-zinc-900 flex flex-col items-center py-4 space-y-6 transition-all z-20">
        <button
          onClick={() => setCollapsed(false)}
          className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          title="Expand Sidebar"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => setShowUploadModal(true)}
          className="p-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:opacity-90 transition-opacity"
          title="Add Video"
        >
          <Plus className="w-4 h-4" />
        </button>
      </aside>
    );
  }

  return (
    <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-[#f7f7f5] dark:bg-zinc-900/80 flex flex-col justify-between p-3 select-none transition-all z-20 font-sans">
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between px-2 pt-1">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Workspace
            </span>
          </div>
          <button
            onClick={() => setCollapsed(true)}
            className="p-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition-all"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Video List */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-2 pb-1 text-xs font-medium text-zinc-400">
            <span>Recent Videos ({videos.length})</span>
            <button
              onClick={() => setShowUploadModal(true)}
              className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 flex items-center space-x-0.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          <div className="space-y-0.5 max-h-48 overflow-y-auto pr-1">
            {videos.map((vid) => {
              const vidNotesCount = notes.filter((n) => n.videoId === vid.id).length;
              const isActive = vid.id === activeVideoId;
              return (
                <button
                  key={vid.id}
                  onClick={() => setActiveVideo(vid.id)}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium flex items-center justify-between group transition-all ${
                    isActive
                      ? 'bg-zinc-200/70 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/40 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <Video
                      className={`w-3.5 h-3.5 flex-shrink-0 ${
                        isActive ? 'text-indigo-500' : 'text-zinc-400'
                      }`}
                    />
                    <span className="truncate">{vid.title}</span>
                  </div>
                  <span className="text-[10px] bg-zinc-200/80 dark:bg-zinc-700/60 text-zinc-600 dark:text-zinc-300 px-1.5 py-0.5 rounded-full">
                    {vidNotesCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Categories / Tags Filter */}
        <div className="space-y-1 pt-2 border-t border-zinc-200/60 dark:border-zinc-800">
          <div className="px-2 pb-1 text-xs font-medium text-zinc-400 flex items-center space-x-1.5">
            <Tag className="w-3.5 h-3.5" />
            <span>Categories</span>
          </div>

          <div className="space-y-0.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-all flex items-center justify-between ${
                  selectedCategory === cat
                    ? 'bg-zinc-200/80 dark:bg-zinc-800 font-semibold text-zinc-900 dark:text-zinc-100'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/40 dark:hover:bg-zinc-800/40'
                }`}
              >
                <span>{cat}</span>
                {cat !== 'All' && (
                  <span className="w-2 h-2 rounded-full bg-indigo-400/60 inline-block"></span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notion Footer & Upload Modal Launcher */}
      <div className="space-y-2 pt-4 border-t border-zinc-200/60 dark:border-zinc-800">
        <button
          onClick={() => setShowUploadModal(true)}
          className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-lg text-xs font-medium shadow-xs transition-all"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Video / Link</span>
        </button>
        <div className="px-2 text-[10px] text-zinc-400 text-center font-mono">
          NoteSync Notion UI v1.0
        </div>
      </div>

      {/* Upload Video Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 max-w-md w-full border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
                <Video className="w-4 h-4 text-indigo-500" />
                <span>Add New Video to Workspace</span>
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-zinc-400 hover:text-zinc-600 text-xs"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleAddVideo} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Video Title
                </label>
                <input
                  type="text"
                  value={videoTitleInput}
                  onChange={(e) => setVideoTitleInput(e.target.value)}
                  placeholder="e.g. System Design Interview Course"
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Video URL (Direct MP4 or Sample)
                </label>
                <input
                  type="url"
                  value={videoUrlInput}
                  onChange={(e) => setVideoUrlInput(e.target.value)}
                  placeholder="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                />
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
                <span className="flex-shrink mx-2 text-[10px] text-zinc-400 uppercase">Or Local File</span>
                <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
              </div>

              <div>
                <label className="flex items-center justify-center space-x-2 py-2.5 px-4 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-all">
                  <Upload className="w-4 h-4 text-zinc-400" />
                  <span>Select Local Video File (.mp4, .webm)</span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-lg font-medium shadow-xs"
                >
                  Add Video
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
};
