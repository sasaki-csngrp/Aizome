import { NextResponse } from 'next/server';
import { getTrendsPaginated } from '@/app/lib/services';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit  = Math.min(Math.max(parseInt(searchParams.get('limit')  ?? '9'), 1), 50);
    const offset = Math.max(parseInt(searchParams.get('offset') ?? '0'), 0);

    const { rows, total } = await getTrendsPaginated(limit, offset);

    return NextResponse.json({
      items: rows,
      total,
      hasMore: offset + rows.length < total,
    });
  } catch (error: unknown) {
    let errorMessage = 'Failed to fetch trends.';
    if (error instanceof Error) errorMessage = error.message;
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
