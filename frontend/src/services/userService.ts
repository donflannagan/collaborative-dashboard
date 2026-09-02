import { apiClient, targetBackendPrefix } from './apiClient';
import type { AddUserRequest, UserLookupResponse } from '../models/user';

export const userService = {
    // GET request example
    getAllUsers: async () => {
        const response = await apiClient.get(`${targetBackendPrefix}users`);
        const userLookupResponse: UserLookupResponse = {
            success: response.status === 200 && response.data.data.length > 0,
            user: response !== null && response.data.data.length > 0 ? response.data.data : []
        };
        return userLookupResponse;
    },

    getUserByEmail: async (email: string): Promise<UserLookupResponse> => {
        const response = await apiClient.get(`${targetBackendPrefix}users/by-email/${encodeURIComponent(email)}`);

        const userLookupResponse: UserLookupResponse = {
            success: response.status === 200 && response.data.data.length > 0,
            user: response !== null && response.data.data.length > 0 ? response.data.data : []
        };
        return userLookupResponse;
    },

    // POST request example
    createUser: async (userData: AddUserRequest) => {
      const response = await apiClient.post(`${targetBackendPrefix}users`, userData);
      return response.data;
    }
};