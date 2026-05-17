import { useMemo } from 'react';
import { useAppStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { IDEA_SOURCES, IDEA_EMOTIONS } from '@/types';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  TrendingUp,
  Lightbulb,
  Target,
  Clock,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Calendar,
} from 'lucide-react';

const COLORS = ['#8b5cf6', '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6'];

export default function AnalyticsPage() {
  const ideas = useAppStore(state => state.ideas);
  const projects = useAppStore(state => state.projects);
  const tags = useAppStore(state => state.tags);

  const tagStats = useMemo(() => {
    const tagCount: Record<string, number> = {};
    ideas.forEach(idea => {
      idea.tags.forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });
    projects.forEach(project => {
      project.tags.forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });
    return Object.entries(tagCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [ideas, projects]);

  const sourceStats = useMemo(() => {
    const sourceCount: Record<string, number> = {};
    ideas.forEach(idea => {
      sourceCount[idea.source] = (sourceCount[idea.source] || 0) + 1;
    });
    return IDEA_SOURCES.map(source => ({
      name: source.label,
      value: sourceCount[source.value] || 0,
      icon: source.icon,
    })).filter(s => s.value > 0);
  }, [ideas]);

  const emotionStats = useMemo(() => {
    const emotionCount: Record<string, number> = {};
    ideas.forEach(idea => {
      emotionCount[idea.emotion] = (emotionCount[idea.emotion] || 0) + 1;
    });
    return IDEA_EMOTIONS.map(emotion => ({
      name: emotion.label,
      value: emotionCount[emotion.value] || 0,
      emoji: emotion.emoji,
    })).filter(e => e.value > 0);
  }, [ideas]);

  const conversionStats = useMemo(() => {
    const convertedIdeas = ideas.filter(i => i.status === 'project').length;
    const conversionRate = ideas.length > 0 ? Math.round((convertedIdeas / ideas.length) * 100) : 0;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const abandonedProjects = projects.filter(p => p.status === 'abandoned').length;
    const inProgressProjects = projects.filter(p => p.status === 'in_progress').length;
    
    return {
      totalIdeas: ideas.length,
      convertedIdeas,
      conversionRate,
      totalProjects: projects.length,
      completedProjects,
      abandonedProjects,
      inProgressProjects,
      projectCompletionRate: projects.length > 0 ? Math.round((completedProjects / projects.length) * 100) : 0,
    };
  }, [ideas, projects]);

  const weeklyTrend = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const ideaCounts = last7Days.map(date => {
      const count = ideas.filter(idea => 
        idea.createdAt.startsWith(date)
      ).length;
      return { date: date.slice(5), ideas: count };
    });

    return ideaCounts;
  }, [ideas]);

  const hourlyDistribution = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const counts = hours.map(hour => {
      const count = ideas.filter(idea => {
        const ideaHour = new Date(idea.createdAt).getHours();
        return ideaHour === hour;
      }).length;
      return { hour: `${hour}:00`, count };
    });
    
    const peakHour = counts.reduce((max, curr) => curr.count > max.count ? curr : max, counts[0]);
    return { data: counts, peakHour };
  }, [ideas]);

  const radarData = useMemo(() => {
    const sourceRadar = IDEA_SOURCES.slice(0, 6).map(source => {
      const count = ideas.filter(i => i.source === source.value).length;
      return { subject: source.label, A: count, fullMark: Math.max(count, 5) };
    });
    return sourceRadar;
  }, [ideas]);

  const topTags = tags.sort((a, b) => b.usageCount - a.usageCount).slice(0, 10);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
          创意分析
        </h1>
        <p className="text-muted-foreground mt-1">洞察你的创意模式和趋势</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Lightbulb className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{conversionStats.totalIdeas}</p>
                <p className="text-xs text-gray-500">总灵感数</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{conversionStats.conversionRate}%</p>
                <p className="text-xs text-gray-500">转化率</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{conversionStats.totalProjects}</p>
                <p className="text-xs text-gray-500">总项目数</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{hourlyDistribution.peakHour.hour}</p>
                <p className="text-xs text-gray-500">创意高峰</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-purple-500" />
              灵感主题分布
            </CardTitle>
            <CardDescription>什么类型的灵感最多</CardDescription>
          </CardHeader>
          <CardContent>
            {tagStats.length > 0 ? (
              <div className="flex items-center gap-4">
                <div className="flex-1 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={tagStats}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {tagStats.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1">
                  {tagStats.map((tag, index) => (
                    <div key={tag.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm">{tag.name}</span>
                      <span className="text-xs text-gray-500">({tag.value})</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-400 py-8">暂无数据</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              灵感来源分布
            </CardTitle>
            <CardDescription>你的灵感通常来自哪里</CardDescription>
          </CardHeader>
          <CardContent>
            {sourceStats.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sourceStats} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={60} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center text-gray-400 py-8">暂无数据</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-500" />
              本周灵感趋势
            </CardTitle>
            <CardDescription>过去7天的灵感数量</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="ideas" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-500" />
              创意时段分析
            </CardTitle>
            <CardDescription>一天中哪个时段灵感最丰富</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyDistribution.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>转化漏斗</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">灵感总数</span>
                <span className="font-medium">{conversionStats.totalIdeas}</span>
              </div>
              <div className="h-3 bg-purple-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">转化为项目</span>
                <span className="font-medium">{conversionStats.convertedIdeas}</span>
              </div>
              <div className="h-3 bg-blue-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${conversionStats.conversionRate}%` }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">进行中</span>
                <span className="font-medium">{conversionStats.inProgressProjects}</span>
              </div>
              <div className="h-3 bg-yellow-100 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${conversionStats.totalProjects > 0 ? (conversionStats.inProgressProjects / conversionStats.totalProjects) * 100 : 0}%` }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">已完成</span>
                <span className="font-medium">{conversionStats.completedProjects}</span>
              </div>
              <div className="h-3 bg-green-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${conversionStats.projectCompletionRate}%` }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">已放弃</span>
                <span className="font-medium">{conversionStats.abandonedProjects}</span>
              </div>
              <div className="h-3 bg-red-100 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: `${conversionStats.totalProjects > 0 ? (conversionStats.abandonedProjects / conversionStats.totalProjects) * 100 : 0}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>情绪分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {emotionStats.map((emotion, index) => (
                <div key={emotion.name} className="flex items-center gap-3">
                  <span className="text-xl w-8">{emotion.emoji}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{emotion.name}</span>
                      <span className="text-gray-500">{emotion.value}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${ideas.length > 0 ? (emotion.value / ideas.length) * 100 : 0}%`,
                          backgroundColor: COLORS[index % COLORS.length]
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>热门标签</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {topTags.map(tag => (
                <div
                  key={tag.id}
                  className="px-3 py-1.5 rounded-full bg-gray-100 text-sm flex items-center gap-1"
                >
                  <span>#{tag.name}</span>
                  <span className="text-gray-500 text-xs">({tag.usageCount})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
