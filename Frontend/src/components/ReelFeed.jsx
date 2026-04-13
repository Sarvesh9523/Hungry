import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import backgroundPoster from '../assets/background_poster.png';

const ReelFeed = ({ items = [], onLike, onSave, onShare, emptyMessage = 'No videos yet.' }) => {
  const videoRefs = useRef(new Map());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (!(video instanceof HTMLVideoElement)) return;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: [0, 0.25, 0.6, 0.9, 1] }
    );

    videoRefs.current.forEach((vid) => observer.observe(vid));
    return () => observer.disconnect();
  }, [items]);

  const setVideoRef = (id) => (el) => {
    if (!el) { videoRefs.current.delete(id); return; }
    videoRefs.current.set(id, el);
  };

  const handleShare = async (item) => {
    if (onShare) {
      await onShare(item);
    }
    const shareData = {
      title: item.name || 'Hungry Peeps Food!',
      text: item.description || 'Amazing food ahead 🍕',
      url: window.location.origin + '/home' // Or specific food URL
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert('Link copied to clipboard!');
      }
    } catch (err) {}
  };

  return (
    <div className="h-[100dvh] w-full relative overflow-y-auto bg-black scroll-smooth snap-y snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      
      {items.length === 0 && (
        <div className="h-full flex items-center justify-center text-white/50 text-lg">
          <p>{emptyMessage}</p>
        </div>
      )}

      {items.map((item) => (
        <div key={item._id} className="snap-start snap-always relative h-[100dvh] w-full shrink-0 bg-black flex items-center justify-center">
          
          {/* Full Screen Video Content */}
          <video
            ref={setVideoRef(item._id)}
            className="w-full h-full object-cover"
            src={item.video}
            muted
            playsInline
            loop
            preload="metadata"
          />

          {/* Dark Gradient Overlay for text readability at bottom */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none z-10" />

          {/* Top Navbar / Header Gradient (optional, Instagram doesn't have much here on Reels but we can keep it soft) */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-10" />

          {/* Floating Right Action Buttons (Instagram Style) */}
          <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6 z-30 drop-shadow-xl pb-4">
            {/* Like */}
            <button 
              onClick={onLike ? () => onLike(item) : undefined}
              className="flex flex-col items-center justify-center group/btn active:scale-95 transition-transform"
            >
              <svg className={`w-8 h-8 transition-transform duration-300 ${item.isLiked ? 'fill-red-500 stroke-red-500 scale-110' : 'text-white stroke-white fill-none group-hover/btn:scale-110 drop-shadow-md'}`} 
                viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-8.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
              </svg>
              <span className="text-white font-bold text-xs mt-1 drop-shadow-md">{item.likeCount ?? 0}</span>
            </button>

            {/* Comment */}
            <button className="flex flex-col items-center justify-center group/btn active:scale-95 transition-transform">
              <svg className="w-8 h-8 text-white fill-none stroke-white drop-shadow-md group-hover/btn:scale-110 transition-transform" 
                viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span className="text-white font-bold text-xs mt-1 drop-shadow-md">{item.commentsCount ?? (Array.isArray(item.comments) ? item.comments.length : 0)}</span>
            </button>

            {/* Share */}
            <button 
              onClick={() => handleShare(item)}
              className="flex flex-col items-center justify-center group/btn active:scale-95 transition-transform"
            >
              <svg className="w-8 h-8 text-white fill-none stroke-white drop-shadow-md group-hover/btn:scale-110 transition-transform" 
                viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              <span className="text-white font-bold text-xs mt-1 drop-shadow-md">{item.sharesCount ?? 0}</span>
            </button>

            {/* Save */}
            <button 
              onClick={onSave ? () => onSave(item) : undefined}
              className="flex flex-col items-center justify-center group/btn active:scale-95 transition-transform"
            >
              <svg className={`w-8 h-8 transition-transform duration-300 ${item.isSaved ? 'fill-white stroke-white scale-110' : 'text-white stroke-white fill-none group-hover/btn:scale-110 drop-shadow-md'}`} 
                viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </button>
          </div>

          {/* Bottom Left Info Area (Profile, Title, Description) */}
          <div className="absolute left-4 bottom-24 z-30 max-w-[75%] flex flex-col gap-3 pb-4">
            
            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 to-fuchsia-500 flex items-center justify-center text-white font-bold border-2 border-white overflow-hidden shadow-lg shrink-0">
                {item.foodPartner ? '👨‍🍳' : '👤'}
              </div>
              <div className="flex flex-col drop-shadow-md">
                <span className="text-white font-bold text-sm tracking-wide leading-tight">{item.name || 'Delicious Dish'}</span>
                {item.foodPartner && (
                  <Link to={`/food-partner/${item.foodPartner}`} className="text-white/80 font-semibold text-xs hover:text-white flex items-center">
                    <span>Visit Partner</span>
                  </Link>
                )}
              </div>
              {/* Follow Button Placeholder */}
              <button className="hidden ml-2 px-3 py-1 pb-1.5 border border-white rounded-xl text-white text-xs font-bold active:scale-95 backdrop-blur-sm">
                Follow
              </button>
            </div>

            {/* Description */}
            <p className="text-white text-sm font-medium leading-snug drop-shadow-md line-clamp-3 w-full">
              {item.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReelFeed;
