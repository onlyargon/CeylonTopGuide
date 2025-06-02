import { useEffect, useState } from "react";
import axios from "axios";

const AdminPanel = () => {
  const [guides, setGuides] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [view, setView] = useState("pending");
  const [verifiedGuides, setVerifiedGuides] = useState([]);
  const [reviewsByGuide, setReviewsByGuide] = useState({});
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [showAllGuides, setShowAllGuides] = useState(false);
  const [expandedGuideId, setExpandedGuideId] = useState(null);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [currentGuideId, setCurrentGuideId] = useState(null);
  const [imageLoading, setImageLoading] = useState({});
  const [rejectionReasons, setRejectionReasons] = useState({
    incompleteDocuments: false,
    insufficientExperience: false,
    verificationFailed: false,
    other: false,
    customReason: ""
  });

  const cloudinaryBaseUrl = `https://res.cloudinary.com/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`;

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_BASE_URL}/guides/unverified`)
      .then((res) => setGuides(res.data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    const endpoint = showAllGuides ? '/verified/all' : '/verified';
    axios
      .get(`${process.env.REACT_APP_API_BASE_URL}/guides${endpoint}`)
      .then((res) => setVerifiedGuides(res.data))
      .catch((err) => console.error(err));
  }, [view, showAllGuides]);

  const getCloudinaryUrl = (publicId, width = 300) => {
    if (!publicId) return null;

    // Check if it's already a full Cloudinary URL
    if (publicId.includes('res.cloudinary.com')) {
      // Extract the public ID from the full URL if needed
      const parts = publicId.split('/upload/');
      if (parts.length > 1) {
        return `${parts[0]}/upload/w_${width},q_auto/${parts[1]}`;
      }
      return publicId; // Return as-is if we can't parse it
    }

    // If it's just the public ID (without the full URL)
    return `${cloudinaryBaseUrl}/w_${width},q_auto/${publicId}`;
  };

  const approveGuide = async (id) => {
    const confirmed = window.confirm("Approve this guide and send acceptance email?");
    if (!confirmed) return;

    setIsSendingEmail(true);
    try {
      const response = await axios.put(`${process.env.REACT_APP_API_BASE_URL}/guides/approve/${id}`);
      alert(response.data.message);
      setGuides(guides.filter((guide) => guide._id !== id));
    } catch (err) {
      console.error('Error:', err);
      alert(`Error: ${err.response?.data?.error || 'Failed to approve guide'}`);
      if (err.response?.data?.details) {
        console.error('Server details:', err.response.data.details);
      }
    } finally {
      setIsSendingEmail(false);
    }
  };

  const rejectGuide = (id) => {
    axios
      .delete(`${process.env.REACT_APP_API_BASE_URL}/guides/reject/${id}`)
      .then(() => setGuides(guides.filter((guide) => guide._id !== id)))
      .catch((err) => console.error(err));
  };

  const deleteGuide = (id, fromVerified) => {
    const confirmed = window.confirm("Are you sure you want to delete this guide? This action cannot be undone.");
    if (!confirmed) return;

    axios
      .delete(`${process.env.REACT_APP_API_BASE_URL}/guides/delete/${id}`)
      .then(() => {
        alert("Guide deleted successfully.");
        window.location.reload(); // Refresh the page to reflect the change
      })
      .catch((err) => {
        console.error(err);
        alert("An error occurred while trying to delete the guide.");
      });
  };

  const fetchReviewsForGuide = (guideId) => {
    axios
      .get(`${process.env.REACT_APP_API_BASE_URL}/reviews/guide/${guideId}`)
      .then((res) =>
        setReviewsByGuide((prev) => ({
          ...prev,
          [guideId]: res.data,
        }))
      )
      .catch((err) => console.error(err));
  };

  const deleteReview = async (reviewId, guideId) => {
    const confirmed = window.confirm("Are you sure you want to delete this review?");
    if (!confirmed) return;

    try {
      await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/reviews/${reviewId}`);
      alert("Review deleted successfully.");

      const updatedReviews = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/reviews/guide/${guideId}`);
      setReviewsByGuide((prev) => ({
        ...prev,
        [guideId]: updatedReviews.data
      }));
    } catch (error) {
      console.error("Failed to delete review:", error);
      alert("Failed to delete review.");
    }
  };

  const deactivateGuide = async (id) => {
    const confirmed = window.confirm("Are you sure you want to deactivate this guide?");
    if (!confirmed) return;

    try {
      await axios.put(`${process.env.REACT_APP_API_BASE_URL}/guides/deactivate/${id}`);
      alert("Guide deactivated successfully.");
      // Refresh the verified guides list
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/guides/verified`);
      setVerifiedGuides(res.data);
    } catch (error) {
      console.error("Failed to deactivate guide:", error);
      alert("Failed to deactivate guide.");
    }
  };

  const reactivateGuide = async (id) => {
    const confirmed = window.confirm("Are you sure you want to reactivate this guide?");
    if (!confirmed) return;

    try {
      await axios.put(`${process.env.REACT_APP_API_BASE_URL}/guides/reactivate/${id}`);
      alert("Guide reactivated successfully.");
      // Refresh the verified guides list
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/guides/verified`);
      setVerifiedGuides(res.data);
    } catch (error) {
      console.error("Failed to reactivate guide:", error);
      alert("Failed to reactivate guide.");
    }
  };

  const handleRejectGuide = (id) => {
    setCurrentGuideId(id);
    setShowRejectionModal(true);
  };

  const confirmRejection = async () => {
    const confirmed = window.confirm("Are you sure you want to reject this application?");
    if (!confirmed) return;

    // Prepare rejection reasons for API
    const reasonsToSend = [];

    if (rejectionReasons.incompleteDocuments) {
      reasonsToSend.push({
        type: 'predefined',
        value: 'Incomplete or missing documentation'
      });
    }
    if (rejectionReasons.insufficientExperience) {
      reasonsToSend.push({
        type: 'predefined',
        value: 'Insufficient experience for our requirements'
      });
    }
    if (rejectionReasons.verificationFailed) {
      reasonsToSend.push({
        type: 'predefined',
        value: 'Verification documents could not be verified'
      });
    }
    if (rejectionReasons.other && rejectionReasons.customReason.trim()) {
      reasonsToSend.push({
        type: 'custom',
        customText: rejectionReasons.customReason.trim()
      });
    }

    if (reasonsToSend.length === 0) {
      alert("Please select at least one rejection reason");
      return;
    }

    try {
      await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/guides/reject/${currentGuideId}`, {
        data: { rejectionReasons: reasonsToSend }
      });

      setGuides(guides.filter(guide => guide._id !== currentGuideId));
      setShowRejectionModal(false);
      alert("Guide rejected and notification sent");
    } catch (err) {
      console.error('Rejection failed:', err);
      alert(`Error: ${err.response?.data?.error || 'Failed to reject guide'}`);
    }
  };

  const handleReasonChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRejectionReasons(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageError = (e) => {
    e.target.style.display = 'none'; // Hide broken image
    e.target.parentNode.querySelector('.image-error').style.display = 'block';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => setView("pending")} 
          disabled={view === "pending"}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            view === "pending" 
              ? "bg-blue-600 text-white cursor-not-allowed" 
              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
          }`}
        >
          Pending Requests
        </button>
        <button 
          onClick={() => setView("verified")} 
          disabled={view === "verified"}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            view === "verified" 
              ? "bg-blue-600 text-white cursor-not-allowed" 
              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
          }`}
        >
          Verified Guides
        </button>
      </div>

      {view === "pending" ? (
        <>
          <h2 className="text-2xl font-bold mb-6">Pending Approvals</h2>
          {guides.map((guide) => (
            <div key={guide._id} className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">{guide.fullName}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="font-medium mb-2">Profile Photo:</p>
                  {guide.profilePhoto && (
                    <div className="relative">
                      {imageLoading[`profile-${guide._id}`] && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                          Loading...
                        </div>
                      )}
                      <img
                        src={getCloudinaryUrl(guide.profilePhoto)}
                        alt="Profile Photo"
                        className="w-40 h-40 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                        onLoad={() => setImageLoading(prev => ({ ...prev, [`profile-${guide._id}`]: false }))}
                        onError={() => setImageLoading(prev => ({ ...prev, [`profile-${guide._id}`]: false }))}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <p><span className="font-medium">Email:</span> {guide.contact?.email || "N/A"}</p>
                  <p><span className="font-medium">Phone:</span> {guide.contact?.phone || "N/A"}</p>
                  <p><span className="font-medium">Date of Birth:</span> {guide.dateOfBirth || "N/A"}</p>
                  <p><span className="font-medium">Gender:</span> {guide.gender || "N/A"}</p>
                  <p><span className="font-medium">Nationality:</span> {guide.nationality || "N/A"}</p>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-2">Address</h4>
                {guide.contact?.address ? (
                  <p className="text-gray-700">
                    {guide.contact.address.street}, {guide.contact.address.city}, {guide.contact.address.district}, {guide.contact.address.province}
                  </p>
                ) : (
                  <p className="text-gray-500">No address provided</p>
                )}
              </div>

              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-2">Professional Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <p><span className="font-medium">Guide Rank:</span> {guide.guideRank || "N/A"}</p>
                  <p><span className="font-medium">Experience:</span> {guide.professionalDetails?.experienceYears || "N/A"} years</p>
                  <p><span className="font-medium">Specialties:</span> {guide.professionalDetails?.specialties?.join(", ") || "No specialties specified"}</p>
                  <p><span className="font-medium">Tour Regions:</span> {guide.professionalDetails?.tourRegions?.join(", ") || "No regions specified"}</p>
                  <p><span className="font-medium">Languages:</span> {guide.professionalDetails?.languagesSpoken?.join(", ") || "No languages specified"}</p>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-2">Availability & Pricing</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <p><span className="font-medium">Availability:</span> {guide.availability || "N/A"}</p>
                  <p><span className="font-medium">Hourly Rate:</span> ${guide.pricing?.hourlyRate || "N/A"}</p>
                  <p><span className="font-medium">Daily Rate:</span> ${guide.pricing?.dailyRate || "N/A"}</p>
                  <p><span className="font-medium">Payment Methods:</span> {guide.pricing?.paymentMethods?.join(", ") || "No payment methods specified"}</p>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-4">Verification Documents</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="font-medium mb-2">Government ID:</p>
                    {guide.verificationDocuments?.governmentID ? (
                      <img
                        src={getCloudinaryUrl(guide.verificationDocuments.governmentID)}
                        alt="Government ID"
                        className="w-40 h-40 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setSelectedImage(getCloudinaryUrl(guide.verificationDocuments.governmentID, 800))}
                      />
                    ) : (
                      <p className="text-gray-500">No Government ID provided</p>
                    )}
                  </div>

                  <div>
                    <p className="font-medium mb-2">Tour Guide License:</p>
                    {guide.verificationDocuments?.tourGuideLicense ? (
                      <img
                        src={getCloudinaryUrl(guide.verificationDocuments.tourGuideLicense)}
                        alt="Tour Guide License"
                        className="w-40 h-40 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setSelectedImage(getCloudinaryUrl(guide.verificationDocuments.tourGuideLicense, 800))}
                      />
                    ) : (
                      <p className="text-gray-500">No Tour Guide License provided</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-4">
                <button 
                  onClick={() => approveGuide(guide._id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Approve
                </button>
                <button 
                  onClick={() => handleRejectGuide(guide._id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}

          {showRejectionModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
                <h3 className="text-xl font-semibold mb-4">Select Rejection Reasons</h3>

                <div className="space-y-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="incompleteDocuments"
                      checked={rejectionReasons.incompleteDocuments}
                      onChange={handleReasonChange}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    Incomplete or missing documentation
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="insufficientExperience"
                      checked={rejectionReasons.insufficientExperience}
                      onChange={handleReasonChange}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    Insufficient experience
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="verificationFailed"
                      checked={rejectionReasons.verificationFailed}
                      onChange={handleReasonChange}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    Verification documents could not be verified
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="other"
                      checked={rejectionReasons.other}
                      onChange={handleReasonChange}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    Other (please specify below)
                  </label>

                  {rejectionReasons.other && (
                    <textarea
                      name="customReason"
                      value={rejectionReasons.customReason}
                      onChange={handleReasonChange}
                      placeholder="Enter custom rejection reason"
                      className="w-full min-h-[80px] p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  )}
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    onClick={() => setShowRejectionModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmRejection}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedImage && (
            <div
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
              onClick={() => setSelectedImage(null)}
            >
              <img
                src={selectedImage}
                alt="Full Document"
                className="max-w-[90%] max-h-[90%] border-4 border-white rounded-lg"
              />
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Verified Guides</h2>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showAllGuides}
                onChange={() => setShowAllGuides(!showAllGuides)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              Show inactive guides
            </label>
          </div>

          {verifiedGuides.map((guide) => (
            <div key={guide._id} className={`bg-white rounded-lg shadow-md p-6 mb-6 ${
              !guide.isActive ? 'bg-red-50' : ''
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{guide.fullName}</h3>
                  <p className="text-gray-600">Email: {guide.contact?.email || "N/A"}</p>
                  <p className="mt-1">
                    Status: {guide.isActive ? (
                      <span className="text-green-600 font-medium">Active</span>
                    ) : (
                      <span className="text-red-600 font-medium">Inactive</span>
                    )}
                  </p>
                </div>
                {guide.profilePhoto && (
                  <img
                    src={getCloudinaryUrl(guide.profilePhoto)}
                    alt="Profile"
                    className="w-16 h-16 object-cover rounded-full"
                  />
                )}
              </div>

              <div className="mt-4 flex gap-4">
                {guide.isActive ? (
                  <button
                    onClick={() => deactivateGuide(guide._id)}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    Deactivate
                  </button>
                ) : (
                  <button
                    onClick={() => reactivateGuide(guide._id)}
                    className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    Reactivate
                  </button>
                )}

                <button
                  onClick={() => deleteGuide(guide._id, false)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Guide
                </button>

                <button
                  onClick={() => {
                    fetchReviewsForGuide(guide._id);
                    setExpandedGuideId(expandedGuideId === guide._id ? null : guide._id);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {expandedGuideId === guide._id ? 'Hide Reviews' : 'View Reviews'}
                </button>
              </div>

              {expandedGuideId === guide._id && reviewsByGuide[guide._id] && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-lg font-semibold mb-4">Reviews</h4>
                  {reviewsByGuide[guide._id].length === 0 ? (
                    <p className="text-gray-500">No reviews yet.</p>
                  ) : (
                    <ul className="space-y-4">
                      {reviewsByGuide[guide._id].map(review => (
                        <li key={review._id} className="bg-gray-50 rounded-lg p-4 flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">{review.reviewerName || 'Anonymous'}</p>
                            <p className="text-gray-700 mt-1">{review.reviewText}</p>
                            <p className="text-yellow-500 mt-1">Rating: {'★'.repeat(review.rating)}</p>
                          </div>
                          <button
                            onClick={() => deleteReview(review._id, guide._id)}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                          >
                            Delete
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default AdminPanel;
