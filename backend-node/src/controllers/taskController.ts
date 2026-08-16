import { Request, Response, NextFunction } from 'express';
import { Task } from '../models/Task';

export async function getTasksByBoard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { boardId } = req.params;

    if (!boardId) {
      res.status(400).json({
        success: false,
        error: 'Board ID is required',
      });
      return;
    }

    const tasks = await Task.find({ boardId })
      .populate('assignee', 'username email')
      .populate('createdBy', 'username email')
      .sort({ columnId: 1, position: 1 });

    res.status(200).json({
      success: true,
      data: tasks,
      count: tasks.length,
    });
  } catch (error) {
    next(error);
  }
}
