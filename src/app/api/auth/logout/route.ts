import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ message: 'Berhasil logout' }, { status: 200 });

    // Clear both cookies
    response.cookies.set({
      name: 'token',
      value: '',
      httpOnly: true,
      path: '/',
      secure: false,
      sameSite: 'lax',
      maxAge: 0, // This will delete the cookie
    });

    response.cookies.set({
      name: 'token_debug',
      value: '',
      httpOnly: false,
      path: '/',
      secure: false,
      sameSite: 'lax',
      maxAge: 0, // This will delete the cookie
    });

    console.log('Logout successful, cookies cleared');
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan saat logout' }, { status: 500 });
  }
}
