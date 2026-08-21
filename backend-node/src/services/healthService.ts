import mongoose from 'mongoose';
import { IHealth, ICoreServices } from '../models/Health';

export class HealthService {
    /**
     * Checks infrastructure dependencies and returns unified application health state
     */
    public checkHealth(): IHealth {
        // Mongoose readyState values: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
        const isMongoConnected = mongoose.connection.readyState === 1;

        const services: ICoreServices = {
            express: "Up",
            mongodb: isMongoConnected ? "Connected" : "Disconnected"
        };

        const isSystemHealthy = isMongoConnected;

        return {
            status: isSystemHealthy ? "Healthy" : "Unhealthy",
            timestamp: new Date(),
            uptime: process.uptime(), // Native Node.js uptime tracking in seconds
            services
        };
    }
}