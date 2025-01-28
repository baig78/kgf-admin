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
    },

    downloadUserPdf: async (userId, options = {}) => {
        const { preview = true, download = false } = options;

        if (!userId) {
            console.error('Download PDF: No user ID provided');
            throw new Error('Invalid user ID');
        }

        try {
            console.log(`Attempting to download PDF for user ID: ${userId}`);
            
            const response = await axiosInstance.get(`/users/pdf/${userId}`, {
                responseType: 'blob',
                headers: {
                    'Accept': 'application/pdf'
                },
                timeout: 10000
            });
            
            // Validate response
            if (!response.data || response.data.size === 0) {
                throw new Error('Received empty PDF file');
            }

            // Create blob URL
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const blobUrl = window.URL.createObjectURL(blob);
            
            // If download is requested, trigger direct download
            if (download) {
                const link = document.createElement('a');
                link.href = blobUrl;
                link.setAttribute('download', `user_${userId}_id_card.pdf`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(blobUrl);
                return true;
            }
            
            // If preview is requested (default behavior)
            if (preview) {
                // Create iframe to display PDF
                const iframe = document.createElement('iframe');
                iframe.style.width = '100%';
                iframe.style.height = '100vh';
                iframe.style.border = 'none';
                iframe.src = blobUrl;
                
                // Create a modal or container to hold the iframe
                const modal = document.createElement('div');
                modal.style.position = 'fixed';
                modal.style.top = '0';
                modal.style.left = '0';
                modal.style.width = '100%';
                modal.style.height = '100%';
                modal.style.backgroundColor = 'rgba(0,0,0,0.7)';
                modal.style.zIndex = '1000';
                modal.style.display = 'flex';
                modal.style.flexDirection = 'column';
                modal.style.justifyContent = 'center';
                modal.style.alignItems = 'center';
                
                // Container for buttons
                const buttonContainer = document.createElement('div');
                buttonContainer.style.position = 'absolute';
                buttonContainer.style.top = '10px';
                buttonContainer.style.right = '10px';
                buttonContainer.style.zIndex = '1001';
                buttonContainer.style.display = 'flex';
                buttonContainer.style.gap = '10px';
                
                // Close button
                const closeButton = document.createElement('button');
                closeButton.textContent = 'Close';
                closeButton.style.padding = '10px';
                closeButton.style.backgroundColor = '#f44336';
                closeButton.style.color = 'white';
                closeButton.style.border = 'none';
                closeButton.style.borderRadius = '5px';
                
                // Download button
                const downloadButton = document.createElement('button');
                downloadButton.textContent = 'Download PDF';
                downloadButton.style.padding = '10px';
                downloadButton.style.backgroundColor = '#4CAF50';
                downloadButton.style.color = 'white';
                downloadButton.style.border = 'none';
                downloadButton.style.borderRadius = '5px';
                
                // Cleanup function
                const cleanup = () => {
                    document.body.removeChild(modal);
                    window.URL.revokeObjectURL(blobUrl);
                };
                
                // Download function
                const triggerDownload = () => {
                    const link = document.createElement('a');
                    link.href = blobUrl;
                    link.setAttribute('download', `user_${userId}_id_card.pdf`);
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                };
                
                // Add event listeners
                closeButton.addEventListener('click', cleanup);
                downloadButton.addEventListener('click', triggerDownload);
                
                // Assemble and display
                buttonContainer.appendChild(downloadButton);
                buttonContainer.appendChild(closeButton);
                modal.appendChild(buttonContainer);
                modal.appendChild(iframe);
                document.body.appendChild(modal);
                
                console.log(`PDF displayed for user ID: ${userId}`);
                return true;
            }
            
            // If neither preview nor download is requested
            window.URL.revokeObjectURL(blobUrl);
            return false;
        } catch (error) {
            console.error('PDF Download Error:', {
                userId,
                errorName: error.name,
                errorMessage: error.message,
                stack: error.stack,
                ...(error.response ? {
                    responseStatus: error.response.status,
                    responseHeaders: error.response.headers
                } : {})
            });
            
            // Throw a more user-friendly error
            throw new Error(`Failed to download PDF for user ${userId}. ${error.message}`);
        }
    },
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

export {
    authService,
    userService,
    addressService,
    coordinatorService
};