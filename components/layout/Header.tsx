"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  {
    title: 'Usługi',
    type: 'dropdown',
    items: [
      { name: 'Tatuaż artystyczny', url: '/uslugi/tatuaz' },
      { name: 'Manicure / Pedicure', url: '/uslugi/manicure' },
      { name: 'Stylizacja brwi i rzęs', url: '/uslugi/brwi' },
      { name: 'Przedłużanie rzęs', url: '/uslugi/rzesy' },
    ]
  },
  { title: 'Cennik', url: '/#cennik', type: 'link' },
  { title: 'Portfolio', url: '/#portfolio', type: 'link' },
  { title: 'Zespół', url: '/#zespol', type: 'link' },
  { title: 'Kontakt', url: '/#kontakt', type: 'link' },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPastHero, setIsPastHero] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);

  const pathname = usePathname();
  const isHomePage = pathname === '/';

  // 1. ЛОГІКА БЛОКУВАННЯ СКРОЛУ
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    // Чистимо при розмонтуванні компонента
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMenuOpen]);

  // 2. ЛОГІКА СКРОЛУ ХЕДЕРА
  useEffect(() => {
    if (!isHomePage) {
      setIsPastHero(true);
      return;
    }

    const handleScroll = () => {
      if (window.scrollY >= window.innerHeight - 80) {
        setIsPastHero(true);
      } else {
        setIsPastHero(false);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setIsMobileServicesOpen(false);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setIsMobileServicesOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        isPastHero
          ? 'bg-foxy-bg/95 backdrop-blur-md shadow-sm py-4' 
          : 'bg-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex items-center justify-between">

          <Link
            href="/"
            className="flex items-center transition-transform hover:scale-105"
            onClick={closeMenu}
          >
            {/* Використовуй Image з next/image для оптимізації, коли буде час */}
            <img
              src="/assets/FOXY.svg"
              alt="Foxy Studio Logo"
              className={`h-20 md:h-30 w-auto transition-all duration-500 ${
                !isPastHero
                  ? 'invert brightness-0 drop-shadow-[0_0_0.5px_rgba(255,255,255,1)]'
                  : 'drop-shadow-[0_0_0.3px_rgba(0,0,0,1)]'
              }`}
            />
          </Link>

          {/* ДЕСКТОПНА НАВІГАЦІЯ */}
          <nav className={`hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-wider transition-colors duration-300 ${
            isPastHero ? 'text-foxy-text' : 'text-white'
          }`}>
            {navItems.map((item) => (
              item.type === 'dropdown' ? (
                <div key={item.title} className="relative group py-4 cursor-pointer">
                  <span className="flex items-center gap-1 hover:text-foxy-accent transition-colors">
                    {item.title}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3 mt-0.5 group-hover:rotate-180 transition-transform duration-300">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </span>

                  <div className="absolute top-[100%] left-0 pt-2 hidden group-hover:block w-64">
                    <div className="flex flex-col bg-foxy-bg backdrop-blur-xl shadow-xl border border-foxy-text/10 rounded-2xl overflow-hidden py-2">
                      {item.items?.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.url}
                          className="px-5 py-3 text-foxy-text/80 hover:text-foxy-accent hover:bg-black/5 text-xs font-bold tracking-widest transition-colors"
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link key={item.title} href={item.url || "#"} className="relative group py-4">
                  <span>{item.title}</span>
                  <span className="absolute bottom-2 left-0 w-0 h-0.5 bg-foxy-accent transition-all duration-300 group-hover:w-full"></span>
                </Link>
              )
            ))}
          </nav>

          {/* БУРГЕР-КНОПКА — ТУТ ТЕПЕР z-[101] ТА relative */}
          <button
            className={`md:hidden p-2 relative z-[101] transition-colors hover:text-foxy-accent ${
              isPastHero ? 'text-foxy-text' : 'text-white'
            }`}
            onClick={toggleMenu}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* МОБІЛЬНЕ МЕНЮ — ПЕРЕВІР z-[110] */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[110] flex flex-col bg-foxy-bg/98 backdrop-blur-2xl md:hidden overflow-y-auto"
          >
            {/* Контент меню такий самий, як у тебе був */}
            <div className="flex h-20 items-center justify-between px-6 border-b border-foxy-text/5 shrink-0">
              <Link href="/" onClick={closeMenu}>
                <img src="/assets/FOXY.svg" alt="Logo" className="h-20 w-auto" />
              </Link>
              <button onClick={toggleMenu} className="p-2 text-foxy-text hover:text-foxy-accent transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-9 h-9">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="flex flex-col items-center justify-center gap-8 text-2xl font-bold uppercase tracking-widest text-foxy-text py-12">
              {navItems.map((item) => (
                item.type === 'dropdown' ? (
                  <div key={item.title} className="flex flex-col items-center w-full">
                    <button
                      onClick={() => setIsMobileServicesOpen(!isMobileServicesOpen)}
                      className="flex items-center gap-2 hover:text-foxy-accent transition-colors"
                    >
                      {item.title}
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={`w-5 h-5 transition-transform duration-300 ${isMobileServicesOpen ? 'rotate-180 text-foxy-accent' : ''}`}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>

                    <div className={`flex flex-col items-center gap-5 overflow-hidden transition-all duration-300 ${
                      isMobileServicesOpen ? 'max-h-96 mt-6 opacity-100' : 'max-h-0 mt-0 opacity-0'
                    }`}>
                      {item.items?.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.url}
                          onClick={closeMenu}
                          className="text-base text-foxy-text/70 hover:text-foxy-accent font-semibold tracking-wider transition-colors"
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    key={item.title}
                    href={item.url || "#"}
                    onClick={closeMenu}
                    className="hover:text-foxy-accent transition-colors"
                  >
                    {item.title}
                  </Link>
                )
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}