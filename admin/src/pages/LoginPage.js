import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../config';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.admin);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-6xl text-[#FF6B2C] tracking-widest">ZOOP</h1>
          <p className="text-white/40 text-sm mt-1">Admin Dashboard</p>
        </div>
        <form onSubmit={handleLogin} className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/5 space-y-4">
          <div>
            <label className="text-white/50 text-xs uppercase tracking-wider block mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#FF6B2C] transition text-sm"
              placeholder="admin@zoop.com"
            />
          </div>
          <div>
            <label className="text-white/50 text-xs uppercase tracking-wider block mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#FF6B2C] transition text-sm"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-red-400 text-sm bg-red-500/10 rounded-xl p-3 text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF6B2C] hover:bg-orange-400 disabled:opacity-60 text-white rounded-xl py-3 font-bold transition-all"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="text-white/20 text-xs text-center mt-4">Default: admin@zoop.com / admin123</p>
      </div>
    </div>
  );
}
