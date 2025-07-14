// frontend/src/types/auth.ts

export interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface SignupRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// User object returned from backend
export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
}

// Auth response data structure
export interface AuthResponseData {
  token: string;
  user: AuthUser;
}

// Auth response for login/signup (with token)
export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: {
      id: string;
      fullName: string;
      email: string;
    };
  };
}

// Auth response for verify (no token, just user)
export interface VerifyResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      fullName: string;
      email: string;
    };
  };
}