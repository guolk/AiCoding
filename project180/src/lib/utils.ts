import { create } from 'zustand'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { DashboardStats } from '../../shared/types.js'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface AppState {
  navOpen: boolean
  setNavOpen: (v: boolean) => void
  stats: DashboardStats | null
  setStats: (s: DashboardStats) => void
}

export const useAppStore = create<AppState>((set) => ({
  navOpen: true,
  setNavOpen: (v) => set({ navOpen: v }),
  stats: null,
  setStats: (s) => set({ stats: s }),
}))

export function fetchAPI<T>(url: string, options?: RequestInit): Promise<T> {
  return fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  }).then(async (res) => {
    const data = await res.json()
    if (!res.ok || !data.success) {
      throw new Error(data.error || '请求失败')
    }
    return data.data as T
  })
}

export const TYPE_LABELS: Record<string, string> = {
  policy: '政策性',
  value: '价值性',
  fact: '事实性',
}

export const TYPE_COLORS: Record<string, string> = {
  policy: 'bg-blue-100 text-blue-800',
  value: 'bg-purple-100 text-purple-800',
  fact: 'bg-teal-100 text-teal-800',
}

export const FRAMEWORK_LABELS: Record<string, string> = {
  value: '价值判断',
  fact: '事实依据',
  logic: '逻辑推理',
}

export const FRAMEWORK_COLORS: Record<string, string> = {
  value: 'bg-amber-100 text-amber-800',
  fact: 'bg-emerald-100 text-emerald-800',
  logic: 'bg-sky-100 text-sky-800',
}

export const PRACTICE_LABELS: Record<string, string> = {
  argumentation: '立论',
  interrogation: '盘问',
  speech: '陈词',
  improvisation: '即兴应对',
}

export const PRACTICE_COLORS: Record<string, string> = {
  argumentation: 'bg-violet-100 text-violet-800',
  interrogation: 'bg-rose-100 text-rose-800',
  speech: 'bg-indigo-100 text-indigo-800',
  improvisation: 'bg-orange-100 text-orange-800',
}

export const ROLE_LABELS: Record<string, string> = {
  captain: '队长',
  member: '队员',
  coach: '教练',
}

export const PRIORITY_COLORS: Record<string, string> = {
  high: 'bg-con-500',
  medium: 'bg-gold-500',
  low: 'bg-ink-200',
}

export function renderStars(n: number) {
  return '★'.repeat(n) + '☆'.repeat(5 - n)
}

export function formatDate(s: string) {
  const d = new Date(s)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function formatDateTime(s: string) {
  const d = new Date(s)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function daysUntil(s: string) {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const d = new Date(s)
  d.setHours(0, 0, 0, 0)
  const diff = Math.round((d.getTime() - now.getTime()) / 86400000)
  if (diff === 0) return '今天'
  if (diff === 1) return '明天'
  if (diff > 1) return `${diff}天后`
  if (diff === -1) return '昨天'
  return `${-diff}天前`
}

export function strengthColor(s: number) {
  if (s >= 8) return 'bg-emerald-500'
  if (s >= 6) return 'bg-gold-500'
  if (s >= 4) return 'bg-amber-500'
  return 'bg-rose-500'
}

export function strengthLabel(s: number) {
  if (s >= 8) return '极强'
  if (s >= 6) return '较强'
  if (s >= 4) return '一般'
  return '较弱'
}
