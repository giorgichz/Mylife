import { AiReply } from './aiSimulator';
import { AreaKey, GoalStatus, Priority } from '../data/types';

/**
 * Bridge to the /api/ai-chat Vercel Serverless Function (Groq, free tier).
 * Kept separate from aiSimulator.ts so the local heuristic matcher stays
 * intact as an offline/no-key-configured-yet fallback — see
 * useAiAssistant.ts. Nothing here talks to Supabase — the AI backend and
 * the data backend are independent by design.
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
  todayCheckIn: { workUntil?: string; note?: string } | null;
};

// On web this stays empty so the fetch is same-origin ("/api/ai-chat"),
// which always works once deployed on Vercel. Only needed for the native
// app, where there is no "current origin" — set it to the deployed Vercel
// URL (e.g. https://mylife.vercel.app) once that's relevant.
const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';
const AI_CHAT_URL = `${API_BASE}/api/ai-chat`;
const TIMEOUT_MS = 15000;

/** Returns null on any failure (offline, key not configured, Groq error, timeout) so the caller can fall back locally. */
export async function fetchCloudAiReply(
  message: string,
  history: { role: 'user' | 'assistant'; content: string }[],
  context: CloudChatContext
): Promise<AiReply | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(AI_CHAT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, context }),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.content) return null;
    return { content: data.content, actions: data.actions };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
