export type SessionUser = {
  id: number;
  userName: string;
  roleId: number;
};

export type SessionData = {
  token: string;
  user: SessionUser;
};

const SESSION_STORAGE_KEY = "mades.auth.session";

export function getSession(): SessionData | null {
  const rawSession = localStorage.getItem(SESSION_STORAGE_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawSession) as SessionData;

    if (!parsed?.token || !parsed?.user) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function saveSession(session: SessionData): void {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

export function getAuthHeaders(): Record<string, string> {
  const session = getSession();

  if (!session?.token) {
    return {};
  }

  return {
    Authorization: `Bearer ${session.token}`,
  };
}
