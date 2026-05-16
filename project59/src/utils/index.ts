import { format, parseISO, differenceInYears, isSameDay } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export const formatDate = (date: string | Date, pattern: string = 'yyyy年MM月dd日') => {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, pattern, { locale: zhCN })
}

export const formatDateTime = (date: string | Date) => {
  return formatDate(date, 'yyyy年MM月dd日 HH:mm')
}

export const getYearsAgo = (date: string | Date) => {
  const d = typeof date === 'string' ? parseISO(date) : date
  return differenceInYears(new Date(), d)
}

export const isToday = (date: string | Date) => {
  const d = typeof date === 'string' ? parseISO(date) : date
  return isSameDay(d, new Date())
}

export const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

export const extractWords = (content: string): string[] => {
  const text = content.replace(/<[^>]*>/g, '').replace(/[^\u4e00-\u9fa5a-zA-Z\s]/g, '')
  const chineseWords = text.match(/[\u4e00-\u9fa5]{2,}/g) || []
  const englishWords = text.match(/[a-zA-Z]{3,}/g) || []
  return [...chineseWords, ...englishWords]
}

export const countWordFrequencies = (words: string[]): { word: string; count: number }[] => {
  const freq: Record<string, number> = {}
  words.forEach(word => {
    freq[word] = (freq[word] || 0) + 1
  })
  return Object.entries(freq)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 50)
}

export const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ')
}

export const getWeatherIcon = (condition: string): string => {
  const weatherIcons: Record<string, string> = {
    '晴': '☀️',
    '多云': '⛅',
    '阴': '☁️',
    '雨': '🌧️',
    '雪': '❄️',
    '雷': '⛈️',
    '雾': '🌫️',
  }
  return weatherIcons[condition] || '🌤️'
}

export const getAnniversaryIcon = (type: string): string => {
  const icons: Record<string, string> = {
    'birthday': '🎂',
    'anniversary': '💝',
    'other': '📅',
  }
  return icons[type] || '📅'
}
