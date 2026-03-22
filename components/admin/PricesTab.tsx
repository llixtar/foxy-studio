"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';

const CATEGORIES = ["Manicure / Pedicure", "Stylizacja brwi", "Stylizacja rzęs", "Przedłużanie rzęs", "Tatuaż artystyczny"];

export default function PricesTab() {
  const [services, setServices] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);

  const fetchData = async () => {
    const [srvRes, promoRes] = await Promise.all([
      supabase.from('services').select('*').order('id'),
      supabase.from('promotions').select('*')
    ]);
    if (srvRes.data) setServices(srvRes.data);
    if (promoRes.data) setPromotions(promoRes.data);
  };

  useEffect(() => { fetchData(); }, []);

  const handleUpdatePrice = async (id: number, newPrice: string) => {
    await supabase.from('services').update({ price: newPrice }).eq('id', id);
    setServices(services.map(s => s.id === id ? { ...s, price: newPrice } : s));
  };

  const handleUpdatePromo = async (category: string, newText: string) => {
    if (newText.trim() === '') await supabase.from('promotions').delete().eq('category', category);
    else await supabase.from('promotions').upsert([{ category, text: newText }], { onConflict: 'category' });
    fetchData();
  };

  return (
    <div className="grid md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4">
      {CATEGORIES.map(cat => {
        const catServices = services.filter(s => s.category === cat);
        const currentPromo = promotions.find(p => p.category === cat)?.text || '';
        return (
          <div key={cat} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
            <h3 className="text-sm font-black text-foxy-accent mb-6 uppercase tracking-widest">{cat}</h3>
            <div className="flex-1 space-y-4 mb-8">
              {catServices.map(s => (
                <div key={s.id} className="flex justify-between items-baseline gap-2">
                  <span className="text-sm font-medium text-gray-700 flex-1">{s.title}</span>
                  <div className="flex-grow border-b-2 border-dotted border-gray-200 mb-1 min-w-[15px]"></div>
                  <input type="text" defaultValue={s.price} onBlur={(e) => handleUpdatePrice(s.id, e.target.value)} className="w-20 text-right bg-gray-50 outline-none font-black text-sm p-1.5 rounded-lg border border-transparent focus:border-gray-200" />
                </div>
              ))}
            </div>
            <div className="mt-auto bg-gray-50 p-4 rounded-2xl">
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Акція</label>
              <input type="text" defaultValue={currentPromo} onBlur={(e) => handleUpdatePromo(cat, e.target.value)} className="w-full bg-white border border-gray-200 p-3 rounded-xl text-xs font-bold outline-none focus:border-foxy-accent" />
            </div>
          </div>
        );
      })}
    </div>
  );
}