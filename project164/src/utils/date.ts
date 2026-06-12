export const formatDate = (
  dateStr: string,
  format: "full" | "short" | "monthDay" = "full"
): string => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  switch (format) {
    case "short":
      return `${year}/${month.toString().padStart(2, "0")}/${day.toString().padStart(2, "0")}`;
    case "monthDay":
      return `${month}月${day}日`;
    case "full":
    default:
      return `${year}年${month}月${day}日`;
  }
};

export const formatRelative = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "今天";
  if (diffDays === 1) return "明天";
  if (diffDays === -1) return "昨天";
  if (diffDays > 0 && diffDays <= 7) return `${diffDays}天后`;
  if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)}天前`;
  if (diffDays > 0 && diffDays <= 30) return `${Math.ceil(diffDays / 7)}周后`;
  if (diffDays < 0 && diffDays >= -30) return `${Math.ceil(Math.abs(diffDays) / 7)}周前`;
  return formatDate(dateStr, "short");
};

export const isUrgent = (dateStr: string, days: number = 7): boolean => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= days;
};

export const isOverdue = (dateStr: string): boolean => {
  const date = new Date(dateStr);
  const now = new Date();
  return date.getTime() < now.getTime();
};

export const addDays = (dateStr: string, days: number): string => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
};

export const today = (): string => {
  return new Date().toISOString().split("T")[0];
};
