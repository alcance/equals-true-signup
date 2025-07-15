import swaggerJsdoc from 'swagger-jsdoc';

const isDevelopment = process.env.NODE_ENV !== 'production';
const fileExtension = isDevelopment ? 'ts' : 'js';
const sourceDir = isDevelopment ? './src' : './dist';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EQUALS TRUE Sign-Up API',
      version: '1.0.0',
      description: 'API for user registration and authentication',
    },
    servers: [
      {
        // In production, the Nginx server handles the public IP/domain on port 80.
        // In development, you might access directly via localhost:3001 if bypassing Nginx.
        url: process.env.NODE_ENV === 'production' 
          ? 'http://3.16.159.186' // Nginx is listening on port 80, no :3001 needed here for external access
          : 'http://localhost:3001', // Direct access during local development
        description: process.env.NODE_ENV === 'production' ? 'Production via Nginx' : 'Development Direct',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            fullName: { type: 'string' },
            email: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        SignupRequest: {
          type: 'object',
          required: ['fullName', 'email', 'password'],
          properties: {
            fullName: { type: 'string', minLength: 2 },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            token: { type: 'string' },
            user: { $ref: '#/components/schemas/User' },
          },
        },
      },
    },
  },
  apis: [
    `${sourceDir}/routes/*.${fileExtension}`,
    `${sourceDir}/controllers/*.${fileExtension}`,
  ],
};

export const specs = swaggerJsdoc(options);

console.log('Swagger specs generated:', JSON.stringify(specs, null, 2));
