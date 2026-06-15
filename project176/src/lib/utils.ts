import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, isValid, parseISO } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function safeFormat(dateStr: string | Date | number, pattern: string, fallback = "-") {
  try {
    let d: Date;
    if (dateStr instanceof Date) {
      d = dateStr;
    } else if (typeof dateStr === "number") {
      d = new Date(dateStr);
    } else {
      d = parseISO(dateStr);
      if (!isValid(d)) d = new Date(dateStr);
    }
    if (!isValid(d)) return fallback;
    return format(d, pattern);
  } catch {
    return fallback;
  }
}
