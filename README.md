# Tiktok Live&Like

Platform Task-to-Earn dengan sistem investasi berjangka dan jaringan MLM Hybrid (Binary + Unilevel).

## Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + ShadcnUI
- **State Management**: Zustand
- **Type Safety**: TypeScript
- **API Client**: Fetch API dengan JWT authentication

### Backend
- **Runtime**: Bun.js
- **Framework**: ElysiaJS
- **Database**: PostgreSQL (SQLite untuk development)
- **ORM**: Prisma
- **Authentication**: JWT + Argon2 (password hashing)
- **File Storage**: Local filesystem (public/uploads/)

## System Architecture

### Monorepo Structure
```
tiktok-live/
├── app/                    # Next.js Frontend (App Router)
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # User dashboard routes
│   └── (admin)/admin/     # Admin dashboard routes
├── backend/               # Backend service (Bun.js + ElysiaJS)
│   ├── src/
│   │   ├── routes/        # API route handlers
│   │   ├── middleware/    # Auth & admin middleware
│   │   └── index.ts       # Server entry point
│   └── prisma/            # Database schema & migrations
├── components/            # React components
├── lib/                   # Utilities & API clients
├── store/                 # Zustand state stores
└── types/                 # TypeScript definitions
```

### Frontend-Backend Communication
- Frontend berjalan di `http://localhost:3000` (Next.js dev server)
- Backend berjalan di `http://localhost:3002` (ElysiaJS server)
- Frontend memanggil backend via `API_BASE_URL` (dari env: `NEXT_PUBLIC_API_URL`)
- Authentication menggunakan JWT token yang disimpan di `localStorage`
- CORS sudah dikonfigurasi di backend untuk allow frontend origin

### Authentication Flow
- **User Authentication**: 
  - Login/Register → Backend return JWT token
  - Token disimpan di `authStore` (Zustand) + `localStorage` (`auth-token`)
  - Protected routes menggunakan `ProtectedRoute` HOC
- **Admin Authentication**:
  - Separate login flow di `/admin/login`
  - Token disimpan di `adminStore` (Zustand) + `localStorage` (`auth-token`)
  - Admin routes menggunakan `AdminProtectedRoute` HOC
  - Backend middleware `adminMiddleware` check `is_admin` flag

## Getting Started

### Prerequisites

- **Frontend**: Node.js 18+ (npm/yarn/pnpm)
- **Backend**: Bun.js 1.0+ ([Install Bun](https://bun.sh))

### Installation

#### 1. Install Frontend Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

#### 2. Install Backend Dependencies

```bash
cd backend
bun install
```

#### 3. Setup Backend Environment

```bash
cd backend
cp .env.example .env
# Edit .env and set JWT_SECRET (min 32 characters)
```

#### 4. Setup Database

```bash
cd backend
# Generate Prisma Client
bun run prisma:generate

# Run migrations (creates SQLite dev database)
bun run prisma:migrate dev
# or for existing database
bun run prisma db push
```

#### 5. Create Admin User (Optional)

```bash
cd backend
bun run create-admin
# Default password: admin123 (change after first login)
```

#### 6. Run Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
bun run dev
# Backend runs on http://localhost:3002
```

**Terminal 2 - Frontend:**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# Frontend runs on http://localhost:3000
```

#### 7. Access Application

- **User Frontend**: [http://localhost:3000](http://localhost:3000)
- **Admin Dashboard**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- **Backend API**: [http://localhost:3002](http://localhost:3002)

## Project Structure

### Frontend Structure
```
app/
├── (auth)/                  # Authentication routes
│   ├── login/page.tsx
│   └── register/page.tsx
├── (dashboard)/             # User dashboard routes (protected)
│   ├── dashboard/page.tsx   # Main dashboard + Help Center
│   ├── tasks/page.tsx       # Task list & execution
│   ├── wallet/page.tsx      # Wallet balance & transactions
│   ├── deposit/page.tsx     # Deposit form + bank accounts
│   ├── withdraw/page.tsx    # Withdraw form
│   ├── network/page.tsx     # MLM network stats
│   └── profile/page.tsx     # User profile & settings
├── (admin)/admin/           # Admin dashboard routes (protected)
│   ├── login/page.tsx
│   ├── dashboard/page.tsx
│   ├── users/               # User management
│   ├── transactions/        # Transaction review
│   ├── tasks/               # Task configuration
│   └── settings/page.tsx    # System settings (banks & contacts)
└── layout.tsx               # Root layout

components/
├── ui/                      # ShadcnUI components
├── auth/                    # Auth components (AgreementModal)
├── task/                    # TaskButton, TaskProgress
├── wallet/                  # WalletCard
├── deposit/                 # BankAccountDisplay, DepositForm
├── withdraw/                # WithdrawForm
├── help/                    # HelpCenter
└── layout/                  # Header, Sidebar, ProtectedRoute

lib/
├── api.ts                   # User API client
├── api-admin.ts             # Admin API client
├── constants.ts             # Business constants
├── format.ts                # IDR formatting
└── utils.ts                 # Utilities

store/
├── authStore.ts             # User authentication state
├── adminStore.ts            # Admin authentication state
├── taskStore.ts             # Task state
└── walletStore.ts           # Wallet state

types/                       # TypeScript definitions
```

### Backend Structure
```
backend/
├── src/
│   ├── routes/
│   │   ├── auth.ts          # Authentication endpoints
│   │   ├── user.ts          # User profile endpoints
│   │   ├── task.ts          # Task endpoints
│   │   ├── wallet.ts        # Wallet endpoints
│   │   ├── network.ts       # MLM network endpoints
│   │   ├── admin.ts         # Admin endpoints
│   │   ├── public.ts        # Public endpoints (banks, contacts)
│   │   └── uploads.ts       # Static file serving
│   ├── middleware/
│   │   ├── auth.ts          # JWT authentication middleware
│   │   └── admin.ts         # Admin authorization middleware
│   ├── constants.ts         # Business constants
│   └── index.ts             # Server entry point
├── prisma/
│   └── schema.prisma        # Database schema
└── public/
    └── uploads/             # Uploaded files (avatars, proofs)
```

## Features

### User Features

#### Authentication
- User registration dengan **Terms of Service Agreement** (scroll & agree)
- Login dengan JWT authentication
- Protected routes dengan auto-logout pada 401 error
- Session persistence via localStorage

#### Dashboard
- Wallet summary (Available & Locked balance breakdown)
- Task progress tracking (daily limit, counter, next available time)
- Quick actions (deposit, withdraw, tasks)
- **Help Center** dengan kontak CS dinamis (WhatsApp/Telegram)

#### Task System
- 20 task harian per user
- Rate limiting (10 detik antar claim)
- Validasi saldo deposit sesuai tier level
- Task execution dengan deep link / URL eksternal (buka di tab baru)
- Auto-reload status setelah task selesai

#### Wallet Management
- **Balance Types**:
  - `balance_deposit`: Deposit yang dikunci 30 hari
  - `balance_reward_task`: Reward dari task
  - `balance_matching_lock`: Matching bonus yang dikunci
  - `balance_available`: Saldo yang bisa di-withdraw
- Transaction history dengan filter (type, status, date range)

#### Deposit
- Membership tier selection (Level 1, 2, 3)
- **Dynamic bank account display** (dari admin settings)
- Bank transfer dengan proof upload (file disimpan di backend)
- Status tracking (PENDING → admin approve → SUCCESS)

#### Withdraw
- Withdraw dari `balance_available` saja
- Minimal amount validation (Rp 50.000)
- Bank account input
- Status tracking (PENDING → admin approve/reject)

#### Network/MLM
- Referral code display
- Network statistics (downlines, binary tree)
- Bonus summary:
  - Sponsor Bonus (direct referral)
  - Pairing Bonus (binary matching)
  - Matching Bonus (unilevel matching)

#### Profile & Settings
- **Data Diri Tab**:
  - Update full name, phone
  - Upload avatar (file disimpan di `public/uploads/avatars/`)
- **Keamanan Tab**:
  - Change password
  - Set/Update withdrawal PIN

### Admin Features

#### Dashboard
- Platform statistics (total users, active users, deposits, withdrawals, pending transactions)

#### User Management
- User list dengan filter (search, tier level, active status)
- User detail view dengan network viewer
- Edit user (tier level, active status)
- Ban/Unban user
- Reset password user
- **Manual balance adjustment** (add/cut deposit atau available balance)

#### Transaction Management
- Transaction list dengan filter (type, status, date range, user)
- Transaction detail dengan proof image display
- **Approve/Reject deposits & withdrawals**
- Transaction notes & reason

#### Task Management
- List semua 20 task
- Edit task (title, description, target_url, icon_url, active status)
- Initialize default 20 tasks

#### System Settings
- **Bank Perusahaan Tab**:
  - CRUD rekening bank perusahaan
  - Toggle active/inactive
  - Rekening aktif ditampilkan ke user di halaman deposit
- **Contact Center Tab**:
  - CRUD kontak CS (WhatsApp/Telegram)
  - Set title, number/username, type, sequence
  - Toggle active/inactive
  - Kontak aktif ditampilkan di Help Center user dashboard

## API Endpoints

### Public Endpoints (No Auth Required)
- `GET /public/banks` - Get active company bank accounts
- `GET /public/contacts` - Get active contact center (CS)

### Authentication
- `POST /auth/register` - Register new user (returns JWT token)
- `POST /auth/login` - Login user (returns JWT token)

### User Endpoints (Protected - JWT Required)
- `GET /user/profile` - Get user profile
- `PUT /user/profile` - Update profile (full_name, phone)
- `PUT /user/change-password` - Change password
- `POST /user/avatar` - Upload avatar (multipart/form-data)
- `PUT /user/pin` - Set/Update withdrawal PIN

### Task Endpoints (Protected)
- `GET /task/status` - Get task status (daily progress, canClaim, taskConfigs)
- `POST /task/claim` - Claim task reward (validates balance, limit, rate limit)

### Wallet Endpoints (Protected)
- `GET /wallet/balance` - Get wallet balance breakdown
- `POST /wallet/deposit` - Submit deposit (amount, proof_image)
- `POST /wallet/withdraw` - Submit withdrawal (amount, bank details)
- `GET /wallet/transactions` - Get transaction history (with filters)

### Network Endpoints (Protected)
- `GET /network/stats` - Get MLM network statistics

### Admin Endpoints (Protected - Admin Only)
- `GET /admin/stats` - Platform statistics
- `GET /admin/users` - User list (with filters)
- `GET /admin/users/:id` - User detail
- `PUT /admin/users/:id` - Update user (tier_level, is_active)
- `PUT /admin/users/:id/adjust-balance` - Manual balance adjustment
- `PUT /admin/users/:id/ban` - Ban/Unban user
- `PUT /admin/users/:id/reset-password` - Reset user password
- `GET /admin/users/:id/network` - User network tree
- `GET /admin/transactions` - Transaction list (with filters)
- `GET /admin/transactions/:id` - Transaction detail
- `PUT /admin/transactions/:id/approve` - Approve transaction
- `PUT /admin/transactions/:id/reject` - Reject transaction
- `GET /admin/tasks` - Task list
- `GET /admin/tasks/:id` - Task detail
- `PUT /admin/tasks/:id` - Update task
- `POST /admin/tasks/initialize` - Initialize 20 default tasks
- `GET /admin/banks` - Company bank list
- `POST /admin/banks` - Create bank
- `PUT /admin/banks/:id` - Update bank
- `PUT /admin/banks/:id/toggle` - Toggle bank active status
- `DELETE /admin/banks/:id` - Delete bank
- `GET /admin/contacts` - Contact center list
- `POST /admin/contacts` - Create contact
- `PUT /admin/contacts/:id` - Update contact
- `PUT /admin/contacts/:id/toggle` - Toggle contact active status
- `DELETE /admin/contacts/:id` - Delete contact

### Static Files
- `GET /uploads/avatars/:filename` - Serve avatar images
- `GET /uploads/proofs/:filename` - Serve deposit proof images

## Default Credentials

### Admin User
Setelah menjalankan `bun run create-admin` di folder backend:
- Default password: `admin123` (ubah setelah login pertama kali)

### User Account
Buat user baru melalui halaman register di frontend.

## Membership Tiers

- **Level 3**: Deposit Rp 500.000, Reward Rp 1.250/task
- **Level 2**: Deposit Rp 1.000.000, Reward Rp 2.500/task
- **Level 1**: Deposit Rp 5.000.000, Reward Rp 12.500/task

All tiers: Max 20 tasks/day, Lock period 30 days

## Currency Formatting

All amounts are displayed in IDR (Rupiah) format:
- Format: `Rp 1.000.000` (with thousand separators)
- Utilities available in `lib/format.ts`

## Business Rules

### Task System
- **Daily Limit**: Maksimal 20 task per hari per user
- **Rate Limit**: 10 detik minimum antara claim task
- **Balance Requirement**: User hanya bisa claim task jika:
  - `is_active = true`
  - `tier_level > 0`
  - `balance_deposit >= minimum deposit untuk tier_level`
- Task link dibuka di **tab baru** (deep link atau URL eksternal)
- Status task auto-reload setelah claim sukses

### Deposit System
- Deposit menggunakan **IDR via bank transfer** (bukan crypto)
- User transfer ke salah satu rekening perusahaan yang aktif
- Upload bukti transfer → admin review → approve → update saldo & aktivasi user
- Lock period: **30 hari** untuk deposit

### Withdraw System
- Minimal withdraw: **Rp 50.000**
- Hanya bisa withdraw dari `balance_available`
- Admin harus approve/reject setiap withdrawal request

### Dynamic Settings
- **Bank Perusahaan** & **Contact Center** dikelola sepenuhnya dari Admin Dashboard
- Settings aktif langsung tampil ke user:
  - Deposit page → bank accounts dari `/public/banks`
  - Help Center → contact CS dari `/public/contacts`

## Database Schema

### Core Models
- **User**: User data, tier level, network relations, profile info
- **Wallet**: Balance breakdown (deposit, reward, matching, available)
- **TaskLog**: Daily task progress per user
- **Transaction**: All transaction history (deposit, withdraw, bonuses)
- **TaskConfig**: Task configuration (20 tasks)
- **CompanyBank**: Company bank accounts (dynamic)
- **ContactCenter**: Contact center info (dynamic)

See `backend/prisma/schema.prisma` for complete schema definition.

## Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3002
```

### Backend (.env)
```env
JWT_SECRET=your-secret-key-min-32-characters
DATABASE_URL="file:./dev.db"  # SQLite for dev, PostgreSQL for production
PORT=3002
```

## Production Deployment

### Frontend
1. Build production:
```bash
npm run build
npm start
```

2. Deploy to Vercel/Netlify atau VPS dengan Node.js

### Backend
1. Set production environment variables
2. Use PostgreSQL database (update `DATABASE_URL`)
3. Run migrations:
```bash
cd backend
bun run prisma migrate deploy
```
4. Start server:
```bash
cd backend
bun run start
```

### Recommended Setup
- **Frontend**: Vercel / Netlify (Next.js optimized)
- **Backend**: VPS dengan PM2 / systemd
- **Database**: PostgreSQL (managed service seperti Supabase/Neon atau VPS)
- **File Storage**: Cloud storage (S3, Cloudinary) untuk production (saat ini masih local filesystem)

## Additional Documentation

- `QUICK_START.md` - Quick start guide
- `INTEGRATION.md` - Frontend-Backend integration details
- `ROUTING_GUIDE.md` - Routing structure guide
- `ADMIN_SETUP.md` - Admin dashboard setup guide
- `backend/README.md` - Backend specific documentation

## License

Private project - Tiktok Live&Like

