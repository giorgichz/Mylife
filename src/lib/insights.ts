import { MoodLog } from '../data/types';

export type Insight = {
  icon: 'trending-up' | 'trending-down' | 'moon' | 'battery-charging';
  text: string;
  tip: string;
};

const avg = (logs: MoodLog[], key: keyof MoodLog) =>
  logs.length ? logs.reduce((s, l) => s + (l[key] as number), 0) / logs.length : 0;

/** Simple recency-weighted pattern detection — no diagnosis, just a nudge. */
export function derivePsycheInsight(logs: MoodLog[]): Insight {
  if (logs.length < 4) {
    return {
      icon: 'moon',
      text: 'Noch nicht genug Daten für ein Muster.',
      tip: 'Trag deine Stimmung ein paar Tage in Folge ein, damit die KI Muster erkennen kann.',
    };
  }

  const recent = logs.slice(-3);
  const earlier = logs.slice(0, -3);

  const sleepRecent = avg(recent, 'sleep');
  const sleepEarlier = avg(earlier, 'sleep');
  const energyRecent = avg(recent, 'energy');
  const energyEarlier = avg(earlier, 'energy');

  if (sleepRecent < 6 && sleepRecent <= sleepEarlier) {
    return {
      icon: 'moon',
      text: `Du schläfst seit ${recent.length} Tagen im Schnitt nur ${sleepRecent.toFixed(1)} Std.`,
      tip: 'Versuch heute 30 Minuten früher ins Bett zu gehen — das wirkt sich meist schon am nächsten Tag auf deine Energie aus.',
    };
  }

  if (energyRecent - energyEarlier >= 0.4 && sleepRecent - sleepEarlier >= 0.4) {
    return {
      icon: 'trending-up',
      text: 'Energie & Schlaf haben sich die letzten Tage spürbar verbessert.',
      tip: 'Behalte deine aktuelle Abendroutine bei — sie scheint zu wirken.',
    };
  }

  if (energyRecent - energyEarlier <= -0.4) {
    return {
      icon: 'trending-down',
      text: 'Deine Energie ist in den letzten Tagen gesunken.',
      tip: 'Ein kurzer Spaziergang oder eine Pause ohne Bildschirm kann helfen, wieder aufzutanken.',
    };
  }

  return {
    icon: 'battery-charging',
    text: 'Deine Werte sind die letzten Tage stabil.',
    tip: 'Guter Zeitpunkt, um ein neues kleines Gewohnheits-Ziel zu setzen.',
  };
}
