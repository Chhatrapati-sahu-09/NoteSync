import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  BookOpen,
  HelpCircle,
  Brain,
  Copy,
  Check,
  RefreshCw,
  Search,
} from 'lucide-react';
import { useNoteSyncStore } from '../store/useNoteSyncStore';
import type { Flashcard } from '../types';

export const AIModal: React.FC = () => {
  const { aiModalOpen, setAiModalOpen, notes, activeVideo, token } = useNoteSyncStore();

  const [activeTab, setActiveTab] = useState<'summary' | 'flashcards' | 'explain'>('summary');
  const [copied, setCopied] = useState(false);

  // Live state variables
  const [summary, setSummary] = useState('');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [explainInput, setExplainInput] = useState('');
  const [explanation, setExplanation] = useState('');

  // Loading states
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingFlashcards, setLoadingFlashcards] = useState(false);
  const [loadingExplain, setLoadingExplain] = useState(false);

  // Flashcards navigation
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Headers helper
  const getHeaders = () => ({
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  });

  // Fetch summary from API
  const generateSummary = async () => {
    if (!activeVideo) return;
    setLoadingSummary(true);
    try {
      // Filter notes for the active video
      const activeNotes = notes.filter(n => n.videoId === activeVideo.id);
      
      const res = await fetch('/api/ai/summary', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          notes: activeNotes,
          videoTitle: activeVideo.title
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSummary(data.summary);
      }
    } catch (e) {
      console.error('Failed to generate summary:', e);
    } finally {
      setLoadingSummary(false);
    }
  };

  // Fetch flashcards from API
  const generateFlashcards = async () => {
    if (!activeVideo) return;
    setLoadingFlashcards(false);
    setLoadingFlashcards(true);
    try {
      const activeNotes = notes.filter(n => n.videoId === activeVideo.id);
      const res = await fetch('/api/ai/flashcards', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ notes: activeNotes })
      });
      const data = await res.json();
      if (res.ok) {
        setFlashcards(data.flashcards);
        setCurrentCardIndex(0);
        setIsFlipped(false);
      }
    } catch (e) {
      console.error('Failed to generate flashcards:', e);
    } finally {
      setLoadingFlashcards(false);
    }
  };

  // Fetch explanation from API
  const generateExplanation = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!explainInput.trim()) return;

    setLoadingExplain(true);
    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ concept: explainInput })
      });
      const data = await res.json();
      if (res.ok) {
        setExplanation(data.explanation);
      }
    } catch (e) {
      console.error('Failed to explain concept:', e);
    } finally {
      setLoadingExplain(false);
    }
  };

  // Generate initial summary when opening modal if empty
  useEffect(() => {
    if (aiModalOpen && !summary && activeVideo && notes.length > 0) {
      generateSummary();
    }
    if (aiModalOpen && flashcards.length === 0 && activeVideo && notes.length > 0) {
      generateFlashcards();
    }
  }, [aiModalOpen]);

  if (!aiModalOpen) return null;

  const handleCopySummary = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
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

  // Clean Markdown Renderer helper for AI outputs (supports lists and bold)
  const formatMarkdown = (text: string) => {
    if (!text) return '';
    return text.split('\n').map((line, i) => {
      let content = line;
      // Headers
      if (content.startsWith('#### ')) {
        return <h5 key={i} className="font-bold text-zinc-900 dark:text-zinc-100 text-xs mt-2 mb-1">{content.replace('#### ', '')}</h5>;
      }
      if (content.startsWith('### ')) {
        return <h4 key={i} className="font-bold text-zinc-900 dark:text-zinc-100 text-sm mt-3 mb-2">{content.replace('### ', '')}</h4>;
      }
      // Bold replacements
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      while ((match = boldRegex.exec(content)) !== null) {
        parts.push(content.substring(lastIndex, match.index));
        parts.push(<strong key={match.index} className="font-bold text-zinc-950 dark:text-white">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      parts.push(content.substring(lastIndex));

      // Bullet points
      if (content.startsWith('* ') || content.startsWith('- ')) {
        return (
          <li key={i} className="list-disc pl-2 ml-4 mb-1">
            {parts.length > 1 ? parts : content.substring(2)}
          </li>
        );
      }

      // Plain paragraphs
      return <p key={i} className="mb-2 leading-relaxed">{parts.length > 1 ? parts : content}</p>;
    });
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
            className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center border-b border-zinc-200 dark:border-zinc-800 px-6 bg-white dark:bg-zinc-900 text-xs font-medium">
          <button
            onClick={() => setActiveTab('summary')}
            className={`py-3 px-4 flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
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
            className={`py-3 px-4 flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
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
            className={`py-3 px-4 flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
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
                  Video Notes Analysis ({notes.filter(n => activeVideo && n.videoId === activeVideo.id).length} notes captured)
                </span>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={generateSummary}
                    disabled={loadingSummary}
                    className="flex items-center space-x-1 text-xs text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingSummary ? 'animate-spin' : ''}`} />
                    <span>Regenerate</span>
                  </button>
                  <button
                    onClick={handleCopySummary}
                    disabled={!summary}
                    className="flex items-center space-x-1 text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline disabled:opacity-50"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied to Clipboard' : 'Copy Summary'}</span>
                  </button>
                </div>
              </div>

              {loadingSummary ? (
                <div className="p-8 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center space-y-3">
                  <span className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-zinc-500">NoteSync AI is distilling your workspace notes...</p>
                </div>
              ) : summary ? (
                <div className="p-5 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed max-h-[45vh] overflow-y-auto font-sans">
                  {formatMarkdown(summary)}
                </div>
              ) : (
                <div className="p-8 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center text-zinc-500 space-y-3">
                  <p className="text-xs">No summary generated yet. Capture some notes first!</p>
                  <button
                    onClick={generateSummary}
                    className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
                  >
                    Generate AI Summary
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'flashcards' && (
            <div className="space-y-4 text-center">
              {loadingFlashcards ? (
                <div className="p-8 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center space-y-3">
                  <span className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-zinc-500">Creating study deck from note highlights...</p>
                </div>
              ) : flashcards.length > 0 ? (
                <>
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>Card {currentCardIndex + 1} of {flashcards.length}</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={generateFlashcards}
                        className="text-[10px] flex items-center space-x-0.5 text-zinc-400 hover:text-indigo-500 transition-colors"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Regenerate</span>
                      </button>
                      <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 px-2.5 py-0.5 rounded-full text-[10px] font-medium">
                        {flashcards[currentCardIndex].category}
                      </span>
                    </div>
                  </div>

                  {/* Flashcard Component */}
                  <div
                    onClick={() => setIsFlipped(!isFlipped)}
                    className={`min-h-[200px] p-8 rounded-2xl border cursor-pointer transition-all duration-300 flex flex-col items-center justify-center space-y-3 shadow-md ${
                      isFlipped
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-800 scale-[1.01]'
                        : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-indigo-400'
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
                </>
              ) : (
                <div className="p-8 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center text-zinc-500 space-y-3">
                  <p className="text-xs font-medium">Capture notes to generate flashcards cards deck.</p>
                  <button
                    onClick={generateFlashcards}
                    className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
                  >
                    Generate AI Flashcards
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'explain' && (
            <div className="space-y-4">
              <p className="text-xs text-zinc-500">
                Ask NoteSync AI to break down complex code snippets, technical jargon, or video concepts into simple plain English.
              </p>

              {/* Explainer Search input */}
              <form onSubmit={generateExplanation} className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={explainInput}
                    onChange={(e) => setExplainInput(e.target.value)}
                    placeholder="Enter concept (e.g. JWT, Mongoose middleware, React 19 useOptimistic...)"
                    className="w-full pl-9 pr-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loadingExplain}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-750 flex items-center space-x-1.5 disabled:opacity-50"
                >
                  {loadingExplain ? (
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Explain</span>
                  )}
                </button>
              </form>

              {loadingExplain ? (
                <div className="p-8 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center space-y-3">
                  <span className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-zinc-500">AI is compiling concept explanation...</p>
                </div>
              ) : explanation ? (
                <div className="p-5 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl border border-indigo-100 dark:border-indigo-950/60 text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed max-h-[40vh] overflow-y-auto font-sans">
                  {formatMarkdown(explanation)}
                </div>
              ) : (
                <div className="p-6 text-center text-zinc-400 text-xs border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                  Type a concept above to trigger explanation.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
