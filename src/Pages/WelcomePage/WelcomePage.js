import React from 'react';
import { useNavigate } from 'react-router-dom';
import './WelcomePage.css';

function WelcomePage() {
    const navigate = useNavigate();

    const handleSignInClick = () => {
        navigate('/');
    };

    return (
        <div className="welcome-container">
            <div className="welcome-image">
                <img src="../../assets/download.png" alt="Welcome" />
            </div>
            <div className="welcome-content">
                <h1>Welcome to KGF</h1>
                <button className="sign-in-button" onClick={handleSignInClick}>
                    Admin Login
                </button>
            </div>
        </div>
    );
}

export default WelcomePage;
