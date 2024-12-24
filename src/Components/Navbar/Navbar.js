import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null); // Ref to track the dropdown
    const navigate = useNavigate();
    const location = useLocation(); // Get the current location (path)

    const toggleMenu = () => {
        setMenuOpen((prev) => !prev);
    };

    const toggleDropdown = () => {
        setDropdownOpen((prev) => !prev);
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setDropdownOpen(false); // Close dropdown if clicked outside
        }
    };

    useEffect(() => {
        document.addEventListener('click', handleClickOutside);

        // Cleanup the event listener
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    const userName = localStorage.getItem('name'); // Replace with dynamic username if available

    // Function to check if the link is active
    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };

    // Close menu on link click (for smaller screens)
    const handleMenuItemClick = () => {
        setMenuOpen(false);
    };

    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <img
                    src="/assets/download.png"
                    alt="Logo"
                    className="logo"
                />
                <span>KGF Admin</span>
            </div>
            <div className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
                <Link
                    to="/home"
                    className={isActive('/home')}
                    onClick={handleMenuItemClick} // Close menu on click
                >
                    Home
                </Link>
                <Link
                    to="/location"
                    className={isActive('/location')}
                    onClick={handleMenuItemClick} // Close menu on click
                >
                    Location
                </Link>
                <Link
                    to="/add-user-admin"
                    className={isActive('/add-user-admin')}
                    onClick={handleMenuItemClick} // Close menu on click
                >
                    User Admin
                </Link>
                <Link
                    to="/coordinator"
                    className={isActive('/coordinator')}
                    onClick={handleMenuItemClick} // Close menu on click
                >
                    Coordinators
                </Link>
                <Link
                    to="/user-list"
                    className={isActive('/user-list')}
                    onClick={handleMenuItemClick} // Close menu on click
                >
                    User List
                </Link>
                {/* User Dropdown */}
                <div
                    className="user-dropdown"
                    onClick={toggleDropdown}
                    ref={dropdownRef} // Attach the ref
                >
                    <AccountCircleIcon className="user-icon" />
                    {dropdownOpen && (
                        <div className="dropdown-menu">
                            <div className="dropdown-item">
                                <span>{userName}</span>
                            </div>
                            <div
                                className="dropdown-item logout"
                                onClick={handleLogout}
                            >
                                <LogoutIcon className="logout-icon" />
                                <span>Logout</span>
                            </div>
                        </div>
                    )}
                </div>
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
