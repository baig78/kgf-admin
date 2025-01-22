import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../../Components/Navbar/Navbar';
import FooterComp from '../../Components/FooterComp/FooterComp';
import { userService } from '../../service';
import './Home.css';
import { TailSpin } from 'react-loader-spinner';
import { toast } from 'react-toastify';
import {
    Typography,
    Grid,
    Paper,
    Button,
    Box
} from '@mui/material';

const Home = () => {
    const [registrations, setRegistrations] = useState({ total: 0, countries: {} });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Fetch first page with a larger count to get comprehensive data
            const response = await userService.getAllUsers(1, 1000);
            console.log('Full API Response:', response);
            
            const users = response.data || [];
            const totalUsers = response.metadata?.totalUsers || users.length;

            console.log('Total Users:', totalUsers);
            console.log('Users Data:', users);

            const countriesCount = users.reduce((acc, user) => {
                const country = user.country || 'Unknown';
                acc[country] = (acc[country] || 0) + 1;
                return acc;
            }, {});

            console.log('Countries Count:', countriesCount);

            setRegistrations({ total: totalUsers, countries: countriesCount });

        } catch (err) {
            console.error('Detailed Error fetching user data:', err);
            setError(`Failed to load registration data: ${err.message}`);
            toast.error('Unable to fetch registration details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Memoize sorted countries for performance
    const sortedCountries = useMemo(() =>
        Object.entries(registrations.countries)
            .sort((a, b) => b[1] - a[1]),
        [registrations.countries]
    );

    // Loading State
    if (loading) {
        return (
            <div className='home-page'>
                <Navbar />
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    height="calc(100vh - 64px)"
                >
                    <TailSpin
                        height="80"
                        width="80"
                        color="#4fa94d"
                        ariaLabel="Loading registration data"
                        radius="1"
                        visible={true}
                    />
                </Box>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className='home-page'>
                <Navbar />
                <Box
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                    height="calc(100vh - 64px)"
                    textAlign="center"
                    p={3}
                >
                    <Typography variant="h5" color="error" gutterBottom>
                        {error}
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={fetchData}
                    >
                        Try Again
                    </Button>
                </Box>
            </div>
        );
    }

    // Main Content
    return (
        <div className='home-page'>
            <Navbar />
            <Box className="container" p={3}>
                <Typography variant="h4" gutterBottom>
                    Total Registrations: {registrations.total}
                </Typography>

                <Typography variant="h5" sx={{ mt: 3, mb: 2 }}>
                    Country-wise Registration Count
                </Typography>

                <Grid container spacing={3}>
                    {sortedCountries.map(([country, count]) => (
                        <Grid item xs={12} sm={6} md={4} key={country}>
                            <Paper
                                elevation={3}
                                sx={{
                                    p: 2,
                                    textAlign: 'center',
                                    transition: 'transform 0.3s',
                                    '&:hover': {
                                        transform: 'scale(1.05)'
                                    }
                                }}
                            >
                                <Typography variant="h6" color="primary">
                                    {country}
                                </Typography>
                                <Typography variant="body1">
                                    Registrations: {count}
                                </Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Box>
            <FooterComp />
        </div>
    );
};

export default Home;
