import express from 'express';
import request from 'supertest';
import healthRouter from '../../routes/healthRoutes';
import { HealthService } from '../../services/healthService';

jest.mock('../../services/healthService');

describe('Health Router Integration', () => {
    let app: express.Application;
    let mockCheckHealth: jest.Mock;

    beforeEach(() => {
        app = express();
        app.use('/health', healthRouter);

        // 2. Safely grab a reference to the mocked service method
        mockCheckHealth = HealthService.prototype.checkHealth as jest.Mock;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 200 when the backend service layer reports healthy state', async () => {
        // Arrange: Fake a healthy payload response
        mockCheckHealth.mockReturnValue({
            status: "Healthy",
            timestamp: new Date(),
            uptime: 100,
            services: { express: "Up", mongodb: "Connected" }
        });

        // Act
        const response = await request(app).get('/health');

        // Assert
        expect(response.status).toBe(200);
        expect(response.body.status).toBe("Healthy");
        expect(mockCheckHealth).toHaveBeenCalledTimes(1);
    });

    it('should return 503 when the backend service layer reports unhealthy state', async () => {
        // Arrange: Fake an infrastructure failure payload
        mockCheckHealth.mockReturnValue({
            status: "Unhealthy",
            timestamp: new Date(),
            uptime: 100,
            services: { express: "Up", mongodb: "Disconnected" }
        });

        // Act
        const response = await request(app).get('/health');

        // Assert
        expect(response.status).toBe(503);
        expect(response.body.status).toBe("Unhealthy");
    });
});