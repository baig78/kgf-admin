import axios from 'axios';
// localStorage.setItem('token', "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImluZHJhc2VuYTAwMThAZ21haWwuY29tIiwiaWQiOiI2NzM4NjQxMGUzODM4MmEyM2Y3ZTY4OWUiLCJwaG9uZSI6IjkxNzc0Njg1MTEiLCJyb2xlIjoiY29vcmRpbmF0b3IiLCJpYXQiOjE3MzE3NDk3OTksImV4cCI6MTczMTgzNjE5OX0.GmpWk0C2XuQaKW94zRIEotTlGVkEfr_S_ucMwd_GAl4");;
// Base URL for your API
const API_BASE_URL = 'https://kgf-rwfd.onrender.com/api/v1'; // Replace with your API URL



// Axios instance
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Login
const adminLogin = async (credentials) => {
    try {
        const response = await axiosInstance.post('/auth/coordinatorLogin', credentials);
        return response.data;
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
};

// Get all users
const getAllUsers = async () => {
    try {
        const token = localStorage.getItem('token');

        const response = await axiosInstance.get(`/users/getAllUsers?page=1&count=10`, {
            headers: {
                Authorization: `${token}`, // Send token in header
            },
        });
        return response.data;
    } catch (error) {
        console.error('Fetching users failed:', error);
        throw error;
    }
};

const getAllCoordinators = async () => {
    try {
        const token = localStorage.getItem('token');

        const response = await axiosInstance.get(`/coordinator/getAllAdmin_coordinators?page=1&count=10`, {
            headers: {
                Authorization: `${token}`, // Send token in header
            },
        });
        return response.data;
    } catch (error) {
        console.error('Fetching users failed:', error);
        throw error;
    }
};
// Get all countries
const getAllCountries = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axiosInstance.get(`/address/getCountries`, {
            headers: {
                Authorization: `${token}`, // Send token in header
            },
        });
        return response.data;
    } catch (error) {
        console.error('Fetching users failed:', error);
        throw error;
    }
};
const getAllStates = async (countryId) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axiosInstance.get(`/address/getStates?country=${countryId}`, {
            headers: {
                Authorization: `${token}`, // Send token in header
            },
        });
        return response.data;
    } catch (error) {
        console.error('Fetching users failed:', error);
        throw error;
    }
};
const getAllCities = async (stateId) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axiosInstance.get(`/address/getCities/cities?state=${stateId}`, {
            headers: {
                Authorization: `${token}`, // Send token in header
            },
        });
        return response.data;
    } catch (error) {
        console.error('Fetching users failed:', error);
        throw error;
    }
};

const addCity = async (cityData) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axiosInstance.post(`/address/addCity`, cityData, {
            headers: {
                Authorization: `${token}`, // Send token in header
            },
        });
        return response.data;
    } catch (error) {
        console.error('Adding city failed:', error);
        throw error;
    }
};

const addState = async (stateData) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axiosInstance.post(`/address/addState`, stateData, {
            headers: {
                Authorization: `${token}`, // Send token in header
            },
        });
        return response.data;
    } catch (error) {
        console.error('Adding city failed:', error);
        throw error;
    }
};

const addCountry = async (countryData) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axiosInstance.post(`/address/addCountry`, countryData, {
            headers: {
                Authorization: `${token}`, // Send token in header
            },
        });
        return response.data;
    } catch (error) {
        console.error('Adding city failed:', error);
        throw error;
    }
};


// const addUser = async (userData) => {
//     try {
//         const token = localStorage.getItem('token'); // Retrieve token from localStorage
//         const response = await axiosInstance.post(`/users/register`, userData, {
//             headers: {
//                 Authorization: `${token}`, // Send token in header
//             },
//         });
//         return response.data; // Return the added user object
//     } catch (error) {
//         console.error('Adding user failed:', error);
//         throw error; // Re-throw the error for handling in the component
//     }
// };

const addNewCoordinator = async (formValues) => {
    try {
        const token = localStorage.getItem('token'); // Retrieve token from localStorage
        const response = await axiosInstance.post(`${API_BASE_URL}/coordinator/register`, formValues, {
            headers: {
                Authorization: `${token}`, // Send token in header
            },
        });
        return response.data; // Return the added user object
    } catch (error) {
        console.error('Adding user failed:', error);
        throw error; // Re-throw the error for handling in the component
    }
};

// Update an existing coordinator
const updateCoordinator = async (id, payload) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axiosInstance.patch(`${API_BASE_URL}/coordinator/updateAdmin_coordinator?id=${id}`, {
            ...payload,
            id: id
        }, {
            headers: {
                Authorization: `${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error updating coordinator:', error);
        throw error;
    }
};

// Delete a coordinator
const deleteCoordinator = async (id) => {
    try {
        const token = localStorage.getItem('token');
        // const response = await axios.delete(`coordinator/deleteAdmin_coordinator/${id}`);
        const response = await axios.delete(`${API_BASE_URL}/coordinator/deleteAdmin_coordinator`, {
            data: { "id": id },
            headers: {
                Authorization: `${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting coordinator:', error);
        throw error;
    }
};





// const editUser = async (userID, user) => {
//     const response = await axios.put(`${API_BASE_URL}/users/${userID}`, user);
//     return response.data; // Return the updated user object
// };







// Export all services at the bottom
export {
    adminLogin,
    getAllUsers,
    getAllCountries,
    getAllStates,
    getAllCities,
    addCity,
    addState,
    addCountry,
    // addUser,
    updateCoordinator,
    deleteCoordinator,
    addNewCoordinator,
    getAllCoordinators
};
