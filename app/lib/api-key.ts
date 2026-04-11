import { createHash, randomBytes } from 'crypto';
import { ApiKey } from './models';
import { getApiKeyByHash, updateApiKeyLastUsed, initApiKeysTable } from './db';

const KEY_PREFIX = 'aizome_';

export function generateApiKey(): { key: string; hash: string } {
  const raw = randomBytes(32).toString('hex');
  const key = `${KEY_PREFIX}${raw}`;
  const hash = hashApiKey(key);
  return { key, hash };
}

export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

export async function validateApiKey(key: string): Promise<ApiKey | null> {
  if (!key || !key.startsWith(KEY_PREFIX)) {
    return null;
  }

  await initApiKeysTable();

  const hash = hashApiKey(key);
  const apiKey = await getApiKeyByHash(hash);

  if (apiKey) {
    updateApiKeyLastUsed(apiKey.id).catch(() => {});
  }

  return apiKey;
}
