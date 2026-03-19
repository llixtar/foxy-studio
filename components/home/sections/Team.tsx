"use client";

import { motion } from 'framer-motion';

const teamData = [
  { 
    id: 'anzhela', 
    name: 'Anzhela Ilchyshyn', 
    role: 'Właścicielka / Tatuaż & Manicure', 
    desc: 'Założycielka Foxy Studio. Perfekcjonistka, która łączy pasję do tatuażu z mistrzostwem w stylizacji paznokci. Jej prace to czysta sztuka, w którą wkłada całą swoją duszę.', 
    image: '/assets/team/anzhela.webp' 
  },
  { 
    id: 'tetiana', 
    name: 'Tetiana Lysenko', 
    role: 'Stylizacja brwi i rzęs', 
    desc: 'Mistrzyni idealnej geometrii i laminacji. Zrobi z Twoimi brwiami i rzęsami prawdziwą magię, podkreślając naturalne piękno.', 
    image: '/assets/team/tetiana.webp' 
  },
  { 
    id: 'wiktoria', 
    name: 'Wiktoria Nowak', 
    role: 'Manicure / Pedicure', 
    desc: 'Specjalistka od manicure sprzętowego i designu. Jej stylizacje to idealny blask i trwałość, która utrzymuje się przez wiele tygodni.', 
    image: '/assets/team/wiktoria.webp' 
  },
  { 
    id: 'julia', 
    name: 'Julia Kowalska', 
    role: 'Przedłużanie rzęs', 
    desc: 'Ekspertka od przedłużania rzęs na każdym poziomie: od klasyki po mega volume. Tworzy hipnotyzujące spojrzenie.', 
    image: '/assets/team/julia.webp' 
  },
  { 
    id: 'klaudia', 
    name: 'Klaudia Wiśniewska', 
    role: 'Tatuaż artystyczny', 
    desc: 'Artystka z unikalnym stylem. Specjalizuje się w cienkich liniach, motywach florystycznych i delikatnych, kobiecych mikrotatuażach.', 
    image: '/assets/team/klaudia.webp' 
  },
];

const [boss, ...staff] = teamData;

const containerVariants: any = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
};

export default function Team() {
  return (
    <section id="zespol" className="bg-foxy-bg py-24 px-4 border-t border-foxy-text/5">
      <div className="container mx-auto max-w-5xl">
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="font-playfair text-5xl md:text-6xl font-bold text-foxy-text">
            Nasz <span className="italic">Zespół</span>
          </h2>
          <div className="w-24 h-1 bg-foxy-accent mx-auto mt-6 rounded-full opacity-50"></div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col gap-16 md:gap-24"
        >
          {/* КАРТКА ВЛАСНИЦІ (Стильний Editorial) */}
          <motion.div variants={itemVariants} className="w-full flex flex-col md:flex-row items-center gap-8 md:gap-16">
            <div className="w-full md:w-1/2">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-lg">
                <img 
                  src={boss.image} 
                  alt={boss.name} 
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
              </div>
            </div>
            
            <div className="w-full md:w-1/2 flex flex-col text-center md:text-left">
              <p className="text-foxy-accent font-bold tracking-[0.2em] uppercase text-xs mb-4">
                {boss.role}
              </p>
              <h3 className="font-playfair text-4xl md:text-5xl font-bold text-foxy-text mb-6">
                {boss.name}
              </h3>
              <p className="text-foxy-text/80 leading-relaxed font-lato text-base md:text-lg">
                {boss.desc}
              </p>
            </div>
          </motion.div>

          {/* КОМАНДА (Чиста сітка) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {staff.map((member: any) => (
              <motion.div key={member.id} variants={itemVariants} className="flex flex-col group">
                {/* Фото */}
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl shadow-md mb-5">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                {/* Інфо під фото */}
                <div className="flex flex-col text-center">
                  <h3 className="font-playfair text-xl md:text-2xl font-bold text-foxy-text mb-1">
                    {member.name}
                  </h3>
                  <p className="text-foxy-accent font-bold tracking-widest uppercase text-[10px] md:text-xs mb-3">
                    {member.role}
                  </p>
                  <p className="text-foxy-text/70 text-xs md:text-sm leading-relaxed">
                    {member.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
          
        </motion.div>
      </div>
    </section>
  );
}