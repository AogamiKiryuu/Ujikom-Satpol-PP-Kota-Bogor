import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ message: 'Berhasil logout' }, { status: 200 });

    // Clear the token cookie
    response.cookies.set({
      name: 'token',
      value: '',
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0, // This will delete the cookie
    });

    return response;
  } catch {
    return NextResponse.json({ message: 'Terjadi kesalahan saat logout' }, { status: 500 });
  }
}
