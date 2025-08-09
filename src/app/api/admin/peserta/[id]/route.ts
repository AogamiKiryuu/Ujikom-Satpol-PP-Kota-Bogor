import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/middlewares/auth';
import bcrypt from 'bcryptjs';
import { Gender } from '@prisma/client';

// GET - Get single user
export async function GET(request: NextRequest, segmentData: { params: Promise<{ id: string }> }) {
  try {
    const params = await segmentData.params;
    const { id } = params;
    const user = await verifyJWT(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Tidak terotorisasi' }, { status: 401 });
    }

    const peserta = await prisma.user.findUnique({
      where: {
        id,
        role: 'PESERTA',
      },
      select: {
        id: true,
        name: true,
        email: true,
        gender: true,
        birthDate: true,
        birthPlace: true,
        createdAt: true,
        examResults: {
          include: {
            exam: {
              select: {
                id: true,
                title: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!peserta) {
      return NextResponse.json({ error: 'Peserta tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(peserta);
  } catch (error) {
    console.error('Get peserta error:', error);
    return NextResponse.json({ error: 'Kesalahan server internal' }, { status: 500 });
  }
}

// PUT - Update user
export async function PUT(request: NextRequest, segmentData: { params: Promise<{ id: string }> }) {
  try {
    const params = await segmentData.params;
    const { id } = params;
    const user = await verifyJWT(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Tidak terotorisasi' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, gender, birthDate, birthPlace, password } = body;

    // Validate required fields
    if (!name || !email || !gender || !birthDate || !birthPlace) {
      return NextResponse.json(
        {
          error: 'Nama, email, jenis kelamin, tanggal lahir, dan tempat lahir harus diisi',
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Format email tidak valid' }, { status: 400 });
    }

    // Validate gender
    const validGenders: Gender[] = ['LAKI_LAKI', 'PEREMPUAN'];
    if (!validGenders.includes(gender as Gender)) {
      return NextResponse.json({ error: 'Jenis kelamin tidak valid' }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'Peserta tidak ditemukan' }, { status: 404 });
    }

    // Check if email already exists (excluding current user)
    if (email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });
      if (emailExists) {
        return NextResponse.json({ error: 'Email sudah digunakan' }, { status: 400 });
      }
    }

    // Prepare update data
    const updateData: {
      name: string;
      email: string;
      gender: Gender;
      birthDate: Date;
      birthPlace: string;
      password?: string;
    } = {
      name,
      email,
      gender: gender as Gender,
      birthDate: new Date(birthDate),
      birthPlace,
    };

    // Hash password if provided
    if (password && password.trim().length > 0) {
      if (password.length < 6) {
        return NextResponse.json(
          {
            error: 'Password minimal 6 karakter',
          },
          { status: 400 }
        );
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        gender: true,
        birthDate: true,
        birthPlace: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      message: 'Peserta berhasil diperbarui',
      peserta: updatedUser,
    });
  } catch (error) {
    console.error('Update peserta error:', error);
    return NextResponse.json({ error: 'Kesalahan server internal' }, { status: 500 });
  }
}

// DELETE - Delete user
export async function DELETE(request: NextRequest, segmentData: { params: Promise<{ id: string }> }) {
  try {
    const params = await segmentData.params;
    const { id } = params;
    const user = await verifyJWT(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Tidak terotorisasi' }, { status: 401 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: {
        id,
        role: 'PESERTA',
      },
      include: {
        examResults: true,
      },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'Peserta tidak ditemukan' }, { status: 404 });
    }

    // Check if user has exam results
    if (existingUser.examResults.length > 0) {
      return NextResponse.json(
        {
          error: 'Tidak dapat menghapus peserta yang memiliki riwayat ujian',
        },
        { status: 400 }
      );
    }

    // Delete user
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Peserta berhasil dihapus',
    });
  } catch (error) {
    console.error('Delete peserta error:', error);
    return NextResponse.json({ error: 'Kesalahan server internal' }, { status: 500 });
  }
}
