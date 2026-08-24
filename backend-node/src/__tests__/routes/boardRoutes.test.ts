import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import boardRoutes from '../../routes/boardRoutes';
import * as boardController from '../../controllers/boardController';

// 1. Explicitly mock the entire controller file cleanly up front
vi.mock('../../controllers/boardController', () => {
  return {
    getAllBoards: vi.fn(),
    getBoardsByUser: vi.fn(),
    deleteBoard: vi.fn(),
    createBoard: vi.fn(),
    updateBoard: vi.fn(),
  };
});

const app = express();
app.use(express.json());
app.use('/api/boards', boardRoutes);

describe('Board Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/boards', () => {
    it('should call getAllBoards controller', async () => {
      // 2. No "as jest.Mock" overhead needed anymore
      vi.mocked(boardController.getAllBoards).mockImplementation(async (req: any, res: any) => {
        res.status(200).json({ success: true, data: [], count: 0 });
      });

      const response = await request(app).get('/api/boards');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true, data: [], count: 0 });
      expect(boardController.getAllBoards).toHaveBeenCalled();
    });

    it('should handle errors from controller', async () => {
      vi.mocked(boardController.getAllBoards).mockImplementation(async (req: any, res: any, next: any) => {
        next(new Error('Internal server error'));
      });

      await request(app).get('/api/boards');
      
      expect(boardController.getAllBoards).toHaveBeenCalled();
    });
  });

  describe('GET /api/boards/user/:userId', () => {
    it('should call getBoardsByUser controller with userId param', async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      
      vi.mocked(boardController.getBoardsByUser).mockImplementation(async (req: any, res: any) => {
        res.status(200).json({ success: true, data: [], count: 0 });
      });

      const response = await request(app).get(`/api/boards/user/${userId}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true, data: [], count: 0 });
      expect(boardController.getBoardsByUser).toHaveBeenCalled();
    });

    it('should pass userId parameter to controller', async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      let capturedReq: any;

      vi.mocked(boardController.getBoardsByUser).mockImplementation(async (req: any, res: any) => {
        capturedReq = req;
        res.status(200).json({ success: true, data: [], count: 0 });
      });

      await request(app).get(`/api/boards/user/${userId}`);
      
      expect(capturedReq.params.userId).toBe(userId);
    });

    it('should handle errors from controller', async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      
      vi.mocked(boardController.getBoardsByUser).mockImplementation(async (req: any, res: any, next: any) => {
        next(new Error('Internal server error'));
      });

      await request(app).get(`/api/boards/user/${userId}`);
      
      expect(boardController.getBoardsByUser).toHaveBeenCalled();
    });
  });
});