import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import './GuideRegister.css'
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import axios from "axios";

const Register = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [errors, setErrors] = useState({});
    const [currentSlide, setCurrentSlide] = useState(0);
    const [uploading, setUploading] = useState(false);
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
    });

    // Cloudinary upload function
    const uploadToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'guide_photos'); // Add your preset name here
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
    const availableRegions = ["Colombo", "Kandy", "Ella", "Galle", "Sigiriya", "Nuwara Eliya"];

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
                [inputField]: "", // Clear input after adding
            });
        }
    };

    const handleRemove = (field, item) => {
        setFormData({ ...formData, [field]: formData[field].filter((i) => i !== item) });
    };


    // Handle input changes
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



    const nextStep = () => {
        window.scrollTo(0, 0);
        if (step === 3 && formData.guideRank === "Unregistered Guide") {
            setStep(step + 2);
        } else {
            setStep(step + 1);
        }
    };


    const prevStep = () => {
        window.scrollTo(0, 0);
        if (step === 5 && formData.guideRank === "Unregistered Guide") {
            setStep(step - 2);
        } else {
            setStep(step - 1);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));

        if (name === "phone") {
            if (!/^07[0-9]{8}$/.test(value)) {
                setErrors((prev) => ({ ...prev, phone: "Phone must start with 07 and be 10 digits." }));
            } else {
                setErrors((prev) => {
                    const updated = { ...prev };
                    delete updated.phone;
                    return updated;
                });
            }
        }

        if (name === "password") {
            if (value.length < 8) {
                setErrors((prev) => ({ ...prev, password: "Password must be at least 8 characters long." }));
            } else if (!/[a-zA-Z]/.test(value) || !/[0-9]/.test(value)) {
                setErrors((prev) => ({ ...prev, password: "Password must contain both letters and numbers." }));
            } else {
                setErrors((prev) => {
                    const updated = { ...prev };
                    delete updated.password;
                    return updated;
                });
            }
        }
    };



    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation function
        const validateFields = () => {
            const requiredFields = [
                { field: formData.fullName, message: "Full Name is required" },
                { field: formData.dateOfBirth, message: "Date of Birth is required" },
                { field: formData.gender, message: "Gender is required" },
                { field: formData.nationality, message: "Nationality is required" },
                { field: formData.profilePhoto, message: "Profile Photo is required" },
                { field: formData.email, message: "Email is required" },
                { field: formData.phone, message: "Phone is required" },
                { field: formData.address.street, message: "Street address is required" },
                { field: formData.address.city, message: "City is required" },
                { field: formData.address.province, message: "Province is required" },
                { field: formData.address.district, message: "District is required" },
                { field: formData.guideRank, message: "Guide Rank is required" },
                { field: formData.languagesSpoken.length > 0, message: "At least one language is required" },
                { field: formData.experienceYears, message: "Years of experience is required" },
                { field: formData.specialties.length > 0, message: "At least one specialty is required" },
                { field: formData.tourRegions.length > 0, message: "At least one tour region is required" },
                { field: formData.availability, message: "Availability is required" },
                { field: formData.rateType, message: "Please select either hourly or daily rate" },
                {
                    field: formData.rateType === "hourly" ? formData.hourlyRate : formData.dailyRate,
                    message: formData.rateType === "hourly" ? "Hourly Rate is required" : "Daily Rate is required"
                },
                { field: formData.paymentMethods.length > 0, message: "At least one payment method is required" },
                { field: formData.username, message: "Username is required" },
                { field: formData.password, message: "Password is required" },
                { field: formData.bio, message: "About Me is required" }
            ];

            // Only check documents if not an unregistered guide
            if (formData.guideRank !== "Unregistered Guide") {
                requiredFields.push(
                    { field: formData.tourGuideLicense, message: "Tour Guide License is required" },
                    { field: formData.governmentID, message: "Government ID is required" }
                );
            }

            // Check all required fields
            for (const { field, message } of requiredFields) {
                if (!field && field !== 0) { // Allow 0 for experienceYears
                    alert(message);
                    return false;
                }
            }

            // Additional validation for phone number
            if (!/^07[0-9]{8}$/.test(formData.phone)) {
                alert("Phone must start with 07 and be 10 digits.");
                return false;
            }

            // Password validation
            if (formData.password.length < 8) {
                alert("Password must be at least 8 characters long.");
                return false;
            }
            if (!/[a-zA-Z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
                alert("Password must contain both letters and numbers.");
                return false;
            }

            return true;
        };
        // Run validation
        if (!validateFields()) {
            return; // Stop submission if validation fails
        }

        // Proceed with form submission if validation passes
        console.log("Before Submitting:", formData);

        const formDataToSend = new FormData();

        formDataToSend.append("fullName", formData.fullName);
        formDataToSend.append("dateOfBirth", formData.dateOfBirth);
        formDataToSend.append("gender", formData.gender);
        formDataToSend.append("nationality", formData.nationality);
        formDataToSend.append("email", formData.email);
        formDataToSend.append("phone", formData.phone);
        formDataToSend.append("address", JSON.stringify(formData.address));
        formDataToSend.append("guideRank", formData.guideRank);
        formDataToSend.append("languagesSpoken", JSON.stringify(formData.languagesSpoken));
        formDataToSend.append("experienceYears", formData.experienceYears);
        formDataToSend.append("specialties", JSON.stringify(formData.specialties));
        formDataToSend.append("tourRegions", JSON.stringify(formData.tourRegions));
        formDataToSend.append("availability", formData.availability);
        formDataToSend.append("hourlyRate", formData.hourlyRate);
        formDataToSend.append("dailyRate", formData.dailyRate);
        formDataToSend.append("paymentMethods", JSON.stringify(formData.paymentMethods));
        formDataToSend.append("username", formData.username);
        formDataToSend.append("password", formData.password);
        formDataToSend.append("bio", formData.bio);


        // Append files (if they exist)
        if (formData.profilePhoto) {
            formDataToSend.append("profilePhoto", formData.profilePhoto);
        }
        if (formData.governmentID) {
            formDataToSend.append("governmentID", formData.governmentID);
        }
        if (formData.tourGuideLicense) {
            formDataToSend.append("tourGuideLicense", formData.tourGuideLicense);
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/guides/register`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    // Cloudinary URLs are already in the formData
                    profilePhoto: formData.profilePhoto,
                    governmentID: formData.governmentID,
                    tourGuideLicense: formData.tourGuideLicense,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to register");
            }

            console.log("Registration successful:", data);
            alert("Registration successful!");
            navigate("/registration-confirmation");
        } catch (error) {
            console.error("Error submitting form:", error.message);
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
                    backgroundImage: `url(/Slideshow/${slides[currentSlide]})`,
                    transition: 'background-image 3s ease-in-out',
                }}
            >
                <div className="registration-container">
                    {step === 1 && (
                        <div>
                            <h2>Step 1: Personal Information</h2>
                            <div className="registration-form-group">
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
                            </div>

                            <div className="registration-form-group">
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
                            </div>

                            <div className="registration-form-group">
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
                            </div>

                            <div className="registration-form-group">
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
                            </div>

                            <div className="registration-form-group">
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
                            <div className="registration-form-group">
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
                            </div>

                            <div className="registration-form-group">
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
                                {errors.phone && <p style={{ color: "red", fontSize: "0.9em" }}>{errors.phone}</p>}

                            </div>

                            <div className="registration-form-group">
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
                            </div>

                            <div className="registration-form-group">
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
                            </div>

                            <div className="registration-form-group">
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
                            </div>

                            {formData.address.province && (
                                <div className="registration-form-group">
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
                            <div className="registration-form-group">
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


                    {step === 4 && formData.guideRank !== "Unregistered Guide" && (
                        <div>
                            <h2>Step 4: Documents for Verification</h2>

                            <div className="registration-form-group">
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
                                    />
                                </label>
                                {formData.tourGuideLicensePreview && (
                                    <img
                                        src={formData.tourGuideLicensePreview}
                                        alt="License Preview"
                                        className="registration-preview-image"
                                    />
                                )}
                            </div>

                            <div className="registration-form-group">
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
                                    />
                                </label>
                                {formData.governmentIDPreview && (
                                    <img
                                        src={formData.governmentIDPreview}
                                        alt="ID Preview"
                                        className="registration-preview-image"
                                    />
                                )}
                            </div>

                            <p className="registration-description-text" id="registration-description-text-italic">We need to check your documents to keep the platform safe and trusted.
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
                            <div className="registration-form-group">
                                <label>Languages</label>
                                <p className="registration-sub-label">Choose when you are usually free to work (example: weekdays, weekends, full-time).
                                </p>
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

                            <div className="registration-form-group">
                                <label>Years of Experience</label>
                                <p className="registration-sub-label">Enter how long you’ve been guiding.</p>
                                <input
                                    className="registration-input"
                                    type="number"
                                    name="experienceYears"
                                    value={formData.experienceYears}
                                    onChange={handleChange}
                                    placeholder="Years of experience"
                                    required
                                />
                            </div>

                            <div className="registration-form-group">
                                <label>Specialties</label>
                                <p className="registration-sub-label">Add what kind of tours you lead.
                                </p>
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

                            <div className="registration-form-group">
                                <label>Tour Regions</label>
                                <p className="registration-sub-label">Select where you offer tours.
                                </p>
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
                            <div className="registration-form-group">
                                <p>Set your rates clearly so travelers know what to expect.
                                    Let us know when you're available and how you'd like to be paid.
                                    You can change this info later from your profile.
                                </p>
                                <label>Availability</label>
                                <p className="registration-sub-label">Choose when you are usually free to work (example: weekdays, weekends, full-time).
                                </p>
                                <select
                                    className="registration-select"
                                    name="availability"
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Availability</option>
                                    <option value="Full-time">Full-time</option>
                                    <option value="Part-time">Part-time</option>
                                    <option value="Weekends Only">Weekends Only</option>
                                    <option value="On-Request">On-Request</option>
                                </select>
                            </div>

                            <div className="registration-form-group">
                                <label>Pricing Option</label>
                                <p className="registration-sub-label">Choose either hourly or daily rate</p>
                                <select
                                    className="registration-select"
                                    name="rateType"
                                    onChange={(e) => {
                                        // Clear the other rate when switching types
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
                            </div>

                            {formData.rateType === "hourly" && (
                                <div className="registration-form-group">
                                    <label>Hourly Rate</label>
                                    <p className="registration-sub-label">Enter how much you charge per hour. Use USD (US Dollars).
                                    </p>
                                    <input
                                        className="registration-input"
                                        type="number"
                                        name="hourlyRate"
                                        placeholder="Hourly Rate ($)"
                                        value={formData.hourlyRate}
                                        onChange={handleChange}
                                        required={formData.rateType === "hourly"}
                                    />
                                </div>
                            )}

                            {formData.rateType === "daily" && (
                                <div className="registration-form-group">
                                    <label>Daily Rate</label>
                                    <p className="registration-sub-label">Enter how much you charge per day. Use USD (US Dollars).
                                    </p>
                                    <input
                                        className="registration-input"
                                        type="number"
                                        name="dailyRate"
                                        placeholder="Daily Rate ($)"
                                        value={formData.dailyRate}
                                        onChange={handleChange}
                                        required={formData.rateType === "daily"}
                                    />
                                </div>
                            )}

                            {/* Rest of the payment methods section remains the same */}
                            <div className="registration-form-group">
                                <label>Payment Methods</label>
                                <p className="registration-sub-label">Choose how you'd like to be paid.
                                </p>
                                <div className="registration-button-container">
                                    <select
                                        className="registration-select"
                                        onChange={(e) => handleSelect(e, "paymentMethods")}
                                        required
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
                                        onChange={handleChange}
                                    />
                                    <button
                                        className="registration-button registration-button-next"
                                        onClick={() => handleAddCustom("paymentMethods", "customPayment")}
                                    >
                                        Add
                                    </button>
                                </div>

                                <div className="registration-tags-container">
                                    {formData.paymentMethods.map((method, index) => (
                                        <div key={index} className="registration-tag">
                                            {method}
                                            <button
                                                className="registration-tag-remove"
                                                onClick={() => handleRemove("paymentMethods", method)}
                                                required
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
                            <div className="registration-form-group">
                                <label>Username</label>
                                <input
                                    className="registration-input"
                                    type="text"
                                    name="username"
                                    placeholder="Choose a username"
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="registration-form-group">
                                <label>Password</label>
                                <input
                                    className="registration-input"
                                    type="password"
                                    name="password"
                                    placeholder="Create a strong password"
                                    onChange={handleChange}
                                    required
                                />
                                {errors.password && (
                                    <p style={{ color: "red", fontSize: "0.9em" }}>
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            <div className="registration-form-group">
                                <label>About Me</label>
                                <input
                                    className="registration-input"
                                    type="text"
                                    name="bio"
                                    placeholder="Let us a little bit about yourself"
                                    onChange={handleChange}
                                    required
                                />
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
                                            <strong>Hourly Rate:</strong>
                                            <p>${formData.hourlyRate}</p>
                                        </div>
                                        <div>
                                            <strong>Daily Rate:</strong>
                                            <p>${formData.dailyRate}</p>
                                        </div>
                                        <div>
                                            <strong>Payment Methods:</strong>
                                            <p>{formData.paymentMethods.join(", ")}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="registration-review-section">
                                    <h3>Documents</h3>
                                    <div className="registration-review-grid">
                                        <div>
                                            <strong>Tour Guide License:</strong>
                                            {formData.tourGuideLicensePreview ? (
                                                <img
                                                    src={formData.tourGuideLicensePreview}
                                                    alt="Tour Guide License"
                                                    className="registration-preview-image"
                                                />
                                            ) : (
                                                <p>No license uploaded</p>
                                            )}
                                        </div>
                                        <div>
                                            <strong>Government ID:</strong>
                                            {formData.governmentIDPreview ? (
                                                <img
                                                    src={formData.governmentIDPreview}
                                                    alt="Government ID"
                                                    className="registration-preview-image"
                                                />
                                            ) : (
                                                <p>No ID uploaded</p>
                                            )}
                                        </div>
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
                                <button onClick={handleSubmit} className="registration-button registration-button-submit">Submit</button>
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