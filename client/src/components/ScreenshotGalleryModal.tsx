import React from 'react';
import { Camera, X, Clock, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { useNoteSyncStore } from '../store/useNoteSyncStore';

interface ScreenshotGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToTimestamp: (timestamp: number) => void;
}

export const ScreenshotGalleryModal: React.FC<ScreenshotGalleryModalProps> = ({
  isOpen,
  onClose,
  onJumpToTimestamp,
}) => {
  const { screenshots } = useNoteSyncStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/40">
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Frame Screenshot Bookmarks ({screenshots.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Gallery Grid */}
        <div className="p-5 overflow-y-auto flex-1">
          {screenshots.length === 0 ? (
            <div className="text-center py-12 space-y-2 text-zinc-400">
              <ImageIcon className="w-8 h-8 mx-auto text-zinc-400 stroke-1" />
              <p className="text-xs">No screenshot bookmarks captured yet.</p>
              <p className="text-[11px]">Click "Capture Frame" on the video player to save a visual bookmark.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {screenshots.map((sc) => (
                <div
                  key={sc.id}
                  onClick={() => {
                    onJumpToTimestamp(sc.timestamp);
                    onClose();
                  }}
                  className="group rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden cursor-pointer hover:border-amber-400 transition-all shadow-xs bg-zinc-50 dark:bg-zinc-800/50"
                >
                  <div className="relative aspect-video overflow-hidden bg-black">
                    <img
                      src={sc.dataUrl}
                      alt={`Frame @ ${sc.formattedTime}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Jump to {sc.formattedTime}</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </div>
                  <div className="p-2.5 flex items-center justify-between text-xs">
                    <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100 flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-amber-500" />
                      <span>{sc.formattedTime}</span>
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {new Date(sc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
