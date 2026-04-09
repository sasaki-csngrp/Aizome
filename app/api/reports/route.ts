import { NextResponse } from 'next/server';
import { createReport, getReportsPaginated } from '@/app/lib/services';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit  = Math.min(Math.max(parseInt(searchParams.get('limit')  ?? '9'), 1), 50);
    const offset = Math.max(parseInt(searchParams.get('offset') ?? '0'), 0);

    const { rows, total } = await getReportsPaginated(limit, offset);

    return NextResponse.json({
      items: rows,
      total,
      hasMore: offset + rows.length < total,
    });
  } catch (error: unknown) {
    let errorMessage = 'Failed to fetch reports.';
    if (error instanceof Error) errorMessage = error.message;
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { title, content, type } = await request.json();

    if (!title || !content || !type) {
      return NextResponse.json({ error: 'Title, content, and type are required.' }, { status: 400 });
    }

    const report = await createReport(title, content, type);
    return NextResponse.json(report, { status: 201 }); // 201 Created
  } catch (error: unknown) {
    console.error('Error creating report:', error);
    let errorMessage = 'Failed to create report.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
