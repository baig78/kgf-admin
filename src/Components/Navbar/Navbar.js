import React, { useState } from 'react';
import './Navbar.css';
import { Link } from 'react-router-dom';


const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <img
                    src="/assets/download.png" // Replace with your logo's URL
                    alt="Logo"
                    className="logo"
                />
                <span>KGF Admin</span>
            </div>
            <div className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
                {/* <a href="/coordinator">Coordinators List</a>
                <a href="/user-list">User List</a> */}
                <Link to="/coordinator">Coordinators List</Link> {/* Use Link instead of a */}
                <Link to="/user-list">User List</Link>
            </div>
            <div className="navbar-hamburger" onClick={toggleMenu}>
                <div className="line"></div>
                <div className="line"></div>
                <div className="line"></div>
            </div>
        </nav>
    );
};

export default Navbar;
