import mongoose from 'mongoose';
import { HealthService } from '../../services/healthService';

// Mock the whole mongoose module
jest.mock('mongoose', () => ({
    connection: {
        readyState: 0 // Default to disconnected
    }
}));

describe('HealthService', () => {
    let healthService: HealthService;

    beforeEach(() => {
        healthService = new HealthService();
        jest.clearAllMocks();
        
        // Mock process.uptime to return a fixed number for consistency
        jest.spyOn(process, 'uptime').mockReturnValue(42);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should return Healthy status when MongoDB is connected (readyState === 1)', () => {
        // Arrange: Explicitly force mongoose connection state to connected
        (mongoose.connection as any).readyState = 1;

        // Act
        const result = healthService.checkHealth();

        // Assert
        expect(result.status).toBe('Healthy');
        expect(result.uptime).toBe(42);
        expect(result.services.mongodb).toBe('Connected');
        expect(result.services.express).toBe('Up');
        expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('should return Unhealthy status when MongoDB is disconnected (readyState === 0)', () => {
        // Arrange: Force mongoose connection state to disconnected
        (mongoose.connection as any).readyState = 0;

        // Act
        const result = healthService.checkHealth();

        // Assert
        expect(result.status).toBe('Unhealthy');
        expect(result.services.mongodb).toBe('Disconnected');
        expect(result.services.express).toBe('Up');
    });

    it('should return Unhealthy status when MongoDB is connecting (readyState === 2)', () => {
        // Arrange: 2 means connecting, which is still technically down for handling traffic
        (mongoose.connection as any).readyState = 2;

        // Act
        const result = healthService.checkHealth();

        // Assert
        expect(result.status).toBe('Unhealthy');
        expect(result.services.mongodb).toBe('Disconnected');
    });
});