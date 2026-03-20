"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase'; // Наш бро

// Конфіг для карток: які категорії з бази ми «запихаємо» в кожну картку
const CARDS_CONFIG = [
  {
    id: 'tatuaz',
    title: 'Tatuaż artystyczny',
    image: '/assets/tatuaz.jpg',
    dbCategories: ['Tatuaż artystyczny']
  },
  {
    id: 'manicure', 
    title: 'Manicure / Pedicure',
    image: '/assets/paznokcie.jpg',
    dbCategories: ['Manicure / Pedicure']
  },
  {
    id: 'brwi_rzesy',
    title: 'Stylizacja brwi i rzęs',
    image: '/assets/brwi.jpg',
    dbCategories: ['Stylizacja brwi', 'Stylizacja rzęs'] // Об'єднуємо дві категорії в одну картку
  },
  {
    id: 'rzesy_ext',
    title: 'Przedłużanie rzęs',
    image: '/assets/rzesy.jpg',
    dbCategories: ['Przedłużanie rzęs']
  }
];

export default function Services() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [servicesData, setServicesData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      const { data: dbServices } = await supabase
        .from('services')
        .select('*')
        .order('id', { ascending: true });

      if (dbServices) {
        // Формуємо структуру для карток на основі конфігу
        const formattedData = CARDS_CONFIG.map(card => {
          // Фільтруємо послуги, що належать до категорій цієї картки
          const filteredItems = dbServices
            .filter(s => card.dbCategories.includes(s.category))
            .slice(0, 3) // Беремо перші 3 для прев'ю
            .map(s => ({
              name: s.title,
              price: s.price,
              catId: s.cat_id,
              srvId: s.srv_id
            }));

          return {
            ...card,
            items: filteredItems
          };
        });

        setServicesData(formattedData);
      }
      setIsLoading(false);
    };

    fetchServices();
  }, []);

  const handleToggle = (id: string) => {
    setActiveId(activeId === id ? null : id);
  };

  const handleBooking = (catId: string, srvId: string) => {
    window.dispatchEvent(new CustomEvent('openModalGlobal'));
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('prefillBooking', { 
        detail: { catId, srvId } 
      }));
    }, 50);
  };

  if (isLoading) return null; // Або легкий скелетон

  return (
    <section className="bg-foxy-bg pt-24 pb-12 px-4 relative z-20">
      <div className="container mx-auto max-w-6xl">
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="font-playfair text-5xl md:text-6xl font-bold text-foxy-text">
            Nasze Usługi
          </h2>
          <div className="w-24 h-1 bg-foxy-accent mx-auto mt-4 rounded-full opacity-50"></div>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {servicesData.map((service, index) => (
            <motion.div 
              key={service.id}
              initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }}
              onMouseEnter={() => setActiveId(service.id)} onMouseLeave={() => setActiveId(null)}
              onClick={() => handleToggle(service.id)}
              whileHover={{ y: -10 }}
              className={`relative flex flex-col group cursor-pointer ${activeId === service.id ? 'z-30' : 'z-10'}`}
            >
              <div className={`relative h-56 md:h-72 rounded-3xl border border-white/10 transition-all duration-300 shadow-xl ${activeId === service.id ? 'ring-2 ring-foxy-accent' : ''}`}>
                <div className="absolute inset-0 w-full h-full overflow-hidden rounded-3xl z-0">
                  <img src={service.image} alt={service.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors"></div>
                </div>

                <div className="absolute bottom-0 left-0 w-full p-3 md:p-4 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md rounded-b-3xl z-10 min-h-[60px] border-t border-white/10">
                  <h3 className="font-playfair text-lg md:text-xl font-bold text-white tracking-wide text-center leading-tight drop-shadow-md">
                    {service.title}
                  </h3>
                  <motion.span animate={{ rotate: activeId === service.id ? 180 : 0 }} className="text-foxy-accent absolute right-3 hidden md:block">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
                  </motion.span>
                </div>

                <AnimatePresence>
                  {activeId === service.id && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="absolute top-[100%] left-0 w-full mt-2 overflow-hidden bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl z-20"
                    >
                      <div className="p-4 space-y-2">
                        {service.items.map((item: any, idx: number) => (
                          <div 
                            key={idx} 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBooking(item.catId, item.srvId);
                            }}
                            className="group/item relative flex justify-between items-baseline gap-4 py-2 cursor-pointer"
                          >
                            <span className="text-xs md:text-sm font-medium text-gray-200 transition-colors group-hover/item:text-white drop-shadow-sm">
                              {item.name}
                            </span>
                            <span className="text-xs md:text-sm font-bold text-foxy-accent whitespace-nowrap drop-shadow-sm">
                              {item.price}
                            </span>
                            <span className="absolute bottom-0 left-0 h-[1px] w-0 bg-foxy-accent transition-all duration-300 group-hover/item:w-full"></span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}