import { Router } from 'express';
import { HealthController } from '../controllers/healthController';

const healthRouter = Router();
const controller = new HealthController();

// Define health endpoint
healthRouter.get('/', controller.healthCheck);

export default healthRouter;