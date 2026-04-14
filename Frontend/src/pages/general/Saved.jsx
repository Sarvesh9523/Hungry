import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import ReelFeed from '../../components/ReelFeed';

const Saved = () => {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    api.get(`/api/food/save`)
    .then(response => {
      const savedFoods = response.data.savedFoods.map(item => ({
        _id: item.food._id,
        name: item.food.name,
        video: item.food.video,
        description: item.food.description,
        likeCount: item.food.likeCount,
        savesCount: item.food.savesCount,
        sharesCount: item.food.sharesCount,
        commentsCount: item.food.commentsCount,
        foodPartner: item.food.foodPartner,
        isLiked: item.food.isLiked ?? false,
        isSaved: item.food.isSaved ?? true
      }));
      setVideos(savedFoods);
    })
    .catch(err => {
      console.error("Failed to fetch saved videos", err);
    });
  }, []);

  const likeVideo = async (item) => {
    try {
      const response = await api.post(`/api/food/like`, { foodId: item._id });
      const isLiked = response.data.isLiked;

      setVideos(prev => prev.map(v => v._id === item._id ? {
        ...v,
        likeCount: isLiked ? v.likeCount + 1 : v.likeCount - 1,
        isLiked
      } : v));
    } catch (err) { console.error(err); }
  };

  const removeSaved = async (item) => {
    try {
      await api.post(`/api/food/save`, { foodId: item._id });
      // Remove it from the list
      setVideos(prev => prev.filter(v => v._id !== item._id));
    } catch (err) {
      console.error("Failed to remove saved video", err);
    }
  }

  const shareVideo = async (item) => {
    try {
      await api.post(`/api/food/share`, { foodId: item._id });
      setVideos(prev => prev.map(v => v._id === item._id ? { ...v, sharesCount: (v.sharesCount || 0) + 1 } : v));
    } catch (err) { console.error("Share action failed", err); }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="fixed top-0 inset-x-0 z-50 p-4 bg-gradient-to-b from-black to-transparent pointer-events-none">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500 drop-shadow-md text-center">🔖 Saved Recipes</h1>
      </div>
      <ReelFeed
        items={videos}
        onLike={likeVideo}
        onSave={removeSaved}
        onShare={shareVideo}
        emptyMessage="You haven't saved any food yet."
      />
    </div>
  )
}

export default Saved;
