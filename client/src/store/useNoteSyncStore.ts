import { create } from 'zustand';
import type { NoteSyncState, Note, VideoItem, Screenshot, ThemeMode } from '../types';

const getInitialAuth = () => {
  try {
    const token = localStorage.getItem('notesync_token');
    const userJson = localStorage.getItem('notesync_user');
    return {
      token,
      user: userJson ? JSON.parse(userJson) : null,
    };
  } catch {
    return { token: null, user: null };
  }
};

const authData = getInitialAuth();

export const ACTIVE_SESSION_BLOBS = new Set<string>();

const getHeaders = () => {
  const token = useNoteSyncStore.getState().token;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const getJSONResponse = async (res: Response, errorPrefix: string) => {
  if (res.status === 502) {
    throw new Error('Backend server is offline (502 Bad Gateway). Please start the backend by running "npm run dev" inside the server directory.');
  }
  const contentType = res.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error(`${errorPrefix} failed: Backend server connection could not be established.`);
  }
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `${errorPrefix} failed`);
  }
  return data;
};

export const useNoteSyncStore = create<NoteSyncState>((set, get) => ({
  // Authentication State
  token: authData.token,
  user: authData.user,
  authLoading: false,

  login: async (email, password) => {
    set({ authLoading: true });
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await getJSONResponse(res, 'Login');

      localStorage.setItem('notesync_token', data.token);
      localStorage.setItem('notesync_user', JSON.stringify({
        _id: data._id,
        username: data.username,
        email: data.email,
        theme: data.theme,
      }));

      set({
        token: data.token,
        user: {
          _id: data._id,
          username: data.username,
          email: data.email,
          theme: data.theme,
        },
        theme: data.theme,
      });

      // Apply theme
      if (data.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      await get().fetchWorkspaceData();
    } finally {
      set({ authLoading: false });
    }
  },

  register: async (username, email, password) => {
    set({ authLoading: true });
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await getJSONResponse(res, 'Registration');

      localStorage.setItem('notesync_token', data.token);
      localStorage.setItem('notesync_user', JSON.stringify({
        _id: data._id,
        username: data.username,
        email: data.email,
        theme: data.theme,
      }));

      set({
        token: data.token,
        user: {
          _id: data._id,
          username: data.username,
          email: data.email,
          theme: data.theme,
        },
        theme: data.theme,
      });

      // Apply theme
      if (data.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      await get().fetchWorkspaceData();
    } finally {
      set({ authLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('notesync_token');
    localStorage.removeItem('notesync_user');
    set({
      token: null,
      user: null,
      notes: [],
      videos: [],
      activeVideoId: null,
      activeVideo: null,
      screenshots: [],
    });
  },

  fetchWorkspaceData: async () => {
    if (!get().token) return;
    
    // 1. Fetch videos list
    const videosRes = await fetch('/api/videos', { headers: getHeaders() });
    const videosData: VideoItem[] = await getJSONResponse(videosRes, 'Fetch videos');
    
    // 2. Fetch notes
    const notesRes = await fetch('/api/notes', { headers: getHeaders() });
    const notesData: Note[] = await getJSONResponse(notesRes, 'Fetch notes');

    const activeId = videosData[0]?.id || null;
    const activeVid = videosData.find((v) => v.id === activeId) || videosData[0] || null;

    // Extract screenshots already present in notes
    const extractedScreenshots: Screenshot[] = [];
    notesData.forEach(n => {
      if (n.screenshot) {
        extractedScreenshots.push({
          id: n.screenshot.id || 'sc-' + Date.now() + Math.random(),
          timestamp: n.screenshot.timestamp,
          formattedTime: n.screenshot.formattedTime,
          dataUrl: n.screenshot.dataUrl,
          createdAt: n.screenshot.createdAt || new Date().toISOString()
        });
      }
    });

    set({
      videos: videosData,
      notes: notesData,
      activeVideoId: activeId,
      activeVideo: activeVid,
      screenshots: extractedScreenshots,
    });
  },

  // UI Themes
  theme: (authData.user?.theme as ThemeMode) || 'light',
  toggleTheme: async () => {
    const nextTheme: ThemeMode = get().theme === 'light' ? 'dark' : 'light';
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ theme: nextTheme });

    // Sync preference to server if authenticated
    if (get().token) {
      try {
        await fetch('/api/auth/preferences', {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify({ theme: nextTheme }),
        });
        
        // Update stored user
        const currUser = get().user;
        if (currUser) {
          const updatedUser = { ...currUser, theme: nextTheme };
          localStorage.setItem('notesync_user', JSON.stringify(updatedUser));
          set({ user: updatedUser });
        }
      } catch {
        // ignore non-critical theme sync failure
      }
    }
  },

  // Videos state & mutations
  videos: [],
  activeVideoId: null,
  activeVideo: null,

  addVideo: async (videoData) => {
    if (videoData.url.startsWith('blob:')) {
      ACTIVE_SESSION_BLOBS.add(videoData.url);
    }
    const res = await fetch('/api/videos', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(videoData),
    });
    const data = await getJSONResponse(res, 'Add video');

    set((state) => {
      const updatedVideos = [data, ...state.videos];
      return {
        videos: updatedVideos,
        activeVideoId: data.id,
        activeVideo: data,
      };
    });
  },

  setActiveVideo: (id: string) => {
    set((state) => {
      const found = state.videos.find((v) => v.id === id) || null;
      return {
        activeVideoId: id,
        activeVideo: found,
      };
    });
  },

  updateVideoProgress: async (id: string, currentTime: number) => {
    // Optimistic update locally
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

    // Send API call in background
    if (get().token) {
      try {
        await fetch(`/api/videos/${id}/progress`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify({ currentTime }),
        });
      } catch {
        // progress sync failure is non-critical
      }
    }
  },

  // Notes state & mutations
  notes: [],
  searchQuery: '',
  selectedCategory: 'All',
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setSelectedCategory: (category: string) => set({ selectedCategory: category }),

  addNote: async (noteData) => {
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(noteData),
    });
    const data = await getJSONResponse(res, 'Create note');

    // If note contains screenshot, update local screenshots collection
    if (data.screenshot) {
      const newSc: Screenshot = {
        id: data.screenshot._id || 'sc-' + Date.now(),
        timestamp: data.screenshot.timestamp,
        formattedTime: data.screenshot.formattedTime,
        dataUrl: data.screenshot.dataUrl,
        createdAt: data.screenshot.createdAt || new Date().toISOString(),
      };
      set((state) => ({
        notes: [data, ...state.notes],
        screenshots: [newSc, ...state.screenshots],
      }));
    } else {
      set((state) => ({
        notes: [data, ...state.notes],
      }));
    }
  },

  updateNote: async (id, updates) => {
    const res = await fetch(`/api/notes/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    const data = await getJSONResponse(res, 'Update note');

    set((state) => ({
      notes: state.notes.map((n) => (n.id === id || (n as any)._id === id ? data : n)),
    }));
  },

  deleteNote: async (id) => {
    const res = await fetch(`/api/notes/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete note');

    set((state) => ({
      notes: state.notes.filter((n) => n.id !== id && (n as any)._id !== id),
      screenshots: state.screenshots.filter((s) => s.id !== id && (s as any)._id !== id),
    }));
  },

  toggleFavoriteNote: async (id) => {
    const res = await fetch(`/api/notes/${id}/favorite`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    const data = await getJSONResponse(res, 'Favorite note');

    set((state) => ({
      notes: state.notes.map((n) => (n.id === id || (n as any)._id === id ? data : n)),
    }));
  },

  screenshots: [],
  addScreenshot: (scData) => {
    const newSc: Screenshot = {
      ...scData,
      id: 'sc-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      screenshots: [newSc, ...state.screenshots],
    }));
    return newSc;
  },

  stickyNotesOpen: false,
  toggleStickyNotes: () => set((state) => ({ stickyNotesOpen: !state.stickyNotesOpen })),

  aiModalOpen: false,
  setAiModalOpen: (open) => set({ aiModalOpen: open }),

  exportModalOpen: false,
  setExportModalOpen: (open) => set({ exportModalOpen: open }),
}));
