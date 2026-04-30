import { NextResponse } from 'next/server';
import { registerUser, getUser } from '@/lib/userService';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.email !== 'string' || typeof body.name !== 'string') {
    return NextResponse.json({ ok: false, error: 'invalid_body' }, { status: 400 });
  }
  const user = registerUser(body.email, body.name);
  return NextResponse.json({ ok: true, user });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const email = url.searchParams.get('email') ?? '';
  const user = getUser(email);
  if (!user) {
    return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
  }
  return NextResponse.json({ ok: true, user });
}
