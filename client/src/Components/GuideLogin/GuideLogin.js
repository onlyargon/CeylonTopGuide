import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./GuideLogin.css";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import eye icons

const GuideLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility
  const [emailError, setEmailError] = useState(""); // Separate error for email
  const [passwordError, setPasswordError] = useState(""); // Separate error for password

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setEmailError("");
    setPasswordError("");
    setIsLoading(true);

    // Basic validation
    if (!email) {
      setEmailError("Please enter your email");
      setIsLoading(false);
      return;
    }

    if (!password) {
      setPasswordError("Please enter your password");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/guides/login`,
        { email, password },
        { withCredentials: true }
      );

      if (response.status === 200) {
        localStorage.setItem("guide", JSON.stringify(response.data.guide));
        navigate("/guideProfile");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Login failed";
      
      if (errorMessage.toLowerCase().includes("email")) {
        setEmailError("Incorrect creditionals. Please check your email address or password");
      } else if (errorMessage.toLowerCase().includes("password")) {
        setPasswordError("Please check your password");
      } else if (errorMessage.includes("awaiting approval")) {
        setError("Your account is awaiting admin approval. Please try again later.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ceylon-login-container">
      <div className="ceylon-login-left">
        <Link to="/landingPage" className="forgot-password-link">
          <div className="ceylon-brand">
            <h1 className="ceylon-title">CEYLON</h1>
            <h1 className="ceylon-title">TOPGUIDE</h1>
            <div className="ceylon-logo">
              <img src="./Logo/LogoBlack.png" alt="logo" className="login-middleLogo"/>
            </div>
          </div>
        </Link>
      </div>

      <div className="ceylon-login-right">
        <div className="ceylon-login-form-container">
          <h2 className="welcome-text">Welcome back!</h2>
          <p className="login-subtitle">Log in to continue</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleLogin} className="ceylon-login-form">
            <div className="ceylon-form-group">
              <input
                className={`form-inputs ${emailError ? "input-error" : ""}`}
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError("");
                }}
                placeholder="you@example.com"
              />
              {emailError && <div className="field-error">{emailError}</div>}
            </div>

            <div className="ceylon-form-group password-input-container">
              <div className="password-input-wrapper">
                <input
                  className={`form-inputs ${passwordError ? "input-error" : ""}`}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError("");
                  }}
                  placeholder="Your password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {passwordError && <div className="field-error">{passwordError}</div>}
            </div>

            <div className="ceylon-form-options">
              <div className="remember-me-option">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember-me">Remember me</label>
              </div>
              
              <Link to="/forgot-password" className="forgot-password-link">Forgot Your password?</Link>
            </div>

            <button 
              type="submit" 
              className="ceylon-login-button"
              disabled={isLoading}
            >
              {isLoading ? "LOGGING IN..." : "LOGIN"}
            </button>
          </form>

          <div className="ceylon-signup-link">
            <p>Don't have an account? <Link to="/guideRegister">Sign Up</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideLogin;