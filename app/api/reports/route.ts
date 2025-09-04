import { NextResponse } from 'next/server';
import { createReport } from '@/app/lib/services';

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
