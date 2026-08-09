// Vercel Serverless Function — free-tier LLM bridge for the Mylife
// KI-Assistent (Groq, OpenAI-compatible tool calling). Runs server-side so
// the Groq API key (set as a Vercel Environment Variable, never committed)
// stays out of the client bundle. This function never writes to the
// database itself — it only proposes actions the app applies locally after
// the user taps to confirm, same pattern the local heuristic matcher uses.

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

type AreaKey = 'ausbildung' | 'psyche' | 'geld' | 'fuehrerschein';
type Priority = 'low' | 'medium' | 'high';

type GoalContext = {
  id: string;
  title: string;
  areaKey: AreaKey;
  status: 'active' | 'done' | 'paused';
  priority: Priority;
  progress: number;
  deadline?: string;
};

type RequestBody = {
  message: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
  context: {
    goals: GoalContext[];
    tasks: { id: string; title: string; done: boolean; dueDate?: string; goalId?: string }[];
    overallScore: number;
    areaScores: Record<AreaKey, number>;
    moodToday: { mood: number; energy: number; motivation: number; stress: number; sleep: number } | null;
    applicationsOpen: number;
    theoryProgressPct: number;
    examDaysLeft: number | null;
    savingsRate: number;
    todayCheckIn: { workUntil?: string; note?: string } | null;
  };
};

const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'create_goal',
      description: 'Legt ein neues Ziel für den Nutzer an.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Kurzer, konkreter Zieltitel auf Deutsch.' },
          areaKey: { type: 'string', enum: ['ausbildung', 'psyche', 'geld', 'fuehrerschein'] },
          deadline: { type: 'string', description: 'ISO-Datum, optional.' },
        },
        required: ['title', 'areaKey'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_goal',
      description: 'Ändert Titel, Deadline, Status oder Fortschritt eines bestehenden Ziels.',
      parameters: {
        type: 'object',
        properties: {
          goalId: { type: 'string', description: 'Exakte id aus dem Kontext, niemals erfinden.' },
          title: { type: 'string' },
          deadline: { type: 'string', description: 'ISO-Datum' },
          status: { type: 'string', enum: ['active', 'done', 'paused'] },
          progress: { type: 'number', minimum: 0, maximum: 100 },
        },
        required: ['goalId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'set_priority',
      description: 'Setzt die Priorität eines Ziels.',
      parameters: {
        type: 'object',
        properties: {
          goalId: { type: 'string' },
          priority: { type: 'string', enum: ['low', 'medium', 'high'] },
        },
        required: ['goalId', 'priority'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'delete_goal',
      description: 'Löscht ein oder mehrere Ziele, z. B. bei "lösche alle Ziele außer X".',
      parameters: {
        type: 'object',
        properties: {
          goalIds: {
            type: 'array',
            items: { type: 'string' },
            description: 'Exakte ids aus dem Kontext, niemals erfinden.',
          },
        },
        required: ['goalIds'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'generate_plan',
      description: 'Erstellt für heute Aufgaben aus den wichtigsten aktiven Zielen, die noch keine offene Aufgabe haben.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'reschedule_today',
      description:
        'Verschiebt die heutigen offenen Aufgaben auf morgen — z. B. wenn der Nutzer sagt, er hat heute keine Zeit oder Kraft mehr.',
      parameters: { type: 'object', properties: {} },
    },
  },
] as const;

function systemPrompt(ctx: RequestBody['context']): string {
  return `Du bist die KI in der App "Mylife" – ein persönlicher Lebensassistent für vier Lebensbereiche: Ausbildung, Psyche, Geld, Führerschein.

Sprich immer auf Deutsch, natürlich, warm und kurz — wie ein kluger Freund, nicht wie ein Kundenservice-Bot. Auf ein einfaches "Hey" antwortest du locker und fragst z. B. wie's läuft, ohne sofort ein Ziel vorzuschlagen. Bei Dingen wie "heute schlecht geschlafen" reagierst du zuerst einfühlsam und schlägst dann, wenn es wirklich passt, eine kleine konkrete Anpassung vor (z. B. heutige Aufgaben verschieben, ein Psyche-Ziel anlegen) — dräng nichts auf.

Du kennst die aktuellen Daten des Nutzers (unten als JSON). Nutze sie, um konkret zu antworten, nicht generisch. "todayCheckIn" ist ein kurzer Morgen-Check-in (falls heute schon ausgefüllt): "workUntil" sagt, bis wann der Nutzer heute wenig Zeit für sich hat, "note" ist Freitext zu Besonderheiten des Tages. Nimm das ernst fürs Zeitmanagement — wenn heute wenig Zeit ist, schlage weniger und kleinere Schritte vor statt einen vollen Plan; ist "todayCheckIn" null, wurde der Check-in heute noch nicht gemacht, geh dann von einem normalen Tag aus statt nachzufragen.

Wenn du neue Ziele anlegst oder einen Plan/Aufgaben vorschlägst: bevorzuge IMMER kleine, konkrete, an einem Tag schaffbare Schritte statt großer vager Ziele. "Anschreiben für Firma X fertig schreiben" statt "Bewerbungsprozess verbessern". Wenn der Nutzer ein großes Ziel nennt, leg es trotzdem so an, aber schlag im Text gleich einen ersten kleinen Schritt dafür vor (z. B. per generate_plan oder eine konkrete Aufgabe).

Wenn der Nutzer eine Änderung an seinen Zielen oder Aufgaben will (anlegen, umbenennen, Priorität, Deadline, Fortschritt, löschen, Plan erstellen, Tag umplanen), rufe GENAU DAS passende Tool auf. Nutze für goalId/goalIds ausschließlich echte id-Werte aus dem Kontext unten — erfinde niemals eigene IDs. Wenn sich eine Ausnahme wie "außer X" nicht eindeutig einem echten Ziel zuordnen lässt, rufe kein Tool auf und frag stattdessen kurz nach, welches Ziel gemeint ist.

Schreib IMMER auch eine kurze Textantwort (max. 2 Sätze) — auch wenn du ein Tool aufrufst. Der Tool-Aufruf ist nur ein Vorschlag, der Nutzer muss ihn erst antippen, bevor wirklich etwas geändert wird. Rufe Tools ausschließlich über die bereitgestellte Tool-Calling-Funktion auf — schreib niemals Text wie "<function=...>" in deine Antwort, das wird nicht ausgeführt.

Aktuelle Daten des Nutzers:
${JSON.stringify(ctx)}`;
}

function synthesizeFallbackContent(name: string): string {
  switch (name) {
    case 'create_goal':
      return 'Soll ich das Ziel so anlegen?';
    case 'update_goal':
      return 'Soll ich das so ändern?';
    case 'set_priority':
      return 'Priorität so setzen?';
    case 'delete_goal':
      return 'Wirklich löschen?';
    case 'generate_plan':
      return 'Soll ich dir daraus Aufgaben für heute erstellen?';
    case 'reschedule_today':
      return 'Soll ich das für dich verschieben?';
    default:
      return 'Soll ich das so machen?';
  }
}

function labelFor(name: string, args: Record<string, any>, goals: GoalContext[]): string {
  const goalTitle = (id: string) => goals.find((g) => g.id === id)?.title ?? 'Ziel';
  switch (name) {
    case 'create_goal':
      return `„${args.title}" anlegen`;
    case 'update_goal': {
      if (args.status === 'done') return `„${goalTitle(args.goalId)}" als erledigt markieren`;
      if (args.title) return `In „${args.title}" umbenennen`;
      if (args.deadline) return 'Deadline aktualisieren';
      if (args.progress !== undefined) return `Fortschritt auf ${args.progress}% setzen`;
      return 'Ziel aktualisieren';
    }
    case 'set_priority': {
      const label = { high: 'Hoch', medium: 'Mittel', low: 'Niedrig' }[args.priority as Priority] ?? args.priority;
      return `Priorität auf ${label} setzen`;
    }
    case 'delete_goal': {
      const n = (args.goalIds ?? []).length;
      return `${n} Ziel${n === 1 ? '' : 'e'} löschen`;
    }
    case 'generate_plan':
      return 'Plan für heute erstellen';
    case 'reschedule_today':
      return 'Heutige Aufgaben auf morgen verschieben';
    default:
      return 'Ausführen';
  }
}

type ToolAction = { kind: string; label: string; payload?: Record<string, unknown> };

function toActions(toolCalls: any[] | undefined, goals: GoalContext[]): ToolAction[] | undefined {
  if (!toolCalls || toolCalls.length === 0) return undefined;
  const actions: ToolAction[] = [];
  for (const call of toolCalls) {
    const name = call.function?.name;
    if (!name) continue;
    let args: Record<string, unknown> = {};
    try {
      args = call.function?.arguments ? JSON.parse(call.function.arguments) : {};
    } catch {
      continue;
    }
    actions.push({ kind: name, label: labelFor(name, args, goals), payload: args });
  }
  return actions.length > 0 ? actions : undefined;
}

// Groq's Llama models sometimes ignore the structured tool-calling API and
// instead write a text pseudo-call like "<function=generate_plan></function>"
// straight into the message content — a leftover of Llama's own trained
// text format. When that happens `tool_calls` is empty and the content
// looks like a real answer, so the model confidently claims it did
// something it never actually did. This parses that fallback format too.
const INLINE_FUNCTION_TAG = /<function=([a-zA-Z_]\w*)>([\s\S]*?)<\/function>/g;

function parseInlineFunctionTags(
  content: string,
  goals: GoalContext[]
): { actions: ToolAction[]; cleanedContent: string } | undefined {
  const actions: ToolAction[] = [];
  let match: RegExpExecArray | null;
  INLINE_FUNCTION_TAG.lastIndex = 0;
  while ((match = INLINE_FUNCTION_TAG.exec(content)) !== null) {
    const name = match[1];
    const argsText = match[2].trim();
    let args: Record<string, unknown> = {};
    if (argsText) {
      try {
        args = JSON.parse(argsText);
      } catch {
        // malformed inline args — skip this one call, keep the rest
        continue;
      }
    }
    actions.push({ kind: name, label: labelFor(name, args, goals), payload: args });
  }
  if (actions.length === 0) return undefined;
  const cleanedContent = content.replace(INLINE_FUNCTION_TAG, '').replace(/\s{2,}/g, ' ').trim();
  return { actions, cleanedContent };
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    res.status(500).json({ error: 'GROQ_API_KEY not configured' });
    return;
  }

  const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as RequestBody;
  if (!body?.message || !body?.context) {
    res.status(400).json({ error: 'message and context are required' });
    return;
  }

  try {
    const messages = [
      { role: 'system', content: systemPrompt(body.context) },
      ...(body.history ?? []).slice(-8),
      { role: 'user', content: body.message },
    ];

    const groqRes = await fetch(GROQ_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        messages,
        tools: TOOLS,
        tool_choice: 'auto',
        temperature: 0.4,
        max_tokens: 400,
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      res.status(502).json({ error: `Groq error: ${errText}` });
      return;
    }

    const data = await groqRes.json();
    const choice = data.choices?.[0]?.message;
    const toolCalls = choice?.tool_calls;
    let actions = toActions(toolCalls, body.context.goals);
    let content: string = (choice?.content ?? '').trim();
    let firstToolName: string | undefined = toolCalls?.[0]?.function?.name;

    if (!actions && content) {
      const inline = parseInlineFunctionTags(content, body.context.goals);
      if (inline) {
        actions = inline.actions;
        content = inline.cleanedContent;
        firstToolName = inline.actions[0]?.kind;
      }
    }

    if (!content) {
      content = actions && actions.length > 0 ? synthesizeFallbackContent(String(firstToolName)) : 'Sag mir gern mehr dazu.';
    }

    res.status(200).json({ content, actions });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
