import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../../Components/Navbar/Navbar';
import FooterComp from '../../Components/FooterComp/FooterComp';
import { userService } from '../../service';
import './Home.css';
import { TailSpin } from 'react-loader-spinner';
import { toast } from 'react-toastify';
import { Typography, Grid, Paper, Button, Box } from '@mui/material';
// import { Chart as ChartJS, 
//   CategoryScale, 
//   LinearScale, 
//   BarElement, 
//   ArcElement, 
//   PointElement, 
//   LineElement, 
//   Title, 
//   Tooltip, 
//   Legend 
// } from 'chart.js';
// import { Bar, Pie, Line } from 'react-chartjs-2';
// import { parseISO } from 'date-fns/parseISO';
// import { format } from 'date-fns/format';

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   ArcElement,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend
// );

const Home = () => {
  const [registrations, setRegistrations] = useState({ total: 0, countries: {}, users: [] });
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

      setRegistrations({ total: totalUsers, countries: countriesCount, users });
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
  const sortedCountries = useMemo(
    () => Object.entries(registrations.countries).sort((a, b) => b[1] - a[1]),
    [registrations.countries]
  );

  // Function to categorize users by age groups
  // const getUserAgeGroups = (users) => {
  //   const ageGroups = {
  //     '0-18': 10,
  //     '19-25': 111,
  //     '26-35': 29,
  //     '36-45': 44,
  //     '46-55': 55,
  //     '56+': 10
  //   };

  //   users.forEach(user => {
  //     // Assuming user has a birthdate or age field
  //     const age = user.age || (user.birthdate 
  //       ? calculateAge(new Date(user.birthdate)) 
  //       : null);
      
  //     if (age !== null) {
  //       if (age <= 18) ageGroups['0-18']++;
  //       else if (age <= 25) ageGroups['19-25']++;
  //       else if (age <= 35) ageGroups['26-35']++;
  //       else if (age <= 45) ageGroups['36-45']++;
  //       else if (age <= 55) ageGroups['46-55']++;
  //       else ageGroups['56+']++;
  //     }
  //   });

  //   return ageGroups;
  // };

  // // Helper function to calculate age
  // const calculateAge = (birthDate) => {
  //   const today = new Date();
  //   let age = today.getFullYear() - birthDate.getFullYear();
  //   const monthDifference = today.getMonth() - birthDate.getMonth();
    
  //   if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
  //     age--;
  //   }
    
  //   return age;
  // };

  // // Prepare age-wise chart data
  // const ageData = {
  //   labels: Object.keys(getUserAgeGroups(registrations.users || [])),
  //   datasets: [
  //     {
  //       label: 'Users by Age Group',
  //       data: Object.values(getUserAgeGroups(registrations.users || [])),
  //       backgroundColor: [
  //         'rgba(255, 99, 132, 0.6)',   // Red for youngest
  //         'rgba(54, 162, 235, 0.6)',   // Blue
  //         'rgba(255, 206, 86, 0.6)',   // Yellow
  //         'rgba(75, 192, 192, 0.6)',   // Green
  //         'rgba(153, 102, 255, 0.6)',  // Purple
  //         'rgba(255, 159, 64, 0.6)'    // Orange for oldest
  //       ],
  //       borderColor: [
  //         'rgba(255, 99, 132, 1)',
  //         'rgba(54, 162, 235, 1)',
  //         'rgba(255, 206, 86, 1)',
  //         'rgba(75, 192, 192, 1)',
  //         'rgba(153, 102, 255, 1)',
  //         'rgba(255, 159, 64, 1)'
  //       ],
  //       borderWidth: 1
  //     }
  //   ]
  // };

  // // Chart options for better visualization
  // const chartOptions = {
  //   responsive: true,
  //   plugins: {
  //     legend: {
  //       position: 'top',
  //     },
  //     title: {
  //       display: true,
  //       text: 'User Distribution by Age Groups'
  //     }
  //   },
  //   scales: {
  //     y: {
  //       beginAtZero: true,
  //       title: {
  //         display: true,
  //         text: 'Number of Users'
  //       }
  //     },
  //     x: {
  //       title: {
  //         display: true,
  //         text: 'Age Groups'
  //       }
  //     }
  //   }
  // };

  // // Function to get gender distribution
  // const getGenderDistribution = (users) => {
  //   const genderCounts = {
  //     'Male': 0,
  //     'Female': 0,
  //     'Other': 0
  //   };

  //   users.forEach(user => {
  //     // Normalize gender to handle variations
  //     const gender = user.gender ? user.gender.toLowerCase() : 'unknown';
      
  //     switch(gender) {
  //       case 'male':
  //         genderCounts['Male']++;
  //         break;
  //       case 'female':
  //         genderCounts['Female']++;
  //         break;
  //       default:
  //         genderCounts['Other']++;
  //     }
  //   });

  //   return genderCounts;
  // };

  // // Prepare gender-wise pie chart data
  // const genderData = {
  //   labels: ['Male', 'Female', 'Other'],
  //   datasets: [
  //     {
  //       label: 'Gender Distribution',
  //       data: Object.values(getGenderDistribution(registrations.users || [])),
  //       backgroundColor: [
  //         'rgba(54, 162, 235, 0.6)',   // Blue for Male
  //         'rgba(255, 99, 132, 0.6)',   // Pink for Female
  //         'rgba(75, 192, 192, 0.6)'    // Teal for Other
  //       ],
  //       borderColor: [
  //         'rgba(54, 162, 235, 1)',
  //         'rgba(255, 99, 132, 1)',
  //         'rgba(75, 192, 192, 1)'
  //       ],
  //       borderWidth: 1
  //     }
  //   ]
  // };

  // // Pie chart options
  // const pieChartOptions = {
  //   responsive: true,
  //   plugins: {
  //     legend: {
  //       position: 'top',
  //     },
  //     title: {
  //       display: true,
  //       text: 'User Distribution by Gender'
  //     }
  //   }
  // };

  // // Function to get date-wise registrations
  // const getDateWiseRegistrations = (users) => {
  //   // Group registrations by date
  //   const registrationsByDate = users.reduce((acc, user) => {
  //     // Assuming user has a createdAt or registrationDate field
  //     const registrationDate = user.createdAt 
  //       ? format(parseISO(user.createdAt), 'yyyy-MM-dd') 
  //       : format(new Date(), 'yyyy-MM-dd');
      
  //     acc[registrationDate] = (acc[registrationDate] || 0) + 1;
  //     return acc;
  //   }, {});

  //   // Sort dates and prepare data for line chart
  //   const sortedDates = Object.keys(registrationsByDate).sort();
    
  //   return {
  //     labels: sortedDates,
  //     data: sortedDates.map(date => registrationsByDate[date])
  //   };
  // };

  // // Prepare date-wise line chart data
  // const dateWiseData = {
  //   labels: getDateWiseRegistrations(registrations.users || []).labels,
  //   datasets: [
  //     {
  //       label: 'Daily Registrations',
  //       data: getDateWiseRegistrations(registrations.users || []).data,
  //       borderColor: 'rgba(75, 192, 192, 1)',
  //       backgroundColor: 'rgba(75, 192, 192, 0.2)',
  //       tension: 0.1,
  //       fill: true
  //     }
  //   ]
  // };

  // // Line chart options
  // const lineChartOptions = {
  //   responsive: true,
  //   plugins: {
  //     legend: {
  //       position: 'top',
  //     },
  //     title: {
  //       display: true,
  //       text: 'Daily User Registrations'
  //     }
  //   },
  //   scales: {
  //     y: {
  //       beginAtZero: true,
  //       title: {
  //         display: true,
  //         text: 'Number of Registrations'
  //       }
  //     },
  //     x: {
  //       title: {
  //         display: true,
  //         text: 'Date'
  //       }
  //     }
  //   }
  // };

  // Loading State
  if (loading) {
    return (
      <div className="home-page">
        <Navbar />
        <Box display="flex" justifyContent="center" alignItems="center" height="calc(100vh - 64px)">
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
      <div className="home-page">
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
          <Button variant="contained" color="primary" onClick={fetchData}>
            Try Again
          </Button>
        </Box>
      </div>
    );
  }

  // Main Content
  return (
    <div className="home-page">
      <Navbar />
      <Box className="container">
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
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <Typography variant="h6" color="primary">
                  {country}
                </Typography>
                <Typography variant="body1">Registrations: {count}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
      {/* <Box className="container">
        <Typography variant="h5" sx={{ mt: 3, mb: 2 }}>
          Registration Statistics
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
            <Box sx={{ flex: 1, height: '400px' }}>
              <Typography variant="h6" align="center" sx={{ mb: 2 }}>
                Age Distribution
              </Typography>
              <Bar 
                data={ageData} 
                options={chartOptions} 
              />
            </Box>
            <Box sx={{ flex: 1, height: '400px' }}>
            <Typography variant="h6" align="center" sx={{ mb: 2 }}>
              Daily Registrations
            </Typography>
            <Line 
              data={dateWiseData} 
              options={lineChartOptions} 
            />
          </Box>
          </Box>
          <Box sx={{ height: '300px', width: '50%', mb: 10 }}>
              <Typography variant="h6" align="left" sx={{ mb: 2, ml: 8}}>
                Gender Distribution
              </Typography>
              <Pie 
              sx={{ display: 'flex', justifyContent: 'center'  }}
                data={genderData} 
                options={pieChartOptions} 
                style={{ maxWidth: '100%' }}
              />
            </Box>
          
        </Box>
      </Box> */}
      <FooterComp />
    </div>
  );
};

export default Home;
