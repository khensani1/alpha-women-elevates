import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Users, PlusCircle, Trash2, RefreshCw } from 'lucide-react';

interface CrmMember {
  id: number;
  name: string;
  surname: string;
  email: string;
  subscription_status: string;
  last_payment_at: string | null;
  created_at: string;
}

const STATUSES = ['pending', 'active', 'cancelled', 'failed', 'intervention'];

export function AdminMembers() {
  const [members, setMembers] = useState<CrmMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('active');
  const [saving, setSaving] = useState(false);

  const token = () => localStorage.getItem('awe_token');

  const fetchMembers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/crm`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to load members.');
      setMembers(data.members || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ name, surname, email, subscription_status: status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not add member.');
      setMembers((prev) => [data.data, ...prev]);
      setName('');
      setSurname('');
      setEmail('');
      setStatus('active');
      alert('Member added to the database.');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (id: number) => {
    if (!confirm('Permanently remove this member from the CRM database?')) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/members/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not remove member.');
      setMembers((prev) => prev.filter((m) => m.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleStatusChange = async (id: number, subscription_status: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/members/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ subscription_status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not update status.');
      setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...data.data } : m)));
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-neutral-900 mb-1 flex items-center gap-2">
              <Users size={28} /> Member Database
            </h1>
            <p className="text-xs text-neutral-700 italic">
              Super admin full CRM access — add, update, or remove any member.
            </p>
          </div>
          <button
            onClick={fetchMembers}
            className="self-start flex items-center gap-2 px-4 py-2 border border-purple-900/30 text-purple-950 rounded text-xs font-bold tracking-wider uppercase cursor-pointer"
            style={{ backgroundColor: '#E6E0F8' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-100 border border-red-300 text-red-900 rounded text-xs mb-4">
            {error}
          </div>
        )}

        <div
          className="p-6 border border-neutral-300 rounded shadow-sm mb-8"
          style={{ backgroundColor: '#E6E0F8' }}
        >
          <h2 className="text-xs font-bold uppercase tracking-widest text-purple-950 mb-4 flex items-center gap-2">
            <PlusCircle size={14} /> Add Member
          </h2>
          <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="First name"
              className="border border-neutral-400 p-2 text-xs rounded"
              style={{ backgroundColor: '#E6E0F8' }}
            />
            <input
              required
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              placeholder="Surname"
              className="border border-neutral-400 p-2 text-xs rounded"
              style={{ backgroundColor: '#E6E0F8' }}
            />
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="border border-neutral-400 p-2 text-xs rounded"
              style={{ backgroundColor: '#E6E0F8' }}
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border border-neutral-400 p-2 text-xs rounded"
              style={{ backgroundColor: '#E6E0F8' }}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={saving}
              className="bg-purple-950 text-white py-2 text-[10px] font-bold uppercase tracking-widest rounded cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Add to Database'}
            </button>
          </form>
        </div>

        <div
          className="p-6 border border-neutral-300 rounded shadow-sm"
          style={{ backgroundColor: '#E6E0F8' }}
        >
          <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-800 mb-4">
            All members ({members.length})
          </h3>

          {loading ? (
            <p className="text-xs italic text-neutral-700">Loading database…</p>
          ) : members.length === 0 ? (
            <p className="text-xs italic text-neutral-700">No members in the database yet.</p>
          ) : (
            <div className="space-y-2">
              {members.map((m) => (
                <div
                  key={m.id}
                  className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border border-neutral-400/60 rounded p-3 bg-purple-100/20"
                >
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">
                      {m.name} {m.surname}
                    </p>
                    <p className="text-xs text-neutral-700">{m.email}</p>
                    <p className="text-[10px] text-neutral-600 mt-1">
                      Joined{' '}
                      {m.created_at ? new Date(m.created_at).toLocaleDateString() : '—'}
                      {m.last_payment_at
                        ? ` · Last paid ${new Date(m.last_payment_at).toLocaleDateString()}`
                        : ''}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={m.subscription_status}
                      onChange={(e) => handleStatusChange(m.id, e.target.value)}
                      className="border border-neutral-400 p-2 text-[10px] uppercase font-bold rounded"
                      style={{ backgroundColor: '#E6E0F8' }}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleRemove(m.id)}
                      className="flex items-center gap-1 px-3 py-2 text-[10px] font-bold uppercase tracking-widest bg-red-800 text-white hover:bg-red-700 rounded cursor-pointer"
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
