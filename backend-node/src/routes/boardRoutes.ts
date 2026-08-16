import { Router } from 'express';
import { getAllBoards, getBoardsByUser } from '../controllers/boardController';

const boardRouter = Router();

/**
 * GET /api/boards
 * Get all boards from the database
 */
boardRouter.get('/', getAllBoards);

/**
 * GET /api/boards/user/:userId
 * Get all boards for a specific user (owned or as member)
 */
boardRouter.get('/user/:userId', getBoardsByUser);

export default boardRouter;
