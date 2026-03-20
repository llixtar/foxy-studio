"use client";

import { motion } from 'framer-motion';

const teamData = [
  { 
    id: 'anzhela', 
    name: 'Anzhela', 
    role: 'Właścicielka / Tatuaż / Manicure', 
    desc: 'Założycielka Foxy Studio. Perfekcjonistka, która łączy pasję do tatuażu z mistrzostwem w stylizacji paznokci. Jej prace to czysta sztuka, w którą wkłada całą swoją duszę.', 
    image: '/assets/team/anzhela.webp' 
  },
  { 
    id: 'tetiana', 
    name: 'Tetiana', 
    role: 'Stylizacja brwi i rzęs', 
    desc: 'Bardzo dokładna, kompetentna i uprzejma specjalistka. Perfekcyjnie wykonuje swoją pracę, potrafi stworzyć przyjemną atmosferę i chętnie odpowie na wszystkie pytania. Szczegółowo doradzi w kwestii pielęgnacji domowej – od A do Z. Pracuje wyłącznie na wysokiej jakości produktach.', 
    image: '/assets/team/tetiana.JPG' 
  },
  { 
    id: 'iryna', 
    name: 'Iryna', 
    role: 'Manicure / Pedicure / Rzęsy', 
    desc: 'Prawdziwa „złota rączka”. Wykonuje swoją pracę szybko i na najwyższym poziomie! Z nią nigdy nie będzie nudno. Szeroki wybór materiałów, pełna sterylność oraz przyjemna atmosfera – gwarantowane!', 
    image: '/assets/team/iryna.JPG' 
  }
];

const [boss, ...staff] = teamData;

const itemVariants: any = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export default function Team() {
  return (
    <section id="zespol" className="bg-foxy-bg py-16 px-4 border-t border-foxy-text/5">
      <div className="container mx-auto max-w-5xl">
        
        {/* Заголовок */}
        <div className="text-center mb-16">
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foxy-text">
            Nasz <span className="italic font-normal">Zespół</span>
          </h2>
          <div className="w-16 h-1 bg-foxy-accent mx-auto mt-4 rounded-full opacity-50" />
        </div>

        <div className="flex flex-col items-center gap-16 md:gap-24">
          
          {/* АНЖЕЛА (BOSS - Найбільше фото) */}
          <motion.div 
            variants={itemVariants} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="flex flex-col items-center text-center max-w-xl"
          >
            {/* Фіксований розмір фото Анжели */}
            <div className="w-64 md:w-80 aspect-[4/5] mb-8 relative">
              <img 
                src={boss.image} alt={boss.name} 
                className="w-full h-full object-cover rounded-3xl shadow-2xl border border-foxy-text/5"
              />
            </div>
            
            <p className="text-foxy-accent font-bold tracking-[0.2em] uppercase text-xs mb-3">{boss.role}</p>
            <h3 className="font-playfair text-4xl font-bold text-foxy-text mb-4">{boss.name}</h3>
            <p className="text-foxy-text leading-relaxed font-lato text-base md:text-lg italic">
              "{boss.desc}"
            </p>
          </motion.div>

          {/* КОЛЕГИ (Дві в ряд, фото строго менші за Анжелу) */}
          <div className="grid grid-cols-2 gap-6 md:gap-16 w-full max-w-4xl">
            {staff.map((member) => (
              <motion.div 
                key={member.id} variants={itemVariants} initial="hidden" whileInView="show" viewport={{ once: true }}
                className="flex flex-col items-center text-center"
              >
                {/* Фіксований менший розмір фото дівчат */}
                <div className="w-48 md:w-64 aspect-[4/5] mb-6 relative mx-auto">
                  <img 
                    src={member.image} alt={member.name} 
                    className="w-full h-full object-cover rounded-2xl shadow-xl border border-foxy-text/5"
                  />
                </div>
                
                <h4 className="font-playfair text-2xl md:text-3xl font-bold text-foxy-text mb-2">{member.name}</h4>
                <p className="text-foxy-accent font-bold uppercase text-[10px] md:text-xs tracking-widest mb-4 leading-tight">
                  {member.role}
                </p>
                <p className="text-foxy-text leading-relaxed font-lato text-sm md:text-base">
                  "{member.desc}""
                </p>
              </motion.div>
            ))}
          </div>
          
        </div>
      </div>
    </section>
  );
}