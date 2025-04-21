import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import './PublicGuideProfile.css';
import Header from '../Header/Header'
import Footer from "../Footer/Footer";

const PublicGuideProfile = () => {
  const { id } = useParams();
  const [guide, setGuide] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [tourPhotos, setTourPhotos] = useState([]);

  useEffect(() => {
    const fetchGuideWithRecalculation = async () => {
      try {
        await axios.post(`${process.env.REACT_APP_API_BASE_URL}/reviews/recalculate/${id}`);
        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/guides/verified/${id}`);
        setGuide(res.data);
      } catch (error) {
        console.error("Error fetching guide profile or recalculating rating:", error);
      }
    };

    fetchGuideWithRecalculation();
  }, [id]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/reviews/guide/${id}?verified=true`);
        setReviews(res.data);
      } catch (err) {
        console.error("Failed to load reviews", err);
      }
    };

    fetchReviews();
  }, [id]);

  useEffect(() => {
    const fetchTourPhotos = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/tourPhotos/guide/${id}`);
        setTourPhotos(res.data);
      } catch (err) {
        console.error("Failed to load tour photos", err);
      }
    };

    fetchTourPhotos();
  }, [id]);

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? "star-rating" : "star-rating empty-star"}>
          ★
        </span>
      );
    }
    return <div>{stars}</div>;
  };

  const getCloudinaryUrl = (imagePath) => {
    if (!imagePath) return '/default-profile.png';

    // If it's already a full URL, return it directly
    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    // If it's just the public ID (without the full URL)
    return `https://res.cloudinary.com/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload/${imagePath}`;
  };

  if (!guide) return <div className="guide-profile-container"><h2>Loading...</h2></div>;

  return (
    <>
      <Header />
      <div className="guide-profile-container">
        <div className="guide-profile-header">
          <div className="verification-container">
            {/*<span className={`verification-status verified`}>
              Verified
            </span>*/}
          </div>
          <div className="guide-profile-photo">
            <img
              src={getCloudinaryUrl(guide.profilePhoto)}
              alt={guide.fullName}
              onError={(e) => {
                e.target.onerror = null; 
                e.target.src = '/default-profile.png';
              }}
            />
          </div>
          <h1 className="guide-profile-name1">{guide.fullName}</h1>

          <div className="guide-profile-rating">
            <div className="rating-item">
              <span className="years-number">{guide.professionalDetails?.experienceYears || '0'}</span>
              <span className="rating-title">Years</span>
            </div>
            <div className="rating-item">
              <span className="ratings-number">★{(Number(guide.averageRating) || 0).toFixed(2)}</span>
              <span className="rating-title">Rating</span>
            </div>
            <div className="rating-item">
              <span className="hours-number">
                {guide.pricing?.rateType === 'hourly' ? (
                  `$${guide.pricing?.hourlyRate || "0"}`
                ) : (
                  `$${guide.pricing?.dailyRate || "0"}`
                )}
              </span>
              <span className="rating-title">
                {guide.pricing?.rateType === 'hourly' ? 'Hourly Rate' : 'Daily Rate'}
              </span>
            </div>
          </div>

          <div className="guide-contact-info">
            <span className="guide-phone">{guide.contact?.phone || "Phone not provided"}</span>
          </div>
        </div>

        <div className="section-divider"></div>

        <div className="about-section">
          <h2>About Me</h2>
          <p>{guide.additionalInfo?.bio || "No bio added yet."}</p>
        </div>

        <div className="section-divider"></div>

        <div className="professional-details-section">
          <h2>Professional Details</h2>
          <p><strong>Specialties:</strong> {guide.professionalDetails?.specialties?.join(", ") || "Not specified"}</p>
          <p><strong>Languages:</strong> {guide.professionalDetails?.languagesSpoken?.join(", ") || "Not specified"}</p>
          <p><strong>Experience:</strong> {guide.professionalDetails?.experienceYears || "0"} years</p>
          <p><strong>Tour Regions:</strong> {guide.professionalDetails?.tourRegions?.join(", ") || "Not specified"}</p>
          <p>
            <strong>Hourly Rate:</strong>
            <span className={guide.pricing?.rateType === 'hourly' ? 'highlighted-rate' : ''}>
              ${guide.pricing?.hourlyRate || "0"}
            </span>
            {guide.pricing?.rateType === 'hourly' && ' (Selected)'}
          </p>
          <p>
            <strong>Daily Rate:</strong>
            <span className={guide.pricing?.rateType === 'daily' ? 'highlighted-rate' : ''}>
              ${guide.pricing?.dailyRate || "0"}
            </span>
            {guide.pricing?.rateType === 'daily' && ' (Selected)'}
          </p>
          <p><strong>Availability:</strong> {guide.availability || "Not specified"}</p>
          <p><strong>Payment Methods:</strong> {guide.pricing?.paymentMethods?.join(", ") || "Not specified"}</p>
        </div>

        <div className="section-divider"></div>

        <div className="tour-photos-section">
          <h2>Tour Photos</h2>
          <div className="tour-photos-grid">
            {tourPhotos.length > 0 ? (
              tourPhotos.map((photo, index) => (
                <div key={index} className="tour-photo-card">
                  <img
                    src={`${photo.imagePath}?w=400&h=300&c_fill`} // Cloudinary URL with transformations
                    alt="Tour"
                    className="tour-photo"
                    loading="lazy"
                  />
                </div>
              ))
            ) : (
              <p>No tour photos uploaded yet.</p>
            )}
          </div>
        </div>

        <div className="section-divider"></div>

        <div className="reviews-section">
          <h2 className="reviews-title">REVIEWS</h2>
          <h3 className="reviews-subtitle">What Fellow Tourist Say About {guide.fullName}</h3>

          <div className="reviews-grid">
            {reviews.length > 0 ? (
              reviews.map((review, index) => (
                <div key={index} className="review-card">
                  <div className="reviewer-info">
                    <div className="reviewer-avatar">
                      {review.reviewerEmail.charAt(0).toUpperCase()}
                    </div>
                    <div className="reviewer-details">
                      <h4 className="reviewer-name">{review.reviewerName || review.reviewerEmail.split('@')[0]}</h4>
                      <p className="reviewer-title">Verified Client</p>
                      {review.isVerified && (
                        <span className="verified-badge">Verified Review</span>
                      )}
                    </div>
                  </div>
                  <p className="review-text">"{review.reviewText}"</p>
                  <div className="review-rating">
                    <div className="stars">{renderStars(review.rating)}</div>
                    <div className="rating-number">{review.rating.toFixed(1)}</div>
                    <span className="rating-label">Rating</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-reviews">No verified reviews yet.</p>
            )}
          </div>

          <Link to={`/guides/${id}/add-review`} className="guide-button edit-button write-review">
            Write a review
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PublicGuideProfile;