import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/auth-shared.css';

const ChooseRegister = () => {
  return (
    <div className="auth-page-wrapper choose-register-page">
      <div className="outer-box">
        <header className="outer-header">
          <h1 className="outer-title">Pick how you want to join the platform.</h1>
        </header>

        <div className="auth-container">
          
          {/* Login Section */}
          <div className="side-card">
            <header>
              <h2 className="auth-title">LogIn</h2>
              <p className="auth-subtitle">Already have an account</p>
            </header>
            <div className="auth-actions">
              <Link to="/user/login" className="link-btn">User</Link>
              <Link to="/food-partner/login" className="link-btn">Food Partner</Link>
            </div>
          </div>

          <div className="divider" />

          {/* Register Section */}
          <div className="side-card">
            <header>
              <h2 className="auth-title">Register</h2>
              <p className="auth-subtitle">Join to explore and enjoy</p>
            </header>
            <div className="auth-actions">
              <Link to="/user/register" className="link-btn">User</Link>
              <Link to="/food-partner/register" className="link-btn">Food Partner</Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ChooseRegister;
