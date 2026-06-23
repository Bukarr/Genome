export function cn(...classes: (string | undefined | null | boolean | number)[]) {
  return classes.filter(Boolean).join(' ');
}

export function formatRelativeTime(dateStr: string): string {
  try {
    const past = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - past.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHr = Math.round(diffMin / 60);
    const diffDays = Math.round(diffHr / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    return `${diffDays}d ago`;
  } catch (e) {
    return 'Recently';
  }
}

export function getCharacterLimit(platform: string): number {
  switch (platform.toLowerCase()) {
    case 'twitter/x':
    case 'twitter':
    case 'x':
      return 280;
    case 'linkedin':
      return 3000;
    default:
      return 99999;
  }
}

export function getPlatformColor(platform: string): string {
  switch (platform.toLowerCase()) {
    case 'twitter/x':
    case 'x':
    case 'twitter':
      return 'bg-zinc-900 border-zinc-700 text-zinc-100';
    case 'linkedin':
      return 'bg-blue-950 border-blue-800 text-blue-300';
    case 'instagram':
      return 'bg-pink-950 border-pink-800 text-pink-300';
    case 'threads':
      return 'bg-emerald-950 border-emerald-800 text-emerald-300';
    case 'tiktok':
      return 'bg-purple-950 border-purple-800 text-purple-300';
    default:
      return 'bg-stone-900 border-stone-800 text-stone-300';
  }
}
