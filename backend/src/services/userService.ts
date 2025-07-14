// backend/src/services/userService.ts
import { PrismaClient } from '@prisma/client';
import { DatabaseConnection } from '../config/database';
import { CreateUserRequest, UserResponse } from '../types/user';
import { HashHelper } from '../utils/helpers';
import { AppError } from '../middleware/errorHandler';

export class UserService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = DatabaseConnection.getInstance();
  }

  public async createUser(userData: CreateUserRequest): Promise<UserResponse> {
    try {
      // Check if user already exists
      const existingUser = await this.findByEmail(userData.email);
      if (existingUser) {
        throw new AppError('User with this email already exists', 409);
      }

      // Hash password
      const passwordHash = await HashHelper.hashPassword(userData.password);

      // Create user
      const user = await this.prisma.user.create({
        data: {
          fullName: userData.fullName,
          email: userData.email.toLowerCase(),
          passwordHash,
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return user;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to create user', 500);
    }
  }

  public async findByEmail(email: string): Promise<UserResponse | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        select: {
          id: true,
          fullName: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return user;
    } catch (error) {
      throw new AppError('Failed to find user', 500);
    }
  }

  public async findById(id: string): Promise<UserResponse | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          fullName: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return user;
    } catch (error) {
      throw new AppError('Failed to find user', 500);
    }
  }

  public async getUserWithPassword(email: string) {
    try {
      return await this.prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
    } catch (error) {
      throw new AppError('Failed to authenticate user', 500);
    }
  }
}