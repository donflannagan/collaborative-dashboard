import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { gatewayRouter } from './middleware/router';
import { backends } from './config/backends';

dotenv.config();

const app = express();
const PORT = process.env.GATEWAY_PORT || 8080;

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    gateway: 'collaborative-dashboard-gateway',
  });
});

// Status endpoint - shows available backends
app.get('/status', (req: Request, res: Response) => {
  res.json({
    status: 'running',
    timestamp: new Date().toISOString(),
    gateway: 'collaborative-dashboard-gateway',
    backends: backends.map((b) => ({
      name: b.name,
      prefix: b.prefix,
      target: b.target,
    })),
  });
});

// API Documentation
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Collaborative Dashboard API Gateway',
    version: '1.0.0',
    documentation: {
      health: 'GET /health',
      status: 'GET /status',
      routes: {
        'Node.js Backend': '/api/node/*',
        'FastAPI Backend': '/api/fastapi/*',
        'Java Backend': '/api/java/*',
        'C# Backend': '/api/csharp/*',
      },
      examples: {
        getAllBoards: {
          node: 'GET /api/node/boards',
          fastapi: 'GET /api/fastapi/boards',
          java: 'GET /api/java/boards',
          csharp: 'GET /api/csharp/boards',
        },
        getTasksByBoard: {
          node: 'GET /api/node/tasks/board/:boardId',
          fastapi: 'GET /api/fastapi/tasks/board/:boardId',
          java: 'GET /api/java/tasks/board/:boardId',
        },
      },
    },
  });
});

// Main routing middleware - handle all /api/* routes
app.use(gatewayRouter);

// Error handling middleware
app.use((err: any, req: Request, res: Response) => {
  console.error('Gateway error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 API Gateway running on http://localhost:${PORT}`);
  console.log(`\n📍 Available backends:`);
  backends.forEach((b) => {
    console.log(`   - ${b.name}: ${b.prefix} → ${b.target}`);
  });
  console.log(`\n📖 API Documentation: http://localhost:${PORT}/`);
  console.log(`💊 Health Check: http://localhost:${PORT}/health`);
  console.log(`📊 Status: http://localhost:${PORT}/status\n`);
});

export { app };
