/**
 * Client-side types. Field names mirror the Supabase schema in
 * supabase/migrations/0001_init.sql 1:1 (camelCase here, snake_case there)
 * so the mock layer can be swapped for real Supabase queries without
 * reshaping data.
 */

export type AreaKey = 'ausbildung' | 'psyche' | 'geld' | 'fuehrerschein';

export type GoalStatus = 'active' | 'done' | 'paused';
export type Priority = 'low' | 'medium' | 'high';

export type Goal = {
  id: string;
  areaKey: AreaKey;
  parentGoalId?: string;
  title: string;
  description?: string;
  status: GoalStatus;
  priority: Priority;
  progress: number; // 0-100
  deadline?: string; // ISO date
  createdAt: string;
};

export type TaskItem = {
  id: string;
  goalId?: string;
  areaKey: AreaKey;
  title: string;
  done: boolean;
  dueDate?: string; // ISO date
};

export type Appointment = {
  id: string;
  title: string;
  date: string; // ISO datetime
  areaKey?: AreaKey;
};

export type MoodLog = {
  id: string;
  date: string; // ISO date
  mood: number; // 1-5
  energy: number; // 1-5
  motivation: number; // 1-5
  stress: number; // 1-5 (higher = more stressed)
  sleep: number; // hours
};

export type FinanceAccount = {
  id: string;
  institution: string;
  name: string;
  type: 'girokonto' | 'sparkonto' | 'depot';
  balance: number;
  currency: 'EUR';
};

export type FinanceTransaction = {
  id: string;
  accountId: string;
  date: string; // ISO date
  amount: number; // negative = expense
  category: string;
  merchant: string;
};

export type Budget = {
  id: string;
  category: string;
  limit: number;
  spent: number;
};

export type DrivingLicenseProgress = {
  theoryProgressPct: number; // 0-100
  theoryMockExamAvgPct: number;
  lessonsCompleted: number;
  lessonsPlanned: number;
  examDate?: string; // ISO date
  costsSpent: number;
  budgetTotal: number;
};

export type ApplicationStatus = 'entwurf' | 'gesendet' | 'gespraech' | 'zusage' | 'absage';

export type Application = {
  id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  appliedAt?: string; // ISO date
  nextStep?: string;
  nextStepDate?: string; // ISO date
};

export type LifeScoreBreakdown = Record<AreaKey, number> & { overall: number };

export type ChatRole = 'user' | 'assistant';

export type AiToolAction = {
  kind:
    | 'create_goal'
    | 'update_goal'
    | 'delete_goal'
    | 'create_subgoal'
    | 'set_priority'
    | 'generate_plan'
    | 'reschedule_today';
  label: string;
  /** Parsed data the action applies when tapped, e.g. a goal title guessed from free text. */
  payload?: {
    title?: string;
    areaKey?: AreaKey;
    deadline?: string;
    goalId?: string;
    status?: GoalStatus;
    priority?: Priority;
    progress?: number;
  };
};

export type AiMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  actions?: AiToolAction[];
};

export const AREA_LABELS: Record<AreaKey, string> = {
  ausbildung: 'Ausbildung',
  psyche: 'Psyche',
  geld: 'Geld',
  fuehrerschein: 'Führerschein',
};

export const AREA_ICONS: Record<AreaKey, keyof typeof import('@expo/vector-icons/Ionicons').default.glyphMap> = {
  ausbildung: 'school-outline',
  psyche: 'leaf-outline',
  geld: 'wallet-outline',
  fuehrerschein: 'car-outline',
};
