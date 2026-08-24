import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import healthRouter from '../../routes/healthRoutes';

// 1. Initialize your trace spies inside vi.hoisted so they initialize first
const { hoistedCheckHealth } = vi.hoisted(() => {
  return {
    hoistedCheckHealth: vi.fn()
  };
});

// 2. Mock the module using a true ES6 Class structure
vi.mock('../../services/healthService', () => {
  return {
    HealthService: class {
      // Every "new HealthService()" will execute this exact method mapping
      checkHealth = hoistedCheckHealth;
    }
  };
});

describe('Health Router Integration', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use('/health', healthRouter);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return 200 when the backend service layer reports healthy state', async () => {
    const mockPayload = {
      status: "Healthy",
      timestamp: new Date(),
      uptime: 100,
      services: { express: "Up", mongodb: "Connected" }
    };
    
    // 3. Update your assertions to target the stable hoisted spy
    hoistedCheckHealth.mockReturnValue(mockPayload);

    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("Healthy");
    expect(hoistedCheckHealth).toHaveBeenCalledTimes(1);
  });

  it('should return 503 when the backend service layer reports unhealthy state', async () => {
    const mockPayload = {
      status: "Unhealthy",
      timestamp: new Date(),
      uptime: 100,
      services: { express: "Up", mongodb: "Disconnected" }
    };
    
    hoistedCheckHealth.mockReturnValue(mockPayload);

    const response = await request(app).get('/health');

    expect(response.status).toBe(503);
    expect(response.body.status).toBe("Unhealthy");
  });
});