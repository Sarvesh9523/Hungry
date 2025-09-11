import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/reels.css';
import ReelFeed from '../../components/ReelFeed';

const Home = () => {
  const [videos, setVideos] = useState([]);

  const token = localStorage.getItem("token"); // mobile-safe JWT

  // Fetch videos
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/food`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        console.log(response.data);
        setVideos(response.data.foodItems);
      })
      .catch(err => {
        console.error("Failed to fetch videos", err);
        alert("Session expired. Please login again.");
        window.location.href = "/user/login"; // redirect if token invalid
      });
  }, [token]);

  // Like a video
  async function likeVideo(item) {
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/food/like`, 
        { foodId: item._id }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.like) {
        console.log("Video liked");
        setVideos(prev => prev.map(v => v._id === item._id ? { ...v, likeCount: v.likeCount + 1 } : v));
      } else {
        console.log("Video unliked");
        setVideos(prev => prev.map(v => v._id === item._id ? { ...v, likeCount: v.likeCount - 1 } : v));
      }
    } catch (err) {
      console.error("Like action failed", err);
    }
  }

  // Save a video
  async function saveVideo(item) {
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/food/save`, 
        { foodId: item._id }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.save) {
        setVideos(prev => prev.map(v => v._id === item._id ? { ...v, savesCount: v.savesCount + 1 } : v));
      } else {
        setVideos(prev => prev.map(v => v._id === item._id ? { ...v, savesCount: v.savesCount - 1 } : v));
      }
    } catch (err) {
      console.error("Save action failed", err);
    }
  }

  return (
    <ReelFeed
      items={videos}
      onLike={likeVideo}
      onSave={saveVideo}
      emptyMessage="No videos available."
    />
  );
};

export default Home;
