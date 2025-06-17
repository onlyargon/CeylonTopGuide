import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import './PublicGuideProfile.css';
import Header from '../Header/Header'
import Footer from "../Footer/Footer";
import { FaWhatsapp, FaImages, FaUserTie, FaTimes, FaEnvelope } from 'react-icons/fa';
import { QRCodeSVG } from "qrcode.react";

const PublicGuideProfile = () => {
  const { id } = useParams();
  const [guide, setGuide] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [tourPhotos, setTourPhotos] = useState([]);
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchGuideWithRecalculation = async () => {
      try {
        await axios.post(`${process.env.REACT_APP_API_BASE_URL}/reviews/recalculate/${id}`);
        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/guides/verified/${id}`);
        setGuide(res.data);
      } catch (error) {
        console.error("Primary guide profile fetch failed, trying localhost:", error);
        try {
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
        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/reviews/guide/${id}?verified=true`);
        setReviews(res.data);
      } catch (error) {
        console.error("Primary reviews fetch failed, trying localhost:", error);
        try {
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
        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/tourPhotos/guide/${id}`);
        setTourPhotos(res.data);
      } catch (error) {
        console.error("Primary tour photos fetch failed, trying localhost:", error);
        try {
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
        <span key={i} className={i <= rating ? "text-champYellow" : "text-gray-300"}>
          ★
        </span>
      );
    }
    return <div className="flex">{stars}</div>;
  };

  const getCloudinaryUrl = (imagePath) => {
    if (!imagePath) return '/default-profile.png';
    if (imagePath.startsWith('http')) return imagePath;
    return `https://res.cloudinary.com/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload/${imagePath}`;
  };

  const handleImageClick = (imagePath) => {
    setSelectedImage(imagePath);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  if (!guide) return <div className="min-h-screen bg-gray-100 p-8"><h2 className="text-2xl font-bold text-gray-800">Loading...</h2></div>;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-defaultWhite">
        <div className="max-w-7xl mx-auto p-8 bg-pureWhite rounded-2xl shadow-lg">
          <div className="flex justify-between items-start mb-8">
            <div className="flex-1 pr-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">{guide.fullName}</h1>

              <div className="flex gap-8 mb-4">
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-gray-800">{guide.professionalDetails?.experienceYears || '0'}</span>
                  <span className="text-sm text-gray-600">Years</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-gray-800">★{(Number(guide.averageRating) || 0).toFixed(2)}</span>
                  <span className="text-sm text-gray-600">Rating</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-gray-800">
                    {guide.pricing?.hourlyRate && guide.pricing?.hourlyRate !== "0" ? (
                      `$${guide.pricing.hourlyRate}`
                    ) : guide.pricing?.dailyRate && guide.pricing?.dailyRate !== "0" ? (
                      `$${guide.pricing.dailyRate}`
                    ) : (
                      "Rate not set"
                    )}
                  </span>
                  <span className="text-sm text-gray-600">
                    {guide.pricing?.hourlyRate && guide.pricing?.hourlyRate !== "0" ? 'Hourly Rate' : 'Daily Rate'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-4">
                <a 
                  href={`https://wa.me/${guide.contact?.phone ? 
                    (guide.contact.phone.startsWith('+94') ? 
                      guide.contact.phone.replace(/[^0-9]/g, '') : 
                      (guide.contact.phone.startsWith('0') ? 
                        '94' + guide.contact.phone.substring(1).replace(/[^0-9]/g, '') :
                        '94' + guide.contact.phone.replace(/[^0-9]/g, ''))) 
                    : ''}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-lg text-gray-800 hover:text-secondaryGreen transition-colors"
                >
                  <FaWhatsapp className="text-secondaryGreen" /> {guide.contact?.phone || "Phone not provided"}
                </a>
                <a 
                  href={`mailto:${guide.contact?.email || ''}`}
                  className="flex items-center gap-2 text-lg text-gray-800 hover:text-gray-600 transition-colors"
                >
                  <FaEnvelope className="text-gray-800" /> {guide.contact?.email || "Email not provided"}
                </a>
              </div>
            </div>

            <div className="w-48 h-48 sm:w-[100px] sm:h-[50px] rounded-full overflow-hidden shadow-lg">
              <img
                src={getCloudinaryUrl(guide.profilePhoto)}
                alt={guide.fullName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/default-profile.png';
                }}
              />
            </div>
          </div>

          <div className="h-px bg-gray-200 my-8"></div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">About Me</h2>
            <div className={`relative ${isAboutExpanded ? 'max-h-none' : 'max-h-24'} overflow-hidden transition-all duration-300`}>
              <p className="text-gray-600">{guide.additionalInfo?.bio || "No bio added yet."}</p>
            </div>
            <button
              className="text-primaryGreen hover:text-secondaryGreen transition-colors duration-200 py-2"
              onClick={() => setIsAboutExpanded(!isAboutExpanded)}
            >
              {isAboutExpanded ? 'See Less' : 'See More'}
            </button>
          </div>

          <div className="h-px bg-gray-200 my-8"></div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 my-8">
            {/* Tour Photos Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FaImages className="text-primaryGreen" />
                Tour Photos
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {tourPhotos.length > 0 ? (
                  tourPhotos.map((photo) => (
                    <div key={photo._id} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                      <img
                        src={`${photo.imagePath}?w=400&h=300&c_fill`}
                        alt={photo.caption || "Tour"}
                        className="w-full h-48 object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                        onClick={() => handleImageClick(photo.imagePath)}
                      />
                      {photo.caption && (
                        <div className="p-3 text-center text-sm text-gray-600 border-t border-gray-100">
                          {photo.caption}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="col-span-2 text-gray-600 text-center py-4">No tour photos uploaded yet.</p>
                )}
              </div>
            </div>

            {/* Professional Details Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FaUserTie className="text-primaryGreen" />
                Professional Details
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-2">Specialties</h3>
                    <p className="text-gray-600">{guide.professionalDetails?.specialties?.join(", ") || "Not specified"}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-2">Languages</h3>
                    <p className="text-gray-600">{guide.professionalDetails?.languagesSpoken?.join(", ") || "Not specified"}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-2">Tour Regions</h3>
                    <p className="text-gray-600">{guide.professionalDetails?.tourRegions?.join(", ") || "Not specified"}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-2">Experience</h3>
                    <p className="text-gray-600">{guide.professionalDetails?.experienceYears || "0"} years</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-2">Rates</h3>
                    <div className="flex gap-4">
                      {guide.pricing?.hourlyRate && guide.pricing?.hourlyRate !== "0" ? (
                        <span className="px-3 py-1 bg-primaryGreen/10 text-primaryGreen font-bold rounded">
                          ${guide.pricing.hourlyRate}/hour
                        </span>
                      ) : guide.pricing?.dailyRate && guide.pricing?.dailyRate !== "0" ? (
                        <span className="px-3 py-1 bg-primaryGreen/10 text-primaryGreen font-bold rounded">
                          ${guide.pricing.dailyRate}/day
                        </span>
                      ) : (
                        <span className="text-gray-600">Not set</span>
                      )}
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-2">Availability</h3>
                    <p className="text-gray-600">{guide.availability || "Not specified"}</p>
                  </div>
                </div>
                {guide._id && (
                  <div className="mt-6 text-center p-4 bg-gray-50 rounded-lg">
                    <QRCodeSVG
                      value={`${window.location.origin}/guides/${guide._id}`}
                      size={100}
                      level="H"
                      includeMargin={true}
                    />
                    <p className="mt-2 text-sm text-gray-600">Scan to view this profile</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-200 my-8"></div>

          <div className="mt-8 flex flex-col items-center justify-center">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">REVIEWS</h2>
            <h3 className="text-sm text-defaultGrey text-center mb-8">
              What Fellow Tourist Say About {guide.fullName}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 max-w-6xl mx-auto place-items-center">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review._id} className="p-6 bg-pureWhite rounded-lg shadow-lg w-full max-w-sm">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-primaryGreen text-pureWhite rounded-full flex items-center justify-center mr-4">
                        {review.reviewerEmail.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-md text-gray-800">
                          {review.reviewerName || review.reviewerEmail.split("@")[0]}
                        </h4>
                        <p className="text-sm text-defaultGrey">
                          {review.reviewerTitle || "Client"}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-600 italic mb-4">"{review.reviewText}"</p>
                    <div className="flex items-center gap-4">
                      <div className="text-champYellow">
                        {renderStars(review.rating)}
                      </div>
                      <div className="font-bold text-gray-800">{review.rating.toFixed(1)}</div>
                      <span className="text-sm text-gray-600">Rating</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="col-span-full text-center text-gray-600">No reviews yet.</p>
              )}
            </div>

            <Link 
              to={`/guides/${id}/add-review`} 
              className="inline-block px-6 py-3 bg-primaryGreen text-pureWhite rounded-full hover:bg-secondaryGreen transition-colors duration-200"
            >
              Write a review
            </Link>
          </div>
        </div>
      </div>

      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={handleCloseModal}>
          <div className="relative max-w-[90%] max-h-[90%]">
            <button className="absolute -top-10 right-0 text-pureWhite text-3xl hover:text-gray-300" onClick={handleCloseModal}>×</button>
            <img src={selectedImage} alt="Full size" className="max-w-full max-h-[90vh] object-contain" />
          </div>
        </div>
      )}
      <div className="relative z-20">
        <Footer />
      </div>
    </>
  );
};

export default PublicGuideProfile;