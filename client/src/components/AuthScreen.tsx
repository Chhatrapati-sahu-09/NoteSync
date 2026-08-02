import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNoteSyncStore } from '../store/useNoteSyncStore';
import { Lock, Mail, User as UserIcon, Sparkles, AlertCircle } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login, register } = useNoteSyncStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!username.trim()) {
          throw new Error('Please enter a username');
        }
        await register(username, email, password);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] dark:bg-zinc-950 flex flex-col items-center justify-center p-4 font-sans selection:bg-indigo-500/30">
      {/* Background Graphic Accents */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-400/10 dark:bg-indigo-900/10 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-amber-400/10 dark:bg-amber-900/10 rounded-full filter blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-extrabold text-xl shadow-md mb-3">
            N
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            NoteSync Workspace
          </h1>
          <p className="text-xs text-zinc-500 mt-1.5 max-w-xs mx-auto">
            Sync video lectures, take canvas-anchored markdown notes, and generate study flashcards.
          </p>
        </div>

        {/* Auth Card Container */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden p-6 md:p-8">
          {/* Tab Switcher */}
          <div className="flex border-b border-zinc-200 dark:border-zinc-800 mb-6 text-sm font-semibold">
            <button
              onClick={() => {
                setIsLogin(true);
                setErrorMsg(null);
              }}
              className={`flex-1 pb-3 text-center border-b-2 transition-colors ${
                isLogin
                  ? 'border-indigo-500 text-zinc-900 dark:text-zinc-100'
                  : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setErrorMsg(null);
              }}
              className={`flex-1 pb-3 text-center border-b-2 transition-colors ${
                !isLogin
                  ? 'border-indigo-500 text-zinc-900 dark:text-zinc-100'
                  : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
              }`}
            >
              Sign Up
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={isLogin ? 'login' : 'register'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {/* Error Alert */}
              {errorMsg && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-600 dark:text-rose-400 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Username field (only on Sign Up) */}
              {!isLogin && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                    Username
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Your name"
                      className="w-full pl-9 pr-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs bg-zinc-50/50 dark:bg-zinc-800/40 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Email field */}
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full pl-9 pr-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs bg-zinc-50/50 dark:bg-zinc-800/40 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs bg-zinc-50/50 dark:bg-zinc-800/40 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-zinc-900 dark:bg-zinc-100 hover:opacity-95 text-white dark:text-zinc-900 py-2.5 rounded-xl text-xs font-semibold shadow-md flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{isLogin ? 'Log In to Workspace' : 'Create Account'}</span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </motion.form>
          </AnimatePresence>
        </div>

        {/* Feature badges list */}
        <div className="flex items-center justify-center flex-wrap gap-2 mt-8 text-[10px] font-medium text-zinc-400">
          <span className="bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-200/50 dark:border-zinc-800">
            🎬 HTML5 Player Progress Sync
          </span>
          <span className="bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-200/50 dark:border-zinc-800">
            📝 Canvas Screenshots
          </span>
          <span className="bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-200/50 dark:border-zinc-800">
            🤖 Gemini AI Suite
          </span>
        </div>
      </div>
    </div>
  );
};
