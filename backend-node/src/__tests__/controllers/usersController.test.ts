import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import {
  createUser,
  deleteUserById,
  getAllUsers,
  getUserByEmail,
  getUserById,
  getUserByUsername,
  updateUserById,
} from '../../controllers/usersController';
import { User } from '../../models/User';

vi.mock('../../models/User', () => ({
  User: {
    find: vi.fn(),
    findById: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    findByIdAndDelete: vi.fn(),
    findByIdAndUpdate: vi.fn(),
  },
}));

describe('Users Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  const user = {
    _id: new mongoose.Types.ObjectId(),
    email: 'test@example.com',
    username: 'testuser',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-02T00:00:00.000Z'),
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

  describe('lookup endpoints', () => {
    it.each([
      ['getUserById', getUserById, 'userId', user._id.toString(), { findById: user }],
      ['getUserByUsername', getUserByUsername, 'username', user.username, { findOne: user }],
      ['getUserByEmail', getUserByEmail, 'email', user.email, { findOne: user }],
    ])('%s returns the full user in the standard envelope', async (_name, handler, parameter, value, query) => {
      mockRequest = { params: { [parameter]: value } };

      if ('findById' in query) {
        vi.mocked(User.findById).mockResolvedValue(query.findById as any);
      } else {
        vi.mocked(User.findOne).mockResolvedValue(query.findOne as any);
      }

      await handler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: [user],
        count: 1,
      });
    });

    it('returns an unsuccessful empty envelope when a user is not found', async () => {
      mockRequest = { params: { userId: user._id.toString() } };
      vi.mocked(User.findById).mockResolvedValue(null);

      await getUserById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        data: [],
        count: 0,
      });
    });

    it.each([
      ['getUserByUsername', getUserByUsername, 'username', user.username],
      ['getUserByEmail', getUserByEmail, 'email', user.email],
    ])('%s returns an unsuccessful empty envelope when a user is not found', async (_name, handler, parameter, value) => {
      mockRequest = { params: { [parameter]: value } };
      vi.mocked(User.findOne).mockResolvedValue(null);

      await handler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        data: [],
        count: 0,
      });
    });

    it.each([
      ['getUserById', getUserById, 'User ID is required'],
      ['getUserByUsername', getUserByUsername, 'Username is required'],
      ['getUserByEmail', getUserByEmail, 'Email is required'],
    ])('%s returns 400 when its lookup parameter is missing', async (_name, handler, expectedError) => {
      mockRequest = { params: {} };

      await handler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: expectedError,
      });
      expect(User.findById).not.toHaveBeenCalled();
      expect(User.findOne).not.toHaveBeenCalled();
    });
  });

  describe('getAllUsers', () => {
    it('returns all users and their full fields', async () => {
      vi.mocked(User.find).mockResolvedValue([user] as any);

      await getAllUsers(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: [user],
        count: 1,
      });
    });
  });

  describe('mutating endpoints', () => {
    it('creates a user with a 201 response and standard envelope', async () => {
      const password = 'test-password';
      mockRequest = { body: { email: user.email, username: user.username, password } };
      vi.mocked(User.create).mockResolvedValue(user as any);

      await createUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(User.create).toHaveBeenCalledWith({ email: user.email, username: user.username, password });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({ success: true, data: [user], count: 1 });
    });

    it('updates a user and returns the updated document', async () => {
      mockRequest = {
        params: { userId: user._id.toString() },
        body: { email: user.email, username: user.username },
      };
      vi.mocked(User.findByIdAndUpdate).mockResolvedValue(user as any);

      await updateUserById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        user._id.toString(),
        { email: user.email, username: user.username },
        { new: true, runValidators: true },
      );
      expect(mockResponse.json).toHaveBeenCalledWith({ success: true, data: [user], count: 1 });
    });

    it('deletes a user and returns the deleted document', async () => {
      mockRequest = { params: { userId: user._id.toString() } };
      vi.mocked(User.findByIdAndDelete).mockResolvedValue(user as any);

      await deleteUserById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(User.findByIdAndDelete).toHaveBeenCalledWith(user._id.toString());
      expect(mockResponse.json).toHaveBeenCalledWith({ success: true, data: [user], count: 1 });
    });

    it('returns an unsuccessful empty envelope when update finds no user', async () => {
      mockRequest = {
        params: { userId: user._id.toString() },
        body: { email: user.email, username: user.username },
      };
      vi.mocked(User.findByIdAndUpdate).mockResolvedValue(null);

      await updateUserById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ success: false, data: [], count: 0 });
    });

    it('returns an unsuccessful empty envelope when delete finds no user', async () => {
      mockRequest = { params: { userId: user._id.toString() } };
      vi.mocked(User.findByIdAndDelete).mockResolvedValue(null);

      await deleteUserById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ success: false, data: [], count: 0 });
    });

    it('returns 400 when delete is missing a userId', async () => {
      mockRequest = { params: {} };

      await deleteUserById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ success: false, error: 'User ID is required' });
      expect(User.findByIdAndDelete).not.toHaveBeenCalled();
    });

    it('returns 400 when update is missing a userId', async () => {
      mockRequest = { params: {}, body: { email: user.email, username: user.username } };

      await updateUserById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ success: false, error: 'User ID is required' });
      expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('returns 400 when update is missing email or username', async () => {
      mockRequest = { params: { userId: user._id.toString() }, body: { email: user.email } };

      await updateUserById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Email and username are required',
      });
      expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('returns 400 when create data is incomplete', async () => {
      mockRequest = { body: { email: user.email } };

      await createUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Email, username, and password are required',
      });
      expect(User.create).not.toHaveBeenCalled();
    });
  });

  it('passes database errors to the next middleware', async () => {
    const error = new Error('Database connection failed');
    mockRequest = { params: { userId: user._id.toString() } };
    vi.mocked(User.findById).mockRejectedValue(error);

    await getUserById(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
  });

  it.each([
    ['getUserByUsername', getUserByUsername, 'username', user.username],
    ['getUserByEmail', getUserByEmail, 'email', user.email],
  ])('passes database errors to the next middleware for %s', async (_name, handler, parameter, value) => {
    const error = new Error('Database connection failed');
    mockRequest = { params: { [parameter]: value } };
    vi.mocked(User.findOne).mockRejectedValue(error);

    await handler(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
  });

  it('passes database errors to the next middleware for getAllUsers', async () => {
    const error = new Error('Database connection failed');
    vi.mocked(User.find).mockRejectedValue(error);

    await getAllUsers(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
  });

  it('passes database errors to the next middleware for createUser', async () => {
    const error = new Error('Database connection failed');
    mockRequest = { body: { email: user.email, username: user.username, password: 'test-password' } };
    vi.mocked(User.create).mockRejectedValue(error);

    await createUser(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
  });

  it('passes database errors to the next middleware for updateUserById', async () => {
    const error = new Error('Database connection failed');
    mockRequest = {
      params: { userId: user._id.toString() },
      body: { email: user.email, username: user.username },
    };
    vi.mocked(User.findByIdAndUpdate).mockRejectedValue(error);

    await updateUserById(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
  });

  it('passes database errors to the next middleware for deleteUserById', async () => {
    const error = new Error('Database connection failed');
    mockRequest = { params: { userId: user._id.toString() } };
    vi.mocked(User.findByIdAndDelete).mockRejectedValue(error);

    await deleteUserById(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
  });
});
