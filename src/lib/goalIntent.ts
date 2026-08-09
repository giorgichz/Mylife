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
  psyche: /schlaf|stress|stimmung|motivation|energie|psyche|sport|fitness|abnehmen|zunehmen|joggen|laufen|trainieren|gesund/i,
  geld: /geld|sparen|budget|finanz|konto|ausgaben/i,
};

// "ich" is very often dropped in casual German ("will mehr Sport machen"),
// so it's optional here — the verb/phrase after it is signal enough on its own.
const LEAD_IN = /^(ich\s+)?(möchte|will|würde\s+gerne|habe\s+vor|plane|nehme\s+mir\s+vor|wünsche\s+mir)\s+/i;
const LABEL_PREFIX = /^(mein\s+ziel(\s+ist(\s+es)?)?|ziel|vorhaben)\s*:?\s*/i;

export type ParsedGoalIntent = {
  title: string;
  areaKey: AreaKey;
  deadline?: string;
};

function guessArea(text: string): AreaKey {
  for (const [key, pattern] of Object.entries(AREA_KEYWORDS) as [AreaKey, RegExp][]) {
    if (pattern.test(text)) return key;
  }
  return 'ausbildung';
}

function guessDeadline(text: string): string | undefined {
  const monthMatch = text.match(/bis\s+(?:ende\s+)?([a-zäöü]+)/i);
  if (!monthMatch) return undefined;
  const monthIndex = MONTHS[monthMatch[1].toLowerCase()];
  if (monthIndex === undefined) return undefined;
  const now = new Date();
  let year = now.getFullYear();
  if (monthIndex < now.getMonth()) year += 1;
  return new Date(year, monthIndex + 1, 0).toISOString(); // last day of that month
}

/** Turns raw free text (already stripped of any lead-in phrase) into a goal draft. */
export function buildGoalDraft(rawTitle: string): ParsedGoalIntent {
  const cleaned = rawTitle.replace(/\.$/, '').trim();
  const capitalized = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  return {
    title: capitalized,
    areaKey: guessArea(rawTitle),
    deadline: guessDeadline(rawTitle),
  };
}

/** Detects "(ich) möchte/will …" or "Ziel: …" style free text and turns it into a goal draft. */
export function parseGoalIntent(input: string): ParsedGoalIntent | undefined {
  const trimmed = input.trim();
  const leadIn = LEAD_IN.test(trimmed) ? LEAD_IN : LABEL_PREFIX.test(trimmed) ? LABEL_PREFIX : undefined;
  if (!leadIn) return undefined;

  const title = trimmed.replace(leadIn, '').trim();
  if (title.length < 3) return undefined;

  return buildGoalDraft(title);
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
