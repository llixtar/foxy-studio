"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/utils/supabase/client';

export default function SignupPage() {
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    
    const [notifyMethod, setNotifyMethod] = useState<'sms' | 'telegram' | 'whatsapp'>('sms');
    const [tgContact, setTgContact] = useState('');
    const [waContact, setWaContact] = useState('');
    
    const [loading, setLoading] = useState(false);

    const toggleMethod = (method: 'telegram' | 'whatsapp') => {
        setNotifyMethod(prev => prev === method ? 'sms' : method);
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.auth.signUp({
            email,
            password,
            phone,
            options: {
                data: {
                    first_name: firstName,
                    last_name: lastName,
                    phone: phone,
                    preferred_notify_method: notifyMethod,
                    tg_contact: notifyMethod === 'telegram' ? tgContact : '',
                    wa_contact: notifyMethod === 'whatsapp' ? waContact : ''
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

    const inputStyle = "w-full p-4 rounded-2xl bg-black/5 border border-black/10 text-gray-900 placeholder:text-gray-500 outline-foxy-accent transition-all focus:bg-white focus:ring-2 focus:ring-foxy-accent/20 shadow-sm text-sm";

    return (
        <div className="min-h-screen flex items-center justify-center bg-foxy-bg p-4 font-lato text-black">
            <div className="bg-white/80 backdrop-blur-2xl p-8 md:p-12 rounded-[3rem] shadow-2xl w-full max-w-lg border border-white animate-in fade-in zoom-in duration-500">

                <div className="text-center mb-8">
                    <div className="mb-6">
                        <Image src="/assets/FOXY.svg" alt="Logo" width={120} height={50} className="mx-auto" priority />
                    </div>
                    <h1 className="text-2xl font-playfair font-black text-gray-900 leading-tight">
                        Zarejestruj się <br />
                        <span className="italic font-normal text-foxy-accent">w Foxy Studio</span>
                    </h1>
                </div>

                <form onSubmit={handleSignup} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-3">
                        <input type="text" placeholder="Imię" className={inputStyle} value={firstName} onChange={(e) => setFirstName(e.target.value)} required autoComplete="given-name" />
                        <input type="text" placeholder="Nazwisko" className={inputStyle} value={lastName} onChange={(e) => setLastName(e.target.value)} required autoComplete="family-name" />
                    </div>

                    <input type="email" placeholder="Adres e-mail" className={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                    <input type="password" placeholder="Hasło (min. 6 znaków)" className={inputStyle} value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
                    <input type="tel" placeholder="Numer telefonu" className={inputStyle} value={phone} onChange={(e) => setPhone(e.target.value)} required autoComplete="tel" />

                    <div className="bg-gray-50 p-4 rounded-3xl border border-black/5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 ml-1">
                            Powiadomienia (opcjonalnie):
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                key="btn-tg" type="button"
                                onClick={() => toggleMethod('telegram')}
                                className={`py-3 rounded-xl text-[10px] font-bold uppercase transition-all border flex items-center justify-center gap-2 ${
                                    notifyMethod === 'telegram' 
                                    ? 'bg-[#229ED9] border-[#229ED9] text-white shadow-lg shadow-blue-500/20' 
                                    : 'bg-white border-black/10 text-gray-400 hover:border-[#229ED9]'
                                }`}
                            >
                                <span>✈️</span> Telegram
                            </button>
                            <button
                                key="btn-wa" type="button"
                                onClick={() => toggleMethod('whatsapp')}
                                className={`py-3 rounded-xl text-[10px] font-bold uppercase transition-all border flex items-center justify-center gap-2 ${
                                    notifyMethod === 'whatsapp' 
                                    ? 'bg-[#25D366] border-[#25D366] text-white shadow-lg shadow-green-500/20' 
                                    : 'bg-white border-black/10 text-gray-400 hover:border-[#25D366]'
                                }`}
                            >
                                <span>💬</span> WhatsApp
                            </button>
                        </div>

                        <AnimatePresence mode="wait">
                            {notifyMethod === 'telegram' && (
                                <motion.div key="tg-input" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                    <input
                                        type="text" placeholder="@username lub telefon TG"
                                        className={inputStyle + " mt-3 bg-white"}
                                        value={tgContact} onChange={(e) => setTgContact(e.target.value)} required
                                    />
                                </motion.div>
                            )}
                            {notifyMethod === 'whatsapp' && (
                                <motion.div key="wa-input" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                    <input
                                        type="tel" placeholder="Numer WhatsApp"
                                        className={inputStyle + " mt-3 bg-white"}
                                        value={waContact} onChange={(e) => setWaContact(e.target.value)} required
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                        
                        {notifyMethod === 'sms' && (
                            <p className="text-[9px] text-gray-400 mt-2 ml-1 italic">* Powiadomienia zostaną wysłane SMS-em</p>
                        )}
                    </div>

                    <button
                        type="submit" disabled={loading}
                        className="w-full bg-foxy-accent text-white py-5 rounded-2xl font-bold uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-foxy-accent/30 text-xs mt-4"
                    >
                        {loading ? 'Tworzenie profilu...' : 'ZAREJESTRUJ SIĘ'}
                    </button>
                </form>

                <div className="mt-8 text-center text-xs text-gray-500 font-medium">
                    Masz już konto? <Link href="/login" className="text-foxy-accent font-black hover:underline ml-1">Zaloguj się</Link>
                </div>
            </div>
        </div>
    );
}