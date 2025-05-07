import React, { useState, useEffect } from 'react'
import './Header.css'
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Header() {
    const [userData, setUserData] = useState(null);
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

    const handleLogout = async () => {
        try {
            await axios.post(`${process.env.REACT_APP_API_BASE_URL}/guides/logout`, {}, {
                withCredentials: true
            });
            setUserData(null);
            navigate('/guideLogin');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    // Get first name from full name
    const getFirstName = (fullName) => {
        return fullName.split(' ')[0];
    };

    return (
        <header className="site-header">
            <div className="header-container">
                <div className="header-logo">
                    <img src='/Logo/Logo.png' alt='logo' className='logo' />
                </div>

                <nav className="header-nav">
                    <ul className="nav-list">
                        <li className="nav-item"><Link to="/" className="nav-link">Home</Link></li>
                        <li className="nav-item"><Link to="/guideList" className="nav-link">Find a guide</Link></li>
                        <li className="nav-item"><Link to="/#about" className="nav-link">About us</Link></li>
                        <li className="nav-item"><Link to="/#contact" className="nav-link">Contact</Link></li>
                    </ul>
                </nav>

                <div className="header-auth">
                    {userData ? (
                        <button onClick={handleLogout} className="user-name-button">
                            {getFirstName(userData.fullName)}
                        </button>
                    ) : (
                        <>
                            <Link to="/guideRegister" className="register-button">Register as a Guide</Link>
                            <Link to="/guideLogin" className="auth-link">Login</Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}

export default Header
