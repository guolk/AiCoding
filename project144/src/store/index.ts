import { create } from 'zustand'
import type {
  Account,
  BreachRecord,
  SuspiciousLogin,
  DigitalAsset,
  SecurityHabit,
  PasswordHistory,
  EncryptedStorage,
  SecurityScore,
  AuditResult,
  PasswordStrength,
} from '@/types'
import {
  hashPassword,
  deriveKey,
  generateId,
  encryptData,
  decryptData,
  generateSalt,
  generateChecksum,
  verifyChecksum,
} from '@/utils/crypto'
import {
  checkPasswordStrength,
  findDuplicatePasswords,
  isPasswordExpired,
  getDaysUntilExpiry,
} from '@/utils/password'

const STORAGE_KEY = 'guardvault_data'

interface VaultData {
  masterPasswordHash: string
  accounts: Account[]
  breachRecords: BreachRecord[]
  suspiciousLogins: SuspiciousLogin[]
  assets: DigitalAsset[]
  habits: SecurityHabit[]
  passwordHistories: PasswordHistory[]
}

interface AppState {
  isAuthenticated: boolean
  masterPasswordHash: string | null
  encryptionKey: string | null
  accounts: Account[]
  breachRecords: BreachRecord[]
  suspiciousLogins: SuspiciousLogin[]
  assets: DigitalAsset[]
  habits: SecurityHabit[]
  passwordHistories: PasswordHistory[]
  loading: boolean
  error: string | null

  authenticate: (masterPassword: string) => Promise<boolean>
  initializeVault: (masterPassword: string) => Promise<boolean>
  logout: () => void
  loadData: () => Promise<void>
  saveData: () => Promise<void>

  addAccount: (account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateAccount: (id: string, updates: Partial<Account>) => void
  deleteAccount: (id: string) => void
  changeAccountPassword: (accountId: string, newPasswordHash: string, reason: string) => void

  addBreachRecord: (record: Omit<BreachRecord, 'id'>) => void
  updateBreachRecord: (id: string, updates: Partial<BreachRecord>) => void
  deleteBreachRecord: (id: string) => void

  addSuspiciousLogin: (login: Omit<SuspiciousLogin, 'id'>) => void
  deleteSuspiciousLogin: (id: string) => void

  addAsset: (asset: Omit<DigitalAsset, 'id'>) => void
  updateAsset: (id: string, updates: Partial<DigitalAsset>) => void
  deleteAsset: (id: string) => void

  addHabit: (habit: Omit<SecurityHabit, 'id'>) => void
  updateHabit: (id: string, updates: Partial<SecurityHabit>) => void
  completeHabit: (id: string) => void
  deleteHabit: (id: string) => void

  getSecurityScore: () => SecurityScore
  getAuditResult: () => AuditResult
  getUpcomingReminders: () => { habit: SecurityHabit; account?: Account; daysUntil: number }[]
  getTotalAssetValue: () => number
}

const getMockData = (): Omit<VaultData, 'masterPasswordHash'> => {
  const now = new Date()
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

  const accounts: Account[] = [
    {
      id: generateId(),
      platformName: 'GitHub',
      email: 'user@example.com',
      phone: '13800138000',
      registerDate: '2022-01-15',
      purpose: '代码托管和开发协作',
      importanceLevel: 'core',
      cancellationStatus: 'active',
      passwordHash: 'strong_hash_1',
      passwordHint: '工作相关的密码',
      has2FA: true,
      lastPasswordChange: ninetyDaysAgo.toISOString(),
      passwordChangeInterval: 90,
      recoveryEmail: 'backup@example.com',
      recoveryPhone: '13900139000',
      recoveryCodes: ['ABC123', 'DEF456', 'GHI789'],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: generateId(),
      platformName: '支付宝',
      email: 'user@example.com',
      phone: '13800138000',
      registerDate: '2018-06-20',
      purpose: '支付和理财',
      importanceLevel: 'core',
      cancellationStatus: 'active',
      passwordHash: 'strong_hash_2',
      passwordHint: '金融相关密码',
      has2FA: true,
      lastPasswordChange: thirtyDaysAgo.toISOString(),
      passwordChangeInterval: 90,
      recoveryEmail: 'backup@example.com',
      recoveryPhone: '13900139000',
      recoveryCodes: [],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: generateId(),
      platformName: '微信',
      email: '',
      phone: '13800138000',
      registerDate: '2015-03-10',
      purpose: '社交和通讯',
      importanceLevel: 'core',
      cancellationStatus: 'active',
      passwordHash: 'weak_hash_123',
      passwordHint: '社交密码',
      has2FA: false,
      lastPasswordChange: sixtyDaysAgo.toISOString(),
      passwordChangeInterval: 90,
      recoveryEmail: '',
      recoveryPhone: '13900139000',
      recoveryCodes: [],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: generateId(),
      platformName: '某视频网站',
      email: 'user@example.com',
      phone: '',
      registerDate: '2023-08-01',
      purpose: '娱乐观看',
      importanceLevel: 'temporary',
      cancellationStatus: 'pending',
      passwordHash: 'strong_hash_2',
      passwordHint: '娱乐密码',
      has2FA: false,
      lastPasswordChange: '2023-08-01T00:00:00.000Z',
      passwordChangeInterval: 180,
      recoveryEmail: '',
      recoveryPhone: '',
      recoveryCodes: [],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
  ]

  const breachRecords: BreachRecord[] = [
    {
      id: generateId(),
      email: 'user@example.com',
      source: '某大型电商平台',
      breachDate: '2023-12-15',
      description: '用户数据泄露，包含邮箱和密码哈希',
      dataTypes: ['email', 'passwordHash', 'phone'],
      passwordChanged: true,
      changeDate: '2023-12-20',
      verified: true,
    },
  ]

  const suspiciousLogins: SuspiciousLogin[] = [
    {
      id: generateId(),
      accountId: accounts[0].id,
      loginTime: '2024-03-10T14:30:00.000Z',
      location: '北京市',
      device: 'iPhone 15 Pro',
      ipAddress: '192.168.1.100',
      notes: '正常登录',
    },
  ]

  const assets: DigitalAsset[] = [
    {
      id: generateId(),
      type: 'software',
      name: 'JetBrains All Products Pack',
      platform: 'JetBrains',
      bindingAccountId: accounts[0].id,
      purchaseDate: '2024-01-01',
      price: 1299,
      autoRenewal: true,
      renewalDate: '2025-01-01',
      annualFee: 1299,
      notes: '开发工具订阅',
    },
    {
      id: generateId(),
      type: 'subscription',
      name: 'Netflix Premium',
      platform: 'Netflix',
      purchaseDate: '2023-06-01',
      price: 0,
      autoRenewal: true,
      renewalDate: '2024-06-01',
      annualFee: 1188,
      notes: '视频流媒体订阅',
    },
    {
      id: generateId(),
      type: 'balance',
      name: '支付宝余额',
      platform: '支付宝',
      bindingAccountId: accounts[1].id,
      balance: 5280.5,
      currency: 'CNY',
      autoRenewal: false,
      notes: '日常使用余额',
    },
    {
      id: generateId(),
      type: 'game',
      name: 'Steam 游戏库',
      platform: 'Steam',
      purchaseDate: '2020-03-15',
      price: 2580,
      autoRenewal: false,
      notes: '约50款游戏',
    },
  ]

  const habits: SecurityHabit[] = [
    {
      id: generateId(),
      type: 'password_change',
      accountId: accounts[0].id,
      lastCompleted: ninetyDaysAgo.toISOString(),
      nextReminder: new Date(ninetyDaysAgo.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      intervalDays: 90,
      enabled: true,
    },
    {
      id: generateId(),
      type: '2fa_check',
      accountId: accounts[2].id,
      lastCompleted: thirtyDaysAgo.toISOString(),
      nextReminder: new Date(thirtyDaysAgo.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      intervalDays: 7,
      enabled: true,
    },
    {
      id: generateId(),
      type: 'backup',
      lastCompleted: thirtyDaysAgo.toISOString(),
      nextReminder: new Date(thirtyDaysAgo.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      intervalDays: 30,
      enabled: true,
    },
  ]

  const passwordHistories: PasswordHistory[] = [
    {
      id: generateId(),
      accountId: accounts[0].id,
      oldPasswordHash: 'old_hash_1',
      changeDate: ninetyDaysAgo.toISOString(),
      reason: '定期更换密码',
    },
  ]

  return {
    accounts,
    breachRecords,
    suspiciousLogins,
    assets,
    habits,
    passwordHistories,
  }
}

export const useAppStore = create<AppState>((set, get) => ({
  isAuthenticated: false,
  masterPasswordHash: null,
  encryptionKey: null,
  accounts: [],
  breachRecords: [],
  suspiciousLogins: [],
  assets: [],
  habits: [],
  passwordHistories: [],
  loading: false,
  error: null,

  authenticate: async (masterPassword: string): Promise<boolean> => {
    try {
      set({ loading: true, error: null })

      const storedData = localStorage.getItem(STORAGE_KEY)

      if (!storedData) {
        set({ loading: false })
        return false
      }

      const encryptedStorage: EncryptedStorage = JSON.parse(storedData)
      const { salt, encryptedData, iv, checksum } = encryptedStorage

      const key = deriveKey(masterPassword, salt)
      const { hash: computedHash } = hashPassword(masterPassword, salt)

      if (!verifyChecksum(encryptedData, key, checksum)) {
        set({ loading: false, error: '数据校验失败，可能已被篡改' })
        return false
      }

      const decrypted = decryptData(encryptedData, key, iv) as VaultData

      if (decrypted.masterPasswordHash !== computedHash) {
        set({ loading: false, error: '密码错误' })
        return false
      }

      set({
        isAuthenticated: true,
        masterPasswordHash: computedHash,
        encryptionKey: key,
        accounts: decrypted.accounts,
        breachRecords: decrypted.breachRecords,
        suspiciousLogins: decrypted.suspiciousLogins,
        assets: decrypted.assets,
        habits: decrypted.habits,
        passwordHistories: decrypted.passwordHistories,
        loading: false,
      })

      return true
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : '认证失败',
      })
      return false
    }
  },

  initializeVault: async (masterPassword: string): Promise<boolean> => {
    try {
      set({ loading: true, error: null })

      const salt = generateSalt()
      const { hash } = hashPassword(masterPassword, salt)
      const key = deriveKey(masterPassword, salt)

      const mockData = getMockData()
      const vaultData: VaultData = {
        masterPasswordHash: hash,
        ...mockData,
      }

      const { encryptedData, iv } = encryptData(vaultData, key)
      const checksum = generateChecksum(encryptedData, key)

      const encryptedStorage: EncryptedStorage = {
        version: 1,
        encryptedData,
        salt,
        iv,
        checksum,
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(encryptedStorage))

      set({
        isAuthenticated: true,
        masterPasswordHash: hash,
        encryptionKey: key,
        accounts: vaultData.accounts,
        breachRecords: vaultData.breachRecords,
        suspiciousLogins: vaultData.suspiciousLogins,
        assets: vaultData.assets,
        habits: vaultData.habits,
        passwordHistories: vaultData.passwordHistories,
        loading: false,
      })

      return true
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : '初始化保险库失败',
      })
      return false
    }
  },

  logout: () => {
    set({
      isAuthenticated: false,
      masterPasswordHash: null,
      encryptionKey: null,
      accounts: [],
      breachRecords: [],
      suspiciousLogins: [],
      assets: [],
      habits: [],
      passwordHistories: [],
      error: null,
    })
  },

  loadData: async (): Promise<void> => {
    try {
      set({ loading: true, error: null })

      const storedData = localStorage.getItem(STORAGE_KEY)
      if (!storedData) {
        set({ loading: false })
        return
      }

      const encryptedStorage: EncryptedStorage = JSON.parse(storedData)
      const { encryptedData, iv, checksum } = encryptedStorage
      const key = get().encryptionKey

      if (!key) {
        set({ loading: false, error: '未登录，无法加载数据' })
        return
      }

      if (!verifyChecksum(encryptedData, key, checksum)) {
        set({ loading: false, error: '数据校验失败' })
        return
      }

      const decrypted = decryptData(encryptedData, key, iv) as VaultData

      set({
        accounts: decrypted.accounts,
        breachRecords: decrypted.breachRecords,
        suspiciousLogins: decrypted.suspiciousLogins,
        assets: decrypted.assets,
        habits: decrypted.habits,
        passwordHistories: decrypted.passwordHistories,
        loading: false,
      })
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : '加载数据失败',
      })
    }
  },

  saveData: async (): Promise<void> => {
    try {
      set({ loading: true, error: null })

      const state = get()
      if (!state.encryptionKey || !state.masterPasswordHash) {
        set({ loading: false, error: '未登录，无法保存数据' })
        return
      }

      const vaultData: VaultData = {
        masterPasswordHash: state.masterPasswordHash,
        accounts: state.accounts,
        breachRecords: state.breachRecords,
        suspiciousLogins: state.suspiciousLogins,
        assets: state.assets,
        habits: state.habits,
        passwordHistories: state.passwordHistories,
      }

      const salt = generateSalt()
      const { encryptedData, iv } = encryptData(vaultData, state.encryptionKey)
      const checksum = generateChecksum(encryptedData, state.encryptionKey)

      const encryptedStorage: EncryptedStorage = {
        version: 1,
        encryptedData,
        salt,
        iv,
        checksum,
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(encryptedStorage))
      set({ loading: false })
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : '保存数据失败',
      })
    }
  },

  addAccount: (account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString()
    const newAccount: Account = {
      ...account,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    }
    set((state) => ({ accounts: [...state.accounts, newAccount] }))
    get().saveData()
  },

  updateAccount: (id: string, updates: Partial<Account>) => {
    const now = new Date().toISOString()
    set((state) => ({
      accounts: state.accounts.map((acc) =>
        acc.id === id ? { ...acc, ...updates, updatedAt: now } : acc
      ),
    }))
    get().saveData()
  },

  deleteAccount: (id: string) => {
    set((state) => ({
      accounts: state.accounts.filter((acc) => acc.id !== id),
    }))
    get().saveData()
  },

  changeAccountPassword: (accountId: string, newPasswordHash: string, reason: string) => {
    const now = new Date().toISOString()
    const account = get().accounts.find((acc) => acc.id === accountId)

    if (!account) return

    const historyRecord: PasswordHistory = {
      id: generateId(),
      accountId,
      oldPasswordHash: account.passwordHash,
      changeDate: now,
      reason,
    }

    set((state) => ({
      accounts: state.accounts.map((acc) =>
        acc.id === accountId
          ? { ...acc, passwordHash: newPasswordHash, lastPasswordChange: now, updatedAt: now }
          : acc
      ),
      passwordHistories: [...state.passwordHistories, historyRecord],
    }))
    get().saveData()
  },

  addBreachRecord: (record: Omit<BreachRecord, 'id'>) => {
    const newRecord: BreachRecord = {
      ...record,
      id: generateId(),
    }
    set((state) => ({ breachRecords: [...state.breachRecords, newRecord] }))
    get().saveData()
  },

  updateBreachRecord: (id: string, updates: Partial<BreachRecord>) => {
    set((state) => ({
      breachRecords: state.breachRecords.map((record) =>
        record.id === id ? { ...record, ...updates } : record
      ),
    }))
    get().saveData()
  },

  deleteBreachRecord: (id: string) => {
    set((state) => ({
      breachRecords: state.breachRecords.filter((record) => record.id !== id),
    }))
    get().saveData()
  },

  addSuspiciousLogin: (login: Omit<SuspiciousLogin, 'id'>) => {
    const newLogin: SuspiciousLogin = {
      ...login,
      id: generateId(),
    }
    set((state) => ({ suspiciousLogins: [...state.suspiciousLogins, newLogin] }))
    get().saveData()
  },

  deleteSuspiciousLogin: (id: string) => {
    set((state) => ({
      suspiciousLogins: state.suspiciousLogins.filter((login) => login.id !== id),
    }))
    get().saveData()
  },

  addAsset: (asset: Omit<DigitalAsset, 'id'>) => {
    const newAsset: DigitalAsset = {
      ...asset,
      id: generateId(),
    }
    set((state) => ({ assets: [...state.assets, newAsset] }))
    get().saveData()
  },

  updateAsset: (id: string, updates: Partial<DigitalAsset>) => {
    set((state) => ({
      assets: state.assets.map((asset) =>
        asset.id === id ? { ...asset, ...updates } : asset
      ),
    }))
    get().saveData()
  },

  deleteAsset: (id: string) => {
    set((state) => ({
      assets: state.assets.filter((asset) => asset.id !== id),
    }))
    get().saveData()
  },

  addHabit: (habit: Omit<SecurityHabit, 'id'>) => {
    const newHabit: SecurityHabit = {
      ...habit,
      id: generateId(),
    }
    set((state) => ({ habits: [...state.habits, newHabit] }))
    get().saveData()
  },

  updateHabit: (id: string, updates: Partial<SecurityHabit>) => {
    set((state) => ({
      habits: state.habits.map((habit) =>
        habit.id === id ? { ...habit, ...updates } : habit
      ),
    }))
    get().saveData()
  },

  completeHabit: (id: string) => {
    const now = new Date()
    set((state) => ({
      habits: state.habits.map((habit) => {
        if (habit.id !== id) return habit
        const nextReminder = new Date(now)
        nextReminder.setDate(nextReminder.getDate() + habit.intervalDays)
        return {
          ...habit,
          lastCompleted: now.toISOString(),
          nextReminder: nextReminder.toISOString(),
        }
      }),
    }))
    get().saveData()
  },

  deleteHabit: (id: string) => {
    set((state) => ({
      habits: state.habits.filter((habit) => habit.id !== id),
    }))
    get().saveData()
  },

  getSecurityScore: (): SecurityScore => {
    const state = get()
    const { accounts, breachRecords, habits } = state

    if (accounts.length === 0) {
      return {
        overall: 0,
        passwordStrength: 'weak',
        twoFactorUsage: 0,
        breachExposure: 0,
        habitCompliance: 0,
      }
    }

    const passwordScores = accounts.map((acc) => {
      const result = checkPasswordStrength(acc.passwordHash)
      return result.score
    })
    const avgPasswordScore = passwordScores.reduce((a, b) => a + b, 0) / passwordScores.length
    const passwordStrengthPercent = (avgPasswordScore / 5) * 100

    let overallPasswordStrength: PasswordStrength = 'weak'
    if (avgPasswordScore >= 4.5) overallPasswordStrength = 'strong'
    else if (avgPasswordScore >= 3.5) overallPasswordStrength = 'good'
    else if (avgPasswordScore >= 2) overallPasswordStrength = 'fair'

    const twoFactorEnabled = accounts.filter((acc) => acc.has2FA).length
    const twoFactorUsage = (twoFactorEnabled / accounts.length) * 100

    const verifiedBreaches = breachRecords.filter((b) => b.verified && !b.passwordChanged).length
    const breachExposure = Math.max(0, 100 - verifiedBreaches * 20)

    const now = new Date()
    const compliantHabits = habits.filter((h) => {
      if (!h.enabled) return true
      const nextReminder = new Date(h.nextReminder)
      return nextReminder >= now
    }).length
    const habitCompliance = habits.length > 0 ? (compliantHabits / habits.length) * 100 : 100

    const overall = Math.round(
      passwordStrengthPercent * 0.35 +
        twoFactorUsage * 0.25 +
        breachExposure * 0.2 +
        habitCompliance * 0.2
    )

    return {
      overall: Math.max(0, Math.min(100, overall)),
      passwordStrength: overallPasswordStrength,
      twoFactorUsage: Math.round(twoFactorUsage),
      breachExposure: Math.round(breachExposure),
      habitCompliance: Math.round(habitCompliance),
    }
  },

  getAuditResult: (): AuditResult => {
    const state = get()
    const { accounts } = state

    const weakPasswords = accounts.filter((acc) => {
      const result = checkPasswordStrength(acc.passwordHash)
      return result.strength === 'weak'
    })

    const passwordHashes = accounts.map((acc) => ({
      accountId: acc.id,
      passwordHash: acc.passwordHash,
    }))
    const duplicatePasswords = findDuplicatePasswords(passwordHashes)

    const missing2FA = accounts.filter((acc) => !acc.has2FA && acc.importanceLevel === 'core')

    const expiredPasswords = accounts.filter((acc) =>
      isPasswordExpired(acc.lastPasswordChange, acc.passwordChangeInterval)
    )

    return {
      weakPasswords,
      duplicatePasswords,
      missing2FA,
      expiredPasswords,
    }
  },

  getUpcomingReminders: () => {
    const state = get()
    const { habits, accounts } = state

    return habits
      .filter((habit) => habit.enabled)
      .map((habit) => {
        const account = habit.accountId
          ? accounts.find((acc) => acc.id === habit.accountId)
          : undefined
        const daysUntil = Math.min(
          getDaysUntilExpiry(habit.lastCompleted, habit.intervalDays),
          Math.ceil(
            (new Date(habit.nextReminder).getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
        return {
          habit,
          account,
          daysUntil,
        }
      })
      .filter((r) => r.daysUntil <= 30)
      .sort((a, b) => a.daysUntil - b.daysUntil)
  },

  getTotalAssetValue: (): number => {
    const state = get()
    const { assets } = state

    return assets.reduce((total, asset) => {
      if (asset.balance !== undefined) {
        return total + asset.balance
      }
      if (asset.price !== undefined) {
        return total + asset.price
      }
      return total
    }, 0)
  },
}))
