export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateCN(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}年${month}月${day}日`;
}

export function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1;

  if (month >= 3 && month <= 5) {
    return '春';
  } else if (month >= 6 && month <= 8) {
    return '夏';
  } else if (month >= 9 && month <= 11) {
    return '秋';
  } else {
    return '冬';
  }
}

export function getDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return formatDate(date);
}
