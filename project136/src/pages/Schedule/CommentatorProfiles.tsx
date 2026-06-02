import React, { useState } from 'react';
import { Star, Mic, Award, Clock, TrendingUp, MessageSquare, Edit2, Plus, Calendar } from 'lucide-react';
import Card from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Progress } from '../../components/ui/Progress';
import { useAppStore } from '../../store/useAppStore';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

const CommentatorProfiles: React.FC = () => {
  const { commentators, matches } = useAppStore();
  const [selectedCommentatorId, setSelectedCommentatorId] = useState(commentators[0]?.id || '');

  const selectedCommentator = commentators.find(c => c.id === selectedCommentatorId);
  const commentatorMatches = matches.filter(m => m.commentatorId === selectedCommentatorId);
  const completedMatches = commentatorMatches.filter(m => m.status === 'completed');

  const skillData = selectedCommentator ? [
    { subject: '语速控制', A: selectedCommentator.skills.speechSpeed, fullMark: 100 },
    { subject: '专业知识', A: selectedCommentator.skills.expertise, fullMark: 100 },
    { subject: '情绪调动', A: selectedCommentator.skills.emotion, fullMark: 100 },
    { subject: '互动能力', A: selectedCommentator.skills.interaction, fullMark: 100 },
    { subject: '临场应变', A: selectedCommentator.skills.improvisation, fullMark: 100 },
  ] : [];

  const getStyleColor = (style: string) => {
    switch (style) {
      case '激情型': return 'bg-red-100 text-red-700';
      case '专业型': return 'bg-blue-100 text-blue-700';
      case '幽默型': return 'bg-yellow-100 text-yellow-700';
      case '温和型': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
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
          <h1 className="text-3xl font-bold text-gray-900">解说员档案</h1>
          <p className="text-gray-500 mt-1">管理解说员信息和评价记录</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          添加解说员
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <Card.Header>
              <Card.Title>解说员列表</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="space-y-2">
                {commentators.map(commentator => (
                  <button
                    key={commentator.id}
                    onClick={() => setSelectedCommentatorId(commentator.id)}
                    className={`w-full p-3 rounded-lg flex items-center gap-3 transition-all ${
                      selectedCommentatorId === commentator.id
                        ? 'bg-indigo-50 border-2 border-indigo-500'
                        : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                    }`}
                  >
                    <img
                      src={commentator.avatar}
                      alt={commentator.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{commentator.name}</p>
                      <p className="text-sm text-gray-500 truncate">{commentator.specialty}</p>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-medium">{commentator.rating}</span>
                    </div>
                  </button>
                ))}
              </div>
            </Card.Content>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {selectedCommentator && (
            <>
              <Card>
                <Card.Content className="pt-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-shrink-0">
                      <img
                        src={selectedCommentator.avatar}
                        alt={selectedCommentator.name}
                        className="w-32 h-32 rounded-2xl object-cover shadow-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">{selectedCommentator.name}</h2>
                          <p className="text-gray-500 mt-1">{selectedCommentator.specialty}</p>
                        </div>
                        <Button variant="outline" size="sm">
                          <Edit2 className="w-4 h-4 mr-1" />
                          编辑
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-4">
                        {selectedCommentator.style.map(s => (
                          <Badge key={s} className={getStyleColor(s)}>
                            {s}
                          </Badge>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        <div className="bg-indigo-50 rounded-lg p-4 text-center">
                          <Mic className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-gray-900">{commentatorMatches.length}</p>
                          <p className="text-sm text-gray-500">总场次</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 text-center">
                          <Award className="w-6 h-6 text-green-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-gray-900">{completedMatches.length}</p>
                          <p className="text-sm text-gray-500">已完成</p>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-4 text-center">
                          <Star className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-gray-900">{selectedCommentator.rating}</p>
                          <p className="text-sm text-gray-500">评分</p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4 text-center">
                          <TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-gray-900">{selectedCommentator.experience}</p>
                          <p className="text-sm text-gray-500">从业年限</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card.Content>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <Card.Header>
                    <Card.Title className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-indigo-600" />
                      能力雷达图
                    </Card.Title>
                  </Card.Header>
                  <Card.Content>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={skillData}>
                          <PolarGrid stroke="#e5e7eb" />
                          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#6b7280' }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                          <Radar
                            name="能力值"
                            dataKey="A"
                            stroke="#6366f1"
                            fill="#6366f1"
                            fillOpacity={0.3}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">语速控制</span>
                          <span className="font-medium">{selectedCommentator.skills.speechSpeed}%</span>
                        </div>
                        <Progress value={selectedCommentator.skills.speechSpeed} />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">专业知识</span>
                          <span className="font-medium">{selectedCommentator.skills.expertise}%</span>
                        </div>
                        <Progress value={selectedCommentator.skills.expertise} />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">情绪调动</span>
                          <span className="font-medium">{selectedCommentator.skills.emotion}%</span>
                        </div>
                        <Progress value={selectedCommentator.skills.emotion} />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">互动能力</span>
                          <span className="font-medium">{selectedCommentator.skills.interaction}%</span>
                        </div>
                        <Progress value={selectedCommentator.skills.interaction} />
                      </div>
                    </div>
                  </Card.Content>
                </Card>

                <Card>
                  <Card.Header>
                    <Card.Title className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-indigo-600" />
                      评价记录
                    </Card.Title>
                  </Card.Header>
                  <Card.Content>
                    <div className="space-y-4 max-h-80 overflow-y-auto">
                      {selectedCommentator.reviews.map((review, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-indigo-600">管</span>
                              </div>
                              <span className="font-medium text-gray-900">{review.reviewer}</span>
                            </div>
                            <div className="flex items-center gap-1 text-yellow-500">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{review.comment}</p>
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(review.date).toLocaleDateString('zh-CN')}
                            </span>
                            <Badge variant="outline">{review.match}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card.Content>
                </Card>
              </div>

              <Card>
                <Card.Header>
                  <Card.Title className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-600" />
                    解说赛事历史
                  </Card.Title>
                </Card.Header>
                <Card.Content>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-500">日期</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-500">对阵</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-500">联赛</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-500">状态</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-500">观众评分</th>
                        </tr>
                      </thead>
                      <tbody>
                        {commentatorMatches.slice(0, 5).map(match => (
                          <tr key={match.id} className="border-b border-gray-100">
                            <td className="py-3 px-4">{new Date(match.startTime).toLocaleDateString('zh-CN')}</td>
                            <td className="py-3 px-4">
                              <span className="font-medium">{match.homeTeam?.name}</span>
                              <span className="mx-2 text-gray-400">vs</span>
                              <span className="font-medium">{match.awayTeam?.name}</span>
                            </td>
                            <td className="py-3 px-4">{match.league}</td>
                            <td className="py-3 px-4">
                              <Badge variant={match.status === 'completed' ? 'success' : 'info'}>
                                {match.status === 'completed' ? '已完成' : '待开始'}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                <span className="font-medium">{(Math.random() * 2 + 3).toFixed(1)}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card.Content>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentatorProfiles;
