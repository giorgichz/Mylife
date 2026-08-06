import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

export type AuthState = {
  session: Session | null;
  ready: boolean;
  error: string | null;
};

/**
 * Bootstraps a session on app start: reuses a persisted one if present,
 * otherwise signs in anonymously so the app works without a login screen.
 * Requires "Anonymous sign-ins" enabled in Supabase → Authentication → Providers.
 */
export function useAuthSession(): AuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      if (data.session) {
        setSession(data.session);
        setReady(true);
        return;
      }

      const { data: signInData, error: signInError } = await supabase.auth.signInAnonymously();
      if (!mounted) return;
      if (signInError) {
        setError(signInError.message);
      } else {
        setSession(signInData.session);
      }
      setReady(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (mounted) setSession(newSession);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return { session, ready, error };
}
