// backend/src/models/index.ts
// This file exports Prisma models and database instance
export { PrismaClient } from '@prisma/client';
export { DatabaseConnection } from '../config/database';

// Note: Prisma types will be available after running 'prisma generate'
// The User type will be auto-generated from the schema.prisma file