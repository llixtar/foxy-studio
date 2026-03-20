"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const CATEGORIES = [
  "Manicure / Pedicure",
  "Stylizacja brwi",
  "Stylizacja rzęs",
  "Przedłużanie rzęs",
  "Tatuaż artystyczny"
];

export default function AdminPage() {
  // === АВТОРИЗАЦІЯ ===
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const ADMIN_PASSWORD = "0000"; 

  // === ТАБИ ===
  const [activeTab, setActiveTab] = useState<'reviews' | 'prices'>('reviews');

  // === СТАНИ ДЛЯ ВІДГУКІВ ===
  const [reviews, setReviews] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;

  // === СТАНИ ДЛЯ ПРАЙСУ ===
  const [services, setServices] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);

  // === ОБЧИСЛЕННЯ (Fix: totalPages) ===
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  // === ЗАВАНТАЖЕННЯ ДАНИХ ===
  const fetchReviews = async () => {
    const { data } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
    if (data) setReviews(data);
  };

  const fetchPricesData = async () => {
    const [srvRes, promoRes] = await Promise.all([
      supabase.from('services').select('*').order('id'),
      supabase.from('promotions').select('*')
    ]);
    if (srvRes.data) setServices(srvRes.data);
    if (promoRes.data) setPromotions(promoRes.data);
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchReviews();
      fetchPricesData();
    }
  }, [isAuthorized]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) setIsAuthorized(true);
    else alert("Невірний пароль!");
  };

  // === ЛОГІКА ВІДГУКІВ ===
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
      await supabase.storage.from('review-images').upload(fileName, file);
      const { data: urlData } = supabase.storage.from('review-images').getPublicUrl(fileName);
      
      await supabase.from('reviews').insert([{ name, text, image_url: urlData.publicUrl }]);
      
      setStatus('Додано! 🚀');
      setName(''); setText(''); setFile(null);
      fetchReviews();
    } catch (error: any) {
      setStatus('Помилка: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleReviewDelete = async (id: number, imageUrl: string) => {
    if (!confirm('Точно видаляємо відгук?')) return;
    try {
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      await supabase.storage.from('review-images').remove([fileName]);
      await supabase.from('reviews').delete().eq('id', id);
      
      const newReviews = reviews.filter(r => r.id !== id);
      setReviews(newReviews);
      if ((newReviews.length) <= (currentPage - 1) * reviewsPerPage && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
    } catch (error: any) {
      alert('Помилка: ' + error.message);
    }
  };

  // === ЛОГІКА ПРАЙСУ ===
  const handleUpdatePrice = async (id: number, newPrice: string) => {
    await supabase.from('services').update({ price: newPrice }).eq('id', id);
    setServices(services.map(s => s.id === id ? { ...s, price: newPrice } : s));
  };

  const handleUpdatePromo = async (category: string, newText: string) => {
    if (newText.trim() === '') {
      await supabase.from('promotions').delete().eq('category', category);
    } else {
      await supabase.from('promotions').upsert([{ category, text: newText }], { onConflict: 'category' });
    }
    fetchPricesData();
  };


  // === РЕНДЕР АВТОРИЗАЦІЇ ===
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-foxy-bg p-4 text-black">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-[2rem] shadow-2xl w-full max-w-sm border border-gray-100">
          <h1 className="text-2xl font-bold mb-6 text-center">Foxy Admin 🦊</h1>
          <input type="password" placeholder="Пароль" className="w-full p-4 border rounded-2xl mb-4 outline-foxy-accent text-center tracking-widest" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="w-full bg-foxy-accent text-white py-4 rounded-2xl font-bold hover:brightness-105 transition-all uppercase">Увійти</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 text-black bg-gray-50">
      <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
        
        {/* ХЕДЕР АДМІНКИ */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 gap-4">
           <h1 className="text-2xl font-black text-gray-800 tracking-tight uppercase">Admin Panel</h1>
           
           <div className="flex bg-gray-100 p-1 rounded-2xl w-full md:w-auto">
             <button 
               onClick={() => setActiveTab('reviews')}
               className={`flex-1 md:flex-none px-8 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'reviews' ? 'bg-white shadow-md text-foxy-accent' : 'text-gray-500 hover:text-black'}`}
             >
               Відгуки
             </button>
             <button 
               onClick={() => setActiveTab('prices')}
               className={`flex-1 md:flex-none px-8 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'prices' ? 'bg-white shadow-md text-foxy-accent' : 'text-gray-500 hover:text-black'}`}
             >
               Ціни
             </button>
           </div>

           <button onClick={() => setIsAuthorized(false)} className="text-xs text-gray-400 hover:text-red-500 font-bold uppercase tracking-widest">Вийти</button>
        </div>

        {/* ТАБ 1: ВІДГУКИ */}
        {activeTab === 'reviews' && (
          <div className="grid md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-fit">
              <h2 className="text-lg font-bold mb-5 flex items-center gap-2"><span>✨</span> Додати відгук</h2>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <input type="text" placeholder="Ім'я клієнта" value={name} onChange={(e) => setName(e.target.value)} className="w-full border p-4 rounded-2xl bg-gray-50 outline-foxy-accent" required />
                <textarea placeholder="Текст відгугу:" value={text} onChange={(e) => setText(e.target.value)} className="w-full border p-4 rounded-2xl bg-gray-50 outline-foxy-accent" rows={3} required />
                
                <div>
                  <label htmlFor="fileInput" className={`w-full py-4 px-6 flex justify-center gap-2 rounded-2xl font-bold transition-all border-2 border-dashed cursor-pointer ${file ? 'bg-foxy-accent/10 border-foxy-accent text-foxy-accent' : 'bg-gray-50 border-gray-200 text-gray-400 hover:border-foxy-accent/50'}`}>
                    {file ? `Фото вибрано ✅` : `Натисніть, щоб вибрати фото`}
                  </label>
                  <input id="fileInput" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="sr-only" required />
                </div>

                <button type="submit" disabled={isUploading || !file} className={`w-full py-4 rounded-2xl font-bold text-white transition-all shadow-lg ${isUploading || !file ? 'bg-gray-300' : 'bg-foxy-accent hover:scale-[1.01]'}`}>
                  {isUploading ? 'Завантаження...' : 'Опублікувати відгук'}
                </button>
              </form>
              {status && <p className="mt-4 text-center text-xs font-bold text-foxy-accent">{status}</p>}
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-bold mb-4">Всі відгуки ({reviews.length})</h2>
              {reviews.slice((currentPage - 1) * reviewsPerPage, currentPage * reviewsPerPage).map((rev) => (
                <div key={rev.id} className="bg-white p-4 rounded-2xl shadow-sm flex gap-4 items-center border border-gray-50">
                  <img src={rev.image_url} className="w-16 h-16 rounded-2xl object-cover shadow-sm" alt="" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{rev.name}</p>
                    <p className="text-xs text-gray-500 line-clamp-1">{rev.text}</p>
                  </div>
                  <button onClick={() => handleReviewDelete(rev.id, rev.image_url)} className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">🗑️</button>
                </div>
              ))}
              
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 w-fit mx-auto">
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-4 py-2 bg-gray-50 rounded-xl disabled:opacity-30 text-xs font-bold">←</button>
                  <span className="text-xs font-bold">{currentPage} / {totalPages}</span>
                  <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-4 py-2 bg-gray-50 rounded-xl disabled:opacity-30 text-xs font-bold">→</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ТАБ 2: ПРАЙС-ЛИСТ */}
        {activeTab === 'prices' && (
          <div className="grid md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4">
            {CATEGORIES.map(cat => {
              const catServices = services.filter(s => s.category === cat);
              const currentPromo = promotions.find(p => p.category === cat)?.text || '';

              return (
                <div key={cat} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
                  <h3 className="text-sm font-black text-foxy-accent mb-6 uppercase tracking-[0.2em] flex items-center gap-2">
                    <span className="w-2 h-2 bg-foxy-accent rounded-full"></span> {cat}
                  </h3>
                  
                  <div className="flex-1 space-y-3 mb-8">
                    {catServices.map(s => (
                      <div key={s.id} className="flex justify-between items-center group">
                        <span className="text-sm font-medium text-gray-600 w-2/3 truncate" title={s.title}>{s.title}</span>
                        <input 
                          type="text" 
                          defaultValue={s.price} 
                          onBlur={(e) => handleUpdatePrice(s.id, e.target.value)}
                          className="w-24 border-b-2 border-transparent focus:border-foxy-accent outline-none font-black text-sm text-right bg-gray-50 p-1.5 rounded-lg transition-all"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Акція для розділу</label>
                    <input 
                      type="text"
                      defaultValue={currentPromo}
                      placeholder="Напр. MANICURE + PEDICURE = 230 zł"
                      onBlur={(e) => handleUpdatePromo(cat, e.target.value)}
                      className="w-full bg-white border border-gray-200 p-3 rounded-xl text-xs font-bold text-foxy-text outline-none focus:ring-2 focus:ring-foxy-accent/20"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}