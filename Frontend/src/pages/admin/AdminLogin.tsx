import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 💡 Temporary Frontend Simulation Logic:
    // Once backend auth routes are ready, we will replace this with a fetch request.
    if (email === 'admin@awe.co.za' && password === 'secure123') {
      localStorage.setItem('awe_token', 'simulated_jwt_token_string');
      localStorage.setItem('awe_role', 'admin');
      navigate('/admin/gallery');
    } else {
      alert('Invalid security authorization credentials.');
    }
  };

  return (
    <div className="bg-neutral-950 min-h-screen flex items-center justify-center px-4 text-neutral-200">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 p-8 rounded shadow-2xl">
        <div className="mb-8 text-center">
          <span className="text-[9px] uppercase tracking-[0.25em] text-brand-indigo font-bold block mb-2">Internal Studio Platform</span>
          <h2 className="font-serif text-2xl font-bold text-white">AWE Studio Engine</h2>
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider mb-2 text-neutral-400">Admin Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 p-3 text-sm rounded focus:outline-none focus:border-brand-indigo text-white" placeholder="admin@awe.co.za" />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider mb-2 text-neutral-400">Security Access Key</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 p-3 text-sm rounded focus:outline-none focus:border-brand-indigo text-white" placeholder="••••••••" />
          </div>

          <button type="submit" className="w-full bg-brand-luxury text-white py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-brand-indigo transition-colors rounded cursor-pointer mt-2">
            Authenticate & Enter
          </button>
        </form>
      </div>
    </div>
  );
}