import React, { createContext, useContext } from 'react';
import { useAuthSession, AuthState } from './useAuthSession';

const AuthContext = createContext<AuthState>({ session: null, ready: false, error: null });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const state = useAuthSession();
  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

/** Single shared auth session — avoids each screen triggering its own sign-in attempt. */
export function useAuth() {
  return useContext(AuthContext);
}
