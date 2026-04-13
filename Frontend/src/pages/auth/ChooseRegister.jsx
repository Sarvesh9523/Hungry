import React from 'react';
import { Link } from 'react-router-dom';
import GlassLayout from '../../components/GlassLayout';

const ChooseRegister = () => {
  return (
    <GlassLayout title="Join Hungry" subtitle="How would you like to get started?">
        <div className="w-full flex flex-col gap-4 text-center mt-2">
          <Link 
            to="/user/register" 
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-rose-500 to-fuchsia-600 hover:from-rose-400 hover:to-fuchsia-500 text-white font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(225,29,72,0.4)] transition-all active:scale-95"
          >
            <span className="text-2xl drop-shadow-md">👤</span> 
            <span className="text-lg">Register as User</span>
          </Link>
          
          <div className="relative my-4 flex items-center justify-center">
            <div className="absolute w-full h-[1px] bg-white/10" />
            <span className="relative bg-black/40 px-3 text-white/50 text-sm font-semibold rounded-full backdrop-blur-md border border-white/5">OR</span>
          </div>

          <Link 
            to="/food-partner/register" 
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all active:scale-95 border border-white/5"
          >
            <span className="text-2xl drop-shadow-md">🏪</span> 
            <span className="text-lg">Register as Partner</span>
          </Link>
        </div>

        <div className="mt-8 text-sm text-white/60">
          Already have an account? <Link to="/user/login" className="text-pink-400 hover:text-pink-300 font-semibold underline underline-offset-4">Sign In</Link>
        </div>
    </GlassLayout>
  );
};

export default ChooseRegister;
