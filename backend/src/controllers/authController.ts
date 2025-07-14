import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { SignupRequest, LoginRequest } from '../types/auth';
import { ApiResponse } from '../types/api';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * @swagger
   * /api/auth/signup:
   *   post:
   *     summary: Register new user
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/SignupRequest'
   *     responses:
   *       201:
   *         description: User created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
   *       400:
   *         description: Validation error
   *       409:
   *         description: Email already exists
   */
  public signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const signupData: SignupRequest = req.body;
      const result = await this.authService.signup(signupData);

      const response: ApiResponse = {
        success: true,
        message: result.message,
        data: {
          token: result.token,
          user: result.user,
        },
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /api/auth/login:
   *   post:
   *     summary: User login
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [email, password]
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *               password:
   *                 type: string
   *     responses:
   *       200:
   *         description: Login successful
   *       401:
   *         description: Invalid credentials
   */
  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const loginData: LoginRequest = req.body;
      const result = await this.authService.login(loginData);

      const response: ApiResponse = {
        success: true,
        message: result.message,
        data: {
          token: result.token,
          user: result.user,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /api/auth/verify:
   *   get:
   *     summary: Verify JWT token
   *     tags: [Auth]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Token is valid
   *       401:
   *         description: Invalid token
   */
  public verify = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const response: ApiResponse = {
        success: true,
        message: 'Token is valid',
        data: { user: req.user },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}