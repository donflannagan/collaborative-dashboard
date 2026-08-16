import { UserResponse } from './User';

export interface IBoard {
  _id: string;
  title: string;
  description?: string;
  owner: string | UserResponse;
  members: (string | UserResponse)[];
  columns: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BoardResponse {
  _id: string;
  title: string;
  description?: string;
  owner: UserResponse;
  members: UserResponse[];
  columns: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BoardListResponse {
  success: boolean;
  data: BoardResponse[];
  count: number;
}
