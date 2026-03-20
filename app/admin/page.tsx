"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  // Дані та стани
  const [reviews, setReviews] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null); // Стан для обраного файлу
  const [status, setStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // ПАГІНАЦІЯ
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;

  const ADMIN_PASSWORD = "0000"; 

  const fetchReviews = async () => {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setReviews(data);
  };

  useEffect(() => {
    if (isAuthorized) fetchReviews();
  }, [isAuthorized]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) setIsAuthorized(true);
    else alert("Невірний пароль!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return; // Це зайве, бо кнопка вже disabled, але для безпеки
    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
      await supabase.storage.from('review-images').upload(fileName, file);
      const { data: urlData } = supabase.storage.from('review-images').getPublicUrl(fileName);
      
      await supabase.from('reviews').insert([{ name, text, image_url: urlData.publicUrl }]);
      
      setStatus('Додано! 🚀');
      setName(''); setText(''); setFile(null); // Очищаємо стан файлу
      const fileInput = document.getElementById('fileInput') as HTMLInputElement;
      if (fileInput) fileInput.value = ''; // Очищаємо інпут візуально
      fetchReviews();
    } catch (error: any) {
      setStatus('Помилка: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  // ФУНКЦІЯ ПОВНОГО ВИДАЛЕННЯ (БАЗА + STORAGE)
  const handleDelete = async (id: number, imageUrl: string) => {
    if (!confirm('Точно видаляємо відгук і фото?')) return;

    try {
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      await supabase.storage.from('review-images').remove([fileName]);

      const { error } = await supabase.from('reviews').delete().eq('id', id);
      
      if (error) throw error;
      
      setReviews(reviews.filter(r => r.id !== id));
      if ((reviews.length - 1) <= (currentPage - 1) * reviewsPerPage && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error: any) {
      alert('Помилка: ' + error.message);
    }
  };

  // РОЗРАХУНОК ПАГІНАЦІЇ
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-foxy-bg p-4 text-black">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm">
          <h1 className="text-2xl font-bold mb-6">Foxy Admin 🦊</h1>
          <input type="password" placeholder="Пароль" className="w-full p-3 border rounded-xl mb-4 text-black outline-foxy-accent" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="w-full bg-foxy-accent text-white py-3 rounded-xl font-bold">Увійти</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 text-black bg-gray-50">
      <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
        <div className="flex justify-between items-center mb-8 bg-white p-4 md:p-6 rounded-2xl shadow border border-gray-100">
           <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">Керування відгуками</h1>
           <div className='flex gap-2 items-center'>
             <span className='text-xs text-foxy-accent/50 font-bold'>ONLINE</span>
             <button onClick={() => setIsAuthorized(false)} className="bg-gray-200 px-4 py-2 rounded-lg text-sm hover:bg-gray-300 transition-colors">Вийти</button>
           </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* ФОРМА ДОДАВАННЯ */}
          <div className="bg-white p-6 rounded-2xl shadow-xl h-fit border border-gray-100">
            <h2 className="text-xl font-bold mb-5 text-black">Додати відгук</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <input type="text" placeholder="Ім'я клієнтки" value={name} onChange={(e) => setName(e.target.value)} className="w-full border p-3 rounded-xl text-black" required />
              <textarea placeholder="Що каже клієнт..." value={text} onChange={(e) => setText(e.target.value)} className="w-full border p-3 rounded-xl text-black" rows={3} required />
              
              {/* === ОНОВЛЕНИЙ БЛОК ВИБОРУ ФАЙЛУ === */}
              <div>
                <label className="sr-only">Обери фото</label> {/* Для доступності */}
                <label 
                  htmlFor="fileInput" 
                  className={`w-full py-3 px-6 flex items-center justify-center gap-2 rounded-xl font-bold transition-all border-2 ${
                    file 
                      ? 'bg-foxy-accent text-white border-foxy-accent' // Файл вибрано (зелений)
                      : 'bg-white text-foxy-accent border-foxy-accent hover:bg-foxy-accent/10' // Файл НЕ вибрано (білий з обідком)
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {file ? `Фото обрано ✅` : `Обрати фото`}
                </label>
                
                {/* Показуємо ім'я файлу, якщо він є */}
                {file && (
                   <p className="text-xs text-center text-gray-500 mt-2 truncate max-w-full">
                     Вибрано: {file.name}
                   </p>
                )}

                {/* Прихований стандартний інпут */}
                <input 
                  id="fileInput" 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setFile(e.target.files?.[0] || null)} 
                  className="sr-only" // Приховуємо візуально
                  required 
                />
              </div>
              {/* ========================================= */}

              {/* === ОНОВЛЕНА КНОПКА ДОДАТИ === */}
              <button 
                type="submit"
                disabled={isUploading || !file} // Неактивна, якщо вантажиться АБО немає файлу
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all ${
                  (isUploading || !file) 
                    ? 'bg-gray-400 cursor-not-allowed opacity-80' // Неактивний стан (сіра)
                    : 'bg-foxy-accent hover:scale-[1.02] active:scale-[0.98]' // Активний стан (жовта)
                }`}
              >
                {isUploading ? 'Завантаження...' : 'Опублікувати відгук'}
              </button>
              {/* ============================= */}
            </form>
            {status && <p className={`mt-5 text-center text-sm font-bold ${status.includes('Помилка') ? 'text-red-600' : 'text-green-600'}`}>{status}</p>}
          </div>

          {/* СПИСОК ВІДГУКІВ */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4 text-black">Список ({reviews.length})</h2>
            {reviews.length === 0 && (
              <div className="bg-white p-6 rounded-xl shadow border border-gray-100 text-center text-gray-500">Відгуків ще немає...</div>
            )}
            {currentReviews.map((rev) => (
              <div key={rev.id} className="bg-white p-4 md:p-5 rounded-xl shadow flex gap-4 md:gap-5 items-center animate-in fade-in duration-500 border border-gray-100 hover:border-foxy-accent/20 transition-colors">
                <img src={rev.image_url} className="w-14 h-14 md:w-16 md:h-16 rounded-xl object-cover" alt="" />
                <div className="flex-1">
                  <p className="font-bold text-sm md:text-base tracking-tight">{rev.name}</p>
                  <p className="text-[11px] md:text-xs text-gray-500 line-clamp-1">{rev.text}</p>
                </div>
                <button onClick={() => handleDelete(rev.id, rev.image_url)} className="p-2 md:p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}

            {/* ПЕРЕМИКАЧ СТОРІНОК */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8 bg-white p-3 rounded-full shadow border border-gray-100">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="px-5 py-2.5 bg-gray-50 rounded-full shadow-sm disabled:opacity-30 text-sm font-bold text-foxy-accent hover:bg-foxy-accent/5"
                >
                  ← Попередня
                </button>
                <span className="text-sm font-medium">Стор. {currentPage} з {totalPages}</span>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="px-5 py-2.5 bg-gray-50 rounded-full shadow-sm disabled:opacity-30 text-sm font-bold text-foxy-accent hover:bg-foxy-accent/5"
                >
                  Наступна →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}