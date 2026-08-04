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

## Stand

Phase 0: vollständige Navigation, Design-System und alle Screens laufen auf
einer In-Memory-Mock-Datenschicht (`src/data`, `src/store`), inkl. eines
lokalen KI-Antwort-Simulators (`src/lib/aiSimulator.ts`). Das Supabase-Schema
liegt bereits unter `supabase/migrations/0001_init.sql`, ist aber noch nicht
deployed. Kein `.env` nötig, um die App aktuell zu starten.
