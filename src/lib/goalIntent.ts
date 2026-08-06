import { AreaKey } from '../data/types';

const MONTHS: Record<string, number> = {
  januar: 0,
  februar: 1,
  märz: 2,
  maerz: 2,
  april: 3,
  mai: 4,
  juni: 5,
  juli: 6,
  august: 7,
  september: 8,
  oktober: 9,
  november: 10,
  dezember: 11,
};

const AREA_KEYWORDS: Record<AreaKey, RegExp> = {
  fuehrerschein: /führerschein|fahrschule|theorieprüfung|fahrstunde/i,
  ausbildung: /ausbildung|bewerbung|job|arbeit|beruflich|studium|karriere/i,
  psyche: /schlaf|stress|stimmung|motivation|energie|psyche/i,
  geld: /geld|sparen|budget|finanz|konto|ausgaben/i,
};

const LEAD_IN = /^(ich\s+möchte|ich\s+will|ich\s+würde\s+gerne|mein\s+ziel\s+ist(\s+es)?,?)\s*/i;
const GOAL_VERB = /schaffen|erreichen|bestehen|verbessern|sparen|anlegen|verändern|starten|beginnen|lernen/i;

export type ParsedGoalIntent = {
  title: string;
  areaKey: AreaKey;
  deadline?: string;
};

/** Detects "Ich möchte …" style free text and turns it into a goal draft. */
export function parseGoalIntent(input: string): ParsedGoalIntent | undefined {
  const trimmed = input.trim();
  if (!LEAD_IN.test(trimmed) || !GOAL_VERB.test(trimmed)) return undefined;

  const title = trimmed.replace(LEAD_IN, '').replace(/\.$/, '').trim();
  if (title.length < 3) return undefined;
  const capitalized = title.charAt(0).toUpperCase() + title.slice(1);

  let areaKey: AreaKey = 'ausbildung';
  for (const [key, pattern] of Object.entries(AREA_KEYWORDS) as [AreaKey, RegExp][]) {
    if (pattern.test(trimmed)) {
      areaKey = key;
      break;
    }
  }

  const monthMatch = trimmed.match(/bis\s+(?:ende\s+)?([a-zäöü]+)/i);
  let deadline: string | undefined;
  if (monthMatch) {
    const monthIndex = MONTHS[monthMatch[1].toLowerCase()];
    if (monthIndex !== undefined) {
      const now = new Date();
      let year = now.getFullYear();
      if (monthIndex < now.getMonth()) year += 1;
      deadline = new Date(year, monthIndex + 1, 0).toISOString(); // last day of that month
    }
  }

  return { title: capitalized, areaKey, deadline };
}

const COMPLETION_PATTERNS = [
  /(?:ich\s+)?(?:hab|habe)\s+(.+?)\s+(?:geschafft|erledigt|abgeschlossen|fertig)/i,
  /markiere\s+(.+?)\s+als\s+erledigt/i,
  /schließe\s+(.+?)\s+ab/i,
  /(.+?)\s+ist\s+(?:geschafft|erledigt|fertig|abgeschlossen)/i,
];

export type GoalMatch = { id: string; title: string };

/** Detects "ich hab X geschafft" style text and fuzzy-matches it against real goal titles. */
export function parseCompletionIntent(input: string, goals: GoalMatch[]): GoalMatch | undefined {
  const trimmed = input.trim();
  let fragment: string | undefined;

  for (const pattern of COMPLETION_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) {
      fragment = match[1].trim().toLowerCase();
      break;
    }
  }
  if (!fragment || fragment.length < 3) return undefined;

  const normalize = (s: string) => s.toLowerCase().replace(/[.,!?]/g, '').trim();
  const fragmentWords = normalize(fragment).split(/\s+/).filter((w) => w.length > 2);

  let best: { goal: GoalMatch; score: number } | undefined;
  for (const goal of goals) {
    const title = normalize(goal.title);
    if (title.includes(normalize(fragment)) || normalize(fragment).includes(title)) {
      return goal;
    }
    const overlap = fragmentWords.filter((w) => title.includes(w)).length;
    if (overlap > 0 && (!best || overlap > best.score)) {
      best = { goal, score: overlap };
    }
  }

  return best && best.score >= Math.max(1, fragmentWords.length - 1) ? best.goal : undefined;
}
