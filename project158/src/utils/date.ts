import dayjs from 'dayjs';

export function formatDate(date: string | Date, format: string = 'YYYY-MM-DD'): string {
  return dayjs(date).format(format);
}

export function formatDateTime(date: string | Date): string {
  return dayjs(date).format('YYYY-MM-DD HH:mm');
}

export function getDaysDiff(start: string | Date, end: string | Date): number {
  const startDate = dayjs(start);
  const endDate = dayjs(end);
  return endDate.diff(startDate, 'day');
}

export function getMonthRange(year: number, month: number): { start: string; end: string } {
  const startOfMonth = dayjs(`${year}-${String(month).padStart(2, '0')}-01`)
  const start = startOfMonth.startOf('month').format('YYYY-MM-DD')
  const end = startOfMonth.endOf('month').format('YYYY-MM-DD')
  return { start, end }
}
