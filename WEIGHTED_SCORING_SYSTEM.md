# 🧮 Sistem Penilaian Berbobot (Weighted Scoring System)

## 📊 Overview

Sistem CBT ini sekarang mendukung penilaian berbobot, di mana setiap soal dapat memiliki nilai poin yang berbeda-beda berdasarkan tingkat kesulitan atau kepentingan materi.

## 🎯 Cara Kerja Sistem Penilaian

### 1. **Bobot Soal (Question Points)**
Setiap soal memiliki field `points` yang menentukan bobotnya:
- **Soal Mudah**: 1-2 poin
- **Soal Sedang**: 3-4 poin  
- **Soal Sulit**: 5+ poin

### 2. **Formula Perhitungan**

```
Skor Akhir = (Total Poin Diperoleh / Total Poin Maksimal) × 100%

Contoh:
- Soal 1: Benar (3 poin) → +3 poin
- Soal 2: Salah (5 poin) → +0 poin
- Soal 3: Benar (2 poin) → +2 poin
- Soal 4: Benar (1 poin) → +1 poin

Total Poin Diperoleh: 3 + 0 + 2 + 1 = 6 poin
Total Poin Maksimal: 3 + 5 + 2 + 1 = 11 poin
Skor = (6/11) × 100% = 54.5% ≈ 55%
```

### 3. **Implementasi Database**

#### Schema Question:
```sql
CREATE TABLE Question (
  id VARCHAR PRIMARY KEY,
  examId VARCHAR,
  questionText TEXT,
  optionA VARCHAR,
  optionB VARCHAR,
  optionC VARCHAR,
  optionD VARCHAR,
  correctAnswer VARCHAR,
  points INTEGER DEFAULT 1,  -- Bobot soal
  ...
);
```

#### Schema ExamResult:
```sql
CREATE TABLE ExamResult (
  id VARCHAR PRIMARY KEY,
  userId VARCHAR,
  examId VARCHAR,
  score INTEGER,              -- Skor persentase (0-100)
  totalQuestions INTEGER,
  correctAnswers INTEGER,
  totalEarnedPoints INTEGER,  -- Total poin yang diperoleh
  totalPossiblePoints INTEGER, -- Total poin maksimal
  ...
);
```

## 🔧 Implementasi Code

### 1. **API Submit Ujian** (`/api/peserta/exam/[id]/submit`)

```typescript
// Calculate score with weighted points
let correctAnswers = 0;
let totalEarnedPoints = 0;
let totalPossiblePoints = 0;

// Calculate total possible points
for (const question of examResult.exam.questions) {
  totalPossiblePoints += question.points;
}

// Calculate earned points
for (const answer of examResult.answers) {
  const isCorrect = answer.selectedAnswer === answer.question.correctAnswer;
  if (isCorrect) {
    correctAnswers++;
    totalEarnedPoints += answer.question.points; // Add weighted points
  }
}

// Calculate weighted score as percentage
const score = totalPossiblePoints > 0 
  ? Math.round((totalEarnedPoints / totalPossiblePoints) * 100) 
  : 0;
```

### 2. **Template Import Excel**

Format file import dengan kolom `points`:

| examTitle | examSubject | questionText | optionA | optionB | optionC | optionD | correctAnswer | points |
|-----------|-------------|--------------|---------|---------|---------|---------|---------------|--------|
| Ujian Matematika | Matematika | 2 + 2 = ? | 3 | 4 | 5 | 6 | B | 1 |
| Ujian Matematika | Matematika | Integral dari x² dx = ? | x³ + C | x³/3 + C | 2x + C | x + C | B | 5 |

## 📈 Keuntungan Sistem Berbobot

### ✅ **Fleksibilitas Penilaian**
- Soal sulit diberi bobot lebih tinggi
- Materi penting dapat diprioritaskan
- Penilaian lebih proporsional

### ✅ **Diferensiasi Kemampuan**
- Peserta yang menguasai soal sulit mendapat nilai lebih tinggi
- Sistem lebih adil untuk mengukur pemahaman mendalam

### ✅ **Transparansi**
- Peserta dapat melihat bobot setiap soal
- Total poin diperoleh vs maksimal ditampilkan jelas

## 🎨 UI/UX Features

### 1. **Halaman Hasil Ujian**
- **Skor Persentase**: Tampilan utama hasil akhir
- **Poin Diperoleh**: Total poin yang berhasil dikumpulkan
- **Total Poin**: Maksimal poin yang bisa diperoleh
- **Detail per Soal**: Menampilkan bobot setiap soal

### 2. **Import Soal**
- Template Excel dengan kolom `points`
- Petunjuk penggunaan bobot soal
- Preview dengan informasi bobot sebelum import

## 📋 Contoh Kasus Penggunaan

### **Ujian Matematika (20 Soal)**
```
Kategori Mudah (10 soal × 1 poin) = 10 poin
Kategori Sedang (7 soal × 3 poin) = 21 poin  
Kategori Sulit (3 soal × 5 poin) = 15 poin
Total Maksimal = 46 poin

Peserta A:
- Mudah: 8/10 benar = 8 poin
- Sedang: 5/7 benar = 15 poin
- Sulit: 2/3 benar = 10 poin
Total = 33 poin
Skor = (33/46) × 100% = 72%

Peserta B:
- Mudah: 10/10 benar = 10 poin
- Sedang: 4/7 benar = 12 poin
- Sulit: 1/3 benar = 5 poin
Total = 27 poin
Skor = (27/46) × 100% = 59%
```

## 🚀 Migration dan Deployment

### 1. **Database Migration**
```bash
npx prisma migrate dev --name add-weighted-scoring
```

### 2. **Backward Compatibility**
- Field `points` memiliki default value 1
- Data lama tetap kompatibel
- Perhitungan otomatis menggunakan bobot baru

## 📚 API Documentation

### Submit Exam Response:
```json
{
  "message": "Ujian berhasil diselesaikan",
  "score": 75,
  "correctAnswers": 15,
  "totalQuestions": 20,
  "totalEarnedPoints": 38,
  "totalPossiblePoints": 51,
  "passingScore": 70,
  "passed": true
}
```

### Exam Result Response:
```json
{
  "result": {
    "score": 75,
    "totalEarnedPoints": 38,
    "totalPossiblePoints": 51,
    "correctAnswers": 15,
    "wrongAnswers": 5
  },
  "questions": [
    {
      "number": 1,
      "question": {
        "points": 2,
        "questionText": "..."
      },
      "isCorrect": true
    }
  ]
}
```

---

**Sistem ini memberikan fleksibilitas penuh dalam penilaian sambil tetap mempertahankan kesederhanaan dan transparansi untuk peserta ujian.**
