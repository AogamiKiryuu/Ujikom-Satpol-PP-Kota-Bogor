# 📝 CBT Exam System - Satpol PP Kota Bogor

**Computer-Based Test (CBT) System** untuk Ujian Kompetensi Satuan Polisi Pamong Praja Kota Bogor. Sistem ujian digital yang modern, aman, dan mudah digunakan dengan fitur import soal otomatis, navigasi mobile-friendly, dan analisis mendalam.

![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6.13.0-2D3748?style=flat-square&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?style=flat-square&logo=postgresql)

## ✨ Features

### 👥 **Multi-Role System**

- **Admin**: Kelola ujian, soal, peserta, dan laporan komprehensif
- **Peserta**: Ikuti ujian dengan interface yang user-friendly dan navigasi mobile-optimized

### 🎯 **Advanced Exam Management**

- ✅ CRUD ujian dengan pengaturan waktu fleksibel
- ✅ Bank soal dengan multiple choice (A, B, C, D)
- ✅ **Import Soal Massal** via CSV/Excel dengan template dinamis
- ✅ **Modal Import Responsif** untuk resolusi rendah (1366x768+)
- ✅ **Equal Scoring System** - semua soal memiliki bobot nilai yang sama
- ✅ Auto-grading system dengan skor real-time
- ✅ Timer otomatis per ujian dengan auto-submit
- ✅ Template download berdasarkan ujian terpilih

### 📱 **Mobile-First User Experience**

- ✅ **Railway Navigation** - navigasi soal horizontal dengan scroll smooth
- ✅ **Touch-Optimized Interface** - button size 44px minimum untuk mobile
- ✅ **Auto-scroll** ke soal aktif pada navigasi mobile
- ✅ **Enhanced Clickable Feedback** - hover effects dan visual indicators
- ✅ **Progress Bar Animated** dengan visual feedback
- ✅ **Responsive Modal Design** untuk semua resolusi layar

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

### 🎨 **User Experience & Interface**

- ✅ **Dark/Light Mode** dengan theme persistence
- ✅ **Fully Responsive Design** untuk semua device
- ✅ **Professional Icons** menggunakan Lucide React (tanpa emoji)
- ✅ Real-time countdown timer dengan visual feedback
- ✅ Progress tracking selama ujian
- ✅ Toast notifications dalam Bahasa Indonesia
- ✅ Loading states dan skeleton UI
- ✅ **Consistent Hover Effects** pada semua clickable elements
- ✅ **Scale Animations** dan smooth transitions

## 🛠️ Tech Stack

### **Frontend**

- **Next.js 15.5.2** - React framework dengan App Router
- **TypeScript** - Type-safe development  
- **Tailwind CSS** - Modern styling dengan responsive design
- **Custom CSS Utilities** - Enhanced hover effects dan animations
- **React Hook Form** - Advanced form management
- **React Toastify** - Beautiful notifications
- **Lucide React** - Professional icon library (no emojis)
- **Next Themes** - Dark/Light mode support

### **Backend**

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
   - **Import massal** via CSV/Excel dengan modal responsif
   - **Drag & drop** file upload untuk kemudahan
   - Preview data sebelum import dengan validasi
   - CRUD soal individual dengan validasi
5. **Monitor Peserta** di menu "Peserta"
6. **Analisis Comprehensive** di menu "Laporan":
   - Evaluasi kesulitan ujian secara keseluruhan
   - Analisis per soal dengan 6 level kesulitan
   - Export laporan dalam format CSV

### **Student Experience**

1. **Login** sebagai peserta dengan credentials yang valid
2. **Dashboard Peserta** - lihat ujian yang tersedia dan riwayat
3. **Mengikuti Ujian**:
   - **Mobile-First Interface** dengan railway navigation
   - **Touch-Optimized Controls** untuk semua device
   - **Real-time Auto-save** untuk setiap jawaban
   - **Visual Progress Indicator** dengan animated progress bar
   - **Smart Navigation** dengan auto-scroll ke soal aktif
4. **Hasil Ujian**:
   - Tampilan hasil dengan **professional icons** (CheckCircle/XCircle)
   - **Equal scoring system** - semua soal bernilai sama
   - Detail jawaban dan analisis performance

#### **2. Format CSV Template**

Template CSV memiliki kolom berikut:
- `examTitle` - Judul ujian (opsional, akan menggunakan ujian terpilih)
- `examSubject` - Mata pelajaran (opsional)
- `questionText` - Teks pertanyaan (required)
- `optionA` - Pilihan A (required)
- `optionB` - Pilihan B (required)  
- `optionC` - Pilihan C (required)
- `optionD` - Pilihan D (required)
- `correctAnswer` - Jawaban benar: A/B/C/D (required)

**Contoh Template:**
```csv
examTitle,examSubject,questionText,optionA,optionB,optionC,optionD,correctAnswer
Matematika,Dasar,2 + 2 = ?,2,3,4,5,C
Matematika,Dasar,5 × 3 = ?,13,15,18,20,B
Matematika,Lanjut,Integral ∫x² dx = ?,x³ + C,x³/3 + C,2x + C,x + C,B
```

#### **3. Equal Scoring System**

Sistem penilaian yang disederhanakan:
- **Semua soal memiliki bobot yang sama** (1 poin per soal)
- **Tidak ada weighted scoring** berdasarkan tingkat kesulitan
- **Perhitungan mudah**: Skor = (Jawaban Benar / Total Soal) × 100%

**Contoh Perhitungan:**
```
Ujian dengan 10 soal:
- Jawaban benar: 8 soal
- Skor Akhir: (8/10) × 100% = 80%
```

#### **4. Mobile-Responsive Features**

- **Modal Import** yang adaptif untuk resolusi 1366x768+
- **Railway Navigation** untuk navigasi soal di mobile
- **Touch-friendly buttons** dengan minimum 44px touch target
- **Auto-scroll** ke soal aktif saat navigasi
- **Hover effects** yang konsisten pada semua clickable elements

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
- `POST /api/peserta/exam/[id]/submit` - **Final submit dengan equal scoring**
- `GET /api/peserta/exam/[id]/result` - Get exam results dengan professional icons

## 🎯 Key Features Overview

### **⚖️ Equal Scoring System**

```
Scoring Formula: (Correct Answers / Total Questions) × 100%

Example:
- Total Questions: 10
- Correct Answers: 8  
- Final Score: (8/10) × 100% = 80%
```

### **� Mobile-First Design**

- **Railway Navigation**: Horizontal scrolling dengan smooth animations
- **Touch Optimization**: 44px minimum touch targets
- **Responsive Modals**: Adaptif untuk resolusi 1366x768+
- **Auto-scroll**: Smart navigation ke soal aktif
- **Visual Feedback**: Hover effects dan scale animations

### **📋 Import Template Format**

```csv
examTitle,examSubject,questionText,optionA,optionB,optionC,optionD,correctAnswer
Matematika,Dasar,2+2=?,2,3,4,5,C
Matematika,Lanjut,∫x²dx=?,x³+C,x³/3+C,2x+C,x+C,B
```

### **🎨 UI/UX Improvements**

- ✅ **Professional Icons**: Lucide React icons menggantikan emoji
- ✅ **Consistent Hover Effects**: Scale animations dan shadow depth
- ✅ **Mobile Railway Navigation**: Horizontal scroll untuk mobile
- ✅ **Responsive Design**: Support untuk semua resolusi layar
- ✅ **Touch-Friendly Interface**: Optimized untuk mobile devices

---

## �📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Development Team

- **Dev**: [AogamiKiryuu](https://github.com/AogamiKiryuu)
- **Instansi**: Satuan Polisi Pamong Praja Kota Bogor
- **Project Type**: Ujian Kompetensi - Praktik Lapang UNPAK

## 🎯 Key Achievements

- ✅ **100% Functional** CRUD operations untuk ujian dan soal
- ✅ **Advanced Analytics** dengan question-level analysis  
- ✅ **Real-time Performance** tracking dan reporting
- ✅ **Mobile-First Design** dengan railway navigation
- ✅ **Equal Scoring System** yang mudah dipahami
- ✅ **Responsive Modal Design** untuk semua resolusi (1366x768+)
- ✅ **Professional UI** dengan Lucide React icons
- ✅ **Enhanced UX** dengan hover effects dan animations
- ✅ **Production-Ready** dengan security best practices
- ✅ **Touch-Optimized** interface untuk mobile devices

## 🚀 Recent Updates

### **Version 2.0 - Mobile-First Improvements**
- 🆕 **Railway Navigation** untuk mobile dengan horizontal scroll
- 🆕 **Equal Scoring System** menggantikan weighted scoring  
- 🆕 **Responsive Modal Import** untuk resolusi rendah
- 🆕 **Enhanced Clickable Feedback** dengan hover effects
- 🆕 **Professional Icons** menggantikan emoji
- 🆕 **Auto-scroll Navigation** ke soal aktif
- 🆕 **Touch-Friendly Interface** dengan 44px minimum targets

<div align="center">
  <strong>Dibuat untuk memenuhi Ujian Kompetensi - Praktik Lapang UNPAK</strong>
  <br>
  <em>Sistem CBT Modern dengan Mobile-First Approach</em>
</div>
