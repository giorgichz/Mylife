import { supabase } from './supabase';
import { AiReply } from './aiSimulator';
import { AreaKey, GoalStatus, Priority } from '../data/types';

/**
 * Bridge to the ai-chat Supabase Edge Function (Groq, free tier). Kept
 * separate from aiSimulator.ts so the local heuristic matcher stays intact
 * as an offline/no-function-deployed-yet fallback — see useAiAssistant.ts.
 */

export type CloudChatContext = {
  goals: { id: string; title: string; areaKey: AreaKey; status: GoalStatus; priority: Priority; progress: number; deadline?: string }[];
  tasks: { id: string; title: string; done: boolean; dueDate?: string; goalId?: string }[];
  overallScore: number;
  areaScores: { ausbildung: number; psyche: number; geld: number; fuehrerschein: number };
  moodToday: { mood: number; energy: number; motivation: number; stress: number; sleep: number } | null;
  applicationsOpen: number;
  theoryProgressPct: number;
  examDaysLeft: number | null;
  savingsRate: number;
};

const TIMEOUT_MS = 15000;

/** Returns null on any failure (offline, function not deployed, Groq error, timeout) so the caller can fall back locally. */
export async function fetchCloudAiReply(
  message: string,
  history: { role: 'user' | 'assistant'; content: string }[],
  context: CloudChatContext
): Promise<AiReply | null> {
  try {
    const invoke = supabase.functions.invoke('ai-chat', { body: { message, history, context } });
    const timeout = new Promise<{ data: null; error: Error }>((resolve) =>
      setTimeout(() => resolve({ data: null, error: new Error('ai-chat timeout') }), TIMEOUT_MS)
    );
    const { data, error } = await Promise.race([invoke, timeout]);
    if (error || !data?.content) return null;
    return { content: data.content, actions: data.actions };
  } catch {
    return null;
  }
}
