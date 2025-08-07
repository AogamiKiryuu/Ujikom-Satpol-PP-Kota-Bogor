import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        {
          error: 'No token found',
          cookies: req.cookies.getAll(),
        },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    return NextResponse.json({
      message: 'Token is valid',
      decoded,
      token: token.substring(0, 20) + '...', // Show only part of token for security
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Token verification failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 401 }
    );
  }
}
