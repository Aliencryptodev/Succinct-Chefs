#!/bin/bash

echo "🚀 Configurando Succinct Recipes..."

# Crear estructura de carpetas
echo "📁 Creando estructura de carpetas..."
mkdir -p components/{ui,home,auth,recipes,profile,layout,chefs,sharing}
mkdir -p lib contexts 
mkdir -p app/api/auth app/api/recipes app/leaderboard app/top-chefs app/profile app/recipes app/create-recipe app/login app/register

# Configurar variables de entorno
echo "🔧 Configurando variables de entorno..."
cat > .env.local << 'EOF'
DATABASE_URL="file:./dev.db"
JWT_SECRET="succinct-recipes-ultra-secret-key-2025"
NEXT_PUBLIC_URL="http://localhost:3000"
EOF

# Configurar Prisma Schema
echo "💾 Configurando base de datos..."
cat > prisma/schema.prisma << 'EOF'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id            String   @id @default(cuid())
  twitterHandle String   @unique
  password      String
  profileImage  String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  recipes       Recipe[]
  votes         Vote[]
  
  @@index([twitterHandle])
}

model Recipe {
  id          String   @id @default(cuid())
  title       String
  description String
  ingredients String
  instructions String
  imageUrl    String
  prepTime    Int
  cookTime    Int
  servings    Int
  difficulty  String
  category    String
  country     String
  dietType    String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  author      User     @relation(fields: [authorId], references: [id])
  authorId    String
  votes       Vote[]
  
  @@index([authorId])
  @@index([category])
  @@index([country])
  @@index([dietType])
}

model Vote {
  id        String   @id @default(cuid())
  value     Int
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id])
  userId    String
  recipe    Recipe   @relation(fields: [recipeId], references: [id])
  recipeId  String
  
  @@unique([userId, recipeId])
  @@index([userId])
  @@index([recipeId])
}
EOF

# Crear archivo de utilidad Prisma
echo "🔨 Creando archivos de utilidad..."
cat > lib/prisma.ts << 'EOF'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
EOF

# Generar cliente Prisma
echo "🗄️  Generando base de datos..."
npx prisma db push

echo "✅ Configuración básica completada!"
