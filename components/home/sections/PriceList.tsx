"use client";

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; // Перевір, чи правильний шлях до твого supabase клієнта!

// Порядок категорій, як ти хочеш бачити їх на сайті
const CATEGORY_ORDER = [
  "Manicure / Pedicure",
  "Stylizacja brwi",
  "Stylizacja rzęs",
  "Przedłużanie rzęs",
  "Tatuaż artystyczny"
];

const gridVariants: any = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.2 } } };
const categoryVariants: any = { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.1 } } };
const rowVariants: any = { hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } } };

export default function PriceList() {
  // Стан для збереження згрупованих даних
  const [priceData, setPriceData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Завантаження даних з бази
  useEffect(() => {
    const fetchData = async () => {
      const [servicesRes, promosRes] = await Promise.all([
        // ДОДАЄМО .order('id') ТУТ 👇
        supabase.from('services').select('*').order('id', { ascending: true }),
        supabase.from('promotions').select('*')
      ]);

      const srvData = servicesRes.data || [];
      const promoData = promosRes.data || [];

      // 2. Групуємо дані за нашими категоріями
      const groupedData = CATEGORY_ORDER.map(cat => {
        // Шукаємо всі послуги для цієї категорії
        const items = srvData
          .filter(s => s.category === cat)
          .map(s => ({
            name: s.title,
            price: s.price,
            catId: s.cat_id,
            srvId: s.srv_id
          }));

        // Шукаємо акцію для цієї категорії (якщо є)
        const promocja = promoData.find(p => p.category === cat)?.text || null;

        return { category: cat, items, promocja };
      });

      // 3. Зберігаємо в стейт
      setPriceData(groupedData);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  // МАГІЯ ВИКЛИКУ МОДАЛКИ
  const handleBooking = (catId: string, srvId: string) => {
    window.dispatchEvent(new CustomEvent('openModalGlobal'));
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('prefillBooking', { detail: { catId, srvId } }));
    }, 50);
  };

  return (
    <section id="cennik" className="bg-foxy-bg py-24 px-4 border-y border-foxy-text/5 relative z-10 overflow-hidden text-foxy-text">
      <div className="container mx-auto max-w-5xl">

        {/* Заголовок */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <h2 className="font-playfair text-4xl md:text-5xl font-bold">
            Cennik <span className="italic">Usług</span>
          </h2>
          <div className="w-16 h-1 bg-foxy-accent mx-auto mt-6 rounded-full opacity-50"></div>
        </motion.div>

        {isLoading ? (
          <div className="text-center py-10 opacity-50 font-bold tracking-widest animate-pulse">
            ZADOWANIE CENNIKA...
          </div>
        ) : (
          /* Колонки */
          <motion.div
            variants={gridVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="columns-1 md:columns-2 gap-x-16"
          >
            {priceData.map((section, idx) => (
              <motion.div
                key={idx}
                variants={categoryVariants}
                className="flex flex-col mb-12 break-inside-avoid"
              >
                <motion.h3 variants={rowVariants} className="font-playfair text-2xl font-bold mb-6 border-b border-foxy-accent/20 pb-2">
                  {section.category}
                </motion.h3>

                <div className="flex flex-col space-y-2">
                  {section.items.map((item: any, itemIdx: number) => (
                    <motion.div
                      key={itemIdx}
                      variants={rowVariants}
                      onClick={() => handleBooking(item.catId, item.srvId)}
                      className="flex justify-between items-baseline group cursor-pointer p-2 -mx-2 rounded-lg hover:bg-foxy-accent/5 transition-colors"
                    >
                      <span className="opacity-90 font-medium text-sm md:text-base transition-colors group-hover:text-foxy-accent pr-4 max-w-[70%]">
                        {item.name}
                      </span>
                      <div className="flex-grow border-b-2 border-dotted border-current opacity-10 relative top-[-4px] transition-opacity group-hover:opacity-30"></div>
                      <span className="font-bold text-sm md:text-base whitespace-nowrap pl-4 group-hover:text-foxy-accent transition-colors">
                        {item.price}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* Блок Промоції */}
                {section.promocja && (
                  <motion.div
                    variants={rowVariants}
                    className="mt-6 p-4 rounded-xl bg-foxy-accent/5 border border-foxy-accent/20 flex items-start md:items-center gap-3 shadow-sm"
                  >
                    <div className="flex flex-col">
                      <span className="text-foxy-accent text-[10px] font-bold tracking-widest uppercase mb-0.5">
                        Promocja
                      </span>
                      <span className="font-bold text-sm md:text-base">
                        {section.promocja}
                      </span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}