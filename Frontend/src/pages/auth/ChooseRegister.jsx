import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/auth-shared.css';

const ChooseRegister = () => {
  return (
    <div className="auth-page-wrapper choose-register-page">
      <div className="auth-container">
        
        {/* Login Section */}
        <div className="auth-card side-card">
          <header>
            <h1 className="auth-title">LogIn</h1>
            <p className="auth-subtitle">Already have an account</p>
          </header>
          <div className="auth-actions">
            <Link to="/user/login" className="link-btn">User</Link>
            <Link to="/food-partner/login" className="link-btn">Food Partner</Link>
          </div>
        </div>

        <div className="divider" />

        {/* Register Section */}
        <div className="auth-card side-card">
          <header>
            <h1 className="auth-title">Register</h1>
            <p className="auth-subtitle">Join to explore and enjoy</p>
          </header>
          <div className="auth-actions">
            <Link to="/user/register" className="link-btn">User</Link>
            <Link to="/food-partner/register" className="link-btn">Food Partner</Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ChooseRegister;
