"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface AuthenticatedUser {
  user_id: string;
  email_masked: string;
  phone_masked: string;
  email_verified: boolean;
  phone_verified: boolean;
}

interface AuthContextValue {
  accessToken: string | null;
  user: AuthenticatedUser | null;
  isLoading: boolean;
  setAuthenticatedSession: (token: string, user: AuthenticatedUser) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Stored strictly in React RAM — never persisted in localStorage
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/v1/auth/session", {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        });
        if (!res.ok) {
          if (active) {
            setAccessToken(null);
            setUser(null);
          }
          return;
        }
        const data = await res.json();
        if (active && data?.authenticated && data?.access_token && data?.user) {
          setAccessToken(data.access_token);
          setUser(data.user);
        }
      } catch {
        if (active) {
          setAccessToken(null);
          setUser(null);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const setAuthenticatedSession = useCallback(
    (token: string, verifiedUser: AuthenticatedUser) => {
      setAccessToken(token);
      setUser(verifiedUser);
      setIsLoading(false);
    },
    []
  );

  const signOut = useCallback(async () => {
    setAccessToken(null);
    setUser(null);
    try {
      await fetch("/api/v1/auth/session", {
        method: "DELETE",
        credentials: "same-origin",
      });
    } catch {
      // In-memory token already purged
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken,
      user,
      isLoading,
      setAuthenticatedSession,
      signOut,
    }),
    [accessToken, user, isLoading, setAuthenticatedSession, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
