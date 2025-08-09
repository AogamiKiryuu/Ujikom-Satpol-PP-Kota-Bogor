import { NextRequest } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';
import { prisma } from '@/lib/prisma';

interface JWTPayload {
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
  [key: string]: unknown;
}

export async function verifyJWT(request: NextRequest): Promise<JWTPayload | null> {
  try {
    // Get token from cookie - same as middleware
    const token = request.cookies.get('token')?.value || request.cookies.get('token_debug')?.value;

    if (!token) {
      console.log('verifyJWT - No token found');
      return null;
    }

    // Verify token using jose (same as middleware)
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);

    console.log('verifyJWT - Token verified, payload:', payload);

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: {
        id: payload.id as string,
        email: payload.email as string,
      },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
      },
    });

    if (!user) {
      console.log('verifyJWT - User not found in database');
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}

export async function generateJWT(payload: JWTPayload): Promise<string> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
  return await new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('7d').sign(secret);
}
