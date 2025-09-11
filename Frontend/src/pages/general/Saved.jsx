import React, { useEffect, useState } from 'react';
import '../../styles/reels.css';
import axios from 'axios';
import ReelFeed from '../../components/ReelFeed';

const Saved = () => {
  const [videos, setVideos] = useState([]);
  const token = localStorage.getItem("token"); // mobile-safe JWT

  // Fetch saved videos
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/food/save`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => {
      const savedFoods = response.data.savedFoods.map(item => ({
        _id: item.food._id,
        video: item.food.video,
        description: item.food.description,
        likeCount: item.food.likeCount,
        savesCount: item.food.savesCount,
        commentsCount: item.food.commentsCount,
        foodPartner: item.food.foodPartner,
      }));
      setVideos(savedFoods);
    })
    .catch(err => {
      console.error("Failed to fetch saved videos", err);
      alert("Session expired. Please login again.");
      window.location.href = "/user/login";
    });
  }, [token]);

  // Remove saved video
  const removeSaved = async (item) => {
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/food/save`,
        { foodId: item._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setVideos(prev => prev.map(v => v._id === item._id ? { ...v, savesCount: Math.max(0, (v.savesCount ?? 1) - 1) } : v));
    } catch (err) {
      console.error("Failed to remove saved video", err);
    }
  }

  return (
    <ReelFeed
      items={videos}
      onSave={removeSaved}
      emptyMessage="No saved videos yet."
    />
  )
}

export default Saved;
