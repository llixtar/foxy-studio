"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

// --- ДАНІ ПРАЙСУ ---
const browsLashesPriceData = [
  {
    category: "Stylizacja brwi",
    items: [
      { name: "Regulacja woskiem/pęsetą", price: "50 zł" },
      { name: "Laminacja brwi", price: "80 zł" },
      { name: "Koloryzacja brwi з regulacją i geometrią", price: "90 zł" },
      { name: "Rozjaśnienie brwi + Koloryzacja + Regulacja", price: "100 zł" },
      { name: "Laminacja brwi + regulacja + farbka", price: "120 zł" },
    ]
  },
  {
    category: "Stylizacja rzęs",
    items: [
      { name: "Koloryzacja rzęs", price: "50 zł" },
      { name: "Laminacja rzęs z koloryzacją", price: "120 zł" },
      { name: "Laminacja rzęs z koloryzacją + regeneracja botoksem", price: "140 zł" },
    ],
    promocja: "LAMINACJA BRWI + LAMINACJA RZĘS = 200 zł"
  }
];

// --- МАЙСТЕР ---
const master = { 
  id: 'tetiana', 
  name: 'Tetiana Lysenko', 
  role: 'Stylizacja brwi i rzęs', 
  desc: 'Mistrzyni idealnej geometrii i laminacji. Zrobi z Twoimi brwiami i rzęsami prawdziwą magię, podkreślając naturalne piękno Twojego spojrzenia. Jej precyzja to gwarancja satysfakcji.', 
  image: '/assets/team/tetiana.jpg' 
};

// --- ГАЛЕРЕЯ (Об'єднуємо брові та вії для кращого візуалу) ---
const generateImages = (category: string, folder: string, count: number, prefix: string) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `${prefix}-${i + 1}`,
    category,
    src: `/assets/gallery/${folder}/${i + 1}.jpg`
  }));
};

// Беремо 4 фото з брів та 5 з вій
const combinedImages: any = [
  ...generateImages("Brwi", "brwi", 4, "b"),
  ...generateImages("Rzęsy", "rzesy", 5, "r"),
];

// --- АНІМАЦІЇ ---
const categoryVariants: any = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.1 } }
};

const rowVariants: any = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.5 } }
};

export default function BrowsPage() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const showNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (lightboxIndex !== null) setLightboxIndex((lightboxIndex + 1) % combinedImages.length);
  };

  const showPrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (lightboxIndex !== null) setLightboxIndex((lightboxIndex - 1 + combinedImages.length) % combinedImages.length);
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
        <div className="container mx-auto max-w-4xl">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="font-playfair text-5xl md:text-6xl font-bold text-foxy-text uppercase tracking-tight">
              Brwi & <span className="italic font-normal">Rzęsy</span>
            </h1>
            <div className="w-24 h-1 bg-foxy-accent mx-auto mt-6 rounded-full opacity-50"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {browsLashesPriceData.map((section, idx) => (
              <motion.div 
                key={idx}
                variants={categoryVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="flex flex-col bg-[#1a1a1a]/40 backdrop-blur-md border border-white/10 p-8 rounded-[2rem] shadow-2xl"
              >
                <h3 className="font-playfair text-2xl font-bold text-white mb-8 border-b border-foxy-accent/30 pb-2">
                  {section.category}
                </h3>
                <div className="flex flex-col space-y-6">
                  {section.items.map((item, itemIdx) => (
                    <motion.div key={itemIdx} variants={rowVariants} className="flex justify-between items-baseline group">
                      <span className="text-white/90 font-medium text-sm md:text-base group-hover:text-foxy-accent transition-colors pr-4">{item.name}</span>
                      <div className="flex-grow border-b border-dotted border-white/20 relative top-[-4px]"></div>
                      <span className="text-white font-bold text-sm md:text-base pl-4">{item.price}</span>
                    </motion.div>
                  ))}
                </div>

                {section.promocja && (
                  <motion.div variants={rowVariants} className="mt-8 p-4 rounded-xl bg-foxy-accent/10 border border-foxy-accent/30 text-center">
                    <p className="text-foxy-accent font-bold tracking-widest uppercase text-[10px] mb-1">Combo Promocja</p>
                    <p className="text-white font-bold text-sm">{section.promocja}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
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
                <Image src={master.image} alt={master.name} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/10 hover:bg-transparent transition-colors duration-500"></div>
              </div>
            </div>
            <div className="w-full md:w-1/2 text-center md:text-left">
              <p className="text-foxy-accent font-bold tracking-[0.3em] uppercase text-xs mb-4">{master.role}</p>
              <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foxy-text mb-8 leading-tight">{master.name}</h2>
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
          <h2 className="font-playfair text-4xl font-bold text-foxy-text tracking-tight">Portfolio <span className="italic font-normal">Prac</span></h2>
        </div>
        <div className="container mx-auto max-w-6xl grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[200px] md:auto-rows-[280px] grid-flow-row-dense">
          {combinedImages.map((Image: any, index: number) => {
            const patterns = ["col-span-1 row-span-1", "col-span-1 row-span-2", "col-span-1 row-span-1", "col-span-2 row-span-1"];
            return (
              <motion.div
                key={Image.id}
                layout
                onClick={() => setLightboxIndex(index)}
                className={`relative group cursor-pointer overflow-hidden rounded-3xl bg-black/5 ${patterns[index % patterns.length]}`}
              >
                <Image src={Image.src} alt="Work" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
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
              <Image src={combinedImages[lightboxIndex].src} className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" alt="Zoom" />
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