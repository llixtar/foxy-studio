"use client";

import { motion } from 'framer-motion';

export default function Contact() {
  return (
    <section id="kontakt" className="bg-foxy-bg py-24 px-4 border-t border-foxy-text/5">
      <div className="container mx-auto max-w-6xl">
        
        {/* Заголовок */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="font-playfair text-5xl md:text-6xl font-bold text-foxy-text">
            Skontaktuj <span className="italic">się z nami</span>
          </h2>
          <div className="w-24 h-1 bg-foxy-accent mx-auto mt-6 rounded-full opacity-50"></div>
          <p className="mt-6 text-foxy-text/70 max-w-2xl mx-auto font-lato text-lg">
            Umów się na wizytę, zadzwoń lub odwiedź nasze studio. Czekamy na Ciebie!
          </p>
        </motion.div>

        {/* Головна картка контактів */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col lg:flex-row gap-0 bg-[#1a1a1a]/40 backdrop-blur-md border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl"
        >
          
          {/* Ліва колонка: Інформація */}
          <div className="w-full lg:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center z-10">
            <h3 className="font-playfair text-3xl md:text-4xl font-bold text-white mb-10">
              Foxy Studio
            </h3>
            
            <div className="space-y-8 text-white/90 font-lato text-base md:text-lg">
              
              {/* Адреса */}
              <div className="flex items-start gap-4 group">
                <span className="text-foxy-accent text-2xl mt-0.5 transition-transform group-hover:scale-110">📍</span>
                <div>
                  <p className="font-bold text-white mb-1 tracking-wider uppercase text-xs text-foxy-text/70">Adres</p>
                  <p className="font-medium">ul. Rynek 24/1</p>
                  <p className="font-medium">58-100 Świdnica</p>
                </div>
              </div>
              
              {/* Телефон */}
              <div className="flex items-start gap-4 group">
                <span className="text-foxy-accent text-2xl mt-0.5 transition-transform group-hover:scale-110">📞</span>
                <div>
                  <p className="font-bold text-white mb-1 tracking-wider uppercase text-xs text-foxy-text/70">Telefon</p>
                  <a href="tel:+48570284569" className="font-medium hover:text-foxy-accent transition-colors">
                    +48 570 284 569
                  </a>
                </div>
              </div>

              {/* Години роботи */}
              <div className="flex items-start gap-4 group">
                <span className="text-foxy-accent text-2xl mt-0.5 transition-transform group-hover:scale-110">🕒</span>
                <div>
                  <p className="font-bold text-white mb-1 tracking-wider uppercase text-xs text-foxy-text/70">Godziny otwarcia</p>
                  <p className="font-medium">Poniedziałek - Piątek: 09:00 - 18:00</p>
                  <p className="font-medium">Sobota: 09:00 - 14:00</p>
                  <p className="text-white/50 font-medium">Niedziela: Zamknięte</p>
                </div>
              </div>
            </div>

            {/* Соціальні мережі (замість кнопки Booksy) */}
            <div className="mt-12 flex flex-col sm:flex-row gap-6">
              
              {/* Instagram */}
              <a 
                href="https://www.instagram.com/foxy.studio._?igsh=MThpODh3a2Nidm5xOQ==" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center gap-4 text-white/90 hover:text-foxy-accent transition-colors"
              >
                <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-foxy-accent group-hover:bg-foxy-accent/10 transition-all duration-300 transform group-hover:-translate-y-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </div>
                <span className="font-bold tracking-widest uppercase text-sm">Instagram</span>
              </a>

              {/* Facebook */}
              <a 
                href="https://www.facebook.com/share/18K5d6TLVK/?mibextid=wwXIfr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center gap-4 text-white/90 hover:text-foxy-accent transition-colors"
              >
                <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-foxy-accent group-hover:bg-foxy-accent/10 transition-all duration-300 transform group-hover:-translate-y-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </div>
                <span className="font-bold tracking-widest uppercase text-sm">Facebook</span>
              </a>

            </div>
          </div>

          {/* Права колонка: Віджет Google Карт */}
          <div className="w-full lg:w-1/2 min-h-[400px] lg:min-h-auto relative border-t lg:border-t-0 lg:border-l border-white/10">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2516.486243851086!2d16.4897223!3d50.8427778!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x470e51b1b1b1b1b1%3A0x1b1b1b1b1b1b1b1b!2sul.%20Rynek%2024%2F1%2C%2058-100%20%C5%9Awidnica!5e0!3m2!1spl!2spl!4v1611111111111!5m2!1spl!2spl" 
              className="absolute inset-0 w-full h-full border-0 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-700" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>

        </motion.div>
      </div>
    </section>
  );
}