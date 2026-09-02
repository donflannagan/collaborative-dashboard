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

export async function getTaskById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { taskId } = req.params;
    if (!taskId) {
      res.status(400).json({
        success: false,
        error: 'Task ID is required',
      });
      return;
    }
    const task = await Task.findById(taskId)
      .populate('assignee', 'username email')
      .populate('createdBy', 'username email');

    if (!task) {
      res.status(404).json({
        success: false,
        error: 'Task not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
}

export async function addTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { title, description, boardId, columnId, position, assignee, priority, dueDate, tags, createdBy } = req.body;
    const newTask = new Task({
      title,
      description,
      boardId,
      columnId,
      position,
      assignee,
      priority,
      dueDate,
      tags,
      createdBy,
    });

    const savedTask = await newTask.save();

    res.status(201).json({
      success: true,
      data: savedTask,
    });
  } catch (error) {
    next(error);
  }
} 

export async function updateTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { taskId, title, description, boardId, columnId, position, assignee, priority, dueDate, tags } = req.body;
    if (!taskId) {
      res.status(400).json({
        success: false,
        error: 'Task ID is required',
      });
      return;
    }

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { title, description, boardId, columnId, position, assignee, priority, dueDate, tags },
      { new: true }
    )
      .populate('assignee', 'username email')
      .populate('createdBy', 'username email');

    if (!updatedTask) {
      res.status(404).json({
        success: false,
        error: 'Task not found',
      });
      return;
    }


    res.status(200).json({
      success: true,
      data: updatedTask,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { taskId } = req.params;
    if (!taskId) {
      res.status(400).json({
        success: false,
        error: 'Task ID is required',
      });
      return;
    }

    const deletedTask = await Task.findByIdAndDelete(taskId);

    if (!deletedTask) {
      res.status(404).json({
        success: false,
        error: 'Task not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: deletedTask,
    });
  }
  catch (error) {
    next(error);
  }
} 

export async function getTasksByUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      res.status(400).json({
        success: false,
        error: 'User ID is required',
      });
      return;
    }

    const tasks = await Task.find({ assignee: userId })
      .populate('assignee', 'username email')
      .populate('createdBy', 'username email')
      .sort({ boardId: 1, columnId: 1, position: 1 });

    res.status(200).json({
      success: true,
      data: tasks,
      count: tasks.length,
    });
  } catch (error) {
    next(error);
  }
}


