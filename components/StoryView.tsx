'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StoryData, StoryCard, CardStat, CardItem } from '../types';
import { X } from 'lucide-react';

interface StoryViewProps {
  data: StoryData;
  onReset: () => void;
}

const StoryView: React.FC<StoryViewProps> = ({ data, onReset }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalCards = data.cards.length;

  const handleNext = () => {
    if (currentIndex < totalCards - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') handleNext();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') handlePrev();
      if (e.key === 'Escape') onReset();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  const currentCard = data.cards[currentIndex];

  return (
    <div className="fixed inset-0 bg-true-black text-white z-50 overflow-hidden flex flex-col">
      {/* Progress Bar */}
      <div className="absolute top-4 left-0 w-full px-4 z-50 flex gap-1.5 pointer-events-none">
        {data.cards.map((_, idx) => (
          <div key={idx} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
            <motion.div 
              // Using key to force remount ensures animations reset correctly when navigating
              key={idx === currentIndex ? 'active' : 'static'}
              className="h-full bg-acid box-shadow-[0_0_10px_#CCFF00]"
              initial={{ width: idx < currentIndex ? '100%' : '0%' }}
              animate={{ width: idx <= currentIndex ? '100%' : '0%' }}
              transition={{ duration: 0, ease: "linear" }}
            />
          </div>
        ))}
      </div>

      {/* Header Controls */}
      <div className="absolute top-8 right-6 z-[60] flex gap-4">
        <button 
          onClick={onReset}
          className="bg-black/20 hover:bg-white/10 backdrop-blur-md p-2 rounded-full text-gray-500 hover:text-white transition-all duration-300 hover:scale-110 group"
        >
          <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 w-full h-full relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05, y: -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-full flex flex-col"
          >
             <CardRenderer card={currentCard} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls (Mobile/Desktop) */}
      <div className="absolute inset-y-0 left-0 w-1/4 z-40 cursor-w-resize" onClick={handlePrev} />
      <div className="absolute inset-y-0 right-0 w-1/4 z-40 cursor-e-resize" onClick={handleNext} />
    </div>
  );
};

// --- Card Renderer ---

const CardRenderer = ({ card }: { card: StoryCard }) => {
  // Select layout based on card type
  switch (card.layout) {
    case 'hero':
      return <HeroLayout card={card} />;
    case 'stat-grid':
      return <StatGridLayout card={card} />;
    case 'list':
      return <ListLayout card={card} />;
    default:
      return <HeroLayout card={card} />; // Fallback
  }
};

// --- Layouts ---

const HeroLayout = ({ card }: { card: StoryCard }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20 blur-3xl opacity-50 animate-pulse pointer-events-none"></div>
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-acid rounded-full blur-[150px] opacity-10 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center text-center max-w-4xl space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
                <h2 className="text-xl md:text-2xl font-mono text-acid tracking-widest uppercase mb-4 border border-acid/30 px-4 py-1 rounded-full inline-block backdrop-blur-md">
                    {card.title}
                </h2>
            </motion.div>
            
            <motion.h1
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="text-4xl md:text-7xl font-black leading-tight tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-gray-500"
            >
                {card.data.mainText}
            </motion.h1>

            {card.data.subText && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-lg md:text-2xl text-gray-400 font-light"
                >
                    {card.data.subText}
                </motion.p>
            )}

            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mt-12 bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl max-w-2xl"
            >
                <p className="text-lg md:text-xl italic text-gray-300">"{card.commentary}"</p>
            </motion.div>
        </div>
    </div>
  );
};

const StatGridLayout = ({ card }: { card: StoryCard }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const isPaused = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const animationFrameId = useRef<number>();
  
  const originalStats = card.data.stats || [];
  // Duplicate stats 3 times to create seamless loop buffer
  const displayStats = React.useMemo(() => [...originalStats, ...originalStats, ...originalStats], [originalStats]);

  // Auto-scroll logic for desktop
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const animate = () => {
      // Only auto-scroll if not dragging and not paused, and screen is wide enough (desktop)
      if (!isDragging.current && !isPaused.current && window.innerWidth >= 768) {
        container.scrollLeft += 0.5; // Adjust speed here (0.5 = slow, 1 = medium)

        // Infinite Loop Logic
        // Calculate width of one set. Since we have 3 sets, scrollWidth is ~3 * oneSetWidth.
        // We reset when we reach the start of the 3rd set, jumping back to start of 2nd set.
        const oneSetWidth = container.scrollWidth / 3;
        
        if (container.scrollLeft >= oneSetWidth * 2) {
            container.scrollLeft = oneSetWidth;
        } else if (container.scrollLeft <= 0) {
             // Handle edge case if scrolling backwards manually
             container.scrollLeft = oneSetWidth;
        }
      }
      animationFrameId.current = requestAnimationFrame(animate);
    };

    // Initial scroll position to the middle set for immediate bidirectional scroll ability
    // Use a small timeout to ensure layout is done
    setTimeout(() => {
        if (container && window.innerWidth >= 768) {
             container.scrollLeft = container.scrollWidth / 3;
        }
    }, 100);

    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [displayStats]);

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.pageX - (containerRef.current?.offsetLeft || 0);
    scrollLeft.current = containerRef.current?.scrollLeft || 0;
    if (containerRef.current) {
        containerRef.current.style.cursor = 'grabbing';
        containerRef.current.style.userSelect = 'none';
        // Disable smooth snap during drag for direct control
        containerRef.current.style.scrollBehavior = 'auto';
    }
  };

  const onMouseLeave = () => {
    isDragging.current = false;
    isPaused.current = false; // Resume on leave
    if (containerRef.current) {
        containerRef.current.style.cursor = 'grab';
        containerRef.current.style.removeProperty('user-select');
    }
  };

  const onMouseEnter = () => {
      isPaused.current = true; // Pause on hover
  };

  const onMouseUp = () => {
    isDragging.current = false;
    if (containerRef.current) {
        containerRef.current.style.cursor = 'grab';
        containerRef.current.style.removeProperty('user-select');
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - (containerRef.current?.offsetLeft || 0);
    const walk = (x - startX.current) * 2; 
    if (containerRef.current) {
      containerRef.current.scrollLeft = scrollLeft.current - walk;
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-center relative overflow-hidden bg-[#F2F2F2] text-black">
        {/* Background Pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none opacity-[0.07] flex flex-wrap content-start justify-center gap-8 p-4 -rotate-12 scale-125">
             {Array.from({ length: 150 }).map((_, i) => (
                 <span key={i} className="text-7xl font-black text-black">2025</span>
             ))}
        </div>

        <div className="relative z-10 w-full h-full flex flex-col justify-center pb-20 md:pb-0">
            {/* Horizontal Scroll Container */}
            <div 
                ref={containerRef}
                onMouseDown={onMouseDown}
                onMouseLeave={onMouseLeave}
                onMouseEnter={onMouseEnter}
                onMouseUp={onMouseUp}
                onMouseMove={onMouseMove}
                className="flex gap-4 overflow-x-auto pb-12 pt-12 snap-x md:snap-none snap-mandatory no-scrollbar items-center px-[5vw] cursor-grab active:cursor-grabbing"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {displayStats.map((stat, idx) => (
                    <motion.div
                        key={`${idx}-${stat.label}`}
                        initial={{ scale: 0.9, opacity: 0.5 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="flex-none w-[300px] md:w-[360px] snap-center flex flex-col items-center justify-center"
                    >
                         {/* Badge */}
                        <div className="relative z-20 translate-y-1/2">
                            <div className="bg-acid text-black font-black text-xs md:text-sm px-6 py-2 rounded-full uppercase tracking-widest shadow-[0_4px_0_rgba(0,0,0,1)] border-2 border-black whitespace-nowrap">
                                {stat.label}
                            </div>
                        </div>

                        {/* Card Body */}
                        <div className="w-full aspect-[4/5] bg-black rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden border-4 border-black group">
                            {/* Content */}
                            <div className="relative z-10 flex flex-col items-center justify-between h-full py-4">
                                <p className="text-gray-400 text-xs font-mono uppercase tracking-widest mb-auto">
                                    Financial Record
                                </p>

                                <div className="my-auto w-full flex items-center justify-center min-h-[50%]">
                                    <h3 className="text-3xl md:text-4xl font-black text-white leading-tight tracking-tight uppercase break-words text-balance">
                                        {stat.value}
                                    </h3>
                                </div>

                                <div className="mt-auto pt-6 w-full border-t border-white/10">
                                    <p className="text-gray-400 text-sm font-medium italic leading-relaxed">
                                        "{stat.subtext}"
                                    </p>
                                </div>
                            </div>

                             {/* Decorative Elements inside card */}
                             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
                             <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-acid blur-[80px] opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                        </div>
                    </motion.div>
                ))}
            </div>

             {/* Bottom Quote - Fixed at bottom of section */}
             <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="absolute bottom-8 md:bottom-12 left-0 w-full text-center px-4 pointer-events-none"
            >
                <p className="text-black font-bold text-xl md:text-2xl leading-tight max-w-2xl mx-auto">
                    "{card.commentary}"
                </p>
                <p className="text-gray-500 text-xs font-mono mt-3 uppercase tracking-widest">
                    — You, probably.
                </p>
             </motion.div>
        </div>
    </div>
  );
};

const ListLayout = ({ card }: { card: StoryCard }) => {
  return (
    <div className="w-full h-full flex flex-col justify-center p-6 md:p-12 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-purple-900/10 to-transparent pointer-events-none"></div>

         <div className="relative z-10 w-full max-w-4xl mx-auto">
            <motion.h2 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-4xl md:text-6xl font-black tracking-tighter uppercase text-center mb-12 text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600"
            >
                {card.title}
            </motion.h2>

            <div className="space-y-4">
                {card.data.items?.map((item, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + (idx * 0.15) }}
                        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row md:items-center gap-4 hover:border-acid/50 transition-colors"
                    >
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-white mb-1">{item.title}</h3>
                            <p className="text-acid font-mono text-lg">{item.value}</p>
                        </div>
                        <div className="md:w-1/2 md:text-right border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
                            <p className="text-gray-400 text-sm leading-relaxed">
                                {item.description}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-12 text-center"
            >
                 <p className="inline-block bg-acid/10 text-acid px-6 py-3 rounded-full font-mono text-sm border border-acid/20">
                    💡 {card.commentary}
                </p>
            </motion.div>
         </div>
    </div>
  );
};

export default StoryView;

