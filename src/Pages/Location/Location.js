import React, { useEffect, useState } from 'react';
import Navbar from "../../Components/Navbar/Navbar";
import FooterComp from "../../Components/FooterComp/FooterComp";
import './Location.css';
import { addressService } from '../../service';
import { Button, Container, Typography, TextField, Select, MenuItem, FormControl, InputLabel, Box, Accordion, AccordionSummary, AccordionDetails, CircularProgress } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const LocationComponent = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [selectedState, setSelectedState] = useState('');
    const [cityName, setCityName] = useState('');
    const [stateName, setStateName] = useState('');
    const [selectedCountryCity, setSelectedCountryCity] = useState('');
    const [selectedCountryState, setSelectedCountryState] = useState('');
    const [countryName, setCountryName] = useState('');
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        fetchCountries();
    }, []);

    const fetchCountries = async () => {
        setError('');
        setLoading(true);
        try {
            const response = await addressService.getCountries();
            const uniqueCountries = response.reduce((acc, country) => {
                if (!acc.some(item => item.name === country.name)) {
                    acc.push({ id: country._id, name: country.name });
                }
                return acc;
            }, []);
            setCountries(uniqueCountries);
        } catch (err) {
            console.error("Error fetching countries:", err);
            setError('Failed to load countries. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedCountryCity) {
            fetchStates(selectedCountryCity);
        } else {
            setStates([]);
        }
    }, [selectedCountryCity]);

    const fetchStates = async (countryId) => {
        setError('');
        setLoading(true);
        try {
            const response = await addressService.getStates(countryId);
            const statesForCountry = response.reduce((acc, state) => {
                if (!acc.some(item => item.name === state.name)) {
                    acc.push({ id: state._id, name: state.name });
                }
                return acc;
            }, []);
            setStates(statesForCountry);
        } catch (err) {
            console.error("Error fetching states:", err);
            setError('Failed to load states. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const validateCityData = async () => {
        const errors = {};
        if (!selectedState) {
            errors.state = 'Please select a state';
        }
        if (!cityName || cityName.trim() === '') {
            errors.cityName = 'Please enter a city name';
        } else if (cityName.trim().length < 2) {
            errors.cityName = 'City name must be at least 2 characters long';
        }

        // Check if city already exists in selected state
        try {
            const cities = await addressService.getCities(selectedState);
            if (cities.some(city => city.name.toLowerCase() === cityName.trim().toLowerCase())) {
                errors.cityName = 'This city already exists in the selected state';
            }
        } catch (err) {
            console.error("Error checking city existence:", err);
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const createCity = async () => {
        if (!await validateCityData()) return;

        try {
            const cityData = {
                name: cityName.trim(),
                state: selectedState
            };
            const response = await addressService.addCity(cityData);
            if (response.success) {
                toast.success('City added successfully!');
                setCityName('');
                setSelectedState('');
                setValidationErrors({});
            } else {
                throw new Error(response.message || 'Failed to add city.');
            }
        } catch (error) {
            console.error('Error adding city:', error);
            setError(error.message || 'Failed to add city');
        }
    };

    const validateStateData = async () => {
        const errors = {};
        if (!selectedCountryState) {
            errors.country = 'Please select a country';
        }
        if (!stateName || stateName.trim() === '') {
            errors.stateName = 'Please enter a state name';
        } else if (stateName.trim().length < 2) {
            errors.stateName = 'State name must be at least 2 characters long';
        }

        // Check if state already exists in selected country
        try {
            const statesResponse = await addressService.getStates(selectedCountryState);
            if (statesResponse.some(state => state.name.toLowerCase() === stateName.trim().toLowerCase())) {
                errors.stateName = 'This state already exists in the selected country';
            }
        } catch (err) {
            console.error("Error checking state existence:", err);
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const createState = async () => {
        if (!await validateStateData()) return;

        try {
            const stateData = {
                name: stateName.trim(),
                country: selectedCountryState
            };
            const response = await addressService.addState(stateData);
            if (response.success) {
                toast.success('State added successfully!');
                setStateName('');
                setSelectedCountryState('');
                setValidationErrors({});
            } else {
                throw new Error(response.message || 'Failed to add state.');
            }
        } catch (error) {
            console.error('Error adding state:', error);
            setError(error.message || 'Failed to add state');
        }
    };

    const validateCountryData = () => {
        const errors = {};
        if (!countryName || countryName.trim() === '') {
            errors.countryName = 'Please enter a country name';
        } else if (countryName.trim().length < 2) {
            errors.countryName = 'Country name must be at least 2 characters long';
        } else if (countries.some(country => country.name.toLowerCase() === countryName.trim().toLowerCase())) {
            errors.countryName = 'This country already exists';
        }
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const createCountry = async () => {
        if (!validateCountryData()) return;

        try {
            const countryData = { name: countryName.trim() };
            const response = await addressService.addCountry(countryData);
            if (response.success) {
                toast.success('Country added successfully!');
                setCountryName('');
                setValidationErrors({});
                fetchCountries();
            } else {
                throw new Error(response.message || 'Failed to add country.');
            }
        } catch (error) {
            console.error('Error adding country:', error);
            setError(error.message || 'Failed to add country');
        }
    };

    const handleCountryChangeForState = (countryId) => {
        setSelectedCountryState(countryId);
        setValidationErrors({});
    };

    const handleCountryChangeForCity = (countryId) => {
        setSelectedCountryCity(countryId);
        setSelectedState('');
        setValidationErrors({});
    };

    const handleStateChange = (stateId) => {
        setSelectedState(stateId);
        setValidationErrors({});
    };

    return (
        <>
            <Navbar />
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Typography variant="h4" component="h2" gutterBottom>
                    Create Location
                </Typography>

                {loading && (
                    <Box display="flex" justifyContent="center" my={4}>
                        <CircularProgress />
                    </Box>
                )}

                {error && (
                    <Typography color="error" gutterBottom>
                        {error}
                    </Typography>
                )}

                <Box sx={{ mb: 4 }}>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">Create Country</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <TextField
                                fullWidth
                                label="Country Name"
                                value={countryName}
                                onChange={(e) => setCountryName(e.target.value)}
                                margin="normal"
                                error={!!validationErrors.countryName}
                                helperText={validationErrors.countryName}
                            />
                            <Button variant="contained" onClick={createCountry} sx={{ mt: 2 }}>
                                Submit
                            </Button>
                        </AccordionDetails>
                    </Accordion>

                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">Create State</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <FormControl fullWidth margin="normal" error={!!validationErrors.country}>
                                <InputLabel>Select Country</InputLabel>
                                <Select
                                    value={selectedCountryState || ''}
                                    onChange={(e) => handleCountryChangeForState(e.target.value)}
                                    label="Select Country"
                                >
                                    <MenuItem value="">
                                        <em>None</em>
                                    </MenuItem>
                                    {countries.map((country) => (
                                        <MenuItem key={country.id} value={country.id}>
                                            {country.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {validationErrors.country && (
                                    <Typography variant="caption" color="error">
                                        {validationErrors.country}
                                    </Typography>
                                )}
                            </FormControl>
                            <TextField
                                fullWidth
                                label="State Name"
                                value={stateName}
                                onChange={(e) => setStateName(e.target.value)}
                                margin="normal"
                                error={!!validationErrors.stateName}
                                helperText={validationErrors.stateName}
                            />
                            <Button variant="contained" onClick={createState} sx={{ mt: 2 }}>
                                Submit
                            </Button>
                        </AccordionDetails>
                    </Accordion>

                    <Accordion style={{ marginBottom: '100px' }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">Create City</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Select Country</InputLabel>
                                <Select
                                    value={selectedCountryCity || ''}
                                    onChange={(e) => handleCountryChangeForCity(e.target.value)}
                                    label="Select Country"
                                >
                                    <MenuItem value="">
                                        <em>None</em>
                                    </MenuItem>
                                    {countries.map((country) => (
                                        <MenuItem key={country.id} value={country.id}>
                                            {country.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl fullWidth margin="normal" error={!!validationErrors.state}>
                                <InputLabel>Select State</InputLabel>
                                <Select
                                    value={selectedState || ''}
                                    onChange={(e) => handleStateChange(e.target.value)}
                                    label="Select State"
                                >
                                    <MenuItem value="">
                                        <em>None</em>
                                    </MenuItem>
                                    {states.map((state) => (
                                        <MenuItem key={state.id} value={state.id}>
                                            {state.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {validationErrors.state && (
                                    <Typography variant="caption" color="error">
                                        {validationErrors.state}
                                    </Typography>
                                )}
                            </FormControl>

                            <TextField
                                fullWidth
                                label="City Name"
                                value={cityName}
                                onChange={(e) => setCityName(e.target.value)}
                                margin="normal"
                                error={!!validationErrors.cityName}
                                helperText={validationErrors.cityName}
                            />
                            <Button variant="contained" onClick={createCity} sx={{ mt: 2 }}>
                                Submit
                            </Button>
                        </AccordionDetails>
                    </Accordion>
                </Box>
            </Container>
            <FooterComp />
            <ToastContainer position="top-right" autoClose={1000} />
        </>
    );
};

export default LocationComponent;
