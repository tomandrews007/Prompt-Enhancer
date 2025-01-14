import { useState, useEffect } from 'react';
    import { motion, AnimatePresence } from 'framer-motion';
    import { FiSun, FiMoon, FiCopy, FiCheck, FiClock } from 'react-icons/fi';
    import { RiMagicFill, RiQuillPenFill } from 'react-icons/ri';

    function App() {
      const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
      const [seedPrompt, setSeedPrompt] = useState('');
      const [enhancedPrompt, setEnhancedPrompt] = useState('');
      const [isLoading, setIsLoading] = useState(false);
      const [copied, setCopied] = useState(false);
      const [error, setError] = useState('');
      const [history, setHistory] = useState(() => {
        try {
          return JSON.parse(localStorage.getItem('promptHistory')) || [];
        } catch {
          return [];
        }
      });

      useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('theme', theme);
      }, [theme]);

      const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
      };

      const enhancePrompt = async (option) => {
        if (!seedPrompt.trim()) {
          setError('Please enter a prompt');
          return;
        }

        setError('');
        setIsLoading(true);
        try {
          const response = await fetch('/enhance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ seedPrompt: seedPrompt.trim(), option }),
          });

          const data = await response.json();
          if (!response.ok) throw new Error(data.error || data.details || 'Failed to enhance prompt');

          setEnhancedPrompt(data.enhancedPrompt);
          addToHistory(data.enhancedPrompt);
        } catch (error) {
          console.error('Error:', error);
          setError(error.message);
        } finally {
          setIsLoading(false);
        }
      };

      const addToHistory = (prompt) => {
        const newHistory = [
          { timestamp: new Date().toISOString(), prompt },
          ...history,
        ].slice(0, 10);
        setHistory(newHistory);
        localStorage.setItem('promptHistory', JSON.stringify(newHistory));
      };

      const copyToClipboard = async () => {
        try {
          await navigator.clipboard.writeText(enhancedPrompt);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error('Failed to copy:', err);
          setError('Failed to copy to clipboard');
        }
      };

      return (
        <div className="min-h-screen px-4 py-8 transition-colors duration-200">
          <button
            onClick={toggleTheme}
            className="fixed top-4 right-4 p-3 rounded-full glass-effect shadow-lg hover:shadow-xl transition-all"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
          </button>

          <main className="max-w-4xl mx-auto space-y-8">
            <motion.header 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-2"
            >
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Prompt Enhancer
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Transform your ideas into powerful prompts
              </p>
            </motion.header>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="glass-effect rounded-2xl p-6 shadow-lg">
                <textarea
                  value={seedPrompt}
                  onChange={(e) => setSeedPrompt(e.target.value)}
                  placeholder="Enter your seed prompt here..."
                  className="w-full h-40 p-4 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />

                {error && (
                  <div className="mt-2 text-red-500 text-sm">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <button
                    onClick={() => enhancePrompt('brief')}
                    disabled={isLoading}
                    className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RiMagicFill size={24} className="mb-2" />
                    <span className="font-semibold">Brief Enhancement</span>
                    <span className="text-sm opacity-90">Concise, under 70 words</span>
                  </button>

                  <button
                    onClick={() => enhancePrompt('max')}
                    disabled={isLoading}
                    className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RiQuillPenFill size={24} className="mb-2" />
                    <span className="font-semibold">Detailed Enhancement</span>
                    <span className="text-sm opacity-90">Comprehensive, under 700 words</span>
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {(enhancedPrompt || isLoading) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="glass-effect rounded-2xl p-6 shadow-lg space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-semibold">Enhanced Output</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {isLoading ? 'Enhancing your prompt...' : 'Your enhanced prompt is ready'}
                        </p>
                      </div>
                      {!isLoading && enhancedPrompt && (
                        <button
                          onClick={copyToClipboard}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                        >
                          {copied ? <FiCheck size={18} /> : <FiCopy size={18} />}
                          <span>{copied ? 'Copied!' : 'Copy'}</span>
                        </button>
                      )}
                    </div>
                    <div className="p-4 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                      {isLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        </div>
                      ) : (
                        enhancedPrompt
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="flex items-baseline justify-between">
                <h2 className="text-2xl font-semibold">History</h2>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Your recent prompts
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {history.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 col-span-2 text-center py-8">
                    No history yet. Start by enhancing a prompt!
                  </p>
                ) : (
                  history.map((item, index) => (
                    <motion.div
                      key={item.timestamp}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="glass-effect p-4 rounded-xl cursor-pointer hover:shadow-lg transition-all"
                      onClick={() => {
                        setEnhancedPrompt(item.prompt);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <FiClock size={14} />
                        {new Date(item.timestamp).toLocaleString()}
                      </div>
                      <p className="line-clamp-3">{item.prompt}</p>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.section>
          </main>
        </div>
      );
    }

    export default App;
