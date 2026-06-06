export type ImportanceLevel = 'core' | 'daily' | 'temporary'

export type CancellationStatus = 'active' | 'pending' | 'cancelled' | 'impossible'

export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong'

export type AssetType = 'software' | 'game' | 'music' | 'ebook' | 'balance' | 'subscription'

export type HabitType = 'password_change' | '2fa_check' | 'backup'

export interface Account {
  id: string
  platformName: string
  email: string
  phone: string
  registerDate: string
  purpose: string
  importanceLevel: ImportanceLevel
  cancellationStatus: CancellationStatus
  passwordHash: string
  passwordHint: string
  has2FA: boolean
  lastPasswordChange: string
  passwordChangeInterval: number
  recoveryEmail: string
  recoveryPhone: string
  recoveryCodes: string[]
  createdAt: string
  updatedAt: string
}

export interface BreachRecord {
  id: string
  email: string
  source: string
  breachDate: string
  description: string
  dataTypes: string[]
  passwordChanged: boolean
  changeDate?: string
  verified: boolean
}

export interface SuspiciousLogin {
  id: string
  accountId: string
  loginTime: string
  location: string
  device: string
  ipAddress: string
  notes: string
}

export interface DigitalAsset {
  id: string
  type: AssetType
  name: string
  platform: string
  bindingAccountId?: string
  purchaseDate?: string
  price?: number
  balance?: number
  currency?: string
  renewalDate?: string
  autoRenewal: boolean
  annualFee?: number
  notes: string
}

export interface SecurityHabit {
  id: string
  type: HabitType
  accountId?: string
  lastCompleted: string
  nextReminder: string
  intervalDays: number
  enabled: boolean
}

export interface PasswordHistory {
  id: string
  accountId: string
  oldPasswordHash: string
  changeDate: string
  reason: string
}

export interface EncryptedStorage {
  version: number
  encryptedData: string
  salt: string
  iv: string
  checksum: string
}

export interface SecurityScore {
  overall: number
  passwordStrength: PasswordStrength
  twoFactorUsage: number
  breachExposure: number
  habitCompliance: number
}

export interface AuditResult {
  weakPasswords: Account[]
  duplicatePasswords: string[][]
  missing2FA: Account[]
  expiredPasswords: Account[]
}
