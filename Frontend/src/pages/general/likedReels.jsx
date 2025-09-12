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

  // Scroll handler for full-screen view (desktop + mobile)
  const handleScroll = (direction) => {
    if (activeIndex === null) return;
    if (direction === "next" && activeIndex < likedVideos.length - 1) {
      setActiveIndex(activeIndex + 1);
    } else if (direction === "prev" && activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    }
  };

  // Desktop scroll with mouse wheel
  useEffect(() => {
    if (activeIndex !== null) {
      const scrollHandler = (e) => {
        if (e.deltaY > 0) handleScroll("next");
        else if (e.deltaY < 0) handleScroll("prev");
      };

      window.addEventListener("wheel", scrollHandler);
      return () => window.removeEventListener("wheel", scrollHandler);
    }
  }, [activeIndex, likedVideos.length]);

  // Mobile swipe detection
  useEffect(() => {
    if (activeIndex === null) return;

    let touchStartY = 0;
    let touchEndY = 0;

    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      touchEndY = e.touches[0].clientY;
    };

    const handleTouchEnd = () => {
      if (touchStartY - touchEndY > 50) {
        handleScroll("next"); // Swipe up
      } else if (touchEndY - touchStartY > 50) {
        handleScroll("prev"); // Swipe down
      }
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [activeIndex, likedVideos.length]);

  return (
    <main className="liked-container">
      {/* Header Section */}
      {activeIndex === null && (
        <header className="liked-header">
          <h1 className="liked-title">❤️ Your Liked Reels</h1>
          <p className="liked-quote">“Collect memories, not just likes.”</p>
          <div className="liked-stats">
            Total Liked Videos: <strong>{likedVideos.length}</strong>
          </div>
        </header>
      )}

      {/* Thumbnail Grid View */}
      {activeIndex === null && (
        <section className="liked-grid">
          {likedVideos.length === 0 ? (
            <p className="empty-message">You haven't liked any reels yet.</p>
          ) : (
            likedVideos.map((video, index) => (
              <div
                key={video._id}
                className="liked-grid-item"
                onClick={() => setActiveIndex(index)}
              >
                <video
                  className="liked-grid-video"
                  src={video.video}
                  muted
                  style={{ objectFit: "cover", width: "100%", height: "100%" }}
                />
              </div>
            ))
          )}
        </section>
      )}

      {/* Full-screen Reel View */}
      {activeIndex !== null && (
        <div className="reel-fullscreen">
          <button className="close-btn" onClick={() => setActiveIndex(null)}>
            ✕
          </button>

          <video
            key={likedVideos[activeIndex]._id}
            className="reel-video"
            src={likedVideos[activeIndex].video}
            autoPlay
            loop
            controls={false}
          />
        </div>
      )}
    </main>
  );
};

export default Liked;
