import { Request, Response } from 'express';
import { HealthController } from '../../controllers/healthController';
import { HealthService } from '../../services/healthService';

// Mock the underlying service layer completely
jest.mock('../../services/healthService');

describe('Health Controller', () => {
    let controller: HealthController;
    let mockHealthServiceInstance: jest.Mocked<HealthService>;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let responseStatusMock: jest.Mock;
    let responseJsonMock: jest.Mock;

    beforeEach(() => {
        // Clear mocks and fetch references
        jest.clearAllMocks();
        mockHealthServiceInstance = HealthService.prototype as jest.Mocked<HealthService>;
        
        // Instantiate the controller (which picks up the mocked HealthService prototype)
        controller = new HealthController();

        // Standard Express Request and Response mocking setups
        mockRequest = {};
        responseJsonMock = jest.fn();
        responseStatusMock = jest.fn().mockReturnValue({ json: responseJsonMock });
        mockResponse = {
            status: responseStatusMock,
        };
    });

    it('should return HTTP 200 when system health payload status is Healthy', () => {
        // Arrange
        const mockHealthyPayload = {
            status: "Healthy",
            timestamp: new Date(),
            uptime: 120,
            services: { express: "Up", mongodb: "Connected" }
        };
        mockHealthServiceInstance.checkHealth.mockReturnValue(mockHealthyPayload);

        // Act
        controller.healthCheck(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(responseStatusMock).toHaveBeenCalledWith(200);
        expect(responseJsonMock).toHaveBeenCalledWith(mockHealthyPayload);
    });

    it('should return HTTP 503 when system health payload status is Unhealthy', () => {
        // Arrange
        const mockUnhealthyPayload = {
            status: "Unhealthy",
            timestamp: new Date(),
            uptime: 120,
            services: { express: "Up", mongodb: "Disconnected" }
        };
        mockHealthServiceInstance.checkHealth.mockReturnValue(mockUnhealthyPayload);

        // Act
        controller.healthCheck(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(responseStatusMock).toHaveBeenCalledWith(503);
        expect(responseJsonMock).toHaveBeenCalledWith(mockUnhealthyPayload);
    });

    it('should return HTTP 500 when an unexpected internal error is thrown', () => {
        // Arrange
        mockHealthServiceInstance.checkHealth.mockImplementation(() => {
            throw new Error("Database query timed out");
        });

        // Act
        controller.healthCheck(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(responseStatusMock).toHaveBeenCalledWith(500);
        expect(responseJsonMock).toHaveBeenCalledWith(expect.objectContaining({
            status: "Error",
            message: "Internal tracking failure"
        }));
    });
});