import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import '../styles/bottom-nav.css'
import axios from 'axios'

const BottomNav = () => {
  const [role, setRole] = useState(null)
  const [profileId, setProfileId] = useState(null)

  useEffect(() => {
    axios.get("http://localhost:3000/api/auth/me", { withCredentials: true })
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
    <nav className="bottom-nav" role="navigation" aria-label="Bottom">
      <div className="bottom-nav__inner">
        {/* Home */}
        <NavLink to="/home" end className={({ isActive }) => `bottom-nav__item ${isActive ? 'is-active' : ''}`}>
          <span className="bottom-nav__icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 10.5 12 3l9 7.5"/>
              <path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10"/>
            </svg>
          </span>
          <span className="bottom-nav__label">Home</span>
        </NavLink>

        {/* Saved */}
        <NavLink to="/saved" className={({ isActive }) => `bottom-nav__item ${isActive ? 'is-active' : ''}`}>
          <span className="bottom-nav__icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"/>
            </svg>
          </span>
          <span className="bottom-nav__label">Saved</span>
        </NavLink>

        {/* Profile */}
        {role && profileId && (
          <NavLink 
            to={role === "user" ? `/user/profile/${profileId}` : `/food-partner/${profileId}`} 
            className={({ isActive }) => `bottom-nav__item ${isActive ? 'is-active' : ''}`}
          >
            <span className="bottom-nav__icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </span>
            <span className="bottom-nav__label">Profile</span>
          </NavLink>
        )}
      </div>
    </nav>
  )
}

export default BottomNav
