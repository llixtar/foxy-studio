"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';

export default function ReviewsTab() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;

  const fetchReviews = async () => {
    const { data } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
    if (data) setReviews(data);
  };

  useEffect(() => { fetchReviews(); }, []);

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
    } catch (error: any) { setStatus('Помилка: ' + error.message); } 
    finally { setIsUploading(false); setTimeout(() => setStatus(''), 3000); }
  };

  const handleReviewDelete = async (id: number, imageUrl: string) => {
    if (!confirm('Видалити відгук?')) return;
    const fileName = imageUrl.split('/').pop();
    if(fileName) await supabase.storage.from('review-images').remove([fileName]);
    await supabase.from('reviews').delete().eq('id', id);
    fetchReviews();
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-fit">
        <h2 className="text-lg font-bold mb-5 flex items-center gap-2"><span>✨</span> Додати відгук</h2>
        {status && <div className="mb-4 text-sm font-bold text-foxy-accent">{status}</div>}
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
            <img src={rev.image_url} className="w-16 h-16 rounded-2xl object-cover shrink-0" alt="" />
            <div className="flex-1 min-w-0"><p className="font-bold text-sm truncate">{rev.name}</p><p className="text-xs text-gray-500 line-clamp-2">{rev.text}</p></div>
            <button onClick={() => handleReviewDelete(rev.id, rev.image_url)} className="p-3 text-gray-300 hover:text-red-500">🗑️</button>
          </div>
        ))}
        {/* Можна додати кнопки пагінації тут, якщо відгуків багато */}
      </div>
    </div>
  );
}