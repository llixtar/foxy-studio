"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';

// Імпортуємо наші компоненти
import ReviewsTab from '@/components/admin/ReviewsTab';
import PricesTab from '@/components/admin/PricesTab';
import TeamTab from '@/components/admin/TeamTab';
import GalleryTab from '@/components/admin/GalleryTab';
import UsersTab from '@/components/admin/UsersTab';

export default function AdminPage() {
  const router = useRouter();

  // Стан авторизації
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Стан вкладок (додали 'users')
  const [activeTab, setActiveTab] = useState<'reviews' | 'prices' | 'team' | 'gallery' | 'users'>('reviews');

  // Перевірка сесії при завантаженні
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  // ВХІД
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert("Błąd logowania: " + error.message);
      setLoading(false);
    } else {
      setUser(data.user);
      setLoading(false);
    }
  };

  // ВИХІД
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.refresh();
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-foxy-bg text-foxy-accent font-bold animate-pulse uppercase tracking-widest">
      Sprawdzanie uprawnień...
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-foxy-bg p-4 text-black font-lato">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-[2.5rem] shadow-2xl w-full max-w-sm border border-gray-100 animate-in fade-in zoom-in duration-300">
          <h1 className="text-2xl font-bold mb-6 text-center">Foxy Admin 🛡️</h1>
          <div className="space-y-4">
            <input 
              type="email" placeholder="Email" 
              className="w-full p-4 border rounded-2xl outline-foxy-accent" 
              value={email} onChange={(e) => setEmail(e.target.value)} required 
              autoComplete="email"
            />
            <input 
              type="password" placeholder="Hasło" 
              className="w-full p-4 border rounded-2xl outline-foxy-accent" 
              value={password} onChange={(e) => setPassword(e.target.value)} required 
              autoComplete="current-password"
            />
            <button type="submit" className="w-full bg-foxy-accent text-white py-4 rounded-2xl font-bold hover:brightness-105 transition-all uppercase shadow-lg shadow-foxy-accent/20">
              Zaloguj się
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 text-black bg-gray-50 font-lato">
      <div className="max-w-5xl mx-auto animate-in fade-in">
        
        {/* НАВІГАЦІЯ (ТАБИ) */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 gap-4">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-foxy-accent rounded-xl flex items-center justify-center text-white shadow-lg font-bold">
               🦊
             </div>
             <h1 className="text-2xl font-black text-gray-800 tracking-tight uppercase">Admin Panel</h1>
           </div>
           
           <div className="flex flex-wrap justify-center bg-gray-100 p-1 rounded-2xl w-full md:w-auto gap-1">
             {['reviews', 'prices', 'team', 'gallery', 'users'].map((tab: any) => (
               <button 
                 key={tab} 
                 onClick={() => setActiveTab(tab)} 
                 className={`flex-1 md:flex-none px-4 py-2 rounded-xl font-bold text-xs md:text-sm transition-all ${
                   activeTab === tab ? 'bg-white shadow-md text-foxy-accent' : 'text-gray-500 hover:text-black'
                 }`}
               >
                 {tab === 'reviews' && 'Opinie'}
                 {tab === 'prices' && 'Cennik'}
                 {tab === 'team' && 'Zespół'}
                 {tab === 'gallery' && 'Galeria'}
                 {tab === 'users' && 'Użytkownicy'}
               </button>
             ))}
           </div>
           <button onClick={handleLogout} className="text-xs text-gray-400 font-bold uppercase tracking-widest hover:text-red-500 transition-colors">
             Wyloguj 🚪
           </button>
        </div>

        {/* РЕНДЕР АКТИВНОЇ ВКЛАДКИ */}
        <div className="min-h-[500px]">
          {activeTab === 'reviews' && <ReviewsTab />}
          {activeTab === 'prices' && <PricesTab />}
          {activeTab === 'team' && <TeamTab />}
          {activeTab === 'gallery' && <GalleryTab />}
          {activeTab === 'users' && <UsersTab currentUserId={user.id} />}
        </div>

      </div>
    </div>
  );
}