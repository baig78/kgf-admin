import React, { useEffect, useState } from 'react';
import Navbar from "../../Components/Navbar/Navbar";
import FooterComp from "../../Components/FooterComp/FooterComp";
import './Location.css';
import { addressService } from '../../service';
import { Button, Container, Typography, TextField, Select, MenuItem, FormControl, InputLabel, Box, Accordion, AccordionSummary, AccordionDetails, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const LocationComponent = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [selectedState, setSelectedState] = useState('');
    const [cityName, setCityName] = useState('');
    const [stateName, setStateName] = useState('');
    const [selectedCountryCity, setSelectedCountryCity] = useState('');
    const [selectedCountryState, setSelectedCountryState] = useState('');
    const [countryName, setCountryName] = useState('');
    const [mandalName, setMandalName] = useState("");
    const [selectedCity, setSelectedCity] = useState("");
    const [mandals, setMandals] = useState([]);
    const [villageName, setVillageName] = useState("");
    const [selectedMandal, setSelectedMandal] = useState("");
    const [validationErrors, setValidationErrors] = useState({});
    const [villages, setVillages] = useState([]);
    const [expandedAccordion, setExpandedAccordion] = useState(null); // Track which accordion is open
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [countryToDelete, setCountryToDelete] = useState(null);
    const [openDeleteStateDialog, setOpenDeleteStateDialog] = useState(false);
    const [stateToDelete, setStateToDelete] = useState(null);
    const [openDeleteVillageDialog, setOpenDeleteVillageDialog] = useState(false);
    const [villageToDelete, setVillageToDelete] = useState(null);
    const [openDeleteMandalDialog, setOpenDeleteMandalDialog] = useState(false);
    const [mandalToDelete, setMandalToDelete] = useState(null);

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
            uniqueCountries.sort((a, b) => a.name.localeCompare(b.name));
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

    useEffect(() => {
        if (selectedState) {
            fetchCities(selectedState);
        } else {
            setCities([]);
        }
    }, [selectedState]);

    useEffect(() => {
        if (selectedCountryState) {
            fetchStates(selectedCountryState);
        } else {
            setStates([]);
        }
    }, [selectedCountryState]);

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
            statesForCountry.sort((a, b) => a.name.localeCompare(b.name));
            setStates(statesForCountry);
        } catch (err) {
            console.error("Error fetching states:", err);
            setError('Failed to load states. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const fetchCities = async (stateId) => {
        setError('');
        setLoading(true);
        try {
            const response = await addressService.getCities(stateId);
            const citiesForState = response.reduce((acc, city) => {
                if (!acc.some(item => item.name === city.name)) {
                    acc.push({ id: city._id, name: city.name });
                }
                return acc;
            }, []);
            citiesForState.sort((a, b) => a.name.localeCompare(b.name));
            setCities(citiesForState);
        } catch (err) {
            console.error("Error fetching cities:", err);
            setError('Failed to load cities. Please try again later.');
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

    const isValidName = (name) => {
        const regex = /^[a-zA-Z\s]+$/; // Only allows letters and spaces
        return regex.test(name);
    };

    const createCity = async () => {
        if (!await validateCityData()) return;

        if (!isValidName(cityName)) {
            setValidationErrors(prev => ({ ...prev, cityName: 'City name must not contain special characters or numbers.' }));
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
                fetchCities(selectedState);
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

        if (!isValidName(stateName)) {
            setValidationErrors(prev => ({ ...prev, stateName: 'State name must not contain special characters or numbers.' }));
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
                fetchStates(selectedCountryState);
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

        if (!isValidName(countryName)) {
            setValidationErrors(prev => ({ ...prev, countryName: 'Country name must not contain special characters or numbers.' }));
            return;
        }

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

    const fetchVillages = async (mandalId) => {
        try {
            const response = await addressService.getVillages(mandalId); // Fetch villages for a specific mandal
            setVillages(response);
        } catch (error) {
            console.error("Error fetching villages:", error);
        }
    };

    useEffect(() => {
        fetchMandals();
    }, []);


    const validateVillageData = async () => {
        const errors = {};
        if (!selectedMandal) {
            errors.mandal = 'Please select a Mandal';
        }
        if (!villageName || villageName.trim() === '') {
            errors.villageName = 'Please enter a village name';
        } else if (villageName.trim().length < 2) {
            errors.villageName = 'Village name must be at least 2 characters long';
        } else {
            // Check if village already exists in selected mandal
            const villagesResponse = await addressService.getVillages(selectedMandal);
            if (villagesResponse.some(village => village.name.toLowerCase() === villageName.trim().toLowerCase())) {
                errors.villageName = 'This village already exists in the selected mandal';
            }
        }
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const createVillage = async () => {
        // Validate that a country, state, city, and mandal are selected
        if (!selectedCountryCity || !selectedState || !selectedCity || !selectedMandal) {
            setValidationErrors(prev => ({ ...prev, villageName: 'Please select a country, state, city, and mandal before adding a village.' }));
            return;
        }

        if (!await validateVillageData()) return;

        if (!isValidName(villageName)) {
            setValidationErrors(prev => ({ ...prev, villageName: 'Village name must not contain special characters or numbers.' }));
            return;
        }

        try {
            const villageData = [{
                name: villageName.trim(),
                mandal: selectedMandal,
            }];
            const response = await addressService.addVillage(villageData);
            if (response.success) {
                toast.success("Village added successfully!");
                setVillageName("");
                setSelectedMandal("");
                fetchVillages(selectedMandal);
            } else {
                throw new Error(response.message || "Failed to add village");
            }
        } catch (error) {
            console.error("Error adding village:", error);
            toast.error(error.message || "Failed to add village");
        }
    };

    const fetchMandals = async (cityId) => {
        try {
            const response = await addressService.getMandals(cityId);
            console.log(response, '-----m')
            setMandals(response);
        } catch (error) {
            console.error("Error fetching mandals:", error);
        }
    };

    const validateMandalData = async () => {
        const errors = {};
        if (!selectedCity) {
            errors.city = "Please select a city";
        } else {
            // Fetch city details when a city is selected
            try {
                const cityDetails = await addressService.getCities(selectedCity);
                if (!cityDetails) {
                    errors.city = "Selected city does not exist";
                }
            } catch (err) {
                console.error("Error fetching city details:", err);
                errors.city = "Error fetching city details";
            }
        }
        if (!mandalName || mandalName.trim() === "") {
            errors.mandalName = "Please enter a mandal name";
        } else if (mandalName.trim().length < 2) {
            errors.mandalName = "Mandal name must be at least 2 characters long";
        } else {
            // Check if mandal already exists in selected city
            const mandalsResponse = await addressService.getMandals(selectedCity);
            if (mandalsResponse.some(mandal => mandal.name.toLowerCase() === mandalName.trim().toLowerCase())) {
                errors.mandalName = 'This mandal already exists in the selected city';
            }
        }
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const createMandal = async () => {
        if (!await validateMandalData()) return;

        if (!isValidName(mandalName)) {
            setValidationErrors(prev => ({ ...prev, mandalName: 'Mandal name must not contain special characters or numbers.' }));
            return;
        }

        try {
            const mandalData = [{
                name: mandalName.trim(),
                city: selectedCity,
            }];
            const response = await addressService.addMandal(mandalData);
            if (response.success) {
                toast.success("Mandal added successfully!");
                setMandalName("");
                fetchMandals(selectedCity);
            } else {
                throw new Error(response.message || "Failed to add mandal");
            }
        } catch (error) {
            console.error("Error adding mandal:", error);
            toast.error(error.message || "Failed to add mandal");
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

    const handleMandalChange = (mandalId) => {
        setSelectedMandal(mandalId);
        setValidationErrors({});
        console.log(mandalId, '-----');

    };

    const handleCityChange = (cityId) => {
        setSelectedCity(cityId);
        fetchMandals(cityId);
    };

    const handleDeleteCountry = (countryName) => {
        setCountryToDelete(countryName);
        setOpenDeleteDialog(true);
    };

    const handleConfirmDelete = async () => {
        try {
            const countryId = countries.find(country => country.name === countryToDelete)?.id;
            if (!countryId) {
                throw new Error('Country ID not found');
            }
            await addressService.deleteCountry(countryId);
            toast.success(`${countryToDelete} deleted successfully!`);
            fetchCountries(); // Refresh the country list after deletion
        } catch (error) {
            toast.error('Failed to delete country. Please try again.');
        } finally {
            setOpenDeleteDialog(false);
        }
    };

    const handleDeleteState = (stateName) => {
        setStateToDelete(stateName);
        setOpenDeleteStateDialog(true);
    };

    const handleConfirmDeleteState = async () => {
        try {
            const stateId = states.find(state => state.name === stateToDelete)?.id; // Use optional chaining
            if (!stateId) {
                throw new Error('State ID not found');
            }
            await addressService.deleteState(stateId);
            toast.success(`${stateToDelete} deleted successfully!`);
            fetchStates(); // Refresh the state list after deletion
        } catch (error) {
            console.error("Error during state deletion:", error);
            toast.error('Failed to delete state. Please try again.');
        } finally {
            setOpenDeleteStateDialog(false);
        }
    };

    const handleDeleteVillage = (villageName) => {
        setVillageToDelete(villageName);
        setOpenDeleteVillageDialog(true);
    };

    const handleConfirmDeleteVillage = async () => {
        try {
            const villageId = villages.find(village => village.name === villageToDelete)?.id; // Use optional chaining
            if (!villageId) {
                throw new Error('Village ID not found');
            }
            await addressService.deleteVillage(villageId);
            toast.success(`${villageToDelete} deleted successfully!`);
            fetchVillages(selectedMandal); // Refresh the village list after deletion
        } catch (error) {
            console.error("Error during village deletion:", error);
            toast.error('Failed to delete village. Please try again.');
        } finally {
            setOpenDeleteVillageDialog(false);
        }
    };

    const handleDeleteMandal = (mandalId) => {
        setMandalToDelete(mandalId);
        setOpenDeleteMandalDialog(true);
    };

    const handleConfirmDeleteMandal = async () => {
        try {
            console.log("Attempting to delete mandal:", mandalToDelete);
            console.log("Available mandals:", mandals);

            const mandalId = mandalToDelete;
            if (!mandalId) {
                throw new Error('Mandal ID not found');
            }
            await addressService.deleteMandal(mandalId);
            toast.success(`Mandal deleted successfully!`);
            fetchMandals(selectedCity); // Refresh the mandal list after deletion
        } catch (error) {
            console.error("Error during mandal deletion:", error.response ? error.response.data : error);
            toast.error('Failed to delete mandal. Please try again.');
        } finally {
            setOpenDeleteMandalDialog(false);
        }
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
                    <Accordion expanded={expandedAccordion === 'country'} onChange={() => setExpandedAccordion(expandedAccordion === 'country' ? null : 'country')}>
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

                            {expandedAccordion === 'country' && (
                                <Box sx={{ mt: 4 }}>
                                    <Typography variant="h6" gutterBottom>
                                        All Countries
                                    </Typography>
                                    <Typography>
                                        {countries.sort((a, b) => a.name.localeCompare(b.name)).map(country => (
                                            <span
                                                key={country.id}
                                                onClick={() => handleDeleteCountry(country.name)}
                                                style={{ cursor: 'pointer', color: 'black', textDecoration: 'none', marginRight: '8px' }}
                                            >
                                                {country.name}
                                            </span>
                                        )).reduce((prev, curr) => [prev, ', ', curr])}
                                    </Typography>
                                </Box>
                            )}

                        </AccordionDetails>
                    </Accordion>

                    <Accordion expanded={expandedAccordion === 'state'} onChange={() => setExpandedAccordion(expandedAccordion === 'state' ? null : 'state')}>
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

                            {selectedCountryState && (
                                <Box sx={{ mt: 4 }}>
                                    <Typography variant="h6" gutterBottom>
                                        States in Selected Country
                                    </Typography>
                                    <Typography>
                                        {states.length > 0 ?
                                            states.sort((a, b) => a.name.localeCompare(b.name)).map(state => (
                                                <span
                                                    key={state.id}
                                                    onClick={() => handleDeleteState(state.name)}
                                                    style={{ cursor: 'pointer', color: 'black', textDecoration: 'none', marginRight: '8px' }}
                                                >
                                                    {state.name}
                                                </span>
                                            )).reduce((prev, curr) => [prev, ', ', curr])
                                            : 'No states available for this country'}
                                    </Typography>
                                </Box>
                            )}
                        </AccordionDetails>
                    </Accordion>

                    <Accordion expanded={expandedAccordion === 'city'} onChange={() => setExpandedAccordion(expandedAccordion === 'city' ? null : 'city')}>
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

                            {selectedState && (
                                <Box sx={{ mt: 4 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Cities in Selected State
                                    </Typography>
                                    <Typography>
                                        {cities.length > 0 ?
                                            cities.sort((a, b) => a.name.localeCompare(b.name)).map(city => (
                                                <span
                                                    key={city.id}
                                                    //  onClick={() => handleDeleteCity(city.name)}
                                                    style={{ cursor: 'pointer', color: 'black', textDecoration: 'none', marginRight: '8px' }}
                                                >
                                                    {city.name}
                                                </span>
                                            )).reduce((prev, curr) => [prev, ', ', curr])
                                            : 'No cities available for this state'}
                                    </Typography>
                                </Box>
                            )}
                        </AccordionDetails>
                    </Accordion>

                    <Accordion expanded={expandedAccordion === 'mandal'} onChange={() => setExpandedAccordion(expandedAccordion === 'mandal' ? null : 'mandal')}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">Create Mandal</Typography>
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

                            <FormControl fullWidth margin="normal" error={!!validationErrors.city}>
                                <InputLabel>Select City</InputLabel>
                                <Select
                                    value={selectedCity}
                                    onChange={(e) => {
                                        setSelectedCity(e.target.value);
                                        fetchMandals(e.target.value);
                                    }}
                                    error={!!validationErrors.city || ''}
                                >
                                    <MenuItem value="">
                                        <em>None</em>
                                    </MenuItem>
                                    {cities.map((city) => (
                                        <MenuItem key={city.id} value={city.id}>
                                            {city.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {validationErrors.city && (
                                    <Typography variant="caption" color="error">
                                        {validationErrors.city}
                                    </Typography>
                                )}
                            </FormControl>

                            <TextField
                                fullWidth
                                label="Mandal Name"
                                value={mandalName}
                                onChange={(e) => setMandalName(e.target.value)}
                                margin="normal"
                                error={!!validationErrors.mandalName}
                                helperText={validationErrors.mandalName}
                            />

                            <Button variant="contained" onClick={createMandal} sx={{ mt: 2 }}>
                                Submit
                            </Button>

                            {selectedCity && (
                                <Box sx={{ mt: 4 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Mandals in Selected City
                                    </Typography>
                                    <Typography>
                                        {mandals.length > 0 ?
                                            mandals.sort((a, b) => a.name.localeCompare(b.name)).map(mandal => (
                                                <span
                                                    key={mandal._id}
                                                    onClick={() => handleDeleteMandal(mandal.name)}
                                                    style={{ cursor: 'pointer', color: 'black', textDecoration: 'none', marginRight: '8px' }}
                                                >
                                                    {mandal.name}
                                                </span>
                                            )).reduce((prev, curr) => [prev, ', ', curr])
                                            : 'No mandals available for this city'}
                                    </Typography>
                                </Box>
                            )}
                        </AccordionDetails>
                    </Accordion>
                    <Accordion expanded={expandedAccordion === 'village'} onChange={() => setExpandedAccordion(expandedAccordion === 'village' ? null : 'village')} style={{ marginBottom: '100px' }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">Create Village</Typography>
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

                            <FormControl fullWidth margin="normal">
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
                            </FormControl>

                            <FormControl fullWidth margin="normal">
                                <InputLabel>Select City</InputLabel>
                                <Select
                                    value={selectedCity || ''}
                                    onChange={(e) => handleCityChange(e.target.value)}
                                    label="Select City"
                                >
                                    <MenuItem value="">
                                        <em>None</em>
                                    </MenuItem>
                                    {cities.map((city) => (
                                        <MenuItem key={city.id} value={city.id}>
                                            {city.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl fullWidth margin="normal">
                                <InputLabel>Select Mandal</InputLabel>
                                <Select
                                    value={selectedMandal || ''}
                                    onChange={(e) => handleMandalChange(e.target.value)}
                                    label="Select Mandal"
                                >
                                    <MenuItem value="">
                                        <em>None</em>
                                    </MenuItem>
                                    {mandals.map((mandal) => (
                                        <MenuItem key={mandal._id} value={mandal._id}>
                                            {mandal.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <TextField
                                fullWidth
                                label="Village Name"
                                value={villageName}
                                onChange={(e) => setVillageName(e.target.value)}
                                margin="normal"
                                error={!!validationErrors.villageName}
                                helperText={validationErrors.villageName}
                            />

                            <Button variant="contained" onClick={createVillage} sx={{ mt: 2 }}>
                                Submit
                            </Button>

                            {selectedMandal && (
                                <Box sx={{ mt: 4 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Villages in Selected Mandal
                                    </Typography>
                                    <Typography>
                                        {villages.length > 0 ?
                                            villages.sort((a, b) => a.name.localeCompare(b.name)).map(village => (
                                                <span
                                                    key={village.id}
                                                    onClick={() => handleDeleteVillage(village.name)}
                                                    style={{ cursor: 'pointer', color: 'black', textDecoration: 'none', marginRight: '8px' }}
                                                >
                                                    {village.name}
                                                </span>
                                            )).reduce((prev, curr) => [prev, ', ', curr])
                                            : 'No villages available for this mandal'}
                                    </Typography>
                                </Box>
                            )}
                        </AccordionDetails>
                    </Accordion>
                </Box>
            </Container>
            <FooterComp />
            <ToastContainer position="top-right" autoClose={1000} />
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete {countryToDelete}?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmDelete} color="primary">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={openDeleteStateDialog} onClose={() => setOpenDeleteStateDialog(false)}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete {stateToDelete}?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteStateDialog(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmDeleteState} color="primary">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={openDeleteVillageDialog} onClose={() => setOpenDeleteVillageDialog(false)}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete {villageToDelete}?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteVillageDialog(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmDeleteVillage} color="primary">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={openDeleteMandalDialog} onClose={() => setOpenDeleteMandalDialog(false)}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete {mandalToDelete}?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteMandalDialog(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmDeleteMandal} color="primary">
                        Delete1
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default LocationComponent;
