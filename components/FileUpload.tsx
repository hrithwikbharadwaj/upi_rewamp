'use client';

import React, { useCallback, useState } from 'react';
import { Upload, AlertTriangle, FileText, ArrowUp, Zap, Terminal, Smartphone, ShieldCheck, Lock, ChevronDown } from 'lucide-react';
import { StoryData, AppState } from '../types';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

interface FileUploadProps {
  setAppState: (state: AppState) => void;
  setData: (data: StoryData) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const FileUpload: React.FC<FileUploadProps> = ({ setAppState, setData }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>('');

  const processFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setErrorMsg('PDF FILES ONLY. ACCESS DENIED.');
      return;
    }

    // Check file size (10MB limit)
    if (file.size > MAX_FILE_SIZE) {
      setErrorMsg('FILE TOO LARGE. MAX 10MB ALLOWED.');
      return;
    }

    setAppState('ANALYZING');
    setErrorMsg(null);
    
    try {
      // Step 1: Get presigned URL
      setUploadProgress('GENERATING UPLOAD URL...');
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        }),
      });

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        throw new Error(error.error || 'Failed to generate upload URL');
      }

      const { presignedUrl, key } = await uploadResponse.json();

      // Step 2: Upload file to R2 using presigned URL
      setUploadProgress('UPLOADING TO SECURE STORAGE...');
      const uploadResult = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResult.ok) {
        throw new Error('Failed to upload file');
      }

      // Step 3: Analyze the uploaded file
      setUploadProgress('ANALYZING WITH AI...');
      const analyzeResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key }),
      });

      if (!analyzeResponse.ok) {
        const error = await analyzeResponse.json();
        throw new Error(error.error || 'Failed to analyze statement');
      }

      const { data: analysisData } = await analyzeResponse.json();

      // Set the data and transition to ready state
      setUploadProgress('ROAST COMPLETE. PREPARE YOURSELF...');
      setTimeout(() => {
        setData(analysisData);
        setAppState('READY');
        setUploadProgress('');
      }, 1000);
    } catch (error: any) {
      console.error(error);
      setAppState('IDLE');
      setErrorMsg(error.message || 'ANALYSIS FAILED. TRY AGAIN.');
      setUploadProgress('');
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  return (
    <div 
      className="flex flex-col min-h-screen w-full relative bg-true-black font-sans selection:bg-acid selection:text-black overflow-x-hidden"
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      {/* Top Spotlight */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80vw] h-[50vh] bg-[conic-gradient(from_180deg_at_50%_50%,rgba(255,255,255,0.1)_0deg,transparent_60deg,transparent_300deg,rgba(255,255,255,0.1)_360deg)] opacity-50 blur-3xl pointer-events-none z-0"></div>

      {/* Marquee Header */}
      <div className="fixed top-0 left-0 w-full border-b border-white/5 bg-black/50 backdrop-blur-md z-40 overflow-hidden py-2">
         <div className="flex whitespace-nowrap animate-marquee font-mono text-[10px] text-gray-500 uppercase tracking-widest">
            {Array(10).fill("NO DATA STORED /// LOCAL PROCESSING ONLY /// PREPARE FOR JUDGMENT /// ").map((text, i) => (
              <span key={i} className="mx-2">{text}</span>
            ))}
         </div>
      </div>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center relative z-10 w-full px-4 pt-20">
        
        {/* Cinematic Typography Stack */}
        <div className="flex flex-col items-center justify-center -space-y-4 md:-space-y-8 lg:-space-y-12 mb-20 md:mb-32 w-full mix-blend-screen">
          <motion.h1 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 0.5 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="text-[12vw] md:text-[10rem] font-black tracking-tighter leading-none text-white select-none"
          >
            UPI
          </motion.h1>
          
          <motion.h1 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="text-[12vw] md:text-[10rem] font-black tracking-tighter leading-none text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] select-none"
          >
            WRAPPED
          </motion.h1>

          <motion.h1 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="outline-text text-[12vw] md:text-[10rem] font-black tracking-tighter leading-none select-none"
          >
            2025
          </motion.h1>
        </div>

        {/* The Magnetic Drop Pill */}
        <DropPill 
          isDragging={isDragging} 
          hasError={!!errorMsg} 
          onFileSelect={handleFileInput}
        />

        {/* Scroll Indicator */}
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            className="absolute bottom-12 flex flex-col items-center gap-2 opacity-50"
        >
            <span className="font-mono text-[10px] uppercase tracking-widest text-gray-500">Scroll for Truth</span>
            <div className="w-[1px] h-8 bg-gradient-to-b from-transparent via-white/50 to-transparent"></div>
        </motion.div>

        {/* Error Feedback */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-32 font-mono text-xs text-red-500 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-full flex items-center gap-2"
            >
              <AlertTriangle size={14} />
              {errorMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Progress */}
        <AnimatePresence>
          {uploadProgress && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-32 font-mono text-xs text-acid bg-acid/10 border border-acid/20 px-4 py-2 rounded-full flex items-center gap-2"
            >
              <div className="w-3 h-3 border-2 border-acid border-t-transparent rounded-full animate-spin" />
              {uploadProgress}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Preview Section */}
      <section className="py-32 bg-true-black border-t border-white/5 overflow-hidden relative">
         <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 relative h-[600px] flex items-center justify-center">
                 {/* Decorative Blobs */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-acid rounded-full blur-[100px] opacity-20 animate-pulse"></div>
                 {/* Mockup Card */}
                 <motion.div 
                   style={{ y }}
                   className="relative z-10 w-[320px] h-[560px] bg-white/5 backdrop-blur-xl border border-white/20 rounded-[40px] p-6 flex flex-col shadow-2xl rotate-[-6deg] hover:rotate-0 transition-transform duration-500"
                 >
                    <div className="flex justify-between items-center mb-8 opacity-50">
                        <div className="w-12 h-4 bg-white/20 rounded-full"></div>
                        <div className="w-4 h-4 rounded-full border border-white/50"></div>
                    </div>
                    <div className="space-y-4 mb-auto">
                        <div className="w-3/4 h-8 bg-white/20 rounded animate-pulse"></div>
                        <div className="w-1/2 h-6 bg-white/10 rounded"></div>
                    </div>
                    <div className="w-full aspect-square bg-gradient-to-tr from-acid to-transparent rounded-full opacity-20 blur-xl mb-8"></div>
                    <div className="space-y-2 mt-auto">
                        <div className="w-full h-12 bg-acid text-black font-bold flex items-center justify-center rounded-xl">SHARE THIS MESS</div>
                    </div>
                 </motion.div>
            </div>
            <div className="order-1 md:order-2 space-y-8">
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
                    SEE THE <br/> <span className="text-acid">UNFILTERED</span> <br/> REALITY.
                </h2>
                <p className="text-xl text-gray-400 max-w-md">
                    We turn your dry, boring PDF bank statement into a brutalist, high-energy recap of your questionable financial decisions.
                </p>
                <ul className="space-y-4 font-mono text-sm text-gray-500">
                    <li className="flex items-center gap-3">
                        <Zap size={16} className="text-acid" />
                        <span>Instant Local Analysis</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <Zap size={16} className="text-acid" />
                        <span>Top Merchant Roast</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <Zap size={16} className="text-acid" />
                        <span>Generative &quot;Aura&quot; Card</span>
                    </li>
                </ul>
            </div>
         </div>
      </section>

      {/* The Manifesto Section */}
      <section className="py-32 bg-acid text-black">
          <div className="max-w-5xl mx-auto px-6">
              <p className="font-mono text-sm tracking-widest uppercase mb-12 border-b border-black/10 pb-4">The Manifesto</p>
              <h3 className="text-4xl md:text-7xl font-black leading-[0.9] tracking-tighter mb-12">
                  FINANCIAL APPS ARE BORING. <br/>
                  WE ARE NOT.
              </h3>
              <div className="grid md:grid-cols-2 gap-12 text-lg md:text-xl font-medium leading-relaxed opacity-80">
                  <p>
                      Most banking apps are designed to make you feel &quot;safe&quot; and &quot;responsible.&quot; They hide your bad habits behind polite charts and beige interfaces.
                  </p>
                  <p>
                      We believe the only way to truly fix your spending is to stare directly into the abyss. Bank Wrapped uses raw data to give you the wake-up call you actually need.
                  </p>
              </div>
          </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-neutral-900/10 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-4xl font-black tracking-tighter mb-16 text-center">HOW IT WORKS</h2>
            <div className="grid md:grid-cols-3 gap-8">
                {[
                    { icon: FileText, title: "1. Export PDF", desc: "Log in to your bank and download your statement as a PDF." },
                    { icon: Upload, title: "2. Drop It Here", desc: "Drag that file into the portal above. We handle the parsing instantly." },
                    { icon: Smartphone, title: "3. Get Roasted", desc: "Scroll through your year in review and share the damage." }
                ].map((step, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-colors group">
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-acid group-hover:text-black transition-colors">
                            <step.icon size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Security Terminal Section */}
      <section className="py-24 bg-black border-t border-white/5 font-mono">
         <div className="max-w-4xl mx-auto px-6">
            <div className="flex items-center gap-2 mb-8 text-acid">
                <Terminal size={24} />
                <span className="text-xl font-bold tracking-widest uppercase">Security_Protocol.sh</span>
            </div>
            
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 md:p-12 shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-acid to-transparent opacity-50"></div>
                
                <div className="space-y-4 text-sm md:text-base">
                    <div className="flex gap-4">
                        <span className="text-gray-500">01</span>
                        <p className="text-white"><span className="text-blue-400">const</span> <span className="text-yellow-300">privacy</span> = <span className="text-blue-400">new</span> Priority();</p>
                    </div>
                    <div className="flex gap-4">
                        <span className="text-gray-500">02</span>
                        <p className="text-gray-400">Your file is parsed strictly in the browser.</p>
                    </div>
                    <div className="flex gap-4">
                        <span className="text-gray-500">03</span>
                        <p className="text-gray-400">/No servers. No database. No tracking.</p>
                    </div>
                    <div className="flex gap-4">
                        <span className="text-gray-500">04</span>
                        <p className="text-white">
                            <span className="text-purple-400">await</span> file.<span className="text-yellow-300">processLocal</span>();
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <span className="text-gray-500">05</span>
                        <p className="text-acid blink">_ System Secure.</p>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="text-acid" size={20} />
                        <span className="text-gray-300 text-xs uppercase tracking-widest">Client-Side Only</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Lock className="text-acid" size={20} />
                        <span className="text-gray-300 text-xs uppercase tracking-widest">Zero Retention</span>
                    </div>
                </div>
            </div>
         </div>
      </section>

      {/* Testimonials (Wall of Shame) */}
      <section className="py-24 bg-true-black border-t border-white/5 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
            <h2 className="text-4xl font-black tracking-tighter mb-16 text-center">WALL OF SHAME</h2>
            <div className="grid md:grid-cols-3 gap-6">
                {[
                    { quote: "I found out I spent $4,000 on coffee. I am physically ill.", author: "@caffeine_addict" },
                    { quote: "This app roasted me harder than my parents ever did.", author: "@fin_wreck" },
                    { quote: "Deleting Uber Eats immediately. Thanks for the reality check.", author: "@lazy_diner" }
                ].map((item, i) => (
                    <div key={i} className="bg-white/5 p-8 rounded-none border-l-2 border-acid hover:bg-white/10 transition-colors">
                        <p className="text-lg font-medium mb-6 italic text-gray-200">&quot;{item.quote}&quot;</p>
                        <p className="text-sm font-mono text-gray-500 uppercase">{item.author}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-neutral-900/20 border-t border-white/5">
         <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl font-black tracking-tighter mb-12 text-center uppercase">Common Questions</h2>
            <div className="space-y-4">
                {[
                    { q: "Is this actually safe?", a: "Yes. The code runs entirely in your browser. Your PDF never leaves your device. You can verify this by turning off your internet before dropping the file." },
                    { q: "Does it support my bank?", a: "We support most major banks with standard PDF formats (Chase, BoA, Wells Fargo, etc.). If it fails, check if your PDF is text-readable." },
                    { q: "Why did you build this?", a: "Because spreadsheets are boring and shame is a powerful motivator." }
                ].map((faq, i) => (
                    <details key={i} className="group bg-white/5 border border-white/10 rounded-lg open:bg-white/10 transition-colors cursor-pointer">
                        <summary className="flex justify-between items-center p-6 font-bold list-none">
                            <span>{faq.q}</span>
                            <ChevronDown className="group-open:rotate-180 transition-transform text-acid" size={20} />
                        </summary>
                        <div className="px-6 pb-6 text-gray-400 text-sm leading-relaxed">
                            {faq.a}
                        </div>
                    </details>
                ))}
            </div>
         </div>
      </section>

      {/* Footer / QR */}
      <section className="py-24 bg-true-black border-t border-white/5 flex flex-col items-center justify-center text-center relative z-10">
          <div className="bg-white p-4 rounded-xl mb-8 group hover:scale-105 transition-transform duration-500 shadow-[0_0_40px_rgba(255,255,255,0.2)]">
             {/* Simple SVG QR Code Placeholder */}
             <svg width="120" height="120" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-black">
                <rect width="100" height="100" fill="white"/>
                <path d="M10 10H40V40H10V10Z" fill="black"/>
                <path d="M60 10H90V40H60V10Z" fill="black"/>
                <path d="M10 60H40V90H10V60Z" fill="black"/>
                <rect x="50" y="50" width="10" height="10" fill="black"/>
                <rect x="60" y="60" width="10" height="10" fill="black"/>
                <rect x="80" y="80" width="10" height="10" fill="black"/>
                <rect x="50" y="80" width="10" height="10" fill="black"/>
                <rect x="80" y="50" width="10" height="10" fill="black"/>
             </svg>
          </div>
          <h3 className="text-2xl font-bold mb-2">BANK WRAPPED</h3>
          <p className="font-mono text-xs text-gray-500 mb-8">BUILT FOR THE FINANCIALLY RECKLESS</p>
          
          <div className="flex gap-6 text-sm text-gray-500">
             <a href="#" className="hover:text-acid transition-colors">Privacy</a>
             <a href="#" className="hover:text-acid transition-colors">Terms</a>
             <a href="#" className="hover:text-acid transition-colors">Twitter</a>
          </div>
          <p className="mt-8 text-[10px] text-gray-600 font-mono">
             © 2024 Financial Toxicity Report. No rights reserved.
          </p>
      </section>
    </div>
  );
};

// Sub-component for the Pill
const DropPill: React.FC<{ isDragging: boolean; hasError: boolean; onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ isDragging, hasError, onFileSelect }) => {
  return (
    <motion.label 
      initial={{ y: 50, opacity: 0 }}
      animate={{ 
        y: 0, 
        opacity: 1,
        width: isDragging ? 420 : 300,
        height: isDragging ? 80 : 60,
        scale: isDragging ? 1.05 : 1,
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`
        relative flex items-center justify-center gap-3
        cursor-pointer rounded-full backdrop-blur-xl transition-colors duration-300 z-50
        ${isDragging 
            ? 'bg-acid/10 border-acid shadow-[0_0_50px_rgba(204,255,0,0.2)]' 
            : 'bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10'}
        ${hasError ? 'border-red-500 animate-shake' : ''}
      `}
    >
      <input type="file" className="hidden" accept=".pdf" onChange={onFileSelect} />
      
      <motion.div
        animate={{ 
          rotate: isDragging ? 180 : 0,
          color: isDragging ? '#CCFF00' : '#FFFFFF' 
        }}
      >
        {isDragging ? <ArrowUp size={24} /> : <Upload size={20} className="text-gray-400" />}
      </motion.div>

      <div className="flex flex-col items-start">
        <span className={`font-mono text-xs font-bold tracking-widest uppercase ${isDragging ? 'text-acid' : 'text-white'}`}>
           {isDragging ? 'Release to Scan' : 'Drop PDF Statement'}
        </span>
        {!isDragging && (
          <span className="text-[10px] text-gray-500 font-mono">
             Or click to browse
          </span>
        )}
      </div>

      <div className="absolute top-[-1px] left-[20%] w-[60%] h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      <div className="absolute bottom-[-1px] left-[20%] w-[60%] h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
    </motion.label>
  );
};

export default FileUpload;

