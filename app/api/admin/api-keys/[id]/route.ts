import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { deactivateApiKey } from '@/app/lib/db';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'admin') {
    return null;
  }
  return session;
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'API key ID is required.' }, { status: 400 });
  }

  try {
    await deactivateApiKey(id);
    return NextResponse.json({ message: 'API key deactivated successfully.' });
  } catch (error: unknown) {
    console.error('Error deactivating API key:', error);
    const message = error instanceof Error ? error.message : 'Failed to deactivate API key.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
