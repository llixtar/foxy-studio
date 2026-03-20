"use client";

import { motion } from 'framer-motion';

// --- ДАНІ З ПРИВ'ЯЗКОЮ ДО БАЗИ МОДАЛКИ ---
const priceData = [
  {
    category: "Manicure / Pedicure",
    items: [
      { name: "Manicure klasyczny", price: "80 zł", catId: 'manicure', srvId: 'm1' },
      { name: "Ściągnięcie hybrydy/żelu + manicure klasyczny", price: "90 zł", catId: 'manicure', srvId: 'm2' },
      { name: "Manicure hybrydowy", price: "140 zł", catId: 'manicure', srvId: 'm3' },
      { name: "Uzupełnienie paznokci (krótkie)", price: "140 zł", catId: 'manicure', srvId: 'm4' },
      { name: "Uzupełnienie paznokci (średnie)", price: "150 zł", catId: 'manicure', srvId: 'm5' },
      { name: "Uzupełnienie paznokci (długie)", price: "160 zł", catId: 'manicure', srvId: 'm6' },
      { name: "Przedłużanie paznokci (krótkie)", price: "170 zł", catId: 'manicure', srvId: 'm7' },
      { name: "Przedłużanie paznokci (średnie)", price: "190 zł", catId: 'manicure', srvId: 'm8' },
      { name: "Przedłużanie paznokci (długie)", price: "200 zł", catId: 'manicure', srvId: 'm9' },
      // НОВІ ПОЗИЦІЇ ПЕДИКЮРУ
      { name: "Pedicure bez malowania", price: "100 zł", catId: 'pedicure', srvId: 'p1' },
      { name: "Pedicure z hybrydą", price: "130 zł", catId: 'pedicure', srvId: 'p2' },
    ],
    promocja: "MANICURE + PEDICURE = 230 zł"
  },
  {
    category: "Stylizacja brwi",
    items: [
      { name: "Regulacja woskiem/pęsetą", price: "50 zł", catId: 'brwi', srvId: 'b1' },
      { name: "Laminacja brwi", price: "80 zł", catId: 'brwi', srvId: 'b2' },
      { name: "Koloryzacja brwi z regulacją i geometrią", price: "90 zł", catId: 'brwi', srvId: 'b3' },
      { name: "Rozjaśnienie brwi + Koloryzacja + Regulacja", price: "100 zł", catId: 'brwi', srvId: 'b4' },
      { name: "Laminacja brwi + regulacja + farbka", price: "120 zł", catId: 'brwi', srvId: 'b5' },
    ]
  },
  {
    category: "Stylizacja rzęs",
    items: [
      { name: "Koloryzacja rzęs", price: "50 zł", catId: 'rzesy_lami', srvId: 'rl1' },
      { name: "Laminacja rzęs z koloryzacją", price: "120 zł", catId: 'rzesy_lami', srvId: 'rl2' },
      { name: "Laminacja rzęs z koloryzacją + regeneracja botoksem", price: "140 zł", catId: 'rzesy_lami', srvId: 'rl3' },
    ],
    promocja: "LAMINACJA BRWI + LAMINACJA RZĘS = 200 zł"
  },
  {
    category: "Przedłużanie rzęs",
    items: [
      { name: "Ściągnięcie rzęs", price: "40 zł", catId: 'rzesy_ext', srvId: 're1' },
      { name: "Założenie rzęs 1-2D", price: "130 zł", catId: 'rzesy_ext', srvId: 're2' },
      { name: "Założenie rzęs 3D", price: "140 zł", catId: 'rzesy_ext', srvId: 're3' },
      { name: "Założenie rzęs 4-5D", price: "150 zł", catId: 'rzesy_ext', srvId: 're4' },
      { name: "Założenie rzęs 6D+ (Mega Volume)", price: "160 zł", catId: 'rzesy_ext', srvId: 're5' },
    ]
  },
  {
    category: "Tatuaż artystyczny",
    items: [
      { name: "Konsultacja", price: "Darmowa", catId: 'tatuaz', srvId: 't1' },
      { name: "Tatuaż minimalistyczny 5-7cm", price: "200 zł", catId: 'tatuaz', srvId: 't2' },
      { name: "Tatuaż średni 10-20cm", price: "350 zł+", catId: 'tatuaz', srvId: 't3' },
      { name: "Tatuaż od 25cm", price: "600 zł+", catId: 'tatuaz', srvId: 't4' },
    ]
  }
];

const gridVariants: any = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const categoryVariants: any = {
  hidden: { opacity: 0, y: 40 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.8, 
      ease: [0.16, 1, 0.3, 1], 
      staggerChildren: 0.1 
    } 
  }
};

const rowVariants: any = {
  hidden: { opacity: 0, x: -20 },
  show: { 
    opacity: 1, 
    x: 0, 
    transition: { duration: 0.5, ease: "easeOut" } 
  }
};

export default function PriceList() {

  // МАГІЯ ВИКЛИКУ МОДАЛКИ
  const handleBooking = (catId: string, srvId: string) => {
    window.dispatchEvent(new CustomEvent('openModalGlobal'));
    
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('prefillBooking', { 
        detail: { catId, srvId } 
      }));
    }, 50);
  };

  return (
    <section id="cennik" className="bg-foxy-bg py-24 px-4 border-y border-foxy-text/5 relative z-10 overflow-hidden">
      <div className="container mx-auto max-w-5xl">
        
        {/* Заголовок */}
        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foxy-text">
            Cennik <span className="italic">Usług</span>
          </h2>
          <div className="w-16 h-1 bg-foxy-accent mx-auto mt-6 rounded-full opacity-50"></div>
        </motion.div>

        {/* Колонки */}
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
              <motion.h3 variants={rowVariants} className="font-playfair text-2xl font-bold text-foxy-text mb-6 border-b border-foxy-accent/20 pb-2">
                {section.category}
              </motion.h3>
              
              <div className="flex flex-col space-y-2">
                {section.items.map((item, itemIdx) => (
                  <motion.div 
                    key={itemIdx} 
                    variants={rowVariants} 
                    onClick={() => handleBooking(item.catId, item.srvId)}
                    className="flex justify-between items-baseline group cursor-pointer p-2 -mx-2 rounded-lg hover:bg-foxy-accent/5 transition-colors"
                  >
                    {/* Текст послуги */}
                    <span className="text-foxy-text/90 font-medium text-sm md:text-base transition-colors group-hover:text-foxy-accent pr-4 max-w-[70%]">
                      {item.name}
                    </span>
                    
                    {/* Крапочки */}
                    <div className="flex-grow border-b-2 border-dotted border-foxy-text/10 relative top-[-4px] transition-colors group-hover:border-foxy-accent/30"></div>
                    
                    {/* Ціна */}
                    <span className="text-foxy-text font-bold text-sm md:text-base whitespace-nowrap pl-4 group-hover:text-foxy-accent transition-colors">
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
                  <span className="text-foxy-accent text-lg mt-0.5 md:mt-0"></span>
                  <div className="flex flex-col">
                    <span className="text-foxy-accent text-[10px] font-bold tracking-widest uppercase mb-0.5">
                      Promocja
                    </span>
                    <span className="text-foxy-text font-bold text-sm md:text-base">
                      {section.promocja}
                    </span>
                  </div>
                </motion.div>
              )}
              
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}