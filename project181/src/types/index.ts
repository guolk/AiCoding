export interface Account {
  id: string
  name: string
  platform: string
  twoFactorEnabled: boolean
  passwordStrength: 'weak' | 'medium' | 'strong'
  lastPasswordChange: string
  phoneValid: boolean
  emailValid: boolean
  status: 'active' | 'inactive' | 'pending_deletion' | 'deleted'
  createdAt: string
  updatedAt: string
}

export interface LoginAnomaly {
  id: string
  accountId: string
  time: string
  location: string
  device: string
  riskLevel: 'low' | 'medium' | 'high'
  description: string
}

export interface AccountDeletion {
  id: string
  accountId: string
  status: 'pending' | 'in_progress' | 'completed'
  requestDate: string
  completionDate: string
  notes: string
}

export interface Device {
  id: string
  name: string
  type: 'laptop' | 'desktop' | 'phone' | 'tablet' | 'other'
  osVersion: string
  osUpdated: boolean
  antivirusActive: boolean
  screenLockEnabled: boolean
  diskEncrypted: boolean
  createdAt: string
}

export interface AppPermission {
  id: string
  deviceId: string
  appName: string
  permission: string
  isNecessary: boolean
  riskLevel: 'low' | 'medium' | 'high'
}

export interface DeviceLending {
  id: string
  deviceId: string
  lentTo: string
  lentDate: string
  returnDate: string
  returned: boolean
  notes: string
}

export interface SecurityHabit {
  id: string
  name: string
  category: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  lastChecked: string
  isCompleted: boolean
  streak: number
}

export interface Vulnerability {
  id: string
  title: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  status: 'discovered' | 'investigating' | 'fixing' | 'fixed'
  discoveredDate: string
  fixedDate: string
}

export interface LearningRecord {
  id: string
  title: string
  category: string
  content: string
  learnedDate: string
  source: string
}

export interface SecurityIncident {
  id: string
  type: 'account_hacked' | 'data_breach' | 'phishing' | 'malware' | 'other'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  occurredDate: string
  resolution: string
  lessons: string
  followUpMeasures: string[]
  status: 'ongoing' | 'resolved'
}

export interface ScoreRecord {
  date: string
  overall: number
  accounts: number
  devices: number
  habits: number
}

export type PasswordStrength = 'weak' | 'medium' | 'strong'
export type RiskLevel = 'low' | 'medium' | 'high'
export type Severity = 'low' | 'medium' | 'high' | 'critical'
