// pages/ResetPassword.js
import React, { useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "./GuideResetPassword.css";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const { token } = useParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/guides/reset-password/${token}`, { password });
      setMessage(res.data.message);
    } catch (err) {
      setMessage("Reset failed. Token may be invalid or expired.");
    }
  };

  // Determine alert type
  const isSuccess = message && message.toLowerCase().includes("success");
  const isError = message && !isSuccess;

  return (
    <div className="reset-bg">
      {/* Alert message */}
      {message && (
        <div className={`reset-alert${isSuccess ? " success" : " error"}`}>
          {message}
        </div>
      )}
      <div className="reset-center">
        <div className="reset-card">
          <div className="reset-logo-title">
            {/* Replace below with your actual logo SVG if available */}
            <div className="reset-logo">
              <img src="/Logo/LogoBlack.png" alt="Logo" className="reset-logo" />
            </div>
            <div className="reset-title-main">CEYLON</div>
            <div className="reset-title-main">TOPGUIDE</div>
          </div>
          <h2 className="reset-heading">Enter a new password here</h2>
          <form onSubmit={handleSubmit} className="reset-form">
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="reset-input"
            />
            <button type="submit" className="reset-btn">Submit</button>
          </form>
        </div>
      </div>
      <footer className="reset-footer">
        © 2025 CeylonTopGuide. All rights reserved. |
        <a href="#">Privacy Policy</a> |
        <a href="#">Terms & Conditions</a>
      </footer>
    </div>
  );
};

export default ResetPassword;
