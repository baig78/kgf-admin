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

    getMandals: async (cityId) => {
        try {
            const response = await axiosInstance.get('/address/getMandals', {
                params: { cityId }
            });
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
            const response = await axiosInstance.delete(`/address/deleteCountry`, {
                data: { id: countryId },
            });
            return response.data;
        } catch (error) {
            console.error("Error deleting country:", error);
            throw error;
        }
    },


    deleteState: async (stateId) => {
        try {
            const response = await axiosInstance.delete(`/address/deleteState`, {
                data: { id: stateId },
            });
            return response.data;
        } catch (error) {
            console.error("Error deleting state:", error);
            throw error;
        }
    },
    deleteCity: async (cityId) => {
        try {
            const response = await axiosInstance.delete(`/address/deleteCity`, {
                data: { id: cityId },
            });
            return response.data;
        } catch (error) {
            console.error("Error deleting city:", error);
            throw error;
        }
    },

    deleteVillage: async (villageId) => {
        try {
            const response = await axiosInstance.delete(`/address/deleteVillage`, {
                data: { id: villageId },
            });
            return response.data;
        } catch (error) {
            console.error("Error deleting village:", error);
            throw error;
        }
    },

    deleteMandal: async (mandalId) => {
        try {
            const response = await axiosInstance.delete(`/address/deleteMandal`, {
                data: { id: mandalId },
            });
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

// Add user PDF download service
const downloadUserPdf = async (userId) => {

    try {
        const response = await axiosInstance.get(`/users/pdf/${userId}`, {
            data: { userId }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
// try {
//     const response = await axiosInstance.get(`/users/pdf/${userId}`, {
//         responseType: 'blob',
//         headers: {
//             'Accept': 'application/pdf'
//         },
//         // Intercept the response to handle non-PDF content
//         transformResponse: [function (data, headers) {
//             const contentType = headers['content-type'];

//             // Log unexpected content type
//             if (!contentType.includes('application/pdf')) {
//                 console.error('Unexpected Content Type:', {
//                     contentType,
//                     dataType: typeof data,
//                     dataLength: data?.length
//                 });

//                 // If it's HTML, try to extract error message
//                 if (contentType.includes('text/html')) {
//                     try {
//                         const errorText = data instanceof Blob 
//                             ? new TextDecoder().decode(data) 
//                             : data;

//                         console.error('HTML Error Content:', errorText);

//                         // Extract potential error details
//                         const titleMatch = errorText.match(/<title>(.*?)<\/title>/i);
//                         const bodyMatch = errorText.match(/<body[^>]*>([\s\S]*?)<\/body>/i);

//                         const errorTitle = titleMatch ? titleMatch[1] : 'Unexpected Response';
//                         const errorBody = bodyMatch 
//                             ? bodyMatch[1].replace(/<[^>]*>/g, '').trim() 
//                             : 'No additional details available';

//                         throw new Error(`Server Error: ${errorTitle} - ${errorBody}`);
//                     } catch (parseError) {
//                         console.error('Failed to parse HTML error:', parseError);
//                         throw new Error('Received unexpected HTML response');
//                     }
//                 }
//             }
//             return data;
//         }]
//     });

//     return response;
// } catch (error) {
//     // Enhanced error logging
//     console.error('PDF Download Error:', {
//         errorName: error.name,
//         errorMessage: error.message,
//         response: error.response ? {
//             status: error.response.status,
//             headers: error.response.headers,
//             data: error.response.data
//         } : null
//     });

//     throw error;
// }


export {
    authService,
    userService,
    addressService,
    coordinatorService,
    downloadUserPdf
};