// backend/tests/integration/auth.test.ts
import request from 'supertest';
import { App } from '../../src/app';
import { DatabaseConnection } from '../../src/config/database';

describe('Auth Integration Tests', () => {
  let app: App;
  let server: any;

  beforeAll(async () => {
    // Setup test database connection
    await DatabaseConnection.connect();
    app = new App();
    server = app.app;
  });

  afterAll(async () => {
    await DatabaseConnection.disconnect();
  });

  describe('POST /api/auth/signup', () => {
    const validSignupData = {
      fullName: 'John Doe',
      email: 'john.test@example.com',
      password: 'Password123',
    };

    it('should create user with valid data', async () => {
      const response = await request(server)
        .post('/api/auth/signup')
        .send(validSignupData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe(validSignupData.email);
    });

    it('should return validation error for invalid email', async () => {
      const invalidData = {
        ...validSignupData,
        email: 'invalid-email',
      };

      const response = await request(server)
        .post('/api/auth/signup')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('valid email');
    });

    it('should return validation error for weak password', async () => {
      const invalidData = {
        ...validSignupData,
        password: '123',
      };

      const response = await request(server)
        .post('/api/auth/signup')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Password');
    });

    it('should return error for duplicate email', async () => {
      // First signup should succeed
      await request(server)
        .post('/api/auth/signup')
        .send({
          ...validSignupData,
          email: 'duplicate@example.com',
        })
        .expect(201);

      // Second signup with same email should fail
      const response = await request(server)
        .post('/api/auth/signup')
        .send({
          ...validSignupData,
          email: 'duplicate@example.com',
        })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    const userCredentials = {
      email: 'login.test@example.com',
      password: 'Password123',
    };

    beforeAll(async () => {
      // Create a user for login tests
      await request(server)
        .post('/api/auth/signup')
        .send({
          fullName: 'Login Test User',
          ...userCredentials,
        });
    });

    it('should login with valid credentials', async () => {
      const response = await request(server)
        .post('/api/auth/login')
        .send(userCredentials)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe(userCredentials.email);
    });

    it('should return error for invalid credentials', async () => {
      const response = await request(server)
        .post('/api/auth/login')
        .send({
          email: userCredentials.email,
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid');
    });

    it('should return error for non-existent user', async () => {
      const response = await request(server)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/verify', () => {
    let validToken: string;

    beforeAll(async () => {
      // Get a valid token
      const signupResponse = await request(server)
        .post('/api/auth/signup')
        .send({
          fullName: 'Verify Test User',
          email: 'verify.test@example.com',
          password: 'Password123',
        });

      validToken = signupResponse.body.data.token;
    });

    it('should verify valid token', async () => {
      const response = await request(server)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
    });

    it('should return error for missing token', async () => {
      const response = await request(server)
        .get('/api/auth/verify')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return error for invalid token', async () => {
      const response = await request(server)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});