import { useEffect, useRef } from 'react';
import { useAuth } from './AuthProvider';
import { useLifeStore } from '../store/useLifeStore';
import * as sync from './sync';

/**
 * Runs once per session: normalizes any legacy non-uuid ids, then either
 * adopts what's already in the cloud (returning user / other device) or —
 * if the account is brand new — seeds the cloud from whatever's on this
 * device already (so nothing typed before the connection was ready is lost).
 */
export function useCloudSync() {
  const { session, ready } = useAuth();
  const didSync = useRef(false);

  useEffect(() => {
    if (!ready || !session?.user?.id || didSync.current) return;
    didSync.current = true;

    const userId = session.user.id;
    const store = useLifeStore.getState();

    store.normalizeLegacyIds();
    store.setUserId(userId);

    (async () => {
      const [goals, tasks, applications, moodLogs, profile] = await Promise.all([
        sync.pullGoals(userId),
        sync.pullTasks(userId),
        sync.pullApplications(userId),
        sync.pullMoodLogs(userId),
        sync.pullProfile(userId),
      ]);

      const remoteIsEmpty =
        goals.length === 0 && tasks.length === 0 && applications.length === 0 && moodLogs.length === 0 && !profile;

      if (remoteIsEmpty) {
        // First time this account has synced — push what's already on this device.
        const local = useLifeStore.getState();
        await Promise.all([
          sync.pushProfile(userId, local.user.firstName),
          ...local.goals.map((g) => sync.pushGoal(userId, g)),
          ...local.tasks.map((t) => sync.pushTask(userId, t)),
          ...local.applications.map((a) => sync.pushApplication(userId, a)),
          ...local.moodLogs.map((m) => sync.pushMoodLog(userId, m)),
        ]);
      } else {
        useLifeStore.getState().hydrateFromRemote({
          goals,
          tasks,
          applications,
          moodLogs,
          firstName: profile?.firstName,
        });
      }
    })().catch((error) => console.warn('[sync] initial sync failed:', error));
  }, [ready, session?.user?.id]);
}
