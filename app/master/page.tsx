"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';

export default function MasterDashboard() {
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [editedProfile, setEditedProfile] = useState<any>(null); 
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'history' | 'settings'>('confirmed');

    useEffect(() => {
        const fetchMasterData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
                return;
            }

            const { data: profData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (!profData || (profData.role !== 'master' && profData.role !== 'admin')) {
                alert('Brak dostępu!');
                router.push('/account');
                return;
            }
            setProfile(profData);
            setEditedProfile(profData); 

            const { data: bookData } = await supabase
                .from('bookings')
                .select('*')
                .eq('master_id', session.user.id)
                .order('start_time', { ascending: true });

            if (bookData && bookData.length > 0) {
                const clientIds = [...new Set(bookData.map(b => b.user_id))];
                const { data: clientsData } = await supabase
                    .from('profiles')
                    .select('id, first_name, last_name, phone, tg_contact, wa_contact')
                    .in('id', clientIds);

                const enrichedBookings = bookData.map(booking => ({
                    ...booking,
                    client: clientsData?.find(c => c.id === booking.user_id) || null
                }));

                setBookings(enrichedBookings);

                const hasNewRequests = enrichedBookings.some(
                    b => b.status === 'pending' && new Date(b.start_time) > new Date()
                );
                if (hasNewRequests) setActiveTab('pending');
            }
            setLoading(false);
        };
        fetchMasterData();
    }, [router]);

    const handleSaveProfile = async () => {
        setActionLoading(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    first_name: editedProfile.first_name,
                    last_name: editedProfile.last_name,
                    phone: editedProfile.phone,
                    tg_contact: editedProfile.tg_contact,
                    wa_contact: editedProfile.wa_contact,
                    cal_api_key: editedProfile.cal_api_key
                })
                .eq('id', profile.id);

            if (error) throw error;
            setProfile(editedProfile);
            alert('Dane zostały zaktualizowane! ✅');
            setActiveTab('confirmed');
        } catch (error: any) {
            alert('Błąd zapisu: ' + error.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdateStatus = async (bookingId: string, calBookingId: string, newStatus: string) => {
        setActionLoading(true);
        try {
            if (newStatus === 'confirmed') {
                const res = await fetch('/api/bookings/confirm', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ calBookingId }),
                });
                if (!res.ok) throw new Error("Błąd Cal.com");
                alert('Wizyta zatwierdzona! ✅');
            } else if (newStatus === 'cancelled') {
                const res = await fetch('/api/bookings/cancel', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ calBookingId }),
                });
                if (!res.ok) throw new Error("Nie udało się odwołać");
                alert('Wizyta odwołana! ❌');
            }
            setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
        } catch (error: any) {
            alert('Wystąpił błąd: ' + error.message);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
            <div className="text-foxy-accent font-bold animate-pulse tracking-[0.2em]">ŁADOWANIE PANELU...</div>
        </div>
    );

    const pendingVisits = bookings.filter(b => b.status === 'pending' && new Date(b.start_time) > new Date());
    const confirmedVisits = bookings.filter(b => b.status === 'confirmed' && new Date(b.start_time) > new Date());
    const historyVisits = bookings.filter(b => new Date(b.start_time) <= new Date() || b.status === 'cancelled').reverse();

    const ClientContacts = ({ client }: { client: any }) => {
        if (!client) return <p className="text-[10px] text-white/30">Brak danych klienta</p>;
        return (
            <div className="flex flex-wrap gap-3 mt-2">
                {client.phone && <span className="text-[10px] bg-white/10 px-2 py-1 rounded-md">📞 {client.phone}</span>}
                {client.tg_contact && <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-1 rounded-md">✈️ {client.tg_contact}</span>}
                {client.wa_contact && <span className="text-[10px] bg-green-500/20 text-green-300 px-2 py-1 rounded-md">💬 {client.wa_contact}</span>}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white font-lato pb-20 overflow-x-hidden">
            {/* HEADER */}
            <div className="relative h-64 bg-gradient-to-b from-[#2A2A2A] to-transparent flex items-end px-6 pb-10 z-0">
                <div className="absolute top-6 left-6 md:top-8 md:left-8 z-50">
                    <a href="/" className="flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest text-white/50 hover:text-white transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        Strona Główna
                    </a>
                </div>

                <div className="max-w-5xl mx-auto w-full flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-3xl font-black shadow-2xl backdrop-blur-md">
                            ✂️
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-playfair font-bold">Panel Mastera</h1>
                            <p className="text-foxy-accent text-[10px] md:text-sm uppercase tracking-widest font-bold mt-1">
                                {profile?.first_name} {profile?.last_name}
                            </p>
                        </div>
                    </div>
                    
                    {/* КНОПКА ШЕСТЕРНЯ */}
                    <button 
                        onClick={() => setActiveTab(activeTab === 'settings' ? 'confirmed' : 'settings')}
                        className={`p-4 rounded-2xl border transition-all shadow-xl ${activeTab === 'settings' ? 'bg-foxy-accent border-foxy-accent text-black scale-110' : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.332.183-.582.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 -mt-8 relative z-50">
                {activeTab !== 'settings' ? (
                    <>
                        {/* TABS */}
                        <div className="flex flex-wrap gap-2 bg-[#1A1A1A] p-1.5 rounded-2xl border border-white/10 w-fit mb-12 backdrop-blur-2xl shadow-2xl">
                            <button onClick={() => setActiveTab('pending')} className={`px-4 md:px-6 py-2.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${activeTab === 'pending' ? 'bg-foxy-accent text-black' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
                                Nowe ({pendingVisits.length})
                            </button>
                            <button onClick={() => setActiveTab('confirmed')} className={`px-4 md:px-6 py-2.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${activeTab === 'confirmed' ? 'bg-foxy-accent text-black' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
                                Zatwierdzone ({confirmedVisits.length})
                            </button>
                            <button onClick={() => setActiveTab('history')} className={`px-4 md:px-6 py-2.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${activeTab === 'history' ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
                                Historia
                            </button>
                        </div>

                        {/* CONTENT AREA */}
                        <div className="min-h-[400px]">
                            {activeTab === 'pending' && (
                                <div className="space-y-6">
                                    {pendingVisits.length > 0 ? pendingVisits.map(visit => (
                                        <div key={visit.id} className="bg-yellow-500/5 border border-yellow-500/20 p-6 rounded-[2rem] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl">
                                            <div>
                                                <p className="text-yellow-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Wymaga potwierdzenia</p>
                                                <p className="font-bold text-xl">{visit.event_title}</p>
                                                <p className="text-white/60 text-sm mt-1">Klient: <span className="font-bold text-white">{visit.client?.first_name}</span></p>
                                                <p className="text-lg font-black mt-2">
                                                    {new Date(visit.start_time).toLocaleDateString('pl')} o {new Date(visit.start_time).toLocaleTimeString('pl', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                                <ClientContacts client={visit.client} />
                                            </div>
                                            <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                                                <button disabled={actionLoading} onClick={() => handleUpdateStatus(visit.id, visit.cal_booking_id, 'confirmed')} className="flex-1 px-6 py-4 bg-yellow-500 text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50">
                                                    {actionLoading ? '...' : 'Zatwierdź'}
                                                </button>
                                                <button disabled={actionLoading} onClick={() => handleUpdateStatus(visit.id, visit.cal_booking_id, 'cancelled')} className="flex-1 px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-50">
                                                    {actionLoading ? '...' : 'Odrzuć'}
                                                </button>
                                            </div>
                                        </div>
                                    )) : <p className="text-white/30 text-center py-10 font-bold uppercase tracking-widest text-xs">Brak nowych próśb</p>}
                                </div>
                            )}

                            {activeTab === 'confirmed' && (
                                <div className="space-y-6">
                                    {confirmedVisits.length > 0 ? confirmedVisits.map(visit => (
                                        <div key={visit.id} className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden shadow-xl">
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-foxy-accent"></div>
                                            <div className="pl-4">
                                                <p className="font-bold text-xl">{visit.event_title}</p>
                                                <p className="text-white/60 text-sm mt-1">Klient: <span className="font-bold text-white">{visit.client?.first_name || 'Brak imienia'} {visit.client?.last_name || ''}</span></p>
                                                <p className="text-lg text-foxy-accent font-black mt-2">
                                                    {new Date(visit.start_time).toLocaleDateString('pl')} o {new Date(visit.start_time).toLocaleTimeString('pl', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                                <ClientContacts client={visit.client} />
                                            </div>
                                            <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                                                <button disabled={actionLoading} onClick={() => handleUpdateStatus(visit.id, visit.cal_booking_id, 'cancelled')} className="flex-1 md:flex-none px-6 py-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all text-center disabled:opacity-50">
                                                    {actionLoading ? '...' : 'Odwołaj'}
                                                </button>
                                            </div>
                                        </div>
                                    )) : <p className="text-white/30 text-center py-10 font-bold uppercase tracking-widest text-xs">Brak zatwierdzonych wizyt</p>}
                                </div>
                            )}

                            {activeTab === 'history' && (
                                <div className="grid gap-3 opacity-70">
                                    {historyVisits.length > 0 ? historyVisits.map(visit => (
                                        <div key={visit.id} className="bg-white/5 border border-white/5 p-5 rounded-[1.5rem] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-md">
                                            <div>
                                                <p className="font-bold text-sm text-white">{visit.event_title}</p>
                                                <p className="text-xs text-white/40 mt-1">Klient: {visit.client?.first_name} • {new Date(visit.start_time).toLocaleDateString('pl')}</p>
                                            </div>
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${visit.status === 'cancelled' ? 'text-red-400 border-red-400/20 bg-red-400/10' : 'text-green-400 border-green-400/20 bg-green-400/10'}`}>
                                                {visit.status === 'cancelled' ? 'Odwołano' : 'Zrealizowano'}
                                            </span>
                                        </div>
                                    )) : <p className="text-white/30 text-center py-10 font-bold uppercase tracking-widest text-xs">Brak historii</p>}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    /* SETTINGS FORM */
                    <div className="bg-[#1A1A1A] border border-white/10 rounded-[2rem] p-8 max-w-2xl mx-auto shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in duration-300">
                        <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
                            <span className="text-foxy-accent text-2xl">⚙️</span> Ustawienia Profilu
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-white/40 font-black">Imię</label>
                                <input type="text" value={editedProfile?.first_name || ''} onChange={e => setEditedProfile({...editedProfile, first_name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-foxy-accent outline-none transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-white/40 font-black">Nazwisko</label>
                                <input type="text" value={editedProfile?.last_name || ''} onChange={e => setEditedProfile({...editedProfile, last_name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-foxy-accent outline-none transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-white/40 font-black">Telefon</label>
                                <input type="text" value={editedProfile?.phone || ''} onChange={e => setEditedProfile({...editedProfile, phone: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-foxy-accent outline-none transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-white/40 font-black">Telegram</label>
                                <input type="text" value={editedProfile?.tg_contact || ''} onChange={e => setEditedProfile({...editedProfile, tg_contact: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-foxy-accent outline-none transition-all" />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] uppercase tracking-widest text-white/40 font-black">Cal.com API Key</label>
                                <input type="password" value={editedProfile?.cal_api_key || ''} onChange={e => setEditedProfile({...editedProfile, cal_api_key: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-foxy-accent outline-none transition-all" />
                            </div>
                        </div>

                        <button disabled={actionLoading} onClick={handleSaveProfile} className="w-full mt-10 bg-foxy-accent text-black py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:brightness-110 transition-all disabled:opacity-50 shadow-lg shadow-foxy-accent/20">
                            {actionLoading ? 'Zapisywanie...' : 'Zapisz zmiany'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}