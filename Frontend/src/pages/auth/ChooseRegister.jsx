import React from "react";
import { Link } from "react-router-dom";
import { User, Utensils } from "lucide-react";
import "../../styles/auth-shared.css";

const ChooseRegister = () => {
  return (
    <div className="auth-page-wrapper">
      <div
        className="auth-card"
        role="region"
        aria-labelledby="choose-register-title"
      >
        <header>
          <h1 id="choose-register-title" className="auth-title">
            Create Your Account
          </h1>
          <p className="auth-subtitle">
            Choose the type of account you want to register.
          </p>
        </header>

        <div className="flex flex-col gap-4">
          <Link
            to="/user/register"
            className="flex items-center justify-between p-4 border rounded-lg shadow-sm bg-[var(--color-surface-alt)] hover:bg-[var(--color-surface)] transition duration-200 group"
            style={{ textDecoration: "none" }}
          >
            <div className="flex items-center gap-3">
              <User className="w-6 h-6 text-[var(--color-accent)]" />
              <span className="font-medium text-[var(--color-text)]">
                Register as Normal User
              </span>
            </div>
            <span className="opacity-0 group-hover:opacity-100 text-[var(--color-accent)] transition">
              →
            </span>
          </Link>

          <Link
            to="/food-partner/register"
            className="flex items-center justify-between p-4 border rounded-lg shadow-sm bg-[var(--color-surface-alt)] hover:bg-[var(--color-surface)] transition duration-200 group"
            style={{ textDecoration: "none" }}
          >
            <div className="flex items-center gap-3">
              <Utensils className="w-6 h-6 text-[var(--color-accent)]" />
              <span className="font-medium text-[var(--color-text)]">
                Register as Food Partner
              </span>
            </div>
            <span className="opacity-0 group-hover:opacity-100 text-[var(--color-accent)] transition">
              →
            </span>
          </Link>
        </div>

        <div className="auth-alt-action mt-2 flex flex-col gap-1">
          Already have an account?
          <Link to="/user/login">User Sign in</Link>
          <Link to="/food-partner/login">Food Partner Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default ChooseRegister;
