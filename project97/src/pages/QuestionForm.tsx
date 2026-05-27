import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useQuestionStore } from '../stores/questionStore';
import type { Topic, Difficulty, CompetitionType } from '../types';

const topics: { value: Topic; label: string }[] = [
  { value: 'number_theory', label: '数论' },
  { value: 'combinatorics', label: '组合' },
  { value: 'algebra', label: '代数' },
  { value: 'geometry', label: '几何' },
];

const competitionTypes: { value: CompetitionType; label: string }[] = [
  { value: 'IMO', label: 'IMO' },
  { value: 'CMO', label: 'CMO' },
  { value: '省赛', label: '省赛' },
  { value: '集训队', label: '集训队' },
  { value: '其他', label: '其他' },
];

interface SolutionInput {
  method: string;
  idea: string;
  content: string;
  applicableTo: string;
}

export function QuestionForm() {
  const navigate = useNavigate();
  const { addQuestion } = useQuestionStore();

  const [content, setContent] = useState('');
  const [source, setSource] = useState('');
  const [competitionType, setCompetitionType] = useState<CompetitionType>('其他');
  const [topic, setTopic] = useState<Topic>('number_theory');
  const [difficulty, setDifficulty] = useState<Difficulty>(3);
  const [knowledgeTags, setKnowledgeTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [solutions, setSolutions] = useState<SolutionInput[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAddTag = () => {
    if (tagInput.trim() && !knowledgeTags.includes(tagInput.trim())) {
      setKnowledgeTags([...knowledgeTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setKnowledgeTags(knowledgeTags.filter((t) => t !== tag));
  };

  const handleAddSolution = () => {
    setSolutions([
      ...solutions,
      { method: '', idea: '', content: '', applicableTo: '' },
    ]);
  };

  const handleRemoveSolution = (index: number) => {
    setSolutions(solutions.filter((_, i) => i !== index));
  };

  const handleSolutionChange = (index: number, field: keyof SolutionInput, value: string) => {
    const newSolutions = [...solutions];
    newSolutions[index] = { ...newSolutions[index], [field]: value };
    setSolutions(newSolutions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      alert('请输入题目内容');
      return;
    }

    try {
      addQuestion({
        content: content.trim(),
        source: source.trim() || '未知来源',
        competitionType,
        topic,
        difficulty,
        knowledgeTags,
        solutions: solutions
          .filter((s) => s.method.trim())
          .map((s) => ({
            id: crypto.randomUUID(),
            ...s,
          })),
      });

      setShowSuccess(true);
      setTimeout(() => {
        navigate('/questions');
      }, 800);
    } catch (error) {
      console.error('保存题目失败:', error);
      alert('保存失败，请重试');
    }
  };

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <CheckCircle2 className="w-16 h-16 text-success" />
        <h2 className="text-xl font-semibold text-text-primary">题目保存成功！</h2>
        <p className="text-text-secondary">正在返回题目库...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold text-text-primary">录入新题目</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>题目信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                题目内容 (支持 LaTeX)
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="例如: 求所有满足 $a^2 + b^2 = c^2$ 的正整数三元组..."
                rows={4}
                className="w-full px-4 py-3 bg-background-hover rounded-lg border border-transparent focus:border-primary focus:outline-none text-text-primary placeholder:text-text-muted font-mono"
              />
              <p className="mt-1 text-xs text-text-muted">
                使用 LaTeX 格式书写数学公式，如 $x^2$
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  题目来源
                </label>
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="例如: 2023 CMO"
                  className="w-full px-4 py-2 bg-background-hover rounded-lg border border-transparent focus:border-primary focus:outline-none text-text-primary placeholder:text-text-muted"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  竞赛类型
                </label>
                <select
                  value={competitionType}
                  onChange={(e) => setCompetitionType(e.target.value as CompetitionType)}
                  className="w-full px-4 py-2 bg-background-hover rounded-lg border border-transparent focus:border-primary focus:outline-none text-text-primary"
                >
                  {competitionTypes.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  所属专题
                </label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value as Topic)}
                  className="w-full px-4 py-2 bg-background-hover rounded-lg border border-transparent focus:border-primary focus:outline-none text-text-primary"
                >
                  {topics.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  难度等级
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(parseInt(e.target.value) as Difficulty)}
                  className="w-full px-4 py-2 bg-background-hover rounded-lg border border-transparent focus:border-primary focus:outline-none text-text-primary"
                >
                  <option value={1}>1 - 入门</option>
                  <option value={2}>2 - 简单</option>
                  <option value={3}>3 - 中等</option>
                  <option value={4}>4 - 困难</option>
                  <option value={5}>5 - 竞赛级</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                知识点标签
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="输入标签后按回车添加"
                  className="flex-1 px-4 py-2 bg-background-hover rounded-lg border border-transparent focus:border-primary focus:outline-none text-text-primary placeholder:text-text-muted"
                />
                <Button type="button" variant="secondary" onClick={handleAddTag}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {knowledgeTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-danger"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>解题方法</CardTitle>
              <Button type="button" variant="secondary" size="sm" onClick={handleAddSolution}>
                <Plus className="w-4 h-4 mr-1" />
                添加解法
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {solutions.length === 0 ? (
              <p className="text-center text-text-muted py-4">
                暂无解法，点击上方按钮添加
              </p>
            ) : (
              <div className="space-y-4">
                {solutions.map((solution, index) => (
                  <div key={index} className="p-4 bg-background-hover rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-text-primary">解法 {index + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSolution(index)}
                      >
                        <Trash2 className="w-4 h-4 text-danger" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-text-muted mb-1">解法名称</label>
                        <input
                          type="text"
                          value={solution.method}
                          onChange={(e) => handleSolutionChange(index, 'method', e.target.value)}
                          placeholder="例如: 数学归纳法"
                          className="w-full px-3 py-2 bg-background rounded-lg border border-transparent focus:border-primary focus:outline-none text-text-primary text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-text-muted mb-1">适用场景</label>
                        <input
                          type="text"
                          value={solution.applicableTo}
                          onChange={(e) => handleSolutionChange(index, 'applicableTo', e.target.value)}
                          placeholder="例如: 递推关系证明"
                          className="w-full px-3 py-2 bg-background rounded-lg border border-transparent focus:border-primary focus:outline-none text-text-primary text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-text-muted mb-1">思路分析</label>
                      <input
                        type="text"
                        value={solution.idea}
                        onChange={(e) => handleSolutionChange(index, 'idea', e.target.value)}
                        placeholder="简要描述解题思路"
                        className="w-full px-3 py-2 bg-background rounded-lg border border-transparent focus:border-primary focus:outline-none text-text-primary text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-text-muted mb-1">详细步骤</label>
                      <textarea
                        value={solution.content}
                        onChange={(e) => handleSolutionChange(index, 'content', e.target.value)}
                        placeholder="详细写出解题过程 (支持 LaTeX)"
                        rows={3}
                        className="w-full px-3 py-2 bg-background rounded-lg border border-transparent focus:border-primary focus:outline-none text-text-primary text-sm font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            取消
          </Button>
          <Button type="submit">
            保存题目
          </Button>
        </div>
      </form>
    </div>
  );
}
