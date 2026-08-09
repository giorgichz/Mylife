import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { useLifeStore } from '../store/useLifeStore';
import { simulateAiReply, AiContext } from './aiSimulator';
import { fetchCloudAiReply, CloudChatContext } from './aiCloud';
import { derivePsycheInsight } from './insights';
import { AiMessage, AiToolAction, Goal } from '../data/types';

/**
 * Single shared engine behind every entry point that talks to the "KI"
 * (the full chat screen, Home's quick-capture bar, …). Keeps one message
 * history and one intent-handling implementation so nothing drifts.
 */
export function useAiAssistant() {
  const {
    aiMessages,
    addAiMessage,
    addTasks,
    updateTask,
    addGoal,
    updateGoal,
    deleteGoal,
    goals,
    moodLogs,
    applications,
    drivingLicense,
    tasks,
    transactions,
    lifeScore,
    todayMoodLog,
    todayCheckIn,
  } = useLifeStore();
  const [isTyping, setIsTyping] = useState(false);

  const ctx: AiContext = useMemo(() => {
    const score = lifeScore();
    const daysLeft = drivingLicense.examDate
      ? Math.max(0, Math.ceil((new Date(drivingLicense.examDate).getTime() - Date.now()) / 86400000))
      : null;
    return {
      overallScore: score.overall,
      areaScores: { ausbildung: score.ausbildung, psyche: score.psyche, geld: score.geld, fuehrerschein: score.fuehrerschein },
      theoryProgressPct: drivingLicense.theoryProgressPct,
      examDaysLeft: daysLeft,
      applicationsOpen: applications.filter((a) => a.status === 'gesendet' || a.status === 'gespraech').length,
      savingsRate: (() => {
        const income = transactions.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
        const expenses = Math.abs(transactions.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0));
        return income > 0 ? Math.round(((income - expenses) / income) * 100) : 0;
      })(),
      psycheInsightText: derivePsycheInsight(moodLogs).text,
      openTaskCount: tasks.filter((t) => !t.done).length,
      todayOpenTaskCount: tasks.filter((t) => {
        if (t.done) return false;
        if (!t.dueDate) return true;
        return new Date(t.dueDate).toDateString() === new Date().toDateString();
      }).length,
      activeGoals: goals.filter((g) => g.status === 'active').map((g) => ({ id: g.id, title: g.title })),
    };
  }, [lifeScore, drivingLicense, applications, moodLogs, tasks, transactions, goals]);

  // Richer snapshot for the real LLM (ai-chat Edge Function) — includes ids
  // and full field values so it can ground tool calls in real data instead
  // of the id-less title list the local matcher gets by.
  const cloudCtx: CloudChatContext = useMemo(
    () => ({
      goals: goals.map((g) => ({
        id: g.id,
        title: g.title,
        areaKey: g.areaKey,
        status: g.status,
        priority: g.priority,
        progress: g.progress,
        deadline: g.deadline,
      })),
      tasks: tasks
        .filter((t) => !t.done)
        .slice(0, 30)
        .map((t) => ({ id: t.id, title: t.title, done: t.done, dueDate: t.dueDate, goalId: t.goalId })),
      overallScore: ctx.overallScore,
      areaScores: ctx.areaScores,
      moodToday: (() => {
        const log = todayMoodLog();
        return log.mood === 0 ? null : { mood: log.mood, energy: log.energy, motivation: log.motivation, stress: log.stress, sleep: log.sleep };
      })(),
      applicationsOpen: ctx.applicationsOpen,
      theoryProgressPct: ctx.theoryProgressPct,
      examDaysLeft: ctx.examDaysLeft,
      savingsRate: ctx.savingsRate,
      todayCheckIn: (() => {
        const c = todayCheckIn();
        if (!c || (!c.workUntil && !c.note)) return null;
        return { workUntil: c.workUntil, note: c.note };
      })(),
    }),
    [goals, tasks, ctx, todayMoodLog, todayCheckIn]
  );

  const sendMessage = (text: string, onSettled?: () => void) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    addAiMessage({
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    });
    setIsTyping(true);
    onSettled?.();

    const history = aiMessages.slice(-8).map((m) => ({ role: m.role, content: m.content }));

    (async () => {
      const cloudReply = await fetchCloudAiReply(trimmed, history, cloudCtx);
      const reply = cloudReply ?? simulateAiReply(trimmed, ctx);
      addAiMessage({
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: reply.content,
        createdAt: new Date().toISOString(),
        actions: reply.actions,
      });
      setIsTyping(false);
      onSettled?.();
    })();
  };

  const applyAction = (action: AiToolAction) => {
    let confirmation = '✅ Erledigt — du findest die Änderungen jetzt in deinen Zielen.';

    if (action.kind === 'create_goal' && action.payload?.title) {
      addGoal({
        areaKey: action.payload.areaKey ?? 'ausbildung',
        title: action.payload.title,
        status: 'active',
        priority: 'medium',
        progress: 0,
        deadline: action.payload.deadline,
      });
      confirmation = `✅ Ziel „${action.payload.title}" wurde angelegt — du findest es unter „Ziele".`;
    } else if (action.kind === 'create_goal') {
      router.push('/goal/new');
      return;
    } else if (action.kind === 'update_goal' && action.payload?.goalId) {
      const targetGoal = goals.find((g) => g.id === action.payload?.goalId);
      const { status, deadline, title, progress } = action.payload;
      const fields: Partial<Omit<Goal, 'id' | 'createdAt'>> = {};
      if (status) {
        fields.status = status;
        if (status === 'done') fields.progress = 100;
      }
      if (deadline !== undefined) fields.deadline = deadline;
      if (title !== undefined) fields.title = title;
      if (progress !== undefined) fields.progress = progress;
      updateGoal(action.payload.goalId, fields);

      if (status === 'done') {
        confirmation = targetGoal ? `✅ „${targetGoal.title}" ist jetzt als erledigt markiert. Gut gemacht!` : '✅ Erledigt.';
      } else if (title !== undefined) {
        confirmation = `✅ Ziel umbenannt in „${title}".`;
      } else if (deadline !== undefined) {
        confirmation = targetGoal ? `✅ Deadline von „${targetGoal.title}" aktualisiert.` : '✅ Erledigt.';
      } else if (progress !== undefined) {
        confirmation = targetGoal ? `✅ Fortschritt von „${targetGoal.title}" auf ${progress}% gesetzt.` : '✅ Erledigt.';
      }
    } else if (action.kind === 'set_priority' && action.payload?.goalId && action.payload.priority) {
      const targetGoal = goals.find((g) => g.id === action.payload?.goalId);
      updateGoal(action.payload.goalId, { priority: action.payload.priority });
      const label = { high: 'Hoch', medium: 'Mittel', low: 'Niedrig' }[action.payload.priority];
      confirmation = targetGoal ? `✅ Priorität von „${targetGoal.title}" ist jetzt ${label}.` : '✅ Erledigt.';
    } else if (action.kind === 'delete_goal' && (action.payload?.goalId || action.payload?.goalIds?.length)) {
      const ids = action.payload.goalIds ?? (action.payload.goalId ? [action.payload.goalId] : []);
      const titles = ids.map((id) => goals.find((g) => g.id === id)?.title).filter((t): t is string => !!t);
      ids.forEach((id) => deleteGoal(id));
      confirmation =
        titles.length === 0
          ? '✅ Gelöscht.'
          : titles.length === 1
            ? `✅ „${titles[0]}" wurde gelöscht.`
            : `✅ ${titles.length} Ziele wurden gelöscht: „${titles.join('", „')}".`;
    } else if (action.kind === 'reschedule_today') {
      const today = new Date().toDateString();
      const todayOpenTasks = tasks.filter((t) => !t.done && (!t.dueDate || new Date(t.dueDate).toDateString() === today));
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowIso = tomorrow.toISOString();

      todayOpenTasks.forEach((t) => updateTask(t.id, { dueDate: tomorrowIso }));

      confirmation =
        todayOpenTasks.length > 0
          ? `✅ ${todayOpenTasks.length} Aufgabe${todayOpenTasks.length > 1 ? 'n sind' : ' ist'} auf morgen verschoben. Erhol dich heute.`
          : '✅ Erledigt.';
    } else if (action.kind === 'generate_plan') {
      const priorityWeight = { high: 0, medium: 1, low: 2 } as const;
      const openGoals = goals
        .filter((g) => g.status === 'active')
        .filter((g) => !tasks.some((t) => t.goalId === g.id && !t.done))
        .sort((a, b) => priorityWeight[a.priority] - priorityWeight[b.priority])
        .slice(0, 3);

      if (openGoals.length > 0) {
        addTasks(
          openGoals.map((g) => ({
            areaKey: g.areaKey,
            goalId: g.id,
            title: `Nächster Schritt: ${g.title}`,
            done: false,
            dueDate: new Date().toISOString(),
          }))
        );
        confirmation = `✅ ${openGoals.length} Aufgabe${openGoals.length > 1 ? 'n' : ''} für deine wichtigsten Ziele angelegt — du findest sie unter „Heute erledigen".`;
      } else {
        confirmation =
          goals.filter((g) => g.status === 'active').length === 0
            ? 'Du hast noch keine aktiven Ziele. Leg zuerst eins an, dann kann ich einen Plan erstellen.'
            : 'Für alle deine aktiven Ziele gibt es schon offene Aufgaben — nichts Neues zu planen.';
      }
    }

    addAiMessage({
      id: `a-${Date.now()}`,
      role: 'assistant',
      content: confirmation,
      createdAt: new Date().toISOString(),
    });
  };

  return { aiMessages, isTyping, sendMessage, applyAction };
}
