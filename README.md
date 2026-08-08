# 🚀 NoteSync - Notion-Inspired Video Note-Taking & AI Workspace

<p align="center">
  <img src="https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-4.19-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-8.3-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Gemini_AI-Flash_1.5-blue?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/Status-Version_1.0.0-emerald?style=for-the-badge" alt="Version 1.0.0" />
</p>

---

## 📌 Project Overview

**NoteSync** is a professional personal study workspace designed to transform how video lectures, coding tutorials, and masterclasses are consumed. It integrates a custom HTML5 video player, canvas frame screenshot capture, markdown note-taking, local/remote database synchronization, and Gemini AI-powered learning modules into one responsive, Notion-inspired portal.

---

## 🌟 Key Features

### 🎬 Custom Video Player (HTML5 & YouTube) & Playback Sync
- **Hybrid Player Engine**: Seamlessly plays both local/direct video files (MP4/WebM) and YouTube streams.
- **YouTube API Integration**: Dynamically loads the official YouTube Iframe Player API and binds play/pause, seeks, volume, and playback rates to our custom Notion-styled controls.
- **Asynchronous Safeguards**: Defensive status checks on all YouTube controller calls prevent client-side script crashes during slow network loading states.
- **Synchronized Playback**: Video playtime progress auto-saves to MongoDB per user, resuming exactly where you left off.
- **Canvas Screenshot Captures**: Instantly snapshot frames from HTML5 videos and bind them as visual cards inside markdown notes (bypassed gracefully on YouTube embeds due to browser iframe security restrictions).
- **Synchronous Session Blob Validation**: Render-phase validation checking prevents browser network connection errors when local file blob URLs expire on page reload.
- **Database Connection Robustness**: Vite dev-server Bad Gateway (502) error handling and automatic offline local storage cache fallbacks keep the application fully operational even if the database server is offline.

### 📝 Rich Markdown Notes CRUD
- **Keyboard Shortcuts**: Pressing <kbd>N</kbd> pauses the video, creates a note card, and focuses the editor.
- **Interactive Timestamps**: Click any note timestamp badge or frame screenshot thumbnail to jump the video player to that exact playback second.
- **Rich Text Toolbar**: Quick formatting for bold, italics, code blocks, checklists, and customized Notion color themes.

### 🤖 Gemini AI Suite (Free-tier Fallback included)
- **Executive Summaries**: Distills video note streams into beautiful summaries containing key concepts and action checklists.
- **Interactive Flashcards**: Generates flip-animated study decks based on note highlights.
- **Feynman Concept Explainer**: Input any complicated technical term to get a simple, child-friendly explanation.

### 📤 Multi-Format Exports
- **PDF Export**: Generates print-ready PDFs embedding the actual captured frame screenshots.
- **Markdown (`.md`)**: Perfect for importing notes directly into Obsidian or Notion.
- **Plain Text (`.txt`)**: Simple lightweight plain text lecture summaries.

---

## 📂 Project Architecture

```
notesync/
├── client/                     # Vite + React 19 + TypeScript Frontend
│   ├── src/
│   │   ├── components/        # AuthScreen, Header, Sidebar, VideoPlayer, NoteEditor, NoteList, AIModal, ExportModal
│   │   ├── store/             # Zustand store (session tracking & backend API sync)
│   │   ├── types/             # TypeScript interfaces
│   │   └── App.tsx            # Auth guards & main workspace layout
├── server/                     # Node.js + Express + Mongoose Backend API
│   ├── config/                # Database connection utilities
│   ├── controllers/           # AI Suite logic (Gemini API & local NLP fallbacks)
│   ├── middleware/            # JWT verification router guards
│   ├── models/                # User, Note, Video, and VideoProgress MongoDB Schemas
│   ├── routes/                # API Endpoints (Auth, Notes, Videos, AI)
│   └── uploads/               # Uploaded video screenshot files directory
└── README.md                   # Comprehensive Workspace Guide
```

---

## 🔌 Backend API Documentation

All routes (except Auth login/register) require authorization header: `Authorization: Bearer <JWT_TOKEN>`.

### Authentication
- `POST /api/auth/register` - Create user. Request: `{ username, email, password }`
- `POST /api/auth/login` - Authenticate user. Request: `{ email, password }`
- `GET /api/auth/me` - Retrieve authenticated user profile details.
- `PUT /api/auth/preferences` - Sync theme choices: `{ theme: 'light' | 'dark' }`

### Video Workspace
- `GET /api/videos` - Retrieve all videos with current user progress populated.
- `POST /api/videos` - Save a custom video. Request: `{ title, url, duration, thumbnail }`
- `PUT /api/videos/:id/progress` - Save video playback location. Request: `{ currentTime }`

### Timestamped Notes
- `GET /api/notes?videoId=xyz&category=All&q=query` - Read, search, or filter notes.
- `POST /api/notes` - Create note (auto-saves base64 screenshots as files).
- `PUT /api/notes/:id` - Update note details. Request: `{ title, content, category, color, isFavorite }`
- `DELETE /api/notes/:id` - Delete note and its linked physical file.
- `PUT /api/notes/:id/favorite` - Toggle star favorites.

### AI Engine
- `POST /api/ai/summary` - Generate executive summary. Request: `{ notes, videoTitle }`
- `POST /api/ai/flashcards` - Compile flashcards array. Request: `{ notes }`
- `POST /api/ai/explain` - Feynman explainer helper. Request: `{ concept }`

---

## ✅ Progress & Git Commit Log

All commit milestones have been successfully implemented, tested, and validated:

| Commit Hash | Commit Message | Highlights |
|---|---|---|
| `ab79c6a` | `fix: resolve react render cycle race condition on expired local blobs` | Synchronous render-phase checks suppress invalid browser local URL loading logs |
| `f55d3cc` | `fix: safeguard asynchronous youtube API method calls to prevent crash` | Defensive checks verify YT API callbacks exist before triggering player actions |
| `c2f7164` | `fix: handle Bad Gateway 502 responses and add offline fallbacks` | Added content-type checks and local cache fallbacks when backend is offline |
| `ace3ff1` | `fix: resolve unused variable, react-hooks dependency, and unused import warnings` | Cleared 15 compiler and linter warnings from frontend source |
| `ce4d738` | `feat: suppress invalid blob player loading network console errors` | Introduced ACTIVE_SESSION_BLOBS set to track expired blob files |
| `3fdb982` | `feat: improve video error feedback for expired local blobs` | Detects when page is reloaded and guides user to re-select local videos |
| `ed98b83` | `feat: add YouTube video playback support` | Fully integrated YouTube Iframe API and unified player control layout |
| `b9dcde1` | `feat: add crossOrigin and error boundaries to VideoPlayer` | CORS-compliant video tag configuration and custom player error overlays |
| `3568211` | `release: prepare version 1.0.0 portfolio build` | Production client builds, visual optimizations, final cleanup |
| `d921b7a` | `docs: write comprehensive README and deployment guide` | Full system architectural mappings and API endpoint references |
| `c71a39f` | `feat: optimize UI performance and accessibility` | Smooth CSS transitions, dark mode contrast enhancements |
| `b53f48a` | `feat: build global search across notes` | Multi-field regex indexing on notes database |
| `a842b10` | `feat: generate AI flashcards from notes` | LLM JSON schema review decks and study helpers |
| `9c2d1b0` | `feat: implement AI lecture summaries` | Gemini 1.5 prompt distillation pipelines |
| `8d2e3f4` | `feat: add PDF, Markdown and TXT export` | Framer screenshot embedding inside print-ready PDF files |
| `7b1d2e3` | `feat: persist video progress and user preferences` | Video progress sync mapping per user inside MongoDB |
| `6a1c2d0` | `feat: integrate frontend with backend APIs` | Zustand state refactoring to sync remote workspace REST payloads |
| `5b1a2c0` | `feat: build notes CRUD REST API` | Remote note storage schemas and ownership authentication verification |
| `4a1b2c9` | `feat: implement authentication with JWT` | Secured router paths, cryptographically salted passwords, and JWT issue |
| `3f9d12a` | `feat: setup Express server and MongoDB connection` | Configured dotenv, Mongoose connectivity, and uploads static directories |

---

## ⚡ Deployment & Startup Guide

### Prerequisites
- **Node.js** (v18.x or higher)
- **MongoDB Server** (Running locally on default port `27017` or remote instance)

### 1. Server Setup
```bash
# Navigate to the server folder
cd server

# Install backend dependencies
npm install

# Create/Verify server/.env configuration
# Fill in your GEMINI_API_KEY (optional, falls back to local helpers if empty)
```

Start the backend:
```bash
# Start backend in development mode (with nodemon)
npm run dev
```

### 2. Client Setup
```bash
# Navigate to the client folder
cd client

# Install frontend dependencies
npm install

# Start client development server (proxies requests to port 5000)
npm run dev
```

### 3. Production Portfolio Build
```bash
# Compile and build the optimized production static asset bundle
npm run build
```

---

## ⌨️ Keyboard Shortcuts Reference

| Shortcut | Action |
|---|---|
| <kbd>N</kbd> | Grab active playback timestamp and focus note title input |
| <kbd>Ctrl</kbd> + <kbd>K</kbd> / <kbd>Cmd</kbd> + <kbd>K</kbd> | Focus global workspace search input |

---

## 📄 License

Personal Portfolio Project. Open for exploration.
