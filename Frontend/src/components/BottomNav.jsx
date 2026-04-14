import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import api from '../services/api'

const BottomNav = () => {
  const [role, setRole] = useState(null)
  const [profileId, setProfileId] = useState(null)

  useEffect(() => {
    api.get(`/api/auth/me`)
      .then(res => {
        setRole(res.data.role)
        setProfileId(res.data.profile._id)
      })
      .catch(() => {
        setRole(null)
        setProfileId(null)
      })
  }, [])

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 pointer-events-none" role="navigation" aria-label="Bottom">

      {/* Full-width black bar */}
      <div className="w-full bg-black/80 backdrop-blur-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.8)] pointer-events-auto relative overflow-hidden rounded-t-3xl">

        {/* Arced top border */}
        <div className="absolute inset-x-0 -top-px h-px">
          <svg viewBox="0 0 400 2" preserveAspectRatio="none" className="w-full h-4 -mt-3">
            <path
              d="M0,8 Q200,-4 400,8"
              fill="none"
              stroke="url(#navGrad)"
              strokeWidth="1"
            />
            <defs>
              <linearGradient id="navGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="50%" stopColor="rgb(236,72,153)" stopOpacity="0.5" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* rest of your nav content unchanged */}
        {/* Gradient line */}
        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-pink-500/50 to-transparent" />

        {/* Icons — full width on mobile, reel-column width on desktop */}
        <div
          className="flex justify-around items-center px-8 py-3 mx-auto"
          style={{ width: undefined }}
        >
          <div className="w-full md:w-[calc(100dvh*9/16)] flex justify-around items-center">

            {/* Home - Only for regular users */}
            {role === "user" && (
              <NavLink
                to="/home"
                end
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-pink-400 scale-110 drop-shadow-[0_0_8px_rgba(244,114,182,0.6)]' : 'text-white/60 hover:text-white/90'}`
                }
              >
                <span className="w-7 h-7 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 10.5 12 3l9 7.5" />
                    <path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10" />
                  </svg>
                </span>
                <span className="text-[10px] font-bold tracking-wider">Home</span>
              </NavLink>
            )}

            {/* Saved - Only for regular users */}
            {role === "user" && (
              <NavLink
                to="/saved"
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 'text-white/60 hover:text-white/90'}`
                }
              >
                <span className="w-7 h-7 flex items-center justify-center">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
                  </svg>
                </span>
                <span className="text-[10px] font-bold tracking-wider">Saved</span>
              </NavLink>
            )}

            {/* Profile */}
            {role && profileId && (
              <NavLink
                to={role === "user" ? `/user/profile/${profileId}` : `/food-partner/${profileId}`}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 transition-all duration-300 ${isActive
                    ? (role === "user"
                      ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.6)]'
                      : 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]')
                    + ' scale-110'
                    : 'text-white/60 hover:text-white/90'
                  }`
                }
              >
                <span className="w-7 h-7 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <span className="text-[10px] font-bold tracking-wider">Profile</span>
              </NavLink>
            )}

          </div>
        </div>
      </div>
    </nav>
  )
}

export default BottomNav