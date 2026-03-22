"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';

export default function AccountPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'visits' | 'settings'>('visits');

    // Стейт для форми налаштувань
    const [editPhone, setEditPhone] = useState('');
    const [editTg, setEditTg] = useState('');
    const [editWa, setEditWa] = useState('');
    const [saveLoading, setSaveLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
                return;
            }
            setUser(session.user);

            // Завантажуємо профіль та всі бронювання
            const [profRes, bookRes] = await Promise.all([
                supabase.from('profiles').select('*').eq('id', session.user.id).single(),
                supabase.from('bookings').select('*').eq('user_id', session.user.id).order('start_time', { ascending: true })
            ]);

            if (profRes.data) {
                setProfile(profRes.data);
                setEditPhone(profRes.data.phone || '');
                setEditTg(profRes.data.tg_contact || '');
                setEditWa(profRes.data.wa_contact || '');
            }
            if (bookRes.data) setBookings(bookRes.data);

            setLoading(false);
        };
        fetchData();
    }, [router]);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaveLoading(true);

        const { error } = await supabase
            .from('profiles')
            .update({
                phone: editPhone,
                tg_contact: editTg,
                wa_contact: editWa
            })
            .eq('id', user.id);

        if (error) {
            alert('Błąd: ' + error.message);
        } else {
            setProfile({ ...profile, phone: editPhone, tg_contact: editTg, wa_contact: editWa });
            alert('Zapisano pomyślnie! ✅');
        }
        setSaveLoading(false);
    };

    if (loading) return (
        <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
            <div className="text-foxy-accent font-bold animate-pulse tracking-[0.2em]">ŁADOWANIE...</div>
        </div>
    );

    const upcomingVisits = bookings.filter(b => new Date(b.start_time) > new Date() && b.status !== 'cancelled');
    const pastVisits = bookings.filter(b => new Date(b.start_time) <= new Date() || b.status === 'cancelled').reverse();

    const inputStyle = "w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-foxy-accent transition-all text-sm";

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white font-lato pb-20 overflow-x-hidden">

            {/* HEADER */}
            <div className="relative h-64 bg-gradient-to-b from-foxy-accent/20 to-transparent flex items-end px-6 pb-10 z-0">

                {/* Кнопка на головну */}
                <div className="absolute top-6 left-6 md:top-8 md:left-8 z-50">
                    <a href="/" className="flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest text-white/50 hover:text-white hover:scale-105 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        Strona Główna
                    </a>
                </div>

                <div className="max-w-4xl mx-auto w-full flex items-center gap-6">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-foxy-accent flex items-center justify-center text-black text-2xl md:text-3xl font-black shadow-2xl">
                        {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-playfair font-bold">Witaj, {profile?.first_name}!</h1>
                        <p className="text-white/40 text-[10px] md:text-sm uppercase tracking-widest font-bold mt-1">Twój panel klienta</p>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 -mt-8 relative z-50">

                {/* TABS - Додано relative z-50 та cursor-pointer */}
                <div className="flex gap-2 bg-[#1A1A1A] p-1.5 rounded-2xl border border-white/10 w-fit mb-12 backdrop-blur-2xl shadow-2xl relative z-50">
                    <button
                        type="button"
                        onClick={() => {
                            console.log("Tab: Visits clicked");
                            setActiveTab('visits');
                        }}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${activeTab === 'visits' ? 'bg-foxy-accent text-black shadow-lg shadow-foxy-accent/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                    >
                        Wizyty
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            console.log("Tab: Settings clicked");
                            setActiveTab('settings');
                        }}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${activeTab === 'settings' ? 'bg-foxy-accent text-black shadow-lg shadow-foxy-accent/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                    >
                        Ustawienia
                    </button>
                </div>

                {/* CONTENT AREA */}
                <div className="min-h-[400px]">
                    {activeTab === 'visits' ? (
                        <div className="space-y-12">

                            {/* UPCOMING VISITS */}
                            <section>
                                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-foxy-accent mb-6 flex items-center gap-4">
                                    <span className="w-12 h-[1px] bg-foxy-accent/30"></span> Nadchodzące wizyty
                                </h2>

                                {upcomingVisits.length > 0 ? (
                                    <div className="grid gap-4">
                                        {upcomingVisits.map(visit => (
                                            <div key={visit.id} className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex flex-col md:flex-row justify-between items-center gap-6 backdrop-blur-sm hover:bg-white/[0.07] transition-all">
                                                <div className="flex gap-6 items-center">
                                                    <div className="text-center min-w-[70px]">
                                                        <p className="text-3xl font-black">{new Date(visit.start_time).getDate()}</p>
                                                        <p className="text-[10px] uppercase font-bold text-foxy-accent">
                                                            {new Date(visit.start_time).toLocaleString('pl', { month: 'short' })}
                                                        </p>
                                                    </div>
                                                    <div className="h-12 w-[1px] bg-white/10 hidden md:block"></div>
                                                    <div>
                                                        <p className="font-bold text-lg md:text-xl text-white">{visit.event_title}</p>
                                                        <p className="text-xs text-white/40 mt-1">Specjalista: <span className="text-white font-bold">{visit.master_name}</span></p>
                                                        <p className="text-sm text-foxy-accent font-black mt-2">
                                                            {new Date(visit.start_time).toLocaleTimeString('pl', { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 w-full md:w-auto">
                                                    <a href={visit.reschedule_url} target="_blank" className="flex-1 md:flex-none px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all text-center">
                                                        Przełóż
                                                    </a>
                                                    <a href={visit.cancel_url} target="_blank" className="flex-1 md:flex-none px-6 py-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all text-center">
                                                        Odwołaj
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-16 text-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
                                        <p className="text-white/20 font-bold uppercase tracking-[0.2em] text-xs">Brak aktywnych rezerwacji</p>
                                        <button onClick={() => router.push('/')} className="mt-6 px-8 py-3 bg-foxy-accent text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:scale-105 transition-all">
                                            Zarezerwuj teraz
                                        </button>
                                    </div>
                                )}
                            </section>

                            {/* HISTORY VISITS */}
                            {pastVisits.length > 0 && (
                                <section>
                                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-6 flex items-center gap-4">
                                        <span className="w-12 h-[1px] bg-white/10"></span> Historia wizyt
                                    </h2>
                                    <div className="grid gap-3 opacity-60">
                                        {pastVisits.map(visit => (
                                            <div key={visit.id} className="bg-white/5 border border-white/5 p-5 rounded-[1.5rem] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                                <div>
                                                    <p className="font-bold text-sm text-white">{visit.event_title}</p>
                                                    <p className="text-[10px] text-white/40 mt-1 uppercase tracking-wider">
                                                        {new Date(visit.start_time).toLocaleDateString('pl')} • {new Date(visit.start_time).toLocaleTimeString('pl', { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col md:items-end">
                                                    <p className="text-[10px] font-bold text-white/60">
                                                        Master: <span className="text-foxy-accent">{visit.master_name}</span>
                                                    </p>
                                                    <span className={`text-[9px] font-black uppercase tracking-widest mt-2 px-3 py-1 rounded-full border ${visit.status === 'cancelled' ? 'text-red-400 border-red-400/20 bg-red-400/10' : 'text-green-400 border-green-400/20 bg-green-400/10'}`}>
                                                        {visit.status === 'cancelled' ? 'Odwołano' : 'Zrealizowano'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    ) : (
                        /* SETTINGS TAB CONTENT */
                        <div className="bg-[#111111] border border-white/10 p-8 md:p-12 rounded-[3rem] backdrop-blur-sm relative z-50">
                            <h2 className="text-2xl font-bold mb-2">Moje dane</h2>
                            <p className="text-xs text-white/40 mb-10 tracking-wide">Zaktualizuj dane kontaktowe, aby otrzymywać powiadomienia.</p>

                            <form onSubmit={handleSaveProfile} className="space-y-6 max-w-md">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-white/40 ml-4 tracking-[0.2em]">Numer telefonu</label>
                                    <input type="tel" value={editPhone} onChange={e => setEditPhone(e.target.value)} className={inputStyle} placeholder="+48 000 000 000" required />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-white/40 ml-4 tracking-[0.2em] flex items-center gap-2">
                                        Telegram Username
                                    </label>
                                    <input type="text" value={editTg} onChange={e => setEditTg(e.target.value)} className={inputStyle} placeholder="@nazwa_uzytkownika" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-white/40 ml-4 tracking-[0.2em]">WhatsApp</label>
                                    <input type="tel" value={editWa} onChange={e => setEditWa(e.target.value)} className={inputStyle} placeholder="Numer telefonu" />
                                </div>

                                <button type="submit" disabled={saveLoading} className="w-full bg-foxy-accent text-black py-4 rounded-2xl font-black uppercase tracking-[0.2em] hover:brightness-110 active:scale-[0.98] transition-all text-[11px] mt-10 cursor-pointer shadow-xl shadow-foxy-accent/10">
                                    {saveLoading ? 'ZAPISYWANIE...' : 'ZAPISZ ZMIANY'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}