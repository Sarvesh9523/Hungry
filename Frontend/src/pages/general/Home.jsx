import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import ReelFeed from '../../components/ReelFeed';

const Home = () => {
  const [videos, setVideos] = useState([]);

  // Fetch videos
  useEffect(() => {
    api.get(`/api/food`)
      .then(response => {
        setVideos(response.data.foodItems);
      })
      .catch(err => {
        console.error("Failed to fetch videos", err);
      });
  }, []);

  // Like a video
  async function likeVideo(item) {
    try {
      const response = await api.post(`/api/food/like`, { foodId: item._id });
      const isLiked = response.data.isLiked;

      setVideos(prev => prev.map(v => v._id === item._id ? {
        ...v,
        likeCount: isLiked ? v.likeCount + 1 : v.likeCount - 1,
        isLiked
      } : v));
    } catch (err) {
      console.error("Like action failed", err);
    }
  }

  // Save a video
  async function saveVideo(item) {
    try {
      const response = await api.post(`/api/food/save`, { foodId: item._id });
      const isSaved = response.data.isSaved;

      setVideos(prev => prev.map(v => v._id === item._id ? {
        ...v,
        savesCount: isSaved ? v.savesCount + 1 : v.savesCount - 1,
        isSaved
      } : v));
    } catch (err) {
      console.error("Save action failed", err);
    }
  }

  // Share a video
  async function shareVideo(item) {
    try {
      await api.post(`/api/food/share`, { foodId: item._id });
      setVideos(prev => prev.map(v => v._id === item._id ? { ...v, sharesCount: (v.sharesCount || 0) + 1 } : v));
    } catch (err) {
      console.error("Share action failed", err);
    }
  }

  return (
    <ReelFeed
      items={videos}
      onLike={likeVideo}
      onSave={saveVideo}
      onShare={shareVideo}
      emptyMessage="No videos yet."
    />
  );
};

export default Home;
