import { NextResponse } from 'next/server';
import { findById } from '@/lib/propertyService';

interface Context {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: Context) {
  const { id } = await params;
  const property = findById(id);
  if (!property) {
    return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
  }
  return NextResponse.json({ ok: true, property });
}
