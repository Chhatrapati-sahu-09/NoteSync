# NoteSync Architecture Documentation

NoteSync is a video-first note taking platform built with a Notion-inspired aesthetic.

## Stack Overview
- **Client**: React 19, Vite, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Zustand, React Router.
- **Server**: Node.js, Express, MongoDB (Mongoose), JWT Auth, Multer screenshot storage, PDF export service.

## Core Client Modules
1. **VideoPlayer**: Timeline controls, speed toggle, HTML5 video / canvas renderer, frame snapshot capture.
2. **Timestamped NoteEditor**: Auto-captures active timestamp, supports rich text, categories, search, drag & reorder.
3. **AI Suite**: Video summarization, flashcards deck generator, concept explainer.
4. **Sync & Local Storage**: Zustand store with localStorage persistence fallback.
