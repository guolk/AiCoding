import { Game, PlayRecord, PlayerStats, GameStats } from '@/types';

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}分钟`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
};

export const getCollectionStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    owned: '已拥有',
    wishlist: '愿望清单',
    sold: '已出售',
    lent: '已借出',
  };
  return labels[status] || status;
};

export const getCollectionStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    owned: 'bg-green-500/20 text-green-400',
    wishlist: 'bg-blue-500/20 text-blue-400',
    sold: 'bg-red-500/20 text-red-400',
    lent: 'bg-yellow-500/20 text-yellow-400',
  };
  return colors[status] || 'bg-gray-500/20 text-gray-400';
};

export const getRuleNoteTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    keyPoint: '规则要点',
    qa: 'Q&A',
    teaching: '教学引导',
  };
  return labels[type] || type;
};

export const getRuleNoteTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    keyPoint: 'bg-accent-500/20 text-accent-400',
    qa: 'bg-blue-500/20 text-blue-400',
    teaching: 'bg-green-500/20 text-green-400',
  };
  return colors[type] || 'bg-gray-500/20 text-gray-400';
};

export const getReviewTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    firstImpression: '第一印象',
    secondPlay: '第二次感受',
    longTerm: '长期评价',
  };
  return labels[type] || type;
};

export const getComplexityLabel = (complexity: number): string => {
  if (complexity < 2) return '入门级';
  if (complexity < 3) return '轻策';
  if (complexity < 4) return '中策';
  return '重策';
};

export const getComplexityColor = (complexity: number): string => {
  if (complexity < 2) return 'text-green-400';
  if (complexity < 3) return 'text-yellow-400';
  if (complexity < 4) return 'text-orange-400';
  return 'text-red-400';
};

export const calculateGameStats = (gameId: string, playRecords: PlayRecord[]): GameStats => {
  const records = playRecords.filter(r => r.gameId === gameId);
  
  if (records.length === 0) {
    return {
      playCount: 0,
      winCount: 0,
      winRate: 0,
      avgDuration: 0,
      avgRating: 0,
      lastPlayed: null,
    };
  }

  const winCount = records.filter(r => r.winner === '我' || r.winner === '全员').length;
  const totalDuration = records.reduce((sum, r) => sum + r.duration, 0);
  const totalRating = records.reduce((sum, r) => sum + r.rating, 0);
  const sortedDates = records.map(r => r.playDate).sort().reverse();

  return {
    playCount: records.length,
    winCount,
    winRate: Math.round((winCount / records.length) * 100),
    avgDuration: Math.round(totalDuration / records.length),
    avgRating: Math.round((totalRating / records.length) * 10) / 10,
    lastPlayed: sortedDates[0] || null,
  };
};

export const calculatePlayerStats = (playRecords: PlayRecord[]): PlayerStats[] => {
  const playerMap = new Map<string, { playCount: number; winCount: number; gameCounts: Map<string, number> }>();

  playRecords.forEach(record => {
    record.players.forEach(player => {
      if (player.name === '全员') return;
      
      const stats = playerMap.get(player.name) || {
        playCount: 0,
        winCount: 0,
        gameCounts: new Map<string, number>(),
      };
      
      stats.playCount++;
      if (player.isWinner || record.winner === player.name) {
        stats.winCount++;
      }
      
      const gameCount = stats.gameCounts.get(record.gameId) || 0;
      stats.gameCounts.set(record.gameId, gameCount + 1);
      
      playerMap.set(player.name, stats);
    });
  });

  const playerStats: PlayerStats[] = [];
  
  playerMap.forEach((stats, name) => {
    let favoriteGame: string | undefined;
    let maxCount = 0;
    
    stats.gameCounts.forEach((count, gameId) => {
      if (count > maxCount) {
        maxCount = count;
        favoriteGame = gameId;
      }
    });

    playerStats.push({
      name,
      playCount: stats.playCount,
      winCount: stats.winCount,
      winRate: Math.round((stats.winCount / stats.playCount) * 100),
      favoriteGame,
    });
  });

  return playerStats.sort((a, b) => b.playCount - a.playCount);
};

export const matchGameForRecommendation = (
  game: Game,
  params: {
    players?: number;
    maxDuration?: number;
    minDuration?: number;
    maxComplexity?: number;
    minComplexity?: number;
    tags?: string[];
  }
): { match: boolean; score: number; reasons: string[] } => {
  const reasons: string[] = [];
  let score = 0;

  if (params.players !== undefined) {
    if (params.players >= game.minPlayers && params.players <= game.maxPlayers) {
      score += 30;
      reasons.push(`适合${params.players}人游玩`);
    } else {
      return { match: false, score: 0, reasons: [] };
    }
  }

  if (params.maxDuration !== undefined) {
    if (game.maxPlayTime <= params.maxDuration) {
      score += 20;
      reasons.push(`时长${game.maxPlayTime}分钟以内`);
    } else if (game.minPlayTime <= params.maxDuration) {
      score += 10;
      reasons.push(`最短${game.minPlayTime}分钟，可在时限内完成`);
    } else {
      return { match: false, score: 0, reasons: [] };
    }
  }

  if (params.maxComplexity !== undefined) {
    if (game.complexity <= params.maxComplexity) {
      score += 20;
      reasons.push(`复杂度${game.complexity.toFixed(1)}符合要求`);
    } else {
      return { match: false, score: 0, reasons: [] };
    }
  }

  if (params.tags && params.tags.length > 0) {
    const matchedTags = game.tags.filter(t => params.tags!.includes(t));
    if (matchedTags.length > 0) {
      score += matchedTags.length * 10;
      reasons.push(`风格匹配：${matchedTags.join('、')}`);
    }
  }

  return { match: true, score, reasons };
};
