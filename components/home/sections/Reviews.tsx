"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase'; // Наш міст до бази

// Лишаємо ці дані як "Fallback" (якщо база недоступна)
const fallbackReviews = [
  {
    id: 1,
    name: "Marta",
    text: "Mój nowy tatuaż jest po prostu obłędny! Cienkie linie, idealne cieniowanie.",
    image_url: "https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?q=80&w=600&h=450&auto=format&fit=crop"
  }
];

interface Review {
  id: number;
  name: string;
  text: string;
  image_url: string;
}

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. Функція завантаження даних
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setReviews(data);
      } else {
        setReviews(fallbackReviews);
      }
    } catch (error) {
      console.error('Помилка завантаження відгуків:', error);
      setReviews(fallbackReviews);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // 2. Логіка слайдера (тепер залежить від динамічного масиву)
  const nextSlide = useCallback(() => {
    if (reviews.length === 0) return;
    setIndex((prev) => (prev + 1) % reviews.length);
  }, [reviews.length]);

  const prevSlide = useCallback(() => {
    if (reviews.length === 0) return;
    setIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  }, [reviews.length]);

  useEffect(() => {
    if (isPaused || reviews.length <= 1) return;
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide, reviews.length]);

  const handleDragEnd = (e: any, { offset }: any) => {
    const swipeThreshold = 50;
    if (offset.x < -swipeThreshold) nextSlide();
    else if (offset.x > swipeThreshold) prevSlide();
  };

  // Якщо ще вантажиться — покажемо порожній блок з висотою, щоб не стрибав екран
  if (loading) return <div className="min-h-[500px] bg-foxy-bg" />;

  return (
    <section id="opinie" className="bg-foxy-bg py-16 md:py-24 px-4 overflow-hidden border-t border-white/5">
      <div className="container mx-auto max-w-4xl overflow-hidden">
        
        <div className="text-center mb-10 md:mb-16">
          <h2 className="font-playfair text-3xl md:text-5xl font-bold text-foxy-text tracking-tight">
            Wasze Stylizacje & <span className="italic font-normal">Opinie</span>
          </h2>
          <div className="w-12 h-1 bg-foxy-accent mx-auto mt-4 rounded-full opacity-30" />
        </div>

        <div 
          className="relative touch-pan-y"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {/* Кнопки Desktop (показуємо тільки якщо відгуків > 1) */}
          {reviews.length > 1 && (
            <>
              <button onClick={prevSlide} className="absolute -left-12 lg:-left-20 top-1/2 -translate-y-1/2 z-20 p-2 text-white/10 hover:text-foxy-accent transition-all hidden md:block">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-8 h-8"><path d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button onClick={nextSlide} className="absolute -right-12 lg:-right-20 top-1/2 -translate-y-1/2 z-20 p-2 text-white/20 hover:text-foxy-accent transition-all hidden md:block">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-8 h-8"><path d="M9 5l7 7-7 7" /></svg>
              </button>
            </>
          )}

          <div className="min-h-[380px] md:min-h-[500px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={reviews[index]?.id || index}
                drag={reviews.length > 1 ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.1}
                onDragEnd={handleDragEnd}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex flex-col items-center w-full cursor-grab active:cursor-grabbing"
              >
                {/* Фото роботи */}
                <div className="w-full max-w-[280px] md:max-w-[450px] aspect-[4/3] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 relative z-10 bg-[#151515] pointer-events-none">
                  <img 
                    src={reviews[index]?.image_url} 
                    alt="Stylizacja"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>

                {/* Comic Bubble */}
                <div className="relative mt-[-12px] md:mt-[-20px] pt-[12px] md:pt-[20px] w-full max-w-[300px] md:max-w-[500px] z-20 pointer-events-none">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 
                    border-l-[10px] border-l-transparent 
                    border-r-[10px] border-r-transparent 
                    border-b-[14px] border-b-[#e6e0d2]" 
                  />
                  
                  <div className="bg-[#e6e0d2] p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl border border-black/5">
                    <p className="text-[#2a2a2a] font-lato text-[13px] md:text-lg italic leading-relaxed text-center mb-3 md:mb-6">
                      "{reviews[index]?.text}"
                    </p>
                    <div className="text-center">
                      <p className="text-foxy-accent font-black uppercase tracking-[0.2em] text-[8px] md:text-xs">
                        Klientka: {reviews[index]?.name}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Крапки (тільки якщо більше одного відгуку) */}
          {reviews.length > 1 && (
            <div className="flex justify-center gap-2 mt-6 md:mt-10">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={`h-1 rounded-full transition-all duration-500 ${
                    i === index ? 'w-8 bg-foxy-accent' : 'w-1.5 bg-foxy-accent/20'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}