import { Request, Response, NextFunction } from 'express';
import { Board } from '../models/Board';

export async function getAllBoards(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const boards = await Board.find().populate('owner', 'username email').populate('members', 'username email');
    res.status(200).json({
      success: true,
      data: boards,
      count: boards.length,
    });
  } catch (error) {
    next(error);
  }
}

export async function getBoardsByUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({
        success: false,
        error: 'User ID is required',
      });
      return;
    }

    const boards = await Board.find({
      $or: [{ owner: userId }, { members: userId }],
    })
      .populate('owner', 'username email')
      .populate('members', 'username email');

    res.status(200).json({
      success: true,
      data: boards,
      count: boards.length,
    });
  } catch (error) {
    next(error);
  }
}
