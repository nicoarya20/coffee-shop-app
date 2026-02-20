# Prisma + Supabase Setup

## Konfigurasi Database

Project ini menggunakan **Prisma ORM** dengan **Supabase** (PostgreSQL) sebagai database.

## Environment Variables

File `.env` sudah dikonfigurasi dengan koneksi Supabase:

```env
# Connection pooling (untuk Prisma Client queries)
DATABASE_URL="postgresql://postgres.ubwbbiiquivlmvfipusr:***@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection (untuk migrations)
DIRECT_URL="postgresql://postgres.ubwbbiiquivlmvfipusr:***@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres"
```

## Database Schema

Schema saat ini (`prisma/schema.prisma`):

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Commands

```bash
# Generate Prisma Client (setelah perubahan schema)
npm run db:generate

# Push schema ke database (development)
npm run db:push

# Buka Prisma Studio (GUI untuk database)
npm run db:studio

# Jalankan migrations (production)
npm run db:migrate
```

## Cara Menggunakan

### 1. Import Prisma Client

```typescript
import prisma from '@/lib/prisma';
```

### 2. Contoh Query

```typescript
// Create User
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'John Doe',
  },
});

// Get User by ID
const user = await prisma.user.findUnique({
  where: { id: 'user-id' },
});

// Get All Users
const users = await prisma.user.findMany({
  orderBy: { createdAt: 'desc' },
});

// Update User
const updated = await prisma.user.update({
  where: { id: 'user-id' },
  data: { name: 'New Name' },
});

// Delete User
await prisma.user.delete({
  where: { id: 'user-id' },
});
```

### 3. Menggunakan Service Layer

Project ini sudah menyediakan service layer di `src/app/services/userService.ts`:

```typescript
import { 
  getUserById, 
  getUserByEmail, 
  createUser, 
  updateUser, 
  deleteUser 
} from '@/app/services/userService';

// Usage
const user = await getUserById('id');
const newUser = await createUser('email@example.com', 'Name');
```

## Struktur File

```
src/
├── lib/
│   └── prisma.ts          # Prisma Client singleton
├── app/
│   └── services/
│       └── userService.ts # User service layer
prisma/
└── schema.prisma          # Database schema
```

## Tips

1. **Development**: Gunakan `npm run db:push` untuk sync schema dengan cepat
2. **Production**: Gunakan `npm run db:migrate` untuk version-controlled migrations
3. **Prisma Studio**: Buka `npm run db:studio` untuk melihat data di browser (http://localhost:5555)
4. **Type Safety**: Prisma Client generate TypeScript types otomatis dari schema

## Koneksi ke Supabase

Schema sudah dikonfigurasi untuk connect ke Supabase:
- **Host**: `aws-1-ap-northeast-2.pooler.supabase.com`
- **Database**: `postgres`
- **Connection Pooling**: Port 6543 (via pgbouncer)
- **Direct Connection**: Port 5432 (untuk migrations)

## Troubleshooting

### Error: "Can't reach database server"

- Pastikan `.env` file ada dan berisi `DATABASE_URL` yang benar
- Cek koneksi Supabase di dashboard: https://app.supabase.com

### Error: "Prisma Client not generated"

```bash
npm run db:generate
```

### Node.js Version

Prisma 5.x mendukung Node.js 18+. Untuk Prisma 7.x diperlukan Node.js 20.19+, 22.12+, atau 24.0+.

Project ini menggunakan Prisma 5.22.0 untuk kompatibilitas dengan Node.js v23.
