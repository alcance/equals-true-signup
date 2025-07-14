import { z } from 'zod';

// Validation schemas using Zod
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export const signupSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(50, 'Full name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Full name can only contain letters and spaces'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Type exports for form data
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;

// Individual validation functions
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'fair' | 'good' | 'strong';
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password should contain at least one special character');
  }
  
  const isValid = errors.length === 0;
  
  // Calculate strength
  let strength: 'weak' | 'fair' | 'good' | 'strong' = 'weak';
  const hasLength = password.length >= 8;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  const criteriaCount = [hasLength, hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
  
  if (criteriaCount >= 4) strength = 'strong';
  else if (criteriaCount >= 3) strength = 'good';
  else if (criteriaCount >= 2) strength = 'fair';
  
  return { isValid, errors, strength };
};

export const validateFullName = (name: string): {
  isValid: boolean;
  error?: string;
} => {
  if (name.length < 2) {
    return { isValid: false, error: 'Full name must be at least 2 characters' };
  }
  
  if (name.length > 50) {
    return { isValid: false, error: 'Full name must be less than 50 characters' };
  }
  
  if (!/^[a-zA-Z\s]+$/.test(name)) {
    return { isValid: false, error: 'Full name can only contain letters and spaces' };
  }
  
  return { isValid: true };
};

// Password strength checker for real-time feedback
export const getPasswordStrength = (password: string): {
  score: number; // 0-4
  label: string;
  color: string;
  checks: Array<{ label: string; passed: boolean }>;
} => {
  const checks = [
    { label: 'At least 8 characters', passed: password.length >= 8 },
    { label: 'Lowercase letter', passed: /[a-z]/.test(password) },
    { label: 'Uppercase letter', passed: /[A-Z]/.test(password) },
    { label: 'Number', passed: /\d/.test(password) },
    { label: 'Special character', passed: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
  ];
  
  const score = checks.filter(check => check.passed).length;
  
  let label: string;
  let color: string;
  
  switch (score) {
    case 0:
    case 1:
      label = 'Very Weak';
      color = 'text-red-500';
      break;
    case 2:
      label = 'Weak';
      color = 'text-orange-500';
      break;
    case 3:
      label = 'Fair';
      color = 'text-yellow-500';
      break;
    case 4:
      label = 'Good';
      color = 'text-blue-500';
      break;
    case 5:
      label = 'Strong';
      color = 'text-green-500';
      break;
    default:
      label = 'Unknown';
      color = 'text-gray-500';
  }
  
  return { score, label, color, checks };
};

// Common validation messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters',
  PASSWORD_WEAK: 'Password must contain uppercase, lowercase, and number',
  PASSWORDS_DONT_MATCH: "Passwords don't match",
  NAME_TOO_SHORT: 'Name must be at least 2 characters',
  NAME_TOO_LONG: 'Name must be less than 50 characters',
  NAME_INVALID_CHARS: 'Name can only contain letters and spaces',
} as const;

// Utility function to sanitize input
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

// Utility function to check if form data is valid
export const isFormValid = (errors: Record<string, string | undefined>): boolean => {
  return Object.values(errors).every(error => !error);
};

// Debounced validation for real-time feedback
export const createDebouncedValidator = <T>(
  validator: (value: T) => boolean | Promise<boolean>,
  delay: number = 300
) => {
  let timeoutId: number;
  
  return (value: T): Promise<boolean> => {
    return new Promise((resolve) => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(async () => {
        const result = await validator(value);
        resolve(result);
      }, delay);
    });
  };
};
