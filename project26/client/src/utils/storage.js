const HISTORY_KEY = 'sudoku_history';
const LEADERBOARD_KEY = 'sudoku_leaderboard';
const SETTINGS_KEY = 'sudoku_settings';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function getHistory() {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to get history:', error);
    return [];
  }
}

export function addHistoryEntry(entry) {
  try {
    const history = getHistory();
    const newEntry = {
      id: generateId(),
      ...entry,
      createdAt: new Date().toISOString()
    };
    history.unshift(newEntry);
    
    if (history.length > 100) {
      history.splice(100);
    }
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    return newEntry;
  } catch (error) {
    console.error('Failed to add history entry:', error);
    return null;
  }
}

export function clearHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear history:', error);
    return false;
  }
}

export function getLeaderboard() {
  try {
    const data = localStorage.getItem(LEADERBOARD_KEY);
    return data ? JSON.parse(data) : {
      easy: [],
      medium: [],
      hard: [],
      expert: []
    };
  } catch (error) {
    console.error('Failed to get leaderboard:', error);
    return {
      easy: [],
      medium: [],
      hard: [],
      expert: []
    };
  }
}

export function addLeaderboardEntry(difficulty, entry) {
  try {
    const leaderboard = getLeaderboard();
    const entries = leaderboard[difficulty] || [];
    
    const newEntry = {
      id: generateId(),
      ...entry,
      createdAt: new Date().toISOString()
    };
    
    entries.push(newEntry);
    entries.sort((a, b) => a.time - b.time);
    
    if (entries.length > 10) {
      entries.splice(10);
    }
    
    leaderboard[difficulty] = entries;
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));
    
    return {
      leaderboard,
      rank: entries.findIndex(e => e.id === newEntry.id) + 1
    };
  } catch (error) {
    console.error('Failed to add leaderboard entry:', error);
    return null;
  }
}

export function clearLeaderboard() {
  try {
    localStorage.removeItem(LEADERBOARD_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear leaderboard:', error);
    return false;
  }
}

export function getSettings() {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    const defaultSettings = {
      difficulty: 'medium',
      showTimer: true,
      autoCheckErrors: false,
      highlightSameNumber: true,
      showNotes: true
    };
    return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings;
  } catch (error) {
    console.error('Failed to get settings:', error);
    return {
      difficulty: 'medium',
      showTimer: true,
      autoCheckErrors: false,
      highlightSameNumber: true,
      showNotes: true
    };
  }
}

export function updateSettings(settings) {
  try {
    const current = getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Failed to update settings:', error);
    return null;
  }
}

export function getStatistics() {
  const history = getHistory();
  const leaderboard = getLeaderboard();
  
  const stats = {
    totalGames: history.length,
    byDifficulty: {
      easy: { count: 0, bestTime: Infinity, avgTime: 0 },
      medium: { count: 0, bestTime: Infinity, avgTime: 0 },
      hard: { count: 0, bestTime: Infinity, avgTime: 0 },
      expert: { count: 0, bestTime: Infinity, avgTime: 0 }
    }
  };
  
  let totalTime = 0;
  
  for (const entry of history) {
    const difficulty = entry.difficulty || 'medium';
    const diffStats = stats.byDifficulty[difficulty];
    
    if (diffStats) {
      diffStats.count++;
      diffStats.totalTime = (diffStats.totalTime || 0) + entry.time;
      if (entry.time < diffStats.bestTime) {
        diffStats.bestTime = entry.time;
      }
      totalTime += entry.time;
    }
  }
  
  for (const difficulty in stats.byDifficulty) {
    const diffStats = stats.byDifficulty[difficulty];
    if (diffStats.count > 0) {
      diffStats.avgTime = Math.round(diffStats.totalTime / diffStats.count);
    } else {
      diffStats.bestTime = 0;
      diffStats.avgTime = 0;
    }
    delete diffStats.totalTime;
  }
  
  stats.avgTime = history.length > 0 ? Math.round(totalTime / history.length) : 0;
  stats.bestTimeOverall = Math.min(
    ...Object.values(stats.byDifficulty).map(d => d.bestTime || Infinity)
  );
  if (stats.bestTimeOverall === Infinity) stats.bestTimeOverall = 0;
  
  stats.leaderboardTop = {};
  for (const difficulty in leaderboard) {
    const entries = leaderboard[difficulty];
    stats.leaderboardTop[difficulty] = entries.length > 0 ? entries[0] : null;
  }
  
  return stats;
}
