// Jest setup file for test configuration
import mongoose from 'mongoose';

// Disable MongoDB connection warnings in tests
mongoose.set('strictQuery', false);

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost:27017/collaborative-dashboard-test';
process.env.JWT_SECRET = 'test-secret';
