import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import './GuideRegister.css'
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import axios from "axios";
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Register = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [errors, setErrors] = useState({});
    const [currentSlide, setCurrentSlide] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        dateOfBirth: "",
        gender: "",
        nationality: "",
        profilePhoto: "",
        email: "",
        phone: "",
        address: { street: "", city: "", district: "", province: "" },
        guideRank: "",
        languagesSpoken: [],
        experienceYears: 0,
        specialties: [],
        tourRegions: [],
        governmentID: "",
        tourGuideLicense: "",
        availability: "",
        hourlyRate: "",
        dailyRate: "",
        rateType: "",
        paymentMethods: [],
        username: "",
        password: "",
        bio: "",
        hourlyRateMin: "",
        hourlyRateMax: "",
        dailyRateMin: "",
        dailyRateMax: "",
    });

    // Cloudinary upload function
    const uploadToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'guide_photos');
        formData.append('folder', 'tour_photos');

        try {
            const response = await axios.post(
                `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data.secure_url;
        } catch (error) {
            console.error('Upload error details:', error.response?.data);
            throw new Error('Upload failed');
        }
    };

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
    ];

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % slides.length);
        }, 10000); // 10 seconds

        return () => clearInterval(interval);
    }, []);

    const availableLanguages = ["English", "Spanish", "French", "German", "Chinese", "Tamil", "Sinhala"];

    const handleLanguageSelect = (e) => {
        const selectedLanguage = e.target.value;
        if (selectedLanguage && !formData.languagesSpoken.includes(selectedLanguage)) {
            setFormData({
                ...formData,
                languagesSpoken: [...formData.languagesSpoken, selectedLanguage],
            });
        }
    };

    const handleLanguageInput = (e) => {
        setFormData({ ...formData, languageInput: e.target.value });
    };

    const addLanguage = () => {
        if (formData.languageInput.trim() !== "" && !formData.languagesSpoken.includes(formData.languageInput)) {
            setFormData({
                ...formData,
                languagesSpoken: [...formData.languagesSpoken, formData.languageInput.trim()],
                languageInput: "",
            });
        }
    };

    const removeLanguage = (language) => {
        setFormData({
            ...formData,
            languagesSpoken: formData.languagesSpoken.filter((lang) => lang !== language),
        });
    };

    const availableSpecialties = ["Cultural Tours", "Wildlife Safaris", "Adventure Travels", "Historical Sites", "Hiking", "Photography"];
    const availableRegions = ["Colombo", "Kandy", "Ella", "Galle", "Sigiriya", "Nuwara Eliya","All Island"];

    const handleSelect = (e, field) => {
        const selectedValue = e.target.value;
        if (selectedValue && !formData[field].includes(selectedValue)) {
            setFormData({ ...formData, [field]: [...formData[field], selectedValue] });
        }
    };

    const handleAddCustom = (field, inputField) => {
        if (formData[inputField].trim() !== "" && !formData[field].includes(formData[inputField])) {
            setFormData({
                ...formData,
                [field]: [...formData[field], formData[inputField].trim()],
                [inputField]: "",
            });
        }
    };

    const handleRemove = (field, item) => {
        setFormData({ ...formData, [field]: formData[field].filter((i) => i !== item) });
    };

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            address: {
                ...formData.address,
                [name]: value,
            },
        });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (5MB = 5 * 1024 * 1024 bytes)
            if (file.size > 5 * 1024 * 1024) {
                alert("Image size should not exceed 5MB. Please choose a smaller image.");
                e.target.value = ''; // Clear the file input
                return;
            }
            setUploading(true);
            try {
                const url = await uploadToCloudinary(file);
                setFormData({
                    ...formData,
                    profilePhoto: url,
                    profilePhotoPreview: url,
                });
            } catch (error) {
                alert('Failed to upload profile photo: ' + error.message);
            } finally {
                setUploading(false);
            }
        }
    };

    const handleDistrictChange = (e) => {
        setFormData({
            ...formData,
            address: {
                ...formData.address,
                district: e.target.value,
            },
        });
    };

    const handleProvinceChange = (e) => {
        setFormData({
            ...formData,
            address: {
                ...formData.address,
                province: e.target.value,
                district: "", // Reset district when province changes
            },
        });
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        const fileName = e.target.name;

        if (file) {
            // Check file size (5MB = 5 * 1024 * 1024 bytes)
            if (file.size > 5 * 1024 * 1024) {
                alert("Image size should not exceed 5MB. Please choose a smaller image.");
                e.target.value = ''; // Clear the file input
                return;
            }
            try {
                const url = await uploadToCloudinary(file);
                setFormData(prev => ({
                    ...prev,
                    [fileName]: url,
                    [`${fileName}Preview`]: url,
                }));
            } catch (error) {
                alert(`Failed to upload ${fileName}`);
            }
        }
    };

    const validateStep = (step) => {
        const errors = {};
        
        switch(step) {
            case 1:
                if (!formData.fullName) errors.fullName = "Full Name is required";
                if (!formData.dateOfBirth) errors.dateOfBirth = "Date of Birth is required";
                if (!formData.gender) errors.gender = "Gender is required";
                if (!formData.nationality) errors.nationality = "Nationality is required";
                if (!formData.profilePhoto) errors.profilePhoto = "Profile Photo is required";
                break;
                
            case 2:
                if (!formData.email) errors.email = "Email is required";
                else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = "Invalid email format";
                if (!formData.phone) errors.phone = "Phone is required";
                else if (!/^07[0-9]{8}$/.test(formData.phone)) errors.phone = "Phone must start with 07 and be 10 digits";
                if (!formData.address.street) errors.street = "Street address is required";
                if (!formData.address.city) errors.city = "City is required";
                if (!formData.address.province) errors.province = "Province is required";
                if (!formData.address.district) errors.district = "District is required";
                break;
                
            case 3:
                if (!formData.guideRank) errors.guideRank = "Guide Rank is required";
                break;
                
            case 4:
                if (!formData.governmentID) errors.governmentID = "Government ID is required";
                if (formData.guideRank !== "Unregistered Guide" && !formData.tourGuideLicense) {
                    errors.tourGuideLicense = "Tour Guide License is required";
                }
                break;
                
            case 5:
                if (formData.languagesSpoken.length === 0) errors.languagesSpoken = "At least one language is required";
                if (!formData.experienceYears) errors.experienceYears = "Years of experience is required";
                else if (isNaN(formData.experienceYears) || formData.experienceYears < 0) errors.experienceYears = "Invalid years of experience";
                if (formData.specialties.length === 0) errors.specialties = "At least one specialty is required";
                if (formData.tourRegions.length === 0) errors.tourRegions = "At least one tour region is required";
                break;
                
            case 6:
                if (!formData.availability) errors.availability = "Availability is required";
                if (!formData.rateType) errors.rateType = "Please select either hourly or daily rate";
                if (formData.rateType === "hourly") {
                    if (!formData.hourlyRateMin || !formData.hourlyRateMax) {
                        errors.hourlyRate = "Both minimum and maximum hourly rates are required";
                    } else if (Number(formData.hourlyRateMin) > Number(formData.hourlyRateMax)) {
                        errors.hourlyRate = "Minimum rate cannot be greater than maximum rate";
                    }
                }
                if (formData.rateType === "daily") {
                    if (!formData.dailyRateMin || !formData.dailyRateMax) {
                        errors.dailyRate = "Both minimum and maximum daily rates are required";
                    } else if (Number(formData.dailyRateMin) > Number(formData.dailyRateMax)) {
                        errors.dailyRate = "Minimum rate cannot be greater than maximum rate";
                    }
                }
                if (formData.paymentMethods.length === 0) errors.paymentMethods = "At least one payment method is required";
                break;
                
            case 7:
                if (!formData.username) errors.username = "Username is required";
                if (!formData.password) errors.password = "Password is required";
                else if (formData.password.length < 8) {
                    errors.password = "Password must be at least 8 characters long";
                } else if (!/[a-zA-Z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
                    errors.password = "Password must contain both letters and numbers";
                }
                if (!formData.bio) errors.bio = "About Me is required";
                break;
        }
        
        return errors;
    };

    const nextStep = () => {
        const stepErrors = validateStep(step);
        
        if (Object.keys(stepErrors).length > 0) {
            setErrors(stepErrors);
            // Scroll to the first error
            const firstErrorField = Object.keys(stepErrors)[0];
            const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
            if (errorElement) {
                errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }
        
        window.scrollTo(0, 0);
        setStep(step + 1);
        setErrors({});
    };

    const prevStep = () => {
        window.scrollTo(0, 0);
        setStep(step - 1);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Final validation before submission
        const finalErrors = validateStep(step);
        if (Object.keys(finalErrors).length > 0) {
            setErrors(finalErrors);
            return;
        }

        try {
            // Format the rates into strings with min/max values
            let formattedHourlyRate = '';
            let formattedDailyRate = '';
            
            if (formData.rateType === 'hourly') {
                formattedHourlyRate = `$${formData.hourlyRateMin}-${formData.hourlyRateMax}/hour`;
                formattedDailyRate = ''; // Clear daily rate if hourly is selected
            } else if (formData.rateType === 'daily') {
                formattedDailyRate = `$${formData.dailyRateMin}-${formData.dailyRateMax}/day`;
                formattedHourlyRate = ''; // Clear hourly rate if daily is selected
            }

            // Format the data before sending
            const requestData = {
                ...formData,
                // Ensure these are strings
                email: formData.email?.trim(),
                phone: formData.phone?.trim(),
                username: formData.username?.trim(),
                // Format the rates as strings
                hourlyRate: formattedHourlyRate,
                dailyRate: formattedDailyRate,
                // Ensure these are numbers
                experienceYears: Number(formData.experienceYears),
                // Ensure these are arrays
                languagesSpoken: Array.isArray(formData.languagesSpoken) ? formData.languagesSpoken : [],
                specialties: Array.isArray(formData.specialties) ? formData.specialties : [],
                tourRegions: Array.isArray(formData.tourRegions) ? formData.tourRegions : [],
                paymentMethods: Array.isArray(formData.paymentMethods) ? formData.paymentMethods : [],
                // Ensure address is properly formatted
                address: {
                    street: formData.address.street?.trim(),
                    city: formData.address.city?.trim(),
                    district: formData.address.district?.trim(),
                    province: formData.address.province?.trim(),
                },
                // Keep the file URLs
                profilePhoto: formData.profilePhoto,
                governmentID: formData.governmentID,
                tourGuideLicense: formData.tourGuideLicense,
            };

            console.log('Sending registration data:', requestData);

            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/guides/register`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            const data = await response.json();
            console.log('Server response:', data);

            if (!response.ok) {
                if (data.message && data.message.toLowerCase().includes('email already exists')) {
                    alert("This email belongs to a registered account. If you have an account, please log in using the same email.");
                    return;
                }
                throw new Error(data.message || "Failed to register");
            }

            console.log("Registration successful:", data);
            alert("Registration successful!");
            navigate("/registration-confirmation");
        } catch (error) {
            console.error("Error submitting form:", error.message);
            console.error("Full error:", error);
            alert(`Registration failed: ${error.message}`);
        }
    };

    return (
        <div>
            <Header />
            <div
                className="background-banner-container"
                id="home"
                style={{
                    backgroundImage: `url(/Slideshow/${slides[step - 1]})`,
                }}
            >
                <div className="registration-container">
                    {step === 1 && (
                        <div>
                            <h2>Step 1: Personal Information</h2>
                            <div className={`registration-form-group ${errors.fullName ? 'error' : ''}`}>
                                <label>Full Name</label>
                                <p className="registration-sub-label">Use your full name, same as your ID or guide license</p>
                                <input
                                    className="registration-input"
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    required
                                />
                                {errors.fullName && <span className="registration-error-message">{errors.fullName}</span>}
                            </div>

                            <div className={`registration-form-group ${errors.dateOfBirth ? 'error' : ''}`}>
                                <label>Date of Birth</label>
                                <p className="registration-sub-label">This helps us confirm your age.</p>
                                <input
                                    className="registration-input"
                                    type="date"
                                    name="dateOfBirth"
                                    value={formData.dateOfBirth}
                                    onChange={handleChange}
                                    required
                                />
                                {errors.dateOfBirth && <span className="registration-error-message">{errors.dateOfBirth}</span>}
                            </div>

                            <div className={`registration-form-group ${errors.gender ? 'error' : ''}`}>
                                <label>Gender</label>
                                <p className="registration-sub-label">Choose your gender.</p>
                                <select
                                    className="registration-select"
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                                {errors.gender && <span className="registration-error-message">{errors.gender}</span>}
                            </div>

                            <div className={`registration-form-group ${errors.nationality ? 'error' : ''}`}>
                                <label>Nationality</label>
                                <p className="registration-sub-label">Type your nationality. Example: Sri Lankan.</p>
                                <input
                                    className="registration-input"
                                    type="text"
                                    name="nationality"
                                    value={formData.nationality}
                                    onChange={handleChange}
                                    placeholder="Enter your nationality"
                                    required
                                />
                                {errors.nationality && <span className="registration-error-message">{errors.nationality}</span>}
                            </div>

                            <div className={`registration-form-group ${errors.profilePhoto ? 'error' : ''}`}>
                                <label>Profile Picture</label>
                                <p className="registration-sub-label">Upload a clear photo of your face. No group photos or sunglasses, please.</p>
                                <label className="file-input-wrapper">
                                    <span className="file-input-button">Choose File</span>
                                    <input
                                        className="registration-file-input"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        required
                                    />
                                </label>
                                {errors.profilePhoto && <span className="registration-error-message">{errors.profilePhoto}</span>}
                                {formData.profilePhotoPreview && (
                                    <img
                                        src={formData.profilePhotoPreview}
                                        alt="Profile Preview"
                                        className="registration-preview-image"
                                    />
                                )}
                            </div>

                            <div className="registration-button-container">
                                <button
                                    className="registration-button registration-button-next"
                                    onClick={nextStep}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <h2>Step 2: Contact Details</h2>
                            <div className={`registration-form-group ${errors.email ? 'error' : ''}`}>
                                <label>Email</label>
                                <p className="registration-sub-label">Enter your email. We will use this to contact you.</p>
                                <input
                                    className="registration-input"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="someone@example.com"
                                    required
                                />
                                {errors.email && <span className="registration-error-message">{errors.email}</span>}
                            </div>

                            <div className={`registration-form-group ${errors.phone ? 'error' : ''}`}>
                                <label>Phone</label>
                                <p className="registration-sub-label">Please enter your mobile number. Kindly ensure that the number provided is active on WhatsApp.</p>
                                <input
                                    className="registration-input"
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="07XXXXXXXX"
                                    required
                                    pattern="07[0-9]{8}"
                                    title="Phone number must start with '07' and contain exactly 10 digits."
                                />
                                {errors.phone && <span className="registration-error-message">{errors.phone}</span>}
                            </div>

                            <div className={`registration-form-group ${errors.street ? 'error' : ''}`}>
                                <label>Address</label>
                                <p className="registration-sub-label">Type your complete address here.</p>
                                <input
                                    className="registration-input"
                                    type="text"
                                    name="street"
                                    value={formData.address.street}
                                    onChange={handleAddressChange}
                                    placeholder="Address"
                                    required
                                />
                                {errors.street && <span className="registration-error-message">{errors.street}</span>}
                            </div>

                            <div className={`registration-form-group ${errors.city ? 'error' : ''}`}>
                                <label>City</label>
                                <p className="registration-sub-label">Enter the city or town where you live.</p>
                                <input
                                    className="registration-input"
                                    type="text"
                                    name="city"
                                    value={formData.address.city}
                                    onChange={handleAddressChange}
                                    placeholder="City"
                                    required
                                />
                                {errors.city && <span className="registration-error-message">{errors.city}</span>}
                            </div>

                            <div className={`registration-form-group ${errors.province ? 'error' : ''}`}>
                                <label>Province</label>
                                <p className="registration-sub-label">Select your province from the list.</p>
                                <select
                                    className="registration-select"
                                    name="province"
                                    value={formData.address.province}
                                    onChange={handleProvinceChange}
                                    required
                                >
                                    <option value="">Select Province</option>
                                    {provinces.map((province) => (
                                        <option key={province} value={province}>{province}</option>
                                    ))}
                                </select>
                                {errors.province && <span className="registration-error-message">{errors.province}</span>}
                            </div>

                            {formData.address.province && (
                                <div className={`registration-form-group ${errors.district ? 'error' : ''}`}>
                                    <label>District</label>
                                    <p className="registration-sub-label">Select your district from the list.</p>
                                    <select
                                        className="registration-select"
                                        name="district"
                                        value={formData.address.district}
                                        onChange={handleDistrictChange}
                                        required
                                    >
                                        <option value="">Select District</option>
                                        {districts[formData.address.province].map((district) => (
                                            <option key={district} value={district}>{district}</option>
                                        ))}
                                    </select>
                                    {errors.district && <span className="registration-error-message">{errors.district}</span>}
                                </div>
                            )}

                            <div className="registration-button-container">
                                <button
                                    className="registration-button registration-button-back"
                                    onClick={prevStep}
                                >
                                    Back
                                </button>
                                <button
                                    className="registration-button registration-button-next"
                                    onClick={nextStep}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div>
                            <h2>Step 3: Guide Rank</h2>
                            <div className={`registration-form-group ${errors.guideRank ? 'error' : ''}`}>
                                <label>Guide Rank</label>
                                <p className="registration-description-header">Choose your official guide type. This should match your license.</p>
                                <p className="registration-description-subheader">Not sure which one to choose?</p>
                                <p className="registration-description-subheader">Here are the common ranks:</p>
                                <p className="registration-description-text">National Guide – Can guide across Sri Lanka</p>
                                <p className="registration-description-text">Chauffeur Guide – Drives and guides tourists</p>
                                <p className="registration-description-text">Site Guide – Works in specific locations (like a museum or historical site)</p>
                                <p className="registration-description-text" id="registration-description-text-last">Driver – Only provides driving, not guiding</p>
                                <select
                                    className="registration-select"
                                    name="guideRank"
                                    value={formData.guideRank}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Guide Rank</option>
                                    <option value="National Guide">National Guide</option>
                                    <option value="Provincial Guide">Provincial Guide</option>
                                    <option value="Chauffer Guide">Chauffer Guide</option>
                                    <option value="Driver Guide">Driver Guide</option>
                                    <option value="Site Guide">Site Guide</option>
                                    <option value="Unregistered Guide">Unregistered Guide</option>
                                </select>
                                {errors.guideRank && <span className="registration-error-message">{errors.guideRank}</span>}
                            </div>

                            <div className="registration-button-container">
                                <button
                                    className="registration-button registration-button-back"
                                    onClick={prevStep}
                                >
                                    Back
                                </button>
                                <button
                                    className="registration-button registration-button-next"
                                    onClick={nextStep}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 4 && formData.guideRank === "Unregistered Guide" && (
                        <div>
                            <h2>Step 4: Identity Verification</h2>
                            <div className={`registration-form-group ${errors.governmentID ? 'error' : ''}`}>
                                <label>NIC (National Identity Card)</label>
                                <p className="registration-sub-label">
                                    Upload a clear photo or scan of your NIC. This helps us confirm your identity.
                                </p>
                                <label className="file-input-wrapper">
                                    <span className="file-input-button">Choose ID File</span>
                                    <input
                                        className="registration-file-input"
                                        type="file"
                                        name="governmentID"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        required
                                    />
                                </label>
                                {errors.governmentID && <span className="registration-error-message">{errors.governmentID}</span>}
                                {formData.governmentIDPreview && (
                                    <img
                                        src={formData.governmentIDPreview}
                                        alt="ID Preview"
                                        className="registration-preview-image"
                                    />
                                )}
                            </div>

                            <p className="registration-description-text" id="registration-description-text-italic">
                                We need to verify your identity to keep the platform safe and trusted.
                                Your file will only be used for verification and will not be shared.
                            </p>

                            <div className="registration-button-container">
                                <button
                                    className="registration-button registration-button-back"
                                    onClick={prevStep}
                                >
                                    Back
                                </button>
                                <button
                                    className="registration-button registration-button-next"
                                    onClick={nextStep}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 4 && formData.guideRank !== "Unregistered Guide" && (
                        <div>
                            <h2>Step 4: Documents for Verification</h2>
                            {formData.guideRank === "Driver Guide" ? (
                                <div className={`registration-form-group ${errors.tourGuideLicense ? 'error' : ''}`}>
                                    <label>Driver's License</label>
                                    <p className="registration-sub-label">Upload a photo or scan of your valid driver's license. Make sure it's clear and readable.</p>
                                    <label className="file-input-wrapper">
                                        <span className="file-input-button">Choose License File</span>
                                        <input
                                            className="registration-file-input"
                                            type="file"
                                            accept="image/*"
                                            name="tourGuideLicense"
                                            onChange={handleFileUpload}
                                            required
                                        />
                                    </label>
                                    {errors.tourGuideLicense && <span className="registration-error-message">{errors.tourGuideLicense}</span>}
                                    {formData.tourGuideLicensePreview && (
                                        <img
                                            src={formData.tourGuideLicensePreview}
                                            alt="License Preview"
                                            className="registration-preview-image"
                                        />
                                    )}
                                </div>
                            ) : (
                                <div className={`registration-form-group ${errors.tourGuideLicense ? 'error' : ''}`}>
                                    <label>Tour Guide License</label>
                                    <p className="registration-sub-label">Upload a photo or scan of your valid tour guide license. Make sure it's clear and readable.</p>
                                    <label className="file-input-wrapper">
                                        <span className="file-input-button">Choose License File</span>
                                        <input
                                            className="registration-file-input"
                                            type="file"
                                            accept="image/*"
                                            name="tourGuideLicense"
                                            onChange={handleFileUpload}
                                            required
                                        />
                                    </label>
                                    {errors.tourGuideLicense && <span className="registration-error-message">{errors.tourGuideLicense}</span>}
                                    {formData.tourGuideLicensePreview && (
                                        <img
                                            src={formData.tourGuideLicensePreview}
                                            alt="License Preview"
                                            className="registration-preview-image"
                                        />
                                    )}
                                </div>
                            )}

                            <div className={`registration-form-group ${errors.governmentID ? 'error' : ''}`}>
                                <label>NIC (National Identity Card)</label>
                                <p className="registration-sub-label">Upload a clear photo or scan of your NIC or driver's license. This helps us confirm your identity.</p>
                                <label className="file-input-wrapper">
                                    <span className="file-input-button">Choose ID File</span>
                                    <input
                                        className="registration-file-input"
                                        type="file"
                                        name="governmentID"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        required
                                    />
                                </label>
                                {errors.governmentID && <span className="registration-error-message">{errors.governmentID}</span>}
                                {formData.governmentIDPreview && (
                                    <img
                                        src={formData.governmentIDPreview}
                                        alt="ID Preview"
                                        className="registration-preview-image"
                                    />
                                )}
                            </div>

                            <p className="registration-description-text" id="registration-description-text-italic">
                                We need to check your documents to keep the platform safe and trusted.
                                Your files will only be used for verification and will not be shared.
                            </p>

                            <div className="registration-button-container">
                                <button
                                    className="registration-button registration-button-back"
                                    onClick={prevStep}
                                >
                                    Back
                                </button>
                                <button
                                    className="registration-button registration-button-next"
                                    onClick={nextStep}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 5 && (
                        <div>
                            <h2>Step 5: Professional Details</h2>
                            <div className={`registration-form-group ${errors.languagesSpoken ? 'error' : ''}`}>
                                <label>Languages</label>
                                <p className="registration-sub-label">Select the languages you can guide in.</p>
                                <div className="registration-button-container">
                                    <select
                                        className="registration-select"
                                        onChange={handleLanguageSelect}
                                    >
                                        <option value="">Select Language</option>
                                        {availableLanguages.map((lang) => (
                                            <option key={lang} value={lang}>{lang}</option>
                                        ))}
                                    </select>
                                    <input
                                        className="registration-input"
                                        type="text"
                                        name="languageInput"
                                        placeholder="Type custom language"
                                        value={formData.languageInput || ''}
                                        onChange={handleLanguageInput}
                                    />
                                    <button
                                        className="registration-button registration-button-next"
                                        type="button"
                                        onClick={addLanguage}
                                    >
                                        Add
                                    </button>
                                </div>
                                {errors.languagesSpoken && <span className="registration-error-message">{errors.languagesSpoken}</span>}
                                <div className="registration-tags-container">
                                    {formData.languagesSpoken.map((language, index) => (
                                        <div key={index} className="registration-tag">
                                            {language}
                                            <button
                                                className="registration-tag-remove"
                                                onClick={() => removeLanguage(language)}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className={`registration-form-group ${errors.experienceYears ? 'error' : ''}`}>
                                <label>Years of Experience</label>
                                <p className="registration-sub-label">Enter how long you've been guiding.</p>
                                <input
                                    className="registration-input"
                                    type="number"
                                    name="experienceYears"
                                    value={formData.experienceYears}
                                    onChange={handleChange}
                                    placeholder="Years of experience"
                                    min="0"
                                    required
                                />
                                {errors.experienceYears && <span className="registration-error-message">{errors.experienceYears}</span>}
                            </div>

                            <div className={`registration-form-group ${errors.specialties ? 'error' : ''}`}>
                                <label>Specialties</label>
                                <p className="registration-sub-label">Add what kind of tours you lead.</p>
                                <div className="registration-button-container">
                                    <select
                                        className="registration-select"
                                        onChange={(e) => handleSelect(e, "specialties")}
                                    >
                                        <option value="">Select Specialty</option>
                                        {availableSpecialties.map((spec) => (
                                            <option key={spec} value={spec}>{spec}</option>
                                        ))}
                                    </select>
                                    <input
                                        className="registration-input"
                                        type="text"
                                        name="specialtyInput"
                                        placeholder="Type custom specialty"
                                        value={formData.specialtyInput || ''}
                                        onChange={handleChange}
                                    />
                                    <button
                                        className="registration-button registration-button-next"
                                        onClick={() => handleAddCustom("specialties", "specialtyInput")}
                                    >
                                        Add
                                    </button>
                                </div>
                                {errors.specialties && <span className="registration-error-message">{errors.specialties}</span>}
                                <div className="registration-tags-container">
                                    {formData.specialties.map((specialty, index) => (
                                        <div key={index} className="registration-tag">
                                            {specialty}
                                            <button
                                                className="registration-tag-remove"
                                                onClick={() => handleRemove("specialties", specialty)}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className={`registration-form-group ${errors.tourRegions ? 'error' : ''}`}>
                                <label>Tour Regions</label>
                                <p className="registration-sub-label">Select where you offer tours.</p>
                                <div className="registration-button-container">
                                    <select
                                        className="registration-select"
                                        onChange={(e) => handleSelect(e, "tourRegions")}
                                    >
                                        <option value="">Select Region</option>
                                        {availableRegions.map((region) => (
                                            <option key={region} value={region}>{region}</option>
                                        ))}
                                    </select>
                                    <input
                                        className="registration-input"
                                        type="text"
                                        name="tourRegionInput"
                                        placeholder="Type custom region"
                                        value={formData.tourRegionInput || ''}
                                        onChange={handleChange}
                                    />
                                    <button
                                        className="registration-button registration-button-next"
                                        onClick={() => handleAddCustom("tourRegions", "tourRegionInput")}
                                    >
                                        Add
                                    </button>
                                </div>
                                {errors.tourRegions && <span className="registration-error-message">{errors.tourRegions}</span>}
                                <div className="registration-tags-container">
                                    {formData.tourRegions.map((region, index) => (
                                        <div key={index} className="registration-tag">
                                            {region}
                                            <button
                                                className="registration-tag-remove"
                                                onClick={() => handleRemove("tourRegions", region)}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="registration-button-container">
                                <button
                                    className="registration-button registration-button-back"
                                    onClick={prevStep}
                                >
                                    Back
                                </button>
                                <button
                                    className="registration-button registration-button-next"
                                    onClick={nextStep}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 6 && (
                        <div>
                            <h2>Step 6: Availability, Rates & Payment Methods</h2>
                            <div className={`registration-form-group ${errors.availability ? 'error' : ''}`}>
                                <p>Set your rates clearly so travelers know what to expect.
                                    Let us know when you're available and how you'd like to be paid.
                                    You can change this info later from your profile.
                                </p>
                                <label>Availability</label>
                                <p className="registration-sub-label">Choose when you are usually free to work (example: weekdays, weekends, full-time).</p>
                                <select
                                    className="registration-select"
                                    name="availability"
                                    value={formData.availability}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Availability</option>
                                    <option value="Full-time">Full-time</option>
                                    <option value="Part-time">Part-time</option>
                                    <option value="Weekends Only">Weekends Only</option>
                                    <option value="On-Request">On-Request</option>
                                </select>
                                {errors.availability && <span className="registration-error-message">{errors.availability}</span>}
                            </div>

                            <div className={`registration-form-group ${errors.rateType ? 'error' : ''}`}>
                                <label>Pricing Option</label>
                                <p className="registration-sub-label">Choose either hourly or daily rate</p>
                                <select
                                    className="registration-select"
                                    name="rateType"
                                    value={formData.rateType}
                                    onChange={(e) => {
                                        if (e.target.value === "hourly") {
                                            setFormData(prev => ({ ...prev, dailyRate: "", rateType: "hourly" }));
                                        } else {
                                            setFormData(prev => ({ ...prev, hourlyRate: "", rateType: "daily" }));
                                        }
                                    }}
                                    required
                                >
                                    <option value="">Select Rate Type</option>
                                    <option value="hourly">Hourly Rate</option>
                                    <option value="daily">Daily Rate</option>
                                </select>
                                {errors.rateType && <span className="registration-error-message">{errors.rateType}</span>}
                            </div>

                            {formData.rateType === "hourly" && (
                                <div className={`registration-form-group ${errors.hourlyRate ? 'error' : ''}`}>
                                    <label>Hourly Rate Range</label>
                                    <p className="registration-sub-label">Enter your hourly rate range in USD (US Dollars).</p>
                                    <div className="registration-rate-input">
                                        <div className="rate-range-container">
                                            <div className="rate-input-group">
                                                <label>Minimum Rate ($)</label>
                                                <input
                                                    className="registration-input"
                                                    type="number"
                                                    name="hourlyRateMin"
                                                    placeholder="Min Rate"
                                                    value={formData.hourlyRateMin}
                                                    onChange={handleChange}
                                                    min="0"
                                                    step="0.01"
                                                    required
                                                />
                                            </div>
                                            <div className="rate-input-group">
                                                <label>Maximum Rate ($)</label>
                                                <input
                                                    className="registration-input"
                                                    type="number"
                                                    name="hourlyRateMax"
                                                    placeholder="Max Rate"
                                                    value={formData.hourlyRateMax}
                                                    onChange={handleChange}
                                                    min="0"
                                                    step="0.01"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        {errors.hourlyRate && <span className="registration-error-message">{errors.hourlyRate}</span>}
                                    </div>
                                </div>
                            )}

                            {formData.rateType === "daily" && (
                                <div className={`registration-form-group ${errors.dailyRate ? 'error' : ''}`}>
                                    <label>Daily Rate Range</label>
                                    <p className="registration-sub-label">Enter your daily rate range in USD (US Dollars).</p>
                                    <div className="registration-rate-input">
                                        <div className="rate-range-container">
                                            <div className="rate-input-group">
                                                <label>Minimum Rate ($)</label>
                                                <input
                                                    className="registration-input"
                                                    type="number"
                                                    name="dailyRateMin"
                                                    placeholder="Min Rate"
                                                    value={formData.dailyRateMin}
                                                    onChange={handleChange}
                                                    min="0"
                                                    step="0.01"
                                                    required
                                                />
                                            </div>
                                            <div className="rate-input-group">
                                                <label>Maximum Rate ($)</label>
                                                <input
                                                    className="registration-input"
                                                    type="number"
                                                    name="dailyRateMax"
                                                    placeholder="Max Rate"
                                                    value={formData.dailyRateMax}
                                                    onChange={handleChange}
                                                    min="0"
                                                    step="0.01"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        {errors.dailyRate && <span className="registration-error-message">{errors.dailyRate}</span>}
                                    </div>
                                </div>
                            )}

                            <div className={`registration-form-group ${errors.paymentMethods ? 'error' : ''}`}>
                                <label>Payment Methods</label>
                                <p className="registration-sub-label">Choose how you'd like to be paid.</p>
                                <div className="registration-button-container">
                                    <select
                                        className="registration-select"
                                        onChange={(e) => handleSelect(e, "paymentMethods")}
                                    >
                                        <option value="">Select Payment Method</option>
                                        {["Cash", "Credit Card", "PayPal", "Bank Transfer"].map((method) => (
                                            <option key={method} value={method}>{method}</option>
                                        ))}
                                    </select>
                                    <input
                                        className="registration-input"
                                        type="text"
                                        name="customPayment"
                                        placeholder="Other Payment Method"
                                        value={formData.customPayment || ''}
                                        onChange={handleChange}
                                    />
                                    <button
                                        className="registration-button registration-button-next"
                                        onClick={() => handleAddCustom("paymentMethods", "customPayment")}
                                    >
                                        Add
                                    </button>
                                </div>
                                {errors.paymentMethods && <span className="registration-error-message">{errors.paymentMethods}</span>}
                                <div className="registration-tags-container">
                                    {formData.paymentMethods.map((method, index) => (
                                        <div key={index} className="registration-tag">
                                            {method}
                                            <button
                                                className="registration-tag-remove"
                                                onClick={() => handleRemove("paymentMethods", method)}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="registration-button-container">
                                <button
                                    className="registration-button registration-button-back"
                                    onClick={prevStep}
                                >
                                    Back
                                </button>
                                <button
                                    className="registration-button registration-button-next"
                                    onClick={nextStep}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 7 && (
                        <div>
                            <h2>Final Step: Account Details</h2>
                            <div className={`registration-form-group ${errors.username ? 'error' : ''}`}>
                                <label>Username</label>
                                <input
                                    className="registration-input"
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Choose a username"
                                    required
                                />
                                {errors.username && <span className="registration-error-message">{errors.username}</span>}
                            </div>

                            <div className={`registration-form-group ${errors.password ? 'error' : ''}`}>
                                <label>Password</label>
                                <div className="password-input-wrapper">
                                    <input
                                        className="registration-input"
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Create a strong password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                                {errors.password && <span className="registration-error-message">{errors.password}</span>}
                            </div>

                            <div className={`registration-form-group ${errors.bio ? 'error' : ''}`}>
                                <label>About Me</label>
                                <textarea
                                    className="registration-textarea"
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    placeholder="Tell us a little bit about yourself"
                                    rows="4"
                                    required
                                />
                                {errors.bio && <span className="registration-error-message">{errors.bio}</span>}
                            </div>

                            <div className="registration-button-container">
                                <button
                                    className="registration-button registration-button-back"
                                    onClick={prevStep}
                                >
                                    Back
                                </button>
                                <button
                                    className="registration-button registration-button-next"
                                    onClick={nextStep}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 8 && (
                        <div>
                            <h2>Review Your Information</h2>
                            <div className="registration-review-container">
                                <div className="registration-review-section">
                                    <h3>Personal Information</h3>
                                    <div className="registration-review-grid">
                                        <div>
                                            <strong>Full Name:</strong>
                                            <p>{formData.fullName}</p>
                                        </div>
                                        <div>
                                            <strong>Date of Birth:</strong>
                                            <p>{formData.dateOfBirth}</p>
                                        </div>
                                        <div>
                                            <strong>Gender:</strong>
                                            <p>{formData.gender}</p>
                                        </div>
                                        <div>
                                            <strong>Nationality:</strong>
                                            <p>{formData.nationality}</p>
                                        </div>
                                        <div className="registration-review-grid">
                                            <div>
                                                <strong>Profile Photo:</strong>
                                                {formData.profilePhotoPreview ? (
                                                    <img
                                                        src={formData.profilePhotoPreview}
                                                        alt="Profile Photo"
                                                        className="registration-preview-image"
                                                    />
                                                ) : (
                                                    <p>No photo uploaded</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="registration-review-section">
                                    <h3>Contact Details</h3>
                                    <div className="registration-review-grid">
                                        <div>
                                            <strong>Email:</strong>
                                            <p>{formData.email}</p>
                                        </div>
                                        <div>
                                            <strong>Phone:</strong>
                                            <p>{formData.phone}</p>
                                        </div>
                                        <div>
                                            <strong>Address:</strong>
                                            <p>
                                                {formData.address.street},
                                                {formData.address.city},
                                                {formData.address.district} District,
                                                {formData.address.province} Province
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="registration-review-section">
                                    <h3>Professional Details</h3>
                                    <div className="registration-review-grid">
                                        <div>
                                            <strong>Guide Rank:</strong>
                                            <p>{formData.guideRank}</p>
                                        </div>
                                        <div>
                                            <strong>Languages:</strong>
                                            <p>{formData.languagesSpoken.join(", ")}</p>
                                        </div>
                                        <div>
                                            <strong>Years of Experience:</strong>
                                            <p>{formData.experienceYears}</p>
                                        </div>
                                        <div>
                                            <strong>Specialties:</strong>
                                            <p>{formData.specialties.join(", ")}</p>
                                        </div>
                                        <div>
                                            <strong>Tour Regions:</strong>
                                            <p>{formData.tourRegions.join(", ")}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="registration-review-section">
                                    <h3>Professional Rates</h3>
                                    <div className="registration-review-grid">
                                        <div>
                                            <strong>Availability:</strong>
                                            <p>{formData.availability}</p>
                                        </div>
                                        <div>
                                            <strong>Rate:</strong>
                                            <p>{formData.rateType === 'hourly' ? 
                                                `$${formData.hourlyRateMin}-${formData.hourlyRateMax}/hour` : 
                                                formData.rateType === 'daily' ? 
                                                `$${formData.dailyRateMin}-${formData.dailyRateMax}/day` : 
                                                "Not set"}</p>
                                        </div>
                                        <div>
                                            <strong>Payment Methods:</strong>
                                            <p>{formData.paymentMethods.join(", ")}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="registration-review-section">
                                    <h3>Verification Documents</h3>
                                    <div className="registration-review-grid">
                                        <div>
                                            <strong>Government ID:</strong>
                                            <p>{formData.governmentID ? "Uploaded" : "Not uploaded"}</p>
                                        </div>
                                        {formData.tourGuideLicense && (
                                            <div>
                                                <strong>Tour Guide License:</strong>
                                                <p>{formData.tourGuideLicense ? "Uploaded" : "Not uploaded"}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="registration-button-container">
                                <button
                                    className="registration-button registration-button-back"
                                    onClick={prevStep}
                                >
                                    Back
                                </button>
                                <button 
                                    onClick={handleSubmit} 
                                    className="registration-button registration-button-submit"
                                >
                                    Submit
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {uploading && (
                <div className="uploading-overlay">
                    <div className="uploading-spinner"></div>
                    <p>Uploading image...</p>
                </div>
            )}
            <Footer />
        </div>
    );
};

export default Register;