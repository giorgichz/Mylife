import { AiToolAction } from '../data/types';

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
};

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
          ? `Deine Theorieprüfung ist in ${ctx.examDaysLeft} Tagen, aktueller Lernstand: ${ctx.theoryProgressPct}%. Bei deinem Tempo bist du rechtzeitig fertig — ich würde die nächsten Tage noch 2 Übungsprüfungen einplanen.`
          : `Dein Theorie-Lernstand liegt bei ${ctx.theoryProgressPct}%. Willst du, dass ich einen Prüfungstermin einplane, sobald du bei 90 % bist?`,
      actions: [{ kind: 'generate_plan', label: 'Lernplan für diese Woche erstellen' }],
    }),
  },
  {
    test: /bewerbung|job|ausbildungsplatz|beruflich/i,
    reply: (ctx) => ({
      content:
        ctx.applicationsOpen > 0
          ? `Du hast aktuell ${ctx.applicationsOpen} offene Bewerbungen. Am wichtigsten gerade: das Vorstellungsgespräch bei den Stadtwerken vorbereiten. Soll ich dir dafür eine Checkliste erstellen?`
          : `Lass uns das angehen. Ich schlage vor, wir starten mit 3 passenden Ausbildungsbetrieben in deiner Nähe — soll ich dir Ziele dafür anlegen?`,
      actions: [{ kind: 'create_goal', label: 'Checkliste als Ziel anlegen' }],
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
      content: `Deine Sparquote liegt aktuell bei ${ctx.savingsRate}%, Geld-Score ${ctx.areaScores.geld}%. Ich sehe Sparpotenzial bei den Freizeit-Ausgaben — soll ich ein angepasstes Budget vorschlagen?`,
      actions: [{ kind: 'update_goal', label: 'Budget anpassen' }],
    }),
  },
  {
    test: /plan|woche|diese woche|tagesplan/i,
    reply: (ctx) => ({
      content: `Klar, ich erstelle dir einen Plan für die nächsten 7 Tage basierend auf deinen ${ctx.openTaskCount} offenen Aufgaben und Prioritäten. Führerschein und die Bewerbung bei den Stadtwerken haben aktuell die höchste Priorität.`,
      actions: [{ kind: 'generate_plan', label: 'Wochenplan erstellen' }],
    }),
  },
  {
    test: /ziel|priorität/i,
    reply: () => ({
      content: `Sag mir kurz, worum es geht (z. B. "Ich möchte bis September meinen Führerschein schaffen") und ich lege das Ziel inkl. Zwischenzielen und Deadline für dich an.`,
      actions: [{ kind: 'create_goal', label: 'Neues Ziel erstellen' }],
    }),
  },
];

export function simulateAiReply(input: string, ctx: AiContext): AiReply {
  const rule = rules.find((r) => r.test.test(input));
  if (rule) return rule.reply(ctx);

  return {
    content: `Dein Life Score liegt aktuell bei ${ctx.overallScore}%. Am weitesten vorne: Ausbildung (${ctx.areaScores.ausbildung}%), am meisten Luft nach oben: Führerschein (${ctx.areaScores.fuehrerschein}%). Frag mich z. B. nach einem Plan, deiner Stimmung oder deinen Finanzen.`,
  };
}
