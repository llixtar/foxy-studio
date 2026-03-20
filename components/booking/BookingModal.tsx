"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCalApi } from "@calcom/embed-react";
import { supabase } from '@/lib/supabase'; // 👈 Додали імпорт Supabase

// --- ТИПІЗАЦІЯ ---
type Category = {
  id: string;
  title: string;
  icon: string;
  disabled?: boolean;
};

// Це залишаємо статичним (візуал категорій)
const categories: Category[] = [
  { id: 'manicure', title: 'Manicure', icon: '💅' },
  { id: 'pedicure', title: 'Pedicure', icon: '🦶' },
  { id: 'brwi', title: 'Stylizacja brwi', icon: '✨' },
  { id: 'rzesy_lami', title: 'Stylizacja rzęs', icon: '👁️' },
  { id: 'rzesy_ext', title: 'Przedłużanie rzęs', icon: '🦋' },
  { id: 'tatuaz', title: 'Tatuaż artystyczny', icon: '🖋️' }
];

// ЦЕ НАША БАЗА ТРИВАЛОСТІ (Тривалість залишаємо тут, бо в Supabase її немає)
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

// Дані про майстрів залишаємо статичними
const mastersDB: Record<string, string[]> = {
  'manicure': ['anzhela', 'iryna'],
  'pedicure': ['iryna'], 
  'brwi': ['tetiana'],
  'rzesy_lami': ['tetiana'],
  'rzesy_ext': ['iryna'], 
  'tatuaz': ['anzhela']
};

const teamProfiles: Record<string, any> = {
  'anzhela': { name: 'Anzhela', role: 'Właścicielka / Tatuaż / Mani', img: '/assets/team/anzhela.webp', calUser: 'foxy-anzhela-test' },
  'tetiana': { name: 'Tetiana', role: 'Stylizacja brwi i rzęs', img: '/assets/team/tetiana.JPG', calUser: 'tetiana-test' },
  'iryna': { name: 'Iryna', role: 'Mani & Pedi / Rzęsy', img: '/assets/team/iryna.JPG', calUser: 'iryna-test' },
};

const formatDuration = (minutes: number) => {
  if (minutes === 0) return "0 min";
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} godz ${m} min` : `${h} godz`;
};

// Хелпер для парсингу ціни (бо в базі вона "120 zł", а нам для математики треба 120)
const parsePrice = (priceStr: string): number => {
  const num = parseInt(priceStr.replace(/\D/g, ''));
  return isNaN(num) ? 0 : num;
};

export default function BookingModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<any[]>([]);
  const [selectedMasterId, setSelectedMasterId] = useState<string | null>(null);
  
  // 👈 НОВИЙ СТАН: ДИНАМІЧНІ ПОСЛУГИ З БАЗИ
  const [servicesFromDB, setServicesFromDB] = useState<Record<string, any[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Завантажуємо послуги, коли модалка відкривається (або одразу)
  useEffect(() => {
    const fetchServices = async () => {
      const { data } = await supabase.from('services').select('*').order('id', { ascending: true });
      if (data) {
        // Форматуємо дані так, як очікує модалка (групуємо по cat_id)
        const grouped: Record<string, any[]> = {};
        data.forEach(srv => {
          const catId = srv.cat_id;
          if (!grouped[catId]) grouped[catId] = [];
          
          // Підтягуємо тривалість з нашого локального словника, якщо є
          const durationInfo = durationDB[srv.srv_id] || { duration: 60, durationText: '1 godz' }; // дефолт
          
          grouped[catId].push({
            id: srv.srv_id,
            name: srv.title,
            price: parsePrice(srv.price), // Перетворюємо "120 zł" в 120
            priceText: srv.price,         // Зберігаємо оригінальний текст для відображення
            duration: durationInfo.duration,
            durationText: durationInfo.durationText
          });
        });
        setServicesFromDB(grouped);
      }
      setIsLoading(false);
    };
    fetchServices();
  }, []);

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

  // Слухач Deep Linking
  useEffect(() => {
    const handlePrefill = (e: any) => {
      const { catId, srvId } = e.detail;
      setSelectedCat(catId);
      // Змінено: шукаємо в новій змінній servicesFromDB
      const service = servicesFromDB[catId]?.find(s => s.id === srvId);
      if (service) {
        setSelectedServices([service]);
        setStep(3);
      }
    };
    
    // Щоб префілл спрацював, дані вже мають бути завантажені
    if (!isLoading) {
      window.addEventListener('prefillBooking', handlePrefill);
    }
    return () => window.removeEventListener('prefillBooking', handlePrefill);
  }, [isLoading, servicesFromDB]);

  // Фаталіті після успішного бронювання
  useEffect(() => {
    const handleGlobalMessage = (event: MessageEvent) => {
      const isBookingSuccess = event.data?.type === "bookingSuccessful" || event.data?.type === "bookingConfirmed" || (event.data?.origin === "Cal" && event.data?.action === "bookingSuccessful");
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
    const master = teamProfiles[selectedMasterId!];
    
    let eventSlug = "30min";
    if (master.calUser === 'foxy-anzhela-test') {
      if (totalDuration <= 60) eventSlug = "mani-1h";
      else if (totalDuration <= 120) eventSlug = "mani-2h";
      else eventSlug = "mani-3h";
    }

    cal("modal", {
      calLink: `${master.calUser}/${eventSlug}`,
      config: { layout: "month_view", theme: "dark", notes: `USŁUGI: ${selectedServices.map(s => s.name).join(", ")}. SUMA: ${totalPrice} zł.` }
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 overflow-hidden">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/95 backdrop-blur-md cursor-pointer" onClick={handleClose} />

          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="relative w-full max-w-3xl bg-[#0F0F0F] border border-foxy-accent/40 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh] z-[110]">
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-white/5 shrink-0">
              <div className="flex flex-col">
                <h3 className="font-playfair text-xl font-bold text-white uppercase tracking-wider">
                  {step === 1 && "Kategoria"}
                  {step === 2 && "Usługi"}
                  {step === 3 && "Specjalista"}
                </h3>
                {step > 1 && (
                  <button onClick={handleBack} className="text-foxy-accent text-xs uppercase font-bold tracking-widest flex items-center gap-1 mt-1 hover:brightness-125 transition-all w-fit py-1">← Powrót</button>
                )}
              </div>
              <button onClick={handleClose} className="text-white/40 hover:text-foxy-accent transition-colors text-4xl p-2 flex items-center justify-center leading-none" aria-label="Close">&times;</button>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar bg-[#0A0A0A] flex-grow">
              {isLoading && step === 2 && (
                <div className="text-center py-10 opacity-50 text-white font-bold tracking-widest animate-pulse">
                  ŁADOWANIE USŁUG...
                </div>
              )}

              {step === 1 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.map(cat => (
                    <button key={cat.id} disabled={cat.disabled} onClick={() => { setSelectedCat(cat.id); setStep(2); }} className={`flex flex-col items-center gap-3 p-4 sm:p-6 rounded-2xl border transition-all group ${cat.disabled ? 'border-white/5 bg-white/5 opacity-20 cursor-not-allowed' : 'border-white/10 bg-[#151515] hover:border-foxy-accent/60 hover:bg-foxy-accent/5'}`}>
                      <span className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                      <span className="font-bold text-[9px] text-white font-montserrat uppercase tracking-[0.15em] text-center leading-tight">{cat.title}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* ЗМІНЕНО: Рендеримо з servicesFromDB */}
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
                            <p className="font-bold text-white text-[13px] leading-snug">{service.name}</p>
                            <p className="text-[9px] text-foxy-accent/60 uppercase font-bold tracking-widest mt-1">{service.durationText}</p>
                          </div>
                        </div>
                        {/* ЗМІНЕНО: Використовуємо оригінальний текст ціни */}
                        <span className="font-bold text-foxy-accent text-sm whitespace-nowrap ml-1">{service.priceText}</span>
                      </button>
                    );
                  })}
                  {(!servicesFromDB[selectedCat] || servicesFromDB[selectedCat].length === 0) && (
                     <p className="col-span-2 text-center text-white/50 text-sm py-8">Brak usług w tej kategorii.</p>
                  )}
                </div>
              )}

              {step === 3 && selectedCat && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {mastersDB[selectedCat]?.map(masterId => {
                    const master = teamProfiles[masterId];
                    return (
                      <button key={masterId} onClick={() => setSelectedMasterId(masterId)} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${selectedMasterId === masterId ? 'border-foxy-accent bg-foxy-accent/10' : 'border-white/10 bg-[#151515]'}`}>
                        <img src={master.img} alt={master.name} className="w-14 h-14 rounded-full object-cover border border-foxy-accent/20" />
                        <div className="text-left">
                          <h4 className="font-bold text-white text-sm">{master.name}</h4>
                          <p className="text-[9px] text-foxy-accent uppercase font-bold tracking-widest">{master.role}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {step > 1 && (
              <div className="p-5 border-t border-white/10 bg-[#0A0A0A] shrink-0">
                <div className="flex justify-between items-center mb-5 px-2">
                  <div className="text-left">
                    <p className="text-[9px] text-white/40 uppercase font-bold tracking-widest mb-1">Razem</p>
                    <p className="text-white font-playfair italic">{selectedServices.length} pozycje</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-foxy-accent tracking-tighter">{totalPrice} zł</p>
                    <p className="text-[9px] text-white/40 font-bold uppercase tracking-tighter">~{formatDuration(totalDuration)}</p>
                  </div>
                </div>

                <button disabled={(step === 2 && selectedServices.length === 0) || (step === 3 && !selectedMasterId)} onClick={step === 2 ? () => setStep(3) : handleFinalBooking} className="w-full py-4 bg-foxy-accent text-black font-black uppercase tracking-[0.2em] rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-20 shadow-[0_0_20px_rgba(179,162,97,0.2)]">
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