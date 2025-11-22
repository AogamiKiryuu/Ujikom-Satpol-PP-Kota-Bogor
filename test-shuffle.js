// Test file untuk verifikasi fungsi shuffle
// Run dengan: node test-shuffle.js

// Fungsi untuk shuffle array (Fisher-Yates shuffle) - copied from route.ts
function shuffleArray(array, seed) {
  const arr = [...array];

  // Jika ada seed, gunakan untuk consistent shuffle per user
  let rngValue = 0;
  if (seed) {
    for (let i = 0; i < seed.length; i++) {
      rngValue = (rngValue << 5) - rngValue + seed.charCodeAt(i);
      rngValue = rngValue & rngValue; // Convert to 32-bit integer
    }
  }

  for (let i = arr.length - 1; i > 0; i--) {
    let random;
    if (seed) {
      // Ensure random value is always between 0 and 1 (positive)
      const sinValue = Math.sin(rngValue + i) * 10000;
      random = Math.abs(sinValue % 1);
    } else {
      random = Math.random();
    }
    const j = Math.floor(random * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Test data
const questions = [
  { id: '1', text: 'Soal 1' },
  { id: '2', text: 'Soal 2' },
  { id: '3', text: 'Soal 3' },
  { id: '4', text: 'Soal 4' },
  { id: '5', text: 'Soal 5' },
  { id: '6', text: 'Soal 6' },
  { id: '7', text: 'Soal 7' },
  { id: '8', text: 'Soal 8' },
  { id: '9', text: 'Soal 9' },
  { id: '10', text: 'Soal 10' },
];

console.log('=== TEST SHUFFLE FUNCTION ===\n');

console.log('Original order:', questions.map((q) => q.id).join(', '));
console.log('');

// Test 1: Shuffle tanpa seed (random setiap kali)
console.log('TEST 1: Shuffle tanpa seed (random)');
const shuffled1a = shuffleArray(questions);
const shuffled1b = shuffleArray(questions);
console.log('Run 1:', shuffled1a.map((q) => q.id).join(', '));
console.log('Run 2:', shuffled1b.map((q) => q.id).join(', '));
console.log('Hasil berbeda?', JSON.stringify(shuffled1a) !== JSON.stringify(shuffled1b) ? '✓ YES (expected)' : '✗ NO (unexpected)');
console.log('');

// Test 2: Shuffle dengan seed (konsisten untuk seed yang sama)
console.log('TEST 2: Shuffle dengan seed (konsisten)');
const seed1 = 'user1-exam1';
const shuffled2a = shuffleArray(questions, seed1);
const shuffled2b = shuffleArray(questions, seed1);
console.log('User1-Exam1 Run 1:', shuffled2a.map((q) => q.id).join(', '));
console.log('User1-Exam1 Run 2:', shuffled2b.map((q) => q.id).join(', '));
console.log('Hasil sama?', JSON.stringify(shuffled2a) === JSON.stringify(shuffled2b) ? '✓ YES (expected)' : '✗ NO (unexpected)');
console.log('');

// Test 3: Seed berbeda menghasilkan urutan berbeda
console.log('TEST 3: Seed berbeda = urutan berbeda');
const seed2 = 'user2-exam1';
const shuffled3a = shuffleArray(questions, seed1);
const shuffled3b = shuffleArray(questions, seed2);
console.log('User1-Exam1:', shuffled3a.map((q) => q.id).join(', '));
console.log('User2-Exam1:', shuffled3b.map((q) => q.id).join(', '));
console.log('Hasil berbeda?', JSON.stringify(shuffled3a) !== JSON.stringify(shuffled3b) ? '✓ YES (expected)' : '✗ NO (unexpected)');
console.log('');

// Test 4: Semua elemen masih ada (tidak hilang/duplikat)
console.log('TEST 4: Semua elemen masih ada');
const shuffled4 = shuffleArray(questions, 'test-seed');
const originalIds = questions.map((q) => q.id).sort();
const shuffledIds = shuffled4.map((q) => q.id).sort();
console.log('Original count:', originalIds.length);
console.log('Shuffled count:', shuffledIds.length);
console.log('All elements preserved?', JSON.stringify(originalIds) === JSON.stringify(shuffledIds) ? '✓ YES (expected)' : '✗ NO (unexpected)');
console.log('');

// Test 5: Urutan benar-benar berubah (tidak sama dengan original)
console.log('TEST 5: Urutan benar-benar berubah');
const shuffled5 = shuffleArray(questions, 'another-seed');
const originalOrder = questions.map((q) => q.id).join(',');
const shuffledOrder = shuffled5.map((q) => q.id).join(',');
console.log('Different from original?', originalOrder !== shuffledOrder ? '✓ YES (expected)' : '✗ NO (unexpected)');
console.log('');

console.log('=== TEST COMPLETE ===');
