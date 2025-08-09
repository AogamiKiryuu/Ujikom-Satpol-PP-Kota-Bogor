import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/middlewares/auth';
import bcrypt from 'bcryptjs';

// GET - Get all peserta with pagination and search
export async function GET(request: NextRequest) {
  try {
    const user = await verifyJWT(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;

    const where = {
      role: 'PESERTA' as const,
      ...(search && {
        OR: [{ name: { contains: search, mode: 'insensitive' as const } }, { email: { contains: search, mode: 'insensitive' as const } }],
      }),
    };

    const [peserta, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          gender: true,
          birthDate: true,
          birthPlace: true,
          createdAt: true,
          _count: {
            select: {
              examResults: {
                where: { isCompleted: true },
              },
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      data: peserta,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get peserta error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new peserta
export async function POST(request: NextRequest) {
  try {
    const user = await verifyJWT(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, password, gender, birthDate, birthPlace } = body;

    // Validate required fields
    if (!name || !email || !password || !gender || !birthDate || !birthPlace) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new peserta
    const newPeserta = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        gender,
        birthDate: new Date(birthDate),
        birthPlace,
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
      },
    });

    return NextResponse.json(newPeserta, { status: 201 });
  } catch (error) {
    console.error('Create peserta error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
