import { apiClient, targetBackendPrefix } from './apiClient';
import { IBoard, IBoardListResponse, IBoardResponse, ICreateBoardInput } from '../models/board';

export const boardService = {
    getAllBoards: async (): Promise<IBoardListResponse> => {
        const response = await apiClient.get(`${targetBackendPrefix}boards`);

        const boardListResponse: IBoardListResponse = {
            success: response.data.success,
            boards: response.data.data,
        };
        return boardListResponse;
    },

    getAllBoardsByUser: async (userId: string): Promise<IBoardListResponse> => {
        const response = await apiClient.get(`${targetBackendPrefix}boards/user/${userId}`);

        const boardListResponse: IBoardListResponse = {
            success: response.data.success,
            boards: response.data.data,
        };
        return boardListResponse;
    },

    getBoardById: async (boardId: string): Promise<IBoardResponse> => {
        const response = await apiClient.get(`${targetBackendPrefix}boards/${boardId}`);
        const data = response.data.data;
        return {
            success: response.data.success,
            board: Array.isArray(data) ? data[0] : data,
        };
    },

    createBoard: async (boardData: ICreateBoardInput): Promise<IBoardResponse> => {
        const response = await apiClient.post(`${targetBackendPrefix}boards`, boardData);
        const data = response.data.data;
        return {
            success: response.data.success,
            board: Array.isArray(data) ? data[0] : data,
        };
    },
}