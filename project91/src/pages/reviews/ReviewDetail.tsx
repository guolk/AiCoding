import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  UserCheck,
  AlertTriangle,
  Lightbulb,
  FileText,
  Star,
  ThumbsUp,
  BarChart3,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { format } from 'date-fns';

export default function ReviewDetail() {
  const { id } = useParams<{ id: string }>();
  const { activities } = useStore();
  
  const activity = activities.find((a) => a.id === id);
  const [activeTab, setActiveTab] = useState<'summary' | 'results' | 'feedbacks'>('summary');

  if (!activity || !activity.review) {
    return (
      <div className="card p-12 text-center">
        <p className="text-gray-500">复盘记录不存在</p>
        <Link to="/reviews" className="btn btn-primary mt-4">返回列表</Link>
      </div>
    );
  }

  const avgSatisfaction = activity.feedbacks.length > 0
    ? activity.feedbacks.reduce((sum, f) => sum + f.satisfaction, 0) / activity.feedbacks.length
    : 0;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/reviews" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{activity.name}</h1>
          <p className="text-gray-500 mt-1">
            活动复盘 · {format(new Date(activity.review.createdAt), 'yyyy年MM月dd日')}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activity.review.participantCount}</p>
              <p className="text-sm text-gray-500">参与人数</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activity.review.beneficiaryCount}</p>
              <p className="text-sm text-gray-500">受益人数</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activity.review.quantifiableResults.length}</p>
              <p className="text-sm text-gray-500">量化成果</p>
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

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { key: 'summary', label: '活动总结' },
            { key: 'results', label: '量化成果' },
            { key: 'feedbacks', label: `反馈收集 (${activity.feedbacks.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.key
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-500" />
              活动总结
            </h3>
            <p className="text-gray-600 leading-relaxed">{activity.review.summary}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                遇到的问题
              </h3>
              <p className="text-gray-600">{activity.review.issues}</p>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                改进建议
              </h3>
              <p className="text-gray-600">{activity.review.improvements}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'results' && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">服务效果量化记录</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activity.review.quantifiableResults.map((result) => (
              <div key={result.id} className="bg-gradient-to-br from-primary-50 to-green-50 p-6 rounded-xl">
                <p className="text-4xl font-bold text-primary-600">
                  {result.value}
                  <span className="text-lg font-normal text-gray-500 ml-1">{result.unit}</span>
                </p>
                <p className="text-gray-600 mt-2">{result.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'feedbacks' && (
        <div className="space-y-4">
          {activity.feedbacks.length === 0 ? (
            <div className="card p-12 text-center">
              <ThumbsUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">暂无反馈</p>
            </div>
          ) : (
            activity.feedbacks.map((feedback) => (
              <div key={feedback.id} className="card p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-medium">
                        {feedback.volunteerName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{feedback.volunteerName}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(feedback.createdAt), 'yyyy-MM-dd HH:mm')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {renderStars(feedback.satisfaction)}
                  </div>
                </div>
                <p className="text-gray-600 mt-4">{feedback.comment}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
