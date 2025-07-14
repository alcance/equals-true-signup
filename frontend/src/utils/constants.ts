// Environment variables with proper fallbacks
export const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:3001/api';
export const APP_TITLE = import.meta.env?.VITE_APP_TITLE || 'EQUALS TRUE';
export const IS_DEV = import.meta.env?.DEV || false;
export const IS_PROD = import.meta.env?.PROD || false;

// Application constants
export const APP_NAME = 'EQUALS TRUE';
export const APP_VERSION = '1.0.0';

// Authentication
export const AUTH_TOKEN_KEY = 'auth_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    LOGOUT: '/auth/logout',
    VERIFY: '/auth/verify',
    REFRESH: '/auth/refresh',
  },
  HEALTH: '/health',
} as const;

// Theme constants
export const THEME_STORAGE_KEY = 'auth-ui-theme';

// Form validation
export const VALIDATION_RULES = {
  PASSWORD: {
    MIN_LENGTH: 8,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    MESSAGE: 'Password must contain uppercase, lowercase, and number',
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MESSAGE: 'Please enter a valid email address',
  },
  FULL_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    MESSAGE: 'Full name must be between 2 and 50 characters',
  },
} as const;

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  THEME: 'auth-ui-theme',
  USER_PREFERENCES: 'user_preferences',
} as const;

// Animation durations (in seconds)
export const ANIMATION_DURATION = {
  FAST: 0.2,
  NORMAL: 0.3,
  SLOW: 0.5,
  EXTRA_SLOW: 1.0,
} as const;

// Breakpoints (for responsive design)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

// Z-index layers
export const Z_INDEX = {
  BACKGROUND: 0,
  BASE: 1,
  ELEVATED: 10,
  OVERLAY: 100,
  MODAL: 1000,
  TOAST: 1100,
  TOOLTIP: 1200,
} as const;
