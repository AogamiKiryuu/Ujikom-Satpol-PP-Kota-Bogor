# 📝 CBT Exam System - Satpol PP Kota Bogor

**Computer-Based Test (CBT) System** untuk Ujian Kompetensi Satuan Polisi Pamong Praja Kota Bogor. Sistem ujian digital yang modern, aman, dan mudah digunakan dengan fitur import soal otomatis dan analisis mendalam.

![Next.js](https://img.shields.io/badge/Next.js-15.4.5-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6.13.0-2D3748?style=flat-square&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?style=flat-square&logo=postgresql)

## ✨ Features

### 👥 **Multi-Role System**

- **Admin**: Kelola ujian, soal, peserta, dan laporan komprehensif
- **Peserta**: Ikuti ujian dengan interface yang user-friendly dan real-time timer

### 🎯 **Advanced Exam Management**

- ✅ CRUD ujian dengan pengaturan waktu fleksibel
- ✅ Bank soal dengan multiple choice (A, B, C, D)
- ✅ **Import Soal Massal** via CSV dengan template dinamis
- ✅ **Drag & Drop Upload** untuk kemudahan import
- ✅ Auto-grading system dengan skor real-time
- ✅ Timer otomatis per ujian dengan auto-submit
- ✅ Template download berdasarkan ujian terpilih

### 📊 **Advanced Analytics & Comprehensive Reporting**

- ✅ Dashboard admin dengan statistik lengkap dan real-time
- ✅ **Analisis Tingkat Kesulitan Soal** dengan 6 level assessment
  - 🟢 Sangat Mudah (≥80% benar)
  - 🟢 Mudah (65-79% benar)
  - 🔵 Sedang (50-64% benar)
  - 🟠 Sulit (35-49% benar)
  - 🔴 Sangat Sulit (20-34% benar)
  - 🟣 Ekstrem Sulit (<20% benar)
- ✅ **Evaluasi Ujian Keseluruhan** dengan rekomendasi perbaikan
- ✅ **Distribusi Jawaban** per opsi untuk setiap soal
- ✅ **Question Analysis** - persentase jawaban benar per soal
- ✅ **Visual Progress Bar** untuk tingkat kesulitan
- ✅ Statistik peserta dan trend waktu
- ✅ Export laporan dalam format CSV dengan data lengkap

### 🔐 **Security & Performance Features**

- ✅ JWT Authentication dengan middleware protection
- ✅ Role-based access control (ADMIN/PESERTA)
- ✅ Password hashing dengan bcrypt
- ✅ Session management yang aman
- ✅ Input validation dan sanitization
- ✅ Rate limiting untuk API endpoints

### 🎨 **User Experience**

- ✅ **Dark/Light Mode** dengan theme persistence
- ✅ Responsive design untuk semua device
- ✅ Real-time countdown timer
- ✅ Progress tracking selama ujian
- ✅ Toast notifications dalam Bahasa Indonesia
- ✅ Loading states dan skeleton UI

## 🛠️ Tech Stack

### **Frontend**

- **Next.js 15.4.5** - React framework dengan App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Modern styling dengan responsive design
- **Framer Motion** - Smooth animations dan transitions
- **React Hook Form** - Advanced form management
- **React Hot Toast** - Beautiful notifications
- **Lucide React** - Modern icon library
- **Next Themes** - Dark/Light mode support

### **Backend**

- **Next.js API Routes** - Full-stack server-side endpoints
- **Prisma ORM** - Type-safe database management
- **PostgreSQL** - Robust primary database
- **JWT (jose)** - Secure authentication tokens
- **bcryptjs** - Advanced password hashing
- **CSV Parser** - Bulk import functionality
- **Middleware** - Request/response processing

### **DevOps & Tools**

- **ESLint** - Code linting dengan custom rules
- **Prettier** - Code formatting consistency
- **Husky** - Git hooks untuk quality assurance
- **TypeScript** - Static type checking
- **Turbopack** - Fast development bundler
- **Hot Reload** - Instant development feedback

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** (Recommended: v20.x)
- **PostgreSQL 14+** database
- **npm/yarn/pnpm** package manager
- **Git** for version control

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
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/cbt_exam_db"

# JWT Security
JWT_SECRET="your-super-secure-jwt-secret-key-here"

# Next.js Configuration
NEXTAUTH_SECRET="your-nextauth-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Optional: Additional Security
BCRYPT_ROUNDS=12
SESSION_TIMEOUT=3600
```

### 4. Database Setup

````bash
# Generate Prisma client
npx prisma generate

# Create database and run migrations
npx prisma db push

# Optional: Seed with sample data
npx prisma db seed

### 5. Run Development Server

#### **Local Development (Default)**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
````

## 🎯 Usage Guide

### **Admin Dashboard**

1. **Login** sebagai admin dengan credentials yang valid
2. **Dashboard Overview** - lihat statistik real-time di `/admin/dashboard`
3. **Manajemen Ujian** di menu "Ujian":
   - Buat ujian baru dengan pengaturan waktu fleksibel
   - Edit ujian existing dengan validasi
   - Hapus ujian (jika belum ada peserta)
4. **Manajemen Soal** di menu "Soal":
   - **Import massal** via CSV dengan template dinamis
   - **Drag & drop** file upload untuk kemudahan
   - CRUD soal individual dengan validasi
   - Preview template sebelum download
5. **Monitor Peserta** di menu "Peserta"
6. **Analisis Tingkat Kesulitan** di menu "Laporan":
   - Evaluasi kesulitan ujian secara keseluruhan
   - Analisis per soal dengan 6 level kesulitan
   - Distribusi jawaban dan rekomendasi perbaikan
   - Export data analisis dalam format CSV

### **Import Soal (New Flow)**

1. **Pilih Ujian** terlebih dahulu dari daftar ujian tersedia
2. **Download Template** yang sudah pre-filled dengan exam info
3. **Upload File** dengan drag & drop atau click upload
4. **Preview** dan konfirmasi import
5. **Auto-mapping** soal ke ujian yang dipilih

### **Peserta (Student Experience)**

1. **Register/Login** dengan interface yang user-friendly
2. **Dashboard Peserta** - lihat ujian tersedia dan progress
3. **Mulai Ujian** dengan real-time timer dan progress tracking
4. **Auto-save** jawaban untuk mencegah kehilangan data
5. **Submit Otomatis** saat waktu habis
6. **Hasil Instan** dengan breakdown skor dan analisis

## 🧪 API Endpoints

### **Authentication**

- `POST /api/auth/login` - User login dengan JWT
- `POST /api/auth/register` - User registration dengan validation
- `POST /api/auth/logout` - Secure user logout
- `GET /api/auth/verify` - Token verification middleware

### **Admin API - Exams**

- `GET /api/admin/exams` - List all exams dengan pagination
- `POST /api/admin/exams` - Create new exam dengan validation
- `GET /api/admin/exams/[id]` - Get detailed exam information
- `PUT /api/admin/exams/[id]` - Update exam dengan business rules
- `DELETE /api/admin/exams/[id]` - Delete exam (dengan safety checks)
- `GET /api/admin/exams/list` - Simple exam list untuk dropdown

### **Admin API - Questions**

- `GET /api/admin/questions` - List questions dengan filtering
- `POST /api/admin/questions` - Create individual question
- `GET /api/admin/questions/[id]` - Get question details
- `PUT /api/admin/questions/[id]` - Update question
- `DELETE /api/admin/questions/[id]` - Delete question
- `POST /api/admin/questions/import` - **Bulk import via CSV**

### **Admin API - Reports & Analytics**

- `GET /api/admin/reports?type=overview` - Dashboard statistics
- `GET /api/admin/reports?type=exam-performance` - **Question analysis**
- `GET /api/admin/reports?type=user-performance` - Student performance
- `GET /api/admin/reports?type=time-trends` - Trend analysis
- `GET /api/admin/dashboard/stats` - Real-time dashboard data

### **Student API**

- `GET /api/peserta/stats` - Student dashboard statistics
- `GET /api/exams` - Available exams for students
- `GET /api/peserta/exam/[id]` - Get exam for taking
- `POST /api/peserta/exam/[id]/start` - Start exam session
- `POST /api/peserta/exam/[id]/answer` - Submit answer dengan auto-save
- `POST /api/peserta/exam/[id]/submit` - **Final submit dengan scoring**
- `GET /api/peserta/exam/[id]/result` - Get exam results

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Development Team

- **Dev**: [AogamiKiryuu](https://github.com/AogamiKiryuu)
- **Instansi**: Satuan Polisi Pamong Praja Kota Bogor
- **Project Type**: Ujian Kompetensi - Praktik Lapang UNPAK

## 🎯 Key Achievements

- ✅ **100% Functional** CRUD operations untuk ujian dan soal
- ✅ **Advanced Analytics** dengan question-level analysis
- ✅ **Bulk Import** system dengan validasi komprehensif
- ✅ **Real-time Performance** tracking dan reporting
- ✅ **Mobile-Responsive** design untuk semua device
- ✅ **Production-Ready** dengan security best practices

<div align="center">
  <strong>Dibuat untuk memenuhi Ujian Kompetensi - Praktik Lapang UNPAK</strong>
  <br>
  <sub>Computer-Based Test System v1.3.0 - Advanced Analytics Edition</sub>
  <br><br>
  <em>"Modern CBT Solution for Professional Assessment"</em>
</div>
