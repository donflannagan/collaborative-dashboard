import { UserResponse } from './User';

export interface ITask {
  _id: string;
  title: string;
  description?: string;
  boardId: string;
  columnId: string;
  position: number;
  assignee?: string | UserResponse;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
  tags?: string[];
  createdBy: string | UserResponse;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskResponse {
  _id: string;
  title: string;
  description?: string;
  boardId: string;
  columnId: string;
  position: number;
  assignee?: UserResponse;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
  tags?: string[];
  createdBy: UserResponse;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskListResponse {
  success: boolean;
  data: TaskResponse[];
  count: number;
}
