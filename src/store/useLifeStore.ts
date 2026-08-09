import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  mockAccounts,
  mockAiMessages,
  mockApplications,
  mockAppointments,
  mockBudgets,
  mockDrivingLicense,
  mockGoals,
  mockMoodLogs,
  mockTasks,
  mockTransactions,
  mockUser,
} from '../data/mock';
import { AiMessage, Application, Goal, MoodLog, TaskItem } from '../data/types';
import { computeLifeScore } from '../lib/lifeScore';
import { uuidv4, isValidUuid } from '../lib/id';
import * as sync from '../lib/sync';

/**
 * Local store, persisted on-device and mirrored to Supabase once a user
 * session exists (see src/lib/useCloudSync.ts). Every mutating action
 * updates local state first (instant UI, works offline) and then fires an
 * async, best-effort write to Supabase if `userId` is set.
 */
type LifeStore = {
  userId: string | null; // not persisted — re-derived from the auth session each launch
  user: typeof mockUser;
  goals: Goal[];
  tasks: TaskItem[];
  applications: typeof mockApplications;
  appointments: typeof mockAppointments;
  moodLogs: typeof mockMoodLogs;
  accounts: typeof mockAccounts;
  transactions: typeof mockTransactions;
  budgets: typeof mockBudgets;
  drivingLicense: typeof mockDrivingLicense;
  aiMessages: AiMessage[];

  setUserId: (userId: string | null) => void;
  hydrateFromRemote: (data: {
    goals: Goal[];
    tasks: TaskItem[];
    applications: Application[];
    moodLogs: MoodLog[];
    firstName?: string;
  }) => void;
  /** One-time fixup: legacy/mock ids like "g-fs-1" aren't valid Postgres uuids. */
  normalizeLegacyIds: () => void;

  toggleTask: (id: string) => void;
  addAiMessage: (message: AiMessage) => void;
  updateGoalProgress: (id: string, progress: number) => void;
  updateTodayMood: (field: 'mood' | 'energy' | 'motivation' | 'stress', value: number) => void;
  addTasks: (tasks: Omit<TaskItem, 'id'>[]) => void;
  updateTask: (id: string, fields: Partial<Omit<TaskItem, 'id'>>) => void;
  deleteTask: (id: string) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => Goal;
  updateGoal: (id: string, fields: Partial<Omit<Goal, 'id' | 'createdAt'>>) => void;
  deleteGoal: (id: string) => void;
  addApplication: (application: Omit<Application, 'id'>) => Application;
  updateApplication: (id: string, fields: Partial<Omit<Application, 'id'>>) => void;
  deleteApplication: (id: string) => void;
  updateUserName: (firstName: string) => void;

  lifeScore: () => ReturnType<typeof computeLifeScore>;
  todayMoodLog: () => MoodLog;
};

export const useLifeStore = create<LifeStore>()(
  persist(
    (set, get) => ({
  userId: null,
  user: mockUser,
  goals: mockGoals,
  tasks: mockTasks,
  applications: mockApplications,
  appointments: mockAppointments,
  moodLogs: mockMoodLogs,
  accounts: mockAccounts,
  transactions: mockTransactions,
  budgets: mockBudgets,
  drivingLicense: mockDrivingLicense,
  aiMessages: mockAiMessages,

  setUserId: (userId) => set({ userId }),

  hydrateFromRemote: ({ goals, tasks, applications, moodLogs, firstName }) =>
    set((state) => ({
      goals: goals.length > 0 ? goals : state.goals,
      tasks: tasks.length > 0 ? tasks : state.tasks,
      applications: applications.length > 0 ? applications : state.applications,
      moodLogs: moodLogs.length > 0 ? moodLogs : state.moodLogs,
      user: firstName ? { ...state.user, firstName } : state.user,
    })),

  normalizeLegacyIds: () =>
    set((state) => {
      const goalIdMap = new Map<string, string>();
      state.goals.forEach((g) => {
        if (!isValidUuid(g.id)) goalIdMap.set(g.id, uuidv4());
      });
      const taskIdMap = new Map<string, string>();
      state.tasks.forEach((t) => {
        if (!isValidUuid(t.id)) taskIdMap.set(t.id, uuidv4());
      });
      const applicationIdMap = new Map<string, string>();
      state.applications.forEach((a) => {
        if (!isValidUuid(a.id)) applicationIdMap.set(a.id, uuidv4());
      });
      const moodLogIdMap = new Map<string, string>();
      state.moodLogs.forEach((m) => {
        if (!isValidUuid(m.id)) moodLogIdMap.set(m.id, uuidv4());
      });

      if (!goalIdMap.size && !taskIdMap.size && !applicationIdMap.size && !moodLogIdMap.size) return state;

      return {
        goals: state.goals.map((g) => ({
          ...g,
          id: goalIdMap.get(g.id) ?? g.id,
          parentGoalId: g.parentGoalId ? goalIdMap.get(g.parentGoalId) ?? g.parentGoalId : g.parentGoalId,
        })),
        tasks: state.tasks.map((t) => ({
          ...t,
          id: taskIdMap.get(t.id) ?? t.id,
          goalId: t.goalId ? goalIdMap.get(t.goalId) ?? t.goalId : t.goalId,
        })),
        applications: state.applications.map((a) => ({ ...a, id: applicationIdMap.get(a.id) ?? a.id })),
        moodLogs: state.moodLogs.map((m) => ({ ...m, id: moodLogIdMap.get(m.id) ?? m.id })),
      };
    }),

  toggleTask: (id) => {
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    }));
    const { userId, tasks } = get();
    const task = tasks.find((t) => t.id === id);
    if (userId && task) sync.pushTask(userId, task);
  },

  addAiMessage: (message) => set((state) => ({ aiMessages: [...state.aiMessages, message] })),

  addTasks: (tasks) => {
    const newTasks = tasks.map((t) => ({ ...t, id: uuidv4() }));
    set((state) => ({ tasks: [...state.tasks, ...newTasks] }));
    const { userId } = get();
    if (userId) newTasks.forEach((t) => sync.pushTask(userId, t));
  },

  updateTask: (id, fields) => {
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...fields } : t)),
    }));
    const { userId, tasks } = get();
    const task = tasks.find((t) => t.id === id);
    if (userId && task) sync.pushTask(userId, task);
  },

  deleteTask: (id) => {
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    }));
    if (get().userId) sync.removeTask(id);
  },

  updateGoalProgress: (id, progress) => {
    set((state) => ({
      goals: state.goals.map((g) => (g.id === id ? { ...g, progress } : g)),
    }));
    const { userId, goals } = get();
    const goal = goals.find((g) => g.id === id);
    if (userId && goal) sync.pushGoal(userId, goal);
  },

  addGoal: (goal) => {
    const newGoal: Goal = { ...goal, id: uuidv4(), createdAt: new Date().toISOString() };
    set((state) => ({ goals: [...state.goals, newGoal] }));
    const { userId } = get();
    if (userId) sync.pushGoal(userId, newGoal);
    return newGoal;
  },

  updateGoal: (id, fields) => {
    set((state) => ({
      goals: state.goals.map((g) => (g.id === id ? { ...g, ...fields } : g)),
    }));
    const { userId, goals } = get();
    const goal = goals.find((g) => g.id === id);
    if (userId && goal) sync.pushGoal(userId, goal);
  },

  deleteGoal: (id) => {
    set((state) => ({
      goals: state.goals.filter((g) => g.id !== id && g.parentGoalId !== id),
      tasks: state.tasks.filter((t) => t.goalId !== id),
    }));
    if (get().userId) {
      sync.removeGoal(id);
      sync.removeTasksByGoal(id);
    }
  },

  addApplication: (application) => {
    const newApplication: Application = { ...application, id: uuidv4() };
    set((state) => ({ applications: [...state.applications, newApplication] }));
    const { userId } = get();
    if (userId) sync.pushApplication(userId, newApplication);
    return newApplication;
  },

  updateApplication: (id, fields) => {
    set((state) => ({
      applications: state.applications.map((a) => (a.id === id ? { ...a, ...fields } : a)),
    }));
    const { userId, applications } = get();
    const application = applications.find((a) => a.id === id);
    if (userId && application) sync.pushApplication(userId, application);
  },

  deleteApplication: (id) => {
    set((state) => ({
      applications: state.applications.filter((a) => a.id !== id),
    }));
    if (get().userId) sync.removeApplication(id);
  },

  updateUserName: (firstName) => {
    set((state) => ({ user: { ...state.user, firstName } }));
    const { userId } = get();
    if (userId) sync.pushProfile(userId, firstName);
  },

  updateTodayMood: (field, value) => {
    set((state) => {
      const today = new Date().toDateString();
      const existingIndex = state.moodLogs.findIndex((l) => new Date(l.date).toDateString() === today);
      if (existingIndex === -1) {
        const newLog: MoodLog = {
          id: uuidv4(),
          date: new Date().toISOString(),
          mood: 3,
          energy: 3,
          motivation: 3,
          stress: 3,
          sleep: 7,
          [field]: value,
        };
        return { moodLogs: [...state.moodLogs, newLog] };
      }
      return {
        moodLogs: state.moodLogs.map((l, i) => (i === existingIndex ? { ...l, [field]: value } : l)),
      };
    });
    const { userId, moodLogs } = get();
    const today = new Date().toDateString();
    const log = moodLogs.find((l) => new Date(l.date).toDateString() === today);
    if (userId && log) sync.pushMoodLog(userId, log);
  },

  todayMoodLog: () => {
    const state = get();
    const today = new Date().toDateString();
    const existing = state.moodLogs.find((l) => new Date(l.date).toDateString() === today);
    // 0 = "not answered yet today" (display-only sentinel, never persisted —
    // the moment any metric is tapped, updateTodayMood creates a real 1-5 row).
    return existing ?? { id: 'today', date: new Date().toISOString(), mood: 0, energy: 0, motivation: 0, stress: 0, sleep: 0 };
  },

  lifeScore: () => {
    const state = get();
    const totalBalance = state.accounts.reduce((sum, a) => sum + a.balance, 0);
    return computeLifeScore({
      goals: state.goals,
      tasks: state.tasks,
      moodLogs: state.moodLogs,
      drivingLicense: state.drivingLicense,
      totalBalance,
      budgets: state.budgets,
    });
  },
    }),
    {
      name: 'mylife-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        goals: state.goals,
        tasks: state.tasks,
        applications: state.applications,
        appointments: state.appointments,
        moodLogs: state.moodLogs,
        accounts: state.accounts,
        transactions: state.transactions,
        budgets: state.budgets,
        drivingLicense: state.drivingLicense,
        aiMessages: state.aiMessages,
      }),
    }
  )
);
