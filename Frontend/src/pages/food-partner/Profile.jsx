import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import backgroundPoster from '../../assets/background_poster.png';


const FoodPartnerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    api.get(`/api/food-partner/${id}`).then(response => {
      setProfile(response.data.foodPartner);
      setVideos(response.data.foodPartner.foodItems || []);
    }).catch(err => {
      console.error("Failed to fetch food partner profile", err);
    });
  }, [id]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const totalLikes = videos.reduce((acc, v) => acc + (v.likeCount || 0), 0);
  const totalSaves = videos.reduce((acc, v) => acc + (v.savesCount || 0), 0);
  const totalShares = videos.reduce((acc, v) => acc + (v.sharesCount || 0), 0);

  return (
    <div 
      className="min-h-screen w-full relative bg-fixed bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundPoster})` }}
    >
      <div className="absolute inset-0 bg-black/60 z-0" />
      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-900/40 via-teal-900/30 to-black z-0" />

      {profile && (
        <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col pt-8 pb-20 px-4 min-h-screen">
          
          <section className="bg-glass rounded-3xl p-8 mb-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-tr from-rose-500 to-fuchsia-500 flex items-center justify-center text-white text-5xl md:text-6xl border-4 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.3)] shrink-0 overflow-hidden relative">
              <span className="drop-shadow-lg p-3">👨‍🍳</span>
            </div>
            
            <div className="flex-1 text-center md:text-left flex flex-col items-center md:items-start z-10">
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold tracking-widest mb-3 inline-block">BUSINESS PARTNER</span>
              <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-200 mb-2">{profile.name}</h1>
              <p className="text-white/70 text-sm flex items-center gap-2 mb-6">
                📍 {profile.address || 'Address not listed'}
              </p>

              {/* Analytics Panel */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col justify-center items-center backdrop-blur shadow-inner">
                  <span className="text-white/50 text-xs font-bold tracking-wider uppercase mb-1">Posts</span>
                  <span className="text-2xl font-black text-white drop-shadow">{videos.length}</span>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex flex-col justify-center items-center backdrop-blur shadow-inner">
                  <span className="text-red-400/80 text-xs font-bold tracking-wider uppercase mb-1">Total Likes</span>
                  <span className="text-2xl font-black text-white drop-shadow">{totalLikes}</span>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex flex-col justify-center items-center backdrop-blur shadow-inner">
                  <span className="text-amber-400/80 text-xs font-bold tracking-wider uppercase mb-1">Total Saves</span>
                  <span className="text-2xl font-black text-white drop-shadow">{totalSaves}</span>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl flex flex-col justify-center items-center backdrop-blur shadow-inner">
                  <span className="text-blue-400/80 text-xs font-bold tracking-wider uppercase mb-1">Total Shares</span>
                  <span className="text-2xl font-black text-white drop-shadow">{totalShares}</span>
                </div>
              </div>
            </div>

            <button 
              className="absolute top-6 right-6 px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors rounded-xl text-sm font-bold border border-red-500/30 backdrop-blur z-10" 
              onClick={handleLogout}
            >
               Logout
            </button>
          </section>

          <header className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white drop-shadow-md">All Posts</h2>
          </header>

          <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {videos.length === 0 ? (
              <p className="col-span-full text-center text-white/50 py-10">No videos uploaded yet.</p>
            ) : (
              videos.map(v => (
                <div key={v._id} className="bg-black border border-white/20 rounded-2xl overflow-hidden aspect-[3/4] relative group shadow-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all">
                  <video
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    src={v.video}
                    muted
                    loop
                    autoPlay
                    playsInline
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white font-bold text-sm drop-shadow line-clamp-1">{v.name || 'Untitled'}</span>
                    <div className="flex items-center gap-3 mt-2 text-xs font-semibold text-white/80">
                      <span className="flex items-center gap-1"><span className="text-red-400">❤️</span> {v.likeCount || 0}</span>
                      <span className="flex items-center gap-1"><span className="text-amber-400">🔖</span> {v.savesCount || 0}</span>
                      <span className="flex items-center gap-1"><span className="text-blue-400">📤</span> {v.sharesCount || 0}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </section>

        </div>
      )}
    </div>
  );
};

export default FoodPartnerProfile;
