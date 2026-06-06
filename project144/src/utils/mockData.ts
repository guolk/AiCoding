import {
  Account,
  BreachRecord,
  SuspiciousLogin,
  DigitalAsset,
  SecurityHabit,
  PasswordHistory,
  ImportanceLevel,
  CancellationStatus,
  AssetType,
  HabitType
} from '@/types'
import { generateId, hashPassword } from '@/utils/crypto'

const getMockHash = (password: string): string => {
  return hashPassword(password).hash
}

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0]
}

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

const commonPasswords = ['Password123!', '123456', 'qwerty', 'admin123', 'letmein']

export const generateMockAccounts = (): Account[] => {
  const now = new Date('2026-06-06')
  const twoYearsAgo = addDays(now, -730)
  const oneYearAgo = addDays(now, -365)
  const sixMonthsAgo = addDays(now, -180)
  const threeMonthsAgo = addDays(now, -90)
  const oneMonthAgo = addDays(now, -30)

  const accounts: Account[] = [
    {
      id: generateId(),
      platformName: 'Gmail',
      email: 'user@gmail.com',
      phone: '+86 138****1234',
      registerDate: formatDate(twoYearsAgo),
      purpose: '主要邮箱，用于重要通信和账号注册',
      importanceLevel: 'core' as ImportanceLevel,
      cancellationStatus: 'active' as CancellationStatus,
      passwordHash: getMockHash('MyGmailP@ss2026'),
      passwordHint: '包含Gmail和年份',
      has2FA: true,
      lastPasswordChange: formatDate(threeMonthsAgo),
      passwordChangeInterval: 90,
      recoveryEmail: 'backup@outlook.com',
      recoveryPhone: '+86 139****5678',
      recoveryCodes: ['ABCD-EFGH', 'IJKL-MNOP', 'QRST-UVWX'],
      createdAt: formatDate(twoYearsAgo),
      updatedAt: formatDate(threeMonthsAgo)
    },
    {
      id: generateId(),
      platformName: 'Apple ID',
      email: 'user@icloud.com',
      phone: '+86 138****1234',
      registerDate: formatDate(addDays(now, -500)),
      purpose: 'Apple设备同步、App Store、iCloud备份',
      importanceLevel: 'core' as ImportanceLevel,
      cancellationStatus: 'active' as CancellationStatus,
      passwordHash: getMockHash('AppleID#Secure2026'),
      passwordHint: 'Apple相关，含特殊字符',
      has2FA: true,
      lastPasswordChange: formatDate(sixMonthsAgo),
      passwordChangeInterval: 180,
      recoveryEmail: 'backup@outlook.com',
      recoveryPhone: '+86 139****5678',
      recoveryCodes: ['123456', '789012', '345678'],
      createdAt: formatDate(addDays(now, -500)),
      updatedAt: formatDate(sixMonthsAgo)
    },
    {
      id: generateId(),
      platformName: '支付宝',
      email: 'user@gmail.com',
      phone: '+86 138****1234',
      registerDate: formatDate(addDays(now, -600)),
      purpose: '日常支付、理财、转账',
      importanceLevel: 'core' as ImportanceLevel,
      cancellationStatus: 'active' as CancellationStatus,
      passwordHash: getMockHash('Alipay$Money2026'),
      passwordHint: '支付相关，含金额符号',
      has2FA: true,
      lastPasswordChange: formatDate(oneMonthAgo),
      passwordChangeInterval: 60,
      recoveryEmail: '',
      recoveryPhone: '+86 138****1234',
      recoveryCodes: [],
      createdAt: formatDate(addDays(now, -600)),
      updatedAt: formatDate(oneMonthAgo)
    },
    {
      id: generateId(),
      platformName: '微信',
      email: '',
      phone: '+86 138****1234',
      registerDate: formatDate(addDays(now, -800)),
      purpose: '社交、支付、小程序',
      importanceLevel: 'core' as ImportanceLevel,
      cancellationStatus: 'active' as CancellationStatus,
      passwordHash: getMockHash('WeChat!2026'),
      passwordHint: '社交应用，含年份',
      has2FA: false,
      lastPasswordChange: formatDate(oneYearAgo),
      passwordChangeInterval: 365,
      recoveryEmail: '',
      recoveryPhone: '+86 138****1234',
      recoveryCodes: [],
      createdAt: formatDate(addDays(now, -800)),
      updatedAt: formatDate(oneYearAgo)
    },
    {
      id: generateId(),
      platformName: 'GitHub',
      email: 'user@gmail.com',
      phone: '',
      registerDate: formatDate(addDays(now, -400)),
      purpose: '代码仓库、开源项目、技术博客',
      importanceLevel: 'daily' as ImportanceLevel,
      cancellationStatus: 'active' as CancellationStatus,
      passwordHash: getMockHash('GitHub@Code2026'),
      passwordHint: '代码平台，含@符号',
      has2FA: true,
      lastPasswordChange: formatDate(threeMonthsAgo),
      passwordChangeInterval: 90,
      recoveryEmail: 'backup@outlook.com',
      recoveryPhone: '',
      recoveryCodes: ['GH-123456', 'GH-789012', 'GH-345678'],
      createdAt: formatDate(addDays(now, -400)),
      updatedAt: formatDate(threeMonthsAgo)
    },
    {
      id: generateId(),
      platformName: 'Twitter/X',
      email: 'user@gmail.com',
      phone: '+86 138****1234',
      registerDate: formatDate(addDays(now, -300)),
      purpose: '社交媒体、资讯获取',
      importanceLevel: 'daily' as ImportanceLevel,
      cancellationStatus: 'active' as CancellationStatus,
      passwordHash: getMockHash('Twitter#2026'),
      passwordHint: '原Twitter，含#',
      has2FA: false,
      lastPasswordChange: formatDate(addDays(now, -100)),
      passwordChangeInterval: 120,
      recoveryEmail: '',
      recoveryPhone: '+86 138****1234',
      recoveryCodes: [],
      createdAt: formatDate(addDays(now, -300)),
      updatedAt: formatDate(addDays(now, -100))
    },
    {
      id: generateId(),
      platformName: 'LinkedIn',
      email: 'user@gmail.com',
      phone: '',
      registerDate: formatDate(addDays(now, -350)),
      purpose: '职业社交、求职招聘',
      importanceLevel: 'daily' as ImportanceLevel,
      cancellationStatus: 'active' as CancellationStatus,
      passwordHash: getMockHash('LinkedIn$Career'),
      passwordHint: '职业相关',
      has2FA: true,
      lastPasswordChange: formatDate(addDays(now, -120)),
      passwordChangeInterval: 120,
      recoveryEmail: 'backup@outlook.com',
      recoveryPhone: '',
      recoveryCodes: [],
      createdAt: formatDate(addDays(now, -350)),
      updatedAt: formatDate(addDays(now, -120))
    },
    {
      id: generateId(),
      platformName: 'Netflix',
      email: 'user@gmail.com',
      phone: '',
      registerDate: formatDate(addDays(now, -200)),
      purpose: '视频流媒体娱乐',
      importanceLevel: 'daily' as ImportanceLevel,
      cancellationStatus: 'pending' as CancellationStatus,
      passwordHash: getMockHash('Netflix&Chill2026'),
      passwordHint: '视频平台，含&',
      has2FA: false,
      lastPasswordChange: formatDate(addDays(now, -200)),
      passwordChangeInterval: 180,
      recoveryEmail: '',
      recoveryPhone: '',
      recoveryCodes: [],
      createdAt: formatDate(addDays(now, -200)),
      updatedAt: formatDate(addDays(now, -200))
    },
    {
      id: generateId(),
      platformName: '某论坛',
      email: 'user+forum@gmail.com',
      phone: '',
      registerDate: formatDate(addDays(now, -150)),
      purpose: '技术论坛讨论',
      importanceLevel: 'temporary' as ImportanceLevel,
      cancellationStatus: 'active' as CancellationStatus,
      passwordHash: getMockHash('Forum123!'),
      passwordHint: '简单论坛密码',
      has2FA: false,
      lastPasswordChange: formatDate(addDays(now, -150)),
      passwordChangeInterval: 365,
      recoveryEmail: '',
      recoveryPhone: '',
      recoveryCodes: [],
      createdAt: formatDate(addDays(now, -150)),
      updatedAt: formatDate(addDays(now, -150))
    },
    {
      id: generateId(),
      platformName: '某外卖平台',
      email: 'user@gmail.com',
      phone: '+86 138****1234',
      registerDate: formatDate(addDays(now, -100)),
      purpose: '外卖点餐',
      importanceLevel: 'temporary' as ImportanceLevel,
      cancellationStatus: 'active' as CancellationStatus,
      passwordHash: getMockHash('Takeout@2026'),
      passwordHint: '外卖相关',
      has2FA: false,
      lastPasswordChange: formatDate(addDays(now, -100)),
      passwordChangeInterval: 365,
      recoveryEmail: '',
      recoveryPhone: '+86 138****1234',
      recoveryCodes: [],
      createdAt: formatDate(addDays(now, -100)),
      updatedAt: formatDate(addDays(now, -100))
    },
    {
      id: generateId(),
      platformName: '某购物网站',
      email: 'user+shop@gmail.com',
      phone: '+86 138****1234',
      registerDate: formatDate(addDays(now, -60)),
      purpose: '偶尔购物',
      importanceLevel: 'temporary' as ImportanceLevel,
      cancellationStatus: 'cancelled' as CancellationStatus,
      passwordHash: getMockHash('Shopping#123'),
      passwordHint: '购物网站，弱密码',
      has2FA: false,
      lastPasswordChange: formatDate(addDays(now, -60)),
      passwordChangeInterval: 365,
      recoveryEmail: '',
      recoveryPhone: '',
      recoveryCodes: [],
      createdAt: formatDate(addDays(now, -60)),
      updatedAt: formatDate(addDays(now, -30))
    },
    {
      id: generateId(),
      platformName: '某游戏',
      email: 'user+game@gmail.com',
      phone: '',
      registerDate: formatDate(addDays(now, -45)),
      purpose: '休闲游戏',
      importanceLevel: 'temporary' as ImportanceLevel,
      cancellationStatus: 'active' as CancellationStatus,
      passwordHash: getMockHash('Game123456!'),
      passwordHint: '游戏账号',
      has2FA: false,
      lastPasswordChange: formatDate(addDays(now, -45)),
      passwordChangeInterval: 365,
      recoveryEmail: '',
      recoveryPhone: '',
      recoveryCodes: [],
      createdAt: formatDate(addDays(now, -45)),
      updatedAt: formatDate(addDays(now, -45))
    }
  ]

  return accounts
}

export const generateMockBreachRecords = (): BreachRecord[] => {
  const now = new Date('2026-06-06')

  const records: BreachRecord[] = [
    {
      id: generateId(),
      email: 'user@gmail.com',
      source: 'LinkedIn 2021数据泄露',
      breachDate: formatDate(addDays(now, -1800)),
      description: '超过7亿用户数据在暗网出售，包含邮箱、密码哈希、个人信息',
      dataTypes: ['邮箱', '密码哈希', '姓名', '电话号码'],
      passwordChanged: true,
      changeDate: formatDate(addDays(now, -1700)),
      verified: true
    },
    {
      id: generateId(),
      email: 'user@gmail.com',
      source: 'Twitter 2022数据泄露',
      breachDate: formatDate(addDays(now, -1200)),
      description: '540万用户数据泄露，包含邮箱、用户名、位置信息',
      dataTypes: ['邮箱', '用户名', '位置', '粉丝数'],
      passwordChanged: true,
      changeDate: formatDate(addDays(now, -1150)),
      verified: true
    },
    {
      id: generateId(),
      email: 'user@icloud.com',
      source: 'Apple iCloud 2023泄露事件',
      breachDate: formatDate(addDays(now, -900)),
      description: '部分iCloud账户被非法访问，可能涉及照片和文档',
      dataTypes: ['邮箱', '密码哈希', '云端文件'],
      passwordChanged: true,
      changeDate: formatDate(addDays(now, -890)),
      verified: true
    },
    {
      id: generateId(),
      email: 'user@gmail.com',
      source: 'GitHub 2024代码仓库泄露',
      breachDate: formatDate(addDays(now, -365)),
      description: '公开仓库中意外提交敏感信息，包含API密钥',
      dataTypes: ['邮箱', 'API密钥', '代码仓库'],
      passwordChanged: false,
      verified: true
    },
    {
      id: generateId(),
      email: 'user+shop@gmail.com',
      source: '某电商平台2025数据泄露',
      breachDate: formatDate(addDays(now, -120)),
      description: '第三方支付接口漏洞导致用户信息泄露',
      dataTypes: ['邮箱', '收货地址', '订单记录'],
      passwordChanged: false,
      verified: false
    }
  ]

  return records
}

export const generateMockSuspiciousLogins = (): SuspiciousLogin[] => {
  const now = new Date('2026-06-06')

  const logins: SuspiciousLogin[] = [
    {
      id: generateId(),
      accountId: '',
      loginTime: formatDate(addDays(now, -7)) + ' 02:34:56',
      location: '俄罗斯 莫斯科',
      device: 'Windows 11 - Chrome 125.0',
      ipAddress: '95.173.xxx.xxx',
      notes: '凌晨从俄罗斯登录，非本人操作，已冻结账号'
    },
    {
      id: generateId(),
      accountId: '',
      loginTime: formatDate(addDays(now, -3)) + ' 18:22:10',
      location: '中国 深圳',
      device: 'iPhone 15 Pro - Safari',
      ipAddress: '113.87.xxx.xxx',
      notes: '新设备首次登录，已通过验证，确认为本人操作'
    },
    {
      id: generateId(),
      accountId: '',
      loginTime: formatDate(addDays(now, -1)) + ' 09:15:33',
      location: '美国 加利福尼亚州',
      device: 'Linux Ubuntu 22.04 - Firefox 126.0',
      ipAddress: '204.15.xxx.xxx',
      notes: 'VPN登录，地点与常用地不符，已通过2FA验证'
    }
  ]

  const accounts = generateMockAccounts()
  logins[0].accountId = accounts[0].id
  logins[1].accountId = accounts[2].id
  logins[2].accountId = accounts[4].id

  return logins
}

export const generateMockAssets = (): DigitalAsset[] => {
  const now = new Date('2026-06-06')
  const accounts = generateMockAccounts()

  const gmailAccount = accounts.find(a => a.platformName === 'Gmail')!
  const wechatAccount = accounts.find(a => a.platformName === '微信')!
  const alipayAccount = accounts.find(a => a.platformName === '支付宝')!
  const netflixAccount = accounts.find(a => a.platformName === 'Netflix')!
  const appleAccount = accounts.find(a => a.platformName === 'Apple ID')!

  const assets: DigitalAsset[] = [
    {
      id: generateId(),
      type: 'software' as AssetType,
      name: 'Office 365 家庭版',
      platform: 'Microsoft',
      bindingAccountId: gmailAccount.id,
      purchaseDate: formatDate(addDays(now, -365)),
      price: 398,
      currency: 'CNY',
      renewalDate: formatDate(addDays(now, 30)),
      autoRenewal: true,
      annualFee: 398,
      notes: '包含Word、Excel、PowerPoint、Outlook等，支持6人共享'
    },
    {
      id: generateId(),
      type: 'software' as AssetType,
      name: 'Adobe Photoshop',
      platform: 'Adobe',
      bindingAccountId: gmailAccount.id,
      purchaseDate: formatDate(addDays(now, -200)),
      price: 888,
      currency: 'CNY',
      renewalDate: formatDate(addDays(now, 165)),
      autoRenewal: true,
      annualFee: 888,
      notes: '摄影后期处理，包含Lightroom'
    },
    {
      id: generateId(),
      type: 'software' as AssetType,
      name: 'IntelliJ IDEA Ultimate',
      platform: 'JetBrains',
      bindingAccountId: gmailAccount.id,
      purchaseDate: formatDate(addDays(now, -150)),
      price: 1599,
      currency: 'CNY',
      renewalDate: formatDate(addDays(now, 215)),
      autoRenewal: true,
      annualFee: 1599,
      notes: 'Java/Kotlin开发IDE，已激活'
    },
    {
      id: generateId(),
      type: 'game' as AssetType,
      name: 'Steam游戏库',
      platform: 'Steam',
      bindingAccountId: gmailAccount.id,
      purchaseDate: formatDate(addDays(now, -500)),
      price: 2580,
      balance: 128.50,
      currency: 'CNY',
      autoRenewal: false,
      notes: '包含42款游戏，总价值约2580元'
    },
    {
      id: generateId(),
      type: 'game' as AssetType,
      name: 'Epic Games游戏库',
      platform: 'Epic Games',
      bindingAccountId: gmailAccount.id,
      purchaseDate: formatDate(addDays(now, -400)),
      price: 0,
      balance: 0,
      currency: 'CNY',
      autoRenewal: false,
      notes: '主要为限时免费领取的游戏，共18款'
    },
    {
      id: generateId(),
      type: 'subscription' as AssetType,
      name: 'Spotify Premium',
      platform: 'Spotify',
      bindingAccountId: gmailAccount.id,
      purchaseDate: formatDate(addDays(now, -250)),
      price: 15,
      currency: 'CNY',
      renewalDate: formatDate(addDays(now, 10)),
      autoRenewal: true,
      annualFee: 180,
      notes: '个人版，无广告，可下载离线收听'
    },
    {
      id: generateId(),
      type: 'subscription' as AssetType,
      name: 'Kindle Unlimited',
      platform: 'Amazon',
      bindingAccountId: gmailAccount.id,
      purchaseDate: formatDate(addDays(now, -180)),
      price: 12,
      currency: 'CNY',
      renewalDate: formatDate(addDays(now, 185)),
      autoRenewal: true,
      annualFee: 144,
      notes: '电子书借阅服务，已借阅3本'
    },
    {
      id: generateId(),
      type: 'balance' as AssetType,
      name: '支付宝余额',
      platform: '支付宝',
      bindingAccountId: alipayAccount.id,
      balance: 3256.78,
      currency: 'CNY',
      autoRenewal: false,
      notes: '日常消费账户，含余额宝3000元'
    },
    {
      id: generateId(),
      type: 'balance' as AssetType,
      name: '微信余额',
      platform: '微信',
      bindingAccountId: wechatAccount.id,
      balance: 568.20,
      currency: 'CNY',
      autoRenewal: false,
      notes: '微信零钱，主要用于发红包'
    },
    {
      id: generateId(),
      type: 'subscription' as AssetType,
      name: 'Netflix 高级版',
      platform: 'Netflix',
      bindingAccountId: netflixAccount.id,
      purchaseDate: formatDate(addDays(now, -200)),
      price: 93,
      currency: 'CNY',
      renewalDate: formatDate(addDays(now, -5)),
      autoRenewal: true,
      annualFee: 1116,
      notes: '4K画质，支持4屏同时观看，已提交注销申请'
    },
    {
      id: generateId(),
      type: 'subscription' as AssetType,
      name: 'iCloud+ 200GB',
      platform: 'Apple',
      bindingAccountId: appleAccount.id,
      purchaseDate: formatDate(addDays(now, -500)),
      price: 21,
      currency: 'CNY',
      renewalDate: formatDate(addDays(now, 15)),
      autoRenewal: true,
      annualFee: 252,
      notes: 'iCloud云存储，包含隐藏邮件功能'
    },
    {
      id: generateId(),
      type: 'subscription' as AssetType,
      name: 'Adobe Creative Cloud 全家桶',
      platform: 'Adobe',
      bindingAccountId: gmailAccount.id,
      purchaseDate: formatDate(addDays(now, -60)),
      price: 888,
      currency: 'CNY',
      renewalDate: formatDate(addDays(now, 305)),
      autoRenewal: true,
      annualFee: 888,
      notes: '包含全部Adobe软件，Photoshop已单独列出'
    }
  ]

  return assets
}

export const generateMockHabits = (): SecurityHabit[] => {
  const now = new Date('2026-06-06')

  const habits: SecurityHabit[] = [
    {
      id: generateId(),
      type: 'password_change' as HabitType,
      accountId: undefined,
      lastCompleted: formatDate(addDays(now, -30)),
      nextReminder: formatDate(addDays(now, 60)),
      intervalDays: 90,
      enabled: true
    },
    {
      id: generateId(),
      type: '2fa_check' as HabitType,
      accountId: undefined,
      lastCompleted: formatDate(addDays(now, -10)),
      nextReminder: formatDate(addDays(now, 20)),
      intervalDays: 30,
      enabled: true
    },
    {
      id: generateId(),
      type: 'backup' as HabitType,
      accountId: undefined,
      lastCompleted: formatDate(addDays(now, -7)),
      nextReminder: formatDate(addDays(now, 0)),
      intervalDays: 7,
      enabled: true
    }
  ]

  return habits
}

export const generateMockPasswordHistories = (): PasswordHistory[] => {
  const accounts = generateMockAccounts()
  const now = new Date('2026-06-06')

  const gmailAccount = accounts.find(a => a.platformName === 'Gmail')!
  const githubAccount = accounts.find(a => a.platformName === 'GitHub')!
  const appleAccount = accounts.find(a => a.platformName === 'Apple ID')!

  const histories: PasswordHistory[] = [
    {
      id: generateId(),
      accountId: gmailAccount.id,
      oldPasswordHash: getMockHash('OldGmailPass2023!'),
      changeDate: formatDate(addDays(now, -365)),
      reason: '定期更换密码'
    },
    {
      id: generateId(),
      accountId: gmailAccount.id,
      oldPasswordHash: getMockHash('OldGmailPass2024!'),
      changeDate: formatDate(addDays(now, -180)),
      reason: '定期更换密码'
    },
    {
      id: generateId(),
      accountId: githubAccount.id,
      oldPasswordHash: getMockHash('OldGitHub2023#'),
      changeDate: formatDate(addDays(now, -270)),
      reason: '开启2FA后更换密码'
    },
    {
      id: generateId(),
      accountId: githubAccount.id,
      oldPasswordHash: getMockHash('OldGitHub2024#'),
      changeDate: formatDate(addDays(now, -90)),
      reason: '定期更换密码'
    },
    {
      id: generateId(),
      accountId: appleAccount.id,
      oldPasswordHash: getMockHash('OldAppleID2022$'),
      changeDate: formatDate(addDays(now, -540)),
      reason: '数据泄露后紧急更换'
    },
    {
      id: generateId(),
      accountId: appleAccount.id,
      oldPasswordHash: getMockHash('OldAppleID2024$'),
      changeDate: formatDate(addDays(now, -180)),
      reason: '定期更换密码'
    }
  ]

  return histories
}

export const generateAllMockData = () => {
  const accounts = generateMockAccounts()
  const breachRecords = generateMockBreachRecords()
  const suspiciousLogins = generateMockSuspiciousLogins()
  const assets = generateMockAssets()
  const habits = generateMockHabits()
  const passwordHistories = generateMockPasswordHistories()

  return {
    accounts,
    breachRecords,
    suspiciousLogins,
    assets,
    habits,
    passwordHistories,
    generatedAt: new Date().toISOString()
  }
}

export default generateAllMockData
