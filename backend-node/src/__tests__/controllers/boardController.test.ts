import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { getAllBoards, getBoardsByUser, deleteBoard, createBoard, updateBoard } from '../../controllers/boardController';
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

      (Board.findByIdAndDelete as jest.Mock).mockResolvedValue(mockBoard);

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

      (Board.findByIdAndDelete as jest.Mock).mockRejectedValue(error);

      await deleteBoard(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
  
    describe('updateBoard', () => {
      let mockRequest: Partial<Request>;
      let mockResponse: Partial<Response>;
      let mockNext: NextFunction;

      beforeEach(() => {
        mockResponse = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };
        mockNext = jest.fn();
        jest.clearAllMocks();
      });

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

        // 1. Create a mock populate function to track calls directly on this document instance
        const mockPopulateMethod = jest.fn().mockResolvedValue(mockPopulatedBoard);

        const mockMongooseDoc = {
          ...mockSavedBoard,
          populate: mockPopulateMethod, // Injects the spy directly on the returned object
        };

        // 2. Resolve findByIdAndUpdate with our customized mock document
        const updateSpy = jest.spyOn(Board, 'findByIdAndUpdate').mockResolvedValue(mockMongooseDoc as any);

        // Act
        await updateBoard(mockRequest as Request, mockResponse as Response, mockNext);

        // Assert
        expect(updateSpy).toHaveBeenCalledWith(boardId, updateData, { new: true });
        
        // 3. Assert directly against the method attached to the document object
        expect(mockPopulateMethod).toHaveBeenCalledWith([
          { path: 'owner', select: 'username email' },
          { path: 'members', select: 'username email' }
        ]);
        
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: true,
          data: mockPopulatedBoard,
        });

        updateSpy.mockRestore();
      });
    });

    describe('createBoard', () => {
      let mockRequest: Partial<Request>;
      let mockResponse: Partial<Response>;
      let mockNext: NextFunction;

      beforeEach(() => {
        mockResponse = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };
        mockNext = jest.fn();
        jest.clearAllMocks();
      });

      it('should create and populate a board successfully', async () => {
        const ownerId = new mongoose.Types.ObjectId();
        
        const createData = { 
          title: 'New Board', 
          description: 'Test board description',
          owner: ownerId,
          members: []
        };

        const mockPopulatedBoard = {
          _id: new mongoose.Types.ObjectId(),
          ...createData,
          owner: { _id: ownerId, username: 'owner', email: 'owner@example.com' },
          members: [],
        };

        mockRequest = { body: createData };
        const createSpy = jest.spyOn(Board, 'create').mockResolvedValue([mockPopulatedBoard] as any);

        // Act
        await createBoard(mockRequest as Request, mockResponse as Response, mockNext);
        expect(createSpy).toHaveBeenCalledWith(
          [
            {
              title: 'New Board',
              description: 'Test board description',
              owner: ownerId,
              members: []
            }
          ],
          { populate: ['owner', 'members'] }
        );

        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: true,
          data: mockPopulatedBoard,
        });
        
        expect(mockNext).not.toHaveBeenCalled();

        // Clean up spy
        createSpy.mockRestore();
      });

      it('should handle errors and pass to next middleware', async () => {
        const createData = { 
          title: 'New Board', 
          owner: new mongoose.Types.ObjectId() 
        };
        const error = new Error('Database error');
        mockRequest = { body: createData };

        // FIX 1: Use jest.spyOn to match the mocking strategy of the success test
        const createSpy = jest.spyOn(Board, 'create').mockRejectedValue(error);

        await createBoard(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).toHaveBeenCalledWith(error);
        
        // Clean up spy
        createSpy.mockRestore();
      });

      it('should return 400 if required fields are missing', async () => {
        const createData = { title: '' }; // Missing owner field
        mockRequest = { body: createData };

        await createBoard(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        // FIX 2: Update the key to 'error' and the text to match your controller's exact string
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          error: 'Title and owner are required',
        });
        
        expect(mockNext).not.toHaveBeenCalled();
      });
    });
});
