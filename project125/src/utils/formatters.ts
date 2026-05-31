export function secondsToPace(seconds: number): string {
  if (!seconds || seconds <= 0) return '--:--';
  const minutes = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function paceToSeconds(pace: string): number {
  if (!pace || pace === '--:--') return 0;
  const [minutes, seconds] = pace.split(':').map(Number);
  return minutes * 60 + (seconds || 0);
}

export function secondsToTime(seconds: number): string {
  if (!seconds || seconds <= 0) return '00:00:00';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.round(seconds % 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function timeToSeconds(time: string): number {
  if (!time) return 0;
  const parts = time.split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return 0;
}

export function formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.round(totalSeconds % 60);
  
  if (hours > 0) {
    return `${hours}小时${minutes}分${seconds}秒`;
  }
  return `${minutes}分${seconds}秒`;
}

export function formatShortTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.round(totalSeconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function speedToPace(speedKmh: number): string {
  if (!speedKmh || speedKmh <= 0) return '--:--';
  const secondsPerKm = 3600 / speedKmh;
  return secondsToPace(secondsPerKm);
}

export function paceToSpeed(paceSeconds: number): number {
  if (!paceSeconds || paceSeconds <= 0) return 0;
  return 3600 / paceSeconds;
}

export function formatDistance(km: number): string {
  if (km >= 1) {
    return `${km.toFixed(1)}km`;
  }
  return `${(km * 1000).toFixed(0)}m`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function getPerformanceLevel(vdot: number): { level: string; color: string } {
  if (vdot >= 70) return { level: '精英', color: 'text-purple-600' };
  if (vdot >= 60) return { level: '优秀', color: 'text-primary-600' };
  if (vdot >= 50) return { level: '良好', color: 'text-success-600' };
  if (vdot >= 40) return { level: '中等', color: 'text-warning-600' };
  return { level: '入门', color: 'text-secondary-500' };
}

export function calculatePaceDifference(targetPace: number, actualPace: number): {
  seconds: number;
  percentage: number;
  isFaster: boolean;
  status: 'fast' | 'slow' | 'on';
} {
  const diff = targetPace - actualPace;
  const percentage = Math.round((diff / targetPace) * 100);
  
  return {
    seconds: Math.abs(diff),
    percentage: Math.abs(percentage),
    isFaster: diff > 0,
    status: Math.abs(diff) < 5 ? 'on' : diff > 0 ? 'fast' : 'slow'
  };
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
