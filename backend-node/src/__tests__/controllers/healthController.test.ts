import { describe, it, expect, beforeEach, vi, type Mocked } from 'vitest';
import type { Request, Response } from 'express';
import { HealthController } from '../../controllers/healthController';
import { HealthService } from '../../services/healthService';

// 1. Create a tracking mock function reference inside a hoisted loop
const { hoistedCheckHealth } = vi.hoisted(() => {
  return {
    hoistedCheckHealth: vi.fn()
  };
});

// 2. Use a modern ES6 class definition to eliminate the warning trace
vi.mock('../../services/healthService', () => {
  return {
    HealthService: class {
      // Maps the constructor instance method directly to the spy tracker
      checkHealth = hoistedCheckHealth;
    }
  };
});

describe('Health Controller', () => {
  let controller: HealthController;
  let mockHealthServiceInstance: Mocked<HealthService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseStatusMock: any;
  let responseJsonMock: any;

  beforeEach(() => {
    // 2. Clear all mocks natively
    vi.clearAllMocks();

    // 3. Create a clean instance of the controller
    controller = new HealthController();
    
    // 4. Extract the mocked instance with clean, native type safety
    mockHealthServiceInstance = (controller as any).healthService || HealthService.prototype;

    // 5. Standard Express Request and Response mock setups using vi.fn()
    mockRequest = {};
    responseJsonMock = vi.fn();
    responseStatusMock = vi.fn().mockReturnValue({ json: responseJsonMock });
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
    vi.mocked(mockHealthServiceInstance.checkHealth).mockReturnValue(mockHealthyPayload);

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
    vi.mocked(mockHealthServiceInstance.checkHealth).mockReturnValue(mockUnhealthyPayload);

    // Act
    controller.healthCheck(mockRequest as Request, mockResponse as Response);

    // Assert
    expect(responseStatusMock).toHaveBeenCalledWith(503);
    expect(responseJsonMock).toHaveBeenCalledWith(mockUnhealthyPayload);
  });

  it('should return HTTP 500 when an unexpected internal error is thrown', () => {
    // Arrange
    vi.mocked(mockHealthServiceInstance.checkHealth).mockImplementation(() => {
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