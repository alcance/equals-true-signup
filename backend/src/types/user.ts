// backend/src/types/user.ts
export interface User {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  fullName: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}