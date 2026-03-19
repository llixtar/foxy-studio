"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';

const footerVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.1 } }
};

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  // Посилання на Google Maps для Rynek 24/1, Świdnica
  const googleMapsUrl = "https://www.google.com/maps/search/?api=1&query=Rynek+24%2F1%2C+58-100+%C5%9Awidnica";

  return (
    <footer className="bg-[#1a1a1a] border-t border-white/5 pt-16 pb-8 text-white/80 font-lato z-10 relative">
      <div className="container mx-auto px-6 max-w-5xl">
        
        <motion.div 
          variants={footerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="flex flex-col items-center text-center gap-12 mb-16"
        >
          {/* СЕКЦІЯ 1: KONTAKT */}
          <div className="w-full">
            <h4 className="font-playfair text-2xl font-bold text-white mb-8">Kontakt</h4>
            <div className="flex flex-col md:flex-row flex-wrap justify-center items-center gap-x-12 gap-y-6 text-sm opacity-90">
              
              {/* Адреса як клікабельне посилання */}
              <a 
                href={googleMapsUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 group hover:text-foxy-accent transition-colors"
              >
                <span className="text-foxy-accent transition-transform group-hover:scale-125">📍</span>
                <span className="border-b border-transparent group-hover:border-foxy-accent/30">
                  ul. Rynek 24/1, 58-100 Świdnica
                </span>
              </a>

              <div className="flex items-center gap-2">
                <span className="text-foxy-accent">📞</span>
                <a href="tel:+48570284569" className="hover:text-foxy-accent transition-colors">+48 570 284 569</a>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-foxy-accent">🕒</span>
                <span>Pn-Pt: 9:00 - 18:00 | Sob: 9:00 - 14:00</span>
              </div>
            </div>
          </div>

          {/* СЕКЦІЯ 2: INFORMACJE */}
          <div className="w-full">
            <h4 className="font-playfair text-xl font-bold text-white mb-6">Informacje</h4>
            <div className="flex flex-col md:flex-row justify-center items-center gap-x-8 gap-y-4 text-sm font-semibold tracking-wider">
              <Link href="/regulamin-uslug" className="hover:text-foxy-accent transition-colors">
                Warunki Świadczenia Usług
              </Link>
              <span className="hidden md:block opacity-20">|</span>
              <Link href="/polityka-prywatnosci" className="hover:text-foxy-accent transition-colors">
                Polityka Prywatności
              </Link>
            </div>
          </div>
        </motion.div>

        {/* НИЖНЯ ПАНЕЛЬ */}
        <div className="border-t border-white/5 pt-8 flex flex-col-reverse md:flex-row items-center justify-between gap-6 text-xs text-white/50">
          <p>&copy; {currentYear} Foxy Studio. Wszelkie prawa zastrzeżone.</p>
          
          <div className="flex items-center gap-6">
            <a href="https://www.instagram.com/foxy.studio._" target="_blank" rel="noopener noreferrer" className="hover:text-foxy-accent transition-all hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            <a href="https://www.facebook.com/share/18K5d6TLVK/" target="_blank" rel="noopener noreferrer" className="hover:text-foxy-accent transition-all hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}