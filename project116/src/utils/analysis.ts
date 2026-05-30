import { ShowRecord, MaterialCategory, Joke, HitRateAnalysis } from '../types';

export function calculateHitRate(records: ShowRecord[], jokes: Joke[]): HitRateAnalysis {
  const byCategory: Record<MaterialCategory, { total: number; landed: number; rate: number }> = {
    family: { total: 0, landed: 0, rate: 0 },
    workplace: { total: 0, landed: 0, rate: 0 },
    society: { total: 0, landed: 0, rate: 0 },
    personal: { total: 0, landed: 0, rate: 0 },
    other: { total: 0, landed: 0, rate: 0 },
  };

  let totalJokes = 0;
  let landedJokes = 0;

  for (const record of records) {
    for (const feedback of record.jokeFeedbacks) {
      totalJokes++;
      if (feedback.landed) {
        landedJokes++;
      }

      const joke = jokes.find(j => j.id === feedback.jokeId);
      if (joke) {
        byCategory[joke.category].total++;
        if (feedback.landed) {
          byCategory[joke.category].landed++;
        }
      }
    }
  }

  for (const cat of Object.keys(byCategory) as MaterialCategory[]) {
    const catData = byCategory[cat];
    catData.rate = catData.total > 0 ? (catData.landed / catData.total) * 100 : 0;
  }

  return {
    totalJokes,
    landedJokes,
    hitRate: totalJokes > 0 ? (landedJokes / totalJokes) * 100 : 0,
    byCategory,
  };
}

export function getTrendData(records: ShowRecord[]) {
  return records
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(record => {
      const landed = record.jokeFeedbacks.filter(f => f.landed).length;
      const total = record.jokeFeedbacks.length;
      return {
        date: record.date,
        venue: record.venue || '未命名',
        hitRate: total > 0 ? (landed / total) * 100 : 0,
        rating: record.overallRating,
        landed,
        total,
      };
    });
}

export function getTopJokesPerformance(records: ShowRecord[], jokes: Joke[]) {
  const jokeStats: Record<string, {
    id: string;
    title: string;
    total: number;
    landed: number;
    rate: number;
    avgLaughter: number;
  }> = {};

  for (const joke of jokes) {
    jokeStats[joke.id] = {
      id: joke.id,
      title: joke.title,
      total: 0,
      landed: 0,
      rate: 0,
      avgLaughter: 0,
    };
  }

  const laughterSums: Record<string, number[]> = {};

  for (const record of records) {
    for (const feedback of record.jokeFeedbacks) {
      if (!jokeStats[feedback.jokeId]) {
        continue;
      }

      jokeStats[feedback.jokeId].total++;
      if (feedback.landed) {
        jokeStats[feedback.jokeId].landed++;

        if (!laughterSums[feedback.jokeId]) {
          laughterSums[feedback.jokeId] = [];
        }
        if (feedback.laughterDuration) {
          laughterSums[feedback.jokeId].push(feedback.laughterDuration);
        }
      }
    }
  }

  return Object.values(jokeStats)
    .filter(j => j.total > 0)
    .map(j => ({
      ...j,
      rate: j.total > 0 ? (j.landed / j.total) * 100 : 0,
      avgLaughter: laughterSums[j.id] && laughterSums[j.id].length > 0
        ? laughterSums[j.id].reduce((a, b) => a + b, 0) / laughterSums[j.id].length
        : 0,
    }))
    .sort((a, b) => b.rate - a.rate);
}

export function extractTagCloud(records: ShowRecord[], jokes: Joke[]) {
  const tagCounts: Record<string, number> = {};

  for (const record of records) {
    for (const feedback of record.jokeFeedbacks) {
      if (feedback.landed) {
        const joke = jokes.find(j => j.id === feedback.jokeId);
        if (joke) {
          for (const tag of joke.tags) {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          }
        }
      }
    }
  }

  return Object.entries(tagCounts)
    .map(([tag, count]) => ({
      text: tag,
      value: count,
    }))
    .sort((a, b) => b.value - a.value);
}
