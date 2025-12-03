/**
 * Script untuk menambahkan peserta baru secara massal
 * Jalankan: npx tsx scripts/seed-peserta.ts [jumlah] [password]
 * 
 * Contoh:
 *   npx tsx scripts/seed-peserta.ts 50 password123
 *   npx tsx scripts/seed-peserta.ts 100 (default password: 'password')
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const NAMA_DEPAN = [
  'Ahmad', 'Muhammad', 'Budi', 'Andi', 'Dewi', 'Siti', 'Rina', 'Agus', 'Dian', 'Eko',
  'Fitri', 'Galih', 'Hendra', 'Indah', 'Joko', 'Kartika', 'Lukman', 'Maya', 'Nur', 'Oki',
  'Putri', 'Rudi', 'Sri', 'Tono', 'Udin', 'Vina', 'Wawan', 'Yanti', 'Zaki', 'Bambang',
  'Citra', 'Dimas', 'Erna', 'Fajar', 'Gilang', 'Hesti', 'Irwan', 'Jihan', 'Kurnia', 'Lisa'
];

const NAMA_BELAKANG = [
  'Pratama', 'Wijaya', 'Kusuma', 'Sari', 'Putra', 'Putri', 'Santoso', 'Wibowo', 'Hidayat',
  'Rahman', 'Syahputra', 'Permana', 'Saputra', 'Lestari', 'Suryani', 'Purnama', 'Ramadhan',
  'Nugraha', 'Febrianti', 'Setiawan', 'Hartono', 'Susanto', 'Gunawan', 'Surya', 'Maulana'
];

const TEMPAT_LAHIR = [
  'Bogor', 'Jakarta', 'Bandung', 'Depok', 'Bekasi', 'Tangerang', 'Sukabumi', 'Cirebon',
  'Surabaya', 'Semarang', 'Yogyakarta', 'Malang', 'Solo', 'Medan', 'Palembang', 'Makassar'
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomDate(startYear: number, endYear: number): Date {
  const start = new Date(startYear, 0, 1);
  const end = new Date(endYear, 11, 31);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function seedPeserta() {
  const args = process.argv.slice(2);
  const jumlah = parseInt(args[0]) || 50;
  const password = args[1] || 'password';
  
  console.log('🚀 Seed Peserta Script\n');
  console.log(`📊 Konfigurasi:`);
  console.log(`   - Jumlah peserta: ${jumlah}`);
  console.log(`   - Password: ${password}\n`);

  const hashedPassword = await bcrypt.hash(password, 10);
  const timestamp = Date.now();

  try {
    const pesertaData = Array.from({ length: jumlah }, (_, i) => {
      const namaDepan = randomItem(NAMA_DEPAN);
      const namaBelakang = randomItem(NAMA_BELAKANG);
      const nama = `${namaDepan} ${namaBelakang}`;
      const email = `${namaDepan.toLowerCase()}.${namaBelakang.toLowerCase()}${i + 1}_${timestamp}@peserta.cbt.com`;
      
      return {
        name: nama,
        email,
        password: hashedPassword,
        gender: Math.random() > 0.5 ? 'LAKI_LAKI' as const : 'PEREMPUAN' as const,
        birthDate: generateRandomDate(1985, 2005),
        birthPlace: randomItem(TEMPAT_LAHIR),
        role: 'PESERTA' as const,
      };
    });

    const result = await prisma.user.createMany({
      data: pesertaData,
    });

    console.log(`✅ Berhasil membuat ${result.count} peserta!\n`);
    console.log('📋 Contoh akun yang dibuat:');
    
    // Tampilkan 5 contoh akun
    for (let i = 0; i < Math.min(5, pesertaData.length); i++) {
      console.log(`   ${i + 1}. ${pesertaData[i].email}`);
    }
    
    if (pesertaData.length > 5) {
      console.log(`   ... dan ${pesertaData.length - 5} lainnya`);
    }
    
    console.log(`\n🔑 Semua akun menggunakan password: ${password}`);

  } catch (error) {
    console.error('❌ Gagal membuat peserta:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedPeserta();
