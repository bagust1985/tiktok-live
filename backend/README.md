# Tiktok Live&Like - Backend API

Backend service menggunakan Bun.js dan ElysiaJS untuk platform Tiktok Live&Like.

## Tech Stack

- **Runtime**: Bun.js
- **Framework**: ElysiaJS
- **Database**: SQLite (Development) / PostgreSQL (Production)
- **ORM**: Prisma
- **Authentication**: JWT + Argon2 (Bun.password)

## Getting Started

### Prerequisites

- [Bun.js](https://bun.sh) installed (version 1.0+)

### Installation

1. Install dependencies:

```bash
bun install
```

2. Setup environment:

```bash
cp .env.example .env
# Edit .env and set your JWT_SECRET
```

3. Setup database:

```bash
# Generate Prisma Client
bun run prisma:generate

# Run migrations
bun run prisma:migrate
```

4. Start development server:

```bash
bun run dev
```

Server akan berjalan di `http://localhost:3002`

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### User
- `GET /user/profile` - Get user profile (protected)

### Tasks
- `GET /task/status` - Get task status (protected)
- `POST /task/claim` - Claim task reward (protected)

### Wallet
- `GET /wallet/balance` - Get wallet balance (protected)
- `POST /wallet/deposit` - Submit deposit (protected)
- `POST /wallet/withdraw` - Submit withdrawal (protected)
- `GET /wallet/transactions` - Get transaction history (protected)

### Network
- `GET /network/stats` - Get network statistics (protected)

## Authentication

All protected routes require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

Token didapatkan setelah login/register yang sukses.

## Database Schema

Database menggunakan Prisma ORM dengan schema yang mencakup:
- User (membership, network relations)
- Wallet (balance system: locked vs available)
- TaskLog (daily task progress)
- Transaction (all transaction history)

## Development Notes

- Database menggunakan SQLite untuk development (file: `prisma/dev.db`)
- Untuk production, ubah `DATABASE_URL` di `.env` ke PostgreSQL
- File upload (proof images) disimpan di folder `uploads/` (untuk production, gunakan cloud storage)
- JWT secret harus diubah di production environment

## Production Deployment

1. Set environment variables:
   - `JWT_SECRET`: Strong random secret (min 32 characters)
   - `DATABASE_URL`: PostgreSQL connection string
   - `PORT`: Server port (default: 3001)

2. Run migrations:
```bash
bun run prisma:migrate deploy
```

3. Start server:
```bash
bun run start
```

## License

Private project - Tiktok Live&Like

