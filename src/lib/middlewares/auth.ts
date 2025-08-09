import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export async function verifyJWT(request: NextRequest): Promise<JWTPayload | null> {
  try {
    // Get token from cookie
    const token = request.cookies.get('authToken')?.value;

    if (!token) {
      return null;
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
        email: decoded.email,
      },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}

export function generateJWT(payload: JWTPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: '7d',
  });
}
