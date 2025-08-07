import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  role: string;
  [key: string]: unknown;
}

export function verifyAdmin(req: NextRequest) {
  const token = req.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    if (decoded.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/login', req.url));
  }
}
