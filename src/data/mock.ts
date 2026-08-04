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

export const mockGoals: Goal[] = [
  {
    id: 'g-fs-1',
    areaKey: 'fuehrerschein',
    title: 'Führerschein bis September schaffen',
    status: 'active',
    priority: 'high',
    progress: 52,
    deadline: iso(38),
    createdAt: iso(-40),
  },
  {
    id: 'g-fs-2',
    areaKey: 'fuehrerschein',
    parentGoalId: 'g-fs-1',
    title: 'Theorieprüfung bestehen',
    status: 'active',
    priority: 'high',
    progress: 78,
    deadline: iso(12),
    createdAt: iso(-40),
  },
  {
    id: 'g-ab-1',
    areaKey: 'ausbildung',
    title: '5 Bewerbungen für Ausbildungsplatz verschicken',
    status: 'active',
    priority: 'high',
    progress: 60,
    deadline: iso(20),
    createdAt: iso(-15),
  },
  {
    id: 'g-ab-2',
    areaKey: 'ausbildung',
    title: 'Anschreiben-Vorlage überarbeiten',
    status: 'active',
    priority: 'medium',
    progress: 30,
    deadline: iso(6),
    createdAt: iso(-10),
  },
  {
    id: 'g-ps-1',
    areaKey: 'psyche',
    title: 'Feste Schlafenszeit einhalten (23:00 Uhr)',
    status: 'active',
    priority: 'medium',
    progress: 45,
    createdAt: iso(-25),
  },
  {
    id: 'g-ge-1',
    areaKey: 'geld',
    title: '1.000 € Notgroschen ansparen',
    status: 'active',
    priority: 'medium',
    progress: 66,
    deadline: iso(70),
    createdAt: iso(-60),
  },
];

export const mockTasks: TaskItem[] = [
  { id: 't-1', goalId: 'g-fs-2', areaKey: 'fuehrerschein', title: 'Kapitel 4: Vorfahrtsregeln wiederholen', done: false, dueDate: iso(0) },
  { id: 't-2', goalId: 'g-ab-1', areaKey: 'ausbildung', title: 'Bewerbung an Stadtwerke fertigstellen', done: false, dueDate: iso(0) },
  { id: 't-3', goalId: 'g-ps-1', areaKey: 'psyche', title: 'Um 22:30 Uhr Bildschirmzeit beenden', done: false, dueDate: iso(0) },
  { id: 't-4', goalId: 'g-ge-1', areaKey: 'geld', title: '50 € auf Sparkonto überweisen', done: true, dueDate: iso(-1) },
  { id: 't-5', goalId: 'g-fs-2', areaKey: 'fuehrerschein', title: '20 Testfragen üben', done: true, dueDate: iso(-1) },
];

export const mockAppointments: Appointment[] = [
  { id: 'a-1', title: 'Fahrstunde – Überlandfahrt', date: iso(1), areaKey: 'fuehrerschein' },
  { id: 'a-2', title: 'Vorstellungsgespräch Stadtwerke', date: iso(9), areaKey: 'ausbildung' },
  { id: 'a-3', title: 'Theorieprüfung TÜV', date: iso(12), areaKey: 'fuehrerschein' },
];

export const mockMoodLogs: MoodLog[] = [
  { id: 'm-1', date: iso(-6), mood: 3, energy: 3, motivation: 3, stress: 3, sleep: 6.5 },
  { id: 'm-2', date: iso(-5), mood: 3, energy: 2, motivation: 2, stress: 4, sleep: 5.5 },
  { id: 'm-3', date: iso(-4), mood: 2, energy: 2, motivation: 2, stress: 4, sleep: 5 },
  { id: 'm-4', date: iso(-3), mood: 3, energy: 3, motivation: 3, stress: 3, sleep: 5.5 },
  { id: 'm-5', date: iso(-2), mood: 4, energy: 3, motivation: 4, stress: 2, sleep: 6 },
  { id: 'm-6', date: iso(-1), mood: 4, energy: 4, motivation: 4, stress: 2, sleep: 7 },
  { id: 'm-7', date: iso(0), mood: 4, energy: 4, motivation: 4, stress: 2, sleep: 7.5 },
];

export const mockAccounts: FinanceAccount[] = [
  { id: 'acc-1', institution: 'Sparkasse', name: 'Girokonto', type: 'girokonto', balance: 842.17, currency: 'EUR' },
  { id: 'acc-2', institution: 'Sparkasse', name: 'Tagesgeld', type: 'sparkonto', balance: 663.4, currency: 'EUR' },
];

export const mockTransactions: FinanceTransaction[] = [
  { id: 'tx-1', accountId: 'acc-1', date: iso(-1), amount: -12.9, category: 'Essen', merchant: 'Rewe' },
  { id: 'tx-2', accountId: 'acc-1', date: iso(-2), amount: -34.0, category: 'Fahrstunden', merchant: 'Fahrschule Nord' },
  { id: 'tx-3', accountId: 'acc-1', date: iso(-3), amount: 620, category: 'Einkommen', merchant: 'Nebenjob GmbH' },
  { id: 'tx-4', accountId: 'acc-1', date: iso(-4), amount: -9.99, category: 'Abo', merchant: 'Spotify' },
  { id: 'tx-5', accountId: 'acc-1', date: iso(-6), amount: -45.5, category: 'Kleidung', merchant: 'Zalando' },
];

export const mockBudgets: Budget[] = [
  { id: 'b-1', category: 'Essen', limit: 180, spent: 96 },
  { id: 'b-2', category: 'Fahrschule', limit: 250, spent: 170 },
  { id: 'b-3', category: 'Freizeit', limit: 100, spent: 82 },
];

export const mockDrivingLicense: DrivingLicenseProgress = {
  theoryProgressPct: 78,
  theoryMockExamAvgPct: 84,
  lessonsCompleted: 14,
  lessonsPlanned: 22,
  examDate: iso(12),
  costsSpent: 1180,
  budgetTotal: 1800,
};

export const mockApplications: Application[] = [
  { id: 'app-1', company: 'Stadtwerke Musterstadt', role: 'Ausbildung Elektroniker', status: 'gespraech', appliedAt: iso(-14), nextStep: 'Vorstellungsgespräch', nextStepDate: iso(9) },
  { id: 'app-2', company: 'Auto Weber GmbH', role: 'Ausbildung Kfz-Mechatroniker', status: 'gesendet', appliedAt: iso(-8) },
  { id: 'app-3', company: 'IT-Systemhaus Nord', role: 'Fachinformatiker Ausbildung', status: 'entwurf' },
  { id: 'app-4', company: 'Bäckerei Hoffmann', role: 'Ausbildung Bäcker', status: 'absage', appliedAt: iso(-30) },
];

export const mockAiMessages: AiMessage[] = [
  {
    id: 'ai-0',
    role: 'assistant',
    content:
      'Hey Giorgi 👋 Ich hab mir deinen Tag angeschaut: Deine Theorieprüfung ist in 12 Tagen und deine letzte Übungsquote lag bei 84 %. Soll ich dir einen Lernplan für die nächsten zwei Wochen erstellen?',
    createdAt: iso(0),
    actions: [{ kind: 'generate_plan', label: 'Lernplan erstellen' }],
  },
];
