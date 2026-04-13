import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from '../../services/api';
import { Edit3 } from "lucide-react";
import backgroundPoster from '../../assets/background_poster.png';

const avatarOptions = [
  "/Avatar/A1.jpg", "/Avatar/A2.jpg", "/Avatar/A3.jpg", "/Avatar/A4.jpg",
  "/Avatar/A5.jpg", "/Avatar/A6.jpg", "/Avatar/A7.jpg", "/Avatar/A8.jpg",
  "/Avatar/A9.jpg", "/Avatar/A10.jpg", "/Avatar/A11.jpg", "/Avatar/A12.jpg",
];

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState(avatarOptions[0]);
  const [nickname, setNickname] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/auth/me').then(res => {
      if (res.data.role !== "user") return navigate("/user/login");
      const profile = res.data.profile;
      setUser(profile);
      setFullName(profile.fullName || "");
      setEmail(profile.email || "");
      setNickname(profile.nickname || "");
      if (profile.avatar) setSelectedAvatar(profile.avatar);
    }).catch(err => {
      console.error("Failed to fetch user profile", err);
    });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/user/login");
  };

  const handleSaveProfile = async () => {
    try {
      await api.put(`/api/auth/profile`, {
        nickname, avatar: selectedAvatar
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  return (
    <div 
      className="min-h-screen w-full relative bg-fixed bg-cover bg-center flex items-center justify-center p-4 py-12"
      style={{ backgroundImage: `url(${backgroundPoster})` }}
    >
      <div className="absolute inset-0 bg-black/60 z-0" />
      <div className="absolute inset-0 bg-gradient-to-tr from-rose-600/30 via-fuchsia-600/20 to-purple-800/30 mix-blend-color z-0" />

      {user && (
        <div className="relative z-10 w-full max-w-2xl bg-glass border border-white/10 shadow-2xl rounded-3xl p-6 md:p-10 flex flex-col items-center">
          
          <div className="relative mb-6">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1 bg-gradient-to-tr from-pink-500 to-rose-400 shadow-[0_0_20px_rgba(236,72,153,0.5)]">
              <img src={selectedAvatar} alt="Selected Avatar" className="w-full h-full rounded-full object-cover border-4 border-black" />
            </div>
          </div>

          <div className="mb-8 w-full flex justify-center">
            {isEditingNickname ? (
              <input
                type="text"
                className="bg-white/10 border border-pink-500/50 rounded-xl px-4 py-2 text-white text-center font-bold text-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.3)]"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onBlur={() => { setIsEditingNickname(false); handleSaveProfile(); }}
                onKeyDown={(e) => { if (e.key === "Enter") { setIsEditingNickname(false); handleSaveProfile(); } }}
                placeholder="Enter nickname"
                autoFocus
              />
            ) : (
              <div 
                className="flex items-center gap-3 cursor-pointer group hover:bg-white/5 px-4 py-2 rounded-xl transition-colors"
                onClick={() => setIsEditingNickname(true)}
              >
                <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-pink-200">{nickname || "Add Nickname"}</span>
                <Edit3 size={20} className="text-pink-400 opacity-50 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
          </div>

          <div className="w-full mb-8">
            <h3 className="text-xs font-bold tracking-wider text-pink-300 mb-3 text-center uppercase">Choose your Avatar</h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {avatarOptions.map((avatar, idx) => (
                <button
                  key={idx}
                  className={`relative aspect-square rounded-full transition-all duration-300 ${selectedAvatar === avatar ? "scale-110 shadow-[0_0_15px_rgba(236,72,153,0.5)] ring-2 ring-pink-500 z-10" : "opacity-60 hover:opacity-100 hover:scale-105"}`}
                  onClick={() => { setSelectedAvatar(avatar); handleSaveProfile(); }}
                >
                  <img src={avatar} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover rounded-full" />
                </button>
              ))}
            </div>
          </div>

          <div className="w-full flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-xs font-bold tracking-wider text-white/50">FULL NAME</label>
              <input
                type="text"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-pink-500 font-medium"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                onBlur={handleSaveProfile}
              />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-xs font-bold tracking-wider text-white/50">EMAIL</label>
              <input
                type="email"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white/60 font-medium cursor-not-allowed"
                placeholder="Email"
                value={email}
                readOnly
              />
            </div>
          </div>

          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3">
            <button 
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              onClick={() => navigate("/saved")}
            >
              🔖 Saved Reels
            </button>
            <button 
              className="bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 text-pink-300 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              onClick={() => navigate("/liked")}
            >
              ❤️ Liked Reels
            </button>
            <button 
              className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 md:col-start-3"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default UserProfile;
