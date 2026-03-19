"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const generateImages = (category: string, folder: string, count: number, prefix: string) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `${prefix}-${i + 1}`,
    category,
    src: `/assets/gallery/${folder}/${i + 1}.jpg`
  }));
};

const galleryImages = [
  ...generateImages("Manicure/pedicure", "manicure", 19, "m"),
  ...generateImages("Stylizacja brwi i rzęs", "brwi", 4, "b"),
  ...generateImages("Przedłużanie rzęs", "rzesy", 5, "r"),
  ...generateImages("Tatuaż artystyczny", "tatuaz", 17, "t"),
];

const categories = ["Wszystkie", "Manicure/pedicure", "Stylizacja brwi i rzęs", "Przedłużanie rzęs", "Tatuaż artystyczny"];

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState("Wszystkie");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filteredImages = activeCategory === "Wszystkie" 
    ? galleryImages 
    : galleryImages.filter(img => img.category === activeCategory);

  const showNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % filteredImages.length);
    }
  };

  const showPrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + filteredImages.length) % filteredImages.length);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'ArrowLeft') showPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, filteredImages.length]);

  return (
    // ПРИБРАНО relative, z-10 та overflow-hidden
    <section id="portfolio" className="bg-foxy-bg py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="font-playfair text-5xl md:text-6xl font-bold text-foxy-text">
            Nasze <span className="italic">Prace</span>
          </h2>
          <div className="w-24 h-1 bg-foxy-accent mx-auto mt-4 rounded-full opacity-50"></div>
        </motion.div>

        <div className="grid grid-cols-2 md:flex md:flex-wrap gap-y-6 gap-x-2 mb-12 justify-center items-center">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setActiveCategory(cat)}
              className={`
                relative py-2 px-2 md:px-6 text-sm md:text-base font-bold tracking-wide transition-colors duration-300
                ${idx === 0 ? 'col-span-2 md:col-span-1' : ''} 
                ${activeCategory === cat ? 'text-foxy-text' : 'text-foxy-text/50 hover:text-foxy-text/80'}
              `}
            >
              {cat}
              {activeCategory === cat && (
                <motion.div 
                  layoutId="activeCategoryDot"
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-foxy-accent"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

      {/* BENTO GRID СІТКА (Справжній хаос під контролем) */}
        <motion.div 
          layout
          // Задаємо жорстку висоту рядка: 180px на мобілці, 240px на десктопі
          // grid-flow-row-dense - магія, яка заповнює "дірки" в сітці меншими фотками
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[180px] md:auto-rows-[240px] grid-flow-row-dense"
        >
          <AnimatePresence mode="popLayout">
            {filteredImages.map((img, index) => {
              // 4 види плиток:
              // col-span-1 row-span-2 (Найвища - займає 2 рядки у висоту)
              // col-span-2 row-span-1 (Половинка - широка горизонтальна)
              // col-span-1 row-span-1 (Третинка - стандартний квадрат)
              // col-span-2 row-span-2 (Гігантський акцент - подвійна і вшир, і ввись)
              
              const bentoPatterns = [
                "col-span-1 row-span-2", // Найвища
                "col-span-1 row-span-1", // Третинка
                "col-span-1 row-span-1", // Третинка
                "col-span-2 row-span-1", // Половинка
                "col-span-1 row-span-1", // Третинка
                "col-span-2 row-span-2", // Гігантська (Акцентна)
                "col-span-1 row-span-1", // Третинка
                "col-span-1 row-span-2", // Найвища
              ];
              
              const patternClass = bentoPatterns[index % bentoPatterns.length];

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.4 }}
                  key={img.id}
                  onClick={() => setLightboxIndex(index)}
                  // Додаємо patternClass до картки
                  className={`relative group cursor-pointer overflow-hidden rounded-2xl bg-black/5 ${patternClass}`}
                >
                  {/* Картинка тепер ідеально розтягується і заповнює будь-яку з 4 форм клітинок */}
                  <img 
                    src={img.src} 
                    alt={img.category} 
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Оверлей при наведенні */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white font-playfair font-bold tracking-wider text-sm md:text-base opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                      Powiększ
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

      </div>

      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center"
            onClick={() => setLightboxIndex(null)}
          >
            <button 
              className="absolute top-6 right-6 z-[10000] text-white/50 hover:text-white transition-colors p-2"
              onClick={() => setLightboxIndex(null)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <motion.div 
              key={lightboxIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.8}
              onDragEnd={(e, { offset }) => {
                if (offset.x > 50) showPrev();
                else if (offset.x < -50) showNext();
              }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl max-h-[90vh] px-4 flex justify-center items-center cursor-grab active:cursor-grabbing"
            >
              <img 
                src={filteredImages[lightboxIndex].src} 
                alt="Zoomed" 
                className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl select-none"
                draggable={false}
              />
              <div className="absolute bottom-[-40px] text-center w-full text-white/70 font-lato text-sm">
                {filteredImages[lightboxIndex].category} • {lightboxIndex + 1} / {filteredImages.length}
              </div>
            </motion.div>

            <button 
              onClick={showPrev}
              className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-12 h-12">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button 
              onClick={showNext}
              className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-12 h-12">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}