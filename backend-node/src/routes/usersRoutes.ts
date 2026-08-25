import { Router } from 'express';
import {
  getUserById,
  getUserByUsername,
  getUserByEmail,
  getAllUsers,
  createUser,
  deleteUserById,
  updateUserById,
} from '../controllers/usersController';

const usersRouter = Router();

usersRouter.get('/by-userId/:userId', getUserById);
usersRouter.get('/by-username/:username', getUserByUsername);
usersRouter.get('/by-email/:email', getUserByEmail);
usersRouter.get('/', getAllUsers);
usersRouter.post('/', createUser);
usersRouter.delete('/delete/:userId', deleteUserById);
usersRouter.put('/update/:userId', updateUserById);

export default usersRouter;
