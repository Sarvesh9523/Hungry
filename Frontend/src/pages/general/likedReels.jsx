import React, { useEffect, useState } from 'react';
import "../../styles/liked.css"; // Your existing styles should work
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ReelFeed from '../../components/ReelFeed';

const Liked = () => {
  const [likedVideos, setLikedVideos] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null); // Used to toggle between grid and reel view
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Fetch liked videos (This part remains the same)
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

  // **REMOVED**: All useEffect hooks for 'wheel' and 'touch' events are no longer needed.
  // **REMOVED**: The handleScroll function is no longer needed.

  return (
    <main className="liked-container">
      {/* Grid View Logic (remains the same) */}
      {activeIndex === null && (
        <>
          <header className="liked-header">
            <h1 className="liked-title">Your Liked Reels</h1>
            <p className="liked-quote">“Collect memories, not just likes.”</p>
            <div className="liked-stats">
              Total Liked Videos: <strong>{likedVideos.length}</strong>
            </div>
          </header>
          <section className="liked-grid">
            {likedVideos.length === 0 ? (
              <p className="empty-message">You haven't liked any reels yet.</p>
            ) : (
              likedVideos.map((video, index) => (
                <div
                  key={video._id}
                  className="liked-grid-item"
                  onClick={() => setActiveIndex(index)} // This now just toggles the view
                >
                  <video
                    className="liked-grid-video"
                    src={video.video}
                    muted
                    autoPlay
                    style={{ objectFit: "cover", width: "100%", height: "100%" }}
                  />
                </div>
              ))
            )}
          </section>
        </>
      )}

      {/* **MODIFIED**: Full-screen Reel View now uses the ReelFeed component */}
      {activeIndex !== null && (
        <div>
          <button className="close-btn" onClick={() => setActiveIndex(null)}>
            ✕
          </button>
          <ReelFeed
            items={likedVideos}
            initialActiveId={likedVideos[activeIndex]?._id} // Tell ReelFeed where to start
            emptyMessage="No liked videos to display."
          />
        </div>
      )}
    </main>
  );
};

export default Liked;