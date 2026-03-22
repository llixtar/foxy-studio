"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';

const GALLERY_CATEGORIES = ["Manicure/pedicure", "Stylizacja brwi i rzęs", "Przedłużanie rzęs", "Tatuaż artystyczny"];

export default function GalleryTab() {
  const [gallery, setGallery] = useState<any[]>([]);
  const [galleryCategory, setGalleryCategory] = useState(GALLERY_CATEGORIES[0]);
  const [galleryFile, setGalleryFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState('');
  const [galleryPage, setGalleryPage] = useState(1);
  const galleryPerPage = 6; 
  const galleryTotalPages = Math.ceil(gallery.length / galleryPerPage);

  const fetchGallery = async () => {
    const { data } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
    if (data) setGallery(data);
  };

  useEffect(() => { fetchGallery(); }, []);

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
      fetchGallery();
    } catch (error: any) { setStatus('Помилка: ' + error.message); } 
    finally { setIsUploading(false); setTimeout(() => setStatus(''), 3000); }
  };

  const handleGalleryDelete = async (id: number, imageUrl: string) => {
    if (!confirm('Видалити фото?')) return;
    const fileName = imageUrl.split('/').pop();
    if(fileName) await supabase.storage.from('gallery-images').remove([fileName]);
    await supabase.from('gallery').delete().eq('id', id);
    fetchGallery();
  };

  return (
    <div className="grid md:grid-cols-12 gap-8 animate-in slide-in-from-bottom-4">
      <div className="md:col-span-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-fit">
        <h2 className="text-lg font-bold mb-5 flex items-center gap-2"><span>📸</span> Додати в портфоліо</h2>
        {status && <div className="mb-4 text-sm font-bold text-foxy-accent">{status}</div>}
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
            <button onClick={() => setGalleryPage(p => Math.max(1, p - 1))} disabled={galleryPage === 1} className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-sm font-bold rounded-xl disabled:opacity-30">←</button>
            <span className="text-sm font-bold text-gray-500">{galleryPage} / {galleryTotalPages}</span>
            <button onClick={() => setGalleryPage(p => Math.min(galleryTotalPages, p + 1))} disabled={galleryPage === galleryTotalPages} className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-sm font-bold rounded-xl disabled:opacity-30">→</button>
          </div>
        )}
      </div>
    </div>
  );
}