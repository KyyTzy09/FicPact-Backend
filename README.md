```
# Task Quest - Backend API

Backend API untuk **Task Quest**, aplikasi manajemen tugas berbasis gamifikasi dengan sistem leveling, quest, dan refleksi berbasis AI.

## Tech Stack

- **Runtime**: Node.js 20
- **Framework**: [Hono](https://hono.dev/)
- **Language**: TypeScript (ESNext)
- **Database**: PostgreSQL 16
- **ORM**: Prisma 7
- **Auth**: JWT (HTTP-only cookie) + Google OAuth
- **AI**: Integrasi AI eksternal untuk refleksi
- **Notifikasi**: Email (Nodemailer) & WhatsApp (Fonnte)
- **API Docs**: OpenAPI 3.0 + [Scalar](https://scalar.com/)
- **Containerization**: Docker & Docker Compose

## Prerequisites

- Node.js >= 20
- PostgreSQL 16 (atau Docker)
- npm

## Getting Started

### 1. Clone & Install

```bash
npm install
```

### 2. Setup Environment

Buat file `.env` di root project:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/taskquest"

# JWT
JWT_SECRET="your-jwt-secret"

# AI Service
AI_API_BASE_URL="https://your-ai-service-url"
AI_API_TOKEN="your-ai-token"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Frontend
FRONTEND_BASE_URL="http://localhost:3000"
FRONTEND_DASHBOARD_URL="http://localhost:3000/dashboard"

# Email (Nodemailer)
EMAIL_ADMIN="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# WhatsApp (Fonnte)
FONNTE_BASE_URL="https://api.fonnte.com"
FONNTE_API_KEY="your-fonnte-api-key"
```

### 3. Setup Database

```bash
npx prisma migrate dev
npx prisma generate
```

### 4. Run Development Server

```bash
npm run dev
```

Server berjalan di **http://localhost:8080**

### 5. API Documentation

Buka **http://localhost:8080/docs** untuk Scalar API Reference.

## Docker

### Jalankan dengan Docker Compose

```bash
docker compose up --build
```

Ini akan menjalankan:
- **task-quest-api** di port `8080`
- **task-quest-db** (PostgreSQL) di port `5432`

## Scripts

| Script | Deskripsi |
|---|---|
| `npm run dev` | Jalankan development server (hot reload) |
| `npm run build` | Build TypeScript ke JavaScript |
| `npm start` | Jalankan production server |

## API Endpoints

### Auth (`/auth`)

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/auth/google` | Login via Google OAuth |
| POST | `/auth/login` | Login dengan email & password |
| POST | `/auth/register` | Registrasi akun baru |
| POST | `/auth/forgot-password` | Kirim email reset password |
| POST | `/auth/reset-password` | Reset password dengan token |
| POST | `/auth/verify-account` | Verifikasi akun 🔒 |
| POST | `/auth/resend-verification-code` | Kirim ulang kode verifikasi 🔒 |
| POST | `/auth/update-phone` | Update nomor WhatsApp 🔒 |
| POST | `/auth/resend-phone-verification` | Kirim ulang kode verifikasi telepon 🔒 |

### User (`/user`)

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/user/session` | Ambil data session user 🔒 |

### Folder (`/folders`)

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/folders/` | List semua quest folder 🔒 |
| GET | `/folders/user/available` | List folder yang tersedia 🔒 |
| GET | `/folders/:folderId` | Detail quest folder 🔒 |
| POST | `/folders/` | Buat quest folder baru 🔒 |
| PATCH | `/folders/:folderId` | Update quest folder 🔒 |
| DELETE | `/folders/:folderId` | Hapus quest folder 🔒 |

### Quest (`/quests`)

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/quests/` | List semua quest 🔒 |
| POST | `/quests/` | Buat quest baru 🔒 |
| PUT | `/quests/:questId/complete` | Tandai quest selesai 🔒 |
| DELETE | `/quests/:questId` | Hapus quest 🔒 |

### Reflection (`/reflection`)

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/reflection/latest` | Ambil refleksi terbaru 🔒 |
| POST | `/reflection/quest` | Buat refleksi quest 🔒 |
| POST | `/reflection/create-failed` | Buat refleksi kegagalan 🔒 |
| POST | `/reflection/weekly` | Buat refleksi mingguan 🔒 |

### Job (`/job`)

| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | `/job/reflection-trigger` | Trigger refleksi untuk user inaktif |
| POST | `/job/whatsapp-notification` | Kirim notifikasi WhatsApp deadline |

> 🔒 = Membutuhkan autentikasi (JWT cookie)

## Fitur Gamifikasi

Sistem leveling dengan formula EXP: `100 × (level ^ 1.5)`

| Level | EXP Dibutuhkan |
|---|---|
| 1 → 2 | 100 |
| 2 → 3 | 282 |
| 5 → 6 | 1,118 |
| 10 → 11 | 3,162 |

User mendapatkan EXP dari menyelesaikan quest dan achievement. Sistem mendukung multi-level up dalam satu aksi.

## Database Schema

Model utama:
- **User** - Akun pengguna dengan sistem leveling (level, currentExp, totalExp)
- **QuestFolder** - Folder untuk mengelompokkan quest (status: PENDING, COMPLETED, FAILED, EXPIRED)
- **Quest** - Task/tugas dengan deadline dan reward EXP
- **QuestReflection** - Refleksi per quest (SUCCESS/FAILED) dengan tingkat prioritas (LOW, NORMAL, HIGH)
- **Reflection** - Refleksi periodik user yang di-generate dengan bantuan AI
- **Achievement** - Sistem pencapaian dengan reward EXP
- **VerificationToken** - Token verifikasi untuk akun, telepon, dan reset password

## Project Structure

```
src/
├── index.ts                    # Entry point & route registration
├── common/
│   ├── middlewares/
│   │   └── auth.middleware.ts  # JWT authentication
│   └── utils/
│       ├── email.ts            # Nodemailer helper
│       ├── env.ts              # Environment variables
│       ├── fonnte.ts           # WhatsApp API helper
│       ├── hash.ts             # Password hashing (Argon2)
│       ├── jwt.ts              # JWT utilities
│       ├── leveling.ts         # EXP & leveling system
│       ├── phone.ts            # Phone number formatter
│       ├── prisma.ts           # Prisma client instance
│       ├── reflection.ts       # Reflection utilities
│       └── response.ts         # Response helpers
└── modules/
    ├── achievement/            # Sistem achievement
    ├── ai/                     # Integrasi AI untuk refleksi
    ├── auth/                   # Autentikasi & OAuth
    ├── folder/                 # Quest folder management
    ├── job/                    # Background jobs & notifikasi
    ├── profile/                # Profil user
    ├── quest/                  # Quest CRUD & completion
    ├── reflection/             # Refleksi quest & mingguan
    └── user/                   # User session
```
