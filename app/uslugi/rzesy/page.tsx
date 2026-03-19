"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- ДАНІ ПРАЙСУ ---
const lashesPriceData = {
  category: "Przedłużanie rzęs",
  items: [
    { name: "Ściągnięcie rzęs", price: "40 zł" },
    { name: "Założenie rzęs 1-2D", price: "130 zł" },
    { name: "Założenie rzęs 3D", price: "140 zł" },
    { name: "Założenie rzęs 4-5D", price: "150 zł" },
    { name: "Założenie rzęs 6D+ (Mega Volume)", price: "160 zł" },
  ]
};

// --- МАЙСТЕР ---
const master = { 
  id: 'julia', 
  name: 'Julia Kowalska', 
  role: 'Ekspertka Przedłużania Rzęs', 
  desc: 'Ekspertka od przedłużania rzęs na każdym poziomie: od subtelnej klasyki po spektakularne mega volume. Precyzja i indywidualne podejście Julii sprawiają, że każda stylizacja tworzy hipnotyzujące i głębokie spojrzenie.', 
  image: '/assets/team/julia.jpg' 
};

// --- ГАЛЕРЕЯ (5 фото вій) ---
const generateImages = (category: string, folder: string, count: number, prefix: string) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `${prefix}-${i + 1}`,
    category,
    src: `/assets/gallery/${folder}/${i + 1}.jpg`
  }));
};
const lashImages = generateImages("Przedłużanie rzęs", "rzesy", 5, "r");

// --- АНІМАЦІЇ ---
const categoryVariants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.1 } }
};

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.5 } }
};

export default function LashesPage() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const showNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (lightboxIndex !== null) setLightboxIndex((lightboxIndex + 1) % lashImages.length);
  };

  const showPrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (lightboxIndex !== null) setLightboxIndex((lightboxIndex - 1 + lashImages.length) % lashImages.length);
  };

  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'ArrowLeft') showPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [lightboxIndex]);

  return (
    <div className="bg-foxy-bg min-h-screen pt-48 pb-24 relative overflow-x-hidden">
      
      {/* 1. ПРАЙС-ЛИСТ */}
      <section className="px-4 mb-24 relative z-10">
        <div className="container mx-auto max-w-3xl">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="font-playfair text-5xl md:text-6xl font-bold text-foxy-text uppercase tracking-tight">
              Przedłużanie <span className="italic font-normal">Rzęs</span>
            </h1>
            <div className="w-24 h-1 bg-foxy-accent mx-auto mt-6 rounded-full opacity-50"></div>
          </motion.div>

          <motion.div 
            variants={categoryVariants}
            initial="hidden"
            animate="show"
            className="bg-[#1a1a1a]/40 backdrop-blur-md border border-white/10 p-8 md:p-12 rounded-[2rem] shadow-2xl"
          >
            <div className="flex flex-col space-y-6">
              {lashesPriceData.items.map((item, idx) => (
                <motion.div key={idx} variants={rowVariants} className="flex justify-between items-baseline group">
                  <span className="text-white/90 font-medium text-base md:text-lg group-hover:text-foxy-accent transition-colors pr-4">
                    {item.name}
                  </span>
                  <div className="flex-grow border-b-2 border-dotted border-white/20 relative top-[-4px]"></div>
                  <span className="text-white font-bold text-base md:text-lg pl-4">{item.price}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. МАЙСТЕР */}
      <section className="px-4 mb-32 relative z-10">
        <div className="container mx-auto max-w-5xl">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-center gap-10 md:gap-20"
          >
            <div className="w-full md:w-1/2">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] shadow-2xl">
                <img src={master.image} alt={master.name} className="absolute inset-0 w-full h-full object-cover" />
              </div>
            </div>
            <div className="w-full md:w-1/2 text-center md:text-left">
              <p className="text-foxy-accent font-bold tracking-[0.3em] uppercase text-xs mb-4">{master.role}</p>
              <h2 className="font-playfair text-4xl md:text-6xl font-bold text-foxy-text mb-8">{master.name}</h2>
              <p className="text-foxy-text/80 leading-relaxed font-lato text-lg md:text-xl">
                {master.desc}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. ГАЛЕРЕЯ */}
      <section className="px-4 relative z-10">
        <div className="container mx-auto max-w-6xl text-center mb-16">
          <h2 className="font-playfair text-4xl font-bold text-foxy-text tracking-tight">Nasze <span className="italic font-normal">Stylizacje</span></h2>
        </div>
        <div className="container mx-auto max-w-6xl grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[200px] md:auto-rows-[280px] grid-flow-row-dense">
          {lashImages.map((img, index) => {
            const patterns = ["col-span-1 row-span-1", "col-span-1 row-span-2", "col-span-2 row-span-1"];
            return (
              <motion.div
                key={img.id}
                layout
                onClick={() => setLightboxIndex(index)}
                className={`relative group cursor-pointer overflow-hidden rounded-3xl bg-black/5 ${patterns[index % patterns.length]}`}
              >
                <img src={img.src} alt="Lashes" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <span className="text-white font-bold tracking-widest uppercase text-[10px]">Powiększ</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 4. LIGHTBOX */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setLightboxIndex(null)}
          >
            <button className="absolute top-8 right-8 text-white/70 hover:text-white transition-colors p-2 z-[110]" onClick={() => setLightboxIndex(null)}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <motion.div 
              key={lightboxIndex}
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="relative max-w-5xl w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={lashImages[lightboxIndex].src} className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" alt="Lash Zoom" />
              <button onClick={showPrev} className="absolute left-0 md:-left-20 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-12 h-12"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
              </button>
              <button onClick={showNext} className="absolute right-0 md:-right-20 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-12 h-12"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}