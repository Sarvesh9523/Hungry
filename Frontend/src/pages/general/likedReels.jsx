import React, { useEffect, useState } from 'react';
import "../../styles/liked.css";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Liked = () => {
  const [likedVideos, setLikedVideos] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null); // Fullscreen reel index
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Fetch liked videos
  useEffect(() => {
    const fetchLiked = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/food/liked`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setLikedVideos(response.data.foods || []);
      } catch (err) {
        console.error("Failed to fetch liked videos:", err);
        alert("Session expired. Please login again.");
        navigate("/user/login");
      }
    };

    fetchLiked();
  }, [token, navigate]);

  /* ===============================
     Scroll Handler for Desktop & Mobile
     =============================== */
  const handleScroll = (e) => {
    if (activeIndex === null) return;

    // Desktop scroll
    if (e.deltaY > 0 && activeIndex < likedVideos.length - 1) {
      setActiveIndex(activeIndex + 1);
    } else if (e.deltaY < 0 && activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    }
  };

  // Touch scroll for mobile
  let touchStartY = null;

  const handleTouchStart = (e) => {
    touchStartY = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    if (touchStartY === null) return;

    const touchEndY = e.touches[0].clientY;
    const deltaY = touchStartY - touchEndY;

    if (deltaY > 50 && activeIndex < likedVideos.length - 1) {
      setActiveIndex(activeIndex + 1); // Swipe up → Next video
      touchStartY = null;
    } else if (deltaY < -50 && activeIndex > 0) {
      setActiveIndex(activeIndex - 1); // Swipe down → Previous video
      touchStartY = null;
    }
  };

  useEffect(() => {
    if (activeIndex !== null) {
      window.addEventListener("wheel", handleScroll);
      window.addEventListener("touchstart", handleTouchStart);
      window.addEventListener("touchmove", handleTouchMove);
      return () => {
        window.removeEventListener("wheel", handleScroll);
        window.removeEventListener("touchstart", handleTouchStart);
        window.removeEventListener("touchmove", handleTouchMove);
      };
    }
  }, [activeIndex, likedVideos]);

  return (
    <main className="liked-page">
      {/* Thumbnail Grid View */}
      {activeIndex === null && (
        <section className="liked-grid-wrapper">
          {likedVideos.length === 0 ? (
            <p className="empty-message">No liked videos yet.</p>
          ) : (
            <div className="liked-grid">
              {likedVideos.map((video, index) => (
                <div
                  key={video._id}
                  className="liked-grid-item"
                  onClick={() => setActiveIndex(index)} // Open full-screen
                >
                  <video
                    className="liked-grid-video"
                    src={video.video}
                    muted
                    preload="metadata"
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Full-screen TikTok/Instagram Style View */}
      {activeIndex !== null && (
        <div className="liked-reel-fullscreen">
          <button
            className="liked-close-btn"
            onClick={() => setActiveIndex(null)}
          >
            ✕
          </button>

          <video
            key={likedVideos[activeIndex]._id}
            className="liked-reel-video"
            src={likedVideos[activeIndex].video}
            autoPlay
            controls
          />
        </div>
      )}
    </main>
  );
};

export default Liked;
