import React, { useState, useEffect } from 'react'
import '../../styles/profile.css'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

const FoodPartnerProfile = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [videos, setVideos] = useState([])

  // Fetch food partner profile
  useEffect(() => {
    axios
      .get(`http://localhost:3000/api/food-partner/${id}`, { withCredentials: true })
      .then(response => {
        setProfile(response.data.foodPartner)
        setVideos(response.data.foodPartner.foodItems)
      })
      .catch(err => {
        console.error("Failed to fetch food partner profile", err)
      })
  }, [id])

  // Logout handler (food partner only)
  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:3000/api/auth/food-partner/logout", {
        withCredentials: true,
      })
      navigate("/")
    } catch (error) {
      console.error("Logout failed", error)
    }
  }

  return (
    <main className="profile-page">
      <section className="profile-header">
        <div className="profile-meta">
          <img
            className="profile-avatar"
            src="https://images.unsplash.com/photo-1754653099086-3bddb9346d37?w=500&auto=format&fit=crop&q=60"
            alt="Food Partner Avatar"
          />

          <div className="profile-info">
            <h1 className="profile-pill profile-business">{profile?.name}</h1>
            <p className="profile-pill profile-address">{profile?.address}</p>
          </div>
        </div>

        <div className="profile-stats">
          <div className="profile-stat">
            <span className="profile-stat-label">total meals</span>
            <span className="profile-stat-value">{profile?.totalMeals}</span>
            <span className="profile-stat-value">{videos.length}</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat-label">customer served</span>
            <span className="profile-stat-value">{profile?.customersServed}</span>
          </div>
        </div>

        {/* Logout button */}
        <button className="logout-btn" onClick={handleLogout} >
          Logout
        </button>
      </section>

      <hr className="profile-sep" />

      <section className="profile-grid" aria-label="Videos">
        {videos.map(v => (
          <div key={v._id} className="profile-grid-item">
            <video
              className="profile-grid-video"
              style={{ objectFit: "cover", width: "100%", height: "100%" }}
              src={v.video}
              muted
              autoPlay
            ></video>
          </div>
        ))}
      </section>
    </main>
  )
}

export default FoodPartnerProfile
