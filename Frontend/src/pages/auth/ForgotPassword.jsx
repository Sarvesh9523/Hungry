import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import OTPInput from '../../components/OTPInput';
import GlassLayout from '../../components/GlassLayout';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.post('/api/auth/user/forgot-password', { email: email.trim() });
      setStep(2);
    } catch (err) { setError(err.response?.data?.message || "Failed to send OTP"); }
    finally { setLoading(false); }
  };

  const handleOTPComplete = (code) => setOtp(code);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp || otp.length < 6) return setError('Please enter the 6-digit OTP');
    if (newPassword.length < 6) return setError('Password must be at least 6 characters');
    if (newPassword !== confirmPassword) return setError('Passwords do not match');

    setLoading(true);
    try {
      await api.post('/api/auth/user/reset-password', { email: email.trim(), otp, newPassword });
      setStep(3);
    } catch (err) { setError(err.response?.data?.message || "Failed to reset password"); }
    finally { setLoading(false); }
  };

  const handleResend = async () => {
    setCanResend(false); setResendTimer(60); setError('');
    try {
      await api.post('/api/auth/resend-otp', { email: email.trim(), purpose: 'forgot-password' });
      const interval = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) { setCanResend(true); clearInterval(interval); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch (err) { setError("Failed to resend"); setCanResend(true); }
  };

  return (
    <GlassLayout 
      title={step === 1 ? "Forgot password?" : step === 2 ? "Reset password" : "Password reset!"} 
      subtitle={step === 1 ? "Enter your email and we'll send you a reset code" : step === 2 ? `Enter the code sent to ${email}` : "Your password has been changed successfully. All active sessions have been revoked for security."}
    >
      {step === 1 && (
        <form className="w-full flex flex-col gap-4 text-left" onSubmit={handleEmailSubmit}>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold tracking-wider text-pink-300">EMAIL</label>
            <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all font-medium" />
          </div>
          {error && <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 p-2 rounded-lg text-center">{error}</div>}
          <button type="submit" disabled={loading} className="w-full mt-2 bg-gradient-to-r from-rose-500 to-fuchsia-600 hover:from-rose-400 hover:to-fuchsia-500 text-white font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(225,29,72,0.4)] disabled:opacity-50 transition-all active:scale-95">
            {loading ? 'Sending...' : 'Send Reset Code'}
          </button>
          <div className="text-center mt-4 text-sm text-white/60">
            <Link to="/user/login" className="text-pink-400 hover:text-pink-300 font-semibold underline underline-offset-4">← Back to login</Link>
          </div>
        </form>
      )}

      {step === 2 && (
        <form className="w-full flex flex-col gap-4 text-left" onSubmit={handleResetPassword}>
          <OTPInput onComplete={handleOTPComplete} disabled={loading} />
          
          <div className="flex flex-col gap-1 mt-2">
            <label className="text-xs font-bold tracking-wider text-pink-300">NEW PASSWORD</label>
            <input type="password" placeholder="Min 6 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} required 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all font-medium" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold tracking-wider text-pink-300">CONFIRM PASSWORD</label>
            <input type="password" placeholder="Re-enter password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all font-medium" />
          </div>

          {error && <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 p-2 rounded-lg text-center">{error}</div>}
          <button type="submit" disabled={loading || otp.length < 6} className="w-full bg-gradient-to-r from-rose-500 to-fuchsia-600 hover:from-rose-400 hover:to-fuchsia-500 text-white font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(225,29,72,0.4)] disabled:opacity-50 transition-all active:scale-95">
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
          
          <div className="text-center mt-4 text-sm text-white/60 flex flex-col gap-2">
            <div>
              Didn't receive the code? 
              <button type="button" onClick={handleResend} disabled={!canResend} className="ml-2 text-pink-400 font-semibold hover:underline disabled:opacity-50 disabled:no-underline">
                {canResend ? 'Resend Code' : `Resend in ${resendTimer}s`}
              </button>
            </div>
            <button type="button" onClick={() => {setStep(1); setError('');}} className="text-white/40 hover:text-white mt-2">← Back</button>
          </div>
        </form>
      )}

      {step === 3 && (
        <div className="w-full flex justify-center">
          <button onClick={() => navigate('/user/login')} className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all active:scale-95">
            Go to Login
          </button>
        </div>
      )}
    </GlassLayout>
  );
};

export default ForgotPassword;
