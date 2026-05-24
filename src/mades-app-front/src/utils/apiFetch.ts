import { clearSession, getAuthHeaders } from './auth';

export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers: Record<string, string> = {
    ...getAuthHeaders(),
    ...(options.headers as Record<string, string> ?? {}),
  };

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    clearSession();
    window.location.href = '/';
    throw new Error('Session expired');
  }

  return res;
}
