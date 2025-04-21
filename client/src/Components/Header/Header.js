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
                        <li className="nav-item"><Link to="/landingPage" className="nav-link">Home</Link></li>
                        <li className="nav-item"><Link to="/landingPage" className="nav-link">Find a guide</Link></li>
                        <li className="nav-item"><Link to="/landingPage" className="nav-link">Register as a guide</Link></li>
                        <li className="nav-item"><Link to="/landingPage" className="nav-link">About us</Link></li>
                        <li className="nav-item"><Link to="/landingPage" className="nav-link">Contact</Link></li>
                    </ul>
                </nav>

                <div className="header-auth">
                    <Link to="/guideLogin" className="auth-link">Login / Sign-up</Link>
                </div>
            </div>
        </header>
    )
}

export default Header
