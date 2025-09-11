import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Edit3 } from "lucide-react";
import "../../styles/userProfile.css";

const avatarOptions = [
  "/Avatar/A1.jpg", "/Avatar/A2.jpg", "/Avatar/A3.jpg", "/Avatar/A4.jpg",
  "/Avatar/A5.jpg", "/Avatar/A6.jpg", "/Avatar/A7.jpg", "/Avatar/A8.jpg",
  "/Avatar/A9.jpg", "/Avatar/A10.jpg", "/Avatar/A11.jpg", "/Avatar/A12.jpg",
];

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState(avatarOptions[0]);
  const [nickname, setNickname] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const navigate = useNavigate();

  // Fetch user profile
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/user/login");

    axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      if (res.data.role !== "user") return navigate("/user/login");
      const profile = res.data.profile;
      setUser(profile);
      setFullName(profile.fullName || "");
      setEmail(profile.email || "");
      setNickname(profile.nickname || "");
      if (profile.avatar) setSelectedAvatar(profile.avatar);
    }).catch(err => {
      console.error("Failed to fetch user profile", err);
      navigate("/user/login");
    });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/user/login");
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/auth/profile`, {
        nickname, avatar: selectedAvatar
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("Profile updated successfully");
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  return (
    <main className="profile-page">
      {user && (
        <div className="profile-container">
          {/* Main Avatar */}
          <div className="profile-avatar-container">
            <div className="profile-main-avatar">
              <img src={selectedAvatar} alt="Selected Avatar" />
            </div>
          </div>

          {/* Nickname */}
          <div className="profile-editable-field">
            {isEditingNickname ? (
              <input
                type="text"
                className="profile-input"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onBlur={() => { setIsEditingNickname(false); handleSaveProfile(); }}
                onKeyDown={(e) => { if (e.key === "Enter") { setIsEditingNickname(false); handleSaveProfile(); } }}
                placeholder="Enter nickname"
                autoFocus
              />
            ) : (
              <div className="profile-name-display" onClick={() => setIsEditingNickname(true)}>
                <span className="profile-name-text">{nickname || "nickname"}</span>
                <Edit3 size={16} className="profile-edit-icon" />
              </div>
            )}
          </div>

          {/* Avatar Grid */}
          <div className="profile-avatar-grid">
            {avatarOptions.map((avatar, idx) => (
              <button
                key={idx}
                className={`profile-avatar-option ${selectedAvatar === avatar ? "selected" : ""}`}
                onClick={() => { setSelectedAvatar(avatar); handleSaveProfile(); }}
              >
                <img src={avatar} alt={`Avatar ${idx + 1}`} />
              </button>
            ))}
          </div>

          {/* Full Name and Email */}
          <div className="profile-form-row">
            <input
              type="text"
              className="profile-input"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onBlur={handleSaveProfile}
            />
            <input
              type="email"
              className="profile-input"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={handleSaveProfile}
            />
          </div>

          {/* Action Buttons */}
          <div className="profile-actions">
            <button className="profile-button" onClick={() => navigate("/saved-reels")}>Saved Reel</button>
            <button className="profile-button" onClick={() => navigate("/liked-reels")}>Liked Reel</button>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      )}
    </main>
  );
};

export default UserProfile;
