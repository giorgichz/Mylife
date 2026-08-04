# Mylife — Architektur & Roadmap

Persönlicher KI-Lebensassistent. Premium-Feel (Apple-Niveau), Dark Theme,
vier Lebensbereiche: **Ausbildung, Psyche, Geld, Führerschein**.

## 1. Tech-Stack

| Bereich          | Wahl                                                        |
|-------------------|--------------------------------------------------------------|
| App-Framework     | Expo (SDK 57) + React Native 0.86 + TypeScript (strict)      |
| Navigation        | `expo-router` (file-based, native Stack/Tabs, shared element-fähige Transitions) |
| Styling/Motion    | Eigenes Design-System (kein UI-Kit) + `react-native-reanimated` 4 für 120-Hz-Feeling |
| Blur/Glass        | `expo-blur` (natives `BlurView` auf iOS/Android)             |
| Backend           | Supabase (Postgres, Auth, Realtime, Row Level Security)      |
| KI                | Claude API (Tool-Use / Function-Calling) über einen Server-Proxy (Edge Function), niemals direkt aus der App |
| Banking           | Open-Banking-Aggregator (z. B. GoCardless/Nordigen oder Plaid je nach Zielmarkt) hinter einer Supabase Edge Function |
| Auth am Gerät     | `expo-local-authentication` (Face ID / Touch ID / Biometric) |
| Push              | Expo Notifications + Supabase als Trigger-Quelle             |
| Offline           | Lokaler Cache (SQLite via `expo-sqlite` oder MMKV) + Sync-Queue gegen Supabase |

**Warum kein UI-Kit (Tamagui/NativeBase/Paper)?** Für einen "fühlt sich wie
Apple an"-Anspruch braucht es ein eigenes, kompromissloses Design-System.
Fertige Kits bringen ihre eigene visuelle Handschrift mit, die man ständig
überschreiben müsste. Wir bauen ein schlankes eigenes System (Tokens +
5–8 Primitives), das genau unsere Sprache spricht.

## 2. Design-System (Kurzfassung, Details in `src/theme`)

- **Hintergrund**: `#0A0A0A` (base), `#111214` (elevated), `#17181B` (card)
- **Glass**: `rgba(255,255,255,0.06)` Fläche + `BlurView(intensity=40, tint="dark")` + 1px `rgba(255,255,255,0.08)` Border + weicher Schatten
- **Akzent**: Ein einziger Signature-Akzent (Ice Blue `#3E9CFF`→`#7FD8FF` Gradient), sparsam eingesetzt — pro Screen max. 1–2 Akzentflächen
- **Radius**: 20 (Card), 28 (große Hero-Card), 999 (Pill/Button)
- **Typografie**: System-Font (SF Pro auf iOS, entspricht auf Android via `Inter`/system), Type-Scale 34/28/22/17/15/13, `letterSpacing` leicht negativ bei großen Größen (Apple-Signatur)
- **Motion**: Reanimated mit Spring-Presets (`damping: 18, stiffness: 190`), Screen-Transitions als natives `expo-router` Stack mit `presentation: "card"`/`"modal"`, Tab-Wechsel ohne harten Cut (Cross-Fade + leichte Scale)
- **Grundsatz**: Weißraum > Dichte. Lieber ein Wert pro Karte prominent zeigen als fünf klein.

## 3. Datenmodell (siehe `supabase/migrations`)

Kern-Entitäten:

- `profiles` — Nutzerprofil, Onboarding-Status
- `life_areas` — die 4 (später mehr) Bereiche + aktueller Score
- `goals` — Ziele, `area_id`, `parent_goal_id` (für Zwischenziele), Status, Deadline, Priorität
- `tasks` — konkrete Aufgaben, verknüpft mit `goal_id`, `due_date`, `done`
- `mood_logs` — täglich: Stimmung, Energie, Motivation, Stress, Schlaf (1–5 oder 0–100)
- `finance_accounts` / `finance_transactions` — Open-Banking-Import
- `budgets` — KI-generierte/angepasste Budgets pro Kategorie
- `driving_license_progress` — Theorie-Fortschritt, Fahrstunden, Kosten, Prüfungstermin
- `ai_messages` — Chatverlauf mit der KI, inkl. `tool_calls` (JSONB) für Nachvollziehbarkeit
- `life_scores` — täglicher Snapshot des berechneten Scores je Bereich + gesamt

Alles mandantengetrennt über RLS: `user_id = auth.uid()`.

## 4. KI-Architektur

Die App schickt **nie** den API-Key mit — jeder Chat-Turn geht an eine
Supabase Edge Function (`/functions/ai-chat`), die:

1. den vollen Kontext des Nutzers lädt (aktive Ziele, letzte Mood-Logs,
   Finanzkennzahlen, Führerschein-Status) und kompakt in den System-Prompt packt,
2. Claude mit einem festen Tool-Set aufruft:
   `create_goal`, `update_goal`, `delete_goal`, `create_subgoal`,
   `set_priority`, `generate_day_plan`, `generate_week_plan`,
   `log_insight` (Muster-Erkennung Psyche), `suggest_budget`,
3. Tool-Calls serverseitig gegen Supabase ausführt (mit Validierung),
4. eine natürlichsprachliche Antwort + eine strukturierte "was wurde geändert"-
   Zusammenfassung zurückgibt, die die App als Karten (nicht nur Text) rendert.

In dieser Session bauen wir die Client-Seite (Chat-UI + Intent-Typen +
Mock-Responses). Die Edge Function + echter API-Key folgen, sobald Supabase-
Projekt und Claude/OpenAI-Key vorliegen.

## 5. Screen-Map

```
app/
  _layout.tsx            Root-Stack (Auth-Gate, Fonts, Splash)
  (tabs)/
    _layout.tsx           Custom animierte Tabbar
    index.tsx              Home
    ziele/
      index.tsx            Ziele-Übersicht (4 Bereichs-Karten + Liste)
      ausbildung.tsx
      psyche.tsx
      geld.tsx
      fuehrerschein.tsx
    ki.tsx                  KI-Chat
    statistiken.tsx         Life-Score-Trends
    profil.tsx              Einstellungen, Face ID, Account
  goal/[id].tsx             Ziel-Detail (modal)
```

## 6. Life Score

Gewichteter Durchschnitt pro Bereich (0–100), z. B.:

- **Ausbildung**: offene Fristen (negativ), erledigte Aufgaben-Quote, Bewerbungsstatus
- **Psyche**: 7-Tage-Ø aus Mood/Energie/Motivation/Stress/Schlaf
- **Geld**: Sparquote vs. Ziel, Budget-Einhaltung
- **Führerschein**: Theorie-% + absolvierte Fahrstunden/geplante Fahrstunden

Gesamt-Score = Durchschnitt der 4 Bereiche (später gewichtbar). Berechnung
läuft als reine Funktion (`src/lib/lifeScore.ts`), lokal und serverseitig
identisch nutzbar.

## 7. Phasen

- **Phase 0 (diese Session)**: Navigations-Shell, Design-System, alle Screens
  mit realistischen Mock-Daten, KI-Chat-UI mit simulierten Antworten,
  vollständiges Supabase-Schema als SQL (noch nicht deployed).
- **Phase 1**: Supabase-Projekt anbinden, Auth (Face ID + Passkey/Email),
  echte CRUD-Operationen statt Mock-Daten.
- **Phase 2**: Edge Function + Claude Tool-Use live schalten.
- **Phase 3**: Open-Banking-Integration (Sandbox → Produktion).
- **Phase 4**: Push Notifications, Offline-Sync, Widgets, Feinschliff/App-Store.

Diese Session deckt Phase 0 vollständig ab, damit jede folgende Phase auf
einem stimmigen, bereits "fertig aussehenden" Produkt aufsetzt statt auf
Platzhalter-UI.
