import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { 
  getAllBoards, 
  getBoardsByUser, 
  deleteBoard, 
  createBoard, 
  updateBoard 
} from '../../controllers/boardController';
import { Board } from '../../models/Board';

// 1. Explicitly mock the Board model methods up front
vi.mock('../../models/Board', () => {
  return {
    Board: {
      find: vi.fn(),
      findByIdAndDelete: vi.fn(),
      findByIdAndUpdate: vi.fn(),
      create: vi.fn(),
    }
  };
});

describe('Board Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  // Helper utility to mimic Mongoose's find().populate().populate() chain
  const createMockFindChain = (resolvedValue: any) => {
    const populate2 = vi.fn().mockResolvedValue(resolvedValue);
    const populate1 = vi.fn().mockReturnValue({ populate: populate2 });
    return { populate: populate1 };
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

      vi.mocked(Board.find).mockReturnValue(createMockFindChain(mockBoards) as any);

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
      const populate2 = vi.fn().mockRejectedValue(error);
      const populate1 = vi.fn().mockReturnValue({ populate: populate2 });
      vi.mocked(Board.find).mockReturnValue({ populate: populate1 } as any);

      await getAllBoards(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should return empty array if no boards exist', async () => {
      vi.mocked(Board.find).mockReturnValue(createMockFindChain([]) as any);

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
      vi.mocked(Board.find).mockReturnValue(createMockFindChain(mockBoards) as any);

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
      vi.mocked(Board.find).mockReturnValue(createMockFindChain(mockBoards) as any);

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
      
      const populate2 = vi.fn().mockRejectedValue(error);
      const populate1 = vi.fn().mockReturnValue({ populate: populate2 });
      vi.mocked(Board.find).mockReturnValue({ populate: populate1 } as any);

      await getBoardsByUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteBoard', () => {
    it('should delete a board successfully', async () => {
      const boardId = new mongoose.Types.ObjectId().toString();
      const mockBoard = {
        _id: boardId,
        title: 'Team Board',
        owner: { _id: new mongoose.Types.ObjectId(), username: 'owner', email: 'owner@example.com' },
        members: [],
        columns: ['To Do', 'In Progress', 'Done'],
      };
      mockRequest = { params: { boardId } };
      vi.mocked(Board.findByIdAndDelete).mockResolvedValue(mockBoard);

      await deleteBoard(mockRequest as Request, mockResponse as Response, mockNext);

      expect(Board.findByIdAndDelete).toHaveBeenCalledWith(boardId);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockBoard,
      });
    });

    it('should handle errors and pass to next middleware', async () => {
      const boardId = new mongoose.Types.ObjectId().toString();
      const error = new Error('Database error');
      mockRequest = { params: { boardId } };
      vi.mocked(Board.findByIdAndDelete).mockRejectedValue(error);

      await deleteBoard(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('updateBoard', () => {
    it('should update and populate a board successfully', async () => {
      const boardId = new mongoose.Types.ObjectId().toString();
      const updateData = { title: 'Updated Board', description: 'Updated desc', members: [] };
      const mockSavedBoard = { _id: boardId, ...updateData };
      const mockPopulatedBoard = {
        ...mockSavedBoard,
        owner: { _id: new mongoose.Types.ObjectId(), username: 'owner', email: 'owner@example.com' },
        members: [],
      };
      mockRequest = { params: { boardId }, body: updateData };

      const mockPopulateMethod = vi.fn().mockResolvedValue(mockPopulatedBoard);
      const mockMongooseDoc = { ...mockSavedBoard, populate: mockPopulateMethod };

      vi.mocked(Board.findByIdAndUpdate).mockResolvedValue(mockMongooseDoc as any);

      await updateBoard(mockRequest as Request, mockResponse as Response, mockNext);

      expect(Board.findByIdAndUpdate).toHaveBeenCalledWith(boardId, updateData, { new: true });
      expect(mockPopulateMethod).toHaveBeenCalledWith([
        { path: 'owner', select: 'username email' },
        { path: 'members', select: 'username email' }
      ]);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockPopulatedBoard,
      });
    });
  });

  describe('createBoard', () => {
    it('should create and populate a board successfully', async () => {
      const ownerId = new mongoose.Types.ObjectId();
      const createData = { title: 'New Board', description: 'Test board description', owner: ownerId, members: [] };
      const mockPopulatedBoard = {
        _id: new mongoose.Types.ObjectId(),
        ...createData,
        owner: { _id: ownerId, username: 'owner', email: 'owner@example.com' },
        members: [],
      };
      mockRequest = { body: createData };
      vi.mocked(Board.create).mockResolvedValue([mockPopulatedBoard] as any);

      await createBoard(mockRequest as Request, mockResponse as Response, mockNext);

      expect(Board.create).toHaveBeenCalledWith(
        [
          { title: 'New Board', description: 'Test board description', owner: ownerId, members: [] }
        ],
        { populate: ['owner', 'members'] }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockPopulatedBoard,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
    
    it('should handle errors and pass to next middleware', async () => {
      const createData = { title: 'New Board', owner: new mongoose.Types.ObjectId() };
      const error = new Error('Database error');
      mockRequest = { body: createData };
      vi.mocked(Board.create).mockRejectedValue(error);
      await createBoard(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should return 400 if required fields are missing', async () => {
      const createData = { title: '' };
      mockRequest = { body: createData };
      await createBoard(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Title and owner are required',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});