import { AiToolAction } from '../data/types';
import { parseGoalIntent, parseCompletionIntent, GoalMatch } from './goalIntent';

/**
 * Local stand-in for the real Claude tool-use flow (see ARCHITECTURE.md §4).
 * Pattern-matches on keywords and answers using the user's actual live data
 * (passed in via `ctx`), so the demo genuinely reflects app state instead of
 * returning canned text. Swap this module for a call to the Edge Function
 * once a Claude/OpenAI API key is wired up — the call-site contract
 * (`{ content, actions }`) stays the same.
 */

export type AiContext = {
  overallScore: number;
  areaScores: { ausbildung: number; psyche: number; geld: number; fuehrerschein: number };
  theoryProgressPct: number;
  examDaysLeft: number | null;
  applicationsOpen: number;
  savingsRate: number;
  psycheInsightText: string;
  openTaskCount: number;
  todayOpenTaskCount: number;
  activeGoals: GoalMatch[];
};

const DISRUPTION_PATTERN =
  /(arbeite.*länger|länger arbeiten|keine zeit (heute|mehr)|wenig zeit heute|schaffe (es )?(heute )?nicht|bin (heute )?(müde|erschöpft|kaputt)|viel los heute|muss heute früher|hab heute keine kraft|zu (viel|müde) für heute)/i;

export type AiReply = {
  content: string;
  actions?: AiToolAction[];
};

const rules: { test: RegExp; reply: (ctx: AiContext) => AiReply }[] = [
  {
    test: /führerschein|fahrschule|theorie|prüfung/i,
    reply: (ctx) => ({
      content:
        ctx.examDaysLeft !== null
          ? `Deine Theorieprüfung ist in ${ctx.examDaysLeft} Tagen, aktueller Lernstand: ${ctx.theoryProgressPct}%.`
          : `Dein Theorie-Lernstand liegt bei ${ctx.theoryProgressPct}%. Trag deinen Prüfungstermin und Fortschritt unter „Führerschein" ein, dann kann ich dir einen Lernplan vorschlagen.`,
      actions: [{ kind: 'generate_plan', label: 'Lernplan für diese Woche erstellen' }],
    }),
  },
  {
    test: /bewerbung|ausbildungsplatz/i,
    reply: (ctx) => ({
      content:
        ctx.applicationsOpen > 0
          ? `Du hast aktuell ${ctx.applicationsOpen} offene Bewerbungen. Soll ich dir eine Checkliste für den nächsten Schritt erstellen?`
          : `Trag deine ersten Bewerbungen unter „Ausbildung" ein, dann kann ich dir helfen, Prioritäten zu setzen.`,
      actions: [{ kind: 'create_goal', label: 'Bewerbungs-Ziel anlegen' }],
    }),
  },
  {
    test: /stimmung|psyche|motivation|stress|schlaf|energie/i,
    reply: (ctx) => ({
      content: `${ctx.psycheInsightText} Dein Psyche-Score liegt bei ${ctx.areaScores.psyche}%. Keine Diagnose, nur eine Beobachtung — soll ich dir ein kleines Tagesziel dafür vorschlagen?`,
      actions: [{ kind: 'create_subgoal', label: 'Zwischenziel vorschlagen' }],
    }),
  },
  {
    test: /geld|sparen|budget|ausgaben|finanz/i,
    reply: (ctx) => ({
      content:
        ctx.savingsRate > 0
          ? `Deine Sparquote liegt aktuell bei ${ctx.savingsRate}%, Geld-Score ${ctx.areaScores.geld}%.`
          : `Verbinde zuerst dein Konto unter „Geld", dann kann ich dir ein Budget vorschlagen und Sparpotenzial berechnen.`,
      actions: [{ kind: 'update_goal', label: 'Budget vorschlagen' }],
    }),
  },
  {
    test: /plan|woche|diese woche|tagesplan/i,
    reply: (ctx) => ({
      content:
        ctx.openTaskCount > 0
          ? `Klar, ich erstelle dir einen Plan für die nächsten 7 Tage basierend auf deinen ${ctx.openTaskCount} offenen Aufgaben und Prioritäten.`
          : ctx.activeGoals.length > 0
            ? `Du hast noch keine offenen Aufgaben. Ich leite dir welche aus deinen aktiven Zielen ab.`
            : `Du hast aktuell keine offenen Aufgaben. Leg zuerst ein Ziel an (z. B. „Ich möchte bis September meinen Führerschein schaffen"), dann erstelle ich dir daraus einen Plan.`,
      actions: [{ kind: 'generate_plan', label: 'Wochenplan erstellen' }],
    }),
  },
  {
    test: /ziel|priorität/i,
    reply: () => ({
      content: `Sag mir kurz, worum es geht (z. B. "Ich möchte bis September meinen Führerschein schaffen") und ich lege das Ziel für dich an.`,
      actions: [{ kind: 'create_goal', label: 'Neues Ziel erstellen' }],
    }),
  },
];

export function simulateAiReply(input: string, ctx: AiContext): AiReply {
  if (DISRUPTION_PATTERN.test(input)) {
    if (ctx.todayOpenTaskCount > 0) {
      return {
        content: `Alles klar, dann passen wir den Tag an. Du hast noch ${ctx.todayOpenTaskCount} offene Aufgabe${ctx.todayOpenTaskCount > 1 ? 'n' : ''} für heute — soll ich die auf morgen verschieben?`,
        actions: [{ kind: 'reschedule_today', label: 'Heutige Aufgaben auf morgen verschieben' }],
      };
    }
    return {
      content: `Alles klar, kein Stress — für heute stehen sowieso keine Aufgaben mehr offen.`,
    };
  }

  const completedGoal = parseCompletionIntent(input, ctx.activeGoals);
  if (completedGoal) {
    return {
      content: `Glückwunsch! Ich markiere „${completedGoal.title}" als erledigt.`,
      actions: [
        {
          kind: 'update_goal',
          label: `„${completedGoal.title}" als erledigt markieren`,
          payload: { goalId: completedGoal.id, status: 'done' },
        },
      ],
    };
  }

  const goalIntent = parseGoalIntent(input);
  if (goalIntent) {
    return {
      content: `Alles klar — ich lege „${goalIntent.title}" als Ziel an${
        goalIntent.deadline ? ` (Deadline: ${new Date(goalIntent.deadline).toLocaleDateString('de-DE')})` : ''
      }.`,
      actions: [
        {
          kind: 'create_goal',
          label: `„${goalIntent.title}" anlegen`,
          payload: { title: goalIntent.title, areaKey: goalIntent.areaKey, deadline: goalIntent.deadline },
        },
      ],
    };
  }

  const rule = rules.find((r) => r.test.test(input));
  if (rule) return rule.reply(ctx);

  return {
    content: `Dein Life Score liegt aktuell bei ${ctx.overallScore}%. Frag mich z. B. nach einem Plan, deiner Stimmung oder deinen Finanzen — oder sag mir direkt ein Ziel, das ich anlegen soll.`,
  };
}
