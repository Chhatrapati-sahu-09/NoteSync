import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Layers,
  BookOpen,
  HelpCircle,
  RotateCw,
  CheckCircle2,
  Brain,
  Copy,
  Check,
} from 'lucide-react';
import { useNoteSyncStore } from '../store/useNoteSyncStore';
import type { Flashcard } from '../types';

export const AIModal: React.FC = () => {
  const { aiModalOpen, setAiModalOpen, notes, activeVideo } = useNoteSyncStore();

  const [activeTab, setActiveTab] = useState<'summary' | 'flashcards' | 'explain'>('summary');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Flashcards state
  const [flashcards, setFlashcards] = useState<Flashcard[]>([
    {
      id: 'fc-1',
      question: 'What is the primary benefit of React Server Components (RSC)?',
      answer: 'RSC renders components on the server, significantly reducing client bundle sizes and eliminating waterfall data fetching requests.',
      category: 'React Architecture',
    },
    {
      id: 'fc-2',
      question: 'How does useActionState simplify form handling in React 19?',
      answer: 'It handles async state transitions, providing pending status and form action handlers out of the box without manual state hooks.',
      category: 'React Hooks',
    },
    {
      id: 'fc-3',
      question: 'When should you leverage useOptimistic in web user interfaces?',
      answer: 'To immediately reflect optimistic state changes (like likes or comments) on the client UI before server confirmation.',
      category: 'UX Patterns',
    },
  ]);

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!aiModalOpen) return null;

  const handleCopySummary = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nextCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev + 1) % flashcards.length);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev === 0 ? flashcards.length - 1 : prev - 1));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/40">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                AI Intelligence Suite
              </h3>
              <p className="text-[11px] text-zinc-500">
                Automated summaries, flashcard generation & deep concept explanations
              </p>
            </div>
          </div>
          <button
            onClick={() => setAiModalOpen(false)}
            className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center border-b border-zinc-200 dark:border-zinc-800 px-6 bg-white dark:bg-zinc-900 text-xs font-medium">
          <button
            onClick={() => setActiveTab('summary')}
            className={`py-3 px-4 flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'summary'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Executive Summary</span>
          </button>
          <button
            onClick={() => setActiveTab('flashcards')}
            className={`py-3 px-4 flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'flashcards'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>Interactive Flashcards</span>
          </button>
          <button
            onClick={() => setActiveTab('explain')}
            className={`py-3 px-4 flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'explain'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Concept Explainer</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'summary' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Video Notes Analysis ({notes.length} notes captured)
                </span>
                <button
                  onClick={handleCopySummary}
                  className="flex items-center space-x-1 text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied to Clipboard' : 'Copy Summary'}</span>
                </button>
              </div>

              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700/60 space-y-3 text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed">
                <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                  📌 Key Takeaways & Core Concepts
                </p>
                <ul className="space-y-2 list-disc pl-4">
                  <li>
                    <strong>React 19 Server Components:</strong> Significantly improves client rendering performance by shifting component rendering to the server.
                  </li>
                  <li>
                    <strong>Simplified Async Form Actions:</strong> The <code className="bg-zinc-200 dark:bg-zinc-700 px-1 py-0.5 rounded font-mono">useActionState</code> hook simplifies handling pending UI states and form feedback.
                  </li>
                  <li>
                    <strong>Optimistic UI Pattern:</strong> Enables instantaneous user feedback using <code className="bg-zinc-200 dark:bg-zinc-700 px-1 py-0.5 rounded font-mono">useOptimistic</code> during optimistic mutation steps.
                  </li>
                </ul>

                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700/60">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                    ✅ Action Items & Follow-ups
                  </p>
                  <ul className="mt-1 space-y-1 text-zinc-600 dark:text-zinc-400">
                    <li>• Refactor legacy form pending state handlers to useActionState</li>
                    <li>• Benchmark bundle size reduction after server component migration</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'flashcards' && (
            <div className="space-y-4 text-center">
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>Card {currentCardIndex + 1} of {flashcards.length}</span>
                <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 px-2.5 py-0.5 rounded-full text-[11px] font-medium">
                  {flashcards[currentCardIndex].category}
                </span>
              </div>

              {/* Flashcard Component */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className={`min-h-[200px] p-8 rounded-2xl border cursor-pointer transition-all duration-300 flex flex-col items-center justify-center space-y-3 shadow-md ${
                  isFlipped
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-800'
                    : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700'
                }`}
              >
                <span className="text-[10px] uppercase font-bold text-indigo-500 tracking-wider">
                  {isFlipped ? 'Answer' : 'Question (Click to reveal)'}
                </span>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 max-w-md leading-relaxed">
                  {isFlipped ? flashcards[currentCardIndex].answer : flashcards[currentCardIndex].question}
                </p>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-center space-x-3 pt-2">
                <button
                  onClick={prevCard}
                  className="px-4 py-1.5 border border-zinc-200 dark:border-zinc-700 text-xs font-medium rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Previous
                </button>
                <button
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 shadow-xs"
                >
                  {isFlipped ? 'Hide Answer' : 'Show Answer'}
                </button>
                <button
                  onClick={nextCard}
                  className="px-4 py-1.5 border border-zinc-200 dark:border-zinc-700 text-xs font-medium rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {activeTab === 'explain' && (
            <div className="space-y-3">
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Ask NoteSync AI to break down complex code snippets, technical jargon, or video concepts into simple plain English.
              </p>

              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700/60 space-y-2">
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  💡 Explanation: React Server Components (RSC)
                </p>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  Think of traditional React like ordering un-assembled furniture: your browser receives the instructions and tools (JavaScript bundle) and has to build everything locally. With React Server Components, the server pre-builds the furniture and ships ready-to-use HTML to your screen!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
