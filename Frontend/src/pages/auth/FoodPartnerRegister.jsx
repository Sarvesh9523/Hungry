import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from '../../utils/toast';
import GlassLayout from '../../components/GlassLayout';
import OTPInput from '../../components/OTPInput';

const FoodPartnerRegister = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // Step 1: Form, Step 2: OTP Verification

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    contactName: '',
    phone: '',
    address: ''
  });

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  // Resend timer effect
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();

    const { name, email, password, contactName, phone, address } = form;

    if (!name || !email || !password || !contactName || !phone || !address) {
      toast.warning('All fields are required');
      return;
    }

    if (password.length < 6) {
      toast.warning('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/api/auth/food-partner/register/send-otp', form);
      toast.success('OTP sent to your business email!');
      setStep(2); // Move to OTP verification step
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to send OTP';
      toast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and Complete Registration
  const handleOTPComplete = (code) => setOtp(code);

  const verifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      toast.warning('Please enter a valid 6-digit OTP');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/api/auth/food-partner/register/verify-otp', {
        email: form.email,
        otp
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('userRole', 'foodPartner');

      toast.success('Registration successful! Welcome aboard! 🎉');
      setTimeout(() => {
        navigate(`/food-partner/${response.data.foodPartner._id}`);
      }, 500);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Invalid OTP';
      toast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (!canResend) return;
    setCanResend(false);
    setResendTimer(60);
    setError('');
    
    try {
      await api.post('/api/auth/resend-otp', { email: form.email, purpose: 'food-partner-register' });
      toast.success('OTP resent to your email!');
      const interval = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) { setCanResend(true); clearInterval(interval); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      const errorMsg = 'Failed to resend OTP';
      toast.error(errorMsg);
      setError(errorMsg);
      setCanResend(true);
    }
  };

  return (
    <GlassLayout>
      {/* HEADER */}
      <div className="mb-6 text-center">
        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold tracking-widest shadow mb-3">
          BUSINESS PORTAL
        </span>

        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-100 to-teal-300">
          {step === 1 ? 'Become a Partner' : 'Verify Business Email'}
        </h1>

        <p className="text-white/70 text-sm mt-1">
          {step === 1 ? 'Grow your restaurant with Hungry 🚀' : `Enter the 6-digit code sent to ${form.email}`}
        </p>
      </div>

      {/* STEP 1: FORM */}
      {step === 1 && (
        <form onSubmit={handleSendOTP} className="flex flex-col gap-4">
          {/* ROW 1 */}
          <div className="grid grid-cols-2 gap-4">
            <Input label="RESTAURANT NAME" name="name" value={form.name} onChange={handleChange} />
            <Input label="OWNER NAME" name="contactName" value={form.contactName} onChange={handleChange} />
          </div>

          {/* ROW 2 */}
          <div className="grid grid-cols-2 gap-4">
            <Input label="BUSINESS EMAIL" name="email" type="email" value={form.email} onChange={handleChange} />
            <Input label="PHONE NUMBER" name="phone" value={form.phone} onChange={handleChange} />
          </div>

          {/* ROW 3 */}
          <div className="grid grid-cols-2 gap-4">
            <Input label="BUSINESS ADDRESS" name="address" value={form.address} onChange={handleChange} />
            <Input label="PASSWORD" name="password" type="password" value={form.password} onChange={handleChange} />
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 transition-all active:scale-95"
          >
            {loading ? 'Sending OTP...' : 'Continue'}
          </button>

          {/* LINKS */}
          <div className="flex flex-col gap-2 text-center text-sm text-white/60 mt-6">
            <div>Already a partner? <Link to="/food-partner/login" className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-4">Login</Link></div>
            <div className="flex items-center justify-center gap-2">
              <div className="h-[1px] flex-1 bg-white/10" />
              <span className="text-xs text-white/40">OR</span>
              <div className="h-[1px] flex-1 bg-white/10" />
            </div>
            <Link to="/" className="text-white/80 hover:text-white font-semibold">← Back to choices</Link>
            <div>Not a business owner? <Link to="/user/register" className="text-pink-400 hover:text-pink-300 font-semibold underline underline-offset-4">Register as User</Link></div>
          </div>
        </form>
      )}

      {/* STEP 2: OTP VERIFICATION */}
      {step === 2 && (
        <form onSubmit={verifyOTP} className="flex flex-col gap-4">
          <OTPInput onComplete={handleOTPComplete} disabled={loading} />
          
          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 transition-all active:scale-95"
          >
            {loading ? 'Verifying...' : 'Complete Registration'}
          </button>

          <div className="text-center mt-4 text-sm text-white/60 flex flex-col gap-2">
            <div>
              Didn't receive the code?
              <button
                type="button"
                onClick={handleResend}
                disabled={!canResend}
                className="ml-2 text-emerald-400 font-semibold hover:underline disabled:opacity-50 disabled:no-underline"
              >
                {canResend ? 'Resend Code' : `Resend in ${resendTimer}s`}
              </button>
            </div>
            <button type="button" onClick={() => setStep(1)} className="text-white/40 hover:text-white mt-2">← Back to form</button>
          </div>
        </form>
      )}
    </GlassLayout>
  );
};

/* 🔥 Reusable Input Component (clean UI) */
const Input = ({ label, name, value, onChange, type = "text" }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-bold tracking-wider text-emerald-300">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={`Enter ${label.toLowerCase()}`}
      className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
    />
  </div>
);

export default FoodPartnerRegister;