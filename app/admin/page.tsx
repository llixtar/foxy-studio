"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Категорії для послуг (Ціни)
const CATEGORIES = [
  "Manicure / Pedicure",
  "Stylizacja brwi",
  "Stylizacja rzęs",
  "Przedłużanie rzęs",
  "Tatuaż artystyczny"
];

// Категорії спеціально для портфоліо
const GALLERY_CATEGORIES = [
  "Manicure/pedicure",
  "Stylizacja brwi i rzęs",
  "Przedłużanie rzęs",
  "Tatuaż artystyczny"
];

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const ADMIN_PASSWORD = "0000"; 

  const [activeTab, setActiveTab] = useState<'reviews' | 'prices' | 'team' | 'gallery'>('reviews');

  const [reviews, setReviews] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);

  // Стан для форм
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  const [teamName, setTeamName] = useState('');
  const [teamRole, setTeamRole] = useState('');
  const [teamDesc, setTeamDesc] = useState('');
  const [teamIsBoss, setTeamIsBoss] = useState(false);
  const [teamFile, setTeamFile] = useState<File | null>(null);

  const [galleryCategory, setGalleryCategory] = useState(GALLERY_CATEGORIES[0]);
  const [galleryFile, setGalleryFile] = useState<File | null>(null);

  const [status, setStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Пагінація
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;

  const [galleryPage, setGalleryPage] = useState(1);
  const galleryPerPage = 6; 
  const galleryTotalPages = Math.ceil(gallery.length / galleryPerPage);

  const fetchAllData = async () => {
    const [revRes, srvRes, promoRes, teamRes, galleryRes] = await Promise.all([
      supabase.from('reviews').select('*').order('created_at', { ascending: false }),
      supabase.from('services').select('*').order('id'),
      supabase.from('promotions').select('*'),
      supabase.from('team').select('*').order('is_boss', { ascending: false }),
      supabase.from('gallery').select('*').order('created_at', { ascending: false })
    ]);
    if (revRes.data) setReviews(revRes.data);
    if (srvRes.data) setServices(srvRes.data);
    if (promoRes.data) setPromotions(promoRes.data);
    if (teamRes.data) setTeam(teamRes.data);
    if (galleryRes.data) setGallery(galleryRes.data);
  };

  useEffect(() => {
    if (isAuthorized) fetchAllData();
  }, [isAuthorized]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) setIsAuthorized(true);
    else alert("Невірний пароль!");
  };

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
      fetchAllData();
    } catch (error: any) { setStatus('Помилка: ' + error.message); } finally { setIsUploading(false); }
  };

  const handleReviewDelete = async (id: number, imageUrl: string) => {
    if (!confirm('Видалити відгук?')) return;
    const fileName = imageUrl.split('/').pop();
    if(fileName) await supabase.storage.from('review-images').remove([fileName]);
    await supabase.from('reviews').delete().eq('id', id);
    fetchAllData();
  };

  const handleUpdatePrice = async (id: number, newPrice: string) => {
    await supabase.from('services').update({ price: newPrice }).eq('id', id);
    setServices(services.map(s => s.id === id ? { ...s, price: newPrice } : s));
  };

  const handleUpdatePromo = async (category: string, newText: string) => {
    if (newText.trim() === '') await supabase.from('promotions').delete().eq('category', category);
    else await supabase.from('promotions').upsert([{ category, text: newText }], { onConflict: 'category' });
    fetchAllData();
  };

  const handleTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamFile) return;
    try {
      setIsUploading(true);
      const fileExt = teamFile.name.split('.').pop();
      const fileName = `team-${Math.random()}-${Date.now()}.${fileExt}`;
      await supabase.storage.from('team-images').upload(fileName, teamFile);
      const { data: urlData } = supabase.storage.from('team-images').getPublicUrl(fileName);
      await supabase.from('team').insert([{ name: teamName, role: teamRole, desc: teamDesc, image_url: urlData.publicUrl, is_boss: teamIsBoss }]);
      setStatus('Працівника додано! 🚀');
      setTeamName(''); setTeamRole(''); setTeamDesc(''); setTeamIsBoss(false); setTeamFile(null);
      fetchAllData();
    } catch (error: any) { setStatus('Помилка: ' + error.message); } finally { setIsUploading(false); setTimeout(() => setStatus(''), 3000); }
  };

  const handleTeamDelete = async (id: number, imageUrl: string) => {
    if (!confirm('Видалити працівника?')) return;
    const fileName = imageUrl.split('/').pop();
    if(fileName && fileName.includes('team-')) await supabase.storage.from('team-images').remove([fileName]);
    await supabase.from('team').delete().eq('id', id);
    fetchAllData();
  };

  const handleTeamUpdate = async (id: number, field: string, value: string) => {
    await supabase.from('team').update({ [field]: value }).eq('id', id);
  };

  const handleGallerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryFile) return;
    try {
      setIsUploading(true);
      const fileExt = galleryFile.name.split('.').pop();
      const fileName = `work-${Math.random()}-${Date.now()}.${fileExt}`;
      await supabase.storage.from('gallery-images').upload(fileName, galleryFile);
      const { data: urlData } = supabase.storage.from('gallery-images').getPublicUrl(fileName);
      await supabase.from('gallery').insert([{ category: galleryCategory, image_url: urlData.publicUrl }]);
      setStatus('Роботу додано! 🚀');
      setGalleryFile(null);
      fetchAllData();
    } catch (error: any) { setStatus('Помилка: ' + error.message); } finally { setIsUploading(false); setTimeout(() => setStatus(''), 3000); }
  };

  const handleGalleryDelete = async (id: number, imageUrl: string) => {
    if (!confirm('Видалити фото?')) return;
    const fileName = imageUrl.split('/').pop();
    if(fileName) await supabase.storage.from('gallery-images').remove([fileName]);
    await supabase.from('gallery').delete().eq('id', id);
    fetchAllData();
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-foxy-bg p-4 text-black font-lato">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-[2.5rem] shadow-2xl w-full max-w-sm border border-gray-100">
          <h1 className="text-2xl font-bold mb-6 text-center">Foxy Admin 🦊</h1>
          <input type="password" placeholder="Пароль" className="w-full p-4 border rounded-2xl mb-4 outline-foxy-accent text-center tracking-widest" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="w-full bg-foxy-accent text-white py-4 rounded-2xl font-bold hover:brightness-105 transition-all uppercase">Увійти</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 text-black bg-gray-50 font-lato">
      <div className="max-w-5xl mx-auto animate-in fade-in">
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 gap-4">
           <h1 className="text-2xl font-black text-gray-800 tracking-tight uppercase">Admin Panel</h1>
           <div className="flex flex-wrap justify-center bg-gray-100 p-1 rounded-2xl w-full md:w-auto gap-1">
             <button onClick={() => setActiveTab('reviews')} className={`flex-1 md:flex-none px-4 py-2 rounded-xl font-bold text-xs md:text-sm transition-all ${activeTab === 'reviews' ? 'bg-white shadow-md text-foxy-accent' : 'text-gray-500 hover:text-black'}`}>Відгуки</button>
             <button onClick={() => setActiveTab('prices')} className={`flex-1 md:flex-none px-4 py-2 rounded-xl font-bold text-xs md:text-sm transition-all ${activeTab === 'prices' ? 'bg-white shadow-md text-foxy-accent' : 'text-gray-500 hover:text-black'}`}>Ціни</button>
             <button onClick={() => setActiveTab('team')} className={`flex-1 md:flex-none px-4 py-2 rounded-xl font-bold text-xs md:text-sm transition-all ${activeTab === 'team' ? 'bg-white shadow-md text-foxy-accent' : 'text-gray-500 hover:text-black'}`}>Команда</button>
             <button onClick={() => setActiveTab('gallery')} className={`flex-1 md:flex-none px-4 py-2 rounded-xl font-bold text-xs md:text-sm transition-all ${activeTab === 'gallery' ? 'bg-white shadow-md text-foxy-accent' : 'text-gray-500 hover:text-black'}`}>Галерея</button>
           </div>
           <button onClick={() => setIsAuthorized(false)} className="text-xs text-gray-400 font-bold uppercase tracking-widest">Вийти</button>
        </div>

        {activeTab === 'reviews' && (
          <div className="grid md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-fit">
              <h2 className="text-lg font-bold mb-5 flex items-center gap-2"><span>✨</span> Додати відгук</h2>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <input type="text" placeholder="Ім'я" value={name} onChange={(e) => setName(e.target.value)} className="w-full border p-4 rounded-2xl bg-gray-50 outline-foxy-accent" required />
                <textarea placeholder="Відгук..." value={text} onChange={(e) => setText(e.target.value)} className="w-full border p-4 rounded-2xl bg-gray-50 outline-foxy-accent" rows={3} required />
                <label className={`w-full py-4 px-6 flex justify-center gap-2 rounded-2xl font-bold border-2 border-dashed cursor-pointer ${file ? 'bg-foxy-accent/10 border-foxy-accent text-foxy-accent' : 'bg-gray-50 text-gray-400'}`}>
                  {file ? `Фото ✅` : `Обрати фото`}
                  <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="sr-only" required />
                </label>
                <button type="submit" disabled={isUploading || !file} className="w-full py-4 rounded-2xl font-bold text-white bg-foxy-accent">{isUploading ? 'Завантаження...' : 'Опублікувати'}</button>
              </form>
            </div>
            <div className="space-y-4">
              {reviews.slice((currentPage - 1) * reviewsPerPage, currentPage * reviewsPerPage).map((rev) => (
                <div key={rev.id} className="bg-white p-4 rounded-2xl shadow-sm flex gap-4 items-center border border-gray-50">
                  <img src={rev.image_url} className="w-16 h-16 rounded-2xl object-cover" alt="" />
                  <div className="flex-1 min-w-0"><p className="font-bold text-sm truncate">{rev.name}</p><p className="text-xs text-gray-500 line-clamp-1">{rev.text}</p></div>
                  <button onClick={() => handleReviewDelete(rev.id, rev.image_url)} className="p-3 text-gray-300 hover:text-red-500">🗑️</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'prices' && (
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
                        <input type="text" defaultValue={s.price} onBlur={(e) => handleUpdatePrice(s.id, e.target.value)} className="w-20 text-right bg-gray-50 outline-none font-black text-sm p-1.5 rounded-lg" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-auto bg-gray-50 p-4 rounded-2xl">
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Акція</label>
                    <input type="text" defaultValue={currentPromo} onBlur={(e) => handleUpdatePromo(cat, e.target.value)} className="w-full bg-white border border-gray-200 p-3 rounded-xl text-xs font-bold" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'team' && (
          <div className="grid md:grid-cols-12 gap-8 animate-in slide-in-from-bottom-4">
            <div className="md:col-span-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-fit">
              <h2 className="text-lg font-bold mb-5 flex items-center gap-2"><span>🦊</span> Новий майстер</h2>
              <form onSubmit={handleTeamSubmit} className="space-y-4">
                <input type="text" placeholder="Ім'я" value={teamName} onChange={(e) => setTeamName(e.target.value)} className="w-full border p-3 rounded-2xl bg-gray-50 outline-foxy-accent text-sm" required />
                <input type="text" placeholder="Посада" value={teamRole} onChange={(e) => setTeamRole(e.target.value)} className="w-full border p-3 rounded-2xl bg-gray-50 outline-foxy-accent text-sm" required />
                <textarea placeholder="Опис..." value={teamDesc} onChange={(e) => setTeamDesc(e.target.value)} className="w-full border p-3 rounded-2xl bg-gray-50 outline-foxy-accent text-sm" rows={4} required />
                <div className="flex items-center gap-3 p-3 border rounded-2xl bg-foxy-accent/5 border-foxy-accent/20">
                  <input type="checkbox" id="isBoss" checked={teamIsBoss} onChange={(e) => setTeamIsBoss(e.target.checked)} className="w-5 h-5 accent-foxy-accent" />
                  <label htmlFor="isBoss" className="text-sm font-bold cursor-pointer">Власниця (Босс)</label>
                </div>
                <label className={`w-full py-4 px-6 flex justify-center gap-2 rounded-2xl font-bold border-2 border-dashed cursor-pointer text-sm ${teamFile ? 'bg-foxy-accent/10 text-foxy-accent' : 'text-gray-400'}`}>
                  {teamFile ? `Фото ✅` : `Фото`}
                  <input type="file" accept="image/*" onChange={(e) => setTeamFile(e.target.files?.[0] || null)} className="sr-only" required />
                </label>
                <button type="submit" disabled={isUploading || !teamFile} className="w-full py-4 rounded-2xl font-bold text-white bg-foxy-accent">Додати</button>
              </form>
            </div>
            <div className="md:col-span-8 space-y-4">
              {team.map((member) => (
                <div key={member.id} className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4">
                  <div className="relative w-full sm:w-32 aspect-[4/5] shrink-0">
                    <img src={member.image_url} className="w-full h-full object-cover rounded-2xl" alt="" />
                    {member.is_boss && <span className="absolute top-2 left-2 bg-foxy-accent text-white text-[10px] font-black px-2 py-1 rounded-lg">Boss</span>}
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex justify-between">
                      <input type="text" defaultValue={member.name} onBlur={(e) => handleTeamUpdate(member.id, 'name', e.target.value)} className="font-playfair text-xl font-bold outline-none bg-transparent w-1/2" />
                      <button onClick={() => handleTeamDelete(member.id, member.image_url)} className="text-gray-300 hover:text-red-500 transition-all">🗑️ Видалити</button>
                    </div>
                    <input type="text" defaultValue={member.role} onBlur={(e) => handleTeamUpdate(member.id, 'role', e.target.value)} className="text-xs font-bold text-foxy-accent uppercase outline-none bg-transparent w-full" />
                    <textarea defaultValue={member.desc} onBlur={(e) => handleTeamUpdate(member.id, 'desc', e.target.value)} className="text-sm text-gray-600 outline-none bg-gray-50 p-2 rounded-xl w-full resize-none" rows={4} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="grid md:grid-cols-12 gap-8 animate-in slide-in-from-bottom-4">
            <div className="md:col-span-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-fit">
              <h2 className="text-lg font-bold mb-5 flex items-center gap-2"><span>📸</span> Додати в портфоліо</h2>
              <form onSubmit={handleGallerySubmit} className="space-y-4">
                <select value={galleryCategory} onChange={(e) => setGalleryCategory(e.target.value)} className="w-full border p-4 rounded-2xl bg-gray-50 outline-foxy-accent text-sm font-bold">
                  {GALLERY_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <label className={`w-full py-10 px-6 flex flex-col items-center justify-center gap-2 rounded-2xl font-bold border-2 border-dashed cursor-pointer text-sm transition-all ${galleryFile ? 'bg-foxy-accent/10 border-foxy-accent text-foxy-accent' : 'bg-gray-50 text-gray-400'}`}>
                  <span className="text-2xl mb-2">{galleryFile ? '✅' : '📥'}</span>
                  {galleryFile ? galleryFile.name : `Обрати фото роботи`}
                  <input type="file" accept="image/*" onChange={(e) => setGalleryFile(e.target.files?.[0] || null)} className="sr-only" required />
                </label>
                <button type="submit" disabled={isUploading || !galleryFile} className="w-full py-4 rounded-2xl font-bold text-white bg-foxy-accent">Завантажити</button>
              </form>
            </div>

            <div className="md:col-span-8">
              <h2 className="text-lg font-bold mb-4">Усі роботи ({gallery.length})</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {gallery.slice((galleryPage - 1) * galleryPerPage, galleryPage * galleryPerPage).map((item) => (
                  <div key={item.id} className="relative group rounded-2xl overflow-hidden aspect-[3/4] border border-gray-100 shadow-sm">
                    <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                      <span className="bg-white/90 text-black text-[9px] font-black uppercase px-2 py-1 rounded-lg w-fit text-center leading-tight">{item.category}</span>
                      <button onClick={() => handleGalleryDelete(item.id, item.image_url)} className="bg-red-500 text-white text-xs font-bold py-2 rounded-xl hover:bg-red-600 transition-colors w-full">Видалити</button>
                    </div>
                  </div>
                ))}
              </div>
              {galleryTotalPages > 1 && (
                <div className="flex justify-between items-center mt-6 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <button onClick={() => setGalleryPage(p => Math.max(1, p - 1))} disabled={galleryPage === 1} className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-sm font-bold rounded-xl disabled:opacity-30 transition-colors">←</button>
                  <span className="text-sm font-bold text-gray-500">{galleryPage} / {galleryTotalPages}</span>
                  <button onClick={() => setGalleryPage(p => Math.min(galleryTotalPages, p + 1))} disabled={galleryPage === galleryTotalPages} className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-sm font-bold rounded-xl disabled:opacity-30 transition-colors">→</button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}