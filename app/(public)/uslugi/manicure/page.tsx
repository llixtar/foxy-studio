"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { supabase } from '@/lib/supabase'; // 👈 Наш зв'язок з базою

// Категорія, за якою фільтруємо дані для цієї сторінки
const PAGE_CATEGORY = "Manicure / Pedicure";

// --- МАЙСТРИ (Залишаємо статику, поки не зробимо адмінку для персоналу) ---
const maniMasters = [
  { 
    id: 'anzhela', 
    name: 'Anzhela', 
    role: 'Właścicielka / Tatuaż / Manicure', 
    desc: 'Założycielka Foxy Studio. Perfekcjonistka, która łączy pasję do tatuażu z mistrzostwem w stylizacji paznokci. Jej prace to czysta sztuka, w którą wkłada całą swoją duszę.', 
    image: '/assets/team/anzhela.webp' 
  },
  { 
    id: 'iryna', 
    name: 'Iryna', 
    role: 'Mani & Pedi / Rzęsy', 
    desc: 'Prawdziwa „złota rączka”. Wykonuje swoją pracę szybko i na najwyższym poziomie! Z nią nigdy nie będzie nudno. Szeroki wybór materiałów, pełna sterylność oraz przyjemna atmosfera – gwarantowane!', 
    image: '/assets/team/iryna.JPG' 
  },
];

// --- ГАЛЕРЕЯ ---
const generateImages = (category: string, folder: string, count: number, prefix: string) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `${prefix}-${i + 1}`,
    category,
    src: `/assets/gallery/${folder}/${i + 1}.webp`
  }));
};
const maniImages = generateImages("Manicure/pedicure", "manicure", 19, "m");

// --- АНІМАЦІЇ ---
const categoryVariants: any = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.1 } }
};

const rowVariants: any = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.5 } }
};

export default function ManicurePage() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  
  // 👈 НОВІ СТАНИ ДЛЯ ДИНАМІКИ
  const [items, setItems] = useState<any[]>([]);
  const [promo, setPromo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. ЗАВАНТАЖЕННЯ ДАНИХ
  useEffect(() => {
    const fetchData = async () => {
      const [srvRes, promoRes] = await Promise.all([
        supabase.from('services').select('*').eq('category', PAGE_CATEGORY).order('id'),
        supabase.from('promotions').select('text').eq('category', PAGE_CATEGORY).single()
      ]);

      if (srvRes.data) setItems(srvRes.data);
      if (promoRes.data) setPromo(promoRes.data.text);
      
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const handleBooking = (catId: string, srvId: string) => {
    window.dispatchEvent(new CustomEvent('openModalGlobal'));
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('prefillBooking', { 
        detail: { catId, srvId } 
      }));
    }, 50);
  };

  const showNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (lightboxIndex !== null) setLightboxIndex((lightboxIndex + 1) % maniImages.length);
  };

  const showPrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (lightboxIndex !== null) setLightboxIndex((lightboxIndex - 1 + maniImages.length) % maniImages.length);
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
    <div className="bg-foxy-bg min-h-screen pt-48 pb-24 relative overflow-x-hidden text-foxy-text">
      
      {/* 1. ПРАЙС ТА ІНТРО */}
      <section className="px-4 mb-24 relative z-10">
        <div className="container mx-auto max-w-4xl">
          
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <h1 className="font-playfair text-5xl md:text-6xl font-bold uppercase tracking-tight">
              Manicure & <span className="italic font-normal">Pedicure</span>
            </h1>
            <div className="w-24 h-1 bg-foxy-accent mx-auto mt-6 rounded-full opacity-50"></div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-16">
            <div className="bg-gradient-to-b from-foxy-accent/10 to-transparent border border-foxy-accent/20 p-8 md:p-10 rounded-[2.5rem] text-center shadow-lg">
              <p className="font-playfair text-xl md:text-3xl italic mb-10 leading-relaxed max-w-3xl mx-auto">
                "Manicure w naszym salonie to nie tylko piękne paznokcie, ale także relaks – chwila, którą chce się przedłużyć „jeszcze troszkę”."
              </p>
              <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 text-foxy-text/80 font-lato text-sm md:text-base">
                <div className="flex flex-col items-center gap-3 bg-[#e6e0d2] px-6 py-5 rounded-2xl border border-black/5 w-full md:w-auto shadow-md">
                  <p className="text-center leading-snug">Podczas zabiegu oferujemy<br/><span className="font-bold">masaż stóp, napoje i słodkości</span></p>
                </div>
                <div className="flex flex-col items-center gap-3 bg-[#e6e0d2] px-6 py-5 rounded-2xl border border-black/5 w-full md:w-auto shadow-md">
                  <p className="text-center leading-snug">Dla stałych klientek mamy<br/><span className="font-bold">program lojalnościowy i oferty</span></p>
                </div>
              </div>
            </div>
          </motion.div>

          {isLoading ? (
            <div className="text-center py-20 opacity-30 font-bold tracking-[0.3em] animate-pulse">ŁADOWANIE...</div>
          ) : (
            <motion.div variants={categoryVariants} initial="hidden" animate="show" className="bg-[#1a1a1a]/40 backdrop-blur-md border border-white/10 p-8 md:p-12 rounded-[2rem] shadow-2xl max-w-3xl mx-auto">
              <div className="flex flex-col space-y-4">
                {items.map((item, idx) => (
                  <motion.div key={idx} variants={rowVariants} onClick={() => handleBooking(item.cat_id, item.srv_id)} className="flex justify-between items-baseline group cursor-pointer p-2 -mx-2 rounded-lg hover:bg-foxy-accent/5 transition-colors">
                    <span className="text-white/90 font-medium text-base md:text-lg group-hover:text-foxy-accent transition-colors pr-4">{item.title}</span>
                    <div className="flex-grow border-b-2 border-dotted border-white/20 relative top-[-4px] group-hover:border-foxy-accent/40 transition-colors"></div>
                    <span className="text-white font-bold text-base md:text-lg pl-4 group-hover:text-foxy-accent transition-colors">{item.price}</span>
                  </motion.div>
                ))}
                
                {promo && (
                  <motion.div variants={rowVariants} className="mt-8 p-6 rounded-2xl bg-foxy-accent/10 border border-foxy-accent/30 text-center shadow-sm">
                     <p className="text-foxy-accent font-bold tracking-widest uppercase text-xs mb-1">Oferta Specjalna</p>
                     <p className="text-white font-bold text-lg md:text-xl">{promo}</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* 2. МАЙСТРИ */}
      <section className="px-4 mb-32 relative z-10">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col gap-20 md:gap-32">
            {maniMasters.map((master, idx) => (
              <motion.div key={master.id} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className={`flex flex-col items-center gap-10 md:gap-20 ${idx % 2 !== 0 ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
                <div className="w-full md:w-1/2">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] shadow-2xl">
                    <Image src={master.image} alt={master.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" priority={idx === 0} />
                  </div>
                </div>
                <div className={`w-full md:w-1/2 text-center ${idx % 2 !== 0 ? 'md:text-right' : 'md:text-left'}`}>
                  <p className="text-foxy-accent font-bold tracking-[0.3em] uppercase text-[10px] mb-4">{master.role}</p>
                  <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-8">{master.name}</h2>
                  <p className="text-foxy-text/80 leading-relaxed font-lato text-lg">{master.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. ГАЛЕРЕЯ */}
      <section className="px-4 relative z-10">
        <div className="container mx-auto max-w-6xl text-center mb-16">
          <h2 className="font-playfair text-4xl font-bold">Portfolio <span className="italic">Paznokci</span></h2>
        </div>
        <div className="container mx-auto max-w-6xl grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px] md:auto-rows-[280px] grid-flow-row-dense">
          {maniImages.map((img: any, index: number) => {
            const patterns = ["col-span-1 row-span-2", "col-span-1 row-span-1", "col-span-2 row-span-2", "col-span-1 row-span-1"];
            return (
              <motion.div key={img.id} layout onClick={() => setLightboxIndex(index)} className={`relative group cursor-pointer overflow-hidden rounded-3xl bg-black/5 ${patterns[index % patterns.length]}`}>
                <Image src={img.src} alt="Manicure work" fill className="object-cover transition-transform duration-700 group-hover:scale-110" sizes="(max-width: 768px) 50vw, 25vw" />
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4" onClick={() => setLightboxIndex(null)}>
            <button className="absolute top-8 right-8 text-white/70 hover:text-white transition-colors p-2 z-[110]" onClick={(e) => { e.stopPropagation(); setLightboxIndex(null); }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <motion.div key={lightboxIndex} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-5xl h-[70vh] md:h-[85vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <Image src={maniImages[lightboxIndex].src} fill className="object-contain rounded-lg shadow-2xl" alt="Mani Zoom" sizes="100vw" priority />
              <button onClick={showPrev} className="absolute left-0 md:-left-20 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-12 h-12"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg></button>
              <button onClick={showNext} className="absolute right-0 md:-right-20 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-12 h-12"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg></button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}