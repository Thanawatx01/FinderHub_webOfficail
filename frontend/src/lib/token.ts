'use client';

import Cookies from 'js-cookie';
import { TOKEN_COOKIE } from './constants';

const DEFAULT_EXPIRES_IN_DAYS = 0.5; // 12 hours

export function setAuthToken(token: string, expiresInDays = DEFAULT_EXPIRES_IN_DAYS) {
  Cookies.set(TOKEN_COOKIE, token, {
    expires: expiresInDays,
    sameSite: 'lax',
    secure: typeof window !== 'undefined' && window.location.protocol === 'https:',
  });
}

export function clearAuthToken() {
  Cookies.remove(TOKEN_COOKIE);
}

export function getAuthToken() {
  return Cookies.get(TOKEN_COOKIE);
}

