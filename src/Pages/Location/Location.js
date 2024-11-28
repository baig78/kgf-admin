import React, { useEffect, useState } from 'react';
import Navbar from "../../Components/Navbar/Navbar";
import FooterComp from "../../Components/FooterComp/FooterComp";
import './Location.css';
import { addressService } from '../../service';
import { Button } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { TailSpin } from 'react-loader-spinner';
import { ExpandMore, ExpandLess } from '@mui/icons-material';

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
    const [showCountry, setShowCountry] = useState(false);
    const [showState, setShowState] = useState(false);
    const [showCity, setShowCity] = useState(false);
    const [countryName, setCountryName] = useState('');

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
            toast.error('Failed to load countries.');
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
            toast.error('Failed to load states.');
        } finally {
            setLoading(false);
        }
    };

    const createCity = async () => {
        if (!selectedState || !cityName) {
            toast.error('Please select state and enter city name');
            return;
        }

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
            } else {
                throw new Error(response.message || 'Failed to add city.');
            }
        } catch (error) {
            console.error('Error adding city:', error);
            toast.error(error.message || 'Failed to add city');
        }
    };

    const createState = async () => {
        if (!selectedCountryState || !stateName) {
            toast.error('Please select country and enter state name');
            return;
        }

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
            } else {
                throw new Error(response.message || 'Failed to add state.');
            }
        } catch (error) {
            console.error('Error adding state:', error);
            toast.error(error.message || 'Failed to add state');
        }
    };

    const createCountry = async () => {
        if (!countryName) {
            toast.error('Please enter country name');
            return;
        }

        try {
            const countryData = { name: countryName.trim() };
            const response = await addressService.addCountry(countryData);
            if (response.success) {
                toast.success('Country added successfully!');
                setCountryName('');
                fetchCountries(); // Refresh the countries list
            } else {
                throw new Error(response.message || 'Failed to add country.');
            }
        } catch (error) {
            console.error('Error adding country:', error);
            toast.error(error.message || 'Failed to add country');
        }
    };

    const handleCountryChangeForState = (countryId) => {
        setSelectedCountryState(countryId);
    };

    const handleCountryChangeForCity = (countryId) => {
        setSelectedCountryCity(countryId);
        setSelectedState('');
    };

    const handleStateChange = (stateId) => {
        setSelectedState(stateId);
    };

    return (
        <>
            <Navbar />
            <div className="location-container-top">
                <div className="location-container">
                    <h2>Create Location</h2>
                    {loading && (
                        <div className="loader-container">
                            <TailSpin height="80" width="80" color="#00ACC1" ariaLabel="loading" />
                        </div>
                    )}
                    {error && <p className="error">{error}</p>}

                    {/* Create Country Section */}
                    <div style={{ marginBottom: '30px', borderBottom: '1px solid #ddd', paddingBottom: '20px' }}>
                        <h3 onClick={() => setShowCountry(!showCountry)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            Create Country {showCountry ? <ExpandLess /> : <ExpandMore />}
                        </h3>
                        {showCountry && (
                            <>
                                <label>Country:</label>
                                <input
                                    value={countryName}
                                    onChange={(e) => setCountryName(e.target.value)}
                                    placeholder="Enter Country Name"
                                />
                                <Button onClick={createCountry}>Submit</Button>
                            </>
                        )}
                    </div>

                    {/* Create State Section */}
                    <div style={{ marginBottom: '30px', borderBottom: '1px solid #ddd', paddingBottom: '20px' }}>
                        <h3 onClick={() => setShowState(!showState)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            Create State {showState ? <ExpandLess /> : <ExpandMore />}
                        </h3>
                        {showState && (
                            <>
                                <label>Country:</label>
                                <select
                                    value={selectedCountryState || ''}
                                    onChange={(e) => handleCountryChangeForState(e.target.value)}
                                >
                                    <option value="">Select Country</option>
                                    {countries.map((country) => (
                                        <option key={country.id} value={country.id}>
                                            {country.name}
                                        </option>
                                    ))}
                                </select>
                                <label>State:</label>
                                <input
                                    value={stateName}
                                    onChange={(e) => setStateName(e.target.value)}
                                    placeholder="Enter State Name"
                                />
                                <Button onClick={createState}>Submit</Button>
                            </>
                        )}
                    </div>

                    {/* Create City Section */}
                    <div style={{ marginBottom: '30px' }}>
                        <h3 onClick={() => setShowCity(!showCity)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            Create City {showCity ? <ExpandLess /> : <ExpandMore />}
                        </h3>
                        {showCity && (
                            <>
                                <label>Country:</label>
                                <select
                                    value={selectedCountryCity || ''}
                                    onChange={(e) => handleCountryChangeForCity(e.target.value)}
                                >
                                    <option value="">Select Country</option>
                                    {countries.map((country) => (
                                        <option key={country.id} value={country.id}>
                                            {country.name}
                                        </option>
                                    ))}
                                </select>

                                <label>State:</label>
                                <select
                                    value={selectedState || ''}
                                    onChange={(e) => handleStateChange(e.target.value)}
                                >
                                    <option value="">Select State</option>
                                    {states.map((state) => (
                                        <option key={state.id} value={state.id}>
                                            {state.name}
                                        </option>
                                    ))}
                                </select>

                                <label>City:</label>
                                <input
                                    value={cityName}
                                    onChange={(e) => setCityName(e.target.value)}
                                    placeholder="Enter City Name"
                                />
                                <Button onClick={createCity}>Submit</Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <FooterComp />
            <ToastContainer position="top-right" autoClose={1000} />
        </>
    );
};

export default LocationComponent;
