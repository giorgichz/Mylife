import { create } from 'zustand';
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
import { AiMessage, Goal, MoodLog, TaskItem } from '../data/types';
import { computeLifeScore } from '../lib/lifeScore';

/**
 * Single in-memory store standing in for Supabase. Every getter here maps
 * 1:1 to a future Supabase query/subscription, so swapping the backing
 * implementation later doesn't change any screen code.
 */
type LifeStore = {
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

  toggleTask: (id: string) => void;
  addAiMessage: (message: AiMessage) => void;
  updateGoalProgress: (id: string, progress: number) => void;
  updateTodayMood: (field: 'mood' | 'energy' | 'motivation' | 'stress', value: number) => void;
  addTasks: (tasks: Omit<TaskItem, 'id'>[]) => void;

  lifeScore: () => ReturnType<typeof computeLifeScore>;
  todayMoodLog: () => MoodLog;
};

export const useLifeStore = create<LifeStore>((set, get) => ({
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

  toggleTask: (id) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    })),

  addAiMessage: (message) => set((state) => ({ aiMessages: [...state.aiMessages, message] })),

  addTasks: (tasks) =>
    set((state) => ({
      tasks: [
        ...state.tasks,
        ...tasks.map((t, i) => ({ ...t, id: `t-ai-${Date.now()}-${i}` })),
      ],
    })),

  updateGoalProgress: (id, progress) =>
    set((state) => ({
      goals: state.goals.map((g) => (g.id === id ? { ...g, progress } : g)),
    })),

  updateTodayMood: (field, value) =>
    set((state) => {
      const today = new Date().toDateString();
      const existingIndex = state.moodLogs.findIndex((l) => new Date(l.date).toDateString() === today);
      if (existingIndex === -1) {
        const newLog: MoodLog = {
          id: `m-${Date.now()}`,
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
    }),

  todayMoodLog: () => {
    const state = get();
    const today = new Date().toDateString();
    const existing = state.moodLogs.find((l) => new Date(l.date).toDateString() === today);
    return existing ?? { id: 'today', date: new Date().toISOString(), mood: 3, energy: 3, motivation: 3, stress: 3, sleep: 7 };
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
}));
