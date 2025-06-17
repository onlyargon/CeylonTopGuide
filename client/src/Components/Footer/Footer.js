import React from 'react'
import './Footer.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faInstagram, faLinkedin, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { Link, useNavigate } from 'react-router-dom';

function Footer() {
    const navigate = useNavigate();

    const scrollToSection = (sectionId) => {
        // First navigate to home if not already there
        if (window.location.pathname !== '/') {
            navigate('/');
        }
        
        // Wait for navigation to complete before scrolling
        setTimeout(() => {
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };

    return (
        <footer className="footer-container">
            <div className="footer-top-border"></div>
            <div className="footer-main-content">
                <div className="footer-brand">
                    <div className="title-with-logo">
                        <div className="footer-logo">
                            <img src="/Logo/LogoBlack.png" alt="LogoBlack" className='compass-logo' />
                        </div>
                    </div>
                    <p className="footer-tagline">Connecting You with Sri Lanka's Best Tour Guides.</p>
                </div>

                <div className="footer-divider"></div>

                <div className="footer-links">
                    <div className="links-column">
                        <h3>Quick Links:</h3>
                        <ul>
                            <li><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}>Home</a></li>
                            <li><Link to="/guideRegister">Register as Guide</Link></li>
                            <li><Link to="/guideList">Browse Guides</Link></li>
        
                        </ul>
                    </div>

                    <div className="links-column">
                        <h3>Contact Us:</h3>
                        <ul>
                            <li>Email: <a href="mailto:support@ceylontopguide.lk">support@ceylontopguide.lk</a></li>
                            <li>Contact Number: +94 xx xxx xxxx</li>
                        </ul>
                    </div>

                    <div className="links-column">
                        <h3>Follow Us On:</h3>
                        <div className="social-icons">
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FontAwesomeIcon icon={faFacebook} /></a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FontAwesomeIcon icon={faInstagram} /></a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p>© 2025 CeylonTopGuide. All rights reserved. | <Link to="/privacy">Privacy Policy</Link> | <Link to="/terms">Terms & Conditions</Link> | Designed and Developed by : <a href='https://linktr.ee/ImethW'><span className='footer-fourthwall'>FourthWall</span></a></p>
            </div>
        </footer>
    )
}

export default Footer