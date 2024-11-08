import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {


    const navigate = useNavigate();

    const handleLoginClick = () => {
        navigate('/coordinator'); // Redirect to membership form
    };

    return (
        <div className="dropdown-login-container">
            <div className="login-container">
                <div className="login-card">
                    <h2>Welcome to Admin Logn</h2>
                    <form>
                        <div className="form-group-login">
                            <label htmlFor="username">Username</label>
                            <input type="text" id="username" placeholder="Enter your username" required />
                        </div>
                        <div className="form-group-login">
                            <label htmlFor="password">Password</label>
                            <input type="password" id="password" placeholder="Enter your password" required />
                        </div>
                        <button type="button" className="login-button" onClick={handleLoginClick}>
                            Login
                        </button>
                    </form>
                    <p className="forgot-password">
                        <a href="/forgot-password">Forgot password?</a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
