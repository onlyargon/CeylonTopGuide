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
                        <li className="nav-item"><Link to="/">Home</Link></li>
                        <li className="nav-item"><Link to="/guideList">Find a guide</Link></li>
                        <li className="nav-item"><Link to="/#about">About us</Link></li>
                        <li className="nav-item"><Link to="/#contact">Contact</Link></li>
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
