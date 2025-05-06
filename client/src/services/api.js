import axios from 'axios';
import config from '../config';

const api = axios.create({
    baseURL: config.apiUrl,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor for debugging
api.interceptors.request.use(
    (config) => {
        console.log(`Making ${config.method.toUpperCase()} request to ${config.url}`);
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for debugging
api.interceptors.response.use(
    (response) => {
        console.log(`Received response from ${response.config.url}:`, response.status);
        return response;
    },
    (error) => {
        console.error('Response error:', error);
        return Promise.reject(error);
    }
);

export default api; 