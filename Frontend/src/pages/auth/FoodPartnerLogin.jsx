import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from '../../utils/toast';
import GlassLayout from '../../components/GlassLayout';

const FoodPartnerLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warning('All fields are required');
      return;
    }
    setLoading(true); setError('');
    try {
      const response = await api.post('/api/auth/food-partner/login', { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('userRole', 'foodPartner');
      toast.success('Logged in successfully! Welcome back! 🎉');
      // Redirect to partner profile with the ID
      setTimeout(() => {
        navigate(`/food-partner/${response.data.foodPartner._id || 'profile'}`);
      }, 500);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed';
      toast.error(errorMsg);
      setError(errorMsg);
    }
    finally { setLoading(false); }
  };

  return (
    <GlassLayout>
      <div className="mb-6 flex flex-col items-center text-center w-full">
        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.2)] mb-3">
          BUSINESS PORTAL
        </span>
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-100 to-teal-300 mb-2">Partner Login</h1>
        <p className="text-white/70 text-sm">Manage your restaurant and orders.</p>
      </div>

      <form className="w-full flex flex-col gap-4 text-left" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold tracking-wider text-emerald-300">BUSINESS EMAIL</label>
          <input type="email" placeholder="restaurant@example.com" value={email} onChange={e => setEmail(e.target.value)} required 
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold tracking-wider text-emerald-300">PASSWORD</label>
          <input type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required 
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium" />
        </div>
        <button type="submit" disabled={loading} className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 transition-all active:scale-95 border border-white/10">
          {loading ? 'Authenticating...' : 'Sign In as Partner'}
        </button>
        <div className="flex flex-col gap-2 mt-4 text-sm text-center text-white/60">
          <div>Not a partner yet? <Link to="/food-partner/register" className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-4">Register your business</Link></div>
          <div className="flex items-center justify-center gap-2">
            <div className="h-[1px] flex-1 bg-white/10" />
            <span className="text-xs text-white/40">OR</span>
            <div className="h-[1px] flex-1 bg-white/10" />
          </div>
          <Link to="/" className="text-white/80 hover:text-white font-semibold">← Back to choices</Link>
          <div>Are you a customer? <Link to="/user/login" className="text-pink-400 hover:text-pink-300 font-semibold underline underline-offset-4">Customer login</Link></div>
        </div>
      </form>
    </GlassLayout>
  );
};

export default FoodPartnerLogin;
