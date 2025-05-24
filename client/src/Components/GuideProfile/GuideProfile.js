import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./GuideProfile.css";
import Header from "../Header/Header";
import instance from "../Instance/Instance";
import { FaWhatsapp, FaImages, FaUserTie } from "react-icons/fa";
import { QRCodeSVG } from "qrcode.react";

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
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);
  const [showPhotos, setShowPhotos] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Add slideshow images
  const slides = [
    "Background1.png",
    "Background2.png",
    "Background3.png",
    "Background4.png",
    "Background5.png"
  ];

  // Add slideshow effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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

  const handleImageClick = (imagePath) => {
    setSelectedImage(imagePath);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  if (!guide) return <div className="guide-profile-container"><h2>Loading...</h2></div>;

  return (
    <>
      <Header />
      <div className="guide-profile-container-background">
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
        <div className="guide-profile-container">
          {editing ? (
            <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
              <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Edit Profile</h2>
              
              {/* Profile Photo */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Profile Photo</h3>
                <div className="flex flex-col items-center space-y-4">
                  <img
                    src={formData.profilePhoto || getCloudinaryUrl(guide?.profilePhoto)}
                    alt="Profile Preview"
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                  />
                  <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-200">
                    <span>Choose New Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePhotoChange}
                      className="hidden"
                    />
                  </label>
                  {uploading && (
                    <div className="w-full max-w-xs">
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div className="h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      </div>
                      <span className="text-sm text-gray-600 mt-2">Uploading...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Personal Information */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName || ""}
                    onChange={handleChange}
                    placeholder="Full Name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    name="nationality"
                    value={formData.nationality || ""}
                    onChange={handleChange}
                    placeholder="Nationality"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Contact Information</h3>
                <div className="space-y-2">
                  <input
                    type="text"
                    name="contact.phone"
                    value={formData.contact?.phone || ""}
                    onChange={handleChange}
                    placeholder="Phone Number (07XXXXXXXX)"
                    maxLength="10"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {phoneError && <span className="text-red-500 text-sm">{phoneError}</span>}
                </div>
              </div>

              {/* Address Information */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address?.street || ""}
                    onChange={handleChange}
                    placeholder="Address"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address?.city || ""}
                    onChange={handleChange}
                    placeholder="City"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    name="address.province"
                    value={formData.address?.province || ""}
                    onChange={handleProvinceChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select District</option>
                      {districts[formData.address.province].map((district) => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Professional Details */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Professional Details</h3>
                <div className="space-y-4">
                  <input
                    type="number"
                    name="professionalDetails.experienceYears"
                    value={formData.professionalDetails?.experienceYears || ""}
                    onChange={handleChange}
                    placeholder="Years of Experience"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="space-y-4">
                    <div className="flex flex-col space-y-2">
                      <select 
                        onChange={(e) => handleSelect(e, "professionalDetails.languagesSpoken")}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex flex-wrap gap-2">
                        {formData.professionalDetails?.languagesSpoken?.map((lang, index) => (
                          <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {lang}
                            <button 
                              onClick={() => handleRemove("professionalDetails.languagesSpoken", lang)}
                              className="ml-2 text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2">
                      <select 
                        onChange={(e) => handleSelect(e, "professionalDetails.specialties")}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex flex-wrap gap-2">
                        {formData.professionalDetails?.specialties?.map((spec, index) => (
                          <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            {spec}
                            <button 
                              onClick={() => handleRemove("professionalDetails.specialties", spec)}
                              className="ml-2 text-green-600 hover:text-green-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing and Availability */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Pricing and Availability</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select
                    name="availability"
                    value={formData.availability || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    name="pricing.dailyRate"
                    value={formData.pricing?.dailyRate || ""}
                    onChange={handleChange}
                    placeholder="Daily Rate ($)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* About Me */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">About Me</h3>
                <textarea
                  name="additionalInfo.bio"
                  value={formData.additionalInfo?.bio || ""}
                  onChange={handleChange}
                  placeholder="Tell us about yourself"
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-center space-x-4">
                <button 
                  onClick={handleUpdate} 
                  className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200"
                >
                  Save Changes
                </button>
                <button 
                  onClick={() => setEditing(false)} 
                  className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition duration-200"
                >
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
                <div className="guide-profile-details">
                  <h1 className="guide-profile-name">{guide.fullName}</h1>

                  <div className="guide-profile-rating">
                    <div className="guide-profile-rating-item">
                      <span className="guide-profile-years-number">{guide.professionalDetails?.experienceYears || '0'}</span>
                      <span className="guide-profile-rating-title">Years</span>
                    </div>
                    <div className="guide-profile-rating-item">
                      <span className="guide-profile-ratings-number">★{(Number(guide.averageRating) || 0).toFixed(2)}</span>
                      <span className="guide-profile-rating-title">Rating</span>
                    </div>
                    <div className="guide-profile-rating-item">
                      <span className="guide-profile-hours-number">
                        {guide.pricing?.hourlyRate && guide.pricing?.hourlyRate !== "0" ? (
                          `$${guide.pricing.hourlyRate}`
                        ) : guide.pricing?.dailyRate && guide.pricing?.dailyRate !== "0" ? (
                          `$${guide.pricing.dailyRate}`
                        ) : (
                          "Rate not set"
                        )}
                      </span>
                      <span className="guide-profile-rating-title">
                        {guide.pricing?.hourlyRate && guide.pricing?.hourlyRate !== "0" ? 'Hourly Rate' : 'Daily Rate'}
                      </span>
                    </div>
                  </div>

                  <div className="guide-profile-contact-info">
                    <span className="guide-profile-phone">
                      <FaWhatsapp className="whatsapp-icon" /> {guide.contact?.phone || "Phone not provided"}
                    </span>
                  </div>
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
              </div>

              <div className="guide-profile-divider"></div>

              <div className="guide-profile-about">
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

              <div className="guide-profile-divider"></div>

              <div className="guide-profile-toggle-section">
                <div className="guide-profile-toggle-slider">
                  <button
                    className={`toggle-option ${showPhotos ? 'active' : ''}`}
                    onClick={() => setShowPhotos(true)}
                  >
                    <FaImages className="toggle-icon" />
                    <span className="toggle-text">Tour Photos</span>
                  </button>
                  <button
                    className={`toggle-option ${!showPhotos ? 'active' : ''}`}
                    onClick={() => setShowPhotos(false)}
                  >
                    <FaUserTie className="toggle-icon" />
                    <span className="toggle-text">Professional Details</span>
                  </button>
                  <div className={`slider ${showPhotos ? 'left' : 'right'}`}></div>
                </div>

                {showPhotos ? (
                  <div className="guide-profile-photos">
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

                    <div className="guide-profile-photos-grid">
                      {tourPhotos.length > 0 ? (
                        tourPhotos.map((photo) => (
                          <div key={photo._id} className="guide-profile-photo-card">
                            <input
                              type="checkbox"
                              className="photo-checkbox"
                              checked={selectedPhotos.includes(photo._id)}
                              onChange={() => handleSelectPhoto(photo._id)}
                            />
                            <img
                              src={`${photo.imagePath}?w=400&h=300&c_fill`}
                              alt={photo.caption || "Tour"}
                              className="guide-profile-photo-img"
                              loading="lazy"
                              onClick={() => handleImageClick(photo.imagePath)}
                            />
                            {photo.caption && (
                              <div className="guide-profile-photo-caption">{photo.caption}</div>
                            )}
                          </div>
                        ))
                      ) : (
                        <p>No tour photos uploaded yet.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="guide-profile-professional">
                    <h2>Professional Details</h2>
                    <p><strong>Specialties:</strong> {guide.professionalDetails?.specialties?.join(", ") || "Not specified"}</p>
                    <p><strong>Languages:</strong> {guide.professionalDetails?.languagesSpoken?.join(", ") || "Not specified"}</p>
                    <p><strong>Experience:</strong> {guide.professionalDetails?.experienceYears || "0"} years</p>
                    <p><strong>Tour Regions:</strong> {guide.professionalDetails?.tourRegions?.join(", ") || "Not specified"}</p>
                    {guide.pricing?.hourlyRate && guide.pricing?.hourlyRate !== "0" ? (
                      <p>
                        <strong>Hourly Rate:</strong>
                        <span className="guide-profile-highlighted-rate">
                          ${guide.pricing.hourlyRate}
                        </span>
                      </p>
                    ) : guide.pricing?.dailyRate && guide.pricing?.dailyRate !== "0" ? (
                      <p>
                        <strong>Daily Rate:</strong>
                        <span className="guide-profile-highlighted-rate">
                          ${guide.pricing.dailyRate}
                        </span>
                      </p>
                    ) : (
                      <p><strong>Rate:</strong> Not set</p>
                    )}
                    <p><strong>Availability:</strong> {guide.availability || "Not specified"}</p>
                    {guide._id && (
                    <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                      <QRCodeSVG
                        value={`${window.location.origin}/guides/${guide._id}`}
                        size={100}
                        level="H"
                        includeMargin={true}
                      />
                      <p className="text-left">Scan to view public profile</p>
                    </div>
                  )}
                  </div>
                )}
              </div>

              <div className="guide-profile-divider"></div>

              <div className="guide-profile-reviews">
                <h2 className="guide-profile-reviews-title">REVIEWS</h2>
                <h3 className="guide-profile-reviews-subtitle">
                  What Fellow Tourist Say About {guide.fullName}
                </h3>

                <div className="guide-profile-reviews-grid">
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div key={review._id} className="guide-profile-review-card">
                        <div className="guide-profile-reviewer-info">
                          <div className="guide-profile-reviewer-avatar">
                            {review.reviewerEmail.charAt(0).toUpperCase()}
                          </div>
                          <div className="guide-profile-reviewer-details">
                            <h4 className="guide-profile-reviewer-name">
                              {review.reviewerName || review.reviewerEmail.split("@")[0]}
                            </h4>
                            <p className="guide-profile-reviewer-title">
                              {review.reviewerTitle || "Client"}
                            </p>
                          </div>
                        </div>
                        <p className="guide-profile-review-text">"{review.reviewText}"</p>
                        <div className="guide-profile-review-rating">
                          <div className="guide-profile-stars">{renderStars(review.rating)}</div>
                          <div className="guide-profile-rating-number">{review.rating.toFixed(1)}</div>
                          <span className="guide-profile-rating-label">Rating</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="guide-profile-no-reviews">No reviews yet.</p>
                  )}
                </div>
              </div>

              <div className="guide-profile-button-container">
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
            </>
          )}
        </div>
      </div>

      {selectedImage && (
        <div className="image-modal-overlay" onClick={handleCloseModal}>
          <div className="image-modal-content">
            <button className="image-modal-close" onClick={handleCloseModal}>×</button>
            <img src={selectedImage} alt="Full size" className="image-modal-img" />
          </div>
        </div>
      )}
    </>
  );
};

export default GuideProfile;