import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/profile.css';

const FoodPartnerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/food-partner/login");

    axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/food-partner/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(response => {
      setProfile(response.data.foodPartner);
      setVideos(response.data.foodPartner.foodItems || []);
    }).catch(err => {
      console.error("Failed to fetch food partner profile", err);
      navigate("/food-partner/login");
    });
  }, [id, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <main className="profile-page">
      {profile && (
        <>
          <section className="profile-header">
            <div className="profile-meta">
              <img
                className="profile-avatar"
                src="https://images.unsplash.com/photo-1754653099086-3bddb9346d37?w=500&auto=format&fit=crop&q=60"
                alt="Food Partner Avatar"
              />
              <div className="profile-info">
                <h1 className="profile-pill profile-business">{profile.name}</h1>
                <p className="profile-pill profile-address">{profile.address}</p>
              </div>
            </div>

            <div className="profile-stats">
              <div className="profile-stat">
                <span className="profile-stat-label">Total Meals</span>
                <span className="profile-stat-value">{videos.length}</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-label">Customers Served</span>
                <span className="profile-stat-value">{profile.customersServed || 0}</span>
              </div>
            </div>

            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </section>

          <hr className="profile-sep" />

          <section className="profile-grid" aria-label="Videos">
            {videos.length === 0 ? (
              <p>No videos uploaded yet.</p>
            ) : (
              videos.map(v => (
                <div key={v._id} className="profile-grid-item">
                  <video
                    className="profile-grid-video"
                    style={{ objectFit: "cover", width: "100%", height: "100%" }}
                    src={v.video}
                    muted
                    loop
                    controls
                  />
                </div>
              ))
            )}
          </section>
        </>
      )}
    </main>
  );
};

export default FoodPartnerProfile;
