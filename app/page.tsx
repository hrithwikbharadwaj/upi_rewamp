'use client';

import React, { useState, useEffect } from 'react';
import FileUpload from '../components/FileUpload';
import StoryView from '../components/StoryView';
import { AppState, StoryData } from '../types';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'bank_wrapped_data';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('IDLE');
  const [data, setData] = useState<StoryData | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsedData = JSON.parse(stored);
        setData(parsedData);
        setAppState('READY');
      } catch (e) {
        console.error('Failed to parse stored data:', e);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Save data to localStorage whenever it changes
  const handleSetData = (newData: StoryData) => {
    setData(newData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  };

  const handleReset = () => {
    setAppState('IDLE');
    setTimeout(() => {
      setData(null);
      localStorage.removeItem(STORAGE_KEY);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-true-black text-white selection:bg-acid selection:text-black relative">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-purple-900/10 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
      </div>

      <main className="relative z-10 w-full h-full">
        <AnimatePresence mode="wait">
          {appState === 'IDLE' && (
            <motion.div
              key="landing"
              exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="w-full h-full"
            >
              <FileUpload setAppState={setAppState} setData={handleSetData} />
            </motion.div>
          )}

          {appState === 'ANALYZING' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed inset-0 flex flex-col items-center justify-center bg-true-black z-50"
            >
               <div className="flex flex-col items-center gap-6">
                 <Loader2 className="w-16 h-16 animate-spin text-acid" />
                 <h2 className="text-3xl font-black tracking-tighter uppercase animate-pulse">Crunching Numbers</h2>
                 <p className="font-mono text-xs text-gray-500 uppercase tracking-[0.2em]">Processing // 100% Private</p>
               </div>
            </motion.div>
          )}

          {appState === 'READY' && data && (
            <motion.div
              key="story"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.8, ease: "circOut" }}
              className="w-full h-full fixed inset-0 overflow-hidden" 
            >
              <StoryView data={data} onReset={handleReset} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

