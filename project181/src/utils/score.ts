import type { Account, Device, SecurityHabit, Vulnerability, SecurityIncident } from '@/types'

export function calculateAccountScore(accounts: Account[]): number {
  if (accounts.length === 0) return 50
  let total = 0
  accounts.forEach((a) => {
    let score = 0
    if (a.twoFactorEnabled) score += 25
    if (a.passwordStrength === 'strong') score += 25
    else if (a.passwordStrength === 'medium') score += 15
    if (a.phoneValid) score += 12
    if (a.emailValid) score += 13
    const daysSinceChange = a.lastPasswordChange
      ? Math.floor((Date.now() - new Date(a.lastPasswordChange).getTime()) / 86400000)
      : 365
    if (daysSinceChange < 90) score += 25
    else if (daysSinceChange < 180) score += 15
    else if (daysSinceChange < 365) score += 5
    total += Math.min(100, score)
  })
  return Math.round(total / accounts.length)
}

export function calculateDeviceScore(devices: Device[]): number {
  if (devices.length === 0) return 50
  let total = 0
  devices.forEach((d) => {
    let score = 0
    if (d.osUpdated) score += 25
    if (d.antivirusActive) score += 25
    if (d.screenLockEnabled) score += 25
    if (d.diskEncrypted) score += 25
    total += score
  })
  return Math.round(total / devices.length)
}

export function calculateHabitScore(habits: SecurityHabit[], vulns: Vulnerability[]): number {
  let habitPart = 50
  if (habits.length > 0) {
    const completed = habits.filter((h) => h.isCompleted).length
    habitPart = Math.round((completed / habits.length) * 70)
  }

  let vulnPart = 30
  if (vulns.length > 0) {
    const fixed = vulns.filter((v) => v.status === 'fixed').length
    vulnPart = Math.round((fixed / vulns.length) * 30)
  }

  return Math.min(100, habitPart + vulnPart)
}

export function calculateIncidentScore(incidents: SecurityIncident[]): number {
  if (incidents.length === 0) return 100
  const resolved = incidents.filter((i) => i.status === 'resolved').length
  return Math.round((resolved / incidents.length) * 100)
}

export function calculateOverallScore(
  accountScore: number,
  deviceScore: number,
  habitScore: number,
  incidentScore: number
): number {
  return Math.round(accountScore * 0.3 + deviceScore * 0.25 + habitScore * 0.25 + incidentScore * 0.2)
}

export function getScoreLevel(score: number): { label: string; color: string; className: string } {
  if (score >= 80) return { label: '安全', color: '#00ff88', className: 'text-cyber-green' }
  if (score >= 60) return { label: '良好', color: '#00d4ff', className: 'text-cyber-blue' }
  if (score >= 40) return { label: '需改善', color: '#ffb800', className: 'text-cyber-amber' }
  return { label: '高危', color: '#ff3366', className: 'text-cyber-red' }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

export function formatDateTime(dateStr: string): string {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export function daysBetween(dateStr: string): number {
  if (!dateStr) return 999
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
}
