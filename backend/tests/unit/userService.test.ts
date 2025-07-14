// backend/tests/unit/userService.test.ts
import { UserService } from '../../src/services/userService';
import { DatabaseConnection } from '../../src/config/database';
import { HashHelper } from '../../src/utils/helpers';

// Mock dependencies
jest.mock('../../src/config/database');
jest.mock('../../src/utils/helpers');

describe('UserService', () => {
  let userService: UserService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      user: {
        create: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    (DatabaseConnection.getInstance as jest.Mock).mockReturnValue(mockPrisma);
    userService = new UserService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    const userData = {
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'Password123',
    };

    it('should create user successfully', async () => {
      const mockUser = {
        id: '1',
        fullName: 'John Doe',
        email: 'john@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(null); // No existing user
      (HashHelper.hashPassword as jest.Mock).mockResolvedValue('hashed-password');
      mockPrisma.user.create.mockResolvedValue(mockUser);

      const result = await userService.createUser(userData);

      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          fullName: 'John Doe',
          email: 'john@example.com',
          passwordHash: 'hashed-password',
        },
        select: expect.any(Object),
      });
    });

    it('should throw error if user already exists', async () => {
      const existingUser = { id: '1', email: 'john@example.com' };
      mockPrisma.user.findUnique.mockResolvedValue(existingUser);

      await expect(userService.createUser(userData)).rejects.toThrow(
        'User with this email already exists'
      );
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const mockUser = {
        id: '1',
        fullName: 'John Doe',
        email: 'john@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await userService.findByEmail('john@example.com');

      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'john@example.com' },
        select: expect.any(Object),
      });
    });

    it('should return null if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await userService.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });
});