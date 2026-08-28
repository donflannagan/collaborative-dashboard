export interface IUser {
  _id: string;
  email: string;
  username: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserResponse {
  _id: string;
  email: string;
  username: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AddUserRequest {
  _id?: string;
  email: string;
  username: string;
  password: string;
}

export interface UpdateUserRequest {
  _id: string;
  email?: string;
  username?: string;
  password?: string;
}

export interface DeleteUserRequest {
  _id: string;
} 
