import { apiClient, targetBackendPrefix } from './apiClient';
import type { AddUserRequest } from '../models/user';

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
    createUser: async (userData: AddUserRequest) => {
      const response = await apiClient.post(`${targetBackendPrefix}users`, userData);
      return response.data;
    }
};