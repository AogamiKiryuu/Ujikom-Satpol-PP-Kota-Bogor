import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { LoginSchema } from '@/lib/schemas/loginSchema';

export const runtime = 'nodejs'; // wajib untuk bcrypt

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = LoginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user || !(await bcrypt.compare(validatedData.password, user.password))) {
      return NextResponse.json({ message: 'Email atau password salah' }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const token = await new SignJWT({
      id: user.id,
      email: user.email,
      role: user.role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret);

    const response = NextResponse.json({ 
      message: 'Berhasil masuk', 
      role: user.role,
      token: token, // Include token in response for localStorage fallback
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }, { status: 200 });

    // Try multiple cookie setting approaches
    response.cookies.set('token', token, {
      httpOnly: true,
      path: '/',
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    });

    // Also set a non-httpOnly version for client-side access (temporary for debugging)
    response.cookies.set('token_debug', token, {
      httpOnly: false,
      path: '/',
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    });

    console.log('Cookie set with token:', token.substring(0, 20) + '...');
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan saat login' }, { status: 500 });
  }
}
