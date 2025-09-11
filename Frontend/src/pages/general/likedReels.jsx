import React, { useState } from "react";
import { useEffect, useRef } from "react";
import "../../styles/liked.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LikedReels = () => {
  const [videos, setVideos] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const containerRef = useRef(null);

  // Fetch liked videos
  useEffect(() => {
    const fetchLiked = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/food/liked`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setVideos(response.data.foods || []);
      } catch (err) {
        console.error("Failed to fetch liked videos:", err);
        alert("Session expired. Please login again.");
        navigate("/user/login");
      }
    };
    fetchLiked();
  }, [token, navigate]);

  // IntersectionObserver for auto-play/pause
  useEffect(() => {
    if (!containerRef.current) return;

    const options = { root: null, threshold: [0, 0.25, 0.6, 0.9, 1] };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.intersectionRatio >= 0.6) {
          video.play().catch(() => {});
          setActiveIndex(parseInt(video.dataset.index, 10));
        } else {
          video.pause();
        }
      });
    }, options);

    const videoEls = containerRef.current.querySelectorAll("video");
    videoEls.forEach((v) => observer.observe(v));

    return () => observer.disconnect();
  }, [videos]);

  if (!videos.length) {
    return <p className="empty-message">No liked videos yet.</p>;
  }

  return (
    <div className="liked-container">
      <div className="liked-header">
        <h1 className="liked-title">Liked Reels</h1>
        <p className="liked-quote">Your favorite moments, all in one place.</p>
      </div>

      <div className="reel-scroll-container" ref={containerRef}>
        {videos.map((video, index) => (
          <div className="reel-scroll-item" key={video._id}>
            <video
              src={video.video}
              className="reel-video"
              muted
              loop
              playsInline
              data-index={index}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LikedReels;
