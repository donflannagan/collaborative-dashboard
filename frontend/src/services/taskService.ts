import { apiClient, targetBackendPrefix } from './apiClient';
import { ITask, ICreateTaskInput, ITaskListResponse, ITaskResponse } from '../models/task';

export const taskService = {
    getTasksByBoard: async (boardId: string): Promise<ITaskListResponse> => {
        const response = await apiClient.get(`${targetBackendPrefix}tasks/board/${boardId}`);

        const taskListResponse: ITaskListResponse = {
            success: response.data.success,
            tasks: response.data.data,
        };
        return taskListResponse;
    },

    getTaskById: async (taskId: string): Promise<ITaskResponse> => {
        const response = await apiClient.get(`${targetBackendPrefix}tasks/${taskId}`);   

        const taskResponse: ITaskResponse = {
            success: response.data.success,
            task: Array.isArray(response.data.data) ? response.data.data[0] : response.data.data,
        };
        return taskResponse;
    },

    addTask: async (taskData: ICreateTaskInput): Promise<ITaskResponse> => {
        const response = await apiClient.post(`${targetBackendPrefix}tasks/add`, taskData);  

        const taskResponse: ITaskResponse = {
            success: response.data.success,
            task: Array.isArray(response.data.data) ? response.data.data[0] : response.data.data,
        };
        return taskResponse;
    },

    updateTask: async (taskData: ITask): Promise<ITaskResponse> => {
        const { _id, assignee, createdBy, createdAt, updatedAt, ...update } = taskData;
        const response = await apiClient.put(`${targetBackendPrefix}tasks/update`, {
            ...update,
            taskId: _id,
            assignee: assignee?._id,
        });

        const taskResponse: ITaskResponse = {
            success: response.data.success,
            task: Array.isArray(response.data.data) ? response.data.data[0] : response.data.data,
        };
        return taskResponse;
    },

    deleteTask: async (taskId: string): Promise<ITaskResponse> => {
        const response = await apiClient.delete(`${targetBackendPrefix}tasks/delete/${taskId}`);  

        const taskResponse: ITaskResponse = {
            success: response.data.success,
            task: Array.isArray(response.data.data) ? response.data.data[0] : response.data.data,
        };
        return taskResponse;
    },

    getTasksByUser: async (userId: string): Promise<ITaskListResponse> => {
        const response = await apiClient.get(`${targetBackendPrefix}tasks/user/${userId}`); 

        const taskListResponse: ITaskListResponse = {
            success: response.data.success,
            tasks: response.data.data,
        };
        return taskListResponse;
    }
    
};  
