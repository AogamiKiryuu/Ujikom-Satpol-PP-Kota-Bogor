import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);

    return NextResponse.json({ 
      authenticated: true, 
      user: payload 
    }, { status: 200 });
  } catch (error) {
    console.error('Token verification failed:', error);
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
