/**
 * Script untuk membuat akun admin
 * Jalankan: npx tsx scripts/create-admin.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  const email = 'admin@cbt.com';
  const password = 'admin#123';
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // Cek apakah admin sudah ada
    const existingAdmin = await prisma.user.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      console.log('⚠️  Admin dengan email ini sudah ada!');
      console.log(`   Email: ${email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      return;
    }

    // Buat akun admin
    const admin = await prisma.user.create({
      data: {
        name: 'Administrator',
        email,
        password: hashedPassword,
        gender: 'LAKI_LAKI',
        birthDate: new Date('1990-01-01'),
        birthPlace: 'Bogor',
        role: 'ADMIN',
      },
    });

    console.log('✅ Akun admin berhasil dibuat!');
    console.log('');
    console.log('📧 Email    : admin@cbt.com');
    console.log('🔑 Password : admin#123');
    console.log('👤 Role     : ADMIN');
    console.log('');
    console.log(`ID: ${admin.id}`);
  } catch (error) {
    console.error('❌ Gagal membuat akun admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
