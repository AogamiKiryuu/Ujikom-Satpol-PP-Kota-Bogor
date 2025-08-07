import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = body;
    
    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);

    const redirectPath = payload.role === 'ADMIN' ? '/admin/dashboard' : '/peserta/dashboard';

    // Set cookie here with proper headers
    const response = NextResponse.json({ 
      redirectPath,
      user: payload 
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      path: '/',
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    });

    return response;
  } catch (error) {
    console.error('Redirect token verification failed:', error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
