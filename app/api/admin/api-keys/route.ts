import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { generateApiKey } from '@/app/lib/api-key';
import { insertApiKey, getApiKeysFromDb, initApiKeysTable } from '@/app/lib/db';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'admin') {
    return null;
  }
  return session;
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { name } = body as { name?: unknown };
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return NextResponse.json({ error: 'name is required.' }, { status: 400 });
  }

  try {
    await initApiKeysTable();
    const { key, hash } = generateApiKey();
    const apiKey = await insertApiKey(name.trim(), hash, session.user.id);

    return NextResponse.json(
      {
        id: apiKey.id,
        name: apiKey.name,
        key,
        created_by: apiKey.created_by,
        created_at: apiKey.created_at,
        is_active: apiKey.is_active,
        note: 'Store this key securely. It will not be shown again.',
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error creating API key:', error);
    const message = error instanceof Error ? error.message : 'Failed to create API key.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
  }

  try {
    await initApiKeysTable();
    const apiKeys = await getApiKeysFromDb();

    const safeKeys = apiKeys.map(({ key_hash: _, ...rest }) => rest);

    return NextResponse.json({ items: safeKeys });
  } catch (error: unknown) {
    console.error('Error fetching API keys:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch API keys.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
