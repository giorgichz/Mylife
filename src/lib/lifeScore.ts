import { AreaKey, DrivingLicenseProgress, Goal, LifeScoreBreakdown, MoodLog, TaskItem } from '../data/types';

const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n));

// No goals/logs/budgets yet means "not started", not "halfway there" — every
// area uses 0 as its no-data baseline so the score is comparable across
// areas instead of some defaulting to a generous 50/70 "neutral" credit.
function goalProgressAvg(goals: Goal[], area: AreaKey): number {
  const inArea = goals.filter((g) => g.areaKey === area && g.status !== 'paused');
  if (inArea.length === 0) return 0;
  return inArea.reduce((sum, g) => sum + g.progress, 0) / inArea.length;
}

function taskCompletionBonus(tasks: TaskItem[], area: AreaKey): number {
  const inArea = tasks.filter((t) => t.areaKey === area);
  if (inArea.length === 0) return 0;
  const done = inArea.filter((t) => t.done).length;
  return (done / inArea.length) * 15 - 7.5; // -7.5..+7.5 swing
}

function psycheScore(logs: MoodLog[]): number {
  const recent = logs.slice(-7);
  if (recent.length === 0) return 0;
  const avg = (key: keyof MoodLog) =>
    recent.reduce((sum, l) => sum + (l[key] as number), 0) / recent.length;

  const mood = avg('mood'); // 1-5
  const energy = avg('energy');
  const motivation = avg('motivation');
  const stress = avg('stress'); // higher = worse
  const sleep = avg('sleep'); // hours

  const positivePart = ((mood + energy + motivation) / 3 / 5) * 100; // 0-100
  const stressPenalty = ((stress - 3) / 2) * 15; // roughly -30..+30, centered at neutral stress=3
  const sleepBonus = clamp(((sleep - 6) / 3) * 10, -15, 15);

  return clamp(positivePart - stressPenalty + sleepBonus);
}

function drivingScore(d: DrivingLicenseProgress): number {
  const theory = d.theoryProgressPct;
  const lessons = clamp((d.lessonsCompleted / Math.max(1, d.lessonsPlanned)) * 100);
  return clamp(theory * 0.55 + lessons * 0.45);
}

function financeScore(balance: number, budgets: { limit: number; spent: number }[], savingsGoalProgress: number): number {
  const budgetHealth =
    budgets.length === 0
      ? 0
      : clamp(100 - (budgets.reduce((s, b) => s + Math.max(0, b.spent - b.limit), 0) / budgets.reduce((s, b) => s + b.limit, 1)) * 100);
  const savings = clamp(savingsGoalProgress);
  const buffer = clamp((balance / 1500) * 100, 0, 100);
  return clamp(budgetHealth * 0.4 + savings * 0.35 + buffer * 0.25);
}

export function computeLifeScore(params: {
  goals: Goal[];
  tasks: TaskItem[];
  moodLogs: MoodLog[];
  drivingLicense: DrivingLicenseProgress;
  totalBalance: number;
  budgets: { limit: number; spent: number }[];
}): LifeScoreBreakdown {
  const { goals, tasks, moodLogs, drivingLicense, totalBalance, budgets } = params;

  const ausbildung = clamp(goalProgressAvg(goals, 'ausbildung') + taskCompletionBonus(tasks, 'ausbildung'));
  // Blended like every other area, so a Psyche goal (e.g. "mehr Sport machen")
  // actually moves the score instead of only mood logs counting.
  const psyche = clamp(psycheScore(moodLogs) * 0.7 + goalProgressAvg(goals, 'psyche') * 0.3);
  const geld = clamp(financeScore(totalBalance, budgets, goalProgressAvg(goals, 'geld')));
  const fuehrerschein = clamp(drivingScore(drivingLicense) * 0.7 + goalProgressAvg(goals, 'fuehrerschein') * 0.3);

  const overall = Math.round((ausbildung + psyche + geld + fuehrerschein) / 4);

  return {
    ausbildung: Math.round(ausbildung),
    psyche: Math.round(psyche),
    geld: Math.round(geld),
    fuehrerschein: Math.round(fuehrerschein),
    overall,
  };
}
