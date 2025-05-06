import React from 'react'
import './Header.css'
import { Link } from 'react-router-dom';


function Header() {
    return (
        <header className="site-header">
            <div className="header-container">
                <div className="header-logo">
                    <img src='/Logo/Logo.png' alt='logo' className='logo' />
                </div>

                <nav className="header-nav">
                    <ul className="nav-list">
                        <li className="nav-item"><a href="#home" className="nav-link">Home</a></li>
                        <li className="nav-item"><a href="#find-guide" className="nav-link">Find a guide</a></li>
                        <li className="nav-item"><a href="#about" className="nav-link">About us</a></li>
                        <li className="nav-item"><a href="#contact" className="nav-link">Contact</a></li>
                    </ul>
                </nav>

                <div className="header-auth">
                    <Link to="/guideRegister" className="register-button">Register as a Guide</Link>
                    <Link to="/guideLogin" className="auth-link">Login</Link>
                </div>
            </div>
        </header>
    )
}

export default Header
