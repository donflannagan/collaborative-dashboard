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

export async function createBoard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
      const { title, description, owner, members } = req.body;

      if (!title || !owner) {
        res.status(400).json({ success: false, error: 'Title and owner are required' });
        return;
      }

      // Create and populate all in a single database round-trip
      const populatedBoard = await Board.create(
        [{ title, description, owner, members }], 
        { populate: ['owner', 'members'] } // Auto-populates everything, but selects all fields
      );

      res.status(201).json({ success: true, data: populatedBoard[0] }); // Note: returns an array when using this syntax
    } catch (error) {
      next(error);
    }
}

export async function updateBoard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { boardId } = req.params;
    const { title, description, owner, members } = req.body;

    if (!boardId) {
      res.status(400).json({ success: false, error: 'Board ID is required' });
      return;
    }

    // 1. Get the updated board first without chaining population
    let updatedBoard = await Board.findByIdAndUpdate(
      boardId,
      { title, description, owner, members },
      { new: true }
    );

    if (!updatedBoard) {
      res.status(404).json({ success: false, error: 'Board not found' });
      return;
    }

    // 2. Populate now that we are certain the board exists
    updatedBoard = await updatedBoard.populate([
      { path: 'owner', select: 'username email' },
      { path: 'members', select: 'username email' }
    ]);

    res.status(200).json({ success: true, data: updatedBoard });
  } catch (error) {
    next(error);
  }
}

export async function deleteBoard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { boardId } = req.params;
    if (!boardId) {
      res.status(400).json({
        success: false,
        error: 'Board ID is required',
      });
      return;
    }

    const deletedBoard = await Board.findByIdAndDelete(boardId);
    if (!deletedBoard) {
      res.status(404).json({
        success: false,
        error: 'Board not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: deletedBoard,
    });
  } catch (error) {
    next(error);
  }
}