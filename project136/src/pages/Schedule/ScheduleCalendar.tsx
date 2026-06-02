import React, { useState, useMemo } from 'react';
import { Calendar, Clock, Users, ChevronLeft, ChevronRight, Plus, Edit2, Trash2, Mic } from 'lucide-react';
import Card from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAppStore } from '../../store/useAppStore';
import { Match } from '../../types';

const ScheduleCalendar: React.FC = () => {
  const { matches, commentators } = useAppStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDay = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  }, [startDay, daysInMonth]);

  const matchesByDate = useMemo(() => {
    const map: Record<string, Match[]> = {};
    matches.forEach(match => {
      const dateKey = new Date(match.startTime).toDateString();
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(match);
    });
    return map;
  }, [matches]);

  const getMatchesForDay = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return matchesByDate[date.toDateString()] || [];
  };

  const getCommentatorName = (id: string) => {
    const commentator = commentators.find(c => c.id === id);
    return commentator?.name || '未分配';
  };

  const getCommentatorAvatar = (id: string) => {
    const commentator = commentators.find(c => c.id === id);
    return commentator?.avatar;
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

  const getStatusColor = (status: Match['status']) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-500';
      case 'live': return 'bg-red-500 animate-pulse';
      case 'completed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: Match['status']) => {
    switch (status) {
      case 'upcoming': return '待开始';
      case 'live': return '直播中';
      case 'completed': return '已结束';
      default: return '未知';
    }
  };

  const getMatchTime = (startTime: string) => {
    const date = new Date(startTime);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">排班日历</h1>
          <p className="text-gray-500 mt-1">查看和管理比赛解说排班</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          添加比赛
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <Card.Header>
              <div className="flex items-center justify-between">
                <Card.Title className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  {currentDate.getFullYear()}年 {monthNames[currentDate.getMonth()]}
                </Card.Title>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={prevMonth}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={nextMonth}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card.Header>
            <Card.Content>
              <div className="grid grid-cols-7 gap-1">
                {weekDays.map(day => (
                  <div key={day} className="text-center py-2 text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    className={`min-h-24 p-2 rounded-lg border transition-all cursor-pointer hover:bg-gray-50 ${
                      day === null
                        ? 'bg-gray-50 border-transparent'
                        : isToday(day)
                        ? 'bg-indigo-50 border-indigo-300'
                        : 'border-gray-200'
                    }`}
                    onClick={() => day && getMatchesForDay(day).length > 0 && setSelectedMatch(getMatchesForDay(day)[0])}
                  >
                    {day && (
                      <>
                        <span className={`text-sm font-medium ${isToday(day) ? 'text-indigo-600' : 'text-gray-700'}`}>
                          {day}
                        </span>
                        <div className="mt-1 space-y-1">
                          {getMatchesForDay(day).slice(0, 2).map(match => (
                            <div
                              key={match.id}
                              className="text-xs p-1 rounded bg-indigo-100 text-indigo-700 truncate"
                              title={`${match.homeTeam?.name || '未知'} vs ${match.awayTeam?.name || '未知'}`}
                            >
                              {(match.homeTeam?.name || '').substring(0, 2)} vs {(match.awayTeam?.name || '').substring(0, 2)}
                            </div>
                          ))}
                          {getMatchesForDay(day).length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{getMatchesForDay(day).length - 2} 更多
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </Card.Content>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <Card.Header>
              <Card.Title className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-orange-500" />
                解说员排班
              </Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                {commentators.map(commentator => {
                  const commentatorMatches = matches.filter(
                    m => m.commentatorId === commentator.id && m.status === 'upcoming'
                  );
                  return (
                    <div key={commentator.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                      <img
                        src={commentator.avatar}
                        alt={commentator.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{commentator.name}</p>
                        <p className="text-sm text-gray-500">{commentator.specialty}</p>
                      </div>
                      <Badge variant="primary">{commentatorMatches.length}场</Badge>
                    </div>
                  );
                })}
              </div>
            </Card.Content>
          </Card>

          {selectedMatch && (
            <Card>
              <Card.Header>
                <Card.Title>比赛详情</Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-4 mb-2">
                      <span className="font-bold text-lg">{selectedMatch.homeTeam?.name}</span>
                      <span className="text-gray-400">VS</span>
                      <span className="font-bold text-lg">{selectedMatch.awayTeam?.name}</span>
                    </div>
                    <Badge className={getStatusColor(selectedMatch.status)}>
                      {getStatusText(selectedMatch.status)}
                    </Badge>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(selectedMatch.startTime).toLocaleDateString('zh-CN')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{getMatchTime(selectedMatch.startTime)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>解说：{getCommentatorName(selectedMatch.commentatorId)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit2 className="w-4 h-4 mr-1" />
                      编辑
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card.Content>
            </Card>
          )}
        </div>
      </div>

      <Card>
        <Card.Header>
          <Card.Title>本周赛事安排</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">日期</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">时间</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">对阵</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">联赛</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">解说员</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">状态</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {matches.slice(0, 8).map(match => (
                  <tr key={match.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{new Date(match.startTime).toLocaleDateString('zh-CN')}</td>
                    <td className="py-3 px-4">{getMatchTime(match.startTime)}</td>
                    <td className="py-3 px-4">
                      <span className="font-medium">{match.homeTeam?.name}</span>
                      <span className="mx-2 text-gray-400">vs</span>
                      <span className="font-medium">{match.awayTeam?.name}</span>
                    </td>
                    <td className="py-3 px-4">{match.league}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={getCommentatorAvatar(match.commentatorId)}
                          alt=""
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span>{getCommentatorName(match.commentatorId)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block w-2 h-2 rounded-full mr-2 ${getStatusColor(match.status)}`}></span>
                      {getStatusText(match.status)}
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="sm">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

export default ScheduleCalendar;
