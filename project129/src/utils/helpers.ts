import type { JLPTLevel, MasteryStatus } from '@/types';

export function generateId(): string {
  return crypto.randomUUID();
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function getLevelColor(level: JLPTLevel): string {
  const colors: Record<JLPTLevel, string> = {
    N5: 'var(--n5-green)',
    N4: 'var(--n4-blue)',
    N3: 'var(--n3-purple)',
    N2: 'var(--n2-amber)',
    N1: 'var(--n1-crimson)',
  };
  return colors[level];
}

export function getLevelBgClass(level: JLPTLevel): string {
  const classes: Record<JLPTLevel, string> = {
    N5: 'bg-n5-green',
    N4: 'bg-n4-blue',
    N3: 'bg-n3-purple',
    N2: 'bg-n2-amber',
    N1: 'bg-n1-crimson',
  };
  return classes[level];
}

export function getStatusColor(status: MasteryStatus): string {
  const colors: Record<MasteryStatus, string> = {
    unlearned: 'bg-gray-500',
    learning: 'bg-orange-400',
    mastered: 'bg-green-500',
  };
  return colors[status];
}
