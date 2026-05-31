export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export const formatDate = (date: string | Date): string => {
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export const formatPrice = (price: number): string => {
  return `¥${price.toFixed(2)}`
}

export const getMediaTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    dvd: 'DVD',
    bluray: '蓝光',
    vinyl: '黑胶',
    cd: 'CD',
    game: '游戏卡带'
  }
  return labels[type] || type
}

export const getEditionLabel = (edition: string): string => {
  const labels: Record<string, string> = {
    standard: '普通版',
    limited: '限定版',
    director_cut: '导演剪辑版',
    collector: '收藏版',
    special: '特别版'
  }
  return labels[edition] || edition
}

export const getConditionLabel = (condition: string): string => {
  const labels: Record<string, string> = {
    mint: '完美',
    near_mint: '近乎完美',
    very_good: '非常好',
    good: '良好',
    fair: '一般',
    poor: '较差'
  }
  return labels[condition] || condition
}

export const getLendingStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    available: '可借阅',
    lent: '已借出',
    overdue: '逾期未还'
  }
  return labels[status] || status
}

export const getPriorityLabel = (priority: string): string => {
  const labels: Record<string, string> = {
    high: '高',
    medium: '中',
    low: '低'
  }
  return labels[priority] || priority
}

export const getBidStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    active: '进行中',
    won: '已得标',
    lost: '未得标',
    expired: '已过期'
  }
  return labels[status] || status
}

export const getConditionColor = (condition: string): string => {
  const colors: Record<string, string> = {
    mint: 'text-green-600',
    near_mint: 'text-green-500',
    very_good: 'text-blue-500',
    good: 'text-yellow-500',
    fair: 'text-orange-500',
    poor: 'text-red-500'
  }
  return colors[condition] || 'text-gray-500'
}

export const getLendingStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    available: 'text-green-600',
    lent: 'text-orange-500',
    overdue: 'text-red-500'
  }
  return colors[status] || 'text-gray-500'
}

export const getPriorityColor = (priority: string): string => {
  const colors: Record<string, string> = {
    high: 'text-red-500',
    medium: 'text-yellow-500',
    low: 'text-green-500'
  }
  return colors[priority] || 'text-gray-500'
}

export const calculateValueChange = (purchasePrice: number, currentEstimate: number): {
  change: number
  percentage: number
  isPositive: boolean
} => {
  const change = currentEstimate - purchasePrice
  const percentage = purchasePrice > 0 ? (change / purchasePrice) * 100 : 0
  return {
    change,
    percentage,
    isPositive: change >= 0
  }
}

export const isOverdue = (expectedReturnDate: string): boolean => {
  return new Date(expectedReturnDate) < new Date()
}

export const getDaysUntilReturn = (expectedReturnDate: string): number => {
  const today = new Date()
  const expected = new Date(expectedReturnDate)
  const diffTime = expected.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export const downloadJSON = (data: unknown, filename: string): void => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
