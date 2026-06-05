import { AttendanceStatus, AttendanceStats, GradeStats, Grade } from '../types';

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
};

export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateCN = (date: string | Date): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  return `${year}年${month}月${day}日`;
};

export const getAttendanceStatusText = (status: AttendanceStatus): string => {
  const map: Record<AttendanceStatus, string> = {
    present: '出勤',
    late: '迟到',
    leave: '请假',
    absent: '旷课'
  };
  return map[status];
};

export const getAttendanceStatusColor = (status: AttendanceStatus): string => {
  const map: Record<AttendanceStatus, string> = {
    present: 'bg-green-100 text-green-800',
    late: 'bg-yellow-100 text-yellow-800',
    leave: 'bg-blue-100 text-blue-800',
    absent: 'bg-red-100 text-red-800'
  };
  return map[status];
};

export const calculateAttendanceStats = (
  attendanceList: { status: AttendanceStatus; date: string }[]
): AttendanceStats[] => {
  const dateMap = new Map<string, AttendanceStats>();
  
  attendanceList.forEach(item => {
    if (!dateMap.has(item.date)) {
      dateMap.set(item.date, {
        date: item.date,
        present: 0,
        late: 0,
        leave: 0,
        absent: 0
      });
    }
    const stats = dateMap.get(item.date)!;
    stats[item.status]++;
  });
  
  return Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
};

export const calculateGradeStats = (grades: Grade[]): GradeStats => {
  if (grades.length === 0) {
    return {
      average: 0,
      passRate: 0,
      excellentRate: 0,
      maxScore: 0,
      minScore: 0,
      distribution: [0, 0, 0, 0, 0]
    };
  }
  
  const scores = grades.map(g => g.score);
  const average = scores.reduce((a, b) => a + b, 0) / scores.length;
  const passCount = scores.filter(s => s >= 60).length;
  const excellentCount = scores.filter(s => s >= 90).length;
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);
  
  const distribution: [number, number, number, number, number] = [0, 0, 0, 0, 0];
  scores.forEach(score => {
    if (score >= 90) distribution[4]++;
    else if (score >= 80) distribution[3]++;
    else if (score >= 70) distribution[2]++;
    else if (score >= 60) distribution[1]++;
    else distribution[0]++;
  });
  
  return {
    average: Math.round(average * 10) / 10,
    passRate: Math.round((passCount / scores.length) * 100),
    excellentRate: Math.round((excellentCount / scores.length) * 100),
    maxScore,
    minScore,
    distribution
  };
};

export const shuffleArray = <T>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

export const getRandomItem = <T>(array: T[], excludeIds?: string[]): T | null => {
  if (array.length === 0) return null;
  
  let filtered = array;
  if (excludeIds && excludeIds.length > 0) {
    filtered = array.filter(item => !excludeIds.includes((item as { id: string }).id));
  }
  
  if (filtered.length === 0) return null;
  
  const index = Math.floor(Math.random() * filtered.length);
  return filtered[index];
};

export const cn = (...args: (string | undefined | null | false)[]): string => {
  return args.filter(Boolean).join(' ');
};

export const exportToJson = (data: unknown, filename: string): void => {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${formatDate(new Date())}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importFromJson = <T>(file: File): Promise<T> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(data);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};
