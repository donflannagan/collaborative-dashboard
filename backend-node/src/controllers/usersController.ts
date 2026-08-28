import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';

export async function getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({ success: false, error: 'User ID is required' });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(200).json(emptyUserResponse());
      return;
    }

    res.status(200).json(userResponse(user));
  } catch (error) {
    next(error);
  }
}

export async function getUserByUsername(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { username } = req.params;

    if (!username) {
      res.status(400).json({ success: false, error: 'Username is required' });
      return;
    }

    const user = await User.findOne({ username });

    if (!user) {
      res.status(200).json(emptyUserResponse());
      return;
    }

    res.status(200).json(userResponse(user));
  } catch (error) {
    next(error);
  }
}

export async function getUserByEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = req.params;

    if (!email) {
      res.status(400).json({ success: false, error: 'Email is required' });
      return;
    }

    const user = await User.findOne({ email });

    if (!user) {
      res.status(200).json(emptyUserResponse());
      return;
    }

    res.status(200).json(userResponse(user));
  } catch (error) {
    next(error);
  }
}

export async function getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const users = await User.find();

    res.status(200).json({
      success: true,
      data: users,
      count: users.length,
    });
  } catch (error) {
    next(error);
  }
}

export async function createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      res.status(400).json({ success: false, error: 'Email, username, and password are required' });
      return;
    }

    const user = await User.create({ email, username, password });
    res.status(201).json(userResponse(user));
  } catch (error) {
    next(error);
  }
}

export async function deleteUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({ success: false, error: 'User ID is required' });
      return;
    }

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      res.status(200).json(emptyUserResponse());
      return;
    }

    res.status(200).json(userResponse(deletedUser));
  } catch (error) {
    next(error);
  }
}

export async function updateUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req.params;
    const { email, username } = req.body;

    if (!userId) {
      res.status(400).json({ success: false, error: 'User ID is required' });
      return;
    }

    if (!email || !username) {
      res.status(400).json({ success: false, error: 'Email and username are required' });
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { email, username },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      res.status(200).json(emptyUserResponse());
      return;
    }

    res.status(200).json(userResponse(updatedUser));
  } catch (error) {
    next(error);
  }
}

function userResponse(user: InstanceType<typeof User>) {
  return {
    success: true,
    data: [user],
    count: 1,
  };
}

function emptyUserResponse() {
  return {
    success: false,
    data: [],
    count: 0,
  };
}
