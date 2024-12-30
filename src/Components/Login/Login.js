import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Login.css';
import { authService } from '../../service';
import { setToken } from '../../authSlice';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    TextField,
    Box,
    Container,
    Typography,
    CircularProgress,
    Paper
} from '@mui/material';

function Login() {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const timeoutRef = useRef(null);
    const lastActivityRef = useRef(Date.now());

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Check if the token is expired
            const tokenPayload = JSON.parse(atob(token.split('.')[1]));
            const isExpired = tokenPayload.exp * 1000 < Date.now(); // Check expiration

            if (isExpired) {
                localStorage.clear();
                navigate('/', { replace: true });
                toast.info('Logged out due to token expiration', {
                    position: 'top-right',
                    autoClose: 3000,
                });
            } else {
                navigate('/user-list', { replace: true });
            }
        }
    }, [navigate]);

    useEffect(() => {
        const handleActivity = () => {
            lastActivityRef.current = Date.now();
        };

        const checkInactivity = () => {
            const currentTime = Date.now();
            const timeSinceLastActivity = currentTime - lastActivityRef.current;

            if (timeSinceLastActivity >= 60000) { // 1 minute in milliseconds
                localStorage.clear();
                navigate('/', { replace: true });
                toast.info('Logged out due to inactivity', {
                    position: 'top-right',
                    autoClose: 3000,
                });
            } else {
                timeoutRef.current = setTimeout(checkInactivity, 300); // Check every second
            }
        };

        // Add event listeners for user activity
        window.addEventListener('mousemove', handleActivity);
        window.addEventListener('keydown', handleActivity);
        window.addEventListener('click', handleActivity);

        // Start checking for inactivity after successful login
        if (localStorage.getItem('token')) {
            timeoutRef.current = setTimeout(checkInactivity, 1000);
        }

        return () => {
            window.removeEventListener('mousemove', handleActivity);
            window.removeEventListener('keydown', handleActivity);
            window.removeEventListener('click', handleActivity);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [navigate]);

    const handleLoginClick = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const credentials = { phone_or_userId: phone, password };
            const response = await authService.login(credentials);

            // Store token in localStorage
            dispatch(setToken(response.token));
            localStorage.setItem('name', phone);
            localStorage.setItem('token', response.token);
            toast.success('Login successful!', {
                position: 'top-right',
                autoClose: 5000,
            });

            // Check if the token is expired after login
            const tokenPayload = JSON.parse(atob(response.token.split('.')[1]));
            const isExpired = tokenPayload.exp * 1000 < Date.now(); // Check expiration

            if (isExpired) {
                localStorage.clear();
                navigate('/', { replace: true });
                toast.info('Logged out due to token expiration', {
                    position: 'top-right',
                    autoClose: 3000,
                });
            } else {
                navigate('/user-list', { replace: true });
            }
        } catch (err) {
            console.error('Login failed:', err);
            toast.error(err.message || 'Invalid login credentials', {
                position: 'top-right',
                autoClose: 1000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleLoginClick(e);
        }
    };

    const handleForgotPassword = (e) => {
        e.preventDefault();
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    return (
        <Container component="main" maxWidth="xs">
            <ToastContainer />

            {loading && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        zIndex: 9999
                    }}
                >
                    <CircularProgress />
                </Box>
            )}

            <Paper
                elevation={3}
                sx={{
                    marginTop: 8,
                    padding: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}
            >

                <img src="/assets/download.png" alt="Admin Login" width="200" height="200" />
                <Typography component="h1" variant="h5">
                    Welcome to Admin Login
                </Typography>
                <Box component="form" onSubmit={handleLoginClick} sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        autoComplete="username"
                        autoFocus
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        onKeyPress={handleKeyPress}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyPress={handleKeyPress}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Login
                    </Button>
                    <Box sx={{ textAlign: 'center' }}>
                        <Button
                            onClick={handleForgotPassword}
                            sx={{ textTransform: 'none' }}
                        >
                            Forgot password?
                        </Button>
                    </Box>
                </Box>
            </Paper>

            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>Forgot Password</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please contact your administrator for password reset assistance.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Close</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default Login;
