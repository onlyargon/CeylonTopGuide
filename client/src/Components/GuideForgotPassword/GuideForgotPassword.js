import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./GuideForgotPassword.css";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/guides/forgot-password`, { email });
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "Error sending reset link");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div
        className="forgot-password-background"
        style={{
          backgroundImage: `url(/Backgrounds/newBackground.png)`
        }}
      ></div>
      <div className="forgot-password-container">
        <div className="forgot-password-content">
          <div className="forgot-password-header-left">
            <img src="/Logo/LogoBlack.png" alt="CeylonTopGuide Logo" className="logo-black"/>
            <div className="header-text">
              <h1>CEYLON</h1>
              <h1>TOPGUIDE</h1>
            </div>
          </div>
          <h2 className="forgot-password-title">FORGOT YOUR PASSWORD?</h2>

          <div className="forgot-password-message">
            <p>No worries! We've got you covered.</p>
            <p>Enter your registered email address below, and we'll send</p>
            <p>you a secure link to reset your password.</p>
          </div>

          <form onSubmit={handleSubmit} className="forgot-password-form">
            <div className="form-group">
              <label htmlFor="email">Email address*</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={isLoading} className="reset-button">
              {isLoading ? "Sending..." : "Reset Link"}
            </button>
          </form>

          <div className="resend-message">
            <p>Didn't receive it? Check your spam folder or <Link to="#" className="resend-link">resend link</Link></p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ForgotPassword;