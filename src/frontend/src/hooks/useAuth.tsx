import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import type { IDFusionRole } from "../backend";
import { validateCredentials } from "../utils/credentialUtils";

const SESSION_KEY = "idfusion_session";

interface Session {
  isLoggedIn: boolean;
  role: IDFusionRole | null;
  username: string;
}

interface AuthContextValue extends Session {
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session>({
    isLoggedIn: false,
    role: null,
    username: "",
  });

  // Restore from sessionStorage on mount
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        const stored = JSON.parse(raw) as Session;
        if (stored.isLoggedIn && stored.role) {
          setSession(stored);
        }
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    const role = validateCredentials(username, password);
    if (!role) return false;

    const newSession: Session = { isLoggedIn: true, role, username };
    setSession(newSession);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    return true;
  };

  const logout = () => {
    setSession({ isLoggedIn: false, role: null, username: "" });
    sessionStorage.removeItem(SESSION_KEY);
  };

  return (
    <AuthContext.Provider value={{ ...session, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
