import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { getTasksByBoard } from '../../controllers/taskController';
import { Task } from '../../models/Task';

// Mock the Task model
jest.mock('../../models/Task');

describe('Task Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('getTasksByBoard', () => {
    it('should return all tasks for a board sorted by column and position', async () => {
      const boardId = new mongoose.Types.ObjectId().toString();
      const mockTasks = [
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Task 1',
          boardId,
          columnId: 'To Do',
          position: 0,
          assignee: { _id: new mongoose.Types.ObjectId(), username: 'john_doe', email: 'john@example.com' },
          priority: 'high',
          createdBy: { _id: new mongoose.Types.ObjectId(), username: 'creator', email: 'creator@example.com' },
        },
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Task 2',
          boardId,
          columnId: 'In Progress',
          position: 0,
          assignee: null,
          priority: 'medium',
          createdBy: { _id: new mongoose.Types.ObjectId(), username: 'creator', email: 'creator@example.com' },
        },
      ];

      mockRequest = { params: { boardId } };

      (Task.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(mockTasks),
          }),
        }),
      });

      await getTasksByBoard(mockRequest as Request, mockResponse as Response, mockNext);

      expect(Task.find).toHaveBeenCalledWith({ boardId });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockTasks,
        count: mockTasks.length,
      });
    });

    it('should return empty array if board has no tasks', async () => {
      const boardId = new mongoose.Types.ObjectId().toString();

      mockRequest = { params: { boardId } };

      (Task.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      await getTasksByBoard(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: [],
        count: 0,
      });
    });

    it('should return 400 if boardId is missing', async () => {
      mockRequest = { params: {} };

      await getTasksByBoard(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Board ID is required',
      });
    });

    it('should populate assignee and createdBy fields', async () => {
      const boardId = new mongoose.Types.ObjectId().toString();

      mockRequest = { params: { boardId } };

      const mockPopulate1 = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue([]),
        }),
      });

      const mockPopulate2 = jest.fn().mockReturnValue({
        populate: mockPopulate1,
      });

      (Task.find as jest.Mock).mockReturnValue({
        populate: mockPopulate2,
      });

      await getTasksByBoard(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockPopulate2).toHaveBeenCalledWith('assignee', 'username email');
      expect(mockPopulate1).toHaveBeenCalledWith('createdBy', 'username email');
    });

    it('should sort tasks by columnId and position', async () => {
      const boardId = new mongoose.Types.ObjectId().toString();
      const mockSort = jest.fn().mockResolvedValue([]);

      mockRequest = { params: { boardId } };

      (Task.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: mockSort,
          }),
        }),
      });

      await getTasksByBoard(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockSort).toHaveBeenCalledWith({ columnId: 1, position: 1 });
    });

    it('should handle database errors and pass to next middleware', async () => {
      const boardId = new mongoose.Types.ObjectId().toString();
      const error = new Error('Database connection failed');

      mockRequest = { params: { boardId } };

      (Task.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockRejectedValue(error),
          }),
        }),
      });

      await getTasksByBoard(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
