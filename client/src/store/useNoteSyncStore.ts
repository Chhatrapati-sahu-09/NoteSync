import { create } from 'zustand';
import type { NoteSyncState, Note, VideoItem, Screenshot, ThemeMode } from '../types';
import { INITIAL_VIDEOS, INITIAL_NOTES } from '../data/mockData';

const LOCAL_STORAGE_KEY = 'notesync_state_v1';

const getInitialStateFromStorage = () => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        theme: (parsed.theme as ThemeMode) || 'light',
        videos: (parsed.videos as VideoItem[]) || INITIAL_VIDEOS,
        notes: (parsed.notes as Note[]) || INITIAL_NOTES,
        screenshots: (parsed.screenshots as Screenshot[]) || [],
        activeVideoId: parsed.activeVideoId || INITIAL_VIDEOS[0].id,
      };
    }
  } catch (e) {
    console.error('Failed to parse localStorage', e);
  }
  return {
    theme: 'light' as ThemeMode,
    videos: INITIAL_VIDEOS,
    notes: INITIAL_NOTES,
    screenshots: [],
    activeVideoId: INITIAL_VIDEOS[0].id,
  };
};

const savedState = getInitialStateFromStorage();

export const useNoteSyncStore = create<NoteSyncState>((set, get) => ({
  theme: savedState.theme,
  toggleTheme: () => {
    const nextTheme: ThemeMode = get().theme === 'light' ? 'dark' : 'light';
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ theme: nextTheme });
    saveToLocalStorage();
  },

  videos: savedState.videos,
  activeVideoId: savedState.activeVideoId,
  activeVideo: savedState.videos.find((v) => v.id === savedState.activeVideoId) || savedState.videos[0] || null,

  addVideo: (videoData) => {
    const newVid: VideoItem = {
      ...videoData,
      id: 'vid-' + Date.now(),
      currentTime: 0,
      lastPlayedAt: new Date().toISOString(),
      categories: ['Custom Upload'],
    };
    set((state) => {
      const updatedVideos = [newVid, ...state.videos];
      return {
        videos: updatedVideos,
        activeVideoId: newVid.id,
        activeVideo: newVid,
      };
    });
    saveToLocalStorage();
  },

  setActiveVideo: (id: string) => {
    set((state) => {
      const found = state.videos.find((v) => v.id === id) || null;
      return {
        activeVideoId: id,
        activeVideo: found,
      };
    });
    saveToLocalStorage();
  },

  updateVideoProgress: (id: string, currentTime: number) => {
    set((state) => {
      const updatedVideos = state.videos.map((v) =>
        v.id === id ? { ...v, currentTime, lastPlayedAt: new Date().toISOString() } : v
      );
      const activeVid = updatedVideos.find((v) => v.id === state.activeVideoId) || state.activeVideo;
      return {
        videos: updatedVideos,
        activeVideo: activeVid,
      };
    });
    saveToLocalStorage();
  },

  notes: savedState.notes,
  searchQuery: '',
  selectedCategory: 'All',
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setSelectedCategory: (category: string) => set({ selectedCategory: category }),

  addNote: (noteData) => {
    const newNote: Note = {
      ...noteData,
      id: 'note-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      notes: [newNote, ...state.notes],
    }));
    saveToLocalStorage();
  },

  updateNote: (id: string, updates: Partial<Note>) => {
    set((state) => ({
      notes: state.notes.map((n) =>
        n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
      ),
    }));
    saveToLocalStorage();
  },

  deleteNote: (id: string) => {
    set((state) => ({
      notes: state.notes.filter((n) => n.id !== id),
    }));
    saveToLocalStorage();
  },

  toggleFavoriteNote: (id: string) => {
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, isFavorite: !n.isFavorite } : n)),
    }));
    saveToLocalStorage();
  },

  screenshots: savedState.screenshots,
  addScreenshot: (scData) => {
    const newSc: Screenshot = {
      ...scData,
      id: 'sc-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      screenshots: [newSc, ...state.screenshots],
    }));
    saveToLocalStorage();
    return newSc;
  },

  stickyNotesOpen: false,
  toggleStickyNotes: () => set((state) => ({ stickyNotesOpen: !state.stickyNotesOpen })),

  aiModalOpen: false,
  setAiModalOpen: (open) => set({ aiModalOpen: open }),

  exportModalOpen: false,
  setExportModalOpen: (open) => set({ exportModalOpen: open }),
}));

function saveToLocalStorage() {
  try {
    const state = useNoteSyncStore.getState();
    const payload = {
      theme: state.theme,
      videos: state.videos,
      notes: state.notes,
      screenshots: state.screenshots,
      activeVideoId: state.activeVideoId,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.error('Failed to save state to localStorage', e);
  }
}
