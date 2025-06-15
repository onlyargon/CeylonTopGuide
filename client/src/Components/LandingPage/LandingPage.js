import React, { useEffect, useRef, useState, forwardRef } from 'react';
import './LandingPage.css';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AnimatePresence, motion, wrap } from "framer-motion";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faTrophy } from '@fortawesome/free-solid-svg-icons';
import AnimatedList from '../AnimatedList/AnimatedList';
import BlurText from "../BlurText/BlurText";
import ScrollReveal from '../ScrollReveal/ScrollReveal';
import ProfileCard from '../ProfileCard/ProfileCard';
import '../ProfileCard/ProfileCard.css';

const MotionLink = motion(Link);

const LandingPage = () => {
    const carouselRef = useRef(null);
    const [topGuides, setTopGuides] = useState([]);
    const [userData, setUserData] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(1);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    useEffect(() => {
        // Check if user is logged in by fetching session data
        const checkSession = async () => {
            try {
                // Try the original API URL first
                const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/guides/session`, {
                    withCredentials: true
                });
                if (response.data.user) {
                    setUserData(response.data.user);
                }
            } catch (error) {
                console.error('Primary session check failed, trying localhost:', error);
                try {
                    // Fallback to localhost:5000
                    const localResponse = await axios.get('http://localhost:5000/guides/session', {
                        withCredentials: true
                    });
                    if (localResponse.data.user) {
                        setUserData(localResponse.data.user);
                    }
                } catch (localError) {
                    console.error('Local session check also failed:', localError);
                    setUserData(null);
                }
            }
        };

        checkSession();
    }, []);

    useEffect(() => {
        const fetchTopGuides = async () => {
            try {
                // Try the original API URL first
                const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/guides/top-rated`);
                const activeGuides = response.data.filter(guide => guide.isActive !== false);
                setTopGuides(activeGuides.slice(0, 5)); // Ensure top 5 are set
            } catch (error) {
                console.error('Primary top-rated guides fetch failed, trying localhost:', error);
                try {
                    // Fallback to localhost:5000
                    const localResponse = await axios.get('http://localhost:5000/guides/top-rated');
                    const activeGuides = localResponse.data.filter(guide => guide.isActive !== false);
                    setTopGuides(activeGuides.slice(0, 5)); // Ensure top 5 are set even on fallback
                } catch (localError) {
                    console.error('Local top-rated guides fetch also failed:', localError);
                    setTopGuides([]);
                }
            }
        };

        fetchTopGuides();
    }, []);

    // Auto-scroll for the Top Guides list
    useEffect(() => {
        let interval;
        // Check if there are guides and autoplay is enabled
        if (isAutoPlaying && topGuides.length > 0) {
            // Update the currentIndex every 5 seconds
            interval = setInterval(() => {
                // Cycle through the indices of the available guides (up to 5)
                setCurrentIndex(prev => (prev + 1) % Math.min(topGuides.length, 5));
            }, 5000); // 5000 milliseconds = 5 seconds
        }

        // Cleanup function to clear the interval
        return () => clearInterval(interval);

    }, [isAutoPlaying, topGuides.length]); // Re-run effect if isAutoPlaying or topGuides change

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

    const getFirstName = (fullName) => {
        return fullName.split(' ')[0];
    };

    const handleAnimationComplete = () => {
        console.log('Animation completed!');
    };

    return (
        <div>
            {/*<header className="bg-primaryGreen fixed top-0 left-0 w-full z-100 mb-[500px]">
                <div className="header-container flex flex-col md:flex-row justify-between items-center h-[70px] md:h-[90px] p-4 md:p-6 w-full">
                    <div className="header-logo mb-4 md:mb-0">
                        <img src='/Logo/Logo.png' alt='logo' className='logo w-24 md:w-40' />
                    </div>
                    <nav className="header-nav mb-4 md:mb-0 w-full md:w-auto text-center">
                        <ul className="nav-list flex flex-col md:flex-row gap-2 md:gap-6 justify-center">
                            <li className="nav-item"><a href="#home" className="nav-link text-sm md:text-base">Home</a></li>
                            <li className="nav-item"><a href="#find-guide" className="nav-link text-sm md:text-base">Find a guide</a></li>
                            <li className="nav-item"><a href="#about" className="nav-link text-sm md:text-base">About us</a></li>
                            <li className="nav-item"><a href="#contact" className="nav-link text-sm md:text-base">Contact</a></li>
                        </ul>
                    </nav>
                    <div className="header-auth w-full md:w-auto flex justify-center md:justify-end">
                        {userData ? (
                            <Link to="/guideProfile" className="user-name-button text-sm md:text-base">
                                {getFirstName(userData.fullName)}
                            </Link>
                        ) : (
                            <div className="auth-buttons-container flex flex-col md:flex-row gap-2 md:gap-4 w-full sm:w-auto">
                                <motion.div
                                    drag
                                    dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                                    whileTap={{ scale: 0.95 }}
                                    whileHover={{ scale: 1.05 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 80,
                                        damping: 6
                                    }}
                                >
                                    <Link to="/guideRegister" className="register-button text-sm md:text-base text-center w-full md:w-auto">Register</Link>
                                </motion.div>
                                <motion.div
                                    drag
                                    dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                                    whileTap={{ scale: 0.95 }}
                                    whileHover={{ scale: 1.05 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 80,
                                        damping: 6
                                    }}
                                >
                                    <Link to="/guideLogin" className="auth-link hover:bg-pureWhite hover:text-primaryGreen text-sm md:text-base text-center w-full md:w-auto">Login</Link>
                                </motion.div>
                            </div>
                        )}
                    </div>
                </div>
            </header>*/}
            <Header/>
            <div className="relative w-full min-h-screen bg-gradient-to-b from-primaryGreen via-primaryGreen/90 to-pureWhite/70 flex flex-col md:flex-row items-center md:items-start justify-center md:justify-between px-4 md:px-[100px] py-10 md:py-0 pt-24 md:pt-[220px] pb-10 md:pb-0" id="home">
                <div className="flex flex-col items-center md:items-start mb-8 md:mb-0 w-full md:w-1/2 text-center md:text-left">
                    <BlurText
                        text="Find the Best Guide for You"
                        delay={150}
                        animateBy="words"
                        direction="top"
                        onAnimationComplete={handleAnimationComplete}
                        className="text-2xl sm:text-3xl md:text-7xl font-bold text-pureWhite mb-2 md:mb-4"
                    />
                    <BlurText
                        text="Connecting Travelers with Sri Lanka's Best Tour Guides"
                        delay={200}
                        animateBy="words"
                        direction="top"
                        onAnimationComplete={handleAnimationComplete}
                        className="text-base sm:text-lg md:text-2xl text-pureWhite mb-6 md:mb-12 max-w-full md:max-w-2xl"
                    />
                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start w-full">
                        <motion.div
                            drag
                            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                            whileTap={{ scale: 0.95 }}
                            whileHover={{ scale: 1.05 }}
                            transition={{
                                type: "spring",
                                stiffness: 80,
                                damping: 6
                            }}
                            className="w-full sm:w-auto"
                        >
                            <Link
                                to="/guideList"
                                className="inline-block w-full text-center px-4 sm:px-6 md:px-8 py-3 md:py-4 bg-white text-pureWhite font-semibold border-2 border-pureWhite rounded-[20px] shadow-lg hover:shadow-xl hover:bg-primaryGreen hover:text-pureWhite transition-all duration-300 text-sm md:text-base"
                            >
                                Find a Guide
                            </Link>
                        </motion.div>
                        <motion.div
                            drag
                            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                            whileTap={{ scale: 0.95 }}
                            whileHover={{ scale: 1.05 }}
                            transition={{
                                type: "spring",
                                stiffness: 120,
                                damping: 6
                            }}
                            className="w-full sm:w-auto"
                        >
                            <Link
                                to="/guideRegister"
                                className="inline-block w-full text-center px-4 sm:px-6 md:px-8 py-3 md:py-4 bg-white text-pureWhite border-2 border-pureWhite font-semibold rounded-[20px] shadow-lg hover:shadow-xl hover:bg-primaryGreen hover:text-pureWhite transition-all duration-300 text-sm md:text-base"
                            >
                                Register as a Guide
                            </Link>
                        </motion.div>
                    </div>
                </div>
                <div className="flex items-center justify-center w-full md:w-1/2 mt-8 md:mt-0 relative">
                    <div className="relative w-full h-full flex items-start justify-center">
                        {/* Circles behind the image */}
                        <div className="absolute rounded-full bg-gradient-to-b from-pureWhite/70 via-primaryGreen/90 to-transparent w-[200px] sm:w-[250px] md:w-[450px] h-[200px] sm:h-[250px] md:h-[450px] top-10 md:-top-[50px] left-1/2 transform -translate-x-1/2 z-0"></div>
                        <div className="absolute rounded-full bg-pureWhite/10 w-[120px] sm:w-[150px] md:w-[300px] h-[120px] sm:h-[150px] md:h-[300px] top-32 md:top-[100px] left-10 md:-left-[50px] z-0"></div>
                        <div className="absolute rounded-full bg-pureWhite/10 w-[80px] sm:w-[100px] md:w-[200px] h-[80px] sm:h-[100px] md:h-[200px] bottom-10 md:bottom-[50px] right-10 md:right-[0px] z-0"></div>
                        {/* Window for Top Guides */}
                        <div className="absolute top-[250px] sm:top-[300px] md:top-[200px] left-1/2 transform -translate-x-1/2 md:left-[250px] w-[250px] sm:w-[300px] md:w-[500px] h-[280px] sm:h-[250px] md:h-[300px] bg-pureWhite/20 backdrop-filter backdrop-blur-lg rounded-lg shadow-xl p-3 z-20 text-center">
                            <h3 className="text-primaryGreen md:text-pureWhite text-sm sm:text-base md:text-xl font-semibold mb-1">TOP GUIDES TODAY</h3>
                            {topGuides.length > 0 ? (
                                <AnimatedList
                                    items={topGuides.slice(0, 5).map(guide => (
                                        <div key={guide._id} className="flex items-center gap-2 p-1 rounded-lg hover:bg-pureWhite/10 transition-colors duration-200">
                                            <img
                                                src={getCloudinaryUrl(guide.profilePhoto)}
                                                alt={guide.fullName}
                                                className="w-5 h-5 sm:w-6 sm:h-6 md:w-10 md:h-10 rounded-full object-cover"
                                            />
                                            <div className="flex flex-col">
                                                <p className="text-pureWhite text-xs sm:text-sm font-medium m-0 text-left">{guide.fullName}</p>
                                                <div className="flex items-center gap-1 text-xs text-pureWhite/80 justify-center">
                                                    <FontAwesomeIcon icon={faStar} className="text-champYellow" />
                                                    <span>{guide.averageRating?.toFixed(1) || "0.0"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    onItemSelect={(item, index) => console.log(`Selected guide: ${item} at index ${index}`)}
                                    showGradients={false}
                                    enableArrowNavigation={true}
                                    displayScrollbar={false}
                                    externalSelectedIndex={currentIndex}
                                />
                            ) : (
                                <p className="text-pureWhite/80 text-xs sm:text-sm md:text-base">Loading top guides...</p>
                            )}
                        </div>
                        {/* Image */}
                        <img src="/Images/Tourist.png" alt='tourist' className="w-[200px] sm:w-[250px] md:w-[600px] h-auto mt-10 md:-mt-[190px] z-10" />
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-10 md:py-16 pl-4 md:pl-[50px] bg-gradient-to-b from-pureWhite from-30% to-primaryGreen rounded-tr-[100px] sm:rounded-tr-[150px] md:rounded-tr-[250px] rounded-bl-[120px] sm:rounded-bl-[250px] md:rounded-bl-[320px] mt-[50px]">
                <section className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                    <div className="w-full md:w-1/2">
                        <h2 className="text-lg sm:text-xl md:text-4xl font-bold text-defaultBlack mb-4 text-shadow-white">Explore Sri Lanka Like Never Before</h2>
                        <h3 className="text-base sm:text-lg md:text-2xl font-semibold text-defaultBlack mb-6 text-shadow-white">Your Journey Deserves a Local Touch</h3>
                        <p className="text-defaultBlack text-xs sm:text-sm md:text-base leading-relaxed text-shadow-white">
                            Experience the heart of Sri Lanka with a guide who knows every hidden gem.
                            From ancient temples to coastal wonders, our verified guides bring authentic stories and personal insight to every trip.
                            Make your travel meaningful, not just memorable.
                        </p>
                    </div>
                    <div className="w-full md:w-1/2 flex justify-center">
                        <img src="/Slideshow/slide11.jpg" className="rounded-tr-[100px] sm:rounded-tr-[150px] md:rounded-tr-[250px]  max-w-full h-auto pr-0 md:pr-[50px]" />
                    </div>
                </section>

                <section className="flex flex-col md:flex-row-reverse items-center gap-8 md:gap-12 mt-10 md:mt-16">
                    <div className="w-full md:w-1/2">
                        <h2 className="text-xl md:text-4xl font-bold text-pureWhite mb-4">Travel Smart with Trusted Chauffeur Guides</h2>
                        <h3 className="text-lg md:text-2xl font-semibold text-pureWhite mb-6">Comfort, Safety, and Insider Knowledge</h3>
                        <p className="text-pureWhite text-sm md:text-base leading-relaxed">
                            Avoid the stress of logistics.
                            Our chauffeur guides not only get you where you need to go, they elevate your journey.
                            Enjoy personalized recommendations, cultural tips, and real-time flexibility, all while traveling in comfort and style.
                        </p>
                    </div>
                    <div className="w-full md:w-1/2 flex justify-center">
                        <img src="/Slideshow/slide12.jpg" className="rounded-bl-[110px] md:rounded-bl-[250px] shadow-lg max-w-full h-auto pl-0 md:pl-0" />
                    </div>
                </section>
            </div>

            <div className="w-full px-4 md:px-16 py-10 md:py-[200px] text-center bg-gradient-to-b from-pureWhite/70 via-primaryGreen/70 to-pureWhite/70 mt-10 md:mt-[100px]">
                <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-defaultBlack mb-6 md:mb-12">WHY CHOOSE CEYLONTOPGUIDE ?</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                    <div className="flex items-center bg-primaryGreen backdrop-filter backdrop-blur-lg rounded-lg p-3 sm:p-4 md:p-6 shadow-md hover:scale-105 transition duration-300 ease-in-out">
                        <div className="flex-grow text-left mr-4">
                            <span className="font-bold text-pureWhite text-xs sm:text-sm md:text-base">VERIFIED EXPERTS: </span><span className="text-pureWhite/80 text-xs sm:text-sm md:text-base">All tour guides are vetted and approved.</span>
                        </div>
                        <div className="flex-shrink-0 text-pureWhite w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                            </svg>
                        </div>
                    </div>

                    <div className="flex items-center bg-primaryGreen backdrop-filter backdrop-blur-lg rounded-lg p-3 sm:p-4 md:p-6 shadow-md hover:scale-105 transition duration-300 ease-in-out">
                        <div className="flex-grow text-left mr-4">
                            <span className="font-bold text-pureWhite text-xs sm:text-sm md:text-base">EASY SEARCH: </span> <span className="text-pureWhite/80 text-xs sm:text-sm md:text-base">Filter by location, language, expertise, and reviews.</span>
                        </div>
                        <div className="flex-shrink-0 text-pureWhite w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path fill="currentColor" d="M15 3l2.3 2.3-2.89 2.87 1.42 1.42L18.7 6.7 21 9V3h-6zM3 9l2.3-2.3 2.87 2.89 1.42-1.42L6.7 5.3 9 3H3v6zm6 12l-2.3-2.3 2.89-2.87-1.42-1.42L5.3 17.3 3 15v6h6zm12-6l-2.3 2.3-2.87-2.89-1.42 1.42 2.89 2.87L15 21h6v-6z" />
                                <circle cx="12" cy="12" r="3" fill="currentColor"/>
                            </svg>
                        </div>
                    </div>

                    <div className="flex items-center bg-primaryGreen backdrop-filter backdrop-blur-lg rounded-lg p-3 sm:p-4 md:p-6 shadow-md hover:scale-105 transition duration-300 ease-in-out">
                        <div className="flex-grow text-left mr-4">
                            <span className="font-bold text-pureWhite text-xs sm:text-sm md:text-base">REAL REVIEWS: </span> <span className="text-pureWhite/80 text-xs sm:text-sm md:text-base">See traveler ratings & feedback before booking.</span>
                        </div>
                        <div className="flex-shrink-0 text-pureWhite w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path fill="currentColor" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                        </div>
                    </div>

                    <div className="flex items-center bg-primaryGreen backdrop-filter backdrop-blur-lg rounded-lg p-3 sm:p-4 md:p-6 shadow-md hover:scale-105 transition duration-300 ease-in-out">
                        <div className="flex-grow text-left mr-4">
                            <span className="font-bold text-pureWhite text-xs sm:text-sm md:text-base">NO HIDDEN FEES: </span><span className="text-pureWhite/80 text-xs sm:text-sm md:text-base">Transparent connections between travelers and guides.</span>
                        </div>
                        <div className="flex-shrink-0 text-pureWhite w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16 text-center md:mt-[100px] md:mb-[100px]" id="find-guide">
                <h1 className="text-3xl md:text-4xl font-bold text-primaryGreen mb-14">FIND A SUITABLE GUIDE FOR YOU</h1>

                <div className="flex items-center justify-center gap-4 relative">
                    <motion.button
                        initial={false}
                        animate={{ backgroundColor: `var(--hue-${currentIndex % 6 + 1})` }}
                        aria-label="Previous"
                        className="w-12 h-12 rounded-full flex items-center justify-center z-10 bg-primaryGreen shadow-lg hover:bg-darkGreen transition-colors duration-300"
                        onClick={() => {
                            setIsAutoPlaying(false);
                            setCurrentIndex(prev => (prev - 1 + topGuides.length) % topGuides.length);
                            setDirection(-1);
                        }}
                        whileFocus={{ outline: `2px solid var(--hue-${currentIndex % 6 + 1})` }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3d9692" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m12 19-7-7 7-7" />
                            <path d="M19 12H5" />
                        </svg>
                    </motion.button>

                    <div className="overflow-hidden w-full max-w-4xl mx-auto h-[400px]">
                        <AnimatePresence initial={false} custom={direction}>
                            <motion.div
                                key={currentIndex}
                                custom={direction}
                                initial={{ opacity: 0, x: direction > 0 ? 300 : -300 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: direction > 0 ? -300 : 300 }}
                                transition={{ duration: 0.5 }}
                                className="flex justify-center gap-6 px-4 absolute inset-0"
                            >
                                {[...Array(3)].map((_, i) => {
                                    const guideIndex = (currentIndex + i) % topGuides.length;
                                    const guide = topGuides[guideIndex];
                                    if (!guide) return null;

                                    return (
                                        <MotionLink
                                            to={`/guides/${guide._id}`}
                                            key={`${guide._id}-${i}`}
                                            className="snap-center flex-shrink-0"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.1 }}
                                            onHoverStart={() => setIsAutoPlaying(false)}
                                            onHoverEnd={() => setIsAutoPlaying(true)}
                                        >
                                            <ProfileCard
                                                name={guide.fullName}
                                                title={`${guide.averageRating?.toFixed(1) || "0.0"} ★`}
                                                handle={`@${guide.fullName.toLowerCase().replace(/\s+/g, '')}`}
                                                status="Available"
                                                contactText="View Profile"
                                                avatarUrl={getCloudinaryUrl(guide.profilePhoto)}
                                                showUserInfo={true}
                                                enableTilt={true}
                                                onContactClick={() => {}}
                                                guideIndex={guideIndex}
                                                className="rounded-[26px]"
                                            />
                                        </MotionLink>
                                    );
                                })}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <motion.button
                        initial={false}
                        animate={{ backgroundColor: `var(--hue-${currentIndex % 6 + 1})` }}
                        aria-label="Next"
                        className="w-12 h-12 rounded-full flex items-center justify-center z-10 bg-primaryGreen shadow-lg hover:bg-darkGreen transition-colors duration-300"
                        onClick={() => {
                            setIsAutoPlaying(false);
                            setCurrentIndex(prev => (prev + 1) % topGuides.length);
                            setDirection(1);
                        }}
                        whileFocus={{ outline: `2px solid var(--hue-${currentIndex % 6 + 1})` }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3d9692" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                        </svg>
                    </motion.button>
                </div>

                <motion.div
                    className="mt-8 flex justify-center"
                    drag
                    dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.05 }}
                    transition={{
                        type: "spring",
                        stiffness: 80,
                        damping: 6
                    }}
                >
                    <Link 
                        to="/guideList" 
                        className="inline-block px-8 py-4 bg-primaryGreen text-pureWhite font-semibold rounded-[15px] shadow-lg hover:bg-darkGreen transition-colors duration-300 md:mt-10"
                    >
                        FIND A GUIDE
                    </Link>
                </motion.div>
            </div>

            <div className="px-4 md:mx-16 flex justify-center items-center py-10 md:py-20 bg-gradient-to-b from-pureWhite/80 via-primaryGreen/50 to-pureWhite/80 rounded-3xl my-8 md:my-16" id="register">
                <div className="w-full max-w-5xl bg-pureWhite/80 rounded-2xl shadow-xl p-4 sm:p-6 md:p-10 flex flex-col items-center">
                    <h1 className="text-xl sm:text-xl md:text-3xl font-bold text-primaryGreen mb-6 md:mb-10 text-center">REGISTER AS A TOUR GUIDE</h1>
                    <Link to="/guideRegister" className="w-full flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 mb-6 md:mb-10">
                        <div className="w-full md:flex-1 flex flex-col items-center bg-primaryGreen/90 rounded-xl p-3 sm:p-4 md:p-6 shadow-lg hover:scale-105 transition-transform duration-300 h-[220px] sm:h-[240px] md:h-[260px]">
                            <div className="mb-1 sm:mb-2 md:mb-3 text-pureWhite">
                                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="36" height="36" className="sm:w-40 sm:h-40 md:w-14 md:h-14">
                                    <path fill="currentColor" d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                </svg>
                            </div>
                            <h3 className="text-sm sm:text-sm md:text-base font-semibold text-pureWhite">STEP 1:</h3>
                            <h2 className="text-base sm:text-base md:text-lg font-bold text-pureWhite mb-1 md:mb-2 text-center">CREATE YOUR PROFILE</h2>
                            <p className="text-pureWhite/90 text-center text-xs sm:text-xs md:text-sm">
                                Enter your basic details and upload<br />a profile photo.
                            </p>
                        </div>
                        <div className="w-full md:flex-1 flex flex-col items-center bg-primaryGreen/90 rounded-xl p-3 sm:p-4 md:p-6 shadow-lg hover:scale-105 transition-transform duration-300 h-[220px] sm:h-[240px] md:h-[260px]">
                            <div className="mb-1 sm:mb-2 md:mb-3 text-pureWhite">
                                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="36" height="36" className="sm:w-40 sm:h-40 md:w-14 md:h-14">
                                    <path fill="currentColor" d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                                </svg>
                            </div>
                            <h3 className="text-sm sm:text-sm md:text-base font-semibold text-pureWhite">STEP 2:</h3>
                            <h2 className="text-base sm:text-base md:text-lg font-bold text-pureWhite mb-1 md:mb-2 text-center">ADD YOUR CREDENTIALS</h2>
                            <p className="text-pureWhite/90 text-center text-xs sm:text-xs md:text-sm">
                                Share your guide license,<br />expertise, languages,<br />and tour types.
                            </p>
                        </div>
                        <div className="w-full md:flex-1 flex flex-col items-center bg-primaryGreen/90 rounded-xl p-3 sm:p-4 md:p-6 shadow-lg hover:scale-105 transition-transform duration-300 h-[220px] sm:h-[240px] md:h-[260px]">
                            <div className="mb-1 sm:mb-2 md:mb-3 text-pureWhite">
                                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="36" height="36" className="sm:w-40 sm:h-40 md:w-14 md:h-14">
                                    <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                </svg>
                            </div>
                            <h3 className="text-sm sm:text-sm md:text-base font-semibold text-pureWhite">STEP 3:</h3>
                            <h2 className="text-base sm:text-base md:text-lg font-bold text-pureWhite mb-1 md:mb-2 text-center">GET VERIFIED & GO LIVE</h2>
                            <p className="text-pureWhite/90 text-center text-xs sm:text-xs md:text-sm">
                                Once approved, your profile<br />becomes searchable to<br />travelers worldwide.
                            </p>
                        </div>
                    </Link>
                    <motion.div
                        className="mt-4 md:mt-6"
                        drag
                        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.05 }}
                        transition={{
                            type: "spring",
                            stiffness: 80,
                            damping: 6
                        }}
                    >
                        <Link to="/guideRegister" className="inline-block px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 bg-primaryGreen text-pureWhite font-semibold rounded-[15px] shadow-lg hover:bg-darkGreen transition-colors duration-300 text-sm md:text-base">
                            REGISTER NOW
                        </Link>
                    </motion.div>
                </div>
            </div>

            <div className="about-us-container px-4 md:px-16 py-10 md:py-20" id="about">
                <h1 className="about-us-title text-xl sm:text-2xl md:text-4xl font-bold text-defaultBlack mb-6 md:mb-10 text-center">ABOUT US</h1>
                <div className="about-us-content flex flex-col md:flex-row items-center gap-6 sm:gap-8">
                    <div className="about-us-text w-full md:w-1/2">
                        <h2 className="about-us-heading text-lg sm:text-xl md:text-3xl font-bold text-defaultBlack mb-3 sm:mb-4">We Connect the Best Guides with Curious Travelers.</h2>
                        <p className="about-us-paragraph text-xs sm:text-sm md:text-base text-defaultBlack mb-3 sm:mb-4">
                            At CeylonTopGuide, we're not just building a platform, we're opening a door that connects curious travelers with the local voices who know Sri Lanka best.
                        </p>
                        <p className="about-us-paragraph text-xs sm:text-sm md:text-base text-defaultBlack mb-3 sm:mb-4">
                            Our mission is simple; make finding experienced, passionate local guides straightforward and reliable. We bring Sri Lanka's professional tour guides together on one trusted platform, each verified to help travelers confidently choose who will lead their journey.
                        </p>
                        <p className="about-us-paragraph text-xs sm:text-sm md:text-base text-defaultBlack mb-3 sm:mb-4">
                            Behind each profile is someone who knows Sri Lanka deeply and personally; its hidden corners, untold stories, and local secrets.
                        </p>
                        <p className="about-us-paragraph text-xs sm:text-sm md:text-base text-defaultBlack">
                            Welcome to our community. We're glad you're here.
                        </p>
                    </div>
                    <div className="about-us-image-container w-full md:w-1/2 flex justify-center">
                        <img src="/Logo/LogoBlack.png" alt="Logo BLACK" className='about-us-image w-24 sm:w-40 md:w-80 md:ml-[50px] md:mt-[-50px]' />
                    </div>
                </div>
            </div>
            <div className="about-us-container px-4 md:px-16 py-10 md:py-20" id="contact">
                <Footer />
            </div>
        </div>
    );
};

export default LandingPage;