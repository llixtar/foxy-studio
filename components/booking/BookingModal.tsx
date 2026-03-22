"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCalApi } from "@calcom/embed-react";
import { supabase } from '@/utils/supabase/client';

// --- ТИПІЗАЦІЯ ---
type Category = {
  id: string;
  title: string;
  icon: string;
  disabled?: boolean;
};

const categories: Category[] = [
  { id: 'manicure', title: 'Manicure', icon: '💅' },
  { id: 'pedicure', title: 'Pedicure', icon: '🦶' },
  { id: 'brwi', title: 'Stylizacja brwi', icon: '✨' },
  { id: 'rzesy_lami', title: 'Stylizacja rzęс', icon: '👁️' },
  { id: 'rzesy_ext', title: 'Przedłużanie rzęs', icon: '🦋' },
  { id: 'tatuaz', title: 'Tatuaż artystyczny', icon: '🖋️' }
];

const categoryKeywords: Record<string, string> = {
  'manicure': 'manicure',
  'pedicure': 'pedicure',
  'brwi': 'brwi',
  'rzesy_lami': 'rzęsy',
  'rzesy_ext': 'rzęsy',
  'tatuaz': 'tatuaż'
};

const durationDB: Record<string, { duration: number, durationText: string }> = {
  'm1': { duration: 30, durationText: '30 min' },
  'm2': { duration: 60, durationText: '1 godz' },
  'm3': { duration: 120, durationText: '1,5 - 2 godz' },
  'm4': { duration: 120, durationText: '2 godz' },
  'm5': { duration: 150, durationText: '2 - 2,5 godz' },
  'm6': { duration: 150, durationText: '2 - 2,5 godz' },
  'm7': { duration: 180, durationText: '2,5 - 3 godz' },
  'm8': { duration: 180, durationText: '2,5 - 3 godz' },
  'm9': { duration: 210, durationText: '2,5 - 3,5 godz' },
  'p1': { duration: 60, durationText: '1 godz' },
  'p2': { duration: 90, durationText: '1,5 godz' },
  'b1': { duration: 30, durationText: '30 min' },
  'b2': { duration: 30, durationText: '30 min' },
  'b3': { duration: 50, durationText: '50 min' },
  'b4': { duration: 75, durationText: '1 godz 15 min' },
  'b5': { duration: 75, durationText: '1 godz 15 min' },
  'rl1': { duration: 30, durationText: '30 min' },
  'rl2': { duration: 90, durationText: '1,5 godz' },
  'rl3': { duration: 90, durationText: '1,5 godz' },
  're1': { duration: 30, durationText: '30 min' },
  're2': { duration: 120, durationText: '2 godz' },
  're3': { duration: 120, durationText: '2 godz' },
  're4': { duration: 120, durationText: '2 godz' },
  're5': { duration: 120, durationText: '2 godz' },
  't1': { duration: 60, durationText: '30 min - 1 godz' },
  't2': { duration: 120, durationText: '1,5 - 2 godz' },
  't3': { duration: 180, durationText: '2 - 3 godz' },
  't4': { duration: 240, durationText: 'od 4 godz' },
};

const formatDuration = (minutes: number) => {
  if (minutes === 0) return "0 min";
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} godz ${m} min` : `${h} godz`;
};

const parsePrice = (priceStr: string): number => {
  const num = parseInt(priceStr.replace(/\D/g, ''));
  return isNaN(num) ? 0 : num;
};

export default function BookingModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<any[]>([]);
  const [selectedMasterId, setSelectedMasterId] = useState<number | null>(null);
  
  const [servicesFromDB, setServicesFromDB] = useState<Record<string, any[]>>({});
  const [teamFromDB, setTeamFromDB] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [userProfile, setUserProfile] = useState<{name: string, email: string, phone: string} | null>(null);

  // 1. Завантаження послуг та команди
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const [srvRes, teamRes] = await Promise.all([
        supabase.from('services').select('*').order('id', { ascending: true }),
        supabase.from('team').select('*')
      ]);

      if (srvRes.data) {
        const grouped: Record<string, any[]> = {};
        srvRes.data.forEach(srv => {
          const catId = srv.cat_id;
          if (!grouped[catId]) grouped[catId] = [];
          const durationInfo = durationDB[srv.srv_id] || { duration: 60, durationText: '1 godz' };
          grouped[catId].push({
            id: srv.srv_id,
            name: srv.title,
            price: parsePrice(srv.price),
            priceText: srv.price, 
            duration: durationInfo.duration,
            durationText: durationInfo.durationText
          });
        });
        setServicesFromDB(grouped);
      }

      if (teamRes.data) setTeamFromDB(teamRes.data);
      setIsLoading(false);
    };
    fetchData();
  }, []); // Пустий масив залежностей для синглтона

  // 2. Отримання профілю юзера (лише коли модалка відкрита)
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isOpen) return;
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const meta = session.user.user_metadata;
        const sessionName = `${meta?.first_name || ''} ${meta?.last_name || ''}`.trim();
        const sessionPhone = session.user.phone || meta?.phone || '';

        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name, email, phone')
          .eq('id', session.user.id)
          .single();

        setUserProfile({
          name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : sessionName,
          email: profile?.email || session.user.email || '',
          phone: profile?.phone || sessionPhone
        });
      } else {
        setUserProfile(null);
      }
    };
    fetchUserProfile();
  }, [isOpen]);

  const handleClose = () => {
    document.body.style.overflow = 'unset';
    onClose();
    setTimeout(() => { 
      setStep(1); setSelectedCat(null); setSelectedServices([]); setSelectedMasterId(null); 
    }, 400);
  };

  const handleBack = () => {
    if (step === 1) return;
    if (step === 3 && selectedServices.length === 1) {
      setStep(1); setSelectedCat(null); setSelectedServices([]);
    } else {
      setStep(prev => prev - 1);
    }
  };

  useEffect(() => {
    const handlePrefill = (e: any) => {
      const { catId, srvId } = e.detail;
      setSelectedCat(catId);
      const service = servicesFromDB[catId]?.find(s => s.id === srvId);
      if (service) {
        setSelectedServices([service]);
        setStep(3);
      }
    };
    if (!isLoading) window.addEventListener('prefillBooking', handlePrefill);
    return () => window.removeEventListener('prefillBooking', handlePrefill);
  }, [isLoading, servicesFromDB]);

  useEffect(() => {
    const handleGlobalMessage = (event: MessageEvent) => {
      const isBookingSuccess = event.data?.type === "bookingSuccessful" || 
                               event.data?.type === "bookingConfirmed" || 
                               (event.data?.origin === "Cal" && event.data?.action === "bookingSuccessful");
      if (isBookingSuccess) {
        setTimeout(() => { handleClose(); window.location.reload(); }, 2000); 
      }
    };
    window.addEventListener("message", handleGlobalMessage);
    return () => window.removeEventListener("message", handleGlobalMessage);
  }, []);

  const toggleService = (service: any) => {
    if (selectedServices.find(s => s.id === service.id)) {
      setSelectedServices(selectedServices.filter(s => s.id !== service.id));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);

  const handleFinalBooking = async () => {
    const cal = await getCalApi({"namespace":"booking"});
    const master = teamFromDB.find(m => m.id === selectedMasterId);
    
    if (!master || !master.cal_slug) {
      alert("Profil tego specjalisty nie został jeszcze w pełni skonfigurowany.");
      return;
    }

    let eventSlug = "1h";
    if (totalDuration > 120) eventSlug = "3h";
    else if (totalDuration > 60) eventSlug = "2h";

    cal("ui", {
      theme: "dark",
      layout: "month_view",
      // @ts-ignore
      locale: "pl"
    });

    const params = new URLSearchParams();
    params.append("name", userProfile?.name || '');
    params.append("email", userProfile?.email || '');
    params.append("phone", userProfile?.phone || '');
    params.append("smsReminderNumber", userProfile?.phone || '');
    params.append("ui.locale", "pl");
    
    const finalCalLink = `${master.cal_slug}/${eventSlug}?${params.toString()}`;

    cal("modal", {
      calLink: finalCalLink,
      config: { 
        layout: "month_view", 
        theme: "dark",
        notes: `USŁUGI: ${selectedServices.map(s => s.name).join(", ")}. SUMA: ${totalPrice} zł.` 
      }
    });
  };

  const availableMasters = selectedCat 
    ? teamFromDB.filter(member => {
        const keyword = categoryKeywords[selectedCat];
        return member.role.toLowerCase().includes(keyword.toLowerCase());
      })
    : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 overflow-hidden text-white font-lato">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/95 backdrop-blur-md cursor-pointer" onClick={handleClose} />

          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="relative w-full max-w-3xl bg-[#0F0F0F] border border-foxy-accent/40 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh] z-[110]">
            
            <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-white/5 shrink-0">
              <div className="flex flex-col text-left">
                <h3 className="font-playfair text-xl font-bold uppercase tracking-wider">
                  {step === 1 && "Kategoria"}
                  {step === 2 && "Usługi"}
                  {step === 3 && "Specjalista"}
                </h3>
                {step > 1 && (
                  <button onClick={handleBack} className="text-foxy-accent text-xs uppercase font-bold tracking-widest flex items-center gap-1 mt-1 hover:brightness-125 transition-all w-fit py-1">← Powrót</button>
                )}
              </div>
              <button onClick={handleClose} className="text-white/40 hover:text-foxy-accent transition-colors text-4xl p-2 leading-none">&times;</button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar bg-[#0A0A0A] flex-grow">
              {isLoading && step > 1 && (
                <div className="text-center py-10 opacity-50 font-bold tracking-widest animate-pulse">ŁADOWANIE DANYCH...</div>
              )}

              {step === 1 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.map(cat => (
                    <button key={cat.id} disabled={cat.disabled} onClick={() => { setSelectedCat(cat.id); setStep(2); }} className={`flex flex-col items-center gap-3 p-4 sm:p-6 rounded-2xl border transition-all group ${cat.disabled ? 'border-white/5 bg-white/5 opacity-20 cursor-not-allowed' : 'border-white/10 bg-[#151515] hover:border-foxy-accent/60 hover:bg-foxy-accent/5'}`}>
                      <span className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                      <span className="font-bold text-[9px] font-montserrat uppercase tracking-[0.15em] text-center leading-tight">{cat.title}</span>
                    </button>
                  ))}
                </div>
              )}

              {step === 2 && selectedCat && !isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {servicesFromDB[selectedCat]?.map(service => {
                    const isSelected = selectedServices.some(s => s.id === service.id);
                    return (
                      <button key={service.id} onClick={() => toggleService(service)} className={`p-4 rounded-xl border flex justify-between items-start gap-3 transition-all text-left ${isSelected ? 'border-foxy-accent bg-foxy-accent/10 shadow-[0_0_15px_rgba(179,162,97,0.1)]' : 'border-white/5 bg-[#151515] hover:border-white/20'}`}>
                        <div className="flex gap-3">
                          <div className={`w-4 h-4 mt-1 shrink-0 rounded border flex items-center justify-center transition-all ${isSelected ? 'bg-foxy-accent border-foxy-accent' : 'border-white/20'}`}>
                            {isSelected && <svg className="text-black w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={5} d="M5 13l4 4L19 7"/></svg>}
                          </div>
                          <div>
                            <p className="font-bold text-[13px] leading-snug">{service.name}</p>
                            <p className="text-[9px] text-foxy-accent/60 uppercase font-bold tracking-widest mt-1">{service.durationText}</p>
                          </div>
                        </div>
                        <span className="font-bold text-foxy-accent text-sm whitespace-nowrap ml-1">{service.priceText}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {step === 3 && selectedCat && !isLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {availableMasters.map(master => (
                    <button key={master.id} onClick={() => setSelectedMasterId(master.id)} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${selectedMasterId === master.id ? 'border-foxy-accent bg-foxy-accent/10' : 'border-white/10 bg-[#151515]'}`}>
                      <img src={master.image_url} alt={master.name} className="w-14 h-14 rounded-full object-cover border border-foxy-accent/20" />
                      <div className="text-left">
                        <h4 className="font-bold text-sm">{master.name}</h4>
                        <p className="text-[9px] text-foxy-accent uppercase font-bold tracking-widest">{master.role}</p>
                      </div>
                    </button>
                  ))}
                  {availableMasters.length === 0 && <p className="col-span-2 text-center text-white/50 text-sm py-8 font-bold">Brak specjalistów dla tej usługi.</p>}
                </div>
              )}
            </div>

            {step > 1 && (
              <div className="p-5 border-t border-white/10 bg-[#0A0A0A] shrink-0">
                <div className="flex justify-between items-center mb-5 px-2">
                  <div className="text-left">
                    <p className="text-[9px] text-white/40 uppercase font-bold tracking-widest mb-1">Razem</p>
                    <p className="font-playfair italic">{selectedServices.length} pozycje</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-foxy-accent tracking-tighter">{totalPrice} zł</p>
                    <p className="text-[9px] text-white/40 font-bold uppercase tracking-tighter">~{formatDuration(totalDuration)}</p>
                  </div>
                </div>
                <button 
                  disabled={(step === 2 && selectedServices.length === 0) || (step === 3 && !selectedMasterId)} 
                  onClick={step === 2 ? () => setStep(3) : handleFinalBooking} 
                  className="w-full py-4 bg-foxy-accent text-black font-black uppercase tracking-[0.2em] rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-20 shadow-[0_0_20px_rgba(179,162,97,0.2)]"
                >
                  {step === 2 ? "Dalej" : "Wybierz termin"}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}