import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 📡 Hit your real Node.js backend authentication endpoint
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Invalid security authorization credentials.');
      }

      // 🔑 Save the real backend JWT token directly into local storage!
      localStorage.setItem('awe_token', result.token);
      localStorage.setItem('awe_role', result.role || 'admin');
      
      // Clear forms and route cleanly to your studio dashboard
      setEmail('');
      setPassword('');
      navigate('/admin/gallery');

    } catch (err: any) {
      alert(`Authentication failure: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-neutral-950 min-h-screen flex items-center justify-center px-4 text-neutral-200">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 p-8 rounded shadow-2xl">
        <div className="mb-8 text-center">
          <span className="text-[9px] uppercase tracking-[0.25em] text-brand-indigo font-bold block mb-2">
            Internal Studio Platform
          </span>
          <h2 className="font-serif text-2xl font-bold text-white">AWE Studio Engine</h2>
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider mb-2 text-neutral-400">
              Admin Email
            </label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full bg-neutral-950 border border-neutral-800 p-3 text-sm rounded focus:outline-none focus:border-brand-indigo text-white" 
              placeholder="email address" 
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider mb-2 text-neutral-400">
              Security Password
            </label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full bg-neutral-950 border border-neutral-800 p-3 text-sm rounded focus:outline-none focus:border-brand-indigo text-white" 
              placeholder="password" 
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-brand-luxury text-white py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-brand-indigo transition-colors rounded cursor-pointer mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying Credentials...' : 'Authenticate & Enter'}
          </button>
        </form>
      </div>
    </div>
  );
}