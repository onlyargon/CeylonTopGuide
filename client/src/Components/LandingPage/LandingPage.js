import React, { useEffect, useRef, useState, forwardRef } from 'react';
import './LandingPage.css';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AnimatePresence, motion, wrap } from "framer-motion";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faTrophy, faSearch, faRoad, faUser } from '@fortawesome/free-solid-svg-icons';
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
                    <div className="mb-4 header-logo md:mb-0">
                        <img src='/Logo/Logo.png' alt='logo' className='w-24 logo md:w-40' />
                    </div>
                    <nav className="mb-4 w-full text-center header-nav md:mb-0 md:w-auto">
                        <ul className="flex flex-col gap-2 justify-center nav-list md:flex-row md:gap-6">
                            <li className="nav-item"><a href="#home" className="text-sm nav-link md:text-base">Home</a></li>
                            <li className="nav-item"><a href="#find-guide" className="text-sm nav-link md:text-base">Find a guide</a></li>
                            <li className="nav-item"><a href="#about" className="text-sm nav-link md:text-base">About us</a></li>
                            <li className="nav-item"><a href="#contact" className="text-sm nav-link md:text-base">Contact</a></li>
                        </ul>
                    </nav>
                    <div className="flex justify-center w-full header-auth md:w-auto md:justify-end">
                        {userData ? (
                            <Link to="/guideProfile" className="text-sm user-name-button md:text-base">
                                {getFirstName(userData.fullName)}
                            </Link>
                        ) : (
                            <div className="flex flex-col gap-2 w-full auth-buttons-container md:flex-row md:gap-4 sm:w-auto">
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
                                    <Link to="/guideRegister" className="w-full text-sm text-center register-button md:text-base md:w-auto">Register</Link>
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
                                    <Link to="/guideLogin" className="w-full text-sm text-center auth-link hover:bg-pureWhite hover:text-primaryGreen md:text-base md:w-auto">Login</Link>
                                </motion.div>
                            </div>
                        )}
                    </div>
                </div>
            </header>*/}
            <Header />
            <div className="relative w-full min-h-screen bg-gradient-to-b from-primaryGreen via-primaryGreen/90 to-pureWhite/70 flex flex-col md:flex-row items-center md:items-start justify-center md:justify-between px-4 md:px-[100px] py-10 md:py-0 pt-24 md:pt-[220px] pb-10 md:pb-0" id="home">
                <div className="flex flex-col items-center mb-8 w-full text-center md:items-start md:mb-0 md:w-1/2 md:text-left">
                    <BlurText
                        text="Find the Best Guide for You"
                        delay={150}
                        animateBy="words"
                        direction="top"
                        onAnimationComplete={handleAnimationComplete}
                        className="mb-2 text-2xl font-bold sm:text-3xl md:text-7xl text-pureWhite md:mb-4"
                    />
                    <h2 className='text-pureWhite md:text-lg md:mt-[20px] md:mb-[20px] mb-[10px]'>Connecting <strong>Travelers</strong> with Sri Lanka's Best <strong>Tour Guides</strong></h2>
                    <div className="flex flex-col gap-4 justify-center w-full sm:flex-row md:justify-start">
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
                <div className="flex relative justify-center items-center mt-8 w-full md:w-1/2 md:mt-0">
                    <div className="flex relative justify-center items-start w-full h-full">
                        {/* Circles behind the image */}
                        <div className="absolute rounded-full bg-gradient-to-b from-pureWhite/70 via-primaryGreen/90 to-transparent w-[200px] sm:w-[250px] md:w-[450px] h-[200px] sm:h-[250px] md:h-[450px] top-10 md:-top-[50px] left-1/2 transform -translate-x-1/2 z-0"></div>
                        <div className="absolute rounded-full bg-pureWhite/10 w-[120px] sm:w-[150px] md:w-[300px] h-[120px] sm:h-[150px] md:h-[300px] top-32 md:top-[100px] left-10 md:-left-[50px] z-0"></div>
                        <div className="absolute rounded-full bg-pureWhite/10 w-[80px] sm:w-[100px] md:w-[200px] h-[80px] sm:h-[100px] md:h-[200px] bottom-10 md:bottom-[50px] right-10 md:right-[0px] z-0"></div>
                        {/* Window for Top Guides */}
                        <div className="absolute top-[250px] sm:top-[300px] md:top-[200px] left-1/2 transform -translate-x-1/2 md:left-[250px] w-[250px] sm:w-[300px] md:w-[500px] h-[280px] sm:h-[250px] md:h-[300px] bg-pureWhite/20 backdrop-filter backdrop-blur-lg rounded-lg shadow-xl p-3 z-20 text-center">
                            <h3 className="mb-1 text-sm font-semibold text-primaryGreen md:text-pureWhite sm:text-base md:text-xl">TOP GUIDES TODAY</h3>
                            {topGuides.length > 0 ? (
                                <AnimatedList
                                    items={topGuides.slice(0, 5).map(guide => (
                                        <div key={guide._id} className="flex gap-2 items-center p-1 rounded-lg transition-colors duration-200 hover:bg-pureWhite/10">
                                            <img
                                                src={getCloudinaryUrl(guide.profilePhoto)}
                                                alt={guide.fullName}
                                                className="object-cover w-5 h-5 rounded-full sm:w-6 sm:h-6 md:w-10 md:h-10"
                                            />
                                            <div className="flex flex-col">
                                                <p className="m-0 text-xs font-medium text-left text-pureWhite sm:text-sm">{guide.fullName}</p>
                                                <div className="flex gap-1 justify-center items-center text-xs text-pureWhite/80">
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
                                <p className="text-xs text-pureWhite/80 sm:text-sm md:text-base">Loading top guides...</p>
                            )}
                        </div>
                        {/* Image */}
                        <img src="/Images/Tourist.png" alt='tourist' className="w-[200px] sm:w-[250px] md:w-[600px] h-auto mt-10 md:-mt-[190px] z-10" />
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-10 md:py-16 pl-4 md:pl-[50px] bg-gradient-to-b from-primaryGreen/60 from-30% to-primaryGreen mt-[50px] md:pb-[100px] md:rounded-[10px]">
                <section className="flex flex-col gap-8 items-center md:flex-row md:gap-12">
                    <div className="flex relative flex-col items-center w-full md:w-full md:items-start">
                        {/* Background Image */}
                        <img
                            src="/Images/Collage2.png"
                            className="absolute w-[600px] md:top-[-300px] md:left-[285px] md:w-[1200px] top-[25px] h-auto object-cover z-0 pointer-events-none md:rounded-br-[10px]"
                            style={{ maxWidth: '5000px' }}
                            alt=""
                        />
                        {/* Foreground Text */}
                        <div className="relative z-10 text-center">
                            <h2 className="mb-4 text-lg font-bold sm:text-xl md:text-4xl text-pureWhite text-shadow-defaultBlack text-shadow-lg">Explore Sri Lanka Like Never Before</h2>
                            <h3 className="mb-6 text-base font-semibold sm:text-lg md:text-2xl text-pureWhite text-shadow-defaultBlack text-shadow-lg">Discover More Than Just Destinations, Discover Stories</h3>
                            <p className="text-pureWhite text-xs sm:text-sm md:text-base leading-relaxed text-shadow-white bg-primaryGreen/60 rounded-[10px] p-[10px] shadow-lg">
                                At Ceylon Top Guide, we believe travel is more than sightseeing, it's about connecting with the heart of a place.

                                Whether you're exploring ancient temples, tasting spicy street food, chasing waterfalls, or unwinding on a hidden beach, your experience is richer with the right local guide by your side.

                                We connect you with trusted, verified local experts who know Sri Lanka inside and out, the culture, the secrets, and the places guidebooks miss.

                                Let us turn your trip into a personal, meaningful, and unforgettable journey.

                                Browse local guides now and start planning your adventure with a local touch!
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-center w-full md:w-1/2">
                        {/* (You can leave this empty or add something else here) */}
                    </div>
                </section>
            </div>
            <div className='container mx-auto px-4 py-10 md:py-16 pl-4 md:pl-[50px] bg-gradient-to-b from-primaryGreen/60 from-30% to-primaryGreen mt-[150px] md:rounded-[10px]'>
                <section className="flex flex-col gap-8 items-center mt-10 md:flex-row md:gap-12 md:mt-16">
                    {/* Image on the left */}
                    <div className="flex relative flex-col items-center w-full md:w-1/2 md:items-start min-h-[300px]">
                        <img 
                            src="/Images/Collage1.png" 
                            className="absolute top-[-100px] md:top-[-250px] left-0 md:left-[-100px] w-[800px] md:w-[1200px] h-auto object-cover z-0 pointer-events-none"
                            style={{ maxWidth: '5000px' }}
                            alt="Collage background"
                        />
                    </div>
                    {/* Text on the right */}
                    <div className="flex relative z-10 flex-col items-center w-full md:items-start md:w-full md:left-[-50px] text-center">
                        <h2 className="left-0 mb-4 text-xl font-bold md:text-4xl text-pureWhite text-shadow-defaultBlack text-shadow-lg">Calling All Local Guides in Sri Lanka!</h2>
                        <h3 className="mb-6 text-lg font-semibold md:text-2xl text-pureWhite text-shadow-defaultBlack text-shadow-lg">Share Your Sri Lanka with the World, Join Ceylon Top Guide</h3>
                        <p className="text-sm leading-relaxed text-pureWhite md:text-base bg-primaryGreen/60 rounded-[10px] p-[10px] shadow-lg">
                            You know the hidden gems and true stories of Sri Lanka. Travelers want to see the island through your eyes. You are the key to unlocking Sri Lanka's real magic.

                            Get verified, build your profile, and connect with travelers who value authentic, local experiences.
                            Turn your passion into a rewarding guiding career. Don't just guide, inspire, lead, and change how the world sees Sri Lanka.
                        </p>
                    </div>
                </section>
            </div>

            <div className="w-full px-4 md:px-16 py-10 md:py-[200px] text-center bg-gradient-to-b from-pureWhite/70 via-primaryGreen/70 to-pureWhite/70 mt-10 md:mt-[100px]">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8">
                    <div className="col-span-1 mb-4 md:col-span-2">
                        <h2 className="mb-6 text-xl font-bold text-center sm:text-2xl md:text-4xl text-defaultBlack md:mb-12">WHY CHOOSE CEYLONTOPGUIDE ?</h2>
                    </div>

                    {/* Mobile View - Tourist Section */}
                    <div className="flex order-1 justify-center items-center p-4 rounded-lg backdrop-filter backdrop-blur-lg md:hidden bg-primaryGreen/20">
                        <h3 className="text-lg font-bold text-center sm:text-xl md:text-2xl text-pureWhite">If You Are A Tourist</h3>
                    </div>

                    {/* Desktop View - Tourist Header */}
                    <div className="hidden justify-center items-center p-4 rounded-lg backdrop-filter backdrop-blur-lg md:flex bg-primaryGreen/20">
                        <h3 className="text-lg font-bold text-center sm:text-xl md:text-2xl text-pureWhite">If You Are A Tourist</h3>
                    </div>

                    {/* Desktop View - Tour Guide Header */}
                    <div className="hidden justify-center items-center p-4 rounded-lg backdrop-filter backdrop-blur-lg md:flex bg-primaryGreen/20">
                        <h3 className="text-lg font-bold text-center sm:text-xl md:text-2xl text-pureWhite">If You are A Tour Guide</h3>
                    </div>

                    {/* Trusted Local Experts */}
                    <div className="flex order-2 items-center p-3 rounded-lg shadow-md backdrop-filter backdrop-blur-lg transition duration-300 ease-in-out bg-primaryGreen sm:p-4 md:p-6 hover:scale-105">
                        <div className="flex-grow mr-4 text-left">
                            <span className="text-xs font-bold text-pureWhite sm:text-sm md:text-base"> Trusted Local Experts: </span><span className="text-xs text-pureWhite/80 sm:text-sm md:text-base">All guides are verified for quality and authenticity, backed by real reviews.</span>
                        </div>
                        <div className="flex flex-shrink-0 justify-center items-center w-8 h-8 text-pureWhite sm:w-10 sm:h-10 md:w-12 md:h-12">
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                            </svg>
                        </div>
                    </div>

                    {/* Unique Experiences */}
                    <div className="flex order-3 items-center p-3 rounded-lg shadow-md backdrop-filter backdrop-blur-lg transition duration-300 ease-in-out bg-primaryGreen sm:p-4 md:p-6 hover:scale-105 md:order-7">
                        <div className="flex-grow mr-4 text-left">
                            <span className="text-xs font-bold text-pureWhite sm:text-sm md:text-base">Unique Experiences: </span> <span className="text-xs text-pureWhite/80 sm:text-sm md:text-base">Go beyond the tourist trail and uncover hidden gems only locals know.</span>
                        </div>
                        <div className="flex flex-shrink-0 justify-center items-center w-8 h-8 text-pureWhite sm:w-10 sm:h-10 md:w-12 md:h-12">
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path fill="currentColor" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                        </div>
                    </div>

                    {/* Connect with Real Travelers */}
                    <div className="flex order-7 items-center p-3 rounded-lg shadow-md backdrop-filter backdrop-blur-lg transition duration-300 ease-in-out bg-primaryGreen sm:p-4 md:p-6 hover:scale-105 md:order-3">
                        <div className="flex-grow mr-4 text-left">
                            <span className="text-xs font-bold text-pureWhite sm:text-sm md:text-base">Connect with Real Travelers: </span><span className="text-xs text-pureWhite/80 sm:text-sm md:text-base">Reach people looking for genuine, local experiences – just like yours.</span>
                        </div>
                        <div className="flex flex-shrink-0 justify-center items-center w-8 h-8 text-pureWhite sm:w-10 sm:h-10 md:w-12 md:h-12">
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                        </div>
                    </div>

                    {/* Personalized Journeys */}
                    <div className="flex order-4 items-center p-3 rounded-lg shadow-md backdrop-filter backdrop-blur-lg transition duration-300 ease-in-out bg-primaryGreen sm:p-4 md:p-6 hover:scale-105">
                        <div className="flex-grow mr-4 text-left">
                            <span className="text-xs font-bold text-pureWhite sm:text-sm md:text-base">Personalized Journeys: </span><span className="text-xs text-pureWhite/80 sm:text-sm md:text-base">Plan trips that match your interests with guides who truly understand Sri Lanka.</span>
                        </div>
                        <div className="flex flex-shrink-0 justify-center items-center w-8 h-8 text-pureWhite sm:w-10 sm:h-10 md:w-12 md:h-12">
                            <FontAwesomeIcon icon={faRoad} className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />
                        </div>
                    </div>

                    {/* Mobile View - Tour Guide Section */}
                    <div className="flex order-5 justify-center items-center p-4 rounded-lg backdrop-filter backdrop-blur-lg md:hidden bg-primaryGreen/20">
                        <h3 className="text-lg font-bold text-center sm:text-xl md:text-2xl text-pureWhite">If You are A Tour Guide</h3>
                    </div>

                    {/* Build Your Reputation */}
                    <div className="flex order-6 items-center p-3 rounded-lg shadow-md backdrop-filter backdrop-blur-lg transition duration-300 ease-in-out bg-primaryGreen sm:p-4 md:p-6 hover:scale-105">
                        <div className="flex-grow mr-4 text-left">
                            <span className="text-xs font-bold text-pureWhite sm:text-sm md:text-base">Build Your Reputation: </span> <span className="text-xs text-pureWhite/80 sm:text-sm md:text-base">Get verified and showcase your guiding skills to travelers worldwide.</span>
                        </div>
                        <div className="flex flex-shrink-0 justify-center items-center w-8 h-8 text-pureWhite sm:w-10 sm:h-10 md:w-12 md:h-12">
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path fill="currentColor" d="M15 3l2.3 2.3-2.89 2.87 1.42 1.42L18.7 6.7 21 9V3h-6zM3 9l2.3-2.3 2.87 2.89 1.42-1.42L6.7 5.3 9 3H3v6zm6 12l-2.3-2.3 2.89-2.87-1.42-1.42L5.3 17.3 3 15v6h6zm12-6l-2.3 2.3-2.87-2.89-1.42 1.42 2.89 2.87L15 21h6v-6z" />
                                <circle cx="12" cy="12" r="3" fill="currentColor" />
                            </svg>
                        </div>
                    </div>

                    {/* Grow with Support */}
                    <div className="flex order-8 items-center p-3 rounded-lg shadow-md backdrop-filter backdrop-blur-lg transition duration-300 ease-in-out bg-primaryGreen sm:p-4 md:p-6 hover:scale-105">
                        <div className="flex-grow mr-4 text-left">
                            <span className="text-xs font-bold text-pureWhite sm:text-sm md:text-base">Grow with Support: </span><span className="text-xs text-pureWhite/80 sm:text-sm md:text-base">Turn your passion into a profession with the tools and platform you need to succeed.</span>
                        </div>
                        <div className="flex flex-shrink-0 justify-center items-center w-8 h-8 text-pureWhite sm:w-10 sm:h-10 md:w-12 md:h-12">
                            <FontAwesomeIcon icon={faUser} className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16 text-center md:mt-[100px] md:mb-[100px]" id="find-guide">
                <h1 className="mb-14 text-3xl font-bold md:text-4xl text-primaryGreen">FIND A SUITABLE GUIDE FOR YOU</h1>

                <div className="flex relative gap-4 justify-center items-center">
                    <motion.button
                        initial={false}
                        animate={{ backgroundColor: `var(--hue-${currentIndex % 6 + 1})` }}
                        aria-label="Previous"
                        className="flex z-10 justify-center items-center w-12 h-12 rounded-full shadow-lg transition-colors duration-300 bg-primaryGreen hover:bg-darkGreen"
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
                                className="flex absolute inset-0 gap-6 justify-center px-4"
                            >
                                {[...Array(3)].map((_, i) => {
                                    const guideIndex = (currentIndex + i) % topGuides.length;
                                    const guide = topGuides[guideIndex];
                                    if (!guide) return null;

                                    return (
                                        <MotionLink
                                            to={`/guides/${guide._id}`}
                                            key={`${guide._id}-${i}`}
                                            className="flex-shrink-0 snap-center"
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
                                                onContactClick={() => { }}
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
                        className="flex z-10 justify-center items-center w-12 h-12 rounded-full shadow-lg transition-colors duration-300 bg-primaryGreen hover:bg-darkGreen"
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
                    className="flex justify-center mt-8"
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

            <div className="flex justify-center items-center px-4 py-10 my-8 bg-gradient-to-b rounded-3xl md:mx-16 md:py-20 from-pureWhite/80 via-primaryGreen/50 to-pureWhite/80 md:my-16" id="register">
                <div className="flex flex-col items-center p-4 w-full max-w-5xl rounded-2xl shadow-xl bg-pureWhite/80 sm:p-6 md:p-10">
                    <h1 className="mb-6 text-xl font-bold text-center sm:text-xl md:text-3xl text-primaryGreen md:mb-10">REGISTER AS A TOUR GUIDE</h1>
                    <Link to="/guideRegister" className="flex flex-col gap-4 justify-center items-center mb-6 w-full md:flex-row md:gap-8 md:mb-10">
                        <div className="w-full md:flex-1 flex flex-col items-center bg-primaryGreen/90 rounded-xl p-3 sm:p-4 md:p-6 shadow-lg hover:scale-105 transition-transform duration-300 h-[220px] sm:h-[240px] md:h-[260px]">
                            <div className="mb-1 sm:mb-2 md:mb-3 text-pureWhite">
                                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="36" height="36" className="sm:w-40 sm:h-40 md:w-14 md:h-14">
                                    <path fill="currentColor" d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                </svg>
                            </div>
                            <h3 className="text-sm font-semibold sm:text-sm md:text-base text-pureWhite">STEP 1:</h3>
                            <h2 className="mb-1 text-base font-bold text-center sm:text-base md:text-lg text-pureWhite md:mb-2">CREATE YOUR PROFILE</h2>
                            <p className="text-xs text-center text-pureWhite/90 sm:text-xs md:text-sm">
                                Enter your basic details and upload<br />a profile photo.
                            </p>
                        </div>
                        <div className="w-full md:flex-1 flex flex-col items-center bg-primaryGreen/90 rounded-xl p-3 sm:p-4 md:p-6 shadow-lg hover:scale-105 transition-transform duration-300 h-[220px] sm:h-[240px] md:h-[260px]">
                            <div className="mb-1 sm:mb-2 md:mb-3 text-pureWhite">
                                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="36" height="36" className="sm:w-40 sm:h-40 md:w-14 md:h-14">
                                    <path fill="currentColor" d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                                </svg>
                            </div>
                            <h3 className="text-sm font-semibold sm:text-sm md:text-base text-pureWhite">STEP 2:</h3>
                            <h2 className="mb-1 text-base font-bold text-center sm:text-base md:text-lg text-pureWhite md:mb-2">ADD YOUR CREDENTIALS</h2>
                            <p className="text-xs text-center text-pureWhite/90 sm:text-xs md:text-sm">
                                Share your guide license,<br />expertise, languages,<br />and tour types.
                            </p>
                        </div>
                        <div className="w-full md:flex-1 flex flex-col items-center bg-primaryGreen/90 rounded-xl p-3 sm:p-4 md:p-6 shadow-lg hover:scale-105 transition-transform duration-300 h-[220px] sm:h-[240px] md:h-[260px]">
                            <div className="mb-1 sm:mb-2 md:mb-3 text-pureWhite">
                                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="36" height="36" className="sm:w-40 sm:h-40 md:w-14 md:h-14">
                                    <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                </svg>
                            </div>
                            <h3 className="text-sm font-semibold sm:text-sm md:text-base text-pureWhite">STEP 3:</h3>
                            <h2 className="mb-1 text-base font-bold text-center sm:text-base md:text-lg text-pureWhite md:mb-2">GET VERIFIED & GO LIVE</h2>
                            <p className="text-xs text-center text-pureWhite/90 sm:text-xs md:text-sm">
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

            <div className="px-4 py-10 about-us-container md:px-16 md:py-20" id="about">
                <h1 className="mb-6 text-xl font-bold text-center about-us-title sm:text-2xl md:text-4xl text-defaultBlack md:mb-10">ABOUT US</h1>
                <div className="flex flex-col gap-6 items-center about-us-content md:flex-row sm:gap-8">
                    <div className="w-full about-us-text md:w-1/2">
                        <h2 className="mb-3 text-lg font-bold about-us-heading sm:text-xl md:text-3xl text-defaultBlack sm:mb-4">We Connect the Best Guides with Curious Travelers.</h2>
                        <p className="mb-3 text-xs about-us-paragraph sm:text-sm md:text-base text-defaultBlack sm:mb-4">
                            At CeylonTopGuide, we're not just building a platform, we're opening a door that connects curious travelers with the local voices who know Sri Lanka best.
                        </p>
                        <p className="mb-3 text-xs about-us-paragraph sm:text-sm md:text-base text-defaultBlack sm:mb-4">
                            Our mission is simple; make finding experienced, passionate local guides straightforward and reliable. We bring Sri Lanka's professional tour guides together on one trusted platform, each verified to help travelers confidently choose who will lead their journey.
                        </p>
                        <p className="mb-3 text-xs about-us-paragraph sm:text-sm md:text-base text-defaultBlack sm:mb-4">
                            Behind each profile is someone who knows Sri Lanka deeply and personally; its hidden corners, untold stories, and local secrets.
                        </p>
                        <p className="text-xs about-us-paragraph sm:text-sm md:text-base text-defaultBlack">
                            Welcome to our community. We're glad you're here.
                        </p>
                    </div>
                    <div className="flex justify-center w-full about-us-image-container md:w-1/2">
                        <img src="/Logo/LogoBlack.png" alt="Logo BLACK" className='about-us-image w-24 sm:w-40 md:w-80 md:ml-[50px] md:mt-[-50px]' />
                    </div>
                </div>
            </div>
            <div className="px-4 py-10 about-us-container md:px-16 md:py-20" id="contact">
                <Footer />
            </div>
        </div>
    );
};

export default LandingPage;