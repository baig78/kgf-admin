import React, { useEffect, useState } from 'react';
import Navbar from "../../Components/Navbar/Navbar";
import FooterComp from "../../Components/FooterComp/FooterComp";
import './Location.css';
import { getAllCountries, getAllStates, addCity, addState, addCountry } from '../../service';
import { Button } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { TailSpin } from 'react-loader-spinner';  // Importing TailSpin loader

const LocationComponent = () => {
    // State variables for the location creation process
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState(null); // Use null instead of empty string
    const [selectedState, setSelectedState] = useState('');
    const [cityName, setCityName] = useState('');
    const [stateName, setStateName] = useState('');
    const [selectedCountryCity, setSelectedCountryCity] = useState('');
    const [selectedCountryState, setSelectedCountryState] = useState('');

    // Fetch countries on component mount
    useEffect(() => {
        fetchCountries();
    }, []);

    // Fetch all countries
    const fetchCountries = async () => {
        setError('');
        setLoading(true);
        try {
            const response = await getAllCountries();
            const rawData = response?.data || response;
            if (!Array.isArray(rawData)) {
                throw new Error('Unexpected API response format');
            }
            // Filter out duplicate countries
            const uniqueCountries = rawData.reduce((acc, country) => {
                if (!acc.some(item => item.name === country.name)) {
                    acc.push({ id: country._id, name: country.name });
                }
                return acc;
            }, []);
            setCountries(uniqueCountries);
        } catch (err) {
            console.error("Error fetching countries:", err.message || err);
            setError('Failed to load countries. Please try again later.');
            toast.error('Failed to load countries.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch states based on selected country
    useEffect(() => {
        if (selectedCountry) {
            fetchStates(selectedCountry);
        } else {
            setStates([]);  // Reset states when country is not selected
        }
    }, [selectedCountry]); // Trigger when selectedCountry changes

    // Fetch states based on selected city country
    useEffect(() => {
        if (selectedCountryCity) {
            fetchStates(selectedCountryCity);
        } else {
            setStates([]); // Clear states if no country is selected
        }
    }, [selectedCountryCity]);

    // Fetch states for a given country
    const fetchStates = async (countryId) => {
        setError('');
        setLoading(true);
        try {
            const response = await getAllStates(countryId);
            const rawData = response?.data || response;
            if (!Array.isArray(rawData)) {
                throw new Error('Unexpected API response format');
            }
            // Filter out states for the selected country
            const statesForCountry = rawData.filter(state => state.country === countryId)
                .reduce((acc, state) => {
                    if (!acc.some(item => item.name === state.name)) {
                        acc.push({ id: state._id, name: state.name });
                    }
                    return acc;
                }, []);
            setStates(statesForCountry);
        } catch (err) {
            console.error("Error fetching states:", err.message || err);
            setError('Failed to load states. Please try again later.');
            toast.error('Failed to load states.');
        } finally {
            setLoading(false);
        }
    };

    // Create a new city
    const createCity = async () => {
        try {
            const cityData = { name: cityName, state: selectedState };
            const response = await addCity([cityData]);
            if (response.success) {
                toast.success('City added successfully!');
                setCityName('');
                setSelectedState('');
            } else {
                throw new Error('Failed to add city.');
            }
        } catch (error) {
            console.error('Error adding city:', error.message || error);
            toast.error('Please add City.');
        }
    };

    // Create a new state
    const createState = async () => {
        try {
            const stateData = { name: stateName, country: selectedCountry };
            const response = await addState([stateData]);
            if (response.success) {
                toast.success('State added successfully!');
                setStateName('');
                setSelectedCountry('');
            } else {
                throw new Error('Failed to add state.');
            }
        } catch (error) {
            console.error('Error adding state:', error.message || error);
            toast.error('Please enter State');
        }
    };

    // Create a new country
    const createCountry = async () => {
        try {
            const countryData = { name: selectedCountry };
            const response = await addCountry([countryData]);
            if (response.success) {
                toast.success('Country added successfully!');
                setSelectedCountry('');
            } else {
                throw new Error('Failed to add country.');
            }
        } catch (error) {
            console.error('Error adding country:', error.message || error);
            toast.error('Please add Country.');
        }
    };

    // Handle country change for state creation
    const handleCountryChangeForState = (countryId) => {
        setSelectedCountryState(countryId);
    };

    // Handle country change for city creation
    const handleCountryChangeForCity = (countryId) => {
        setSelectedCountryCity(countryId);
        setSelectedState(''); // Reset state selection when country changes in Create City
    };

    // Handle state change for city creation
    const handleStateChange = (stateId) => {
        setSelectedState(stateId); // Update selected state
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
                    <div>
                        <h3>Create Country</h3>
                        <label>Country:</label>
                        <input
                            placeholder="Enter Country Name"
                        />
                        <Button onClick={createCountry}>Submit</Button>
                    </div>

                    {/* Create State Section */}
                    <div>
                        <h3>Create State</h3>
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
                    </div>

                    {/* Create City Section */}
                    <div>
                        <h3>Create City</h3>
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
                    </div>
                </div>
            </div>
            <FooterComp />
            <ToastContainer position="top-right" autoClose={1000} />
        </>
    );
};

export default LocationComponent;
