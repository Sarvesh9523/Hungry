import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import ReelFeed from '../../components/ReelFeed';
import backgroundPoster from '../../assets/background_poster.png';

const Liked = () => {
  const [likedVideos, setLikedVideos] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    const fetchLiked = async () => {
      try {
        const response = await api.get('/api/food/liked');
        setLikedVideos(response.data.foods || []);
      } catch (err) {
        // Interceptor handles 401 redirect
      }
    };
    fetchLiked();
  }, []);

  const likeVideo = async (item) => {
    try {
      const response = await api.post('/api/food/like', { foodId: item._id });
      const isLiked = response.data.isLiked;

      if (isLiked) {
        setLikedVideos(prev => prev.map(v => v._id === item._id ? { ...v, likeCount: v.likeCount + 1, isLiked: true } : v));
      } else {
        // Unliked — remove from liked list
        setLikedVideos(prev => prev.filter(v => v._id !== item._id));
      }
    } catch (err) { console.error(err); }
  };

  const saveVideo = async (item) => {
    try {
      const response = await api.post('/api/food/save', { foodId: item._id });
      const isSaved = response.data.isSaved;

      setLikedVideos(prev => prev.map(v => v._id === item._id ? {
        ...v,
        savesCount: isSaved ? v.savesCount + 1 : v.savesCount - 1,
        isSaved
      } : v));
    } catch (err) { console.error(err); }
  };

  const shareVideo = async (item) => {
    try {
      await api.post('/api/food/share', { foodId: item._id });
      setLikedVideos(prev => prev.map(v => v._id === item._id ? { ...v, sharesCount: (v.sharesCount || 0) + 1 } : v));
    } catch (err) { console.error("Share action failed", err); }
  };

  return (
    <div 
      className="min-h-screen w-full relative bg-fixed bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundPoster})` }}
    >
      <div className="absolute inset-0 bg-black/60 z-0" />
      <div className="absolute inset-0 bg-gradient-to-tr from-rose-600/30 via-fuchsia-600/20 to-purple-800/30 mix-blend-color z-0" />

      {activeIndex === null && (
        <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col pt-8 pb-20 px-4 min-h-screen">
          <header className="text-center mb-8 bg-glass p-6 rounded-3xl">
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-200 to-pink-400 mb-2">❤️ Your Liked Reels</h1>
            <p className="text-white/70 italic text-sm mb-4">“Collect memories, not just likes.”</p>
            <div className="inline-block px-4 py-2 bg-white/10 rounded-full border border-white/20 text-white font-semibold">
              Total Liked Videos: <span className="text-pink-400 ml-1">{likedVideos.length}</span>
            </div>
          </header>

          <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {likedVideos.length === 0 ? (
              <div className="col-span-full flex justify-center py-10">
                <p className="text-white/60">You haven't liked any reels yet.</p>
              </div>
            ) : (
              likedVideos.map((video, index) => (
                <div
                  key={video._id}
                  className="bg-black border border-white/20 rounded-2xl overflow-hidden aspect-[3/4] relative group cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(236,72,153,0.3)] transition-all"
                  onClick={() => setActiveIndex(index)}
                >
                  <video
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    src={video.video}
                    muted
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white font-bold text-sm drop-shadow line-clamp-1">{video.name}</span>
                  </div>
                  <div className="absolute top-2 right-2 bg-black/50 backdrop-blur rounded-full w-8 h-8 flex items-center justify-center border border-white/20 text-red-500">
                    <svg className="w-4 h-4 fill-current drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-8.6 1-1a5.5 5.5 0 0 0 0-7.8z" /></svg>
                  </div>
                </div>
              ))
            )}
          </section>
        </div>
      )}

      {activeIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <button 
            className="absolute top-6 right-6 z-50 w-10 h-10 bg-black/50 backdrop-blur border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors shadow-lg" 
            onClick={() => setActiveIndex(null)}
          >
            ✕
          </button>
          <div className="flex-1 w-full overflow-hidden">
            <ReelFeed
              items={likedVideos.slice(activeIndex).concat(likedVideos.slice(0, activeIndex))}
              onLike={likeVideo}
              onSave={saveVideo}
              onShare={shareVideo}
              emptyMessage="No liked videos to display."
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Liked;