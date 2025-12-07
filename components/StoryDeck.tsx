'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useSpring, useInView } from 'framer-motion';
import { AnalysisResult } from '../types';
import { Share2, ArrowDown, Coffee, Laptop, X, TrendingUp } from 'lucide-react';
import html2canvas from 'html2canvas';

interface StoryDeckProps {
  data: AnalysisResult;
  onReset: () => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};

const StoryDeck: React.FC<StoryDeckProps> = ({ data, onReset }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const slideHeight = containerRef.current.clientHeight;
        const scrollPos = containerRef.current.scrollTop;
        const index = Math.round(scrollPos / slideHeight);
        setActiveSlide(index);
      }
    };
    const ref = containerRef.current;
    ref?.addEventListener('scroll', handleScroll);
    return () => ref?.removeEventListener('scroll', handleScroll);
  }, []);

  const totalSlides = 5; // Intro, Total, Timeline, Top Merchant, Aura

  return (
    <div className="relative h-screen w-full bg-true-black text-white">
      
      {/* Navigation Progress Bars */}
      <div className="absolute top-4 left-0 w-full px-4 z-50 flex gap-2 pointer-events-none">
        {Array.from({ length: totalSlides }).map((_, idx) => (
          <div key={idx} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
            <motion.div 
              className="h-full bg-acid box-shadow-[0_0_10px_#CCFF00]"
              initial={{ width: '0%' }}
              animate={{ width: activeSlide > idx ? '100%' : activeSlide === idx ? '100%' : '0%' }}
              transition={{ duration: activeSlide === idx ? 0.5 : 0 }}
            />
          </div>
        ))}
      </div>

      <button 
        onClick={onReset}
        className="fixed top-8 right-6 z-[60] bg-black/20 hover:bg-white/10 backdrop-blur-md p-2 rounded-full text-gray-500 hover:text-white transition-all duration-300 hover:scale-110 group"
      >
        <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
      </button>

      <div 
        ref={containerRef}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar scroll-smooth"
      >
        <IntroSlide />
        <TotalSpendSlide totalSpend={data.totalSpend} />
        <TimelineSlide monthlySpend={data.monthlySpend} />
        <TopMerchantSlide merchant={data.topMerchant} />
        <AuraSlide data={data} />
      </div>

      <a 
        href="https://buymeacoffee.com" 
        target="_blank" 
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#FFDD00] text-black p-3 rounded-full hover:scale-110 transition-transform shadow-[0_0_20px_rgba(255,221,0,0.4)]"
      >
        <Coffee size={24} />
      </a>
    </div>
  );
};

// --- SLIDE 1: INTRO ---
const IntroSlide = () => {
  return (
    <section className="h-screen w-full snap-center flex flex-col items-center justify-center p-6 relative overflow-hidden bg-true-black">
      <div className="flex flex-col items-center z-10 space-y-2 mix-blend-difference">
        {["2024.", "WAS.", "EXPENSIVE."].map((text, i) => (
          <motion.h1
            key={text}
            initial={{ y: 100, opacity: 0, rotateX: -90 }}
            whileInView={{ y: 0, opacity: 1, rotateX: 0 }}
            transition={{ delay: i * 0.4, duration: 0.8, type: "spring" }}
            viewport={{ once: false }}
            className={`text-6xl md:text-9xl font-black tracking-tighter ${i === 2 ? 'text-acid' : 'text-white'}`}
          >
            {text}
          </motion.h1>
        ))}
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-black to-blue-900/40 blur-3xl opacity-50 animate-pulse"></div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        className="absolute bottom-12 text-center"
      >
        <p className="font-mono text-xs uppercase tracking-widest text-gray-500 mb-2">Proceed with caution</p>
        <ArrowDown className="mx-auto text-gray-500 animate-bounce" />
      </motion.div>
    </section>
  );
};

// --- SLIDE 2: THE DAMAGE ---
const TotalSpendSlide = ({ totalSpend }: { totalSpend: number }) => {
  const macbooks = Math.floor(totalSpend / 1099);

  return (
    <section className="h-screen w-full snap-center flex flex-col items-center justify-center p-6 relative overflow-hidden bg-true-black border-t border-white/10">
      <div className="text-center z-10 w-full max-w-4xl">
        <p className="font-mono text-sm text-acid uppercase tracking-widest mb-4">The Damage</p>
        
        <motion.div
           initial={{ scale: 0.8, filter: "blur(10px)" }}
           whileInView={{ scale: 1, filter: "blur(0px)" }}
           transition={{ duration: 0.8 }}
           className="relative"
        >
           <h2 className="text-[14vw] leading-none font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-800 drop-shadow-2xl tabular-nums">
             <Counter value={totalSpend} />
           </h2>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-12 bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md inline-flex flex-col items-center gap-2 max-w-md mx-auto"
        >
           <div className="flex items-center gap-3 text-gray-300">
              <Laptop size={20} />
              <span className="font-mono text-sm">That&apos;s approx.</span>
           </div>
           <p className="text-2xl md:text-3xl font-bold">
             <span className="text-acid">{macbooks}</span> MacBook Airs
           </p>
           <p className="text-xs text-gray-500 uppercase tracking-wide">of panic buying</p>
        </motion.div>
      </div>
    </section>
  );
};

// --- SLIDE 3: TIMELINE (UPDATED) ---
const TimelineSlide = ({ monthlySpend }: { monthlySpend: { month: string, amount: number }[] }) => {
  const maxSpend = Math.max(...monthlySpend.map(m => m.amount));
  
  return (
    <section className="h-screen w-full snap-center flex flex-col items-center justify-center p-6 relative overflow-hidden bg-black text-white">
        <div className="max-w-5xl w-full z-10 flex flex-col h-full justify-center">
            <div className="mb-12">
                <h3 className="text-4xl md:text-6xl font-black mb-2 tracking-tighter uppercase">Monthly <span className="text-acid">Burn</span></h3>
                <p className="text-gray-400 font-mono text-sm uppercase">Where it all went wrong</p>
            </div>
            
            <div className="flex items-end justify-between gap-3 h-[50vh] w-full">
                {monthlySpend.map((data, index) => {
                    const heightPercent = (data.amount / maxSpend) * 100;
                    return (
                        <div key={data.month} className="flex-1 flex flex-col items-center gap-3 group h-full justify-end">
                             <motion.div 
                                initial={{ height: 0 }}
                                whileInView={{ height: `${heightPercent}%` }}
                                transition={{ duration: 1.2, delay: index * 0.1, type: "spring", bounce: 0.2 }}
                                className="w-full bg-white/10 rounded-t-sm relative group-hover:bg-acid transition-all duration-300 min-h-[4px]"
                             >
                                {/* Glow Effect */}
                                <div className="absolute inset-0 bg-acid opacity-0 group-hover:opacity-50 blur-lg transition-opacity duration-300"></div>
                                
                                {/* Tooltip */}
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-xs font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-acid text-black px-2 py-1 rounded whitespace-nowrap z-20">
                                    {formatCurrency(data.amount)}
                                </div>
                             </motion.div>
                             <span className="text-[10px] md:text-xs font-mono text-gray-600 font-bold group-hover:text-white transition-colors uppercase tracking-widest rotate-[-90deg] md:rotate-0 mb-4 md:mb-0">{data.month}</span>
                        </div>
                    )
                })}
            </div>
            
            <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-4">
               <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
                    <TrendingUp size={14} />
                    <span>DATA SOURCE: STATEMENT PDF</span>
               </div>
               <div className="text-xs font-mono text-gray-500">
                  PEAK SPEND: <span className="text-white">{formatCurrency(maxSpend)}</span>
               </div>
            </div>
        </div>
    </section>
  )
}

// --- SLIDE 4: TOP MERCHANT ---
const TopMerchantSlide = ({ merchant }: { merchant: { name: string, count: number, amount: number } }) => {
  return (
    <section className="h-screen w-full snap-center flex flex-col items-center justify-center relative overflow-hidden bg-white text-black">
      
      <div className="absolute inset-0 overflow-hidden opacity-5 pointer-events-none select-none flex flex-col justify-center">
         {[...Array(7)].map((_, i) => (
            <motion.div 
              key={i} 
              initial={{ x: i % 2 === 0 ? -100 : 100 }}
              whileInView={{ x: 0 }}
              transition={{ duration: 10, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
              className="whitespace-nowrap text-9xl font-black uppercase text-black"
            >
              {merchant.name} &nbsp; {merchant.name} &nbsp; {merchant.name}
            </motion.div>
         ))}
      </div>

      <div className="z-10 text-center">
        <motion.div
          initial={{ rotateY: 90 }}
          whileInView={{ rotateY: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="perspective-1000"
        >
           <div className="w-64 h-64 md:w-80 md:h-80 bg-black text-white rounded-[40px] flex flex-col items-center justify-center shadow-[20px_20px_0px_0px_rgba(204,255,0,1)] border-4 border-black relative">
              <div className="absolute -top-6 bg-acid text-black px-4 py-1 rounded-full font-bold uppercase tracking-wider text-xs border-2 border-black">
                 Top Obsession
              </div>
              <p className="text-sm font-mono text-gray-400 mb-2">You spent {formatCurrency(merchant.amount)} at</p>
              <h1 className="text-4xl md:text-5xl font-black uppercase break-words max-w-full px-4 text-center leading-tight">
                {merchant.name}
              </h1>
              <div className="mt-4 bg-white/10 px-4 py-2 rounded-lg">
                 <p className="font-mono text-xl font-bold">{merchant.count} visits</p>
              </div>
           </div>
        </motion.div>
        
        <motion.p 
          initial={{ opacity: 0 }} 
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-black font-bold text-xl max-w-md mx-auto"
        >
           &quot;I can stop whenever I want.&quot; <br/> — You, probably.
        </motion.p>
      </div>
    </section>
  );
};

// --- SLIDE 5: AURA ---
const AuraSlide = ({ data }: { data: AnalysisResult }) => {
  const shareRef = useRef<HTMLDivElement>(null);

  const handleShare = async () => {
    if (shareRef.current) {
      const canvas = await html2canvas(shareRef.current, { backgroundColor: '#000000', scale: 2 });
      const link = document.createElement('a');
      link.download = `aura-2024.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  return (
    <section className="h-screen w-full snap-center flex flex-col items-center justify-center p-4 bg-true-black relative">
      
      <div ref={shareRef} className="relative w-full max-w-sm aspect-[9/16] bg-true-black rounded-3xl overflow-hidden border border-white/20 shadow-2xl flex flex-col p-8">
         <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-[300px] h-[300px] rounded-full blur-[60px] animate-blob mix-blend-screen opacity-60 ${data.aura.includes('Tech') ? 'bg-blue-600' : data.aura.includes('Food') ? 'bg-red-600' : 'bg-purple-600'}`}></div>
            <div className="absolute w-[200px] h-[200px] bg-acid rounded-full blur-[50px] animate-blob animation-delay-2000 opacity-40 mix-blend-screen"></div>
         </div>

         <div className="relative z-10 flex flex-col h-full">
            <div className="flex justify-between items-center">
               <h3 className="font-bold text-lg">Bank Wrapped</h3>
               <div className="text-xs font-mono border border-white/30 px-2 py-1 rounded">2024</div>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center text-center">
               <p className="font-mono text-xs uppercase tracking-widest text-gray-400 mb-4">Your Financial Aura</p>
               <h1 className="text-5xl font-black uppercase leading-none text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                  {data.aura}
               </h1>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-auto mb-6">
               <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                  <p className="text-[10px] text-gray-400 uppercase">Top Spend</p>
                  <p className="font-bold">{formatCurrency(data.totalSpend)}</p>
               </div>
               <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                  <p className="text-[10px] text-gray-400 uppercase">Top Store</p>
                  <p className="font-bold truncate">{data.topMerchant.name}</p>
               </div>
            </div>

            {/* QR Code in Card */}
            <div className="flex items-center gap-4 bg-black/40 p-3 rounded-lg backdrop-blur-sm border border-white/10">
                <div className="bg-white p-1 rounded">
                    <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="100" height="100" fill="white"/>
                        <path d="M10 10H40V40H10V10Z" fill="black"/>
                        <path d="M60 10H90V40H60V10Z" fill="black"/>
                        <path d="M10 60H40V90H10V60Z" fill="black"/>
                        <rect x="50" y="50" width="10" height="10" fill="black"/>
                        <rect x="60" y="60" width="10" height="10" fill="black"/>
                        <rect x="80" y="80" width="10" height="10" fill="black"/>
                    </svg>
                </div>
                <div className="text-left">
                    <p className="text-[10px] text-gray-400 uppercase leading-tight">Scan to generate</p>
                    <p className="text-xs font-bold">bankwrapped.com</p>
                </div>
            </div>
         </div>

         <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}></div>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleShare}
        className="mt-8 bg-acid text-black px-8 py-4 rounded-full font-black uppercase tracking-wider flex items-center gap-3 shadow-[0_0_30px_rgba(204,255,0,0.3)]"
      >
        <Share2 size={20} />
        Share This Mess
      </motion.button>

    </section>
  );
};

const Counter = ({ value }: { value: number }) => {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(nodeRef, { once: true });
  
  const springValue = useSpring(0, { stiffness: 50, damping: 20 });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      springValue.set(value);
    }
  }, [isInView, value, springValue]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      setDisplayValue(Math.floor(latest));
    });
  }, [springValue]);

  return (
    <span ref={nodeRef} className="tabular-nums">
      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(displayValue)}
    </span>
  );
};

export default StoryDeck;

