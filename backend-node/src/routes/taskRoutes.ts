import { Router } from 'express';
import { getTasksByBoard, getTaskById, addTask, updateTask, deleteTask, getTasksByUser } from '../controllers/taskController';

const taskRouter = Router();

taskRouter.get('/board/:boardId', getTasksByBoard);
taskRouter.get('/:taskId', getTaskById);
taskRouter.post('/add', addTask);
taskRouter.put('/update', updateTask);
taskRouter.delete('/delete/:taskId', deleteTask);
taskRouter.get('/user/:userId', getTasksByUser);

export default taskRouter;

