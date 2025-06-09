import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Header() {
    const [userData, setUserData] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is logged in by fetching session data
        const checkSession = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/guides/session`, {
                    withCredentials: true
                });
                if (response.data.user) {
                    setUserData(response.data.user);
                }
            } catch (error) {
                console.error('Session check failed:', error);
                setUserData(null);
            }
        };

        checkSession();
    }, []);

    // Get first name from full name
    const getFirstName = (fullName) => {
        return fullName.split(' ')[0];
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className="w-full bg-primaryGreen py-4 text-white font-['Work_Sans',_Helvetica,_Arial,_sans-serif]">
            <div className="flex items-center justify-between mx-auto px-5">
                <div className="w-[50px] h-[50px]">
                    <img src='/Logo/Logo.png' alt='logo' className='w-[60px]' />
                </div>

                {/* Hamburger Menu Button - Only visible on mobile */}
                <button 
                    className="lg:hidden p-2"
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                >
                    <div className="w-6 h-5 flex flex-col justify-between">
                        <span className={`w-full h-0.5 bg-pureWhite transform transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                        <span className={`w-full h-0.5 bg-pureWhite transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                        <span className={`w-full h-0.5 bg-pureWhite transform transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                    </div>
                </button>

                {/* Navigation Menu */}
                <nav className={`lg:flex-grow lg:ml-10 ${isMenuOpen ? 'block' : 'hidden'} lg:block absolute lg:relative top-[72px] lg:top-0 left-0 w-full lg:w-auto bg-primaryGreen lg:bg-transparent z-50 transition-all duration-300 ease-in-out transform ${isMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 lg:translate-y-0 lg:opacity-100'}`}>
                    <ul className="flex flex-col lg:flex-row list-none m-0 p-0 md:gap-[40px] gap-[2px] lg:items-center items-center">
                        <li className="inline-block p-4 lg:p-0 w-full lg:w-auto text-center">
                            <Link to="/" className="text-pureWhite no-underline text-base transition-opacity duration-200 hover:opacity-80 block">Home</Link>
                        </li>
                        <li className="inline-block p-4 lg:p-0 w-full lg:w-auto text-center">
                            <Link to="/guideList" className="text-pureWhite no-underline text-base transition-opacity duration-200 hover:opacity-80 block">Find a guide</Link>
                        </li>
                        <li className="inline-block p-4 lg:p-0 w-full lg:w-auto text-center">
                            <Link to="/#about" className="text-pureWhite no-underline text-base transition-opacity duration-200 hover:opacity-80 block">About us</Link>
                        </li>
                        <li className="inline-block p-4 lg:p-0 w-full lg:w-auto text-center">
                            <Link to="/#contact" className="text-pureWhite no-underline text-base transition-opacity duration-200 hover:opacity-80 block">Contact</Link>
                        </li>
                    </ul>
                </nav>

                {/* Auth Buttons */}
                <div className={`${isMenuOpen ? 'block' : 'hidden'} lg:block absolute lg:relative top-[300px] lg:top-0 left-0 w-full lg:w-auto bg-primaryGreen lg:bg-transparent p-4 lg:p-0 z-50 transition-all duration-300 ease-in-out transform ${isMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 lg:translate-y-0 lg:opacity-100'}`}>
                    {userData ? (
                        <Link 
                            to="/guideProfile" 
                            className="no-underline bg-primaryGreen text-pureWhite border border-pureWhite font-semibold py-2 px-4 rounded transition-all duration-300 hover:bg-pureWhite hover:text-primaryGreen hover:border-primaryGreen block text-center lg:inline-block"
                        >
                            {getFirstName(userData.fullName)}
                        </Link>
                    ) : (
                        <div className="flex flex-col lg:flex-row gap-4 lg:gap-2.5">
                            <Link 
                                to="/guideRegister" 
                                className="bg-primaryGreen text-pureWhite border border-pureWhite font-semibold py-2 px-4 rounded transition-all duration-300 hover:bg-pureWhite hover:text-primaryGreen hover:border-primaryGreen block text-center lg:inline-block"
                            >
                                Register as a Guide
                            </Link>
                            <Link 
                                to="/guideLogin" 
                                className="bg-primaryGreen text-pureWhite border border-pureWhite no-underline font-semibold py-2 px-4 rounded transition-all duration-300 hover:bg-pureWhite hover:text-primaryGreen hover:border-primaryGreen block text-center lg:inline-block"
                            >
                                Login
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}

export default Header
