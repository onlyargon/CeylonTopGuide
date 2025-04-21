import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./AddReviewForm.css";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";

const AddReviewForm = () => {
  const { guideId } = useParams();
  const [formData, setFormData] = useState({
    reviewerEmail: "",
    reviewText: "",
    rating: 5
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/reviews`, {
        guideId,
        ...formData,
      });
      alert("Thank you for your review! It has been submitted successfully.");
      navigate(-1); // Go back to previous page
    } catch (err) {
      console.error("Failed to submit review", err);
      alert("Error submitting review. Please try again.");
    }
  };

  return (
    <>
      <Header />
      <div
        className="review-background"
        style={{
          backgroundImage: `url(/Backgrounds/Background1.png)`
        }}
      ></div>
      <div className="add-review-container">
        <div className="add-review-content">
          <h1>Leave a Review</h1>
          <div className="review-intro">
            <p>We'd love to hear about your experience!</p>
            <p>Your review helps future travelers and supports our</p>
            <p>community of trusted guides.</p>
          </div>
          
          <div className="review-tips">
            <p><strong>Be honest, respectful, and specific</strong></p>
            <p>Share what stood out: Knowledge, professionalism, friendliness?</p>
            <p>Add a star rating and any helpful tips for others.</p>
          </div>

          <form onSubmit={handleSubmit} className="review-form">
            <div className="form-group">
              <label>Write Your Review:</label>
              <textarea
                name="reviewText"
                value={formData.reviewText}
                onChange={handleChange}
                placeholder="Share your experience..."
                required
              />
            </div>

            <div className="form-group">
              <label>Rating:</label>
              <select
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                className="rating-select"
              >
                {[5, 4, 3, 2, 1].map(n => (
                  <option key={n} value={n}>
                    {"★".repeat(n) + "☆".repeat(5 - n)} ({n} stars)
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Your Email:</label>
              <input
                type="email"
                name="reviewerEmail"
                value={formData.reviewerEmail}
                onChange={handleChange}
                placeholder="your@email.com"
                required
              />
            </div>

            <button type="submit" className="submit-button">
              Submit Review
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AddReviewForm;