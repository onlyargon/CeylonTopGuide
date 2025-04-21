import React from 'react';
import { Link } from 'react-router-dom';
import './RegistrationSuccess.css';
import Footer from '../Footer/Footer';
import Header from '../Header/Header';

const RegistrationSuccess = () => {
    return (
        <>
            <Header />
            <div className="registration-success-wrapper">
                <div 
                    className="reg-success-profile-background"
                    style={{
                        backgroundImage: `url(/Backgrounds/Background1.png)`
                    }}
                ></div>
                <div className="registration-success-container">
                    <div className="registration-success-content">
                        <h1>Submission Successful</h1>
                        <div className="success-message">
                            <p>Thank you for submitting your details!</p>
                            <p>We're excited to have you onboard.</p>
                            <p>Your registration is currently under review by our team,</p>
                            <p>and you'll receive a confirmation email once approved.</p>
                        </div>

                        <div className="success-cta">
                            <p>Meanwhile, explore discover more about</p>
                            <p>CeylonTopGuide.</p>
                        </div>

                        <div className="success-buttons">
                            <Link to="/landingPage" className="success-button-home">Home</Link>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default RegistrationSuccess;