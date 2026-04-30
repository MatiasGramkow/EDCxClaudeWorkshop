import { NextResponse } from 'next/server';
import { getAll } from '@/lib/propertyService';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get('q') ?? undefined;
  const items = getAll(query);
  return NextResponse.json({ ok: true, count: items.length, items });
}
