import {
  AiMessage,
  Application,
  Appointment,
  Budget,
  DrivingLicenseProgress,
  FinanceAccount,
  FinanceTransaction,
  Goal,
  MoodLog,
  TaskItem,
} from './types';

const iso = (daysFromNow: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString();
};

export const mockUser = {
  firstName: 'Giorgi',
};

// Goal structure kept, all progress reset to 0 — this is the real
// starting point, not a demo.
export const mockGoals: Goal[] = [
  {
    id: 'g-fs-1',
    areaKey: 'fuehrerschein',
    title: 'Führerschein bis September schaffen',
    status: 'active',
    priority: 'high',
    progress: 0,
    deadline: iso(38),
    createdAt: iso(0),
  },
  {
    id: 'g-fs-2',
    areaKey: 'fuehrerschein',
    parentGoalId: 'g-fs-1',
    title: 'Theorieprüfung bestehen',
    status: 'active',
    priority: 'high',
    progress: 0,
    deadline: iso(12),
    createdAt: iso(0),
  },
  {
    id: 'g-ab-1',
    areaKey: 'ausbildung',
    title: '5 Bewerbungen für Ausbildungsplatz verschicken',
    status: 'active',
    priority: 'high',
    progress: 0,
    deadline: iso(20),
    createdAt: iso(0),
  },
  {
    id: 'g-ab-2',
    areaKey: 'ausbildung',
    title: 'Anschreiben-Vorlage überarbeiten',
    status: 'active',
    priority: 'medium',
    progress: 0,
    deadline: iso(6),
    createdAt: iso(0),
  },
  {
    id: 'g-ps-1',
    areaKey: 'psyche',
    title: 'Feste Schlafenszeit einhalten (23:00 Uhr)',
    status: 'active',
    priority: 'medium',
    progress: 0,
    createdAt: iso(0),
  },
  {
    id: 'g-ge-1',
    areaKey: 'geld',
    title: '1.000 € Notgroschen ansparen',
    status: 'active',
    priority: 'medium',
    progress: 0,
    deadline: iso(70),
    createdAt: iso(0),
  },
];

export const mockTasks: TaskItem[] = [];

export const mockAppointments: Appointment[] = [];

export const mockMoodLogs: MoodLog[] = [];

export const mockAccounts: FinanceAccount[] = [];

export const mockTransactions: FinanceTransaction[] = [];

export const mockBudgets: Budget[] = [];

export const mockDrivingLicense: DrivingLicenseProgress = {
  theoryProgressPct: 0,
  theoryMockExamAvgPct: 0,
  lessonsCompleted: 0,
  lessonsPlanned: 0,
  costsSpent: 0,
  budgetTotal: 0,
};

export const mockApplications: Application[] = [];

export const mockAiMessages: AiMessage[] = [
  {
    id: 'ai-0',
    role: 'assistant',
    content:
      'Hey Giorgi 👋 Ich bin startklar. Sag mir einfach, welches Ziel du eintragen willst, z. B. „Ich möchte bis September meinen Führerschein schaffen" — oder leg Ziele direkt über den + Button bei „Ziele" an.',
    createdAt: iso(0),
  },
];
