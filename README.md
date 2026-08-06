# Mylife

Persönlicher KI-Lebensassistent — Ausbildung, Psyche, Geld, Führerschein.
Siehe [ARCHITECTURE.md](./ARCHITECTURE.md) für Datenmodell, KI-Architektur
und Roadmap.

## Setup

```bash
npm install
npm run web       # Browser (schnellste Iteration während der Entwicklung)
npm run ios       # iOS Simulator (nur macOS)
npm run android   # Android Emulator
```

## Supabase

`.env` enthält bereits URL + publishable Key (sicher zu committen, geschützt
durch Row Level Security). Damit die Cloud-Anbindung funktioniert, einmalig
im Supabase-Projekt:

1. **SQL Editor** → Inhalt von `supabase/migrations/0001_init.sql` einfügen
   und ausführen (legt alle Tabellen + RLS-Policies an)
2. **Authentication → Providers → Anonymous** aktivieren (die App loggt sich
   ohne Login-Screen automatisch anonym ein)

Ohne diese zwei Schritte läuft die App weiter normal — nur lokal auf dem
Gerät (`Profil → Cloud Sync` zeigt dann "Nur lokal" statt "Aktiv").

## Stand

Phase 0: vollständige Navigation, Design-System und alle Screens laufen auf
einer lokal persistierten Datenschicht (`src/data`, `src/store`, zustand +
AsyncStorage), inkl. eines lokalen KI-Antwort-Simulators
(`src/lib/aiSimulator.ts` — keine externe API, keine Kosten). Auth-Bootstrap
gegen Supabase ist verkabelt (`src/lib/AuthProvider.tsx`); das eigentliche
Sync der Daten (Ziele/Aufgaben/etc. in die Cloud schreiben) ist der nächste
Schritt, sobald Schema + Anonymous-Auth im Supabase-Projekt aktiv sind.
