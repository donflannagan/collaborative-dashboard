import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import boardRoutes from '../../routes/boardRoutes';
import * as boardController from '../../controllers/boardController';

// Mock the controller
jest.mock('../../controllers/boardController');

const app = express();
app.use(express.json());
app.use('/api/boards', boardRoutes);

describe('Board Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/boards', () => {
    it('should call getAllBoards controller', async () => {
      (boardController.getAllBoards as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: [],
          count: 0,
        });
      });

      const response = await request(app).get('/api/boards');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: [],
        count: 0,
      });
      expect(boardController.getAllBoards).toHaveBeenCalled();
    });

    it('should handle errors from controller', async () => {
      (boardController.getAllBoards as jest.Mock).mockImplementation((req, res, next) => {
        next(new Error('Internal server error'));
      });

      const response = await request(app).get('/api/boards');

      expect(boardController.getAllBoards).toHaveBeenCalled();
    });
  });

  describe('GET /api/boards/user/:userId', () => {
    it('should call getBoardsByUser controller with userId param', async () => {
      const userId = new mongoose.Types.ObjectId().toString();

      (boardController.getBoardsByUser as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: [],
          count: 0,
        });
      });

      const response = await request(app).get(`/api/boards/user/${userId}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: [],
        count: 0,
      });
      expect(boardController.getBoardsByUser).toHaveBeenCalled();
    });

    it('should pass userId parameter to controller', async () => {
      const userId = new mongoose.Types.ObjectId().toString();

      let capturedReq: any;
      (boardController.getBoardsByUser as jest.Mock).mockImplementation((req, res) => {
        capturedReq = req;
        res.status(200).json({
          success: true,
          data: [],
          count: 0,
        });
      });

      await request(app).get(`/api/boards/user/${userId}`);

      expect(capturedReq.params.userId).toBe(userId);
    });

    it('should handle errors from controller', async () => {
      const userId = new mongoose.Types.ObjectId().toString();

      (boardController.getBoardsByUser as jest.Mock).mockImplementation((req, res, next) => {
        next(new Error('Internal server error'));
      });

      const response = await request(app).get(`/api/boards/user/${userId}`);

      expect(boardController.getBoardsByUser).toHaveBeenCalled();
    });
  });
});
