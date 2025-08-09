# 📝 CBT Exam System - Satpol PP Kota Bogor

**Computer-Based Test (CBT) System** untuk Ujian Kompetensi Satuan Polisi Pamong Praja Kota Bogor. Sistem ujian digital yang modern, aman, dan mudah digunakan.

![Next.js](https://img.shields.io/badge/Next.js-15.4.5-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6.13.0-2D3748?style=flat-square&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?style=flat-square&logo=postgresql)

## ✨ Features

### 👥 **Multi-Role System**

- **Admin**: Kelola ujian, soal, peserta, dan laporan
- **Peserta**: Ikuti ujian dengan interface yang user-friendly

### 🎯 **Exam Management**

- ✅ CRUD ujian dengan pengaturan waktu fleksibel
- ✅ Bank soal dengan multiple choice (A, B, C, D)
- ✅ Auto-grading system dengan skor real-time
- ✅ Timer otomatis per ujian
- ✅ Randomisasi soal (opsional)

### 📊 **Analytics & Reporting**

- ✅ Dashboard admin dengan statistik lengkap
- ✅ Laporan hasil ujian per peserta
- ✅ Export hasil dalam berbagai format
- ✅ Grafik performa ujian

### 🔐 **Security Features**

- ✅ JWT Authentication
- ✅ Role-based access control
- ✅ Password hashing dengan bcrypt
- ✅ Session management
- ✅ CSRF protection

## 🛠️ Tech Stack

### **Frontend**

- **Next.js 15.4.5** - React framework dengan App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Modern styling
- **Framer Motion** - Smooth animations
- **React Hook Form** - Form management

### **Backend**

- **Next.js API Routes** - Server-side endpoints
- **Prisma ORM** - Database management
- **PostgreSQL** - Primary database
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

### **DevOps & Tools**

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **TypeScript** - Static type checking

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm/yarn/pnpm

### 1. Clone Repository

```bash
git clone https://github.com/AogamiKiryuu/Ujikom-Satpol-PP-Kota-Bogor.git
cd cbt-exam
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Setup

```bash
cp .env.example .env
```

Configure your `.env` file:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/cbt_exam"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key"

# Next.js
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma db push

# Seed database (optional)
npx prisma db seed
```

### 5. Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 Usage Guide

### **Admin Dashboard**

1. Login sebagai admin
2. Akses dashboard di `/admin/dashboard`
3. Kelola ujian di menu "Ujian"
4. Tambah/edit soal di menu "Soal"
5. Monitor peserta di menu "Peserta"
6. Lihat laporan di menu "Laporan"

### **Peserta (Student)**

1. Register/login sebagai peserta
2. Lihat ujian tersedia di dashboard
3. Klik "Mulai Ujian" untuk memulai
4. Jawab soal dalam batas waktu
5. Submit ujian untuk melihat hasil

## 🧪 API Endpoints

### **Authentication**

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify` - Verify token

### **Admin API**

- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/exams` - List all exams
- `POST /api/admin/exams` - Create new exam
- `GET /api/admin/exams/[id]` - Get exam details
- `PUT /api/admin/exams/[id]` - Update exam
- `DELETE /api/admin/exams/[id]` - Delete exam

### **Questions API**

- `GET /api/admin/questions` - List questions
- `POST /api/admin/questions` - Create question
- `PUT /api/admin/questions/[id]` - Update question
- `DELETE /api/admin/questions/[id]` - Delete question

### **Students API**

- `GET /api/peserta/stats` - Student statistics
- `GET /api/exams` - Available exams for students

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Developer**: [AogamiKiryuu](https://github.com/AogamiKiryuu)
- **Organization**: Satpol PP Kota Bogor

## 📞 Support

Jika mengalami masalah atau butuh bantuan:

- 🐛 [Report Bug](https://github.com/AogamiKiryuu/Ujikom-Satpol-PP-Kota-Bogor/issues)
- 💡 [Request Feature](https://github.com/AogamiKiryuu/Ujikom-Satpol-PP-Kota-Bogor/issues)
- 📧 Email: support@satpolpp-bogor.go.id

---

<div align="center">
  <strong>Dibuat untuk memenuhi Praktik Lapang UNPAK</strong>
  <br>
  <sub>Computer-Based Test System v1.0.0</sub>
</div>
