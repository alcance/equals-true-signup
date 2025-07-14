// backend/tests/unit/authService.test.ts
import { AuthService } from '../../src/services/authService';
import { UserService } from '../../src/services/userService';
import { JwtConfig } from '../../src/config/jwt';
import { HashHelper } from '../../src/utils/helpers';
import { AppError } from '../../src/middleware/errorHandler';

// Mock dependencies
jest.mock('../../src/services/userService');
jest.mock('../../src/config/jwt');
jest.mock('../../src/utils/helpers');

const MockedUserService = UserService as jest.MockedClass<typeof UserService>;
const MockedJwtConfig = JwtConfig as jest.Mocked<typeof JwtConfig>;
const MockedHashHelper = HashHelper as jest.Mocked<typeof HashHelper>;

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserService: jest.Mocked<UserService>;

  beforeEach(() => {
    mockUserService = new MockedUserService() as jest.Mocked<UserService>;
    authService = new AuthService();
    (authService as any).userService = mockUserService;
    jest.clearAllMocks();
  });

  describe('signup', () => {
    const signupData = {
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'Password123',
    };

    it('should create user and return auth response', async () => {
      const mockUser = {
        id: '1',
        fullName: 'John Doe',
        email: 'john@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserService.createUser.mockResolvedValue(mockUser);
      MockedJwtConfig.generateToken.mockReturnValue('mock-token');

      const result = await authService.signup(signupData);

      expect(result.success).toBe(true);
      expect(result.token).toBe('mock-token');
      expect(result.user?.email).toBe('john@example.com');
    });

    it('should throw error if user creation fails', async () => {
      const error = new AppError('Database error', 500);
      mockUserService.createUser.mockRejectedValue(error);

      await expect(authService.signup(signupData)).rejects.toThrow();
    });
  });

  describe('login', () => {
    const loginData = {
      email: 'john@example.com',
      password: 'Password123',
    };

    it('should login user with valid credentials', async () => {
      const mockUser = {
        id: '1',
        fullName: 'John Doe',
        email: 'john@example.com',
        passwordHash: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserService.getUserWithPassword.mockResolvedValue(mockUser);
      MockedHashHelper.comparePassword.mockResolvedValue(true);
      MockedJwtConfig.generateToken.mockReturnValue('mock-token');

      const result = await authService.login(loginData);

      expect(result.success).toBe(true);
      expect(result.token).toBe('mock-token');
    });

    it('should throw error for invalid credentials', async () => {
      mockUserService.getUserWithPassword.mockResolvedValue(null);

      await expect(authService.login(loginData)).rejects.toThrow('Invalid email or password');
    });

    it('should throw error for wrong password', async () => {
      const mockUser = {
        id: '1',
        fullName: 'John Doe',
        email: 'john@example.com',
        passwordHash: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserService.getUserWithPassword.mockResolvedValue(mockUser);
      MockedHashHelper.comparePassword.mockResolvedValue(false);

      await expect(authService.login(loginData)).rejects.toThrow('Invalid email or password');
    });
  });

  describe('verifyToken', () => {
    it('should return true for valid token', async () => {
      MockedJwtConfig.verifyToken.mockReturnValue({
        userId: '1',
        email: 'test@example.com',
      });

      const result = await authService.verifyToken('valid-token');
      expect(result).toBe(true);
    });

    it('should return false for invalid token', async () => {
      MockedJwtConfig.verifyToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = await authService.verifyToken('invalid-token');
      expect(result).toBe(false);
    });
  });
});