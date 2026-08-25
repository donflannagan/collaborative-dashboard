import { beforeEach, describe, expect, it, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import usersRouter from '../../routes/usersRoutes';
import * as usersController from '../../controllers/usersController';

vi.mock('../../controllers/usersController', () => ({
  getUserById: vi.fn(),
  getUserByUsername: vi.fn(),
  getUserByEmail: vi.fn(),
  getAllUsers: vi.fn(),
  createUser: vi.fn(),
  deleteUserById: vi.fn(),
  updateUserById: vi.fn(),
}));

const app = express();
app.use(express.json());
app.use('/api/users', usersRouter);

describe('Users Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    ['/api/users', 'getAllUsers', 'get'],
    ['/api/users/by-userId/user-1', 'getUserById', 'get'],
    ['/api/users/by-username/testuser', 'getUserByUsername', 'get'],
    ['/api/users/by-email/test%40example.com', 'getUserByEmail', 'get'],
  ])('%s routes to %s', async (path, controllerName, method) => {
    const controller = vi.mocked(usersController[controllerName as keyof typeof usersController]);
    controller.mockImplementation(async (req: any, res: any) => {
      res.status(200).json({ success: true, data: [], count: 0 });
    });

    const response = await request(app)[method as 'get'](path);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true, data: [], count: 0 });
    expect(controller).toHaveBeenCalledTimes(1);
  });

  it('forwards the userId parameter', async () => {
    let capturedRequest: any;
    vi.mocked(usersController.getUserById).mockImplementation(async (req: any, res: any) => {
      capturedRequest = req;
      res.status(200).json({ success: true, data: [], count: 0 });
    });

    await request(app).get('/api/users/by-userId/user-1');

    expect(capturedRequest.params.userId).toBe('user-1');
  });

  it('routes create, update, and delete operations', async () => {
    const handlers = [
      { method: 'post', path: '/api/users', controller: usersController.createUser },
      { method: 'put', path: '/api/users/update/user-1', controller: usersController.updateUserById },
      { method: 'delete', path: '/api/users/delete/user-1', controller: usersController.deleteUserById },
    ] as const;

    for (const { method, path, controller } of handlers) {
      vi.mocked(controller).mockImplementation(async (_req: any, res: any) => {
        res.status(method === 'post' ? 201 : 200).json({ success: true, data: [], count: 0 });
      });

      const response = await request(app)[method](path);

      expect(response.status).toBe(method === 'post' ? 201 : 200);
      expect(response.body).toEqual({ success: true, data: [], count: 0 });
      expect(controller).toHaveBeenCalledTimes(1);
      vi.clearAllMocks();
    }
  });

  it('passes JSON request bodies to create and update handlers', async () => {
    const body = { email: 'test@example.com', username: 'testuser' };
    let createRequest: any;
    let updateRequest: any;

    vi.mocked(usersController.createUser).mockImplementation(async (req: any, res: any) => {
      createRequest = req;
      res.status(201).json({ success: true, data: [], count: 0 });
    });
    vi.mocked(usersController.updateUserById).mockImplementation(async (req: any, res: any) => {
      updateRequest = req;
      res.status(200).json({ success: true, data: [], count: 0 });
    });

    await request(app).post('/api/users').send(body);
    await request(app).put('/api/users/update/user-1').send(body);

    expect(createRequest.body).toEqual(body);
    expect(updateRequest.params.userId).toBe('user-1');
    expect(updateRequest.body).toEqual(body);
  });
});
