import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Users, CheckCircle2, XCircle, MessageSquare, Star, Send, Mic, GraduationCap, Coffee, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Textarea from '../../components/ui/Textarea';
import { useActivityStore } from '../../store/useActivityStore';
import { useProjectStore } from '../../store/useProjectStore';
import { ACTIVITY_TYPE_OPTIONS, ACTIVITY_STATUS_OPTIONS } from '../../utils/constants';
import { formatDate, getStatusLabel, getStatusColor, cn } from '../../utils/helpers';
import type { ActivityType, ActivityStatus } from '../../types';

const typeIcons: Record<ActivityType, typeof Mic> = {
  roadshow: Mic,
  training: GraduationCap,
  exchange: Coffee,
};

const typeColors: Record<ActivityType, string> = {
  roadshow: 'from-amber-500 to-orange-500',
  training: 'from-blue-500 to-cyan-500',
  exchange: 'from-emerald-500 to-teal-500',
};

export default function ActivityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const activities = useActivityStore((s) => s.activities);
  const checkInParticipant = useActivityStore((s) => s.checkInParticipant);
  const addActivityFeedback = useActivityStore((s) => s.addActivityFeedback);
  const projects = useProjectStore((s) => s.projects);

  const [activeTab, setActiveTab] = useState<'signin' | 'feedback'>('signin');
  const [feedbackForm, setFeedbackForm] = useState({
    projectId: projects[0]?.id || '',
    rating: 5,
    comment: '',
  });

  const activity = activities.find((a) => a.id === id);

  const stats = useMemo(() => {
    if (!activity) return { total: 0, checkedIn: 0, feedbackCount: 0, avgRating: 0 };
    const total = activity.participants.length;
    const checkedIn = activity.participants.filter((p) => p.checkedIn).length;
    const feedbackCount = activity.feedbacks.length;
    const avgRating =
      feedbackCount > 0
        ? activity.feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbackCount
        : 0;
    return { total, checkedIn, feedbackCount, avgRating };
  }, [activity]);

  const getProjectName = (projectId: string) => {
    return projects.find((p) => p.id === projectId)?.name || '未知项目';
  };

  const getTypeLabel = (value: string) => {
    return ACTIVITY_TYPE_OPTIONS.find((o) => o.value === value)?.label || value;
  };

  const handleSubmitFeedback = () => {
    if (!activity || !feedbackForm.comment.trim()) return;
    addActivityFeedback(activity.id, {
      projectId: feedbackForm.projectId,
      rating: feedbackForm.rating,
      comment: feedbackForm.comment,
      date: new Date().toISOString().split('T')[0],
    });
    setFeedbackForm({ projectId: projects[0]?.id || '', rating: 5, comment: '' });
  };

  const StatusBadge = ({ status }: { status: ActivityStatus }) => (
    <span
      className={cn(
        'px-3 py-1 rounded-full text-xs font-medium',
        getStatusColor(status, ACTIVITY_STATUS_OPTIONS)
      )}
    >
      {getStatusLabel(status, ACTIVITY_STATUS_OPTIONS)}
    </span>
  );

  if (!activity) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/activities')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回活动列表
        </Button>
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-slate-500">活动不存在</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const TypeIcon = typeIcons[activity.type];

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate('/activities')}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        返回活动列表
      </Button>

      <Card>
        <CardContent className="p-0">
          <div className={cn('h-40 bg-gradient-to-br relative overflow-hidden', typeColors[activity.type])}>
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-8 left-8 w-32 h-32 rounded-full bg-white" />
              <div className="absolute bottom-8 right-8 w-48 h-48 rounded-full bg-white" />
            </div>
            <div className="absolute top-6 right-6">
              <StatusBadge status={activity.status} />
            </div>
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between text-white">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <TypeIcon className="w-8 h-8" />
                </div>
                <div>
                  <Badge className="bg-white/20 text-white border-0 mb-2">
                    {getTypeLabel(activity.type)}
                  </Badge>
                  <h1 className="text-2xl font-bold">{activity.name}</h1>
                </div>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">活动日期</p>
                  <p className="font-medium text-slate-900">{formatDate(activity.date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">活动地点</p>
                  <p className="font-medium text-slate-900">{activity.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Users className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">签到率</p>
                  <p className="font-medium text-slate-900">
                    {stats.checkedIn}/{stats.total} ({stats.total > 0 ? Math.round((stats.checkedIn / stats.total) * 100) : 0}%)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">平均评分</p>
                  <p className="font-medium text-slate-900 flex items-center gap-1">
                    {stats.avgRating.toFixed(1)}
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  </p>
                </div>
              </div>
            </div>

            {activity.description && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-sm text-slate-500 mb-2">活动描述</p>
                <p className="text-slate-700">{activity.description}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('signin')}
          className={cn(
            'px-6 py-3 rounded-lg text-sm font-medium transition-all',
            activeTab === 'signin'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-white text-slate-600 hover:bg-slate-50'
          )}
        >
          签到管理
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={cn(
            'px-6 py-3 rounded-lg text-sm font-medium transition-all',
            activeTab === 'feedback'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-white text-slate-600 hover:bg-slate-50'
          )}
        >
          活动反馈
        </button>
      </div>

      {activeTab === 'signin' && (
        <Card>
          <CardHeader>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">签到记录</h2>
              <p className="text-sm text-slate-500 mt-1">管理参与项目的签到状态</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activity.participants.map((participant, index) => (
                <div
                  key={participant.projectId}
                  className={cn(
                    'flex items-center justify-between p-4 rounded-xl transition-all',
                    participant.checkedIn
                      ? 'bg-emerald-50 border border-emerald-200'
                      : 'bg-slate-50 border border-slate-200'
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white font-medium">
                      {getProjectName(participant.projectId).charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        {getProjectName(participant.projectId)}
                      </p>
                      <p className="text-sm text-slate-500">#{index + 1} 参与项目</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {participant.checkedIn ? (
                      <div className="flex items-center gap-2 text-emerald-600">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="text-sm font-medium">已签到</span>
                        {participant.checkInTime && (
                          <span className="text-sm text-emerald-500">
                            {participant.checkInTime}
                          </span>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 text-slate-400">
                          <XCircle className="w-5 h-5" />
                          <span className="text-sm">未签到</span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => checkInParticipant(activity.id, participant.projectId)}
                        >
                          确认签到
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'feedback' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">收集活动反馈</h2>
                  <p className="text-sm text-slate-500 mt-1">记录参与项目的活动评价</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    参与项目
                  </label>
                  <select
                    value={feedbackForm.projectId}
                    onChange={(e) =>
                      setFeedbackForm({ ...feedbackForm, projectId: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    {activity.participants.map((p) => (
                      <option key={p.projectId} value={p.projectId}>
                        {getProjectName(p.projectId)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    活动评分
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                        className="p-1 transition-transform hover:scale-110"
                      >
                        <Star
                          className={cn(
                            'w-8 h-8 transition-colors',
                            star <= feedbackForm.rating
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-slate-300'
                          )}
                        />
                      </button>
                    ))}
                    <span className="ml-3 self-center text-slate-600 font-medium">
                      {feedbackForm.rating} 分
                    </span>
                  </div>
                </div>

                <Textarea
                  label="活动评价"
                  placeholder="请输入对本次活动的评价和建议..."
                  value={feedbackForm.comment}
                  onChange={(e) =>
                    setFeedbackForm({ ...feedbackForm, comment: e.target.value })
                  }
                  rows={4}
                />

                <Button onClick={handleSubmitFeedback} className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  提交反馈
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">历史反馈</h2>
                    <p className="text-sm text-slate-500 mt-1">共 {stats.feedbackCount} 条反馈</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {activity.feedbacks.length > 0 ? (
                  <div className="space-y-4">
                    {activity.feedbacks.map((feedback) => (
                      <div
                        key={feedback.id}
                        className="p-4 bg-slate-50 rounded-xl"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-medium">
                              {getProjectName(feedback.projectId).charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">
                                {getProjectName(feedback.projectId)}
                              </p>
                              <p className="text-xs text-slate-500">
                                {formatDate(feedback.date)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(feedback.rating)].map((_, i) => (
                              <Star
                                key={i}
                                className="w-4 h-4 text-amber-500 fill-amber-500"
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-slate-600">{feedback.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <MessageSquare className="w-12 h-12 mx-auto text-slate-400 mb-2" />
                    <p className="text-slate-500">暂无反馈记录</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-slate-900">评分统计</h2>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold text-slate-900 mb-2">
                    {stats.avgRating.toFixed(1)}
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'w-5 h-5',
                          i < Math.round(stats.avgRating)
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-slate-300'
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-slate-500 mt-2">
                    基于 {stats.feedbackCount} 条评价
                  </p>
                </div>

                {[5, 4, 3, 2, 1].map((star) => {
                  const count = activity.feedbacks.filter(
                    (f) => f.rating === star
                  ).length;
                  const percentage =
                    stats.feedbackCount > 0
                      ? (count / stats.feedbackCount) * 100
                      : 0;
                  return (
                    <div key={star} className="flex items-center gap-3 mb-2">
                      <span className="w-8 text-sm text-slate-600">{star}星</span>
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-8 text-sm text-slate-500 text-right">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
