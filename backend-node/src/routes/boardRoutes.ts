import { Router } from 'express';
import { getAllBoards, getBoardsByUser, createBoard, updateBoard, deleteBoard } from '../controllers/boardController';

const boardRouter = Router();

boardRouter.get('/', getAllBoards);
boardRouter.get('/user/:userId', getBoardsByUser);
boardRouter.post('/', createBoard);
boardRouter.put('/:boardId', updateBoard);
boardRouter.delete('/:boardId', deleteBoard);

export default boardRouter;
