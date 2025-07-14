// backend/src/services/authService.ts
import { UserService } from './userService';
import { JwtConfig } from '../config/jwt';
import { HashHelper } from '../utils/helpers';
import { SignupRequest, LoginRequest, AuthResponse } from '../types/auth';
import { AppError } from '../middleware/errorHandler';

export class AuthService {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  public async signup(signupData: SignupRequest): Promise<AuthResponse> {
    try {
      // Create user
      const user = await this.userService.createUser(signupData);

      // Generate JWT token
      const token = JwtConfig.generateToken({
        userId: user.id,
        email: user.email,
      });

      return {
        success: true,
        message: 'User created successfully',
        token,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
        },
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Signup failed', 500);
    }
  }

  public async login(loginData: LoginRequest): Promise<AuthResponse> {
    try {
      // Find user with password
      const user = await this.userService.getUserWithPassword(loginData.email);
      if (!user) {
        throw new AppError('Invalid email or password', 401);
      }

      // Verify password
      const isPasswordValid = await HashHelper.comparePassword(
        loginData.password,
        user.passwordHash
      );

      if (!isPasswordValid) {
        throw new AppError('Invalid email or password', 401);
      }

      // Generate JWT token
      const token = JwtConfig.generateToken({
        userId: user.id,
        email: user.email,
      });

      return {
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
        },
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Login failed', 500);
    }
  }

  public async verifyToken(token: string): Promise<boolean> {
    try {
      JwtConfig.verifyToken(token);
      return true;
    } catch (error) {
      return false;
    }
  }
}
