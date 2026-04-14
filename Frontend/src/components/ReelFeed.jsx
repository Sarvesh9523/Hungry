import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import backgroundPoster from '../assets/background_poster.png';
import api from '../services/api';

const ReelFeed = ({ items = [], onLike, onSave, onShare, emptyMessage = 'No videos yet.' }) => {
  const videoRefs = useRef(new Map());
  const [activeCommentVideo, setActiveCommentVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);

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
    if (onShare) await onShare(item);
    const shareData = {
      title: item.name || 'Hungry Peeps Food!',
      text: item.description || 'Amazing food ahead 🍕',
      url: window.location.origin + '/home'
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

  const openComments = async (item) => {
    setActiveCommentVideo(item);
    setIsLoadingComments(true);
    setComments([]);
    try {
      const response = await api.get(`/api/food/${item._id}/comments`);
      setComments(response.data.comments || []);
    } catch (error) {
      console.error("Failed to load comments", error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const submitComment = async () => {
    if (!commentText.trim() || !activeCommentVideo) return;
    try {
      const response = await api.post('/api/food/comment', {
        foodId: activeCommentVideo._id,
        text: commentText
      });
      if (response.data.success) {
        setComments([response.data.comment, ...comments]);
        setCommentText('');
        // Optimistically update the comments count locally for the feed
        activeCommentVideo.commentsCount = (activeCommentVideo.commentsCount || 0) + 1;
      }
    } catch (error) {
      console.error("Failed to submit comment", error);
    }
  };

  return (
    <div className="h-[100dvh] w-full flex items-center justify-center overflow-hidden bg-transparent">

      {/* Fixed blurred background image — desktop only */}
      <div
        className="hidden md:block fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundPoster})` }}
      >
        <div className="absolute inset-0 backdrop-blur-sm bg-black/40" />
      </div>

      {/* Scrollable reel column */}
      <div className="
        h-[100dvh] w-full
        md:h-[100dvh] md:w-auto md:aspect-[9/16]
        relative overflow-y-auto
        scroll-smooth snap-y snap-mandatory
        [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
      ">

        {items.length === 0 && (
          <div className="h-full flex items-center justify-center text-white/50 text-lg">
            <p>{emptyMessage}</p>
          </div>
        )}

        {items.map((item) => (
          <div
            key={item._id}
            className="
              snap-start snap-always relative shrink-0
              h-[100dvh] w-full
              flex items-center justify-center overflow-hidden
              rounded-none md:rounded-2xl
            "
          >
            <video
              ref={setVideoRef(item._id)}
              className="w-full h-full object-cover"
              src={item.video}
              muted
              playsInline
              loop
              preload="metadata"
            />

            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none z-10" />
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-10" />

            {/* Right action buttons */}
            <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6 z-30 drop-shadow-xl pb-4">
              <button
                onClick={onLike ? () => onLike(item) : undefined}
                className="flex flex-col items-center justify-center group/btn active:scale-95 transition-transform"
              >
                <svg
                  className={`w-8 h-8 transition-transform duration-300 ${item.isLiked ? 'fill-red-500 stroke-red-500 scale-110' : 'text-white stroke-white fill-none group-hover/btn:scale-110 drop-shadow-md'}`}
                  viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                >
                  <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-8.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
                </svg>
                <span className="text-white font-bold text-xs mt-1 drop-shadow-md">{item.likeCount ?? 0}</span>
              </button>

              <button 
                onClick={() => openComments(item)}
                className="flex flex-col items-center justify-center group/btn active:scale-95 transition-transform"
              >
                <svg
                  className="w-8 h-8 text-white fill-none stroke-white drop-shadow-md group-hover/btn:scale-110 transition-transform"
                  viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span className="text-white font-bold text-xs mt-1 drop-shadow-md">
                  {item.commentsCount ?? (Array.isArray(item.comments) ? item.comments.length : 0)}
                </span>
              </button>

              <button
                onClick={() => handleShare(item)}
                className="flex flex-col items-center justify-center group/btn active:scale-95 transition-transform"
              >
                <svg
                  className="w-8 h-8 text-white fill-none stroke-white drop-shadow-md group-hover/btn:scale-110 transition-transform"
                  viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                >
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
                <span className="text-white font-bold text-xs mt-1 drop-shadow-md">{item.sharesCount ?? 0}</span>
              </button>

              <button
                onClick={onSave ? () => onSave(item) : undefined}
                className="flex flex-col items-center justify-center group/btn active:scale-95 transition-transform"
              >
                <svg
                  className={`w-8 h-8 transition-transform duration-300 ${item.isSaved ? 'fill-white stroke-white scale-110' : 'text-white stroke-white fill-none group-hover/btn:scale-110 drop-shadow-md'}`}
                  viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                >
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              </button>
            </div>

            {/* Bottom left info */}
            <div className="absolute left-4 bottom-24 z-30 max-w-[75%] flex flex-col gap-3 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 to-fuchsia-500 flex items-center justify-center text-white font-bold border-2 border-white overflow-hidden shadow-lg shrink-0">
                  {item.foodPartner ? '👨‍🍳' : '👤'}
                </div>
                <div className="flex flex-col drop-shadow-md">
                  <span className="text-white font-bold text-sm tracking-wide leading-tight">{item.name || 'Delicious Dish'}</span>
                  {item.foodPartner && (
                    <Link to={`/food-partner/${item.foodPartner}`} className="text-white/80 font-semibold text-xs hover:text-white">
                      <span>Visit Partner</span>
                    </Link>
                  )}
                </div>
              </div>
              <p className="text-white text-sm font-medium leading-snug drop-shadow-md line-clamp-3 w-full">
                {item.description}
              </p>
            </div>
          </div>
        ))}


        {/* End of reels indicator */}
        {items.length > 0 && (
          <div className="
            snap-start snap-always relative shrink-0
            h-[100dvh] w-full
            flex flex-col items-center justify-center overflow-hidden
            rounded-none md:rounded-2xl bg-black/60 backdrop-blur-lg border border-white/10
          ">
            <div className="flex flex-col items-center text-center p-8 animate-fade-in">
              <span className="text-6xl mb-6 drop-shadow-lg">🍿</span>
              <h2 className="text-2xl font-bold text-white mb-3 tracking-wide">You're all caught up!</h2>
              <p className="text-white/60 text-sm max-w-[250px] leading-relaxed">
                Check back later for more delicious recipes and food adventures.
              </p>
              <button 
                onClick={(e) => {
                  const container = e.target.closest('.overflow-y-auto');
                  if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="mt-8 px-6 py-2.5 rounded-full bg-white/10 text-white font-medium hover:bg-white/20 transition-colors border border-white/10 flex items-center gap-2"
              >
                <span>↑</span> Back to top
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Comments Modal / Bottom Sheet */}
      {activeCommentVideo && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center pointer-events-none">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto transition-opacity"
            onClick={() => setActiveCommentVideo(null)}
          />
          
          {/* Bottom Sheet Context */}
          <div className="relative w-full md:w-[400px] bg-black/90 md:rounded-t-3xl border-t border-x border-white/10 h-[65vh] flex flex-col pointer-events-auto transform transition-transform animate-slide-up pb-safe shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-white font-bold text-lg">Comments</h3>
              <button 
                onClick={() => setActiveCommentVideo(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {isLoadingComments ? (
                <div className="flex justify-center items-center h-full">
                  <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center text-white/50 my-auto pb-10">
                  <p>No comments yet.</p>
                  <p className="text-sm">Be the first to comment!</p>
                </div>
              ) : (
                comments.map((comment, index) => (
                  <div key={comment._id || index} className="flex gap-3 animate-fade-in">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-fuchsia-500 flex items-center justify-center text-white font-bold shrink-0 overflow-hidden text-xs">
                      {comment.user?.profilePic ? (
                        <img src={comment.user.profilePic} alt="" className="w-full h-full object-cover" />
                      ) : (
                        comment.user?.name ? comment.user.name.charAt(0).toUpperCase() : 'U'
                      )}
                    </div>
                    <div className="flex flex-col flex-1">
                      <span className="text-white/60 text-xs font-semibold">{comment.user?.name || 'User'}</span>
                      <p className="text-white text-sm mt-0.5 leading-snug break-words">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t border-white/10 bg-black/50">
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-2 border border-white/10">
                <input 
                  type="text" 
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submitComment()}
                  placeholder="Add a comment..."
                  className="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder-white/40"
                />
                <button 
                  onClick={submitComment}
                  disabled={!commentText.trim()}
                  className={`text-sm font-bold transition-colors ${commentText.trim() ? 'text-pink-500 hover:text-pink-400' : 'text-white/30 cursor-not-allowed'}`}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Put a little animation css hack here to avoid making another file */}
      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ReelFeed;