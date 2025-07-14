// backend/tests/unit/authService.test.ts
import { AuthService } from '../../src/services/authService';
import { UserService } from '../../src/services/userService';
import { JwtConfig } from '../../src/config/jwt';
import { HashHelper } from '../../src/utils/helpers';

// Mock dependencies
jest.mock('../../src/services/userService');
jest.mock('../../src/config/jwt');
jest.mock('../../src/utils/helpers');

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserService: jest.Mocked<UserService>;

  beforeEach(() => {
    authService = new AuthService();
    mockUserService = jest.mocked(new UserService());
    (authService as any).userService = mockUserService;
  });

  afterEach(() => {
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
      (JwtConfig.generateToken as jest.Mock).mockReturnValue('mock-token');

      const result = await authService.signup(signupData);

      expect(result.success).toBe(true);
      expect(result.token).toBe('mock-token');
      expect(result.user?.email).toBe('john@example.com');
    });

    it('should throw error if user creation fails', async () => {
      mockUserService.createUser.mockRejectedValue(new Error('Database error'));

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
      (HashHelper.comparePassword as jest.Mock).mockResolvedValue(true);
      (JwtConfig.generateToken as jest.Mock).mockReturnValue('mock-token');

      const result = await authService.login(loginData);

      expect(result.success).toBe(true);
      expect(result.token).toBe('mock-token');
    });

    it('should throw error for invalid credentials', async () => {
      mockUserService.getUserWithPassword.mockResolvedValue(null);

      await expect(authService.login(loginData)).rejects.toThrow('Invalid email or password');
    });
  });
});