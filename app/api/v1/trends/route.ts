import { NextResponse } from 'next/server';
import { validateApiKey } from '@/app/lib/api-key';
import { insertReport } from '@/app/lib/db';

export async function POST(request: Request) {
  const apiKeyHeader = request.headers.get('x-api-key');

  if (!apiKeyHeader) {
    return NextResponse.json({ error: 'Missing X-API-Key header.' }, { status: 401 });
  }

  const apiKey = await validateApiKey(apiKeyHeader);
  if (!apiKey) {
    return NextResponse.json({ error: 'Invalid or inactive API key.' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { title, content } = body as { title?: unknown; content?: unknown };

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return NextResponse.json({ error: 'title is required.' }, { status: 400 });
  }
  if (!content || typeof content !== 'string' || content.trim() === '') {
    return NextResponse.json({ error: 'content is required.' }, { status: 400 });
  }

  if (!apiKey.created_by) {
    return NextResponse.json(
      { error: 'This API key has no associated author. Please re-issue with a valid admin account.' },
      { status: 500 }
    );
  }

  try {
    const trend = await insertReport({
      author_id: apiKey.created_by,
      title: title.trim(),
      content: content.trim(),
      type: 'trend',
    });

    return NextResponse.json(
      {
        id: trend.id,
        title: trend.title,
        content: trend.content,
        createdAt: trend.createdAt,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error creating trend via API:', error);
    const message = error instanceof Error ? error.message : 'Failed to create trend.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
