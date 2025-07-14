import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/auth';

export class JwtConfig {
  private static readonly secret = process.env.JWT_SECRET || 'fallback-secret';
  private static readonly expiresIn = '24h';

  public static generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  public static verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.secret) as JwtPayload;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  public static decodeToken(token: string): JwtPayload | null {
    try {
      return jwt.decode(token) as JwtPayload;
    } catch (error) {
      return null;
    }
  }
}