# 📝 CBT Exam System - Satpol PP Kota Bogor

Sistem ujian berbasis komputer (Computer-Based Test) untuk Ujian Kompetensi Satuan Polisi Pamong Praja Kota Bogor. Sistem yang modern, aman, dan mudah digunakan dengan fitur lengkap untuk admin dan peserta.

![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6.15.0-2D3748?style=flat-square&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?style=flat-square&logo=postgresql)

---

## ✨ Fitur Utama

### 👥 Untuk Admin

- **Manajemen Ujian**: CRUD lengkap dengan pengaturan waktu, passing score, dan status (Draft/Published/Expired)
- **Bank Soal**: Import massal via CSV/Excel atau CRUD manual dengan urutan soal
- **Dashboard Analytics**: Statistik real-time dengan visualisasi data dan grafik
- **Laporan Komprehensif**: Analisis per ujian dan per peserta dengan export CSV
- **Distribusi Jawaban**: Analisis performa soal dengan persentase jawaban benar per opsi

### 🎓 Untuk Peserta

- **Mobile-Friendly Interface**: Railway navigation horizontal untuk navigasi soal
- **Timer Otomatis**: Countdown dengan visual warning dan auto-submit
- **Auto-Save**: Setiap jawaban tersimpan otomatis untuk keamanan data
- **Hasil Instan**: Skor dan pembahasan detail setelah submit
- **Progress Tracking**: Visual indicator progress pengerjaan

### 🔐 Keamanan

- JWT authentication dengan role-based access control (ADMIN/PESERTA)
- Password hashing dengan bcrypt
- Input validation dan sanitization
- Session management yang aman

### ⚡ Performance Optimizations

Sistem telah dioptimasi untuk menangani **50+ peserta concurrent** dengan:

- **Connection Pooling**: 20 concurrent database connections
- **Database Indexes**: Optimized queries pada foreign keys
- **Rate Limiting**: Sliding window algorithm (100 req/60s per user)
- **Request Queue**: Max 50 concurrent dengan queue 500 requests
- **Caching Layer**: In-memory cache untuk exam data (TTL 5-10 menit)
- **Answer Batching**: Batch write untuk reduce database load

**Benchmark Results:**
- Throughput: **662 ops/second**
- Average Latency: **3.22ms**
- P95 Latency: **4ms**
- Success Rate: **100%**

### 🎨 User Experience

- Dark/Light mode dengan theme persistence
- Fully responsive (desktop, tablet, mobile)
- Professional icons dengan Lucide React
- Toast notifications dalam Bahasa Indonesia
- Smooth animations dan transitions

---

## 🛠️ Tech Stack

**Frontend**: Next.js 15.5.2, TypeScript, Tailwind CSS, React Hook Form, Lucide React  
**Backend**: Prisma ORM 6.15.0, PostgreSQL, JWT (jose), bcryptjs, Papaparse  
**DevOps**: ESLint, Prettier, Husky, Turbopack

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (Recommended: v20.x)
- PostgreSQL 14+
- npm/yarn/pnpm

### Installation

```bash
# 1. Clone repository
git clone https://github.com/AogamiKiryuu/Ujikom-Satpol-PP-Kota-Bogor.git
cd Ujikom-Satpol-PP-Kota-Bogor

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env dengan database credentials dan JWT secret

# 4. Setup database
npx prisma generate
npx prisma migrate dev

# 5. Create admin account
npx tsx scripts/create-admin.ts

# 6. Run development server
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

### Default Admin Account

```
Email    : admin@cbt.com
Password : admin#123
```

---

## 🧪 Testing Scripts

Tersedia berbagai script untuk testing dan development di folder `scripts/`:

### 📋 Daftar Scripts

| Script | Fungsi | Perintah |
|--------|--------|----------|
| `create-admin.ts` | Buat akun admin | `npx tsx scripts/create-admin.ts` |
| `seed-peserta.ts` | Tambah peserta massal | `npx tsx scripts/seed-peserta.ts [jumlah] [password]` |
| `create-exam.ts` | Buat ujian dengan soal | `npx tsx scripts/create-exam.ts` |
| `generate-results.ts` | Generate hasil ujian | `npx tsx scripts/generate-results.ts [examId] [jumlah]` |
| `simulation-optimized.ts` | Stress test performa | `npx tsx scripts/simulation-optimized.ts` |
| `db-stats.ts` | Lihat statistik database | `npx tsx scripts/db-stats.ts` |
| `reset-password.ts` | Reset password user | `npx tsx scripts/reset-password.ts <email> <password>` |
| `cleanup.ts` | Bersihkan data test | `npx tsx scripts/cleanup.ts [opsi]` |

### 📖 Contoh Penggunaan

```bash
# Tambah 50 peserta dengan password "test123"
npx tsx scripts/seed-peserta.ts 50 test123

# Buat ujian Matematika dengan 30 soal
EXAM_SUBJECT=Matematika EXAM_QUESTIONS=30 npx tsx scripts/create-exam.ts

# Generate hasil ujian untuk 20 peserta
npx tsx scripts/generate-results.ts <exam-id> 20

# Lihat statistik database
npx tsx scripts/db-stats.ts

# Reset password user
npx tsx scripts/reset-password.ts admin@cbt.com newpass123

# Preview data test yang akan dihapus
npx tsx scripts/cleanup.ts --test-users --dry-run

# Hapus data test
npx tsx scripts/cleanup.ts --test-users --simulation
```

### 🎯 Environment Variables untuk create-exam.ts

```bash
EXAM_TITLE="Judul Ujian"      # default: "Ujian Test [tanggal]"
EXAM_SUBJECT="Mata Pelajaran"  # default: "Umum"
EXAM_QUESTIONS=20              # default: 20
EXAM_DURATION=60               # default: 60 (menit)
EXAM_PASSING=70                # default: 70 (%)
```

Mata pelajaran yang tersedia: `Umum`, `Matematika`, `Bahasa Indonesia`, `PKn`

---

## 📐 Documentation

Sistem dilengkapi dengan dokumentasi UML lengkap dalam 2 format:

### **Available Diagrams**

- **Activities Diagram** - Alur proses lengkap dari pembuatan ujian hingga pelaporan
- **Use Case Diagram** - Interaksi Admin dan Peserta dengan sistem
- **ERD** - Struktur database dan relasi antar tabel (5 entities)
- **Class Diagram** - Struktur OOP dengan methods dan design patterns

### **Format**

- **Draw.io (.drawio)** - Visual editor, buka di [diagrams.net](https://app.diagrams.net/)
- **PlantUML (.puml)** - Text-based, Git-friendly

📂 Lokasi: `docs/`  
📖 Panduan: Lihat `docs/PlantUML_README.md`

**Quick View PlantUML:**

1. Buka http://www.plantuml.com/plantuml/uml/
2. Copy-paste isi file `.puml`
3. Submit untuk generate diagram

---

## 🗄️ Database Schema

5 main entities dengan Prisma ORM:

| Entity         | Description           | Key Relations                    |
| -------------- | --------------------- | -------------------------------- |
| **User**       | Admin & Peserta data  | → Exam (creator), → ExamResult   |
| **Exam**       | Ujian dengan metadata | ← User, → Question, → ExamResult |
| **Question**   | Soal ujian (A/B/C/D)  | ← Exam, → Answer                 |
| **ExamResult** | Hasil ujian peserta   | ← Exam, ← User, → Answer         |
| **Answer**     | Jawaban per soal      | ← ExamResult, ← Question         |

**Features**: Cascade deletes, Unique constraints, Indexed fields, DateTime tracking

📊 Visualisasi: `docs/ERD_Sistem_CBT.puml` atau `docs/ERD_Sistem_CBT.drawio`

---

## 🎯 Usage Guide

### Import Soal

**Format CSV/Excel:**

```csv
examTitle,examSubject,questionText,optionA,optionB,optionC,optionD,correctAnswer
Matematika,Dasar,2 + 2 = ?,2,3,4,5,C
Matematika,Dasar,5 × 3 = ?,13,15,18,20,B
```

**Flow:**

1. Pilih ujian dari dropdown
2. Download template (pre-filled dengan exam info)
3. Upload file dengan drag & drop
4. Preview dan konfirmasi import

### Scoring System

**Equal Scoring** - Semua soal bernilai sama:

```
Skor = (Jawaban Benar / Total Soal) × 100%

Example:
- Total: 10 soal
- Benar: 8 soal
- Skor: 80%
```

### Mobile Features

- **Railway Navigation**: Horizontal scroll untuk navigasi soal
- **Touch-Optimized**: Minimum 44px touch targets
- **Auto-scroll**: Smart navigation ke soal aktif
- **Responsive Modal**: Adaptif untuk resolusi 1366x768+

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file

## 👥 Development

**Developer**: [AogamiKiryuu](https://github.com/AogamiKiryuu)  
**Instansi**: Satuan Polisi Pamong Praja Kota Bogor  
**Project**: Ujian Kompetensi - Praktik Lapang UNPAK

---

<div align="center">
  <strong>Dibuat untuk memenuhi Ujian Kompetensi - Praktik Lapang UNPAK</strong>
  <br>
  <em>Sistem CBT Modern dengan Mobile-First Approach</em>
  <br>
</div>
