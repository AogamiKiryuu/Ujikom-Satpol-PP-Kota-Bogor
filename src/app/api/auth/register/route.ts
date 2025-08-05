/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { registerSchema } from '@/lib/schemas/registerSchema';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: parsed.email },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'Email sudah digunakan' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(parsed.password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: parsed.name,
        email: parsed.email,
        password: hashedPassword,
        gender: parsed.gender,
        birthPlace: parsed.birthPlace,
        birthDate: new Date(parsed.birthDate),
      },
    });

    return NextResponse.json({ message: 'Registrasi berhasil', user: newUser }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
