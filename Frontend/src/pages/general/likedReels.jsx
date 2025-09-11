import React, { useEffect, useState } from 'react';
import "../../styles/liked.css";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Liked = () => {
  const [likedVideos, setLikedVideos] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null); // For full-screen player
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Fetch liked videos
  useEffect(() => {
    const fetchLiked = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/food/liked`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setLikedVideos(response.data.foods || []);
      } catch (err) {
        console.error("Failed to fetch liked videos:", err);
        alert("Session expired. Please login again.");
        navigate("/user/login");
      }
    };

    fetchLiked();
  }, [token, navigate]);

  // Scroll handler for full-screen view
  const handleScroll = (e) => {
    if (activeIndex === null) return;
    if (e.deltaY > 0 && activeIndex < likedVideos.length - 1) {
      setActiveIndex(activeIndex + 1);
    } else if (e.deltaY < 0 && activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    }
  };

  // Add scroll listener only when full-screen mode is active
  useEffect(() => {
    if (activeIndex !== null) {
      window.addEventListener("wheel", handleScroll);
      return () => window.removeEventListener("wheel", handleScroll);
    }
  }, [activeIndex]);

  return (
    <main className="profile-page">
      {/* Thumbnail Grid View */}
      {activeIndex === null && (
        <>
          <header className="profile-header">
            <div className="profile-meta">
              <h1 className="profile-pill profile-business">Liked Reels</h1>
              <p className="profile-pill profile-address">
                Your favorite videos in one place.
              </p>
            </div>
            <div className="profile-stats">
              <div className="profile-stat">
                <span className="profile-stat-label">Total Liked</span>
                <span className="profile-stat-value">{likedVideos.length}</span>
              </div>
            </div>
          </header>

          <section className="profile-grid" aria-label="Liked Videos">
            {likedVideos.length === 0 ? (
              <p>No liked videos yet.</p>
            ) : (
              likedVideos.map((video, index) => (
                <div
                  key={video._id}
                  className="profile-grid-item"
                  onClick={() => setActiveIndex(index)} // Open full-screen
                >
                  <video
                    className="profile-grid-video"
                    src={video.video}
                    muted
                    style={{ objectFit: "cover", width: "100%", height: "100%" }}
                  />
                </div>
              ))
            )}
          </section>
        </>
      )}

      {/* Full-screen TikTok/Instagram Style View */}
      {activeIndex !== null && (
        <div className="reel-fullscreen">
          <button
            className="close-btn"
            onClick={() => setActiveIndex(null)}
          >
            ✕
          </button>

          <video
            key={likedVideos[activeIndex]._id}
            className="reel-video"
            src={likedVideos[activeIndex].video}
            autoPlay
            controls
          />

          <div className="reel-info">
            <h2>{likedVideos[activeIndex].description}</h2>
            <p>❤️ {likedVideos[activeIndex].likeCount} Likes</p>
          </div>
        </div>
      )}
    </main>
  );
};

export default Liked;
