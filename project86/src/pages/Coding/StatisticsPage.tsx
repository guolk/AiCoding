import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line } from 'recharts';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/UI/Card';
import Badge from '../../components/UI/Badge';
import { Hash, CheckCircle2, AlertCircle, Target, TrendingUp } from 'lucide-react';

const StatisticsPage: React.FC = () => {
  const { state } = useAppContext();
  const problems = state.codingProblems;

  const totalProblems = problems.length;
  const easyCount = problems.filter(p => p.difficulty === 'easy').length;
  const mediumCount = problems.filter(p => p.difficulty === 'medium').length;
  const hardCount = problems.filter(p => p.difficulty === 'hard').length;
  const wrongCount = problems.filter(p => p.isWrong).length;
  const leetcodeCount = problems.filter(p => p.platform === 'leetcode').length;
  const nowcoderCount = problems.filter(p => p.platform === 'nowcoder').length;

  const tagCounts: Record<string, number> = {};
  problems.forEach(p => {
    p.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  const tagData = Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const difficultyData = [
    { name: '简单', value: easyCount, color: '#10b981' },
    { name: '中等', value: mediumCount, color: '#f59e0b' },
    { name: '困难', value: hardCount, color: '#ef4444' },
  ];

  const platformData = [
    { name: 'LeetCode', count: leetcodeCount },
    { name: '牛客', count: nowcoderCount },
    { name: '其他', count: totalProblems - leetcodeCount - nowcoderCount },
  ];

  const dateCounts: Record<string, number> = {};
  problems.forEach(p => {
    dateCounts[p.completedDate] = (dateCounts[p.completedDate] || 0) + 1;
  });

  const trendData = Object.entries(dateCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([date, count]) => ({ date: date.slice(5), count }));

  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">刷题进度统计</h1>
        <p className="text-slate-500 mt-1">按算法类型和难度分析你的刷题情况</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">总刷题数</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">{totalProblems}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Hash className="w-6 h-6 text-primary-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">简单题</p>
              <p className="text-3xl font-bold text-emerald-600 mt-1">{easyCount}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">中等题</p>
              <p className="text-3xl font-bold text-amber-600 mt-1">{mediumCount}</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-amber-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">错题数</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{wrongCount}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">难度分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={difficultyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {difficultyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">平台分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={platformData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-600" />
              近两周刷题趋势
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={2} dot={{ fill: '#0ea5e9' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">算法标签统计（Top 10）</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tagData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="tag" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {tagData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">各标签完成情况</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(tagCounts)
              .sort(([, a], [, b]) => b - a)
              .map(([tag, count]) => {
                const easy = problems.filter(p => p.tags.includes(tag) && p.difficulty === 'easy').length;
                const medium = problems.filter(p => p.tags.includes(tag) && p.difficulty === 'medium').length;
                const hard = problems.filter(p => p.tags.includes(tag) && p.difficulty === 'hard').length;
                const wrong = problems.filter(p => p.tags.includes(tag) && p.isWrong).length;
                
                return (
                  <div key={tag} className="bg-slate-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="primary">{tag}</Badge>
                      <span className="text-2xl font-bold text-slate-800">{count}</span>
                    </div>
                    <div className="flex gap-2 text-sm">
                      <span className="text-emerald-600">简 {easy}</span>
                      <span className="text-amber-600">中 {medium}</span>
                      <span className="text-red-600">难 {hard}</span>
                      {wrong > 0 && <span className="text-red-500">错 {wrong}</span>}
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsPage;
