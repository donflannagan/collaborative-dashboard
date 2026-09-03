import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);
const SESSION_STORAGE_KEY = 'session';
const DEFAULT_SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes
const configuredTtl = Number(import.meta.env.VITE_SESSION_TTL_MS);
const SESSION_TTL_MS = Number.isFinite(configuredTtl) && configuredTtl > 0 ? configuredTtl : DEFAULT_SESSION_TTL_MS;

function readSession() {
  const raw = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) return null;

  try {
    const session = JSON.parse(raw);
    if (session.expiresAt <= Date.now()) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
    return session;
  } catch {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }) {
  // read any existing, non-expired session synchronously so a page refresh doesn't log the user out
  const [session, setSession] = useState(readSession);
  const userId = session?.userId ?? null;

  const login = (id) => {
    const newSession = { userId: id, expiresAt: Date.now() + SESSION_TTL_MS };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession));
    setSession(newSession);
  };

  const logout = () => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setSession(null);
  };

  // auto-logout once the session's TTL elapses while the app is open
  useEffect(() => {
    if (!session) return;

    const msUntilExpiry = session.expiresAt - Date.now();
    const timer = setTimeout(logout, msUntilExpiry);
    return () => clearTimeout(timer);
  }, [session]);

  return (
    <AuthContext.Provider value={{ userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}