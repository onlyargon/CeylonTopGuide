import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import './PublicGuideProfile.css';
import Header from '../Header/Header'
import Footer from "../Footer/Footer";
import { FaWhatsapp, FaImages, FaUserTie, FaTimes } from 'react-icons/fa';
import { QRCodeSVG } from "qrcode.react";

const PublicGuideProfile = () => {
  const { id } = useParams();
  const [guide, setGuide] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [tourPhotos, setTourPhotos] = useState([]);
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);
  const [showPhotos, setShowPhotos] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Slideshow images
  const slides = [
    'slide1.jpg',
    'slide2.jpg',
    'slide3.jpg',
    'slide4.jpg',
    'slide5.jpg',
    'slide6.jpg',
    'slide7.jpg',
    'slide8.jpg',
    'slide9.jpg',
    'slide10.jpg',
    'slide11.jpg',
    'slide12.jpg'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
    }, 4 * 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchGuideWithRecalculation = async () => {
      try {
        // Try the original API URL first
        await axios.post(`${process.env.REACT_APP_API_BASE_URL}/reviews/recalculate/${id}`);
        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/guides/verified/${id}`);
        setGuide(res.data);
      } catch (error) {
        console.error("Primary guide profile fetch failed, trying localhost:", error);
        try {
          // Fallback to localhost:5000
          await axios.post(`http://localhost:5000/reviews/recalculate/${id}`);
          const localRes = await axios.get(`http://localhost:5000/guides/verified/${id}`);
          setGuide(localRes.data);
        } catch (localError) {
          console.error("Local guide profile fetch also failed:", localError);
        }
      }
    };

    fetchGuideWithRecalculation();
  }, [id]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // Try the original API URL first
        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/reviews/guide/${id}?verified=true`);
        setReviews(res.data);
      } catch (error) {
        console.error("Primary reviews fetch failed, trying localhost:", error);
        try {
          // Fallback to localhost:5000
          const localRes = await axios.get(`http://localhost:5000/reviews/guide/${id}?verified=true`);
          setReviews(localRes.data);
        } catch (localError) {
          console.error("Local reviews fetch also failed:", localError);
          setReviews([]);
        }
      }
    };

    fetchReviews();
  }, [id]);

  useEffect(() => {
    const fetchTourPhotos = async () => {
      try {
        // Try the original API URL first
        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/tourPhotos/guide/${id}`);
        setTourPhotos(res.data);
      } catch (error) {
        console.error("Primary tour photos fetch failed, trying localhost:", error);
        try {
          // Fallback to localhost:5000
          const localRes = await axios.get(`http://localhost:5000/tourPhotos/guide/${id}`);
          setTourPhotos(localRes.data);
        } catch (localError) {
          console.error("Local tour photos fetch also failed:", localError);
          setTourPhotos([]);
        }
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

  const handleImageClick = (imagePath) => {
    setSelectedImage(imagePath);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  if (!guide) return <div className="public-guide-container"><h2>Loading...</h2></div>;

  return (
    <>
      <Header />
      <div className="public-guide-container-background">
        <div className="background-slideshow">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`background-slide ${index === currentSlide ? 'active' : ''}`}
              style={{
                backgroundImage: `url(/Slideshow/${slide})`,
              }}
            />
          ))}
        </div>
        <div className="public-guide-container">
          <div className="public-guide-header">
            <div className="public-guide-details">
              <h1 className="public-guide-name">{guide.fullName}</h1>

              <div className="public-guide-rating">
                <div className="public-guide-rating-item">
                  <span className="public-guide-years-number">{guide.professionalDetails?.experienceYears || '0'}</span>
                  <span className="public-guide-rating-title">Years</span>
                </div>
                <div className="public-guide-rating-item">
                  <span className="public-guide-ratings-number">★{(Number(guide.averageRating) || 0).toFixed(2)}</span>
                  <span className="public-guide-rating-title">Rating</span>
                </div>
                <div className="public-guide-rating-item">
                  <span className="public-guide-hours-number">
                    {guide.pricing?.hourlyRate && guide.pricing?.hourlyRate !== "0" ? (
                      `$${guide.pricing.hourlyRate}`
                    ) : guide.pricing?.dailyRate && guide.pricing?.dailyRate !== "0" ? (
                      `$${guide.pricing.dailyRate}`
                    ) : (
                      "Rate not set"
                    )}
                  </span>
                  <span className="public-guide-rating-title">
                    {guide.pricing?.hourlyRate && guide.pricing?.hourlyRate !== "0" ? 'Hourly Rate' : 'Daily Rate'}
                  </span>
                </div>
              </div>

              <div className="public-guide-contact-info">
                <span className="public-guide-phone">
                  <FaWhatsapp className="whatsapp-icon" /> {guide.contact?.phone || "Phone not provided"}
                </span>
                <span className="guide-profile-phone">
                      <FaEnvelope className="email-icon" /> {guide.contact?.email || "Email not provided"}
                    </span>
              </div>
            </div>

            <div className="public-guide-photo">
              <img
                src={getCloudinaryUrl(guide.profilePhoto)}
                alt={guide.fullName}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/default-profile.png';
                }}
              />

            </div>
          </div>

          <div className="public-guide-divider"></div>

          <div className="public-guide-about">
            <h2>About Me</h2>
            <div className={`about-content ${isAboutExpanded ? 'expanded' : 'collapsed'}`}>
              <p>{guide.additionalInfo?.bio || "No bio added yet."}</p>
            </div>
            <button
              className="see-more-button"
              onClick={() => setIsAboutExpanded(!isAboutExpanded)}
            >
              {isAboutExpanded ? 'See Less' : 'See More'}
            </button>
          </div>

          <div className="public-guide-divider"></div>

          <div className="public-guide-toggle-section-unique">
            <div className="public-guide-toggle-slider-unique">
              <button
                className={`toggle-option-unique ${showPhotos ? 'active' : ''}`}
                onClick={() => setShowPhotos(true)}
              >
                <FaImages className="toggle-icon-unique" />
                <span className="toggle-text-unique">Tour Photos</span>
              </button>
              <button
                className={`toggle-option-unique ${!showPhotos ? 'active' : ''}`}
                onClick={() => setShowPhotos(false)}
              >
                <FaUserTie className="toggle-icon-unique" />
                <span className="toggle-text-unique">Professional Details</span>
              </button>
              <div className={`slider-unique ${showPhotos ? 'left' : 'right'}`}></div>
            </div>

            {showPhotos ? (
              <div className="public-guide-photos">
                <h2 className="public-guide-photos-title">Tour Photos</h2>
                <div className="public-guide-photos-grid">
                  {tourPhotos.length > 0 ? (
                    tourPhotos.map((photo, index) => (
                      <div key={index} className="public-guide-photo-card">
                        <img
                          src={getCloudinaryUrl(photo.imagePath)}
                          alt={photo.caption || "Tour"}
                          className="public-guide-photo-img"
                          loading="lazy"
                          onClick={() => handleImageClick(getCloudinaryUrl(photo.imagePath))}
                          style={{ cursor: 'pointer' }}
                        />
                        {photo.caption && (
                          <div className="public-guide-photo-caption">{photo.caption}</div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p>No tour photos uploaded yet.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="public-guide-professional">
                <h2>Professional Details</h2>
                <p><strong>Specialties:</strong> {guide.professionalDetails?.specialties?.join(", ") || "Not specified"}</p>
                <p><strong>Languages:</strong> {guide.professionalDetails?.languagesSpoken?.join(", ") || "Not specified"}</p>
                <p><strong>Experience:</strong> {guide.professionalDetails?.experienceYears || "0"} years</p>
                <p><strong>Tour Regions:</strong> {guide.professionalDetails?.tourRegions?.join(", ") || "Not specified"}</p>
                {guide.pricing?.hourlyRate && guide.pricing?.hourlyRate !== "0" ? (
                  <p>
                    <strong>Hourly Rate:</strong>
                    <span className="public-guide-highlighted-rate">
                      ${guide.pricing.hourlyRate}
                    </span>
                  </p>
                ) : guide.pricing?.dailyRate && guide.pricing?.dailyRate !== "0" ? (
                  <p>
                    <strong>Daily Rate:</strong>
                    <span className="public-guide-highlighted-rate">
                      ${guide.pricing.dailyRate}
                    </span>
                  </p>
                ) : (
                  <p><strong>Rate:</strong> Not set</p>
                )}
                <p><strong>Availability:</strong> {guide.availability || "Not specified"}</p>
                {/* QR Code for public profile */}
                {guide._id && (
                  <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <QRCodeSVG
                      value={`${window.location.origin}/guides/${guide._id}`}
                      size={100}
                      level="H"
                      includeMargin={true}
                    />
                    <p className="text-left">Scan to view this profile</p>
                  </div>
                )}

              </div>
            )}
          </div>

          <div className="public-guide-divider"></div>

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
                      <p className="text-[12px] text-[#718096]">{new Date(review.createdAt).toLocaleDateString()}</p>
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

          {/* Image Modal */}
          {selectedImage && (
            <div className="image-modal-overlay" onClick={handleCloseModal}>
              <div className="image-modal-content" onClick={e => e.stopPropagation()}>
                <button className="image-modal-close" onClick={handleCloseModal}>
                  <FaTimes />
                </button>
                <img src={selectedImage} alt="Full size" className="image-modal-img" />
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PublicGuideProfile;