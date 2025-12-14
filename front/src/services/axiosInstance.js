import axios from 'axios';
import keycloak from './keycloak';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080', // Spring Boot backend URL
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add the token to every request
axiosInstance.interceptors.request.use(
    (config) => {
        const token = keycloak.token || localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token expiration
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Log error details for debugging
        if (error.response?.status === 403) {
            console.error("403 Forbidden - Backend rejected the request");
            console.error("Response:", error.response?.data);
        }

        // If token expired, try to refresh it
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Attempt to refresh the Keycloak token
                await keycloak.updateToken(30);
                localStorage.setItem('token', keycloak.token);

                // Retry the original request with the new token
                originalRequest.headers.Authorization = `Bearer ${keycloak.token}`;
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                // If refresh fails, redirect to local login page
                console.warn('Token refresh failed, redirecting to login');
                localStorage.removeItem('token');
                window.location.href = '/auth/signin';

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;