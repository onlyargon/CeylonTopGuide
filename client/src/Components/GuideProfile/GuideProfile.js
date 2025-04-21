import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./GuideProfile.css";
import Header from "../Header/Header";
import instance from "../Instance/Instance";

const GuideProfile = () => {
  const [guide, setGuide] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [showAllDetails, setShowAllDetails] = useState(false);
  const [reviews, setReviews] = useState([]);
  const navigate = useNavigate();
  const [tourPhotos, setTourPhotos] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Helper function to get Cloudinary URL
  const getCloudinaryUrl = (imagePath, width = 200, height = 200, crop = 'fill') => {
    if (!imagePath) return '/default-profile.png';

    // If it's already a full URL, return it directly
    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    // If it's just the public ID (without the full URL)
    return `https://res.cloudinary.com/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload/w_${width},h_${height},c_${crop}/${imagePath}`;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await instance.get('/guides/profile');
        setGuide(response.data);
      } catch (err) {
        console.error("Profile fetch error:", err);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!guide?._id) return;
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/reviews/guide/${guide._id}`
        );
        setReviews(res.data);
      } catch (err) {
        console.error("Failed to load reviews", err);
      }
    };
    fetchReviews();
  }, [guide]);

  useEffect(() => {
    const fetchTourPhotos = async () => {
      if (!guide?._id) return;
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/tourPhotos/guide/${guide._id}`
        );
        setTourPhotos(res.data);
      } catch (err) {
        console.error("Failed to fetch tour photos", err);
      }
    };
    fetchTourPhotos();
  }, [guide]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleUpdate = async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/guides/profile/update`,
        formData,
        { withCredentials: true }
      );
      setGuide(formData);
      setEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your account?")) return;
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/guides/profile/delete`,
        { withCredentials: true }
      );
      alert("Account deleted.");
      navigate("/landingPage");
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/guides/logout`,
        {},
        { withCredentials: true }
      );
      localStorage.removeItem("guide");
      navigate("/guideLogin");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      alert("Please select a file first");
      return;
    }

    // Create FormData for backend
    const formData = new FormData();
    formData.append("photo", file); // Must match multer's field name
    formData.append("guideId", guide._id); // Add guideId to form data

    try {
      setUploadProgress(0);
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/tourPhotos/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          }
        }
      );

      setTourPhotos([...tourPhotos, response.data]);
      alert("Photo uploaded successfully!");
    } catch (err) {
      console.error("Upload failed:", err.response?.data || err.message);
      alert(`Upload failed: ${err.response?.data?.error || err.message}`);
    } finally {
      setUploadProgress(0);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm("Are you sure you want to delete this photo?")) return;
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/tourPhotos/${photoId}`,
        { withCredentials: true }
      );
      setTourPhotos(tourPhotos.filter((photo) => photo._id !== photoId));
      alert("Photo deleted successfully!");
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete photo.");
    }
  };

  const handleSelectPhoto = (photoId) => {
    setSelectedPhotos((prev) =>
      prev.includes(photoId)
        ? prev.filter((id) => id !== photoId)
        : [...prev, photoId]
    );
  };

  const handleDeleteSelectedPhotos = async () => {
    if (!window.confirm("Are you sure you want to delete these photos?")) return;
    try {
      await Promise.all(
        selectedPhotos.map((id) =>
          axios.delete(`${process.env.REACT_APP_API_BASE_URL}/tourPhotos/${id}`, {
            withCredentials: true,
          })
        )
      );
      setTourPhotos(tourPhotos.filter((photo) => !selectedPhotos.includes(photo._id)));
      setSelectedPhotos([]);
      alert("Selected photos deleted successfully!");
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete photos.");
    }
  };

  const handleDeactivate = async () => {
    if (
      !window.confirm(
        "Are you sure you want to deactivate your account? Your profile will be hidden from travelers."
      )
    )
      return;

    try {
      await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/guides/deactivate`,
        {},
        { withCredentials: true }
      );
      alert("Account deactivated successfully");
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/guides/profile`,
        { withCredentials: true }
      );
      setGuide(response.data);
    } catch (error) {
      console.error("Deactivation failed:", error);
      alert("Failed to deactivate account");
    }
  };

  const handleReactivate = async () => {
    if (
      !window.confirm(
        "Reactivate your account to make your profile visible to travelers again?"
      )
    )
      return;

    try {
      await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/guides/reactivate`,
        {},
        { withCredentials: true }
      );
      alert("Account reactivated successfully");
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/guides/profile`,
        { withCredentials: true }
      );
      setGuide(response.data);
    } catch (error) {
      console.error("Reactivation failed:", error);
      alert("Failed to reactivate account");
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={i <= rating ? "star-rating" : "star-rating empty-star"}
        >
          ★
        </span>
      );
    }
    return <div>{stars}</div>;
  };

  if (!guide) return <div className="guide-profile-container"><h2>Loading...</h2></div>;

  return (
    <>
      <Header />
      <div className="guide-profile-container">
        {editing ? (
          <div className="edit-form">
            <h2>Edit Profile</h2>
            <input
              type="text"
              name="fullName"
              value={formData.fullName || ""}
              onChange={handleChange}
              placeholder="Full Name"
            />
            <input
              type="text"
              name="contact.phone"
              value={formData.contact?.phone || ""}
              onChange={handleChange}
              placeholder="Phone Number"
            />
            <div className="button-container">
              <button onClick={handleUpdate} className="guide-button edit-button">
                Save Changes
              </button>
              <button onClick={() => setEditing(false)} className="guide-button logout-button">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="guide-profile-header">
              <div className="verification-container">
                <span className={`verification-status ${guide.account?.isVerified ? "verified" : "unverified"}`}>
                  {guide.account?.isVerified ? "Verified" : "Unverified"}
                </span>
                <span className={`account-status ${guide.isActive ? "active" : "inactive"}`}>
                  {guide.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="guide-profile-photo">
                <img
                  src={getCloudinaryUrl(guide.profilePhoto)}
                  alt="Profile"
                  onError={(e) => {
                    e.target.onerror = null; // Prevent infinite loop if default image fails
                    e.target.src = '/default-profile.png';
                  }}
                />
              </div>
              <h1 className="guide-profile-name1">{guide.fullName}</h1>

              <div className="guide-profile-rating">
                <div className="rating-item">
                  <span className="years-number">{guide.professionalDetails?.experienceYears || "0"}</span>
                  <span className="rating-title">Years</span>
                </div>
                <div className="rating-item">
                  <span className="ratings-number"> ★{(Number(guide.averageRating) || 0).toFixed(2)}</span>
                  <span className="rating-title">Rating</span>
                </div>
                <div className="rating-item">
                  <span className="hours-number">
                    {guide.pricing?.rateType === "hourly" ? (
                      <>
                        ${guide.pricing?.hourlyRate || "0"}
                        <span className="rating-title">Hourly Rate</span>
                      </>
                    ) : (
                      <>
                        ${guide.pricing?.dailyRate || "0"}
                        <span className="rating-title">Daily Rate</span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              {!guide.isActive && (
                <div className="account-status-message">
                  <p>Your account is currently inactive and not visible to travelers.</p>
                  <br />
                </div>
              )}

              <div className="button-container">
                <button onClick={() => setEditing(true)} className="guide-button edit-button">
                  Edit Profile
                </button>

                {guide.isActive ? (
                  <button onClick={handleDeactivate} className="guide-button deactivate-button">
                    Deactivate Account
                  </button>
                ) : (
                  <button onClick={handleReactivate} className="guide-button reactivate-button">
                    Reactivate Account
                  </button>
                )}

                <button onClick={handleDelete} className="guide-button delete-button">
                  Delete Account
                </button>
                <button onClick={handleLogout} className="guide-button logout-button">
                  Logout
                </button>
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
              <p>
                <strong>Specialties:</strong>{" "}
                {guide.professionalDetails?.specialties?.join(", ") || "Not specified"}
              </p>
              <p>
                <strong>Languages:</strong>{" "}
                {guide.professionalDetails?.languagesSpoken?.join(", ") || "Not specified"}
              </p>
              <p>
                <strong>Experience:</strong> {guide.professionalDetails?.experienceYears || "0"} years
              </p>

              {showAllDetails && (
                <div className="additional-details">
                  <p>
                    <strong>Tour Regions:</strong>{" "}
                    {guide.professionalDetails?.tourRegions?.join(", ") || "Not specified"}
                  </p>
                  <p>
                    <strong>Hourly Rate:</strong>
                    <span className={guide.pricing?.rateType === "hourly" ? "highlighted-rate" : ""}>
                      ${guide.pricing?.hourlyRate || "0"}
                    </span>
                    {guide.pricing?.rateType === "hourly" && " (Selected)"}
                  </p>
                  <p>
                    <strong>Daily Rate:</strong>
                    <span className={guide.pricing?.rateType === "daily" ? "highlighted-rate" : ""}>
                      ${guide.pricing?.dailyRate || "0"}
                    </span>
                    {guide.pricing?.rateType === "daily" && " (Selected)"}
                  </p>
                  <p>
                    <strong>Availability:</strong> {guide.availability || "Not specified"}
                  </p>
                  <p>
                    <strong>Payment Methods:</strong>{" "}
                    {guide.pricing?.paymentMethods?.join(", ") || "Not specified"}
                  </p>
                </div>
              )}

              <span
                className="details-toggle"
                onClick={() => setShowAllDetails(!showAllDetails)}
              >
                {showAllDetails ? "Hide Details" : "Show More Details"}
              </span>
            </div>

            <div className="section-divider"></div>

            <div className="tour-photos-section">
              <h2>Tour Photos</h2>
              <div className="upload-container">
                <label className="upload-button">
                  Choose Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    style={{ display: "none" }}
                  />
                </label>
                {uploadProgress > 0 && (
                  <div className="upload-progress">
                    <div
                      className="progress-bar"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                    <span>{uploadProgress}%</span>
                  </div>
                )}
              </div>

              {selectedPhotos.length > 0 && (
                <button
                  onClick={handleDeleteSelectedPhotos}
                  className="guide-button delete-button"
                  style={{ marginBottom: "20px" }}
                >
                  Delete Selected ({selectedPhotos.length})
                </button>
              )}

              <div className="tour-photos-grid">
                {tourPhotos.length > 0 ? (
                  tourPhotos.map((photo) => (
                    <div key={photo._id} className="tour-photo-card">
                      <input
                        type="checkbox"
                        className="photo-checkbox"
                        checked={selectedPhotos.includes(photo._id)}
                        onChange={() => handleSelectPhoto(photo._id)}
                      />
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
              <h3 className="reviews-subtitle">
                What Fellow Tourist Say About {guide.fullName}
              </h3>

              <div className="reviews-grid">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review._id} className="review-card">
                      <div className="reviewer-info">
                        <div className="reviewer-avatar">
                          {review.reviewerEmail.charAt(0).toUpperCase()}
                        </div>
                        <div className="reviewer-details">
                          <h4 className="reviewer-name">
                            {review.reviewerName || review.reviewerEmail.split("@")[0]}
                          </h4>
                          <p className="reviewer-title">
                            {review.reviewerTitle || "Client"}
                          </p>
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
                  <p className="no-reviews">No reviews yet.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default GuideProfile;