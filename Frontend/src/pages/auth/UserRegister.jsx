import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import OTPInput from '../../components/OTPInput';
import GlassLayout from '../../components/GlassLayout';

const UserRegister = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  useEffect(() => {
    if (step !== 2) return;
    setResendTimer(60);
    setCanResend(false);
    const interval = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) { setCanResend(true); clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return setError('All fields are required');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true); setError('');
    try {
      await api.post('/api/auth/user/register/send-otp', { name, email, password });
      setStep(2);
    } catch (err) { setError(err.response?.data?.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  const handleOTPComplete = (code) => setOtp(code);

  const verifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) return setError('Invalid OTP');
    setLoading(true); setError('');
    try {
      const response = await api.post('/api/auth/user/register/verify-otp', { email, otp });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      navigate('/home');
    } catch (err) { setError(err.response?.data?.message || 'Invalid OTP'); }
    finally { setLoading(false); }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setCanResend(false); setResendTimer(60); setError('');
    try {
      await api.post('/api/auth/resend-otp', { email, purpose: 'register' });
      const interval = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) { setCanResend(true); clearInterval(interval); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch (err) { setError('Failed to resend'); setCanResend(true); }
  };

  return (
    <GlassLayout title={step === 1 ? "Create account" : "Verify Email"} subtitle={step === 1 ? "Join us and discover amazing food instantly." : `Enter the 6-digit code sent to ${email}`}>
      {step === 1 && (
        <form className="w-full flex flex-col gap-4 text-left" onSubmit={handleRegisterSubmit}>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold tracking-wider text-pink-300">FULL NAME</label>
            <input type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all font-medium" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold tracking-wider text-pink-300">EMAIL</label>
            <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all font-medium" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold tracking-wider text-pink-300">PASSWORD</label>
            <input type="password" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} required 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all font-medium" />
          </div>
          {error && <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 p-2 rounded-lg text-center">{error}</div>}
          <button type="submit" disabled={loading} className="w-full mt-2 bg-gradient-to-r from-rose-500 to-fuchsia-600 hover:from-rose-400 hover:to-fuchsia-500 text-white font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(225,29,72,0.4)] disabled:opacity-50 transition-all active:scale-95">
            {loading ? 'Sending...' : 'Get OTP via Email'}
          </button>
          
          <div className="flex flex-col gap-2 mt-4 text-sm text-center text-white/60">
            <div>Already have an account? <Link to="/user/login" className="text-pink-400 hover:text-pink-300 font-semibold underline underline-offset-4">Sign in</Link></div>
            <div>Want to partner with us? <Link to="/food-partner/register" className="text-gray-400 hover:text-white font-semibold">Register as Partner</Link></div>
          </div>
        </form>
      )}

      {step === 2 && (
        <form className="w-full flex flex-col gap-4" onSubmit={verifyOTP}>
          <OTPInput onComplete={handleOTPComplete} disabled={loading} />
          {error && <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 p-2 rounded-lg text-center">{error}</div>}
          <button type="submit" disabled={loading || otp.length < 6} className="w-full bg-gradient-to-r from-rose-500 to-fuchsia-600 text-white font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(225,29,72,0.4)] disabled:opacity-50 transition-all active:scale-95">
            {loading ? 'Verifying...' : 'Create Account'}
          </button>
          <div className="text-center mt-4 text-sm text-white/60 flex flex-col gap-2">
            <div>
              Didn't receive the code? 
              <button type="button" onClick={handleResend} disabled={!canResend} className="ml-2 text-pink-400 font-semibold hover:underline disabled:opacity-50 disabled:no-underline">
                {canResend ? 'Resend Code' : `Resend in ${resendTimer}s`}
              </button>
            </div>
            <button type="button" onClick={() => setStep(1)} className="text-white/40 hover:text-white mt-2">← Back to start</button>
          </div>
        </form>
      )}
    </GlassLayout>
  );
};

export default UserRegister;
