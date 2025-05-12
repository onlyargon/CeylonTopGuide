import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./GuideProfile.css";
import Header from "../Header/Header";
import instance from "../Instance/Instance";

const GuideProfile = () => {
  const [guide, setGuide] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    contact: {
      phone: "",
      email: ""
    },
    address: {
      street: "",
      city: "",
      district: "",
      province: ""
    },
    professionalDetails: {
      specialties: [],
      languagesSpoken: [],
      experienceYears: 0,
      tourRegions: []
    },
    pricing: {
      rateType: "",
      hourlyRate: "",
      dailyRate: "",
      paymentMethods: []
    },
    availability: "",
    additionalInfo: {
      bio: ""
    },
    nationality: "",
    profilePhoto: ""
  });
  const [showAllDetails, setShowAllDetails] = useState(false);
  const [reviews, setReviews] = useState([]);
  const navigate = useNavigate();
  const [tourPhotos, setTourPhotos] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [photoCaption, setPhotoCaption] = useState("");
  const [showCaptionInput, setShowCaptionInput] = useState(false);

  // Add these constants at the top of the component
  const provinces = ["Western", "Central", "Southern", "Northern", "North_Western", "Uva", "North_Central", "Sabaragamuwa", "Eastern"];
  const districts = {
    Western: ["Colombo", "Gampaha", "Kalutara"],
    Central: ["Kandy", "Matale", "Nuwara Eliya"],
    Southern: ["Galle", "Matara", "Hambantota"],
    Uva: ["Badulla", "Monaragala"],
    Northern: ["Jaffna", "Kilinochchi", "Mannar", "Vavuniya", "Mullativu"],
    Sabaragamuwa: ["Kegalle", "Rathnapura"],
    North_Western: ["Kurunagla", "Puttalam"],
    North_Central: ["Anuradhapura", "Polonnaruwa"],
    Eastern: ["Ampara", "Batticaloa", "Trincomalee"]
  };

  const availableLanguages = ["English", "Spanish", "French", "German", "Chinese", "Tamil", "Sinhala"];
  const availableSpecialties = ["Cultural Tours", "Wildlife Safaris", "Adventure Travels", "Historical Sites", "Hiking", "Photography"];
  const availableRegions = ["Colombo", "Kandy", "Ella", "Galle", "Sigiriya", "Nuwara Eliya", "All Island"];

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

  const validatePhoneNumber = (phone) => {
    // Check if phone starts with 07 and has exactly 10 digits
    const phoneRegex = /^07\d{8}$/;
    return phoneRegex.test(phone);
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
    
    // Handle phone number validation
    if (name === "contact.phone") {
      // Only allow digits
      const digitsOnly = value.replace(/\D/g, '');
      
      // If input is empty, clear error
      if (!value) {
        setPhoneError("");
        setFormData(prev => ({
          ...prev,
          contact: {
            ...prev.contact,
            phone: ""
          }
        }));
        return;
      }

      // If input doesn't start with 07, add it
      let formattedPhone = digitsOnly;
      if (digitsOnly.length > 0 && !digitsOnly.startsWith("07")) {
        formattedPhone = "07" + digitsOnly.substring(0, 8);
      }

      // Validate the phone number
      if (formattedPhone.length > 0) {
        if (!validatePhoneNumber(formattedPhone)) {
          setPhoneError("Phone number must start with 07 and have exactly 10 digits");
        } else {
          setPhoneError("");
        }
      }

      setFormData(prev => ({
        ...prev,
        contact: {
          ...prev.contact,
          phone: formattedPhone
        }
      }));
      return;
    }
    
    // Handle nested fields
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      
      // Handle array fields (comma-separated values)
      if (['specialties', 'languagesSpoken', 'tourRegions', 'paymentMethods'].includes(child)) {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value.split(',').map(item => item.trim()).filter(item => item)
          }
        }));
      } else {
        // Handle nested object fields (like address)
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleUpdate = async () => {
    // Validate phone number before submission
    if (formData.contact.phone && !validatePhoneNumber(formData.contact.phone)) {
      setPhoneError("Phone number must start with 07 and have exactly 10 digits");
      return;
    }

    try {
      // Prepare the data for submission
      const updateData = {
        ...formData,
        // Preserve the existing email
        contact: {
          ...formData.contact,
          email: guide.contact.email // Keep the existing email
        },
        // Convert arrays back to strings for the API
        professionalDetails: {
          ...formData.professionalDetails,
          specialties: Array.isArray(formData.professionalDetails.specialties) 
            ? formData.professionalDetails.specialties.join(', ')
            : formData.professionalDetails.specialties,
          languagesSpoken: Array.isArray(formData.professionalDetails.languagesSpoken)
            ? formData.professionalDetails.languagesSpoken.join(', ')
            : formData.professionalDetails.languagesSpoken,
          tourRegions: Array.isArray(formData.professionalDetails.tourRegions)
            ? formData.professionalDetails.tourRegions.join(', ')
            : formData.professionalDetails.tourRegions
        },
        pricing: {
          ...formData.pricing,
          paymentMethods: Array.isArray(formData.pricing.paymentMethods)
            ? formData.pricing.paymentMethods.join(', ')
            : formData.pricing.paymentMethods
        }
      };

      // Remove gender field if it exists
      delete updateData.gender;

      // Log the data being sent
      console.log('Sending update data:', updateData);

      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/guides/profile/update`,
        updateData,
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Update the guide state with the response data
      setGuide(response.data.guide);
      setEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Update failed:", error.response?.data || error);
      alert(error.response?.data?.error || "Failed to update profile. Please try again.");
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

    setSelectedFile(file);
    setShowCaptionInput(true);
  };

  const handleCaptionSubmit = async () => {
    if (!selectedFile) {
      alert("Please select a file first");
      return;
    }

    // Create FormData for backend
    const formData = new FormData();
    formData.append("photo", selectedFile);
    formData.append("guideId", guide._id);
    formData.append("caption", photoCaption);

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
      // Reset states after successful upload
      setSelectedFile(null);
      setPhotoCaption("");
      setShowCaptionInput(false);
    } catch (err) {
      console.error("Upload failed:", err.response?.data || err.message);
      alert(`Upload failed: ${err.response?.data?.error || err.message}`);
    } finally {
      setUploadProgress(0);
    }
  };

  const handleCancelUpload = () => {
    setSelectedFile(null);
    setPhotoCaption("");
    setShowCaptionInput(false);
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

  const handleSelect = (e, field) => {
    const selectedValue = e.target.value;
    if (selectedValue) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: [...(prev[parent][child] || []), selectedValue]
        }
      }));
    }
  };

  const handleAddCustom = (field, value) => {
    const [parent, child] = field.split('.');
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [child]: [...(prev[parent][child] || []), value]
      }
    }));
  };

  const handleRemove = (field, item) => {
    const [parent, child] = field.split('.');
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [child]: prev[parent][child].filter(i => i !== item)
      }
    }));
  };

  const handleProvinceChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        province: value,
        district: "" // Reset district when province changes
      }
    }));
  };

  const handleDistrictChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        district: value
      }
    }));
  };

  const handleProfilePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'guide_photos');
        formData.append('folder', 'profile_photos');

        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        setFormData(prev => ({
          ...prev,
          profilePhoto: response.data.secure_url
        }));
      } catch (error) {
        console.error('Upload error:', error);
        alert('Failed to upload profile photo');
      } finally {
        setUploading(false);
      }
    }
  };

  // Add this new function to handle entering edit mode
  const handleEnterEditMode = () => {
    // Convert string arrays to actual arrays if they exist
    const specialties = guide.professionalDetails?.specialties 
      ? (Array.isArray(guide.professionalDetails.specialties) 
          ? guide.professionalDetails.specialties 
          : guide.professionalDetails.specialties.split(',').map(item => item.trim()))
      : [];
    
    const languagesSpoken = guide.professionalDetails?.languagesSpoken
      ? (Array.isArray(guide.professionalDetails.languagesSpoken)
          ? guide.professionalDetails.languagesSpoken
          : guide.professionalDetails.languagesSpoken.split(',').map(item => item.trim()))
      : [];
    
    const tourRegions = guide.professionalDetails?.tourRegions
      ? (Array.isArray(guide.professionalDetails.tourRegions)
          ? guide.professionalDetails.tourRegions
          : guide.professionalDetails.tourRegions.split(',').map(item => item.trim()))
      : [];
    
    const paymentMethods = guide.pricing?.paymentMethods
      ? (Array.isArray(guide.pricing.paymentMethods)
          ? guide.pricing.paymentMethods
          : guide.pricing.paymentMethods.split(',').map(item => item.trim()))
      : [];

    setFormData({
      fullName: guide.fullName || "",
      contact: {
        phone: guide.contact?.phone || "",
        email: guide.contact?.email || ""
      },
      address: {
        street: guide.address?.street || "",
        city: guide.address?.city || "",
        district: guide.address?.district || "",
        province: guide.address?.province || ""
      },
      professionalDetails: {
        specialties: specialties,
        languagesSpoken: languagesSpoken,
        experienceYears: guide.professionalDetails?.experienceYears || 0,
        tourRegions: tourRegions
      },
      pricing: {
        rateType: guide.pricing?.rateType || "",
        hourlyRate: guide.pricing?.hourlyRate || "",
        dailyRate: guide.pricing?.dailyRate || "",
        paymentMethods: paymentMethods
      },
      availability: guide.availability || "",
      additionalInfo: {
        bio: guide.additionalInfo?.bio || ""
      },
      nationality: guide.nationality || "",
      profilePhoto: guide.profilePhoto || ""
    });
    setEditing(true);
  };

  // Add this useEffect to log form data changes
  useEffect(() => {
    if (editing) {
      console.log('Form data in edit mode:', formData);
    }
  }, [editing, formData]);

  if (!guide) return <div className="guide-profile-container"><h2>Loading...</h2></div>;

  return (
    <>
      <Header />
      <div className="guide-profile-container">
        {editing ? (
          <div className="edit-form">
            <h2>Edit Profile</h2>
            
            {/* Profile Photo */}
            <div className="edit-section">
              <h3>Profile Photo</h3>
              <div className="profile-photo-edit">
                <img
                  src={formData.profilePhoto || getCloudinaryUrl(guide?.profilePhoto)}
                  alt="Profile Preview"
                  className="profile-photo-preview"
                />
                <label className="file-input-wrapper">
                  <span className="file-input-button">Choose New Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePhotoChange}
                    style={{ display: 'none' }}
                  />
                </label>
                {uploading && (
                  <div className="upload-progress">
                    <div className="progress-bar"></div>
                    <span>Uploading...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Personal Information */}
            <div className="edit-section">
              <h3>Personal Information</h3>
              <input
                type="text"
                name="fullName"
                value={formData.fullName || ""}
                onChange={handleChange}
                placeholder="Full Name"
              />
              <input
                type="text"
                name="nationality"
                value={formData.nationality || ""}
                onChange={handleChange}
                placeholder="Nationality"
              />
            </div>

            {/* Contact Information */}
            <div className="edit-section">
              <h3>Contact Information</h3>
              <div className="input-group">
                <input
                  type="text"
                  name="contact.phone"
                  value={formData.contact?.phone || ""}
                  onChange={handleChange}
                  placeholder="Phone Number (07XXXXXXXX)"
                  maxLength="10"
                />
                {phoneError && <span className="error-message">{phoneError}</span>}
              </div>
            </div>

            {/* Address Information */}
            <div className="edit-section">
              <h3>Address</h3>
              <input
                type="text"
                name="address.street"
                value={formData.address?.street || ""}
                onChange={handleChange}
                placeholder="Address"
              />
              <input
                type="text"
                name="address.city"
                value={formData.address?.city || ""}
                onChange={handleChange}
                placeholder="City"
              />
              <select
                name="address.province"
                value={formData.address?.province || ""}
                onChange={handleProvinceChange}
              >
                <option value="">Select Province</option>
                {provinces.map((province) => (
                  <option key={province} value={province}>{province}</option>
                ))}
              </select>
              {formData.address?.province && (
                <select
                  name="address.district"
                  value={formData.address?.district || ""}
                  onChange={handleDistrictChange}
                >
                  <option value="">Select District</option>
                  {districts[formData.address.province].map((district) => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Professional Details */}
            <div className="edit-section">
              <h3>Professional Details</h3>
              <input
                type="number"
                name="professionalDetails.experienceYears"
                value={formData.professionalDetails?.experienceYears || ""}
                onChange={handleChange}
                placeholder="Years of Experience"
              />
              <div className="tags-input">
                <select onChange={(e) => handleSelect(e, "professionalDetails.languagesSpoken")}>
                  <option value="">Select Language</option>
                  {availableLanguages.map((lang) => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Add custom language"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const value = e.target.value.trim();
                      if (value) {
                        handleAddCustom("professionalDetails.languagesSpoken", value);
                        e.target.value = '';
                      }
                    }
                  }}
                />
                <div className="tags-container">
                  {formData.professionalDetails?.languagesSpoken?.map((lang, index) => (
                    <span key={index} className="tag">
                      {lang}
                      <button onClick={() => handleRemove("professionalDetails.languagesSpoken", lang)}>×</button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="tags-input">
                <select onChange={(e) => handleSelect(e, "professionalDetails.specialties")}>
                  <option value="">Select Specialty</option>
                  {availableSpecialties.map((spec) => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Add custom specialty"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const value = e.target.value.trim();
                      if (value) {
                        handleAddCustom("professionalDetails.specialties", value);
                        e.target.value = '';
                      }
                    }
                  }}
                />
                <div className="tags-container">
                  {formData.professionalDetails?.specialties?.map((spec, index) => (
                    <span key={index} className="tag">
                      {spec}
                      <button onClick={() => handleRemove("professionalDetails.specialties", spec)}>×</button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="tags-input">
                <select onChange={(e) => handleSelect(e, "professionalDetails.tourRegions")}>
                  <option value="">Select Region</option>
                  {availableRegions.map((region) => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Add custom region"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const value = e.target.value.trim();
                      if (value) {
                        handleAddCustom("professionalDetails.tourRegions", value);
                        e.target.value = '';
                      }
                    }
                  }}
                />
                <div className="tags-container">
                  {formData.professionalDetails?.tourRegions?.map((region, index) => (
                    <span key={index} className="tag">
                      {region}
                      <button onClick={() => handleRemove("professionalDetails.tourRegions", region)}>×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Pricing and Availability */}
            <div className="edit-section">
              <h3>Pricing and Availability</h3>
              <select
                name="availability"
                value={formData.availability || ""}
                onChange={handleChange}
              >
                <option value="">Select Availability</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Weekends Only">Weekends Only</option>
                <option value="On-Request">On-Request</option>
              </select>
              <select
                name="pricing.rateType"
                value={formData.pricing?.rateType || ""}
                onChange={handleChange}
              >
                <option value="">Select Rate Type</option>
                <option value="hourly">Hourly Rate</option>
                <option value="daily">Daily Rate</option>
              </select>
              <input
                type="number"
                name="pricing.hourlyRate"
                value={formData.pricing?.hourlyRate || ""}
                onChange={handleChange}
                placeholder="Hourly Rate ($)"
              />
              <input
                type="number"
                name="pricing.dailyRate"
                value={formData.pricing?.dailyRate || ""}
                onChange={handleChange}
                placeholder="Daily Rate ($)"
              />
              <div className="tags-input">
                <select onChange={(e) => handleSelect(e, "pricing.paymentMethods")}>
                  <option value="">Select Payment Method</option>
                  {["Cash", "Credit Card", "PayPal", "Bank Transfer"].map((method) => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Add custom payment method"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const value = e.target.value.trim();
                      if (value) {
                        handleAddCustom("pricing.paymentMethods", value);
                        e.target.value = '';
                      }
                    }
                  }}
                />
                <div className="tags-container">
                  {formData.pricing?.paymentMethods?.map((method, index) => (
                    <span key={index} className="tag">
                      {method}
                      <button onClick={() => handleRemove("pricing.paymentMethods", method)}>×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* About Me */}
            <div className="edit-section">
              <h3>About Me</h3>
              <textarea
                name="additionalInfo.bio"
                value={formData.additionalInfo?.bio || ""}
                onChange={handleChange}
                placeholder="Tell us about yourself"
                rows="4"
              />
            </div>

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
                    {guide.pricing?.hourlyRate && Number(guide.pricing.hourlyRate) > 0 ? (
                      <>
                        ${guide.pricing.hourlyRate}
                        <span className="rating-title">Hourly Rate</span>
                      </>
                    ) : guide.pricing?.dailyRate && Number(guide.pricing.dailyRate) > 0 ? (
                      <>
                        ${guide.pricing.dailyRate}
                        <span className="rating-title">Daily Rate</span>
                      </>
                    ) : (
                      <>
                        $0
                        <span className="rating-title">Rate</span>
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
                <button onClick={handleEnterEditMode} className="guide-button edit-button">
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
                {showCaptionInput && (
                  <div className="caption-input-container">
                    <input
                      type="text"
                      value={photoCaption}
                      onChange={(e) => setPhotoCaption(e.target.value)}
                      placeholder="Enter photo caption"
                      className="caption-input"
                    />
                    <button onClick={handleCaptionSubmit} className="guide-button edit-button">
                      Upload
                    </button>
                    <button onClick={handleCancelUpload} className="guide-button logout-button">
                      Cancel
                    </button>
                  </div>
                )}
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
                        src={`${photo.imagePath}?w=400&h=300&c_fill`}
                        alt={photo.caption || "Tour"}
                        className="tour-photo"
                        loading="lazy"
                      />
                      {photo.caption && (
                        <div className="photo-caption">{photo.caption}</div>
                      )}
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