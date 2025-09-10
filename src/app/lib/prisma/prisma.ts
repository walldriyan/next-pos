// src/lib/prisma/prisma.ts

import { PrismaClient } from "@prisma/client"


// PrismaClient එක global scope එකට දානවා
// මේකෙන් තමයි development එකේදී hot reloading වලදී අලුත් instances හැදෙන්නේ නැති වෙන්නේ
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'], // Database queries log කරන්න පුළුවන්
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma