"use client";

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. Входимо в систему
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Błąd logowania: " + error.message);
      setLoading(false);
      return;
    }

    // 2. Перевіряємо роль юзера в таблиці profiles
    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      router.refresh(); // Оновлюємо хедер

      // 3. Розумне перенаправлення
      if (profile?.role === 'admin') {
        router.push('/admin'); // Адміна — в панель керування
      } else {
        router.push('/'); // Клієнта — на головну
      }
    }

    setLoading(false);
  };

  // КОНТРАСТНИЙ СТИЛЬ ІНПУТІВ (як у реєстрації)
  const inputStyle = "w-full p-4 rounded-2xl bg-black/5 border border-black/10 text-gray-900 placeholder:text-gray-500 outline-foxy-accent transition-all focus:bg-white focus:ring-2 focus:ring-foxy-accent/20 shadow-sm";

  return (
    <div className="min-h-screen flex items-center justify-center bg-foxy-bg p-4 font-lato">
      <div className="bg-white/80 backdrop-blur-2xl p-8 md:p-12 rounded-[3rem] shadow-2xl w-full max-w-md border border-white animate-in fade-in zoom-in duration-500">

        <div className="text-center mb-10">
          <div className="mb-8">
            <Image
              src="/assets/FOXY.svg"
              alt="Foxy Studio Logo"
              width={140}
              height={60}
              className="mx-auto drop-shadow-sm"
              priority
            />
          </div>

          <h1 className="text-3xl font-playfair font-black text-gray-900 leading-tight">
            Witaj ponownie <br />
            <span className="italic font-normal text-foxy-accent">w Foxy Studio</span>
          </h1>
          <p className="text-gray-600 text-sm mt-4 font-medium uppercase tracking-widest">
            Twoja osobista przestrzeń piękna
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Adres e-mail"
            className={inputStyle}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Hasło"
            className={inputStyle}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-foxy-accent text-white py-5 rounded-2xl font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-foxy-accent/30 text-sm mt-6"
          >
            {loading ? 'Logowanie...' : 'ZALOGUJ SIĘ'}
          </button>
        </form>

        <div className="mt-10 text-center text-sm text-gray-500 font-medium">
          Nie masz jeszcze konta? <Link href="/signup" className="text-foxy-accent font-black hover:underline ml-1">Zarejestruj się</Link>
        </div>
      </div>
    </div>
  );
}