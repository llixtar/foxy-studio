"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCalApi } from "@calcom/embed-react";

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
  { id: 'rzesy_lami', title: 'Stylizacja rzęs', icon: '👁️' },
  { id: 'rzesy_ext', title: 'Przedłużanie rzęs', icon: '🦋' },
  { id: 'tatuaz', title: 'Tatuaż artystyczny', icon: '🖋️' }
];

const servicesDB: Record<string, any[]> = {
  'manicure': [
    { id: 'm1', name: 'Manicure klasyczny', price: 80, duration: 30, durationText: '30 min' },
    { id: 'm2', name: 'Ściągnięcie hybrydy/żelu + manicure klasyczny', price: 90, duration: 60, durationText: '1 godz' },
    { id: 'm3', name: 'Manicure hybrydowy', price: 140, duration: 120, durationText: '1,5 - 2 godz' },
    { id: 'm4', name: 'Uzupełnienie paznokci (krótkie)', price: 140, duration: 120, durationText: '2 godz' },
    { id: 'm5', name: 'Uzupełnienie paznokci (średnie)', price: 150, duration: 150, durationText: '2 - 2,5 godz' },
    { id: 'm6', name: 'Uzupełnienie paznokci (długie)', price: 160, duration: 150, durationText: '2 - 2,5 godz' },
    { id: 'm7', name: 'Przedłużanie paznokci (krótkie)', price: 170, duration: 180, durationText: '2,5 - 3 godz' },
    { id: 'm8', name: 'Przedłużanie paznokci (średnie)', price: 190, duration: 180, durationText: '2,5 - 3 godz' },
    { id: 'm9', name: 'Przedłużanie paznokci (długie)', price: 200, duration: 210, durationText: '2,5 - 3,5 godz' },
  ],
  'pedicure': [
    { id: 'p1', name: 'Pedicure bez malowania', price: 100, duration: 60, durationText: '1 godz' },
    { id: 'p2', name: 'Pedicure z hybrydą', price: 130, duration: 90, durationText: '1,5 godz' },
  ],
  'brwi': [
    { id: 'b1', name: 'Regulacja woskiem/pęsetą', price: 50, duration: 30, durationText: '30 min' },
    { id: 'b2', name: 'Laminacja brwi', price: 80, duration: 30, durationText: '30 min' },
    { id: 'b3', name: 'Koloryzacja brwi z regulacją i geometrią', price: 90, duration: 50, durationText: '50 min' },
    { id: 'b4', name: 'Rozjaśnienie brwi + Koloryzacja + Regulacja', price: 100, duration: 75, durationText: '1 godz 15 min' },
    { id: 'b5', name: 'Laminacja brwi + regulacja + farbka', price: 120, duration: 75, durationText: '1 godz 15 min' },
  ],
  'rzesy_lami': [
    { id: 'rl1', name: 'Koloryzacja rzęs', price: 50, duration: 30, durationText: '30 min' },
    { id: 'rl2', name: 'Laminacja rzęs z koloryzacją', price: 120, duration: 90, durationText: '1,5 godz' },
    { id: 'rl3', name: 'Laminacja rzęs z koloryzacją + regeneracja botoksem', price: 140, duration: 90, durationText: '1,5 godz' },
  ],
  'rzesy_ext': [
    { id: 're1', name: 'Ściągnięcie rzęs', price: 40, duration: 30, durationText: '30 min' },
    { id: 're2', name: 'Założenie rzęs 1-2D', price: 130, duration: 120, durationText: '2 godz' },
    { id: 're3', name: 'Założenie rzęs 3D', price: 140, duration: 120, durationText: '2 godz' },
    { id: 're4', name: 'Założenie rzęs 4-5D', price: 150, duration: 120, durationText: '2 godz' },
    { id: 're5', name: 'Założenie rzęs 6D+ (Mega Volume)', price: 160, duration: 120, durationText: '2 godz' },
  ],
  'tatuaz': [
    { id: 't1', name: 'Konsultacja', price: 0, duration: 60, durationText: '30 min - 1 godz' },
    { id: 't2', name: 'Tatuaż minimalistyczny 5-7cm', price: 200, duration: 120, durationText: '1,5 - 2 godz' },
    { id: 't3', name: 'Tatuaż średni 10-20cm', price: 350, duration: 180, durationText: '2 - 3 godz' },
    { id: 't4', name: 'Tatuaż від 25cm', price: 600, duration: 240, durationText: 'od 4 godz' },
  ]
};

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

export default function BookingModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<any[]>([]);
  const [selectedMasterId, setSelectedMasterId] = useState<string | null>(null);

  const handleClose = () => {
    document.body.style.overflow = 'unset';
    onClose();
    // Скидаємо стан після того, як анімація закриття завершиться
    setTimeout(() => { 
      setStep(1); setSelectedCat(null); setSelectedServices([]); setSelectedMasterId(null); 
    }, 400);
  };

  const handleBack = () => {
    if (step === 1) return;
    if (step === 3 && selectedServices.length === 1) {
      setStep(1);
      setSelectedCat(null);
      setSelectedServices([]);
    } else {
      setStep(prev => prev - 1);
    }
  };

  // Слухач Deep Linking
  useEffect(() => {
    const handlePrefill = (e: any) => {
      const { catId, srvId } = e.detail;
      setSelectedCat(catId);
      const service = servicesDB[catId]?.find(s => s.id === srvId);
      if (service) {
        setSelectedServices([service]);
        setStep(3);
      }
    };
    window.addEventListener('prefillBooking', handlePrefill);
    return () => window.removeEventListener('prefillBooking', handlePrefill);
  }, []);

  // Фаталіті після успішного бронювання
  useEffect(() => {
    const handleGlobalMessage = (event: MessageEvent) => {
      const isBookingSuccess = 
        event.data?.type === "bookingSuccessful" || 
        event.data?.type === "bookingConfirmed" ||
        (event.data?.origin === "Cal" && event.data?.action === "bookingSuccessful");

      if (isBookingSuccess) {
        setTimeout(() => {
          handleClose();
          window.location.reload();
        }, 2000); 
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
    
    // РИБА: slug для Cal.com
    let eventSlug = "30min";
    if (master.calUser === 'foxy-anzhela-test') {
      if (totalDuration <= 60) eventSlug = "mani-1h";
      else if (totalDuration <= 120) eventSlug = "mani-2h";
      else eventSlug = "mani-3h";
    }

    cal("modal", {
      calLink: `${master.calUser}/${eventSlug}`,
      config: { 
        layout: "month_view", 
        theme: "dark", 
        notes: `USŁUGI: ${selectedServices.map(s => s.name).join(", ")}. SUMA: ${totalPrice} zł.` 
      }
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 overflow-hidden">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0 bg-black/95 backdrop-blur-md cursor-pointer" 
            onClick={handleClose} 
          />

          {/* Modal Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()} // ЗАБОРОНЯЄМО ЗАКРИТТЯ ПРИ КЛІКУ НА МОДАЛКУ
            className="relative w-full max-w-3xl bg-[#0F0F0F] border border-foxy-accent/40 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh] z-[110]"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-white/5 shrink-0">
              <div className="flex flex-col">
                <h3 className="font-playfair text-xl font-bold text-white uppercase tracking-wider">
                  {step === 1 && "Kategoria"}
                  {step === 2 && "Usługi"}
                  {step === 3 && "Specjalista"}
                </h3>
                {step > 1 && (
                  <button 
                    onClick={handleBack}
                    className="text-foxy-accent text-xs uppercase font-bold tracking-widest flex items-center gap-1 mt-1 hover:brightness-125 transition-all w-fit py-1"
                  >
                    ← Powrót
                  </button>
                )}
              </div>
              <button 
                onClick={handleClose} 
                className="text-white/40 hover:text-foxy-accent transition-colors text-4xl p-2 flex items-center justify-center leading-none"
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar bg-[#0A0A0A] flex-grow">
              {step === 1 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.map(cat => (
                    <button 
                      key={cat.id} 
                      disabled={cat.disabled}
                      onClick={() => { setSelectedCat(cat.id); setStep(2); }}
                      className={`flex flex-col items-center gap-3 p-4 sm:p-6 rounded-2xl border transition-all group
                        ${cat.disabled ? 'border-white/5 bg-white/5 opacity-20 cursor-not-allowed' : 'border-white/10 bg-[#151515] hover:border-foxy-accent/60 hover:bg-foxy-accent/5'}`}
                    >
                      <span className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                      <span className="font-bold text-[9px] text-white font-montserrat uppercase tracking-[0.15em] text-center leading-tight">{cat.title}</span>
                    </button>
                  ))}
                </div>
              )}

              {step === 2 && selectedCat && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {servicesDB[selectedCat]?.map(service => {
                    const isSelected = selectedServices.some(s => s.id === service.id);
                    return (
                      <button 
                        key={service.id} 
                        onClick={() => toggleService(service)}
                        className={`p-4 rounded-xl border flex justify-between items-start gap-3 transition-all ${
                          isSelected ? 'border-foxy-accent bg-foxy-accent/10 shadow-[0_0_15px_rgba(179,162,97,0.1)]' : 'border-white/5 bg-[#151515] hover:border-white/20'
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className={`w-4 h-4 mt-1 shrink-0 rounded border flex items-center justify-center transition-all ${isSelected ? 'bg-foxy-accent border-foxy-accent' : 'border-white/20'}`}>
                            {isSelected && <svg className="text-black w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={5} d="M5 13l4 4L19 7"/></svg>}
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-white text-[13px] leading-snug">{service.name}</p>
                            <p className="text-[9px] text-foxy-accent/60 uppercase font-bold tracking-widest mt-1">{service.durationText}</p>
                          </div>
                        </div>
                        <span className="font-bold text-foxy-accent text-sm whitespace-nowrap ml-1">{service.price} zł</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {step === 3 && selectedCat && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {mastersDB[selectedCat]?.map(masterId => {
                    const master = teamProfiles[masterId];
                    return (
                      <button 
                        key={masterId} 
                        onClick={() => setSelectedMasterId(masterId)}
                        className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${selectedMasterId === masterId ? 'border-foxy-accent bg-foxy-accent/10' : 'border-white/10 bg-[#151515]'}`}
                      >
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