import { differenceInDays, addMonths, format } from 'date-fns';
import type { FirstAidItem, EmergencySupply, Medicine, ExpiryStatus, FamilyConfig } from '@/types';

export function getExpiryStatus(expiryDate: string): ExpiryStatus {
  const days = differenceInDays(new Date(expiryDate), new Date());
  if (days < 0) return 'expired';
  if (days <= 15) return 'urgent';
  if (days <= 60) return 'warning';
  return 'normal';
}

export function getDaysUntilExpiry(expiryDate: string): number {
  return differenceInDays(new Date(expiryDate), new Date());
}

export function getExpiryStatusColor(status: ExpiryStatus): string {
  switch (status) {
    case 'expired': return 'bg-red-500';
    case 'urgent': return 'bg-red-400';
    case 'warning': return 'bg-amber-400';
    case 'normal': return 'bg-emerald-500';
  }
}

export function getExpiryStatusTextColor(status: ExpiryStatus): string {
  switch (status) {
    case 'expired': return 'text-red-600';
    case 'urgent': return 'text-red-500';
    case 'warning': return 'text-amber-600';
    case 'normal': return 'text-emerald-600';
  }
}

export function getExpiryStatusBgColor(status: ExpiryStatus): string {
  switch (status) {
    case 'expired': return 'bg-red-50 border-red-200';
    case 'urgent': return 'bg-red-50 border-red-100';
    case 'warning': return 'bg-amber-50 border-amber-200';
    case 'normal': return 'bg-emerald-50 border-emerald-200';
  }
}

export function getExpiryStatusLabel(status: ExpiryStatus): string {
  switch (status) {
    case 'expired': return '已过期';
    case 'urgent': return '即将过期';
    case 'warning': return '临期预警';
    case 'normal': return '正常';
  }
}

export function getExpiringItems(items: FirstAidItem[]): (FirstAidItem & { status: ExpiryStatus; daysLeft: number })[] {
  return items
    .map(item => ({
      ...item,
      status: getExpiryStatus(item.expiryDate),
      daysLeft: getDaysUntilExpiry(item.expiryDate),
    }))
    .filter(item => item.status !== 'normal')
    .sort((a, b) => a.daysLeft - b.daysLeft);
}

export function getExpiringSupplies(items: EmergencySupply[]): (EmergencySupply & { status: ExpiryStatus; daysLeft: number })[] {
  return items
    .map(item => ({
      ...item,
      status: getExpiryStatus(item.expiryDate),
      daysLeft: getDaysUntilExpiry(item.expiryDate),
    }))
    .filter(item => item.status !== 'normal')
    .sort((a, b) => a.daysLeft - b.daysLeft);
}

export function getExpiringMedicines(items: Medicine[]): (Medicine & { status: ExpiryStatus; daysLeft: number })[] {
  return items
    .map(item => ({
      ...item,
      status: getExpiryStatus(item.expiryDate),
      daysLeft: getDaysUntilExpiry(item.expiryDate),
    }))
    .filter(item => item.status !== 'normal')
    .sort((a, b) => a.daysLeft - b.daysLeft);
}

export function needsRotation(supply: EmergencySupply): boolean {
  const daysSinceRotation = differenceInDays(new Date(), new Date(supply.lastRotated));
  return daysSinceRotation >= supply.rotationDays;
}

export function getRotationDaysLeft(supply: EmergencySupply): number {
  const daysSinceRotation = differenceInDays(new Date(), new Date(supply.lastRotated));
  return supply.rotationDays - daysSinceRotation;
}

export function getNextInventoryCheckDate(lastCheckDate: string): string {
  return format(addMonths(new Date(lastCheckDate), 3), 'yyyy-MM-dd');
}

export function getDaysUntilNextCheck(lastCheckDate: string): number {
  const nextDate = addMonths(new Date(lastCheckDate), 3);
  return differenceInDays(nextDate, new Date());
}

export function isInventoryCheckDue(lastCheckDate: string): boolean {
  return getDaysUntilNextCheck(lastCheckDate) <= 0;
}

export function calculateRecommendedSupplies(config: FamilyConfig): Record<string, { name: string; quantity: number; unit: string }> {
  const { memberCount, childrenCount, elderlyCount, supplyDays } = config;
  const adultCount = memberCount - childrenCount - elderlyCount;

  return {
    water: {
      name: '饮用水',
      quantity: memberCount * supplyDays * 3,
      unit: '升',
    },
    food: {
      name: '应急食品',
      quantity: memberCount * supplyDays * 2,
      unit: '份',
    },
    battery: {
      name: '备用电池',
      quantity: Math.max(4, Math.ceil(memberCount / 2) * 4),
      unit: '节',
    },
    flashlight: {
      name: '手电筒',
      quantity: Math.max(1, Math.ceil(memberCount / 3)),
      unit: '个',
    },
    firstaid: {
      name: '急救包',
      quantity: Math.max(1, Math.ceil(memberCount / 4)),
      unit: '个',
    },
    mask: {
      name: '防护口罩',
      quantity: memberCount * supplyDays,
      unit: '个',
    },
    blanket: {
      name: '应急毯',
      quantity: Math.max(2, memberCount),
      unit: '条',
    },
    whistle: {
      name: '求救哨',
      quantity: Math.max(1, Math.ceil(memberCount / 2)),
      unit: '个',
    },
    radio: {
      name: '收音机',
      quantity: 1,
      unit: '台',
    },
    medicine_extra: {
      name: '常备药品',
      quantity: adultCount * 2 + childrenCount * 3 + elderlyCount * 4,
      unit: '盒',
    },
  };
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
