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
    <div 
      className="min-h-screen flex items-center justify-center px-4 text-neutral-800"
      style={{ backgroundColor: '#C4BCC7' }} // Keeps the overall page background as is
    >
      {/* 🌸 THE CENTER LOGIN CARD: Changed background to Baby Pink (#FCE7F3) */}
      <div 
        className="w-full max-w-md border border-pink-200 p-8 rounded-lg shadow-2xl transition-all"
        style={{ backgroundColor: '#FCE7F3' }}
      >
        <div className="mb-8 text-center">
          <span className="text-[9px] uppercase tracking-[0.25em] text-brand-indigo font-bold block mb-2">
            Internal Studio Platform
          </span>
          <h2 className="font-serif text-2xl font-bold text-neutral-900">AWE Studio Engine</h2>
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider mb-2 text-neutral-700">
              Admin Email
            </label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full border border-pink-200 p-3 text-sm rounded focus:outline-none focus:border-brand-indigo text-neutral-900 placeholder:text-neutral-400 bg-white" 
              placeholder="email address" 
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider mb-2 text-neutral-700">
              Security Password
            </label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full border border-pink-200 p-3 text-sm rounded focus:outline-none focus:border-brand-indigo text-neutral-900 placeholder:text-neutral-400 bg-white" 
              placeholder="password" 
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-brand-luxury text-white py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-brand-indigo transition-colors rounded cursor-pointer mt-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {loading ? 'Verifying Credentials...' : 'Authenticate & Enter'}
          </button>
        </form>
      </div>
    </div>
  );
}