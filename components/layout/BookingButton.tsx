"use client";

import React, { useState, useEffect } from 'react';

export default function BookingButton() {
  const [bottomOffset, setBottomOffset] = useState(32);

  useEffect(() => {
    const handleScroll = () => {
      const footer = document.querySelector('footer');
      if (!footer) return;

      const footerRect = footer.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      if (footerRect.top < viewportHeight) {
        const visibleFooterHeight = viewportHeight - footerRect.top;
        setBottomOffset(visibleFooterHeight + 32);
      } else {
        setBottomOffset(32);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  // Функція плавного скролу до контактів
  const scrollToContact = () => {
    const contactSection = document.getElementById('kontakt');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div 
      className="fixed left-1/2 -translate-x-1/2 z-40 w-full max-w-[380px] px-4 transition-all duration-75 ease-out"
      style={{ bottom: `${bottomOffset}px` }}
    >
      <button
        onClick={scrollToContact}
        className="
          w-full py-4 px-8
          bg-foxy-accent/80 backdrop-blur-lg
          border border-white/30 rounded-xl
          shadow-[0_8px_32px_rgba(217,119,87,0.3)]
          text-white font-montserrat font-bold uppercase tracking-[0.2em]
          flex items-center justify-center gap-3
          transition-all duration-300
          hover:bg-foxy-accent hover:shadow-[0_8px_40px_rgba(217,119,87,0.5)]
          active:scale-95 group cursor-pointer
          overflow-hidden relative
        "
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" viewBox="0 0 24 24" 
          strokeWidth={2} stroke="currentColor" 
          className="w-5 h-5 transition-transform group-hover:scale-110"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
        </svg>

        <span className="text-sm md:text-base">Zarezerwuj wizytę</span>

        <div className="absolute inset-0 w-full h-full pointer-events-none">
          <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full animate-[shimmer_4s_infinite]"></div>
        </div>
      </button>
    </div>
  );
}