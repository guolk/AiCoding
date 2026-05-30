
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
  });
}

export function getDaysUntil(dateString: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateString);
  target.setHours(0, 0, 0, 0);
  const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

export function getNextAnniversary(dateString: string, recurring: boolean): string {
  if (!recurring) return dateString;
  const date = new Date(dateString);
  const now = new Date();
  date.setFullYear(now.getFullYear());
  if (date.getTime() < now.getTime()) {
    date.setFullYear(now.getFullYear() + 1);
  }
  return date.toISOString().split('T')[0];
}

export function getYear(dateString: string): number {
  return new Date(dateString).getFullYear();
}

export function getMonth(dateString: string): number {
  return new Date(dateString).getMonth() + 1;
}
