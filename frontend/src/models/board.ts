
// types.ts
export interface IBoard {
  _id: string; 
  title: string;
  description?: string;
  owner?: IUserSummary;       // User Summary object containing username and email
  members: IUserSummary[];   // Same but an array of
  columns: string[];   // Array of column names
  createdAt: string;   // ISO Date String
  updatedAt: string;   // ISO Date String
}

export interface IUserSummary {
  _id: string;
  username: string;
  email: string;
}

export interface ICreateBoardInput {
  title: string;
  description?: string;
  members: string[];
  columns: string[];
}

export interface IBoardListResponse {
  success: boolean;
  boards: IBoard[];
}                            

export interface IBoardResponse {
  success: boolean;
  board: IBoard;
}