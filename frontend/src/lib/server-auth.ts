import { cookies } from 'next/headers';
import { getBackendUrl } from './backend';
import { TOKEN_COOKIE } from './constants';
import type { AuthUser } from '@/types/auth';

export async function getCurrentUserOnServer(): Promise<AuthUser | null> {
  const token = (await cookies()).get(TOKEN_COOKIE)?.value;
  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${getBackendUrl()}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.user as AuthUser;
  } catch (error) {
    console.error('Failed to resolve current user', error);
    return null;
  }
}

