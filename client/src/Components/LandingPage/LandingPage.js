
import React, { useEffect, useRef, useState } from 'react';
import './LandingPage.css';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import { Link } from 'react-router-dom';
import axios from 'axios';


const LandingPage = () => {
    const carouselRef = useRef(null);
    const [topGuides, setTopGuides] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);

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
        const interval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % slides.length);
        }, 10000); // 10 seconds

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_BASE_URL}/guides/top-rated`)
          .then(res => {
            // Filter for active guides (double check)
            const activeGuides = res.data.filter(guide => guide.isActive !== false);
            // Take only first 5 guides
            setTopGuides(activeGuides.slice(0, 5));
          })
          .catch(err => console.error("Failed to fetch top guides:", err));
      }, []);

    const scrollLeft = () => {
        if (carouselRef.current) {
            carouselRef.current.scrollBy({ left: -300, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (carouselRef.current) {
            carouselRef.current.scrollBy({ left: 300, behavior: 'smooth' });
        }
    };

    const getCloudinaryUrl = (imagePath) => {
        if (!imagePath) return '/default-profile.png';
    
        // If it's already a full URL, return it directly
        if (imagePath.startsWith('http')) {
          return imagePath;
        }
    
        // If it's just the public ID (without the full URL)
        return `https://res.cloudinary.com/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/${imagePath}`;
      };

    return (
        <div>
            <header className="site-header">
                <div className="header-container">
                    <div className="header-logo">
                        <img src='/Logo/Logo.png' alt='logo' className='logo' />
                    </div>

                    <nav className="header-nav">
                        <ul className="nav-list">
                            <li className="nav-item"><a href="#home" className="nav-link">Home</a></li>
                            <li className="nav-item"><a href="#find-guide" className="nav-link">Find a guide</a></li>
                            <li className="nav-item"><a href="#register" className="nav-link">Register as a guide</a></li>
                            <li className="nav-item"><a href="#about" className="nav-link">About us</a></li>
                            <li className="nav-item"><a href="#contact" className="nav-link">Contact</a></li>
                        </ul>
                    </nav>

                    <div className="header-auth">
                        <Link to="/guideLogin" className="auth-link">Login / Sign-up</Link>
                    </div>
                </div>
            </header>
            <div
                className="ceylon-banner-container"
                id="home"
                style={{
                    backgroundImage: `url(/Slideshow/${slides[currentSlide]})`,
                    transition: 'background-image 3s ease-in-out',
                }}
            >

                <div className="ceylon-banner-content">
                    <h1 className="ceylon-welcome-text">Welcome to</h1>
                    <h1 className="ceylon-brand-name">CEYLON TOPGUIDE</h1>
                    <p className="ceylon-tagline">Connecting Travelers with Sri Lanka's Best Tour Guides</p>
                </div>
            </div>

            <div className="article-sections-container">
                <section className="article-section">
                    <div className="article-content">
                        <h2 className="article-heading">Explore Sri Lanka Like Never Before
                        </h2>
                        <h3 className="article-subheading">Your Journey Deserves a Local Touch</h3>
                        <p className="article-text">
                            Experience the heart of Sri Lanka with a guide who knows every hidden gem.
                            From ancient temples to coastal wonders, our verified guides bring authentic stories and personal insight to every trip.
                            Make your travel meaningful, not just memorable.
                        </p>
                    </div>
                    <div className="article-image-container">
                        <img src="/Slideshow/slide8.jpg" className="article-image placeholder-image" />
                    </div>
                </section>

                <section className="article-section reverse">
                    <div className="article-image-container">
                        <img src="/Slideshow/slide9.jpg" className="article-image placeholder-image" />
                    </div>
                    <div className="article-content">
                        <h2 className="article-heading">Travel Smart with Trusted Chauffeur Guides</h2>
                        <h3 className="article-subheading">Comfort, Safety, and Insider Knowledge</h3>
                        <p className="article-text">
                            Avoid the stress of logistics.
                            Our chauffeur guides not only get you where you need to go, they elevate your journey.
                            Enjoy personalized recommendations, cultural tips, and real-time flexibility, all while traveling in comfort and style.
                        </p>
                    </div>
                </section>
            </div>

            <div className="ceylon-features-container">
                <h1 className="ceylon-features-title">WHY CHOOSE CEYLONTOPGUIDE ?</h1>

                <div className="ceylon-feature-box">
                    <div className="ceylon-feature-text">
                        <span className="ceylon-feature-highlight">VERIFIED EXPERTS</span> - All tour guides are vetted and approved.
                    </div>
                    <div className="ceylon-feature-icon ceylon-verified-icon">
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                        </svg>
                    </div>
                </div>

                <div className="ceylon-feature-box">
                    <div className="ceylon-feature-text">
                        <span className="ceylon-feature-highlight">EASY SEARCH</span> - Filter by location, language, expertise, and reviews.
                    </div>
                    <div className="ceylon-feature-icon ceylon-search-icon">
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 3l2.3 2.3-2.89 2.87 1.42 1.42L18.7 6.7 21 9V3h-6zM3 9l2.3-2.3 2.87 2.89 1.42-1.42L6.7 5.3 9 3H3v6zm6 12l-2.3-2.3 2.89-2.87-1.42-1.42L5.3 17.3 3 15v6h6zm12-6l-2.3 2.3-2.87-2.89-1.42 1.42 2.89 2.87L15 21h6v-6z" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                    </div>
                </div>

                <div className="ceylon-feature-box">
                    <div className="ceylon-feature-text">
                        <span className="ceylon-feature-highlight">REAL REVIEWS</span> - See traveler ratings & feedback before booking.
                    </div>
                    <div className="ceylon-feature-icon ceylon-reviews-icon">
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                    </div>
                </div>

                <div className="ceylon-feature-box">
                    <div className="ceylon-feature-text">
                        <span className="ceylon-feature-highlight">NO HIDDEN FEES</span> - Transparent connections between travelers and guides.
                    </div>
                    <div className="ceylon-feature-icon ceylon-fees-icon">
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-11h2v7h-2zm0-3h2v2h-2z" />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="carousel-container" id="find-guide">
            <h1 className="tour-guide-heading">FIND A SUITABLE GUIDE FOR YOU</h1>
                <div className="find-guide-carousel" ref={carouselRef}>
                    {topGuides.map((guide, index) => (
                        <div className="guide-card" key={index}>
                            <div className="guide-image">
                                <img
                                    src={getCloudinaryUrl(guide.profilePhoto)}
                                    alt={guide.fullName}
                                    onError={(e) => {
                                      e.target.onerror = null; // Prevent infinite loop if default image fails
                                      e.target.src = '/default-profile.png';
                                    }}
                                    className='guide-photo'
                                />
                            </div>
                            <div className="guide-overlay">
                                <div className="guide-label">RANK #{index + 1}</div>
                                <div className="guide-name">{guide.fullName}</div>
                                <div className="guide-rating">⭐ {guide.averageRating?.toFixed(1) || "0.0"}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <button className="find-guide-nav-button left" onClick={scrollLeft}>
                    &lt;
                </button>
                <button className="find-guide-nav-button right" onClick={scrollRight}>
                    &gt;
                </button>

                <div className="find-guide-button-container">
                    <Link to="/guideList">
                        <button className="find-guide-button">FIND A GUIDE</button>
                    </Link>
                </div>
            </div>

            <div className="tour-guide-container" id="register">
                <div className="tour-guide-registration">
                    <h1 className="tour-guide-heading">REGISTER AS A TOUR GUIDE</h1>

                    <div className="tour-guide-steps">
                        <div className="tour-guide-step">
                            <div className="step-icon">
                                <img src='/Icons/add-user.png' alt='document' className='guide-icons' />
                            </div>
                            <h3 className="step-title">STEP 1:</h3>
                            <h2 className="step-subtitle">CREATE YOUR PROFILE</h2>
                            <p className="step-description">
                                Enter your basic details and upload
                                <br />a profile photo.
                            </p>
                        </div>

                        <div className="tour-guide-step">
                            <div className="step-icon">
                                <img src='/Icons/document.png' alt='document' className='guide-icons' />
                            </div>
                            <h3 className="step-title">STEP 2:</h3>
                            <h2 className="step-subtitle">ADD YOUR CREDENTIALS</h2>
                            <p className="step-description">
                                Share your guide license,
                                <br />expertise, languages,
                                <br />and tour types.
                            </p>
                        </div>

                        <div className="tour-guide-step">
                            <div className="step-icon">
                                <img src='/Icons/complete.png' alt='document' className='guide-icons' />
                            </div>
                            <h3 className="step-title">STEP 3:</h3>
                            <h2 className="step-subtitle">GET VERIFIED & GO LIVE</h2>
                            <p className="step-description">
                                Once approved, your profile
                                <br />becomes searchable to
                                <br />travelers worldwide.
                            </p>
                        </div>
                    </div>
                </div>

                <Link to="/guideRegister">
                    <button className="tour-guide-button">REGISTER NOW</button>
                </Link>
            </div>

            <div className="about-us-container" id="about">
                <h1 className="about-us-title">ABOUT US</h1>

                <div className="about-us-content">
                    <div className="about-us-text">
                        <h2 className="about-us-heading">We Connect the Best Guides with Curious Travelers.</h2>

                        <p className="about-us-paragraph">
                            At CeylonTopGuide, we’re not just building a
                            platform, we’re opening a door that connects curious
                            travelers with the local voices who know Sri Lanka best.
                        </p>

                        <p className="about-us-paragraph">
                            Our mission is simple; make finding experienced, passionate local guides straightforward and reliable.
                            We bring Sri Lanka’s professional tour guides together on one trusted platform, each verified to help travelers confidently choose who will lead their journey.
                        </p>

                        <p className="about-us-paragraph">
                            Behind each profile is someone who knows Sri Lanka deeply and personally; its hidden corners, untold stories, and local secrets.
                        </p>

                        <p className="about-us-paragraph">
                            Welcome to our community. We’re glad you're here.
                        </p>
                    </div>

                    <div className="about-us-image-container">
                        <img src="/Logo/LogoBlack.png" alt="Logo BLACK" className='about-us-image' />
                    </div>
                </div>
            </div>
            <div className="about-us-container" id="contact">
            <Footer />
            </div>
        </div>
    );
};

export default LandingPage;