// Service to handle user registration via backend proxy

import axiosInstance from './axiosInstance';

/**
 * Register a new user via backend endpoint
 * The backend handles the Keycloak Admin API calls
 */
export async function registerUser(username, email, password, firstName = "", lastName = "") {
    try {
        const response = await axiosInstance.post('/auth/register', {
            username,
            email,
            password,
            firstName,
            lastName
        });

        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
        throw new Error(errorMessage);
    }
}
