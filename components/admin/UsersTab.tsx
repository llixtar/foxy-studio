"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';

export default function UsersTab({ currentUserId }: { currentUserId: string }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (data) setUsers(data);
    if (error) setStatus('Помилка завантаження: ' + error.message);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (userId === currentUserId && newRole !== 'admin') {
      alert('Nie możesz odebrać sobie uprawnień administratora! 🛡️');
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      alert('Błąd aktualizacji: ' + error.message);
    } else {
      setStatus('Rola została zaktualizowana! ✅');
      setTimeout(() => setStatus(''), 3000);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    }
  };

  if (loading) return <div className="animate-pulse text-center py-10 font-bold text-gray-400 tracking-widest uppercase">Ładowanie użytkowników...</div>;

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 animate-in slide-in-from-bottom-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold flex items-center gap-2"><span>👥</span> Zarządzanie użytkownikami</h2>
        {status && <span className="text-xs font-bold text-foxy-accent bg-foxy-accent/10 px-3 py-1 rounded-lg">{status}</span>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="p-3 text-[10px] font-black uppercase tracking-widest text-gray-400">Użytkownik</th>
              <th className="p-3 text-[10px] font-black uppercase tracking-widest text-gray-400">Kontakt</th>
              <th className="p-3 text-[10px] font-black uppercase tracking-widest text-gray-400">Powiadomienia</th>
              <th className="p-3 text-[10px] font-black uppercase tracking-widest text-gray-400">Rola</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="p-3">
                  <p className="font-bold text-sm text-gray-900">{user.first_name} {user.last_name}</p>
                  <p className="text-[10px] text-gray-500">{user.email}</p>
                </td>
                <td className="p-3">
                  <p className="text-xs text-gray-600 font-medium">{user.phone || '—'}</p>
                </td>
                <td className="p-3">
                  <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-md bg-gray-100 text-gray-600 border border-gray-200">
                    {user.preferred_notify_method || 'sms'}
                  </span>
                </td>
                <td className="p-3">
                  <select
                    value={user.role || 'client'}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    disabled={user.id === currentUserId}
                    className={`text-xs font-bold p-2 rounded-xl outline-none border transition-all cursor-pointer ${
                      user.role === 'admin' ? 'bg-black text-white border-black' :
                      user.role === 'master' ? 'bg-foxy-accent/10 text-foxy-accent border-foxy-accent/20' :
                      'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <option value="client">Klient</option>
                    <option value="master">Master</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}