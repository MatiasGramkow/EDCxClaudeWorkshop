import { NextResponse } from 'next/server';
import { getUser } from '@/lib/userService';
import { findById } from '@/lib/propertyService';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const email = url.searchParams.get('email') ?? '';

  try {
    const user = getUser(email);
    const favoriteIds = user?.favorites ?? [];
    const favorites = favoriteIds
      .map((id) => findById(id))
      .filter((p) => p !== null);
    return NextResponse.json({
      ok: true,
      user: user ? { name: user.name, email: user.email } : null,
      count: favorites.length,
      favorites
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: 'invalid_email',
        message: err instanceof Error ? err.message : 'invalid email'
      },
      { status: 400 }
    );
  }
}
