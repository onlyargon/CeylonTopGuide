import React from 'react'
import './Footer.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faInstagram, faLinkedin, faTwitter } from '@fortawesome/free-brands-svg-icons';

function Footer() {
    return (
        <footer className="footer-container">
            <div className="footer-top-border"></div>
            <div className="footer-main-content">
                <div className="footer-brand">
                <div className="title-with-logo">
                        <h1 className="footer-title">CEYLON TOPGUIDE</h1>
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
                            <li><a href="/">Home</a></li>
                            <li><a href="/register">Register as Guide</a></li>
                            <li><a href="/browse">Browse Guides</a></li>
                            <li><a href="/about">About Us</a></li>
                            <li><a href="/contact">Contact Us</a></li>
                        </ul>
                    </div>

                    <div className="links-column">
                        <h3>Support:</h3>
                        <ul>
                            <li>Email: <a href="mailto:support@ceylontopguide.lk">support@ceylontopguide.lk</a></li>
                            <li>Contact Number: +94 xx xxx xxxx</li>
                        </ul>
                    </div>

                    <div className="links-column">
                        <h3>Follow Us On:</h3>
                        <div className="social-icons">
                            <a href="https://facebook.com"><FontAwesomeIcon icon={faFacebook} /></a>
                            <a href="https://instagram.com"><FontAwesomeIcon icon={faInstagram} /></a>
                            <a href="https://linkedin.com"><FontAwesomeIcon icon={faLinkedin} /></a>
                            <a href="https://twitter.com"><FontAwesomeIcon icon={faTwitter} /></a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p>© 2025 CeylonTopGuide. All rights reserved. | <a href="/privacy">Privacy Policy</a> | <a href="/terms">Terms & Conditions</a> | Designed and Developed by : <a href='https://linktr.ee/ImethW'><span className='footer-fourthwall'>FourthWall</span></a></p>
            </div>
        </footer>
    )
}

export default Footer