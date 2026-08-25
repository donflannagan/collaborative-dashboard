import { apiClient, targetBackendPrefix } from './apiClient';

export const userService = {
    // GET request example
    getAllUsers: async () => {
        const response = await apiClient.get(`${targetBackendPrefix}users`);
        return response.data;
    },

    getUserByEmail: async (email: string) => {
        const response = await apiClient.get(`${targetBackendPrefix}users/by-email/${encodeURIComponent(email)}`);
        return response.data;
    },

    // POST request example
    //createUser: async (userData) => {
    //  const response = await apiClient.post('/users', userData);
    //  return response.data;
    //}
};