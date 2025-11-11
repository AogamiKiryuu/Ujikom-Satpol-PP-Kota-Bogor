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

- ✅ **CRUD Ujian** dengan pengaturan waktu fleksibel (start date, end date, duration)
- ✅ **Bank Soal** dengan multiple choice (A, B, C, D)
- ✅ **Import Soal Massal** via CSV/Excel dengan template dinamis
- ✅ **Modal Import Responsif** untuk resolusi rendah (1366x768+)
- ✅ **Question Ordering** - urutan soal dapat diatur manual
- ✅ **Equal Scoring System** - semua soal memiliki bobot nilai yang sama
- ✅ **Auto-grading System** dengan skor real-time
- ✅ **Timer Otomatis** per ujian dengan countdown dan auto-submit
- ✅ **Passing Score Configuration** - atur nilai minimal kelulusan
- ✅ **Exam Status Management** - Draft, Published, Expired
- ✅ Template download berdasarkan ujian terpilih

### 📱 **Mobile-First User Experience**

- ✅ **Railway Navigation** - navigasi soal horizontal dengan scroll smooth
- ✅ **Touch-Optimized Interface** - button size 44px minimum untuk mobile
- ✅ **Auto-scroll** ke soal aktif pada navigasi mobile
- ✅ **Enhanced Clickable Feedback** - hover effects dan visual indicators
- ✅ **Progress Bar Animated** dengan visual feedback real-time
- ✅ **Responsive Modal Design** untuk semua resolusi layar
- ✅ **Question Number Badges** - indikator visual untuk status jawaban
- ✅ **Smooth Transitions** antar soal dengan animasi halus
- ✅ **Mobile-First Forms** dengan validation dan error handling

### 📊 **Advanced Analytics & Comprehensive Reporting**

- ✅ Dashboard admin dengan statistik lengkap dan real-time
- ✅ **Analisis Performa Ujian** dengan metrik komprehensif
- ✅ **Question Analysis** - persentase jawaban benar per soal
- ✅ **Distribusi Jawaban** per opsi untuk setiap soal
- ✅ **Visual Charts & Graphs** untuk analisis data
- ✅ **Statistik Peserta** dengan tracking lengkap
- ✅ **Time Trends Analysis** untuk monitoring performance
- ✅ Export laporan dalam format CSV dengan data lengkap
- ✅ **Real-time Dashboard** dengan auto-refresh statistics

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

**Command Line:**

```bash
# Install (requires Java)
wget https://sourceforge.net/projects/plantuml/files/plantuml.jar/download -O plantuml.jar

# Generate PNG
java -jar plantuml.jar docs/ActivitiesDiagram_Sistem_CBT.puml

# Generate SVG
java -jar plantuml.jar -tsvg docs/*.puml
```

📖 **Panduan lengkap**: Lihat `docs/PlantUML_README.md` untuk dokumentasi komprehensif

---

## �️ Database Schema

Sistem menggunakan 5 main entities dengan Prisma ORM:

### **Core Entities:**

1. **User** - Data pengguna (Admin & Peserta)

   - Fields: id, nama, email, password (hashed), tempatLahir, tanggalLahir, jenisKelamin, role
   - Relations: ✅ One-to-Many dengan Exam (as creator), ✅ One-to-Many dengan ExamResult

2. **Exam** - Data ujian

   - Fields: id, userId, title, subject, duration, passingScore, startDate, endDate, status
   - Relations: ✅ Many-to-One dengan User, ✅ One-to-Many dengan Question, ✅ One-to-Many dengan ExamResult

3. **Question** - Data soal ujian

   - Fields: id, examId, questionText, optionA, optionB, optionC, optionD, correctAnswer, questionOrder
   - Relations: ✅ Many-to-One dengan Exam, ✅ One-to-Many dengan Answer

4. **ExamResult** - Data hasil ujian peserta

   - Fields: id, examId, userId, score, startTime, endTime, status, isPassed
   - Relations: ✅ Many-to-One dengan Exam, ✅ Many-to-One dengan User, ✅ One-to-Many dengan Answer

5. **Answer** - Data jawaban peserta per soal
   - Fields: id, examResultId, questionId, selectedAnswer, isCorrect
   - Relations: ✅ Many-to-One dengan ExamResult, ✅ Many-to-One dengan Question

### **Key Features:**

- ✅ Cascade deletes untuk data integrity
- ✅ Unique constraints untuk email dan combinasi data
- ✅ Indexed fields untuk query performance
- ✅ DateTime tracking (createdAt, updatedAt)
- ✅ Enums untuk Gender dan Role

📊 Lihat `docs/ERD_Sistem_CBT.puml` atau `docs/ERD_Sistem_CBT.drawio` untuk visualisasi lengkap

---

## �🛠️ Tech Stack

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

- **Prisma ORM 6.13.0** - Type-safe database management dengan migrations
- **PostgreSQL** - Robust primary database dengan relational integrity
- **JWT (jose)** - Secure authentication tokens dengan expiry
- **bcryptjs** - Advanced password hashing dengan salt rounds
- **CSV Parser (papaparse)** - Bulk import functionality untuk soal
- **Middleware** - Request/response processing dan authentication guards
- **Next.js API Routes** - RESTful API dengan type safety

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
npx prisma migrate dev

# Or use db push for development
npx prisma db push

# Optional: View database in Prisma Studio
npx prisma studio

# Optional: Seed with sample data (if seed script available)
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
   - Evaluasi performa ujian secara keseluruhan
   - Analisis per soal dengan persentase jawaban benar
   - Distribusi jawaban untuk setiap opsi (A, B, C, D)
   - Visual charts dan graphs untuk insight data
   - Export laporan dalam format CSV

### **Student Experience**

1. **Login** sebagai peserta dengan credentials yang valid
2. **Dashboard Peserta** - lihat ujian yang tersedia dan riwayat hasil
3. **Mengikuti Ujian**:
   - **Mobile-First Interface** dengan railway navigation
   - **Touch-Optimized Controls** untuk semua device
   - **Real-time Auto-save** untuk setiap jawaban
   - **Visual Progress Indicator** dengan animated progress bar
   - **Smart Navigation** dengan auto-scroll ke soal aktif
   - **Countdown Timer** dengan visual warning saat waktu hampir habis
   - **Question Numbering** dengan status jawaban (answered/unanswered)
4. **Hasil Ujian**:
   - Tampilan hasil dengan **professional icons** (CheckCircle/XCircle)
   - **Equal scoring system** - semua soal bernilai sama (1 poin per soal)
   - **Pass/Fail Indicator** berdasarkan passing score
   - Detail jawaban dengan pembahasan (correct answer visible)
   - **Score Percentage** dan total correct answers
   - Waktu pengerjaan dan statistik performance

#### **2. Format CSV/Xlxs Template**

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
- ✅ **Complete UML Documentation** dalam 2 format (Draw.io & PlantUML)
- ✅ **Git-Friendly Diagrams** dengan PlantUML text-based format
- ✅ **Production-Ready** dengan security best practices
- ✅ **Touch-Optimized** interface untuk mobile devices

<div align="center">
  <strong>Dibuat untuk memenuhi Ujian Kompetensi - Praktik Lapang UNPAK</strong>
  <br>
  <em>Sistem CBT Modern dengan Mobile-First Approach</em>
</div>
