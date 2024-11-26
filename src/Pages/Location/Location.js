import React, { useEffect, useState } from 'react';
import Navbar from "../../Components/Navbar/Navbar";
import FooterComp from "../../Components/FooterComp/FooterComp";
import './Location.css';
import { addressService } from '../../service';
import { Button } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { TailSpin } from 'react-loader-spinner';

const LocationComponent = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [selectedState, setSelectedState] = useState('');
    const [cityName, setCityName] = useState('');
    const [stateName, setStateName] = useState('');
    const [selectedCountryCity, setSelectedCountryCity] = useState('');
    const [selectedCountryState, setSelectedCountryState] = useState('');

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
        if (selectedCountry) {
            fetchStates(selectedCountry);
        } else {
            setStates([]);
        }
    }, [selectedCountry]);

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
        try {
            const cityData = { name: cityName, state: selectedState };
            const response = await addressService.addCity(cityData);
            if (response.success) {
                toast.success('City added successfully!');
                setCityName('');
                setSelectedState('');
            } else {
                throw new Error('Failed to add city.');
            }
        } catch (error) {
            console.error('Error adding city:', error);
            toast.error('Please add City.');
        }
    };

    const createState = async () => {
        try {
            const stateData = { name: stateName, country: selectedCountry };
            const response = await addressService.addState(stateData);
            if (response.success) {
                toast.success('State added successfully!');
                setStateName('');
                setSelectedCountry('');
            } else {
                throw new Error('Failed to add state.');
            }
        } catch (error) {
            console.error('Error adding state:', error);
            toast.error('Please enter State');
        }
    };

    const createCountry = async () => {
        try {
            const countryData = { name: selectedCountry };
            const response = await addressService.addCountry(countryData);
            if (response.success) {
                toast.success('Country added successfully!');
                setSelectedCountry('');
            } else {
                throw new Error('Failed to add country.');
            }
        } catch (error) {
            console.error('Error adding country:', error);
            toast.error('Please add Country.');
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
