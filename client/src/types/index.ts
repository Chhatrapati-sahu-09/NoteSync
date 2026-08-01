export interface Screenshot {
  id: string;
  timestamp: number; // in seconds
  formattedTime: string;
  dataUrl: string; // base64 canvas snapshot
  createdAt: string;
}

export interface Note {
  id: string;
  videoId: string;
  timestamp: number; // video timestamp in seconds
  formattedTime: string;
  title: string;
  content: string; // rich markdown text
  category: string; // e.g. "Key Takeaway", "Code Snippet", "Question", "Summary", "General"
  isFavorite: boolean;
  color?: string; // sticky note color (yellow, blue, green, pink, purple, orange)
  screenshot?: Screenshot;
  createdAt: string;
  updatedAt: string;
}

export interface VideoItem {
  id: string;
  title: string;
  url: string; // local blob URL or YouTube URL / sample video URL
  duration: number;
  thumbnail?: string;
  currentTime: number;
  lastPlayedAt: string;
  categories: string[];
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export type ThemeMode = 'light' | 'dark';

export interface NoteSyncState {
  theme: ThemeMode;
  toggleTheme: () => void;
  
  videos: VideoItem[];
  activeVideoId: string | null;
  activeVideo: VideoItem | null;
  addVideo: (video: Omit<VideoItem, 'id' | 'lastPlayedAt' | 'currentTime' | 'categories'>) => void;
  setActiveVideo: (id: string) => void;
  updateVideoProgress: (id: string, currentTime: number) => void;

  notes: Note[];
  searchQuery: string;
  selectedCategory: string;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  toggleFavoriteNote: (id: string) => void;

  screenshots: Screenshot[];
  addScreenshot: (screenshot: Omit<Screenshot, 'id' | 'createdAt'>) => Screenshot;

  // Sticky notes sidebar state
  stickyNotesOpen: boolean;
  toggleStickyNotes: () => void;

  // AI & Export modal state
  aiModalOpen: boolean;
  setAiModalOpen: (open: boolean) => void;
  exportModalOpen: boolean;
  setExportModalOpen: (open: boolean) => void;
}
