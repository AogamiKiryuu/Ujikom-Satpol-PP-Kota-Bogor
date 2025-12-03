/**
 * Script untuk reset password user
 * Jalankan: npx tsx scripts/reset-password.ts <email> <new_password>
 * 
 * Contoh:
 *   npx tsx scripts/reset-password.ts admin@cbt.com newpassword123
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetPassword() {
  const args = process.argv.slice(2);
  const email = args[0];
  const newPassword = args[1];

  console.log('🔐 Reset Password Script\n');

  if (!email || !newPassword) {
    console.log('Penggunaan: npx tsx scripts/reset-password.ts <email> <new_password>\n');
    console.log('Contoh:');
    console.log('   npx tsx scripts/reset-password.ts admin@cbt.com newpass123');
    console.log('   npx tsx scripts/reset-password.ts user@test.com password');
    await prisma.$disconnect();
    return;
  }

  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, role: true }
    });

    if (!user) {
      console.log(`❌ User dengan email "${email}" tidak ditemukan`);
      return;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    console.log('✅ Password berhasil direset!\n');
    console.log('📋 Detail:');
    console.log(`   Nama     : ${user.name}`);
    console.log(`   Email    : ${user.email}`);
    console.log(`   Role     : ${user.role}`);
    console.log(`   Password : ${newPassword}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
