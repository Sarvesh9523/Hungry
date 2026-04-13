import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import GlassLayout from '../../components/GlassLayout';

const FoodPartnerRegister = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return setError('All fields are required');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true); setError('');
    try {
      const response = await api.post('/api/auth/food-partner/register', { name, email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      navigate('/food-partner/profile');
    } catch (err) { setError(err.response?.data?.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <GlassLayout>
      <div className="mb-6 flex flex-col items-center text-center w-full">
        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.2)] mb-3">
          BUSINESS PORTAL
        </span>
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-100 to-teal-300 mb-2">Become a Partner</h1>
        <p className="text-white/70 text-sm">Grow your restaurant's reach with Hungry.</p>
      </div>

      <form className="w-full flex flex-col gap-4 text-left" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold tracking-wider text-emerald-300">RESTAURANT NAME</label>
          <input type="text" placeholder="e.g. Burger King" value={name} onChange={e => setName(e.target.value)} required 
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold tracking-wider text-emerald-300">BUSINESS EMAIL</label>
          <input type="email" placeholder="contact@restaurant.com" value={email} onChange={e => setEmail(e.target.value)} required 
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold tracking-wider text-emerald-300">SECURE PASSWORD</label>
          <input type="password" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} required 
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium" />
        </div>
        
        {error && <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 p-2 rounded-lg text-center">{error}</div>}
        <button type="submit" disabled={loading} className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 transition-all active:scale-95 border border-white/10">
          {loading ? 'Creating Account...' : 'Register Business'}
        </button>
        <div className="flex flex-col gap-2 mt-4 text-sm text-center text-white/60">
          <div>Already a partner? <Link to="/food-partner/login" className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-4">Sign in to dashboard</Link></div>
          <div>Not a business owner? <Link to="/user/register" className="text-gray-400 hover:text-white font-semibold">Sign up as User</Link></div>
        </div>
      </form>
    </GlassLayout>
  );
};

export default FoodPartnerRegister;
