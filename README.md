# 🚀 NoteSync - Notion-Inspired Video Note-Taking & AI Workspace

<p align="center">
  <img src="https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4.0-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Status-Personal_Project-emerald?style=for-the-badge" alt="Personal Project" />
</p>

---

## 📌 Personal Use Statement

> **NoteSync** is a custom-built, personal note-taking application designed to transform how video lectures, masterclasses, and coding tutorials are consumed. It combines precise video timeline tracking, video frame screenshot capture, markdown note-taking, and AI flashcards into one seamless, Notion-inspired desktop workspace.

---

## 🌟 Key Features

### 🎬 Custom HTML5 Video Player
- **Precise Timeline Control**: Smooth seek bar with live `mm:ss` timestamp formatting.
- **Playback Speed Selector**: Adjust speed on the fly (`0.5x`, `1.0x`, `1.25x`, `1.5x`, `2.0x`).
- **Skip & Volume Controls**: 10-second rewind/forward skip, volume slider, mute toggle, and fullscreen mode.
- **Capture Frame Screenshot Tool**: Take high-resolution video frame snapshots directly from HTML5 Canvas and attach them as visual note bookmarks.

### 📝 Timestamped Rich Markdown Notes
- **Instant <kbd>N</kbd> Shortcut**: Press `N` anywhere to automatically freeze the video timestamp, spawn a new note, and focus the editor.
- **Click-to-Jump Timestamp Navigation**: Click any timestamp badge or screenshot thumbnail in your note cards to jump the video directly to that exact moment.
- **Rich Text Toolbar**: Insert bold, italic, headers, code blocks, task list checkboxes, callout quotes, and custom sticky note colors (Amber, Sky, Emerald, Pink, Purple, Orange).

### 🎨 Notion-Inspired Aesthetic
- **Minimalist Clean UI**: Generous whitespace, rounded card layouts, and Google Font Inter typography.
- **Sticky Notes Drawer**: Slide-over quick sticky notes drawer for capturing fleeting ideas.
- **Dark & Light Mode**: Toggle persistent dark/light themes seamlessly.

### 🤖 AI Intelligence & Flashcards Deck
- **Executive Summaries**: Generate automated video summaries and key action item lists.
- **Interactive Flashcards**: Auto-generate interactive flashcard review decks with flip animations.
- **Concept Explainer**: Simple plain-English breakdowns for complex technical code snippets.

### 📤 Multi-Format Exporting
- **Markdown (`.md`)**: Export notes formatted for Obsidian, Notion, or GitHub.
- **PDF (`.pdf`)**: Generate print-ready PDF documents using `jsPDF`.
- **Plain Text (`.txt`)**: Lightweight plaintext summaries.

---

## 📂 Project Architecture

```
notesync/
├── client/                     # Vite + React 19 + TypeScript Frontend
│   ├── src/
│   │   ├── components/        # Header, Sidebar, VideoPlayer, NoteEditor, NoteList, StickyNotes, AIModal, ExportModal
│   │   ├── data/              # Pre-populated sample video notes & mock data
│   │   ├── store/             # Zustand store with localStorage persistence
│   │   ├── types/             # TypeScript definitions
│   │   ├── App.tsx            # Main Notion grid workspace layout
│   │   └── index.css          # Design system tokens & Notion CSS
├── server/                     # Node.js + Express API Server Skeleton
├── docs/                       # Architecture & Documentation
└── README.md                   # Main Project README
```

---

## ✅ Progress & Git Commit Log (Day 1 Complete)

All initial **7 frontend commit milestones** have been implemented, verified, committed, and pushed to GitHub:

| Commit Hash | Commit Message | Highlights |
|---|---|---|
| `a471fe1` | `feat: polish UI with animations and responsive design` | Framer Motion `AnimatePresence`, smooth card transitions, theme toggle, mobile drawer |
| `d0772e6` | `feat: add screenshot bookmarks and timeline navigation` | Video frame canvas screenshot capture, screenshot gallery modal, click-to-jump timeline |
| `ad81263` | `feat: enable note editing, deletion and favorites` | Full note CRUD, starring favorites filter toggle, category pill filters, live search bar |
| `46afdc1` | `feat: create timestamp note panel` | Instant <kbd>N</kbd> key shortcut, auto-timestamp reader, auto-focus title input, rich markdown toolbar |
| `a3e5b6d` | `feat: implement custom HTML5 video player` | Play/Pause, seek timeline, volume slider, playback speeds (0.5x–2x), fullscreen toggle |
| `f8acc07` | `feat: build Notion-inspired application shell` | Top navbar, responsive sidebar, breadcrumbs, search shortcut badge (`Cmd/Ctrl+K`), sticky notes drawer |
| `0fbce3a` | `feat: initialize Vite + React + Tailwind + shadcn` | Vite + React 19 + TypeScript + Tailwind CSS v4, Zustand store with `localStorage` persistence |

---

## 🔮 Upcoming Progress Roadmap (Day 2+)

- [ ] **Node.js & Express REST API**: Setup backend endpoints in `server/`.
- [ ] **MongoDB Persistence**: Schema models for Users, Videos, Timestamp Notes, and Screenshots.
- [ ] **JWT Authentication**: Secure login, registration, and user session management.
- [ ] **Multer File Uploads**: Cloud image upload pipeline for video screenshots.
- [ ] **Real-time Multi-Device Sync**: Cross-device state syncing over WebSockets / REST.

---

## ⚡ Quick Start

```bash
# 1. Clone or navigate to the project directory
cd client

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Build for production
npm run build
```

---

## ⌨️ Keyboard Shortcuts Reference

| Shortcut | Action |
|---|---|
| <kbd>N</kbd> | Freeze current video timestamp & create a new note |
| <kbd>Cmd</kbd> + <kbd>K</kbd> / <kbd>Ctrl</kbd> + <kbd>K</kbd> | Focus global search bar |

---

## 📄 License

Maintained as a personal open-source workspace project.
