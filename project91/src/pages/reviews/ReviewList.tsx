import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Users, TrendingUp, Star, Search, Calendar } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { format } from 'date-fns';

export default function ReviewList() {
  const { activities } = useStore();
  const [searchTerm, setSearchTerm] = useState('');

  const reviewedActivities = activities
    .filter((a) => a.review)
    .filter((a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const avgSatisfaction = reviewedActivities.length > 0
    ? reviewedActivities.reduce((sum, a) => {
        const avg = a.feedbacks.length > 0
          ? a.feedbacks.reduce((s, f) => s + f.satisfaction, 0) / a.feedbacks.length
          : 0;
        return sum + avg;
      }, 0) / reviewedActivities.length
    : 0;

  const totalBeneficiaries = reviewedActivities.reduce(
    (sum, a) => sum + (a.review?.beneficiaryCount || 0),
    0
  );

  const totalParticipants = reviewedActivities.reduce(
    (sum, a) => sum + (a.review?.participantCount || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">活动复盘</h1>
        <p className="text-gray-500 mt-1">查看已完成活动的总结、效果数据和志愿者反馈</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{reviewedActivities.length}</p>
              <p className="text-sm text-gray-500">已复盘活动</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalParticipants}</p>
              <p className="text-sm text-gray-500">参与志愿者</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalBeneficiaries}</p>
              <p className="text-sm text-gray-500">受益人数</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Star className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{avgSatisfaction.toFixed(1)}</p>
              <p className="text-sm text-gray-500">平均满意度</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索活动名称..."
            className="input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Review List */}
      <div className="space-y-4">
        {reviewedActivities.length === 0 ? (
          <div className="card p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">暂无复盘记录</p>
          </div>
        ) : (
          reviewedActivities.map((activity) => (
            <Link
              key={activity.id}
              to={`/reviews/${activity.id}`}
              className="card p-6 hover:shadow-md transition-shadow block"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">{activity.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    {format(new Date(activity.startTime), 'yyyy-MM-dd')} · {activity.location}
                  </p>
                  {activity.review && (
                    <p className="text-gray-600 mt-2 line-clamp-2">{activity.review.summary}</p>
                  )}
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{activity.review?.participantCount || 0}</p>
                    <p className="text-xs text-gray-500">参与人数</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{activity.review?.beneficiaryCount || 0}</p>
                    <p className="text-xs text-gray-500">受益人数</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      <span className="text-xl font-bold">
                        {activity.feedbacks.length > 0
                          ? (activity.feedbacks.reduce((s, f) => s + f.satisfaction, 0) / activity.feedbacks.length).toFixed(1)
                          : '-'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{activity.feedbacks.length} 条反馈</p>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
