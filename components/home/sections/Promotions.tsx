"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const promoImages = [
  '/assets/promo-1.jpg',
  '/assets/promo-2.jpg',
  '/assets/promo-3.jpg',
];

export default function Promotions() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const slideNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % promoImages.length);
  }, []);

  const slidePrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + promoImages.length) % promoImages.length);
  }, []);

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(slideNext, 6000); // 6 секунд, щоб встигли роздивитись широке фото
    return () => clearInterval(interval);
  }, [slideNext, isHovered]);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '20%' : '-20%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '20%' : '-20%',
      opacity: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    })
  };

  return (
    <section 
      className="bg-foxy-bg py-24 overflow-hidden border-y border-foxy-accent/5"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="container mx-auto px-4 md:px-8">
        
        {/* ЗАГОЛОВОК (Ідеально як у Services) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="font-playfair text-5xl md:text-6xl font-bold text-foxy-text">
            Promocje
          </h2>
          <div className="w-24 h-1 bg-foxy-accent mx-auto mt-4 rounded-full opacity-50"></div>
        </motion.div>

        {/* КОНТЕЙНЕР КАРОСЕЛІ - тепер адаптивний через aspect-ratio */}
        <div className="relative w-full max-w-[1440px] mx-auto aspect-[16/9] md:aspect-[21/7] lg:aspect-[3/1]">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(e, { offset }) => {
                if (offset.x > 50) slidePrev();
                else if (offset.x < -50) slideNext();
              }}
              className="absolute inset-0 cursor-grab active:cursor-grabbing"
            >
              <div className="w-full h-full rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl border border-white/10">
                <img 
                  src={promoImages[currentIndex]} 
                  alt="Promo" 
                  className="w-full h-full object-cover select-none" 
                  draggable={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* КНОПКИ (Тепер всередині, щоб не вилазили за екран) */}
          <button 
            onClick={(e) => { e.stopPropagation(); slidePrev(); }}
            className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 items-center justify-center rounded-full bg-black/20 backdrop-blur-md border border-white/20 text-white hover:bg-foxy-accent transition-all z-20 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 group-hover:-translate-x-1 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          <button 
            onClick={(e) => { e.stopPropagation(); slideNext(); }}
            className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 items-center justify-center rounded-full bg-black/20 backdrop-blur-md border border-white/20 text-white hover:bg-foxy-accent transition-all z-20 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 group-hover:translate-x-1 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>

          {/* ІНДИКАТОРИ */}
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-3">
            {promoImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDirection(idx > currentIndex ? 1 : -1);
                  setCurrentIndex(idx);
                }}
                className={`h-1.5 transition-all duration-500 rounded-full ${currentIndex === idx ? 'w-12 bg-foxy-accent' : 'w-4 bg-foxy-text/20 hover:bg-foxy-text/40'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}