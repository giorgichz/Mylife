import { supabase } from './supabase';
import { Application, Goal, MoodLog, TaskItem } from '../data/types';

/**
 * Thin mapping + CRUD layer between the local store's camelCase shapes and
 * the snake_case Supabase schema (supabase/migrations/0001_init.sql). Every
 * function is fire-and-forget from the caller's perspective — local state is
 * always the source of truth for the UI, this just mirrors it to the cloud.
 * Errors are logged, never thrown, so a flaky connection never breaks the app.
 */

const toDateOnly = (iso?: string) => (iso ? iso.slice(0, 10) : null);
const fromDateOnly = (d: string | null) => (d ? new Date(`${d}T00:00:00`).toISOString() : undefined);

function logSyncError(scope: string, error: unknown) {
  if (error) console.warn(`[sync] ${scope} failed:`, error);
}

// ---------------------------------------------------------------------------
// goals
// ---------------------------------------------------------------------------
export function goalToRow(userId: string, g: Goal) {
  return {
    id: g.id,
    user_id: userId,
    area_key: g.areaKey,
    parent_goal_id: g.parentGoalId ?? null,
    title: g.title,
    description: g.description ?? null,
    status: g.status,
    priority: g.priority,
    progress: g.progress,
    deadline: toDateOnly(g.deadline),
  };
}

function rowToGoal(row: any): Goal {
  return {
    id: row.id,
    areaKey: row.area_key,
    parentGoalId: row.parent_goal_id ?? undefined,
    title: row.title,
    description: row.description ?? undefined,
    status: row.status,
    priority: row.priority,
    progress: row.progress,
    deadline: fromDateOnly(row.deadline),
    createdAt: row.created_at,
  };
}

export async function pullGoals(userId: string): Promise<Goal[]> {
  const { data, error } = await supabase.from('goals').select('*').eq('user_id', userId);
  logSyncError('pullGoals', error);
  return (data ?? []).map(rowToGoal);
}

export async function pushGoal(userId: string, goal: Goal) {
  const { error } = await supabase.from('goals').upsert(goalToRow(userId, goal));
  logSyncError('pushGoal', error);
}

export async function removeGoal(id: string) {
  const { error } = await supabase.from('goals').delete().eq('id', id);
  logSyncError('removeGoal', error);
}

// ---------------------------------------------------------------------------
// tasks
// ---------------------------------------------------------------------------
export function taskToRow(userId: string, t: TaskItem) {
  return {
    id: t.id,
    user_id: userId,
    goal_id: t.goalId ?? null,
    area_key: t.areaKey,
    title: t.title,
    done: t.done,
    due_date: toDateOnly(t.dueDate),
  };
}

function rowToTask(row: any): TaskItem {
  return {
    id: row.id,
    goalId: row.goal_id ?? undefined,
    areaKey: row.area_key,
    title: row.title,
    done: row.done,
    dueDate: fromDateOnly(row.due_date),
  };
}

export async function pullTasks(userId: string): Promise<TaskItem[]> {
  const { data, error } = await supabase.from('tasks').select('*').eq('user_id', userId);
  logSyncError('pullTasks', error);
  return (data ?? []).map(rowToTask);
}

export async function pushTask(userId: string, task: TaskItem) {
  const { error } = await supabase.from('tasks').upsert(taskToRow(userId, task));
  logSyncError('pushTask', error);
}

export async function removeTask(id: string) {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  logSyncError('removeTask', error);
}

export async function removeTasksByGoal(goalId: string) {
  const { error } = await supabase.from('tasks').delete().eq('goal_id', goalId);
  logSyncError('removeTasksByGoal', error);
}

// ---------------------------------------------------------------------------
// applications
// ---------------------------------------------------------------------------
export function applicationToRow(userId: string, a: Application) {
  return {
    id: a.id,
    user_id: userId,
    company: a.company,
    role: a.role,
    status: a.status,
    applied_at: toDateOnly(a.appliedAt),
    next_step: a.nextStep ?? null,
    next_step_date: toDateOnly(a.nextStepDate),
  };
}

function rowToApplication(row: any): Application {
  return {
    id: row.id,
    company: row.company,
    role: row.role,
    status: row.status,
    appliedAt: fromDateOnly(row.applied_at),
    nextStep: row.next_step ?? undefined,
    nextStepDate: fromDateOnly(row.next_step_date),
  };
}

export async function pullApplications(userId: string): Promise<Application[]> {
  const { data, error } = await supabase.from('applications').select('*').eq('user_id', userId);
  logSyncError('pullApplications', error);
  return (data ?? []).map(rowToApplication);
}

export async function pushApplication(userId: string, application: Application) {
  const { error } = await supabase.from('applications').upsert(applicationToRow(userId, application));
  logSyncError('pushApplication', error);
}

export async function removeApplication(id: string) {
  const { error } = await supabase.from('applications').delete().eq('id', id);
  logSyncError('removeApplication', error);
}

// ---------------------------------------------------------------------------
// mood_logs (one row per calendar day, upsert on the unique (user_id, log_date))
// ---------------------------------------------------------------------------
export function moodLogToRow(userId: string, m: MoodLog) {
  return {
    id: m.id,
    user_id: userId,
    log_date: toDateOnly(m.date),
    mood: m.mood,
    energy: m.energy,
    motivation: m.motivation,
    stress: m.stress,
    sleep_hours: m.sleep,
  };
}

function rowToMoodLog(row: any): MoodLog {
  return {
    id: row.id,
    date: fromDateOnly(row.log_date) ?? row.created_at,
    mood: row.mood,
    energy: row.energy,
    motivation: row.motivation,
    stress: row.stress,
    sleep: Number(row.sleep_hours),
  };
}

export async function pullMoodLogs(userId: string): Promise<MoodLog[]> {
  const { data, error } = await supabase
    .from('mood_logs')
    .select('*')
    .eq('user_id', userId)
    .order('log_date', { ascending: true });
  logSyncError('pullMoodLogs', error);
  return (data ?? []).map(rowToMoodLog);
}

export async function pushMoodLog(userId: string, log: MoodLog) {
  const { error } = await supabase
    .from('mood_logs')
    .upsert(moodLogToRow(userId, log), { onConflict: 'user_id,log_date' });
  logSyncError('pushMoodLog', error);
}

// ---------------------------------------------------------------------------
// profile
// ---------------------------------------------------------------------------
export async function pullProfile(userId: string): Promise<{ firstName: string } | null> {
  const { data, error } = await supabase.from('profiles').select('first_name').eq('id', userId).maybeSingle();
  logSyncError('pullProfile', error);
  return data ? { firstName: data.first_name } : null;
}

export async function pushProfile(userId: string, firstName: string) {
  const { error } = await supabase.from('profiles').upsert({ id: userId, first_name: firstName });
  logSyncError('pushProfile', error);
}
