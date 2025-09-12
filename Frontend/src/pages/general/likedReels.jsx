const Liked = () => {
  const [likedVideos, setLikedVideos] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  // Removed: const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchLiked = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/food/liked`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLikedVideos(response.data.foods || []);
      } catch (err) {
        console.error("Failed to fetch liked videos:", err);
        // It's better to handle this in a more user-friendly way than alert in a real app
        alert("Session expired. Please login again.");
        // Replaced navigate with standard window location change
        window.location.href = "/user/login";
      }
    };
    fetchLiked();
  }, [token]);

  if (activeIndex !== null) {
    return (
      <>
        <style>{styles}</style>
        <ReelFeed
          items={likedVideos}
          initialActiveId={likedVideos[activeIndex]?._id}
          emptyMessage="No liked videos to display."
        />
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <main className="liked-container">
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
                onClick={() => setActiveIndex(index)}
              >
                <video
                  className="liked-grid-video"
                  src={video.video}
                  muted
                  autoPlay
                  loop
                  playsInline
                  style={{ objectFit: "cover", width: "100%", height: "100%" }}
                />
              </div>
            ))
          )}
        </section>
      </main>
    </>
  );
};

export default Liked;