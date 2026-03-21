"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

const itemVariants: any = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export default function Team() {
  const [teamData, setTeamData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      const { data } = await supabase.from('team').select('*').order('is_boss', { ascending: false });
      if (data) setTeamData(data);
      setIsLoading(false);
    };
    fetchTeam();
  }, []);

  if (isLoading) {
    return (
      <section id="zespol" className="bg-foxy-bg py-16 px-4 flex items-center justify-center min-h-[400px]">
        <p className="text-foxy-accent font-bold tracking-widest animate-pulse">ŁADOWANIE ZESPOŁU...</p>
      </section>
    );
  }

  // Якщо база порожня — нічого не показуємо
  if (teamData.length === 0) return null;

  const boss = teamData.find(m => m.is_boss) || teamData[0];
  const staff = teamData.filter(m => m.id !== boss.id);

  return (
    <section id="zespol" className="bg-foxy-bg py-16 px-4 border-t border-foxy-text/5">
      <div className="container mx-auto max-w-5xl">
        
        <div className="text-center mb-16">
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foxy-text">
            Nasz <span className="italic font-normal">Zespół</span>
          </h2>
          <div className="w-16 h-1 bg-foxy-accent mx-auto mt-4 rounded-full opacity-50" />
        </div>

        <div className="flex flex-col items-center gap-16 md:gap-24">
          
          {/* BOSS */}
          <motion.div variants={itemVariants} initial="hidden" whileInView="show" viewport={{ once: true }} className="flex flex-col items-center text-center max-w-xl">
            <div className="w-64 md:w-80 aspect-[4/5] mb-8 relative">
              <img src={boss.image_url} alt={boss.name} className="w-full h-full object-cover rounded-3xl shadow-2xl border border-foxy-text/5" />
            </div>
            <p className="text-foxy-accent font-bold tracking-[0.2em] uppercase text-xs mb-3">{boss.role}</p>
            <h3 className="font-playfair text-4xl font-bold text-foxy-text mb-4">{boss.name}</h3>
            <p className="text-foxy-text leading-relaxed font-lato text-base md:text-lg italic">"{boss.desc}"</p>
          </motion.div>

          {/* STAFF */}
          {staff.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 w-full max-w-4xl">
              {staff.map((member) => (
                <motion.div key={member.id} variants={itemVariants} initial="hidden" whileInView="show" viewport={{ once: true }} className="flex flex-col items-center text-center">
                  <div className="w-48 md:w-64 aspect-[4/5] mb-6 relative mx-auto">
                    <img src={member.image_url} alt={member.name} className="w-full h-full object-cover rounded-2xl shadow-xl border border-foxy-text/5" />
                  </div>
                  <h4 className="font-playfair text-2xl md:text-3xl font-bold text-foxy-text mb-2">{member.name}</h4>
                  <p className="text-foxy-accent font-bold uppercase text-[10px] md:text-xs tracking-widest mb-4 leading-tight">{member.role}</p>
                  <p className="text-foxy-text leading-relaxed font-lato text-sm md:text-base">"{member.desc}"</p>
                </motion.div>
              ))}
            </div>
          )}
          
        </div>
      </div>
    </section>
  );
}