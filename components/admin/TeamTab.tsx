"use client";

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/utils/supabase/client';

const ALL_WORKER_SLUGS = [
  { value: 'worker-1', label: '📅 Worker 1' },
  { value: 'worker-2', label: '📅 Worker 2' },
  { value: 'worker-3', label: '📅 Worker 3' },
  { value: 'worker-4', label: '📅 Worker 4' },
  { value: 'worker-5', label: '📅 Worker 5' },
];

export default function TeamTab() {
  const [team, setTeam] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState('');

  // Стан форми
  const [teamName, setTeamName] = useState('');
  const [teamRole, setTeamRole] = useState('');
  const [teamDesc, setTeamDesc] = useState('');
  const [teamIsBoss, setTeamIsBoss] = useState(false);
  const [teamCalSlug, setTeamCalSlug] = useState('');
  const [teamFile, setTeamFile] = useState<File | null>(null);

  const fetchTeam = async () => {
    const { data } = await supabase.from('team').select('*').order('is_boss', { ascending: false });
    if (data) setTeam(data);
  };

  useEffect(() => { fetchTeam(); }, []);

  // --- ЛОГІКА ВІЛЬНИХ ВОРКЕРІВ ---
  const occupiedSlugs = useMemo(() => {
    return team.map(member => member.cal_slug).filter(Boolean);
  }, [team]);

  const availableSlugsForNew = useMemo(() => {
    return ALL_WORKER_SLUGS.filter(s => !occupiedSlugs.includes(s.value));
  }, [occupiedSlugs]);

  // ------------------------------

  const handleTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamFile) return;
    try {
      setIsUploading(true);
      const fileExt = teamFile.name.split('.').pop();
      const fileName = `team-${Math.random()}-${Date.now()}.${fileExt}`;
      await supabase.storage.from('team-images').upload(fileName, teamFile);
      const { data: urlData } = supabase.storage.from('team-images').getPublicUrl(fileName);
      
      await supabase.from('team').insert([{ 
        name: teamName, role: teamRole, desc: teamDesc, 
        image_url: urlData.publicUrl, is_boss: teamIsBoss, cal_slug: teamCalSlug 
      }]);
      
      setStatus('Додано! 🚀');
      setTeamName(''); setTeamRole(''); setTeamDesc(''); setTeamIsBoss(false); setTeamCalSlug(''); setTeamFile(null);
      fetchTeam();
    } catch (error: any) { setStatus('Помилка: ' + error.message); } 
    finally { setIsUploading(false); setTimeout(() => setStatus(''), 3000); }
  };

  const handleTeamDelete = async (id: number, imageUrl: string) => {
    if (!confirm('Видалити працівника?')) return;
    const fileName = imageUrl.split('/').pop();
    if(fileName && fileName.includes('team-')) await supabase.storage.from('team-images').remove([fileName]);
    await supabase.from('team').delete().eq('id', id);
    fetchTeam();
  };

  const handleTeamUpdate = async (id: number, field: string, value: string | boolean) => {
    await supabase.from('team').update({ [field]: value }).eq('id', id);
    fetchTeam();
  };

  return (
    <div className="grid md:grid-cols-12 gap-8 animate-in slide-in-from-bottom-4">
      
      {/* ФОРМА ДОДАВАННЯ */}
      <div className="md:col-span-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-fit">
        <h2 className="text-lg font-bold mb-5 flex items-center gap-2"><span>🦊</span> Новий майстер</h2>
        {status && <div className="mb-4 text-sm font-bold text-foxy-accent">{status}</div>}
        <form onSubmit={handleTeamSubmit} className="space-y-4">
          <input type="text" placeholder="Ім'я" value={teamName} onChange={(e) => setTeamName(e.target.value)} className="w-full border p-3 rounded-2xl bg-gray-50 outline-foxy-accent text-sm" required />
          <input type="text" placeholder="Посада" value={teamRole} onChange={(e) => setTeamRole(e.target.value)} className="w-full border p-3 rounded-2xl bg-gray-50 outline-foxy-accent text-sm" required />
          <textarea placeholder="Опис..." value={teamDesc} onChange={(e) => setTeamDesc(e.target.value)} className="w-full border p-3 rounded-2xl bg-gray-50 outline-foxy-accent text-sm" rows={4} required />
          
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Прив'язка до Cal.com</label>
            <select value={teamCalSlug} onChange={(e) => setTeamCalSlug(e.target.value)} className="w-full border p-3 rounded-2xl bg-gray-50 outline-foxy-accent text-sm font-bold">
              <option value="">🚫 Без календаря</option>
              {availableSlugsForNew.map(slug => (
                <option key={slug.value} value={slug.value}>{slug.label}</option>
              ))}
            </select>
          </div>

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

      {/* СПИСОК МАЙСТРІВ */}
      <div className="md:col-span-8 space-y-4">
        {team.map((member) => {
          // Для редагування показуємо: поточний воркер цього майстра + всі вільні
          const availableForThisMember = ALL_WORKER_SLUGS.filter(s => 
            !occupiedSlugs.includes(s.value) || s.value === member.cal_slug
          );

          return (
            <div key={member.id} className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4">
              <div className="relative w-full sm:w-32 aspect-[4/5] shrink-0">
                <img src={member.image_url} className="w-full h-full object-cover rounded-2xl" alt="" />
                {member.is_boss && <span className="absolute top-2 left-2 bg-foxy-accent text-white text-[10px] font-black px-2 py-1 rounded-lg">Boss</span>}
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <input type="text" defaultValue={member.name} onBlur={(e) => handleTeamUpdate(member.id, 'name', e.target.value)} className="font-playfair text-xl font-bold outline-none bg-transparent w-1/2" />
                  <button onClick={() => handleTeamDelete(member.id, member.image_url)} className="text-gray-300 hover:text-red-500 transition-all text-sm font-bold">🗑️</button>
                </div>
                <input type="text" defaultValue={member.role} onBlur={(e) => handleTeamUpdate(member.id, 'role', e.target.value)} className="text-xs font-bold text-foxy-accent uppercase outline-none bg-transparent w-full" />
                
                <select 
                  value={member.cal_slug || ''} 
                  onChange={(e) => handleTeamUpdate(member.id, 'cal_slug', e.target.value)} 
                  className="text-xs font-bold text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-2 w-fit outline-none"
                >
                  <option value="">🚫 Без календаря</option>
                  {availableForThisMember.map(slug => (
                    <option key={slug.value} value={slug.value}>{slug.label}</option>
                  ))}
                </select>

                <textarea defaultValue={member.desc} onBlur={(e) => handleTeamUpdate(member.id, 'desc', e.target.value)} className="text-sm text-gray-600 outline-none bg-gray-50 p-2 rounded-xl w-full resize-none" rows={3} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}