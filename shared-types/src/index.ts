// User types
export * from './models/User';

// Board types
export * from './models/Board';

// Task types
export * from './models/Task';

// Response envelope
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
}
