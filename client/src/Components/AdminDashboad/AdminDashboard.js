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
    <div>
      <div style={{ marginBottom: "20px" }}>
        <button onClick={() => setView("pending")} disabled={view === "pending"}>
          Pending Requests
        </button>
        <button onClick={() => setView("verified")} disabled={view === "verified"}>
          Verified Guides
        </button>
      </div>

      {view === "pending" ? (
        <>
          <h2>Pending Approvals</h2>
          {guides.map((guide) => (
            <div key={guide._id} style={{ marginBottom: "30px", padding: "15px", border: "1px solid #ccc", borderRadius: "8px" }}>
              <h3>{guide.fullName}</h3>
              <div>
                <p><strong>Profile Photo:</strong></p>
                {guide.profilePhoto && (
                  <div style={{ position: 'relative' }}>
                    {imageLoading[`profile-${guide._id}`] && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(255,255,255,0.7)'
                      }}>
                        Loading...
                      </div>
                    )}
                    <img
                      src={getCloudinaryUrl(guide.profilePhoto)}
                      alt="Profile Photo"
                      width="150"
                      style={{ cursor: "pointer", border: "1px solid #ccc" }}
                      onLoad={() => setImageLoading(prev => ({ ...prev, [`profile-${guide._id}`]: false }))}
                      onError={() => setImageLoading(prev => ({ ...prev, [`profile-${guide._id}`]: false }))}
                    />
                  </div>
                )}
              </div>
              <p><strong>Email:</strong> {guide.contact?.email || "N/A"}</p>
              <p><strong>Phone:</strong> {guide.contact?.phone || "N/A"}</p>
              <p><strong>Date of Birth:</strong> {guide.dateOfBirth || "N/A"}</p>
              <p><strong>Gender:</strong> {guide.gender || "N/A"}</p>
              <p><strong>Nationality:</strong> {guide.nationality || "N/A"}</p>

              <h4>Address</h4>
              {guide.contact?.address ? (
                <p>
                  {guide.contact.address.street}, {guide.contact.address.city}, {guide.contact.address.district}, {guide.contact.address.province}
                </p>
              ) : (
                <p>No address provided</p>
              )}

              <h4>Professional Details</h4>
              <p><strong>Guide Rank:</strong> {guide.guideRank || "N/A"}</p>
              <p><strong>Experience:</strong> {guide.professionalDetails?.experienceYears || "N/A"} years</p>
              <p>Specialties: {guide.professionalDetails?.specialties?.join(", ") || "No specialties specified"}</p>
              <p>Tour Regions: {guide.professionalDetails?.tourRegions?.join(", ") || "No regions specified"}</p>
              <p>Languages: {guide.professionalDetails?.languagesSpoken?.join(", ") || "No languages specified"}</p>

              <h4>Availability & Pricing</h4>
              <p><strong>Availability:</strong> {guide.availability || "N/A"}</p>
              <p><strong>Hourly Rate:</strong> ${guide.pricing?.hourlyRate || "N/A"}</p>
              <p><strong>Daily Rate:</strong> ${guide.pricing?.dailyRate || "N/A"}</p>
              <p>Payment Methods: {guide.pricing?.paymentMethods?.join(", ") || "No payment methods specified"}</p>

              <h4>Verification Documents</h4>
              <div style={{ display: "flex", gap: "20px" }}>
                {/* Government ID */}
                <div>
                  <p><strong>Government ID:</strong></p>
                  {guide.verificationDocuments?.governmentID ? (
                    <img
                      src={getCloudinaryUrl(guide.verificationDocuments.governmentID)}
                      alt="Government ID"
                      width="150"
                      style={{ cursor: "pointer", border: "1px solid #ccc" }}
                      onClick={() => setSelectedImage(getCloudinaryUrl(guide.verificationDocuments.governmentID, 800))}
                    />
                  ) : (
                    <p>No Government ID provided</p>
                  )}
                </div>

                {/* Tour Guide License */}
                <div>
                  <p><strong>Tour Guide License:</strong></p>
                  {guide.verificationDocuments?.tourGuideLicense ? (
                    <img
                      src={getCloudinaryUrl(guide.verificationDocuments.tourGuideLicense)}
                      alt="Tour Guide License"
                      width="150"
                      style={{ cursor: "pointer", border: "1px solid #ccc" }}
                      onClick={() => setSelectedImage(getCloudinaryUrl(guide.verificationDocuments.tourGuideLicense, 800))}
                    />
                  ) : (
                    <p>No Tour Guide License provided</p>
                  )}
                </div>
              </div>

              <br />
              <button onClick={() => approveGuide(guide._id)} style={{ marginRight: "10px" }}>Approve</button>
              <button onClick={() => handleRejectGuide(guide._id)}>Reject</button>
              {showRejectionModal && (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 1000
                }}>
                  <div style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    width: '500px',
                    maxWidth: '90%'
                  }}>
                    <h3>Select Rejection Reasons</h3>

                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '10px' }}>
                        <input
                          type="checkbox"
                          name="incompleteDocuments"
                          checked={rejectionReasons.incompleteDocuments}
                          onChange={handleReasonChange}
                        />
                        Incomplete or missing documentation
                      </label>

                      <label style={{ display: 'block', marginBottom: '10px' }}>
                        <input
                          type="checkbox"
                          name="insufficientExperience"
                          checked={rejectionReasons.insufficientExperience}
                          onChange={handleReasonChange}
                        />
                        Insufficient experience
                      </label>

                      <label style={{ display: 'block', marginBottom: '10px' }}>
                        <input
                          type="checkbox"
                          name="verificationFailed"
                          checked={rejectionReasons.verificationFailed}
                          onChange={handleReasonChange}
                        />
                        Verification documents could not be verified
                      </label>

                      <label style={{ display: 'block', marginBottom: '10px' }}>
                        <input
                          type="checkbox"
                          name="other"
                          checked={rejectionReasons.other}
                          onChange={handleReasonChange}
                        />
                        Other (please specify below)
                      </label>

                      {rejectionReasons.other && (
                        <textarea
                          name="customReason"
                          value={rejectionReasons.customReason}
                          onChange={handleReasonChange}
                          placeholder="Enter custom rejection reason"
                          style={{
                            width: '100%',
                            minHeight: '80px',
                            padding: '8px',
                            marginTop: '5px',
                            border: '1px solid #ccc',
                            borderRadius: '4px'
                          }}
                        />
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                      <button
                        onClick={() => setShowRejectionModal(false)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#f0f0f0',
                          border: '1px solid #ccc',
                          borderRadius: '4px'
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={confirmRejection}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px'
                        }}
                      >
                        Confirm Rejection
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Full-Size Image Modal */}
          {selectedImage && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
              onClick={() => setSelectedImage(null)} // Close modal when clicking outside
            >
              <img
                src={selectedImage}
                alt="Full Document"
                style={{
                  maxWidth: "90%",
                  maxHeight: "90%",
                  border: "5px solid white",
                  borderRadius: "8px",
                }}
              />
            </div>
          )}
        </>
      ) : (
        <>
          <h2>Verified Guides</h2>
          <label>
            <input
              type="checkbox"
              checked={showAllGuides}
              onChange={() => setShowAllGuides(!showAllGuides)}
            />
            Show inactive guides
          </label>
          {verifiedGuides.map((guide) => (
            <div key={guide._id} style={{
              marginBottom: "30px",
              padding: "15px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              backgroundColor: guide.isActive ? '#f9f9f9' : '#ffeeee'
            }}>
              <h3>{guide.fullName}</h3>
              <div>
                {guide.profilePhoto && (
                  <img
                    src={getCloudinaryUrl(guide.profilePhoto)}
                    alt="Profile"
                    width="50"
                    style={{ float: 'right', marginLeft: '15px' }}
                  />
                )}
                <p>Email: {guide.contact?.email || "N/A"}</p>
                <p>Status: {guide.isActive ?
                  <span style={{ color: 'green' }}>Active</span> :
                  <span style={{ color: 'red' }}>Inactive</span>}
                </p>
              </div>

              <div style={{ marginTop: '10px' }}>
                {guide.isActive ? (
                  <button
                    onClick={() => deactivateGuide(guide._id)}
                    style={{ backgroundColor: '#ffcccc', marginRight: '10px' }}
                  >
                    Deactivate
                  </button>
                ) : (
                  <button
                    onClick={() => reactivateGuide(guide._id)}
                    style={{ backgroundColor: '#ccffcc', marginRight: '10px' }}
                  >
                    Reactivate
                  </button>
                )}

                <button
                  onClick={() => deleteGuide(guide._id, false)}
                  style={{ color: "red", marginRight: '10px' }}
                >
                  Delete Guide
                </button>

                <button
                  onClick={() => {
                    fetchReviewsForGuide(guide._id);
                    setExpandedGuideId(expandedGuideId === guide._id ? null : guide._id);
                  }}
                  style={{ marginLeft: '10px' }}
                >
                  {expandedGuideId === guide._id ? 'Hide Reviews' : 'View Reviews'}
                </button>
              </div>

              {/* Reviews Section */}
              {expandedGuideId === guide._id && reviewsByGuide[guide._id] && (
                <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                  <h4>Reviews</h4>
                  {reviewsByGuide[guide._id].length === 0 ? (
                    <p>No reviews yet.</p>
                  ) : (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                      {reviewsByGuide[guide._id].map(review => (
                        <li key={review._id} style={{
                          padding: '10px',
                          marginBottom: '10px',
                          backgroundColor: '#f5f5f5',
                          borderRadius: '5px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <strong>{review.reviewerName || 'Anonymous'}</strong>: {review.reviewText}
                            <div>Rating: {'★'.repeat(review.rating)}</div>
                          </div>
                          <button
                            onClick={() => deleteReview(review._id, guide._id)}
                            style={{
                              color: 'white',
                              backgroundColor: '#dc3545',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '5px 10px',
                              cursor: 'pointer'
                            }}
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
