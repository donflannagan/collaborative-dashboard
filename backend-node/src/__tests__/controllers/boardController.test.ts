import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { getAllBoards, getBoardsByUser } from '../../controllers/boardController';
import { Board } from '../../models/Board';
import { User } from '../../models/User';

// Mock the Board model
jest.mock('../../models/Board');

describe('Board Controller', () => {
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

  describe('getAllBoards', () => {
    it('should return all boards from database', async () => {
      const mockBoards = [
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Project Alpha',
          owner: { _id: new mongoose.Types.ObjectId(), username: 'john_doe', email: 'john@example.com' },
          members: [],
          columns: ['To Do', 'In Progress', 'Done'],
        },
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Project Beta',
          owner: { _id: new mongoose.Types.ObjectId(), username: 'jane_doe', email: 'jane@example.com' },
          members: [],
          columns: ['Backlog', 'Active', 'Completed'],
        },
      ];

      (Board.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockBoards),
        }),
      });

      await getAllBoards(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockBoards,
        count: mockBoards.length,
      });
    });

    it('should handle errors and pass to next middleware', async () => {
      const error = new Error('Database connection failed');

      (Board.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockRejectedValue(error),
        }),
      });

      await getAllBoards(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should return empty array if no boards exist', async () => {
      (Board.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue([]),
        }),
      });

      await getAllBoards(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: [],
        count: 0,
      });
    });
  });

  describe('getBoardsByUser', () => {
    it('should return boards for a specific user', async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const mockBoards = [
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'My Board',
          owner: { _id: userId, username: 'john_doe', email: 'john@example.com' },
          members: [],
          columns: ['To Do', 'In Progress', 'Done'],
        },
      ];

      mockRequest = { params: { userId } };

      (Board.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockBoards),
        }),
      });

      await getBoardsByUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(Board.find).toHaveBeenCalledWith({
        $or: [{ owner: userId }, { members: userId }],
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockBoards,
        count: mockBoards.length,
      });
    });

    it('should return 400 if userId is missing', async () => {
      mockRequest = { params: {} };

      await getBoardsByUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'User ID is required',
      });
    });

    it('should include boards where user is a member', async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const mockBoards = [
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Team Board',
          owner: { _id: new mongoose.Types.ObjectId(), username: 'owner', email: 'owner@example.com' },
          members: [{ _id: userId, username: 'john_doe', email: 'john@example.com' }],
          columns: ['To Do', 'In Progress', 'Done'],
        },
      ];

      mockRequest = { params: { userId } };

      (Board.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockBoards),
        }),
      });

      await getBoardsByUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(Board.find).toHaveBeenCalledWith({
        $or: [{ owner: userId }, { members: userId }],
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should handle errors and pass to next middleware', async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const error = new Error('Database error');

      mockRequest = { params: { userId } };

      (Board.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockRejectedValue(error),
        }),
      });

      await getBoardsByUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
