export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}小时${mins > 0 ? ` ${mins}分钟` : ''}`;
  }
  return `${mins}分钟`;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateChinese = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weekday = weekdays[date.getDay()];
  return `${year}年${month}月${day}日 ${weekday}`;
};

export const getToday = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const getDaysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const calculateStreak = (dates: string[]): number => {
  if (dates.length === 0) return 0;
  
  const sortedDates = [...new Set(dates)].sort().reverse();
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  for (const dateStr of sortedDates) {
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((currentDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0 || diffDays === 1) {
      streak++;
      currentDate = date;
    } else {
      break;
    }
  }
  
  return streak;
};

export const calculateLongestStreak = (dates: string[]): number => {
  if (dates.length === 0) return 0;
  
  const sortedDates = [...new Set(dates)].sort();
  let maxStreak = 1;
  let currentStreak = 1;
  
  for (let i = 1; i < sortedDates.length; i++) {
    const current = new Date(sortedDates[i]);
    const previous = new Date(sortedDates[i - 1]);
    const diffDays = Math.floor((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else if (diffDays > 1) {
      currentStreak = 1;
    }
  }
  
  return maxStreak;
};

export const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    'standing': '站立体式',
    'seated': '坐姿体式',
    'supine': '仰卧体式',
    'prone': '俯卧体式',
    'inversion': '倒立体式',
    'arm-balance': '手臂平衡',
    'backbend': '后弯体式',
  };
  return labels[category] || category;
};

export const getDifficultyLabel = (difficulty: string): string => {
  const labels: Record<string, string> = {
    'beginner': '初级',
    'intermediate': '中级',
    'advanced': '高级',
  };
  return labels[difficulty] || difficulty;
};

export const getMasteryLabel = (level: string): string => {
  const labels: Record<string, string> = {
    'first-contact': '初次接触',
    'learning': '学习中',
    'practicing': '练习中',
    'improving': '进步中',
    'stable': '稳定保持',
  };
  return labels[level] || level;
};

export const getEnergyLabel = (level: string): string => {
  const labels: Record<string, string> = {
    'low': '低',
    'medium': '中',
    'high': '高',
  };
  return labels[level] || level;
};

export const getMeditationCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    'breath-awareness': '呼吸觉察',
    'body-scan': '身体扫描',
    'loving-kindness': '慈心禅',
    'mindfulness': '正念',
  };
  return labels[category] || category;
};

export const getTargetGoalLabel = (goal: string): string => {
  const labels: Record<string, string> = {
    'stress-relief': '减压放松',
    'strength': '力量提升',
    'flexibility': '柔韧性改善',
    'relaxation': '深度放松',
    'energy': '能量提升',
  };
  return labels[goal] || goal;
};
