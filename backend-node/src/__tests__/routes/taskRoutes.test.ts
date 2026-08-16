import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import taskRoutes from '../../routes/taskRoutes';
import * as taskController from '../../controllers/taskController';

// Mock the controller
jest.mock('../../controllers/taskController');

const app = express();
app.use(express.json());
app.use('/api/tasks', taskRoutes);

describe('Task Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/tasks/board/:boardId', () => {
    it('should call getTasksByBoard controller with boardId param', async () => {
      const boardId = new mongoose.Types.ObjectId().toString();

      (taskController.getTasksByBoard as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: [],
          count: 0,
        });
      });

      const response = await request(app).get(`/api/tasks/board/${boardId}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: [],
        count: 0,
      });
      expect(taskController.getTasksByBoard).toHaveBeenCalled();
    });

    it('should return tasks with full data structure', async () => {
      const boardId = new mongoose.Types.ObjectId().toString();
      const mockTasks = [
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Implement auth',
          boardId,
          columnId: 'In Progress',
          position: 1,
          assignee: { _id: new mongoose.Types.ObjectId(), username: 'alice', email: 'alice@example.com' },
          priority: 'high',
          createdBy: { _id: new mongoose.Types.ObjectId(), username: 'bob', email: 'bob@example.com' },
        },
      ];

      (taskController.getTasksByBoard as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: mockTasks,
          count: 1,
        });
      });

      const response = await request(app).get(`/api/tasks/board/${boardId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].title).toBe('Implement auth');
    });

    it('should pass boardId parameter to controller', async () => {
      const boardId = new mongoose.Types.ObjectId().toString();

      let capturedReq: any;
      (taskController.getTasksByBoard as jest.Mock).mockImplementation((req, res) => {
        capturedReq = req;
        res.status(200).json({
          success: true,
          data: [],
          count: 0,
        });
      });

      await request(app).get(`/api/tasks/board/${boardId}`);

      expect(capturedReq.params.boardId).toBe(boardId);
    });

    it('should handle errors from controller', async () => {
      const boardId = new mongoose.Types.ObjectId().toString();

      (taskController.getTasksByBoard as jest.Mock).mockImplementation((req, res, next) => {
        next(new Error('Database error'));
      });

      const response = await request(app).get(`/api/tasks/board/${boardId}`);

      expect(taskController.getTasksByBoard).toHaveBeenCalled();
    });

    it('should handle missing boardId in URL', async () => {
      (taskController.getTasksByBoard as jest.Mock).mockImplementation((req, res) => {
        // Controller validates boardId, so this should not be called
        res.status(400).json({
          success: false,
          error: 'Board ID is required',
        });
      });

      // This tests that the route properly captures the boardId parameter
      const response = await request(app).get('/api/tasks/board/');

      // When no boardId is provided, the route parameter is empty
      // Express still calls the handler but with empty params.boardId
      expect(response.status).toBe(404); // Route not found because no ID provided
    });
  });
});
