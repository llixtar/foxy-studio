"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

// --- ДАНІ З ПРИВ'ЯЗКОЮ ДО БАЗИ МОДАЛКИ ---
const tattooPriceData = {
    category: "Tatuaż artystyczny",
    items: [
        { name: "Konsultacja", price: "Darmowa", catId: 'tatuaz', srvId: 't1' },
        { name: "Tatuaż minimalistyczny 5-7cm", price: "200 zł", catId: 'tatuaz', srvId: 't2' },
        { name: "Tatuaż średni 10-20cm", price: "350 zł+", catId: 'tatuaz', srvId: 't3' },
        { name: "Tatuaż od 25cm", price: "600 zł+", catId: 'tatuaz', srvId: 't4' },
    ]
};

const tattooMaster = {
    id: 'anzhela',
    name: 'Anzhela Ilchyshyn',
    role: 'Właścicielka / Tatuaż & Manicure',
    desc: 'Założycielka Foxy Studio. Perfekcjonistka, która łączy pasję do tatuażu з mistrzostwem w stylizacji paznokci. Jej prace to czysta sztuka, w którą wkłada całą swoją duszę.',
    image: '/assets/team/anzhela.webp'
};

const generateImages = (category: string, folder: string, count: number, prefix: string) => {
    return Array.from({ length: count }).map((_, i) => ({
        id: `${prefix}-${i + 1}`,
        category,
        src: `/assets/gallery/${folder}/${i + 1}.webp`
    }));
};
const tattooImages = generateImages("Tatuaż artystyczny", "tatuaz", 17, "t");

// --- АНІМАЦІЇ ---
const categoryVariants: any = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.1 } }
};

const rowVariants: any = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export default function TattooPage() {
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    // МАГІЯ ВИКЛИКУ МОДАЛКИ (Deep Linking)
    const handleBooking = (catId: string, srvId: string) => {
        // Відкриваємо модалку
        window.dispatchEvent(new CustomEvent('openModalGlobal'));
        
        // Передаємо дані послуги
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent('prefillBooking', { 
                detail: { catId, srvId } 
            }));
        }, 50);
    };

    const showNext = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (lightboxIndex !== null) setLightboxIndex((lightboxIndex + 1) % tattooImages.length);
    };

    const showPrev = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (lightboxIndex !== null) setLightboxIndex((lightboxIndex - 1 + tattooImages.length) % tattooImages.length);
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
        <div className="bg-foxy-bg min-h-screen pt-48 pb-24 relative">

            {/* 1. ПРАЙС */}
            <section className="px-4 mb-24 relative z-10">
                <div className="container mx-auto max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <h1 className="font-playfair text-5xl md:text-6xl font-bold text-foxy-text uppercase tracking-tight">
                            Tatuaż <span className="italic font-normal">Artystyczny</span>
                        </h1>
                        <div className="w-24 h-1 bg-foxy-accent mx-auto mt-6 rounded-full opacity-50"></div>
                    </motion.div>

                    <motion.div
                        variants={categoryVariants}
                        initial="hidden"
                        animate="show"
                        className="bg-[#1a1a1a]/40 backdrop-blur-md border border-white/10 p-8 md:p-12 rounded-[2rem] shadow-2xl"
                    >
                        <div className="flex flex-col space-y-4">
                            {tattooPriceData.items.map((item, idx) => (
                                <motion.div 
                                    key={idx} 
                                    variants={rowVariants} 
                                    onClick={() => handleBooking(item.catId, item.srvId)}
                                    className="flex justify-between items-baseline group cursor-pointer p-2 -mx-2 rounded-lg hover:bg-foxy-accent/5 transition-colors"
                                >
                                    <span className="text-white/90 font-medium text-base md:text-lg group-hover:text-foxy-accent transition-colors pr-4">{item.name}</span>
                                    <div className="flex-grow border-b-2 border-dotted border-white/20 relative top-[-4px] group-hover:border-foxy-accent/40 transition-colors"></div>
                                    <span className="text-white font-bold text-base md:text-lg pl-4 group-hover:text-foxy-accent transition-colors">{item.price}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* 2. МАЙСТЕР */}
            <section className="px-4 mb-24 relative z-10">
                <div className="container mx-auto max-w-5xl">
                    <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
                        <div className="w-full md:w-1/2">
                            <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] shadow-2xl">
                                <Image
                                    src={tattooMaster.image}
                                    alt={tattooMaster.name}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    priority
                                />
                            </div>
                        </div>
                        <div className="w-full md:w-1/2 text-center md:text-left">
                            <p className="text-foxy-accent font-bold tracking-[0.3em] uppercase text-xs mb-4">{tattooMaster.role}</p>
                            <h2 className="font-playfair text-4xl md:text-6xl font-bold text-foxy-text mb-8">{tattooMaster.name}</h2>
                            <p className="text-foxy-text/80 leading-relaxed font-lato text-lg">{tattooMaster.desc}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. ГАЛЕРЕЯ */}
            <section className="px-4 relative z-10">
                <div className="container mx-auto max-w-6xl text-center mb-12">
                    <h2 className="font-playfair text-4xl font-bold text-foxy-text">Moje <span className="italic">Prace</span></h2>
                </div>
                <div className="container mx-auto max-w-6xl grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px] md:auto-rows-[280px] grid-flow-row-dense">
                    {tattooImages.map((img: any, index: number) => {
                        const patterns = ["col-span-1 row-span-2", "col-span-1 row-span-1", "col-span-2 row-span-2", "col-span-1 row-span-1"];
                        return (
                            <motion.div
                                key={img.id}
                                layout
                                onClick={() => setLightboxIndex(index)}
                                className={`relative group cursor-pointer overflow-hidden rounded-3xl bg-black/5 ${patterns[index % patterns.length]}`}
                            >
                                <Image
                                    src={img.src}
                                    alt="Tattoo work"
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-white font-bold tracking-widest uppercase text-xs">Powiększ</span>
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
                        <button
                            className="absolute top-8 right-8 text-white/70 hover:text-white transition-colors p-2 z-[110]"
                            onClick={(e) => {
                                e.stopPropagation();
                                setLightboxIndex(null);
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <motion.div
                            key={lightboxIndex}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="relative w-full max-w-5xl h-[70vh] md:h-[85vh] flex items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Image
                                src={tattooImages[lightboxIndex].src}
                                fill
                                className="object-contain rounded-lg shadow-2xl"
                                alt="Zoomed Tattoo"
                                sizes="100vw"
                                priority
                            />

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