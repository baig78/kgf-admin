import React, { useEffect, useState } from 'react';
import Navbar from '../../Components/Navbar/Navbar';
import FooterComp from '../../Components/FooterComp/FooterComp';
import './Location.css';
import { addressService } from '../../service';
import {
  Button,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Tabs,
  Tab,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import * as XLSX from 'xlsx';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import { LoadingButton } from '@mui/lab';
const Geocode = require('react-geocode');

// Ensure proper initialization of Geocode
if (Geocode && Geocode.default) {
  // Set Google Maps API key (replace with your actual API key)
  Geocode.default.setApiKey('YOUR_GOOGLE_MAPS_API_KEY');
  Geocode.default.setLanguage('en');
  Geocode.default.setRegion('in');
} else {
  console.error('Geocode is not properly imported or initialized');
}

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
  const [mandalName, setMandalName] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [mandals, setMandals] = useState([]);
  const [villageName, setVillageName] = useState('');
  const [selectedMandal, setSelectedMandal] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [villages, setVillages] = useState([]);
  const [expandedAccordion, setExpandedAccordion] = useState(null); // Track which accordion is open
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [countryToDelete, setCountryToDelete] = useState(null);
  const [openDeleteStateDialog, setOpenDeleteStateDialog] = useState(false);
  const [stateToDelete, setStateToDelete] = useState(null);
  const [openDeleteCityDialog, setOpenDeleteCityDialog] = useState(false);
  const [cityToDelete, setCityToDelete] = useState(null);
  const [openDeleteVillageDialog, setOpenDeleteVillageDialog] = useState(false);
  const [villageToDelete, setVillageToDelete] = useState(null);
  const [openDeleteMandalDialog, setOpenDeleteMandalDialog] = useState(false);
  const [mandalToDelete, setMandalToDelete] = useState(null);
  const [cityMandals, setCityMandals] = useState([]);
  const [cityVillages, setCityVillages] = useState([]);
  const [fileLoading, setFileLoading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState(null);
  const [fullAddress, setFullAddress] = useState({
    state: '',
    district: '',
    village: '',
    fullAddressString: '',
  });

  const resetLocationForm = () => {
    setCountryName('');
    setStateName('');
    setCityName('');
    setMandalName('');
    setVillageName('');
    setSelectedCountryState('');
    setSelectedCountryCity('');
    setSelectedState('');
    setSelectedCity('');
    setSelectedMandal('');
    setValidationErrors({});
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await addressService.getCountries();
      const uniqueCountries = response.reduce((acc, country) => {
        if (!acc.some((item) => item.name === country.name)) {
          acc.push({ id: country._id, name: country.name });
        }
        return acc;
      }, []);
      uniqueCountries.sort((a, b) => a.name.localeCompare(b.name));
      setCountries(uniqueCountries);
    } catch (err) {
      console.error('Error fetching countries:', err);
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
        if (!acc.some((item) => item.name === state.name)) {
          acc.push({ id: state._id, name: state.name });
        }
        return acc;
      }, []);
      statesForCountry.sort((a, b) => a.name.localeCompare(b.name));
      setStates(statesForCountry);
    } catch (err) {
      console.error('Error fetching states:', err);
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
        if (!acc.some((item) => item.name === city.name)) {
          acc.push({ id: city._id, name: city.name });
        }
        return acc;
      }, []);
      citiesForState.sort((a, b) => a.name.localeCompare(b.name));
      setCities(citiesForState);
    } catch (err) {
      console.error('Error fetching districts:', err);
      setError('Failed to load districts. Please try again later.');
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
      errors.cityName = 'Please enter a district name';
    } else if (cityName.trim().length < 2) {
      errors.cityName = 'District name must be at least 2 characters long';
    }

    // Check if city already exists in selected state
    try {
      const cities = await addressService.getCities(selectedState);
      if (cities.some((city) => city.name.toLowerCase() === cityName.trim().toLowerCase())) {
        errors.cityName = 'This city already exists in the selected state';
      }
    } catch (err) {
      console.error('Error checking city existence:', err);
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidName = (name) => {
    const regex = /^[a-zA-Z\s]+$/; // Only allows letters and spaces
    return regex.test(name);
  };

  const createCity = async () => {
    if (!(await validateCityData())) return;

    if (!isValidName(cityName)) {
      setValidationErrors((prev) => ({
        ...prev,
        cityName: 'District name must not contain special characters or numbers.',
      }));
      return;
    }

    try {
      const cityData = { name: cityName.trim(), state: selectedState };
      const response = await addressService.addCity(cityData);
      if (response.success) {
        toast.success('City added successfully!');
        resetLocationForm();
        fetchCities(selectedState);
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
      if (
        statesResponse.some((state) => state.name.toLowerCase() === stateName.trim().toLowerCase())
      ) {
        errors.stateName = 'This state already exists in the selected country';
      }
    } catch (err) {
      console.error('Error checking state existence:', err);
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const createState = async () => {
    if (!(await validateStateData())) return;

    if (!isValidName(stateName)) {
      setValidationErrors((prev) => ({
        ...prev,
        stateName: 'State name must not contain special characters or numbers.',
      }));
      return;
    }

    try {
      const stateData = { name: stateName.trim(), country: selectedCountryState };
      const response = await addressService.addState(stateData);
      if (response.success) {
        toast.success('State added successfully!');
        resetLocationForm();
        fetchStates(selectedCountryState);
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
    } else if (
      countries.some((country) => country.name.toLowerCase() === countryName.trim().toLowerCase())
    ) {
      errors.countryName = 'This country already exists';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const createCountry = async () => {
    if (!validateCountryData()) return;

    if (!isValidName(countryName)) {
      setValidationErrors((prev) => ({
        ...prev,
        countryName: 'Country name must not contain special characters or numbers.',
      }));
      return;
    }

    try {
      const countryData = { name: countryName.trim() };
      const response = await addressService.addCountry(countryData);
      if (response.success) {
        toast.success('Country added successfully!');
        resetLocationForm();
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

      // Set the full list of villages
      setVillages(response);

      // Filter villages for the selected mandal
      const filteredVillages = response.filter((village) => village.mandal === mandalId);
      setCityVillages(filteredVillages);
    } catch (error) {
      console.error('Error fetching villages:', error);
      setCityVillages([]); // Ensure cityVillages is reset on error
    }
  };

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
      if (
        villagesResponse.some(
          (village) => village.name.toLowerCase() === villageName.trim().toLowerCase()
        )
      ) {
        errors.villageName = 'This village already exists in the selected mandal';
      }
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const createVillage = async () => {
    // Validate that a country, state, city, and mandal are selected
    if (!selectedCountryCity || !selectedState || !selectedCity || !selectedMandal) {
      setValidationErrors((prev) => ({
        ...prev,
        villageName: 'Please select a country, state, city, and mandal before adding a village.',
      }));
      return;
    }

    if (!(await validateVillageData())) return;

    if (!isValidName(villageName)) {
      setValidationErrors((prev) => ({
        ...prev,
        villageName: 'Village name must not contain special characters or numbers.',
      }));
      return;
    }

    try {
      const villageData = [{ name: villageName.trim(), mandal: selectedMandal }];
      const response = await addressService.addVillage(villageData);
      if (response.success) {
        toast.success('Village added successfully!');
        resetLocationForm();
        fetchVillages(selectedMandal);
      } else {
        throw new Error(response.message || 'Failed to add village');
      }
    } catch (error) {
      console.error('Error adding village:', error);
      toast.error(error.message || 'Failed to add village');
    }
  };

  const fetchMandals = async (cityId) => {
    try {
      const response = await addressService.getMandals(cityId);
      console.log(response, '-----m');

      // Set the full list of mandals
      setMandals(response);

      // Filter mandals for the selected Dirstict
      const filteredMandals = response.filter((mandal) => mandal.city === cityId);
      setCityMandals(filteredMandals);
    } catch (error) {
      console.error('Error fetching mandals:', error);
      setCityMandals([]); // Ensure cityMandals is reset on error
    }
  };

  const validateMandalData = async () => {
    const errors = {};
    if (!selectedCity) {
      errors.city = 'Please select a city';
    } else {
      // Fetch city details when a city is selected
      try {
        const cityDetails = await addressService.getCities(selectedCity);
        if (!cityDetails) {
          errors.city = 'Selected district does not exist';
        }
      } catch (err) {
        console.error('Error fetching city details:', err);
        errors.city = 'Error fetching city details';
      }
    }
    if (!mandalName || mandalName.trim() === '') {
      errors.mandalName = 'Please enter a mandal name';
    } else if (mandalName.trim().length < 2) {
      errors.mandalName = 'Mandal name must be at least 2 characters long';
    } else {
      // Check if mandal already exists in selected District
      const mandalsResponse = await addressService.getMandals(selectedCity);
      if (
        mandalsResponse.some(
          (mandal) => mandal.name.toLowerCase() === mandalName.trim().toLowerCase()
        )
      ) {
        errors.mandalName = 'This mandal already exists in the selected district';
      }
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const createMandal = async () => {
    if (!(await validateMandalData())) return;

    if (!isValidName(mandalName)) {
      setValidationErrors((prev) => ({
        ...prev,
        mandalName: 'Mandal name must not contain special characters or numbers.',
      }));
      return;
    }

    try {
      const mandalData = [{ name: mandalName.trim(), city: selectedCity }];
      const response = await addressService.addMandal(mandalData);
      if (response.success) {
        toast.success('Mandal added successfully!');
        resetLocationForm();
        fetchMandals(selectedCity);
      } else {
        throw new Error(response.message || 'Failed to add mandal');
      }
    } catch (error) {
      console.error('Error adding mandal:', error);
      toast.error(error.message || 'Failed to add mandal');
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
      const countryId = countries.find((country) => country.name === countryToDelete)?.id;
      if (!countryId) {
        throw new Error('Country ID not found');
      }
      const response = await addressService.deleteCountry(countryId);
      console.log('Delete response:', response); // Debugging
      toast.success(`${countryToDelete} deleted successfully!`);
      setCountries((prevCountries) => prevCountries.filter((country) => country.id !== countryId)); // Optimistic update
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
      const stateId = states.find((state) => state.name === stateToDelete)?.id; // Use optional chaining
      if (!stateId) {
        throw new Error('State ID not found');
      }
      await addressService.deleteState(stateId);
      toast.success(`${stateToDelete} deleted successfully!`);
      fetchStates(); // Refresh the state list after deletion
    } catch (error) {
      console.error('Error during state deletion:', error);
      toast.error('Failed to delete state. Please try again.');
    } finally {
      setOpenDeleteStateDialog(false);
    }
  };
  const handleConfirmDeleteCity = async () => {
    try {
      const cityId = cities.find((city) => city.name === cityToDelete)?.id; // Use optional chaining
      if (!cityId) {
        throw new Error('City ID not found');
      }
      await addressService.deleteCity(cityId);
      toast.success(`${cityToDelete} deleted successfully!`);
      fetchCities(); // Refresh the state list after deletion
    } catch (error) {
      console.error('Error during city deletion:', error);
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
      const villageId = villages.find((village) => village.name === villageToDelete)?._id;
      if (!villageId) {
        throw new Error('Village ID not found');
      }
      await addressService.deleteVillage(villageId);
      toast.success(`${villageToDelete} deleted successfully!`);
      fetchVillages(); // Refresh the village list after deletion
    } catch (error) {
      console.error('Error during village deletion:', error);
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
      console.log('Attempting to delete mandal:', mandalToDelete);
      console.log('Available mandals:', mandals);

      const mandalId = mandals.find((mandal) => mandal.name === mandalToDelete)?._id;
      if (!mandalId) {
        throw new Error('Mandal ID not found');
      }
      await addressService.deleteMandal(mandalId);
      toast.success(`Mandal deleted successfully!`);
      fetchMandals(); // Refresh the mandal list after deletion
    } catch (error) {
      console.error('Error during mandal deletion:', error.response ? error.response.data : error);
      toast.error('Failed to delete mandal. Please try again.');
    } finally {
      setOpenDeleteMandalDialog(false);
    }
  };

  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const [locationXclData, setLoactaionXclData] = useState([]);
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFileName(file.name);
      setFileLoading(true);

      const reader = new FileReader();
      reader.readAsBinaryString(file);

      reader.onload = (e) => {
        try {
          const data = e.target.result;
          const workbook = XLSX.read(data, { type: 'binary' });

          // Assuming data is in the first sheet
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];

          // Convert sheet data to JSON
          const rawData = XLSX.utils.sheet_to_json(sheet);
          //   const formattedData = transformData(rawData)
          setLoactaionXclData(rawData?.length > 0 ? rawData : []);
          // Success toast
          toast.success('Excel file uploaded successfully!', {
            position: 'top-right',
            autoClose: 3000,
          });
        } catch (error) {
          // Error toast
          toast.error('Error uploading Excel file', { position: 'top-right', autoClose: 3000 });
          console.error('File upload error:', error);
        } finally {
          // Stop loading
          setFileLoading(false);
        }
      };

      reader.onerror = (error) => {
        // Error toast
        toast.error('Error reading file', { position: 'top-right', autoClose: 3000 });
        console.error('File read error:', error);
        setFileLoading(false);
      };
    }
  };

  const [locationLoading, setLoactionLoading] = useState(false);
  const handleUploadXcelData = async () => {
    try {
      setLoactionLoading(true);
      await addressService.uploadExcelData(locationXclData);
      toast.success('Data saved sucessfully');
      setLoactaionXclData([]);
      setSelectedFileName('');
    } finally {
      setLoactionLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const template = [
      ['Country', 'State', 'District', 'Mandal', 'Village'],
      ['India', 'Telangana', 'Hyderabad', 'Mandal1', 'Village1'],
      ['India', 'Telangana', 'Hyderabad', 'Mandal1', 'Village2'],
      ['India', 'Telangana', 'Hyderabad', 'Mandal2', 'Village3'],
      ['India', 'Telangana', 'Hyderabad', 'Mandal2', 'Village4'],
    ];

    const ws = XLSX.utils.aoa_to_sheet(template);

    // Make header row bold
    if (ws['!cols']) {
      ws['!cols'] = ws['!cols'] || [];
    }
    ws['A1'].s = { font: { bold: true } };
    ws['B1'].s = { font: { bold: true } };
    ws['C1'].s = { font: { bold: true } };
    ws['D1'].s = { font: { bold: true } };

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
    const data = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_template.xlsx';
    a.click();
  };

  // Function to transform flat Excel data into hierarchical JSON
  const transformData = (data) => {
    const result = { state: 'TS', districts: [] };

    data.forEach(({ State, District, Mandal, Village }) => {
      let districtObj = result.districts.find((d) => d.district === District);
      if (!districtObj) {
        districtObj = { district: District, mandals: [] };
        result.districts.push(districtObj);
      }

      let mandalObj = districtObj.mandals.find((m) => m.mandal === Mandal);
      if (!mandalObj) {
        mandalObj = { mandal: Mandal, villages: [] };
        districtObj.mandals.push(mandalObj);
      }

      if (!mandalObj.villages.some((v) => v.village === Village)) {
        mandalObj.villages.push({ village: Village });
      }
    });

    return result;
  };

  useEffect(() => {
    if (Geocode && Geocode.default) {
      const GeocodeInstance = Geocode.default;
      GeocodeInstance.setApiKey('YOUR_GOOGLE_MAPS_API_KEY');
      GeocodeInstance.setLanguage('en');
      GeocodeInstance.setRegion('in');
    }
  }, []);

  const handleGetFullAddress = (lat, lng) => {
    // Ensure we're using the correct Geocode instance
    const GeocodeInstance = Geocode.default || Geocode;

    if (!GeocodeInstance || !GeocodeInstance.fromLatLng) {
      console.error('Geocode is not properly initialized');
      return;
    }

    GeocodeInstance.fromLatLng(lat, lng).then(
      (response) => {
        const address = response.results[0];

        // Extract specific address components
        const addressComponents = address.address_components;

        const state =
          addressComponents.find((component) =>
            component.types.includes('administrative_area_level_1')
          )?.long_name || '';

        const district =
          addressComponents.find((component) =>
            component.types.includes('administrative_area_level_2')
          )?.long_name || '';

        const village =
          addressComponents.find((component) => component.types.includes('locality'))?.long_name ||
          '';

        setFullAddress({ state, district, village, fullAddressString: address.formatted_address });
      },
      (error) => {
        console.error('Geocoding error:', error);
        // Fallback to OpenStreetMap if Google Geocoding fails
        handleFallbackGeocoding(lat, lng);
      }
    );
  };

  const handleFallbackGeocoding = (latitude, longitude) => {
    fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`
    )
      .then((response) => response.json())
      .then((data) => {
        const address = data.address;
        setFullAddress({
          state: address.state || address.province || '',
          district: address.county || '',
          village: address.village || address.town || address.city || '',
          fullAddressString: data.display_name,
        });
      })
      .catch((error) => {
        console.error('Error getting address details:', error);
      });
  };

  const handleGetLocationDetails = () => {
    // Assuming you want to use current location or a selected location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // Call function to get full address
        handleGetFullAddress(latitude, longitude);
      },
      (error) => {
        console.error('Error getting location', error);
      }
    );
  };

  const boxStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    p: 3,
    border: '2px dashed',
    borderColor: 'primary.main',
    borderRadius: 2,
    backgroundColor: '#ffffff',
    width: 350,
    height: 180,
    gap: 2,
    textAlign: 'center',
  };

  return (
    <>
      <Navbar />
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
      <div className="title">Create Location</div>

      <Box sx={{ width: '1400px', margin: 'auto' }}>
        <Tabs value={value} onChange={handleChange} aria-label="mui tabs">
          <Tab label="Enter Location Manually" sx={{ textTransform: 'capitalize' }} />
          <Tab label="Upload CSV" sx={{ textTransform: 'capitalize' }} />
        </Tabs>

        <Box sx={{ p: 2 }}>
          {value === 0 && (
            <div className="coordinator-form-table" style={{ padding: '0px' }}>
              <Box sx={{ mb: 4 }}>
                <Accordion
                  expanded={expandedAccordion === 'country'}
                  onChange={() =>
                    setExpandedAccordion(expandedAccordion === 'country' ? null : 'country')
                  }
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ borderRadius: 0, fontSize: '1rem' }} variant="h6">
                      Create Country
                    </Typography>
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
                        <Typography sx={{ fontSize: '1rem' }} variant="h6" gutterBottom>
                          All Countries
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {countries
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map((country) => (
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

                <Accordion
                  expanded={expandedAccordion === 'state'}
                  onChange={() =>
                    setExpandedAccordion(expandedAccordion === 'state' ? null : 'state')
                  }
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ borderRadius: 0, fontSize: '1rem' }} variant="h6">
                      Create State
                    </Typography>
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
                    <Button
                      variant="contained"
                      onClick={createState}
                      sx={{ mt: 2 }}
                      disabled={!selectedCountryState}
                    >
                      Submit
                    </Button>

                    {selectedCountryState && (
                      <Box sx={{ mt: 4 }}>
                        <Typography sx={{ fontSize: '1rem' }} variant="h6" gutterBottom>
                          States in Selected Country
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {states.length > 0 ? (
                            states
                              .sort((a, b) => a.name.localeCompare(b.name))
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
                    <Typography sx={{ borderRadius: 0, fontSize: '1rem' }} variant="h6">
                      Create District
                    </Typography>
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
                      label="District Name"
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
                        <Typography sx={{ fontSize: '1rem' }} variant="h6" gutterBottom>
                          Districts in Selected State
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {cities.length > 0 ? (
                            cities
                              .sort((a, b) => a.name.localeCompare(b.name))
                              .map((city) => (
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
                            <Typography>No districts available for this state</Typography>
                          )}
                        </Box>
                      </Box>
                    )}
                  </AccordionDetails>
                </Accordion>

                <Accordion
                  expanded={expandedAccordion === 'mandal'}
                  onChange={() =>
                    setExpandedAccordion(expandedAccordion === 'mandal' ? null : 'mandal')
                  }
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ borderRadius: 0, fontSize: '1rem' }} variant="h6">
                      Create Mandal
                    </Typography>
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
                      <InputLabel>Select District</InputLabel>
                      <Select
                        value={selectedCity || ''}
                        onChange={(e) => {
                          handleCityChange(e.target.value);
                          setSelectedMandal(''); // Reset selected Mandal when city changes
                        }}
                        label="Select District"
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
                        <Typography sx={{ fontSize: '1rem' }} variant="h6" gutterBottom>
                          Mandals in Selected District
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {cityMandals.length > 0 ? (
                            cityMandals
                              .sort((a, b) => a.name.localeCompare(b.name))
                              .map((mandal) => (
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
                <Accordion
                  expanded={expandedAccordion === 'village'}
                  onChange={() =>
                    setExpandedAccordion(expandedAccordion === 'village' ? null : 'village')
                  }
                  style={{ marginBottom: '100px' }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ borderRadius: 0, fontSize: '1rem' }} variant="h6">
                      Create Village
                    </Typography>
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
                      <InputLabel>Select District</InputLabel>
                      <Select
                        value={selectedCity || ''}
                        onChange={(e) => handleCityChange(e.target.value)}
                        label="Select District"
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
                        <Typography sx={{ fontSize: '1rem' }} variant="h6" gutterBottom>
                          Villages in Selected Mandal
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {cityVillages.length > 0 ? (
                            cityVillages
                              .sort((a, b) => a.name.localeCompare(b.name))
                              .map((village) => (
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
                {/* <Button 
                                variant="contained" 
                                onClick={handleGetLocationDetails}
                            >
                                Get Location Details
                            </Button>
                            {fullAddress.fullAddressString && (
                                <div>
                                    <Typography>Full Address: {fullAddress.fullAddressString}</Typography>
                                    <Typography>State: {fullAddress.state}</Typography>
                                    <Typography>District: {fullAddress.district}</Typography>
                                    <Typography>Village: {fullAddress.village}</Typography>
                                </div>
                            )} */}
              </Box>
            </div>
          )}
          {value === 1 && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <Box
                sx={{
                  ...boxStyles,
                  flexDirection: 'column',
                  justifyContent: 'center',
                  border: '0px ',
                  backgroundColor: 'none',
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Download Excel Template
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<CloudDownloadIcon />}
                  onClick={handleDownloadTemplate}
                >
                  Download
                </Button>
              </Box>
              <Box
                sx={{
                  ...boxStyles,
                  flexDirection: 'column',
                  '&.dragover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    borderColor: 'primary.main',
                  },
                }}
                // drag and drop function --- start

                // onDragOver={(e) => {
                //     e.preventDefault();
                //     e.stopPropagation();
                //     e.currentTarget.classList.add('dragover');
                // }}
                // onDragLeave={(e) => {
                //     e.preventDefault();
                //     e.stopPropagation();
                //     e.currentTarget.classList.remove('dragover');
                // }}
                // onDrop={(e) => {
                //     e.preventDefault();
                //     e.stopPropagation();
                //     e.currentTarget.classList.remove('dragover');

                //     const files = e.dataTransfer.files;
                //     if (files.length > 0) {
                //         const file = files[0];
                //         if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                //             const input = document.getElementById('raised-button-file');
                //             input.files = files;
                //             handleFileUpload({ target: input });
                //         } else {
                //             alert('Please upload only Excel files (.xlsx or .xls)');
                //         }
                //     }
                // }}
                // drag and drop function -------- end
              >
                <Typography variant="h6" gutterBottom>
                  Upload Excel File
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <input
                    accept=".xlsx, .xls"
                    style={{ display: 'none' }}
                    id="raised-button-file"
                    multiple
                    type="file"
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="raised-button-file">
                    <Button variant="contained" component="span" startIcon={<CloudUploadIcon />}>
                      Select File
                    </Button>
                  </label>
                </Box>
                {fileLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', my: 2 }}>
                    <CircularProgress size={40} />
                  </Box>
                ) : (
                  selectedFileName && (
                    <Typography variant="body2" color="text.secondary">
                      Selected: {selectedFileName}
                    </Typography>
                  )
                )}
              </Box>

              <LoadingButton
                onClick={handleUploadXcelData}
                loading={locationLoading}
                disabled={locationLoading}
                variant="contained"
              >
                Upload
              </LoadingButton>
            </div>
          )}
        </Box>
      </Box>

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
          <Button onClick={() => setOpenDeleteStateDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmDeleteState} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openDeleteCityDialog} onClose={() => setOpenDeleteCityDialog(false)}>
        <DialogTitle>Delete City</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the city &quot;{cityToDelete}&quot;?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteCityDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmDeleteCity} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openDeleteMandalDialog} onClose={() => setOpenDeleteMandalDialog(false)}>
        <DialogTitle>Delete Mandal</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the mandal &quot;{mandalToDelete}&quot;?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteMandalDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmDeleteMandal} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openDeleteVillageDialog} onClose={() => setOpenDeleteVillageDialog(false)}>
        <DialogTitle>Delete Village</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the village &quot;{villageToDelete}&quot;?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteVillageDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmDeleteVillage} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LocationComponent;
