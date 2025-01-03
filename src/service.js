import axios from 'axios';

const API_BASE_URL = 'https://kgf-rwfd.onrender.com/api/v1';

// Create axios instance with default config
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to handle tokens
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = token;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Auth services
const authService = {
    login: async (credentials) => {
        try {
            const response = await axiosInstance.post('/auth/coordinatorLogin', credentials);
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
    logout: () => {
        localStorage.removeItem('token');
    }
};

// User services
const userService = {
    getAllUsers: async (page = 1, count = 10) => {
        try {
            const response = await axiosInstance.get(`/users/getAllUsers`, {
                params: { page, count }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getAllCoordinators: async (page = 1, count = 10) => {
        try {
            const response = await axiosInstance.get(`/coordinator/getAllAdmin_coordinators`, {
                params: { page, count }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

// Address services
const addressService = {
    getCountries: async () => {
        try {
            const response = await axiosInstance.get('/address/getCountries');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getStates: async (countryId) => {
        try {
            const response = await axiosInstance.get('/address/getStates', {
                params: { country: countryId }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getCities: async (stateId) => {
        try {
            const response = await axiosInstance.get('/address/getCities', {
                params: { state: stateId }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    addCity: async (cityData) => {
        try {
            const response = await axiosInstance.post('/address/addCity', [cityData]);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    addState: async (stateData) => {
        try {
            const response = await axiosInstance.post('/address/addState', [stateData]);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    addCountry: async (countryData) => {
        try {
            const response = await axiosInstance.post('/address/addCountry', [countryData]);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Mandal APIs
    addMandal: async (mandalData) => {
        try {
            const response = await axiosInstance.post('/address/addMandal', mandalData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getMandals: async () => {
        try {
            const response = await axiosInstance.get('/address/getMandals');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    addVillage: async (villageData) => {
        try {
            const response = await axiosInstance.post('/address/addVillage', villageData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getVillages: async () => {
        try {
            const response = await axiosInstance.get('/address/getVillages');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    deleteCountry: async (countryId) => {
        try {
            const response = await axiosInstance.delete(`/address/deleteCountry/${countryId}`);
            return response.data;
        } catch (error) {
            console.error("Error deleting country:", error);
            throw error;
        }
    },

    deleteState: async (stateId) => {
        try {
            const response = await axiosInstance.delete(`/address/deleteState/${stateId}`);
            return response.data;
        } catch (error) {
            console.error("Error deleting state:", error);
            throw error;
        }
    },

    deleteVillage: async (villageId) => {
        try {
            const response = await axiosInstance.delete(`/address/deleteVillage/${villageId}`);
            return response.data;
        } catch (error) {
            console.error("Error deleting village:", error);
            throw error;
        }
    },

    deleteMandal: async (mandalId) => {
        try {
            const response = await axiosInstance.delete(`/address/deleteMandal/${mandalId}`);
            return response.data;
        } catch (error) {
            console.error("Error deleting mandal:", error);
            throw error;
        }
    },
};

// Coordinator services
const coordinatorService = {
    add: async (formValues) => {
        try {
            const response = await axiosInstance.post('/coordinator/register', formValues);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    update: async (id, payload) => {
        try {
            const response = await axiosInstance.patch(`/coordinator/updateAdmin_coordinator?id=${id}`, {
                ...payload,
                id
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    delete: async (id) => {
        try {
            const response = await axiosInstance.delete('/coordinator/deleteAdmin_coordinator', {
                data: { id }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export {
    authService,
    userService,
    addressService,
    coordinatorService
};