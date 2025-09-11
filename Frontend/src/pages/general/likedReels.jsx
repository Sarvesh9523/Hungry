import React, { useEffect, useState } from 'react';
import '../../styles/reels.css';
import axios from 'axios';
import ReelFeed from '../../components/ReelFeed';

const Liked = () => {
  const [videos, setVideos] = useState([]);
  const token = localStorage.getItem("token"); // mobile-safe JWT

  // Fetch liked videos on mount
  useEffect(() => {
    const fetchLikedVideos = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/food/liked`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Ensure backend returns `foods`
        const likedFoods = (response.data.foods || []).map((item) => ({
          _id: item._id,
          video: item.video,
          description: item.description,
          likeCount: item.likeCount ?? 0,
          savesCount: item.savesCount ?? 0,
          commentsCount: item.commentsCount ?? 0,
          foodPartner: item.foodPartner,
        }));

        setVideos(likedFoods);
      } catch (err) {
        console.error("Failed to fetch liked videos", err);
        alert("Session expired. Please login again.");
        window.location.href = "/user/login";
      }
    };

    fetchLikedVideos();
  }, [token]);

  // Unlike a video
  const unlikeVideo = async (item) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/food/like`,
        { foodId: item._id },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.message === "Food unliked successfully") {
        // Remove from UI after unliking
        setVideos((prev) => prev.filter((v) => v._id !== item._id));
      }
    } catch (err) {
      console.error("Failed to unlike video", err);
      alert("Could not unlike the video. Try again later.");
    }
  };

  return (
    <ReelFeed
      items={videos}
      onLike={unlikeVideo} // Pass unlike handler
      emptyMessage="No liked videos yet."
    />
  );
};

export default Liked;
