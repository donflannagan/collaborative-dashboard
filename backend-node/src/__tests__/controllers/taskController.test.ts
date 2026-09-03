import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { addTask, deleteTask, getTaskById, getTasksByBoard, getTasksByUser, updateTask } from '../../controllers/taskController';
import { Task } from '../../models/Task';

// 1. Explicitly mock the Task model natively
vi.mock('../../models/Task', () => {
  const TaskMock: any = vi.fn();
  TaskMock.find = vi.fn();
  TaskMock.findById = vi.fn();
  TaskMock.findByIdAndUpdate = vi.fn();
  TaskMock.findByIdAndDelete = vi.fn();
  return { Task: TaskMock };
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

  describe('getTaskById', () => {
    const buildTaskQueryChain = (resolvedValue: any) => {
      const populate2Spy = vi.fn().mockResolvedValue(resolvedValue);
      const populate1Spy = vi.fn().mockReturnValue({ populate: populate2Spy });
      return { populate: populate1Spy };
    };

    it('returns the task when found', async () => {
      const taskId = new mongoose.Types.ObjectId().toString();
      const task = { _id: taskId, title: 'Task 1' };
      mockRequest = { params: { taskId } };
      vi.mocked(Task.findById).mockReturnValue(buildTaskQueryChain(task) as any);

      await getTaskById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(Task.findById).toHaveBeenCalledWith(taskId);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ success: true, data: task });
    });

    it('returns 404 when the task is not found', async () => {
      const taskId = new mongoose.Types.ObjectId().toString();
      mockRequest = { params: { taskId } };
      vi.mocked(Task.findById).mockReturnValue(buildTaskQueryChain(null) as any);

      await getTaskById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ success: false, error: 'Task not found' });
    });

    it('returns 400 when taskId is missing', async () => {
      mockRequest = { params: {} };

      await getTaskById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ success: false, error: 'Task ID is required' });
      expect(Task.findById).not.toHaveBeenCalled();
    });

    it('passes database errors to the next middleware', async () => {
      const taskId = new mongoose.Types.ObjectId().toString();
      const error = new Error('Database connection failed');
      mockRequest = { params: { taskId } };
      const populate2Spy = vi.fn().mockRejectedValue(error);
      const populate1Spy = vi.fn().mockReturnValue({ populate: populate2Spy });
      vi.mocked(Task.findById).mockReturnValue({ populate: populate1Spy } as any);

      await getTaskById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('addTask', () => {
    const taskInput = {
      title: 'New task',
      description: 'Details',
      boardId: new mongoose.Types.ObjectId().toString(),
      columnId: 'To Do',
      position: 0,
      assignee: new mongoose.Types.ObjectId().toString(),
      priority: 'medium',
      dueDate: new Date('2026-01-01'),
      tags: ['urgent'],
      createdBy: new mongoose.Types.ObjectId().toString(),
    };

    it('creates and returns the new task', async () => {
      const saveMock = vi.fn().mockImplementation(function (this: any) {
        return Promise.resolve(this);
      });
      vi.mocked(Task).mockImplementation(function (this: any, data: any) {
        Object.assign(this, data);
        this.save = saveMock;
      } as any);

      mockRequest = { body: taskInput };

      await addTask(mockRequest as Request, mockResponse as Response, mockNext);

      expect(saveMock).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({ title: taskInput.title }),
      });
    });

    it('passes database errors to the next middleware', async () => {
      const error = new Error('Database connection failed');
      vi.mocked(Task).mockImplementation(function (this: any, data: any) {
        Object.assign(this, data);
        this.save = vi.fn().mockRejectedValue(error);
      } as any);

      mockRequest = { body: taskInput };

      await addTask(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('updateTask', () => {
    const buildUpdateQueryChain = (resolvedValue: any) => {
      const populate2Spy = vi.fn().mockResolvedValue(resolvedValue);
      const populate1Spy = vi.fn().mockReturnValue({ populate: populate2Spy });
      return { populate: populate1Spy };
    };

    it('updates and returns the task', async () => {
      const taskId = new mongoose.Types.ObjectId().toString();
      const updatedTask = { _id: taskId, title: 'Updated title' };
      mockRequest = { body: { taskId, title: 'Updated title' } };
      vi.mocked(Task.findByIdAndUpdate).mockReturnValue(buildUpdateQueryChain(updatedTask) as any);

      await updateTask(mockRequest as Request, mockResponse as Response, mockNext);

      expect(Task.findByIdAndUpdate).toHaveBeenCalledWith(
        taskId,
        expect.objectContaining({ title: 'Updated title' }),
        { new: true },
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ success: true, data: updatedTask });
    });

    it('returns 404 when the task to update is not found', async () => {
      const taskId = new mongoose.Types.ObjectId().toString();
      mockRequest = { body: { taskId, title: 'Updated title' } };
      vi.mocked(Task.findByIdAndUpdate).mockReturnValue(buildUpdateQueryChain(null) as any);

      await updateTask(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ success: false, error: 'Task not found' });
    });

    it('returns 400 when taskId is missing', async () => {
      mockRequest = { body: {} };

      await updateTask(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ success: false, error: 'Task ID is required' });
      expect(Task.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('passes database errors to the next middleware', async () => {
      const taskId = new mongoose.Types.ObjectId().toString();
      const error = new Error('Database connection failed');
      mockRequest = { body: { taskId, title: 'Updated title' } };
      const populate2Spy = vi.fn().mockRejectedValue(error);
      const populate1Spy = vi.fn().mockReturnValue({ populate: populate2Spy });
      vi.mocked(Task.findByIdAndUpdate).mockReturnValue({ populate: populate1Spy } as any);

      await updateTask(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteTask', () => {
    it('deletes and returns the task', async () => {
      const taskId = new mongoose.Types.ObjectId().toString();
      const deletedTask = { _id: taskId, title: 'Task 1' };
      mockRequest = { params: { taskId } };
      vi.mocked(Task.findByIdAndDelete).mockResolvedValue(deletedTask as any);

      await deleteTask(mockRequest as Request, mockResponse as Response, mockNext);

      expect(Task.findByIdAndDelete).toHaveBeenCalledWith(taskId);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ success: true, data: deletedTask });
    });

    it('returns 404 when the task to delete is not found', async () => {
      const taskId = new mongoose.Types.ObjectId().toString();
      mockRequest = { params: { taskId } };
      vi.mocked(Task.findByIdAndDelete).mockResolvedValue(null);

      await deleteTask(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ success: false, error: 'Task not found' });
    });

    it('returns 400 when taskId is missing', async () => {
      mockRequest = { params: {} };

      await deleteTask(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ success: false, error: 'Task ID is required' });
      expect(Task.findByIdAndDelete).not.toHaveBeenCalled();
    });

    it('passes database errors to the next middleware', async () => {
      const taskId = new mongoose.Types.ObjectId().toString();
      const error = new Error('Database connection failed');
      mockRequest = { params: { taskId } };
      vi.mocked(Task.findByIdAndDelete).mockRejectedValue(error);

      await deleteTask(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getTasksByUser', () => {
    it('returns tasks assigned to the user', async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const mockTasks = [{ _id: new mongoose.Types.ObjectId(), title: 'Task 1', assignee: userId }];
      mockRequest = { params: { userId } };

      const { chain } = createMockQueryChain(mockTasks);
      vi.mocked(Task.find).mockReturnValue(chain as any);

      await getTasksByUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(Task.find).toHaveBeenCalledWith({ assignee: userId });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockTasks,
        count: mockTasks.length,
      });
    });

    it('returns 400 when userId is missing', async () => {
      mockRequest = { params: {} };

      await getTasksByUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ success: false, error: 'User ID is required' });
      expect(Task.find).not.toHaveBeenCalled();
    });

    it('sorts tasks by boardId, columnId, and position', async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      mockRequest = { params: { userId } };

      const sortSpy = vi.fn().mockResolvedValue([]);
      const { chain } = createMockQueryChain([], { sort: sortSpy });
      vi.mocked(Task.find).mockReturnValue(chain as any);

      await getTasksByUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(sortSpy).toHaveBeenCalledWith({ boardId: 1, columnId: 1, position: 1 });
    });

    it('passes database errors to the next middleware', async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const error = new Error('Database connection failed');
      mockRequest = { params: { userId } };

      const sortSpy = vi.fn().mockRejectedValue(error);
      const { chain } = createMockQueryChain([], { sort: sortSpy });
      vi.mocked(Task.find).mockReturnValue(chain as any);

      await getTasksByUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});