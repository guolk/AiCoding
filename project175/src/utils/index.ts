import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { BloodPressureRecord } from "@/types";

export interface BloodPressureTarget {
  systolicMin: number;
  systolicMax: number;
  diastolicMin: number;
  diastolicMax: number;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

export function calculateBMI(weight: number, height: number): number {
  if (height <= 0) return 0;
  const heightInMeters = height / 100;
  return Number((weight / (heightInMeters * heightInMeters)).toFixed(1));
}

export function getBMIStatus(bmi: number): string {
  if (bmi < 18.5) return "偏瘦";
  if (bmi < 24) return "正常";
  if (bmi < 28) return "超重";
  return "肥胖";
}

function padZero(num: number): string {
  return num.toString().padStart(2, "0");
}

function toDate(date: string | Date): Date {
  return date instanceof Date ? date : new Date(date);
}

export function formatDate(date: string | Date): string {
  const d = toDate(date);
  return `${d.getFullYear()}-${padZero(d.getMonth() + 1)}-${padZero(d.getDate())}`;
}

export function formatDateTime(date: string | Date): string {
  const d = toDate(date);
  return `${formatDate(d)} ${padZero(d.getHours())}:${padZero(d.getMinutes())}`;
}

export function getTimePeriod(hour?: number): "morning" | "evening" | "other" {
  const h = hour ?? new Date().getHours();
  if (h >= 6 && h < 11) return "morning";
  if (h >= 20 && h < 25) return "evening";
  return "other";
}

const DEFAULT_BP_TARGET: BloodPressureTarget = {
  systolicMin: 90,
  systolicMax: 139,
  diastolicMin: 60,
  diastolicMax: 89,
};

export function isBloodPressureNormal(
  systolic: number,
  diastolic: number,
  target?: BloodPressureTarget
): boolean {
  const t = target ?? DEFAULT_BP_TARGET;
  return (
    systolic >= t.systolicMin &&
    systolic <= t.systolicMax &&
    diastolic >= t.diastolicMin &&
    diastolic <= t.diastolicMax
  );
}

export function calculateBloodPressureControlRate(
  records: BloodPressureRecord[],
  target?: BloodPressureTarget
): { total: number; inRange: number; rate: number } {
  const total = records.length;
  if (total === 0) return { total: 0, inRange: 0, rate: 0 };
  const inRange = records.filter((r) =>
    isBloodPressureNormal(r.systolic, r.diastolic, target)
  ).length;
  return {
    total,
    inRange,
    rate: Number(((inRange / total) * 100).toFixed(1)),
  };
}

export function getAverageByPeriod(
  records: BloodPressureRecord[],
  period: "morning" | "evening"
): {
  avgSystolic: number;
  avgDiastolic: number;
  avgHeartRate: number;
  count: number;
} {
  const filtered = records.filter((r) => r.timeOfDay === period);
  const count = filtered.length;
  if (count === 0) {
    return { avgSystolic: 0, avgDiastolic: 0, avgHeartRate: 0, count: 0 };
  }
  const sum = filtered.reduce(
    (acc, r) => ({
      systolic: acc.systolic + r.systolic,
      diastolic: acc.diastolic + r.diastolic,
      heartRate: acc.heartRate + r.pulse,
    }),
    { systolic: 0, diastolic: 0, heartRate: 0 }
  );
  return {
    avgSystolic: Number((sum.systolic / count).toFixed(1)),
    avgDiastolic: Number((sum.diastolic / count).toFixed(1)),
    avgHeartRate: Number((sum.heartRate / count).toFixed(1)),
    count,
  };
}

export function daysBetween(
  date1: string | Date,
  date2: string | Date
): number {
  const d1 = toDate(date1);
  const d2 = toDate(date2);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
