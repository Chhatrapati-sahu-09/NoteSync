import type { VideoItem, Note } from '../types';

export const INITIAL_VIDEOS: VideoItem[] = [
  {
    id: 'vid-react-19',
    title: 'React 19 & Next.js 15 Masterclass - Key Features Explained',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    duration: 596,
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop',
    currentTime: 42,
    lastPlayedAt: new Date().toISOString(),
    categories: ['React', 'Web Dev', 'Frontend', 'JavaScript'],
  },
  {
    id: 'vid-design-systems',
    title: 'Building Notion-Inspired Minimal UI Components with Tailwind',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    duration: 653,
    thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=800&auto=format&fit=crop',
    currentTime: 120,
    lastPlayedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    categories: ['UI/UX', 'Design', 'Tailwind CSS'],
  }
];

export const INITIAL_NOTES: Note[] = [
  {
    id: 'note-1',
    videoId: 'vid-react-19',
    timestamp: 14,
    formattedTime: '00:14',
    title: 'Understanding React Server Components Architecture',
    content: 'React Server Components (RSC) allow components to render on the server, significantly reducing client bundle sizes and eliminating waterfall data fetching requests.',
    category: 'Key Takeaway',
    isFavorite: true,
    color: 'yellow',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'note-2',
    videoId: 'vid-react-19',
    timestamp: 42,
    formattedTime: '00:42',
    title: 'new useActionState Hook Implementation',
    content: '```typescript\nconst [state, formAction, isPending] = useActionState(asyncStateFn, initialState);\n```\nReplaces manual pending states when processing form submissions in React 19.',
    category: 'Code Snippet',
    isFavorite: false,
    color: 'blue',
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
  {
    id: 'note-3',
    videoId: 'vid-react-19',
    timestamp: 105,
    formattedTime: '01:45',
    title: 'Optimistic UI Updates with useOptimistic',
    content: 'Use `useOptimistic` to show instantaneous client feedback before the server round-trip completes. Highly recommended for comment streams and likes.',
    category: 'Summary',
    isFavorite: true,
    color: 'green',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];
