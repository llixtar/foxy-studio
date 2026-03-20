"use client";

import { motion } from 'framer-motion';

export default function WhatsAppButton() {
  // РИБА: Сюди треба буде вставити реальний номер Анжели
  const phoneNumber = "48570284569"; 
  const message = "Dzień dobry! Poproszę o konsultację w sprawie usług salonu.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      /* Позиціонування: 
         Тепер fixed right-6 (справа!)
         bottom-26 на мобільці (акуратно над кнопкою запису)
         bottom-8 на десктопі
      */
      className="fixed right-6 bottom-26 md:bottom-8 z-[90] flex items-center group"
    >
      {/* Текст-підказка на десктопі */}
      <span className="mr-4 bg-white/10 backdrop-blur-md border border-white/10 text-white px-4 py-2 rounded-full font-bold uppercase text-[10px] tracking-[0.2em] opacity-0 translate-x-4 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 hidden md:block text-right">
        Skontaktuj się
      </span>

      {/* Контейнер іконки (зменшений для мобільних) */}
      <div className="relative bg-[#25D366] text-white 
        p-1.5 md:p-4 rounded-full shadow-[0_10px_25px_rgba(37,211,102,0.3)] 
        flex items-center justify-center transition-all duration-300"
      >
        
        {/* SVG іконка WhatsApp (зменшена для мобільних) */}
        <svg 
          viewBox="0 0 24 24" 
          className="w-3 h-3 md:w-8 md:h-8 fill-current"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.445 0 .01 5.437 0 12.045c0 2.112.552 4.173 1.6 6.002L0 24l6.117-1.605a11.803 11.803 0 005.925 1.585h.005c6.604 0 12.039-5.436 12.044-12.043a11.8 11.8 0 00-3.476-8.513z"/>
        </svg>

        {/* Пульсація навколо */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25"></span>
      </div>
    </motion.a>
  );
}