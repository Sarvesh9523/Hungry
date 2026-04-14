import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import GlassLayout from '../../components/GlassLayout';

const ChooseRegister = () => {
  const [authType, setAuthType] = useState('register'); // 'login' | 'register'

  return (
    <GlassLayout title="Welcome to Hungry" subtitle={authType === 'register' ? "Choose how to get started" : "Sign in to your account"}>
      
      {/* AUTH TYPE TOGGLE */}
      <div className="w-full bg-white/5 border border-white/10 rounded-xl p-1 flex gap-2 mb-6">
        <button
          onClick={() => setAuthType('login')}
          className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all ${
            authType === 'login'
              ? 'bg-white/10 text-white shadow-md'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => setAuthType('register')}
          className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all ${
            authType === 'register'
              ? 'bg-white/10 text-white shadow-md'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Register
        </button>
      </div>

      {/* REGISTER MODE */}
      {authType === 'register' && (
        <div className="w-full flex flex-col gap-4 text-center">
          <Link
            to="/user/register"
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-rose-500 to-fuchsia-600 hover:from-rose-400 hover:to-fuchsia-500 text-white font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(225,29,72,0.4)] transition-all active:scale-95"
          >
            <span className="text-2xl drop-shadow-md">👤</span>
            <div className="text-left">
              <span className="text-lg block">Register as User</span>
              <span className="text-xs text-white/70">Order food with OTP login</span>
            </div>
          </Link>

          <div className="relative my-2 flex items-center justify-center">
            <div className="absolute w-full h-[1px] bg-white/10" />
            <span className="relative bg-black/40 px-3 text-white/50 text-xs font-semibold rounded-full backdrop-blur-md border border-white/5">OR</span>
          </div>

          <Link
            to="/food-partner/register"
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all active:scale-95 border border-white/5"
          >
            <span className="text-2xl drop-shadow-md">🏪</span>
            <div className="text-left">
              <span className="text-lg block">Register as Partner</span>
              <span className="text-xs text-white/70">Sell food & manage orders</span>
            </div>
          </Link>
        </div>
      )}

      {/* LOGIN MODE */}
      {authType === 'login' && (
        <div className="w-full flex flex-col gap-4 text-center">
          <Link
            to="/user/login"
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-rose-500 to-fuchsia-600 hover:from-rose-400 hover:to-fuchsia-500 text-white font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(225,29,72,0.4)] transition-all active:scale-95"
          >
            <span className="text-2xl drop-shadow-md">👤</span>
            <div className="text-left">
              <span className="text-lg block">User Login</span>
            </div>
          </Link>

          <div className="relative my-2 flex items-center justify-center">
            <div className="absolute w-full h-[1px] bg-white/10" />
            <span className="relative bg-black/40 px-3 text-white/50 text-xs font-semibold rounded-full backdrop-blur-md border border-white/5">OR</span>
          </div>

          <Link
            to="/food-partner/login"
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all active:scale-95 border border-white/5"
          >
            <span className="text-2xl drop-shadow-md">🏪</span>
            <div className="text-left">
              <span className="text-lg block">Partner Login</span>
              <span className="text-xs text-white/70">Manage your restaurant</span>
            </div>
          </Link>
        </div>
      )}
    </GlassLayout>
  );
};

export default ChooseRegister;
