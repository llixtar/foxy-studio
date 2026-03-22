"use client";

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function SignupPage() {
    const [supabase] = useState(() => createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ));
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.auth.signUp({
            email,
            password,
            phone, // Це для системи
            options: {
                data: {
                    first_name: firstName,
                    last_name: lastName,
                    phone: phone // Додаємо сюди теж, щоб тригер точно побачив
                }
            }
        });

        if (error) {
            alert("Błąd: " + error.message);
        } else {
            alert("Sprawdź e-mail, aby potwierdzić profil! 💌");
            router.push('/login');
        }
        setLoading(false);
    };

    // ТЕМНІШИЙ СТИЛЬ ІНПУТІВ ДЛЯ КОНТРАСТУ
    const inputStyle = "w-full p-4 rounded-2xl bg-black/5 border border-black/10 text-gray-900 placeholder:text-gray-500 outline-foxy-accent transition-all focus:bg-white focus:ring-2 focus:ring-foxy-accent/20 shadow-sm";

    return (
        <div className="min-h-screen flex items-center justify-center bg-foxy-bg p-4 font-lato">
            {/* Основна картка */}
            <div className="bg-white/80 backdrop-blur-2xl p-8 md:p-12 rounded-[3rem] shadow-2xl w-full max-w-lg border border-white animate-in fade-in zoom-in duration-500">

                {/* Логотип та тексти */}
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
                        Zarejestruj się <br />
                        <span className="italic font-normal text-foxy-accent">w Foxy Studio</span>
                    </h1>

                    <p className="text-gray-600 text-sm mt-4 max-w-sm mx-auto font-medium">
                        Rejestracja przyspieszy rezerwację usług i zapewni dostęp do specjalnych, gorących ofert.
                    </p>
                </div>

                <form onSubmit={handleSignup} className="space-y-4">

                    <div className="grid md:grid-cols-2 gap-4">
                        <input
                            type="text" placeholder="Imię"
                            className={inputStyle}
                            value={firstName} onChange={(e) => setFirstName(e.target.value)} required
                        />
                        <input
                            type="text" placeholder="Nazwisko"
                            className={inputStyle}
                            value={lastName} onChange={(e) => setLastName(e.target.value)} required
                        />
                    </div>

                    <input
                        type="tel" placeholder="Numer telefonu (np. 123456789)"
                        className={inputStyle}
                        value={phone} onChange={(e) => setPhone(e.target.value)} required
                    />

                    <input
                        type="email" placeholder="Adres e-mail"
                        className={inputStyle}
                        value={email} onChange={(e) => setEmail(e.target.value)} required
                    />

                    <input
                        type="password" placeholder="Hasło (min. 6 znaków)"
                        className={inputStyle}
                        value={password} onChange={(e) => setPassword(e.target.value)} required
                    />

                    <button
                        type="submit" disabled={loading}
                        className="w-full bg-foxy-accent text-white py-5 rounded-2xl font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-foxy-accent/30 text-sm mt-6"
                    >
                        {loading ? 'Tworzenie profilu...' : 'ZAREJESTRUJ SIĘ'}
                    </button>
                </form>

                <div className="mt-10 text-center text-sm text-gray-500 font-medium">
                    Masz już konto? <Link href="/login" className="text-foxy-accent font-black hover:underline ml-1">Zaloguj się</Link>
                </div>
            </div>
        </div>
    );
}