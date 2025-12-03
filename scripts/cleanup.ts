/**
 * Script untuk membersihkan data test/simulasi
 * Jalankan: npx tsx scripts/cleanup.ts [opsi]
 * 
 * Opsi:
 *   --test-users    : Hapus user dengan email @test.com atau @peserta.cbt.com
 *   --simulation    : Hapus ujian simulasi/stress test
 *   --all-results   : Hapus semua hasil ujian (HATI-HATI!)
 *   --dry-run       : Preview tanpa menghapus
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanup() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const cleanTestUsers = args.includes('--test-users');
  const cleanSimulation = args.includes('--simulation');
  const cleanAllResults = args.includes('--all-results');

  console.log('🧹 Cleanup Script\n');
  
  if (dryRun) {
    console.log('⚠️  DRY RUN MODE - Tidak ada data yang akan dihapus\n');
  }

  if (!cleanTestUsers && !cleanSimulation && !cleanAllResults) {
    console.log('Opsi yang tersedia:');
    console.log('  --test-users    : Hapus user dengan email @test.com atau @peserta.cbt.com');
    console.log('  --simulation    : Hapus ujian simulasi/stress test');
    console.log('  --all-results   : Hapus semua hasil ujian');
    console.log('  --dry-run       : Preview tanpa menghapus\n');
    console.log('Contoh: npx tsx scripts/cleanup.ts --test-users --dry-run');
    await prisma.$disconnect();
    return;
  }

  try {
    // Clean test users
    if (cleanTestUsers) {
      const testUsers = await prisma.user.findMany({
        where: {
          OR: [
            { email: { contains: '@test.com' } },
            { email: { contains: '@peserta.cbt.com' } },
            { email: { contains: 'stresstest' } },
          ]
        },
        select: { id: true, email: true }
      });

      console.log(`📧 Test Users: ${testUsers.length} ditemukan`);
      
      if (testUsers.length > 0 && !dryRun) {
        const result = await prisma.user.deleteMany({
          where: {
            id: { in: testUsers.map(u => u.id) }
          }
        });
        console.log(`   ✅ ${result.count} user dihapus`);
      } else if (dryRun && testUsers.length > 0) {
        console.log('   Preview:', testUsers.slice(0, 5).map(u => u.email).join(', '));
        if (testUsers.length > 5) console.log(`   ... dan ${testUsers.length - 5} lainnya`);
      }
    }

    // Clean simulation exams
    if (cleanSimulation) {
      const simExams = await prisma.exam.findMany({
        where: {
          OR: [
            { title: { contains: 'Simulasi' } },
            { title: { contains: 'Stress Test' } },
            { title: { contains: 'Performance' } },
            { subject: { contains: 'Testing' } },
          ]
        },
        select: { id: true, title: true }
      });

      console.log(`📝 Simulation Exams: ${simExams.length} ditemukan`);
      
      if (simExams.length > 0 && !dryRun) {
        const result = await prisma.exam.deleteMany({
          where: {
            id: { in: simExams.map(e => e.id) }
          }
        });
        console.log(`   ✅ ${result.count} ujian dihapus`);
      } else if (dryRun && simExams.length > 0) {
        simExams.forEach(e => console.log(`   - ${e.title}`));
      }
    }

    // Clean all results
    if (cleanAllResults) {
      const resultCount = await prisma.examResult.count();
      
      console.log(`📊 Exam Results: ${resultCount} ditemukan`);
      
      if (resultCount > 0 && !dryRun) {
        // Delete answers first (cascade might handle this but being explicit)
        await prisma.answer.deleteMany({});
        const result = await prisma.examResult.deleteMany({});
        console.log(`   ✅ ${result.count} hasil ujian dihapus`);
      }
    }

    console.log('\n✅ Cleanup selesai!');
    
    if (dryRun) {
      console.log('\n💡 Jalankan tanpa --dry-run untuk menghapus data');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();
