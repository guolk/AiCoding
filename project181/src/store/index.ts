import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Account,
  LoginAnomaly,
  AccountDeletion,
  Device,
  AppPermission,
  DeviceLending,
  SecurityHabit,
  Vulnerability,
  LearningRecord,
  SecurityIncident,
  ScoreRecord,
} from '@/types'

interface CyberStore {
  accounts: Account[]
  loginAnomalies: LoginAnomaly[]
  accountDeletions: AccountDeletion[]
  devices: Device[]
  appPermissions: AppPermission[]
  deviceLendings: DeviceLending[]
  securityHabits: SecurityHabit[]
  vulnerabilities: Vulnerability[]
  learningRecords: LearningRecord[]
  securityIncidents: SecurityIncident[]
  scoreHistory: ScoreRecord[]

  addAccount: (account: Account) => void
  updateAccount: (id: string, data: Partial<Account>) => void
  deleteAccount: (id: string) => void

  addLoginAnomaly: (anomaly: LoginAnomaly) => void
  deleteLoginAnomaly: (id: string) => void

  addAccountDeletion: (deletion: AccountDeletion) => void
  updateAccountDeletion: (id: string, data: Partial<AccountDeletion>) => void
  deleteAccountDeletion: (id: string) => void

  addDevice: (device: Device) => void
  updateDevice: (id: string, data: Partial<Device>) => void
  deleteDevice: (id: string) => void

  addAppPermission: (permission: AppPermission) => void
  updateAppPermission: (id: string, data: Partial<AppPermission>) => void
  deleteAppPermission: (id: string) => void

  addDeviceLending: (lending: DeviceLending) => void
  updateDeviceLending: (id: string, data: Partial<DeviceLending>) => void
  deleteDeviceLending: (id: string) => void

  addSecurityHabit: (habit: SecurityHabit) => void
  updateSecurityHabit: (id: string, data: Partial<SecurityHabit>) => void
  deleteSecurityHabit: (id: string) => void

  addVulnerability: (vuln: Vulnerability) => void
  updateVulnerability: (id: string, data: Partial<Vulnerability>) => void
  deleteVulnerability: (id: string) => void

  addLearningRecord: (record: LearningRecord) => void
  updateLearningRecord: (id: string, data: Partial<LearningRecord>) => void
  deleteLearningRecord: (id: string) => void

  addSecurityIncident: (incident: SecurityIncident) => void
  updateSecurityIncident: (id: string, data: Partial<SecurityIncident>) => void
  deleteSecurityIncident: (id: string) => void

  addScoreRecord: (record: ScoreRecord) => void
}

export const useCyberStore = create<CyberStore>()(
  persist(
    (set) => ({
      accounts: [],
      loginAnomalies: [],
      accountDeletions: [],
      devices: [],
      appPermissions: [],
      deviceLendings: [],
      securityHabits: [],
      vulnerabilities: [],
      learningRecords: [],
      securityIncidents: [],
      scoreHistory: [],

      addAccount: (account) => set((s) => ({ accounts: [...s.accounts, account] })),
      updateAccount: (id, data) => set((s) => ({ accounts: s.accounts.map((a) => (a.id === id ? { ...a, ...data, updatedAt: new Date().toISOString() } : a)) })),
      deleteAccount: (id) => set((s) => ({ accounts: s.accounts.filter((a) => a.id !== id) })),

      addLoginAnomaly: (anomaly) => set((s) => ({ loginAnomalies: [...s.loginAnomalies, anomaly] })),
      deleteLoginAnomaly: (id) => set((s) => ({ loginAnomalies: s.loginAnomalies.filter((a) => a.id !== id) })),

      addAccountDeletion: (deletion) => set((s) => ({ accountDeletions: [...s.accountDeletions, deletion] })),
      updateAccountDeletion: (id, data) => set((s) => ({ accountDeletions: s.accountDeletions.map((d) => (d.id === id ? { ...d, ...data } : d)) })),
      deleteAccountDeletion: (id) => set((s) => ({ accountDeletions: s.accountDeletions.filter((d) => d.id !== id) })),

      addDevice: (device) => set((s) => ({ devices: [...s.devices, device] })),
      updateDevice: (id, data) => set((s) => ({ devices: s.devices.map((d) => (d.id === id ? { ...d, ...data } : d)) })),
      deleteDevice: (id) => set((s) => ({ devices: s.devices.filter((d) => d.id !== id) })),

      addAppPermission: (permission) => set((s) => ({ appPermissions: [...s.appPermissions, permission] })),
      updateAppPermission: (id, data) => set((s) => ({ appPermissions: s.appPermissions.map((p) => (p.id === id ? { ...p, ...data } : p)) })),
      deleteAppPermission: (id) => set((s) => ({ appPermissions: s.appPermissions.filter((p) => p.id !== id) })),

      addDeviceLending: (lending) => set((s) => ({ deviceLendings: [...s.deviceLendings, lending] })),
      updateDeviceLending: (id, data) => set((s) => ({ deviceLendings: s.deviceLendings.map((l) => (l.id === id ? { ...l, ...data } : l)) })),
      deleteDeviceLending: (id) => set((s) => ({ deviceLendings: s.deviceLendings.filter((l) => l.id !== id) })),

      addSecurityHabit: (habit) => set((s) => ({ securityHabits: [...s.securityHabits, habit] })),
      updateSecurityHabit: (id, data) => set((s) => ({ securityHabits: s.securityHabits.map((h) => (h.id === id ? { ...h, ...data } : h)) })),
      deleteSecurityHabit: (id) => set((s) => ({ securityHabits: s.securityHabits.filter((h) => h.id !== id) })),

      addVulnerability: (vuln) => set((s) => ({ vulnerabilities: [...s.vulnerabilities, vuln] })),
      updateVulnerability: (id, data) => set((s) => ({ vulnerabilities: s.vulnerabilities.map((v) => (v.id === id ? { ...v, ...data } : v)) })),
      deleteVulnerability: (id) => set((s) => ({ vulnerabilities: s.vulnerabilities.filter((v) => v.id !== id) })),

      addLearningRecord: (record) => set((s) => ({ learningRecords: [...s.learningRecords, record] })),
      updateLearningRecord: (id, data) => set((s) => ({ learningRecords: s.learningRecords.map((r) => (r.id === id ? { ...r, ...data } : r)) })),
      deleteLearningRecord: (id) => set((s) => ({ learningRecords: s.learningRecords.filter((r) => r.id !== id) })),

      addSecurityIncident: (incident) => set((s) => ({ securityIncidents: [...s.securityIncidents, incident] })),
      updateSecurityIncident: (id, data) => set((s) => ({ securityIncidents: s.securityIncidents.map((i) => (i.id === id ? { ...i, ...data } : i)) })),
      deleteSecurityIncident: (id) => set((s) => ({ securityIncidents: s.securityIncidents.filter((i) => i.id !== id) })),

      addScoreRecord: (record) => set((s) => ({ scoreHistory: [...s.scoreHistory, record] })),
    }),
    { name: 'cyberguard-store' }
  )
)
