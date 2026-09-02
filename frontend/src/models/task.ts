import { IUserSummary } from './board';

export interface ITask {
    _id: string;
    title: string;
    description?: string;
    boardId: string;
    columnId: string;
    position: number;
    assignee?: IUserSummary;
    priority?: 'low' | 'medium' | 'high';
    dueDate?: string;
    tags?: string[];
    createdBy: IUserSummary;
    createdAt: string;
    updatedAt: string;
}

export interface ICreateTaskInput {
  title: string;
  description?: string;
  boardId: string;
  columnId: string;
  position: number;
  assignee?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  tags?: string[];
  createdBy: string;
}

export interface ITaskListResponse {
    success: boolean;
    tasks: ITask[];
}

export interface ITaskResponse {
    success: boolean;
    task: ITask;
}
