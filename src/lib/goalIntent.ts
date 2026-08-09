import { AreaKey, Priority } from '../data/types';

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

function monthNameToDeadline(monthWord: string): string | undefined {
  const monthIndex = MONTHS[monthWord.toLowerCase()];
  if (monthIndex === undefined) return undefined;
  const now = new Date();
  let year = now.getFullYear();
  if (monthIndex < now.getMonth()) year += 1;
  return new Date(year, monthIndex + 1, 0).toISOString(); // last day of that month
}

function guessDeadline(text: string): string | undefined {
  const monthMatch = text.match(/bis\s+(?:ende\s+)?([a-zäöü]+)/i);
  return monthMatch ? monthNameToDeadline(monthMatch[1]) : undefined;
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

export type GoalMatch = { id: string; title: string };

/** Fuzzy-matches a text fragment (e.g. "Klavier lernen", "dem Führerschein") against real goal titles. */
export function findGoalByFragment(fragment: string, goals: GoalMatch[]): GoalMatch | undefined {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[.,!?]/g, '')
      .replace(/^(dem|den|das|die|der|mein|meinem|meinen)\s+/i, '')
      .trim();
  const cleanFragment = normalize(fragment);
  const fragmentWords = cleanFragment.split(/\s+/).filter((w) => w.length > 2);
  if (fragmentWords.length === 0) return undefined;

  let best: { goal: GoalMatch; score: number } | undefined;
  for (const goal of goals) {
    const title = normalize(goal.title);
    if (title.includes(cleanFragment) || cleanFragment.includes(title)) return goal;
    const overlap = fragmentWords.filter((w) => title.includes(w)).length;
    if (overlap > 0 && (!best || overlap > best.score)) best = { goal, score: overlap };
  }

  return best && best.score >= Math.max(1, fragmentWords.length - 1) ? best.goal : undefined;
}

const COMPLETION_PATTERNS = [
  /(?:ich\s+)?(?:hab|habe)\s+(.+?)\s+(?:geschafft|erledigt|abgeschlossen|fertig)/i,
  /markiere\s+(.+?)\s+als\s+erledigt/i,
  /schließe\s+(.+?)\s+ab/i,
  /(.+?)\s+ist\s+(?:geschafft|erledigt|fertig|abgeschlossen)/i,
];

/** Detects "ich hab X geschafft" style text and fuzzy-matches it against real goal titles. */
export function parseCompletionIntent(input: string, goals: GoalMatch[]): GoalMatch | undefined {
  const trimmed = input.trim();
  for (const pattern of COMPLETION_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match && match[1].trim().length >= 3) {
      const goal = findGoalByFragment(match[1], goals);
      if (goal) return goal;
    }
  }
  return undefined;
}

export type GoalEditIntent =
  | { kind: 'delete'; goal: GoalMatch }
  | { kind: 'priority'; goal: GoalMatch; priority: Priority }
  | { kind: 'deadline'; goal: GoalMatch; deadline: string }
  | { kind: 'rename'; goal: GoalMatch; title: string }
  | { kind: 'progress'; goal: GoalMatch; progress: number };

/** Detects direct edit commands against an existing goal: delete, priority, deadline, rename, progress. */
export function parseEditIntent(input: string, goals: GoalMatch[]): GoalEditIntent | undefined {
  const trimmed = input.trim();

  let m = trimmed.match(/^(?:lösche|entferne|streiche)\s+(?:das\s+ziel\s+)?(.+)/i);
  if (m) {
    const goal = findGoalByFragment(m[1], goals);
    if (goal) return { kind: 'delete', goal };
  }

  m = trimmed.match(/(?:setze\s+)?(?:die\s+)?priorität\s+(?:von|für)\s+(.+?)\s+auf\s+(hoch|mittel|niedrig)/i);
  if (!m) m = trimmed.match(/setze\s+(.+?)\s+auf\s+(hohe|hohen|höchste|mittlere|mittleren|niedrige|niedrigen)\s+priorität/i);
  if (m) {
    const goal = findGoalByFragment(m[1], goals);
    const p = m[2].toLowerCase();
    const priority: Priority = p.startsWith('hoch') || p.startsWith('höch') ? 'high' : p.startsWith('nied') ? 'low' : 'medium';
    if (goal) return { kind: 'priority', goal, priority };
  }

  m = trimmed.match(/(.+?)\s+ist\s+(?:jetzt\s+)?(sehr\s+wichtig|wichtig|dringend|unwichtig|nicht\s+so\s+wichtig)/i);
  if (m) {
    const goal = findGoalByFragment(m[1], goals);
    const low = /unwichtig|nicht\s+so\s+wichtig/i.test(m[2]);
    if (goal) return { kind: 'priority', goal, priority: low ? 'low' : 'high' };
  }

  m = trimmed.match(/(?:verschiebe|setze)\s+(?:die\s+deadline\s+(?:von|für)\s+)?(.+?)\s+auf\s+(?:ende\s+)?([a-zäöü]+)/i);
  if (m) {
    const goal = findGoalByFragment(m[1], goals);
    const deadline = monthNameToDeadline(m[2]);
    if (goal && deadline) return { kind: 'deadline', goal, deadline };
  }

  m = trimmed.match(/(?:änd(?:e)?re|benenne|nenne)\s+(.+?)\s+(?:um\s+)?in\s+(.+)/i);
  if (m && m[2].trim().length >= 3) {
    const goal = findGoalByFragment(m[1], goals);
    if (goal) return { kind: 'rename', goal, title: m[2].trim() };
  }

  m = trimmed.match(/setze\s+(?:den\s+)?fortschritt\s+(?:von|für)\s+(.+?)\s+auf\s+(\d{1,3})\s*%/i);
  if (!m) m = trimmed.match(/(.+?)\s+ist\s+(?:zu\s+)?(\d{1,3})\s*%\s*(?:fertig|geschafft|erledigt)?/i);
  if (m) {
    const pct = Number(m[2]);
    if (pct >= 0 && pct <= 100) {
      const goal = findGoalByFragment(m[1], goals);
      if (goal) return { kind: 'progress', goal, progress: pct };
    }
  }

  return undefined;
}
