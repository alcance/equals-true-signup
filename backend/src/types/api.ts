// backend/src/types/api.ts
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError extends Error {
  statusCode: number;
  isOperational: boolean;
}