import { generateMockData, type MockData } from './mockData'
import { cities, getCityByName, getRandomCities, type City as MockCity } from './cities'
import type { User, InvoiceImage } from '@/types/common'
import type { Itinerary, Destination, Transportation, Accommodation, Visit } from '@/types/itinerary'
import type { Expense, ExpenseStatus } from '@/types/expense'
import type { Reimbursement, ReimbursementStatus, ReimbursementItem } from '@/types/reimbursement'
import { optimizeRoute as optimizeRouteUtil, type City, type RouteResult } from '@/utils/routeOptimizer'

const STORAGE_PREFIX = 'business_travel_mock_'

const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

const delay = <T>(data: T, ms: number = 300): Promise<T> => {
  return new Promise(resolve => setTimeout(() => resolve(data), ms))
}

interface BudgetComparison {
  budget: number
  actual: number
  difference: number
  percentage: number
}

interface UploadResult {
  success: boolean
  url: string
}

const STORAGE_KEYS = {
  INITIALIZED: STORAGE_PREFIX + 'initialized',
  CURRENT_USER: STORAGE_PREFIX + 'currentUser',
  ITINERARIES: STORAGE_PREFIX + 'itineraries',
  EXPENSES: STORAGE_PREFIX + 'expenses',
  REIMBURSEMENTS: STORAGE_PREFIX + 'reimbursements'
}

export const initMockData = (): MockData => {
  if (typeof window === 'undefined') {
    return generateMockData()
  }

  const isInitialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED)

  if (!isInitialized) {
    const mockData = generateMockData()

    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true')
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(mockData.currentUser))
    localStorage.setItem(STORAGE_KEYS.ITINERARIES, JSON.stringify(mockData.itineraries))
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(mockData.expenses))
    localStorage.setItem(STORAGE_KEYS.REIMBURSEMENTS, JSON.stringify(mockData.reimbursements))

    return mockData
  }

  return {
    currentUser: getMockData('currentUser'),
    itineraries: getMockData('itineraries'),
    expenses: getMockData('expenses'),
    reimbursements: getMockData('reimbursements')
  }
}

type MockDataKey = 'currentUser' | 'itineraries' | 'expenses' | 'reimbursements'

const keyMap: Record<MockDataKey, string> = {
  currentUser: STORAGE_KEYS.CURRENT_USER,
  itineraries: STORAGE_KEYS.ITINERARIES,
  expenses: STORAGE_KEYS.EXPENSES,
  reimbursements: STORAGE_KEYS.REIMBURSEMENTS
}

export const getMockData = <T = unknown>(key: MockDataKey): T => {
  if (typeof window === 'undefined') {
    return generateMockData()[key] as T
  }

  const storageKey = keyMap[key]
  const data = localStorage.getItem(storageKey)

  if (!data) {
    const mockData = initMockData()
    return mockData[key] as T
  }

  try {
    return JSON.parse(data) as T
  } catch {
    const mockData = initMockData()
    return mockData[key] as T
  }
}

export const setMockData = <T = unknown>(key: MockDataKey, value: T): void => {
  if (typeof window === 'undefined') {
    return
  }

  const storageKey = keyMap[key]
  localStorage.setItem(storageKey, JSON.stringify(value))
}

export const clearMockData = (): void => {
  if (typeof window === 'undefined') {
    return
  }

  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key)
  })
}

export const resetMockData = (): MockData => {
  clearMockData()
  return initMockData()
}

export const mockApi = {
  getCurrentUser: async (): Promise<User> => {
    initMockData()
    return delay(getMockData<User>('currentUser'))
  },

  getUsers: async (): Promise<User[]> => {
    initMockData()
    const currentUser = getMockData<User>('currentUser')
    const users: User[] = [
      currentUser,
      {
        id: 'user_002',
        name: '李华',
        email: 'lihua@company.com',
        avatar: '',
        role: 'manager',
        department: '技术部'
      },
      {
        id: 'user_003',
        name: '王芳',
        email: 'wangfang@company.com',
        avatar: '',
        role: 'finance',
        department: '财务部'
      },
      {
        id: 'user_004',
        name: '赵敏',
        email: 'zhaomin@company.com',
        avatar: '',
        role: 'admin',
        department: '行政部'
      }
    ]
    return delay(users)
  },

  updateUser: async (user: User): Promise<User> => {
    setMockData('currentUser', user)
    return delay(user)
  },

  getItineraries: async (): Promise<Itinerary[]> => {
    initMockData()
    return delay(getMockData<Itinerary[]>('itineraries'))
  },

  getItineraryById: async (id: string): Promise<Itinerary | null> => {
    initMockData()
    const itineraries = getMockData<Itinerary[]>('itineraries')
    const itinerary = itineraries.find(i => i.id === id) || null
    return delay(itinerary)
  },

  createItinerary: async (data: Partial<Itinerary>): Promise<Itinerary> => {
    initMockData()
    const itineraries = getMockData<Itinerary[]>('itineraries')
    const currentUser = getMockData<User>('currentUser')
    
    const newItinerary: Itinerary = {
      id: generateId(),
      userId: data.userId || currentUser.id,
      title: data.title || '',
      purpose: data.purpose || '',
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      endDate: data.endDate || new Date().toISOString().split('T')[0],
      budget: data.budget || 0,
      status: data.status || 'draft',
      destinations: data.destinations || [],
      transportations: data.transportations || [],
      accommodations: data.accommodations || [],
      visits: data.visits || [],
      createdAt: new Date().toISOString()
    }
    
    const updatedItineraries = [...itineraries, newItinerary]
    setMockData('itineraries', updatedItineraries)
    return delay(newItinerary)
  },

  updateItinerary: async (id: string, data: Partial<Itinerary>): Promise<Itinerary | null> => {
    initMockData()
    const itineraries = getMockData<Itinerary[]>('itineraries')
    const index = itineraries.findIndex(i => i.id === id)
    
    if (index === -1) return delay(null)
    
    const updatedItinerary = { ...itineraries[index], ...data }
    const updatedItineraries = [...itineraries]
    updatedItineraries[index] = updatedItinerary
    
    setMockData('itineraries', updatedItineraries)
    return delay(updatedItinerary)
  },

  deleteItinerary: async (id: string): Promise<boolean> => {
    initMockData()
    const itineraries = getMockData<Itinerary[]>('itineraries')
    const filtered = itineraries.filter(i => i.id !== id)
    
    if (filtered.length === itineraries.length) return delay(false)
    
    setMockData('itineraries', filtered)
    return delay(true)
  },

  submitForApproval: async (id: string): Promise<Itinerary | null> => {
    return mockApi.updateItinerary(id, { status: 'pending' })
  },

  optimizeRoute: async (cities: City[], startCity?: City): Promise<RouteResult> => {
    return delay(optimizeRouteUtil(cities, startCity), 500)
  },

  getExpenses: async (itineraryId?: string): Promise<Expense[]> => {
    initMockData()
    let expenses = getMockData<Expense[]>('expenses')
    if (itineraryId) {
      expenses = expenses.filter(e => e.itineraryId === itineraryId)
    }
    return delay(expenses)
  },

  createExpense: async (data: Partial<Expense>): Promise<Expense> => {
    initMockData()
    const expenses = getMockData<Expense[]>('expenses')
    
    const newExpense: Expense = {
      id: generateId(),
      itineraryId: data.itineraryId,
      category: data.category || 'other',
      amount: data.amount || 0,
      expenseDate: data.expenseDate || new Date().toISOString().split('T')[0],
      description: data.description || '',
      merchant: data.merchant,
      images: data.images || [],
      status: data.status || 'unsubmitted',
      createdAt: new Date().toISOString()
    }
    
    const updatedExpenses = [...expenses, newExpense]
    setMockData('expenses', updatedExpenses)
    return delay(newExpense)
  },

  updateExpense: async (id: string, data: Partial<Expense>): Promise<Expense | null> => {
    initMockData()
    const expenses = getMockData<Expense[]>('expenses')
    const index = expenses.findIndex(e => e.id === id)
    
    if (index === -1) return delay(null)
    
    const updatedExpense = { ...expenses[index], ...data }
    const updatedExpenses = [...expenses]
    updatedExpenses[index] = updatedExpense
    
    setMockData('expenses', updatedExpenses)
    return delay(updatedExpense)
  },

  deleteExpense: async (id: string): Promise<boolean> => {
    initMockData()
    const expenses = getMockData<Expense[]>('expenses')
    const filtered = expenses.filter(e => e.id !== id)
    
    if (filtered.length === expenses.length) return delay(false)
    
    setMockData('expenses', filtered)
    return delay(true)
  },

  uploadInvoice: async (expenseId: string, image: File): Promise<UploadResult> => {
    const url = URL.createObjectURL(image)
    return delay({ success: true, url })
  },

  calculateBudgetComparison: async (itineraryId: string): Promise<BudgetComparison> => {
    initMockData()
    const itineraries = getMockData<Itinerary[]>('itineraries')
    const expenses = getMockData<Expense[]>('expenses')

    const itinerary = itineraries.find(i => i.id === itineraryId)
    const relatedExpenses = expenses.filter(e => e.itineraryId === itineraryId)

    const budget = itinerary?.budget || 0
    const actual = relatedExpenses.reduce((sum, e) => sum + e.amount, 0)
    const difference = budget - actual
    const percentage = budget > 0 ? Math.round((actual / budget) * 100) : 0

    return delay({
      budget,
      actual,
      difference,
      percentage
    })
  },

  getReimbursements: async (): Promise<Reimbursement[]> => {
    initMockData()
    return delay(getMockData<Reimbursement[]>('reimbursements'))
  },

  getReimbursementById: async (id: string): Promise<Reimbursement | null> => {
    initMockData()
    const reimbursements = getMockData<Reimbursement[]>('reimbursements')
    const reimbursement = reimbursements.find(r => r.id === id) || null
    return delay(reimbursement)
  },

  createReimbursement: async (expenseIds: string[], title: string, itineraryId?: string): Promise<Reimbursement> => {
    initMockData()
    const reimbursements = getMockData<Reimbursement[]>('reimbursements')
    const expenses = getMockData<Expense[]>('expenses')
    const currentUser = getMockData<User>('currentUser')
    
    const selectedExpenses = expenses.filter(e => expenseIds.includes(e.id))
    const items: ReimbursementItem[] = selectedExpenses.map(e => ({
      id: generateId(),
      reimbursementId: '',
      expenseId: e.id,
      amount: e.amount
    }))
    
    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0)
    const now = new Date().toISOString()
    
    const newReimbursement: Reimbursement = {
      id: generateId(),
      applicantId: currentUser.id,
      applicantName: currentUser.name,
      title,
      totalAmount,
      items: [],
      status: 'draft',
      approvals: [],
      statusLogs: [{
        id: generateId(),
        reimbursementId: '',
        status: 'draft',
        operatorId: currentUser.id,
        operatorName: currentUser.name,
        time: now,
        comment: '创建报销单'
      }],
      itineraryId,
      createdAt: now
    }
    
    newReimbursement.items = items.map(item => ({ ...item, reimbursementId: newReimbursement.id }))
    newReimbursement.statusLogs = newReimbursement.statusLogs.map(log => ({ ...log, reimbursementId: newReimbursement.id }))
    
    const updatedReimbursements = [...reimbursements, newReimbursement]
    setMockData('reimbursements', updatedReimbursements)
    
    return delay(newReimbursement)
  },

  submitReimbursement: async (id: string): Promise<Reimbursement | null> => {
    initMockData()
    const reimbursements = getMockData<Reimbursement[]>('reimbursements')
    const expenses = getMockData<Expense[]>('expenses')
    const index = reimbursements.findIndex(r => r.id === id)
    
    if (index === -1) return delay(null)
    
    const updatedReimbursement: Reimbursement = {
      ...reimbursements[index],
      status: 'submitted',
      submitTime: new Date().toISOString()
    }
    
    const updatedReimbursements = [...reimbursements]
    updatedReimbursements[index] = updatedReimbursement
    
    const expenseIds = updatedReimbursement.items.map(item => item.expenseId)
    const updatedExpenses = expenses.map(e => 
      expenseIds.includes(e.id) ? { ...e, status: 'pending' as ExpenseStatus } : e
    )
    
    setMockData('reimbursements', updatedReimbursements)
    setMockData('expenses', updatedExpenses)
    
    return delay(updatedReimbursement)
  },

  updateReimbursementStatus: async (id: string, status: ReimbursementStatus, comment?: string): Promise<Reimbursement | null> => {
    initMockData()
    const reimbursements = getMockData<Reimbursement[]>('reimbursements')
    const index = reimbursements.findIndex(r => r.id === id)
    
    if (index === -1) return delay(null)
    
    const approval = comment ? {
      id: generateId(),
      reimbursementId: id,
      approverId: 'user_002',
      action: status === 'rejected' ? 'reject' as const : 'approve' as const,
      comment,
      time: new Date().toISOString()
    } : null
    
    const updatedReimbursement: Reimbursement = {
      ...reimbursements[index],
      status,
      approvals: approval ? [...reimbursements[index].approvals, approval] : reimbursements[index].approvals
    }
    
    const updatedReimbursements = [...reimbursements]
    updatedReimbursements[index] = updatedReimbursement
    
    setMockData('reimbursements', updatedReimbursements)
    return delay(updatedReimbursement)
  },

  checkCompleteness: (expenseIds: string[]): { complete: boolean; missing: string[] } => {
    initMockData()
    const expenses = getMockData<Expense[]>('expenses')
    const missing: string[] = []
    
    const selectedExpenses = expenses.filter(e => expenseIds.includes(e.id))
    
    selectedExpenses.forEach(expense => {
      if (expense.images.length === 0) {
        missing.push(`费用 ${expense.id} (${expense.description}) 缺少发票`)
      }
      if (!expense.description) {
        missing.push(`费用 ${expense.id} 缺少说明`)
      }
    })
    
    return {
      complete: missing.length === 0,
      missing
    }
  }
}

export { cities, getCityByName, getRandomCities }
export type { City, MockData }
