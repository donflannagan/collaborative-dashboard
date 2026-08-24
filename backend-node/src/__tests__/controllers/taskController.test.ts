import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { getTasksByBoard } from '../../controllers/taskController';
import { Task } from '../../models/Task';

// 1. Explicitly mock the Task model natively
vi.mock('../../models/Task', () => {
  return {
    Task: {
      find: vi.fn()
    }
  };
});

describe('Task Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  // Reusable helper to quickly mock the Mongoose query chain structure
  const createMockQueryChain = (resolvedValue: any, spies: Record<string, any> = {}) => {
    const sortSpy = spies.sort || vi.fn().mockResolvedValue(resolvedValue);
    const populate2Spy = spies.populate2 || vi.fn().mockReturnValue({ sort: sortSpy });
    const populate1Spy = spies.populate1 || vi.fn().mockReturnValue({ populate: populate2Spy });
    
    return {
      chain: { populate: populate1Spy },
      spies: { populate1: populate1Spy, populate2: populate2Spy, sort: sortSpy }
    };
  };

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    mockNext = vi.fn();
    vi.clearAllMocks();
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
      
      const { chain } = createMockQueryChain(mockTasks);
      vi.mocked(Task.find).mockReturnValue(chain as any);

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
      
      const { chain } = createMockQueryChain([]);
      vi.mocked(Task.find).mockReturnValue(chain as any);

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
      
      const spies = {
        populate1: vi.fn(),
        populate2: vi.fn(),
        sort: vi.fn().mockResolvedValue([])
      };
      
      // Wire up the mock chain manually to assert against the specific spies
      spies.populate1.mockReturnValue({ populate: spies.populate2 });
      spies.populate2.mockReturnValue({ sort: spies.sort });
      
      vi.mocked(Task.find).mockReturnValue({ populate: spies.populate1 } as any);

      await getTasksByBoard(mockRequest as Request, mockResponse as Response, mockNext);

      expect(spies.populate1).toHaveBeenCalledWith('assignee', 'username email');
      expect(spies.populate2).toHaveBeenCalledWith('createdBy', 'username email');
    });

    it('should sort tasks by columnId and position', async () => {
      const boardId = new mongoose.Types.ObjectId().toString();
      mockRequest = { params: { boardId } };
      
      const sortSpy = vi.fn().mockResolvedValue([]);
      const { chain } = createMockQueryChain([], { sort: sortSpy });
      vi.mocked(Task.find).mockReturnValue(chain as any);

      await getTasksByBoard(mockRequest as Request, mockResponse as Response, mockNext);

      expect(sortSpy).toHaveBeenCalledWith({ columnId: 1, position: 1 });
    });

    it('should handle database errors and pass to next middleware', async () => {
      const boardId = new mongoose.Types.ObjectId().toString();
      const error = new Error('Database connection failed');
      mockRequest = { params: { boardId } };
      
      const sortSpy = vi.fn().mockRejectedValue(error);
      const { chain } = createMockQueryChain([], { sort: sortSpy });
      vi.mocked(Task.find).mockReturnValue(chain as any);

      await getTasksByBoard(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});