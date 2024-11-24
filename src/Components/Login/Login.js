import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Login.css';
import { adminLogin } from '../../service.js';

function Login() {
    const [phone, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // const navigate = useNavigate();
    // useEffect(() => {
    //     if (localStorage.getItem('token') !== undefined) {
    //         navigate('/coordinator');
    //     }

    // }, [])

    const navigate = useNavigate();

    // useEffect(() => {
    //     // some logic that uses navigate
    //     navigate('/coordinator');  // example logic
    // }, [navigate]);

    // if (localStorage.getItem('token') !== undefined) {
    //     navigate('/coordinator');
    // }

    const handleLoginClick = async (e) => {
        e.preventDefault(); // Prevent page refresh
        setLoading(true); // Show loading state

        try {
            const phone_or_userId = password
            const credentials = { phone_or_userId, password };
            const response = await adminLogin(credentials);

            // Handle successful login response
            console.log('Login successful:', response);
            localStorage.setItem('token', response.token);
            localStorage.setItem('name', phone);
            toast.success('Login successful!', {
                position: 'top-right',
                autoClose: 1000,
            });

            // Navigate to coordinator page after successful login
            setTimeout(() => {
                navigate('/user-list');
            }, 1000);
        } catch (err) {
            // Handle errors
            console.error('Login failed:', err);
            toast.error(err.response?.data?.message || 'Invalid login credentials', {
                position: 'top-right',
                autoClose: 1000,
            });
        } finally {
            setLoading(false); // Stop loading state
        }
    };

    return (
        <div className="dropdown-login-container">
            <ToastContainer />

            {/* Loader displayed when loading is true */}
            {loading && (
                <div className="loader-container">
                    <div className="loader"></div> {/* Spinner loader */}
                </div>
            )}

            <div className="login-container">
                <div className="login-card">
                    <h2>Welcome to Admin Login</h2>
                    <form>
                        <div className="form-group-login">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                placeholder="Enter your username"
                                required
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="form-group-login">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                placeholder="Enter your password"
                                required
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <button
                            type="button"
                            className="login-button"
                            onClick={handleLoginClick}
                        >
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
