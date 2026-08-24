import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import mongoose from 'mongoose';
import { HealthService } from '../../services/healthService';

// 1. Mock the mongoose module cleanly at the top level
vi.mock('mongoose', () => ({
  default: {
    connection: {
      readyState: 0 // Default to disconnected
    }
  },
  connection: {
    readyState: 0 // For named imports
  }
}));

describe('HealthService', () => {
  let healthService: HealthService;

  beforeEach(() => {
    healthService = new HealthService();
    vi.clearAllMocks();
    
    // 2. Mock process.uptime safely using vi.spyOn
    vi.spyOn(process, 'uptime').mockReturnValue(42);
  });

  afterEach(() => {
    // 3. Native teardown of process runtime spies
    vi.restoreAllMocks();
  });

  it('should return Healthy status when MongoDB is connected (readyState === 1)', () => {
    // Arrange: Force mongoose connection state to connected
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
    // Arrange: 2 means connecting
    (mongoose.connection as any).readyState = 2;

    // Act
    const result = healthService.checkHealth();

    // Assert
    expect(result.status).toBe('Unhealthy');
    expect(result.services.mongodb).toBe('Disconnected');
  });
});