export function timeBasedGreeting(name: string): string {
  const hour = new Date().getHours();
  if (hour < 5) return `Noch wach, ${name}?`;
  if (hour < 11) return `Guten Morgen, ${name}`;
  if (hour < 17) return `Guten Tag, ${name}`;
  if (hour < 22) return `Guten Abend, ${name}`;
  return `Späte Runde, ${name}?`;
}

export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: 'short' });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}
