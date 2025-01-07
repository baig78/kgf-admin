import React, { useEffect, useState } from 'react';
import Navbar from "../../Components/Navbar/Navbar";
import FooterComp from "../../Components/FooterComp/FooterComp";
import './Location.css';
import { addressService } from '../../service';
import { Button, Container, Typography, TextField, Select, MenuItem, FormControl, InputLabel, Box, Accordion, AccordionSummary, AccordionDetails, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
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
    const [openDeleteCityDialog, setOpenDeleteCityDialog] = useState(false);
    const [stateToDelete, setStateToDelete] = useState(null);
    const [cityToDelete, setCityToDelete] = useState(null);
    const [openDeleteVillageDialog, setOpenDeleteVillageDialog] = useState(false);
    const [villageToDelete, setVillageToDelete] = useState(null);
    const [openDeleteMandalDialog, setOpenDeleteMandalDialog] = useState(false);
    const [mandalToDelete, setMandalToDelete] = useState(null);
    const [cityMandals, setCityMandals] = useState([]);
    const [cityVillages, setCityVillages] = useState([]);


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
        const filteredVillages = villages.filter((villages: any) => villages.mandal === mandalId);
        setCityVillages(filteredVillages);
        try {
            const response = await addressService.getVillages(mandalId); // Fetch villages for a specific mandal
            setVillages(response);
        } catch (error) {
            console.error("Error fetching villages:", error);
        }
    };

    // useEffect(() => {
    //     fetchMandals();
    // }, []);


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
        const filteredMandals = mandals.filter((mandal: any) => mandal.city === cityId);
        setCityMandals(filteredMandals);
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
        fetchVillages(mandalId);
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
            const response = await addressService.deleteCountry(countryId);
            console.log('Delete response:', response); // Debugging
            toast.success(`${countryToDelete} deleted successfully!`);
            setCountries(prevCountries => prevCountries.filter(country => country.id !== countryId)); // Optimistic update
            await fetchCountries(); // Ensure the state reflects backend changes
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete country. Please try again.');
        } finally {
            setOpenDeleteDialog(false);
        }
    };


    const handleDeleteState = (stateName) => {
        setStateToDelete(stateName);
        setOpenDeleteStateDialog(true);
    };
    const handleDeleteCity = (cityName) => {
        setCityToDelete(cityName);
        setOpenDeleteCityDialog(true);
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
    const handleConfirmDeleteCity = async () => {
        try {
            const cityId = cities.find(city => city.name === cityToDelete)?.id; // Use optional chaining
            if (!cityId) {
                throw new Error('City ID not found');
            }
            await addressService.deleteCity(cityId);
            toast.success(`${cityToDelete} deleted successfully!`);
            fetchCities(); // Refresh the state list after deletion
        } catch (error) {
            console.error("Error during city deletion:", error);
            toast.error('Failed to delete city. Please try again.');
        } finally {
            setOpenDeleteCityDialog(false);
        }
    };

    const handleDeleteVillage = (villageName) => {
        setVillageToDelete(villageName);
        setOpenDeleteVillageDialog(true);
    };

    const handleConfirmDeleteVillage = async () => {
        try {
            const villageId = villages.find(village => village.name === villageToDelete)?._id;
            if (!villageId) {
                throw new Error('Village ID not found');
            }
            await addressService.deleteVillage(villageId);
            toast.success(`${villageToDelete} deleted successfully!`);
            fetchVillages(); // Refresh the village list after deletion
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

            const mandalId = mandals.find(mandal => mandal.name === mandalToDelete)?._id;
            if (!mandalId) {
                throw new Error('Mandal ID not found');
            }
            await addressService.deleteMandal(mandalId);
            toast.success(`Mandal deleted successfully!`);
            fetchMandals(); // Refresh the mandal list after deletion
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

                            {expandedAccordion === 'country' && countries.length > 0 && (
                                <Box sx={{ mt: 4 }}>
                                    <Typography variant="h6" gutterBottom>
                                        All Countries
                                    </Typography>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: 1,
                                        }}
                                    >
                                        {countries.sort((a, b) => a.name.localeCompare(b.name)).map((country) => (
                                            <Box
                                                key={country.id}
                                                sx={{
                                                    border: '1px solid #ccc',
                                                    borderRadius: 10,
                                                    paddingLeft: 1,
                                                    paddingRight: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                                }}
                                            >
                                                <Typography sx={{ marginRight: 1 }}>{country.name}</Typography>
                                                <IconButton
                                                    onClick={() => handleDeleteCountry(country.name)}
                                                    size="small"
                                                    color="error"
                                                >
                                                    <CloseIcon />
                                                </IconButton>
                                            </Box>
                                        ))}
                                    </Box>
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
                            <Button variant="contained" onClick={createState} sx={{ mt: 2 }} disabled={!selectedCountryState}>
                                Submit
                            </Button>

                            {selectedCountryState && (
                                <Box sx={{ mt: 4 }}>
                                    <Typography variant="h6" gutterBottom>
                                        States in Selected Country
                                    </Typography>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: 1,
                                        }}
                                    >
                                        {states.length > 0 ? (
                                            states.sort((a, b) => a.name.localeCompare(b.name))
                                                .map((state) => (
                                                    <Box
                                                        key={state.id}
                                                        sx={{
                                                            border: '1px solid #ccc',
                                                            borderRadius: 10,
                                                            paddingLeft: 1,
                                                            paddingRight: 1,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                                        }}
                                                    >
                                                        <Typography sx={{ marginRight: 1 }}>{state.name}</Typography>
                                                        <IconButton
                                                            onClick={() => handleDeleteState(state.name)}
                                                            size="small"
                                                            color="error"
                                                        >
                                                            <CloseIcon />
                                                        </IconButton>
                                                    </Box>
                                                ))
                                        ) : (
                                            <Typography>No states available for this country</Typography>
                                        )}
                                    </Box>
                                </Box>
                            )}
                        </AccordionDetails>
                    </Accordion>

                    <Accordion
                        expanded={expandedAccordion === 'city'}
                        onChange={() =>
                            setExpandedAccordion(expandedAccordion === 'city' ? null : 'city')
                        }
                    >
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
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: 1,
                                        }}
                                    >
                                        {cities.length > 0 ? (
                                            cities.sort((a, b) => a.name.localeCompare(b.name)).map((city) => (
                                                <Box
                                                    key={city.id}
                                                    sx={{
                                                        border: '1px solid #ccc',
                                                        borderRadius: 10,
                                                        paddingLeft: 1,
                                                        paddingRight: 1,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                                    }}
                                                >
                                                    <Typography sx={{ marginRight: 1 }}>{city.name}</Typography>
                                                    <IconButton
                                                        onClick={() => handleDeleteCity(city.name)}
                                                        size="small"
                                                        color="error"
                                                    >
                                                        <CloseIcon />
                                                    </IconButton>
                                                </Box>
                                            ))
                                        ) : (
                                            <Typography>No cities available for this state</Typography>
                                        )}
                                    </Box>
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
                                    value={selectedCity || ''}
                                    onChange={(e) => {
                                        handleCityChange(e.target.value);
                                        setSelectedMandal(''); // Reset selected Mandal when city changes
                                    }}
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
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: 1,
                                        }}
                                    >
                                        {cityMandals.length > 0 ? (
                                            cityMandals.sort((a, b) => a.name.localeCompare(b.name)).map((mandal) => (
                                                <Box
                                                    key={mandal._id}
                                                    sx={{
                                                        border: '1px solid #ccc',
                                                        borderRadius: 10,
                                                        paddingLeft: 1,
                                                        paddingRight: 1,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                                    }}
                                                >
                                                    <Typography sx={{ marginRight: 1 }}>{mandal.name}</Typography>
                                                    <IconButton
                                                        onClick={() => handleDeleteMandal(mandal.name)}
                                                        size="small"
                                                        color="error"
                                                    >
                                                        <CloseIcon />
                                                    </IconButton>
                                                </Box>
                                            ))
                                        ) : (
                                            <Typography>No mandals available for this city</Typography>
                                        )}
                                    </Box>
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
                                    {cityMandals.map((mandal) => (
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

                            {selectedCity && (
                                <Box sx={{ mt: 4 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Mandals in Selected City
                                    </Typography>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: 1,
                                        }}
                                    >
                                        {cityVillages.length > 0 ? (
                                            cityVillages.sort((a, b) => a.name.localeCompare(b.name)).map((village) => (
                                                <Box
                                                    key={village._id}
                                                    sx={{
                                                        border: '1px solid #ccc',
                                                        borderRadius: 10,
                                                        paddingLeft: 1,
                                                        paddingRight: 1,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                                    }}
                                                    aria-labelledby={`mandal-${village._id}`}
                                                >
                                                    <Typography sx={{ marginRight: 1 }} id={`mandal-${village._id}`}>
                                                        {village.name}
                                                    </Typography>
                                                    <IconButton
                                                        onClick={() => handleDeleteVillage(village.name)}
                                                        size="small"
                                                        color="error"
                                                        aria-label={`Delete mandal ${village.name}`}
                                                    >
                                                        <CloseIcon />
                                                    </IconButton>
                                                </Box>
                                            ))
                                        ) : (
                                            <Typography>No Village available for this mandal</Typography>
                                        )}
                                    </Box>
                                </Box>
                            )}

                        </AccordionDetails>
                    </Accordion>
                </Box>
            </Container>
            <FooterComp />
            <ToastContainer position="top-right" autoClose={1000} />
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>Delete Country</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                    Are you sure you want to delete the country &quot;{countryToDelete}&quot;?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={openDeleteStateDialog} onClose={() => setOpenDeleteStateDialog(false)}>
                <DialogTitle>Delete State</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                    Are you sure you want to delete state &quot;{stateToDelete}&quot;?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteStateDialog(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmDeleteState} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={openDeleteCityDialog} onClose={() => setOpenDeleteCityDialog(false)}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete {cityToDelete}?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteCityDialog(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmDeleteCity} color="primary">
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
                        Delete tes
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
