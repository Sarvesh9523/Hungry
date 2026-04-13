import React from 'react';
import backgroundPoster from '../assets/background_poster.png';
import logo from '../assets/Hungry_peep_logo.png';

const GlassLayout = ({ children, title, subtitle }) => {
  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-fixed bg-cover bg-center relative"
      style={{ backgroundImage: `url(${backgroundPoster})` }}
    >
      {/* Dark overlay for better readability */}
      <div className="absolute inset-0 bg-black/60 z-0"></div>
      
      {/* Gradient Mix for Instagram x Zomato vibe */}
      <div className="absolute inset-0 bg-gradient-to-tr from-rose-600/40 via-fuchsia-600/30 to-purple-800/30 mix-blend-color z-0"></div>

      <div className="z-10 w-full max-w-md bg-glass rounded-3xl p-8 flex flex-col items-center text-center">
        <img src={logo} alt="Hungry Peeps Logo" className="w-24 h-24 object-contain mb-4 drop-shadow-xl" />
        {title && <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-pink-200 mb-2">{title}</h1>}
        {subtitle && <p className="text-white/70 text-sm mb-8">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
};

export default GlassLayout;
