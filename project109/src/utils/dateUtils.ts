export type ReminderStatus = 'normal' | 'warning' | 'danger' | 'expired';

export function calculateDaysRemaining(expiryDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function getReminderStatus(days: number): ReminderStatus {
  if (days < 0) return 'expired';
  if (days <= 30) return 'danger';
  if (days <= 90) return 'warning';
  return 'normal';
}

export function formatDate(date: string): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function generateId(): string {
  return 'id_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}
