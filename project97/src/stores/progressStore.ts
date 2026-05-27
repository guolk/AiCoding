import { useQuestionStore } from './questionStore';
import { useWrongNoteStore } from './wrongNoteStore';
import { useTrainingStore } from './trainingStore';
import type { Topic, Difficulty } from '../types';

interface MasteryData {
  topic: Topic;
  difficulty: Difficulty;
  total: number;
  mastered: number;
}

export function useProgressAnalysis() {
  const { questions } = useQuestionStore();
  const { wrongNotes } = useWrongNoteStore();
  const { trainingRecords } = useTrainingStore();

  const getMasteryHeatmap = (): MasteryData[] => {
    const topics: Topic[] = ['number_theory', 'combinatorics', 'algebra', 'geometry'];
    const difficulties: Difficulty[] = [1, 2, 3, 4, 5];
    const data: MasteryData[] = [];

    for (const topic of topics) {
      for (const difficulty of difficulties) {
        const topicQuestions = questions.filter(
          (q) => q.topic === topic && q.difficulty === difficulty
        );
        const masteredCount = topicQuestions.filter((q) => {
          const note = wrongNotes.find((n) => n.questionId === q.id);
          return note?.isMastered || false;
        }).length;

        data.push({
          topic,
          difficulty,
          total: topicQuestions.length,
          mastered: masteredCount,
        });
      }
    }
    return data;
  };

  const getScoreTrend = () => {
    const examRecords = trainingRecords
      .filter((r) => r.type === 'exam' && r.score !== undefined)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return examRecords.map((r) => ({
      date: new Date(r.createdAt).toLocaleDateString('zh-CN'),
      score: r.score || 0,
    }));
  };

  const getErrorStats = () => {
    const stats = {
      concept: 0,
      calculation: 0,
      approach: 0,
      careless: 0,
    };

    wrongNotes.forEach((note) => {
      stats[note.errorReason]++;
    });

    return Object.entries(stats).map(([reason, count]) => ({
      reason,
      count,
      label: {
        concept: '概念不清',
        calculation: '计算失误',
        approach: '思路跑偏',
        careless: '粗心',
      }[reason] || reason,
    }));
  };

  const getTopicErrorRates = () => {
    const topics: Topic[] = ['number_theory', 'combinatorics', 'algebra', 'geometry'];
    return topics.map((topic) => {
      const topicQuestionIds = questions.filter((q) => q.topic === topic).map((q) => q.id);
      const topicErrors = wrongNotes.filter((n) => topicQuestionIds.includes(n.questionId));
      const total = topicQuestionIds.length;
      const errors = topicErrors.length;
      return {
        topic,
        label: {
          number_theory: '数论',
          combinatorics: '组合',
          algebra: '代数',
          geometry: '几何',
        }[topic],
        errorRate: total > 0 ? (errors / total) * 100 : 0,
        total,
        errors,
      };
    });
  };

  const getAverageScore = () => {
    const examRecords = trainingRecords.filter((r) => r.type === 'exam' && r.score !== undefined);
    if (examRecords.length === 0) return 0;
    const total = examRecords.reduce((sum, r) => sum + (r.score || 0), 0);
    return Math.round(total / examRecords.length);
  };

  return {
    getMasteryHeatmap,
    getScoreTrend,
    getErrorStats,
    getTopicErrorRates,
    getAverageScore,
  };
}
