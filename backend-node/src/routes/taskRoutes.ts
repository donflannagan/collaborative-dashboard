import { Router } from 'express';
import { getTasksByBoard } from '../controllers/taskController';

const taskRouter = Router();

/**
 * GET /api/tasks/board/:boardId
 * Get all tasks for a specific board
 */
taskRouter.get('/board/:boardId', getTasksByBoard);

export default taskRouter;
