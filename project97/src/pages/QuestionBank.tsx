import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Plus } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { DifficultyBadge } from '../components/common/DifficultyBadge';
import { TopicBadge } from '../components/common/TopicBadge';
import { useQuestionStore } from '../stores/questionStore';
import type { Topic, Difficulty, CompetitionType } from '../types';

const topics: { value: Topic | 'all'; label: string }[] = [
  { value: 'all', label: '全部专题' },
  { value: 'number_theory', label: '数论' },
  { value: 'combinatorics', label: '组合' },
  { value: 'algebra', label: '代数' },
  { value: 'geometry', label: '几何' },
];

const difficulties: { value: Difficulty | 'all'; label: string }[] = [
  { value: 'all', label: '全部难度' },
  { value: 1, label: '入门' },
  { value: 2, label: '简单' },
  { value: 3, label: '中等' },
  { value: 4, label: '困难' },
  { value: 5, label: '竞赛级' },
];

const competitionTypes: { value: CompetitionType | 'all'; label: string }[] = [
  { value: 'all', label: '全部赛事' },
  { value: 'IMO', label: 'IMO' },
  { value: 'CMO', label: 'CMO' },
  { value: '省赛', label: '省赛' },
  { value: '集训队', label: '集训队' },
  { value: '其他', label: '其他' },
];

export function QuestionBank() {
  const { questions } = useQuestionStore();
  const [search, setSearch] = useState('');
  const [topic, setTopic] = useState<Topic | 'all'>('all');
  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all');
  const [competitionType, setCompetitionType] = useState<CompetitionType | 'all'>('all');

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.content.toLowerCase().includes(search.toLowerCase()) ||
      q.source.toLowerCase().includes(search.toLowerCase());
    const matchesTopic = topic === 'all' || q.topic === topic;
    const matchesDifficulty = difficulty === 'all' || q.difficulty === difficulty;
    const matchesCompetition = competitionType === 'all' || q.competitionType === competitionType;
    return matchesSearch && matchesTopic && matchesDifficulty && matchesCompetition;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">题目库</h1>
          <p className="text-text-secondary mt-1">共 {questions.length} 道竞赛题目</p>
        </div>
        <Link to="/questions/new">
          <Button>
            <Plus className="w-5 h-5 mr-2" />
            录入题目
          </Button>
        </Link>
      </div>

      <Card>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                type="text"
                placeholder="搜索题目内容或来源..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background-hover rounded-lg border border-transparent focus:border-primary focus:outline-none text-text-primary placeholder:text-text-muted"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-text-muted" />
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value as Topic | 'all')}
              className="px-3 py-2 bg-background-hover rounded-lg border border-transparent focus:border-primary focus:outline-none text-text-primary"
            >
              {topics.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(parseInt(e.target.value) as Difficulty | 'all')}
              className="px-3 py-2 bg-background-hover rounded-lg border border-transparent focus:border-primary focus:outline-none text-text-primary"
            >
              {difficulties.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
            <select
              value={competitionType}
              onChange={(e) => setCompetitionType(e.target.value as CompetitionType | 'all')}
              className="px-3 py-2 bg-background-hover rounded-lg border border-transparent focus:border-primary focus:outline-none text-text-primary"
            >
              {competitionTypes.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredQuestions.map((question) => (
          <Link key={question.id} to={`/questions/${question.id}`}>
            <Card hover className="h-full">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <TopicBadge topic={question.topic} />
                    <DifficultyBadge difficulty={question.difficulty} />
                  </div>
                  <span className="text-xs text-text-muted">{question.source}</span>
                </div>
                <p className="text-text-primary line-clamp-3 font-mono text-sm">
                  {question.content}
                </p>
                <div className="flex flex-wrap gap-1">
                  {question.knowledgeTags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-xs bg-background-hover rounded text-text-secondary"
                    >
                      {tag}
                    </span>
                  ))}
                  {question.knowledgeTags.length > 3 && (
                    <span className="px-2 py-0.5 text-xs text-text-muted">
                      +{question.knowledgeTags.length - 3}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span>{question.solutions.length} 种解法</span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {filteredQuestions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-text-muted">没有找到符合条件的题目</p>
        </div>
      )}
    </div>
  );
}
