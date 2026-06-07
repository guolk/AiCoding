import { useState, useMemo } from 'react';
import { Star, MessageSquare, ChevronDown, ChevronUp, X, Tag, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import {
  reviewStatusLabels,
  reviewStatusColors,
  platformNames,
  platformColors,
  formatDate,
} from '@/lib/api';
import type { NegativeReview, ReviewStatus, Product } from '@/../shared/types';

const reasonCategories = ['质量问题', '佩戴舒适度', '续航问题', '图文不符'];

const reasonCategoryColors: Record<string, string> = {
  '质量问题': 'bg-danger-600/20 text-danger-500 border-danger-600/30',
  '佩戴舒适度': 'bg-warning-600/20 text-warning-500 border-warning-600/30',
  '续航问题': 'bg-primary-600/20 text-primary-400 border-primary-600/30',
  '图文不符': 'bg-purple-600/20 text-purple-400 border-purple-600/30',
};

interface ReviewFormData {
  responseStrategy: string;
  reasonCategory: string;
}

const statusIcons = {
  pending: AlertCircle,
  responded: Clock,
  resolved: CheckCircle,
};

export function Reviews() {
  const { negativeReviews, products, updateReviewResponse } = useAppStore();
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | 'all'>('all');
  const [expandedReview, setExpandedReview] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<NegativeReview | null>(null);
  const [formData, setFormData] = useState<ReviewFormData>({
    responseStrategy: '',
    reasonCategory: '',
  });

  const getProductById = (productId: string): Product | undefined => {
    return products.find((p) => p.id === productId);
  };

  const filteredReviews = useMemo(() => {
    const sorted = [...negativeReviews].sort((a, b) => {
      const statusOrder: Record<string, number> = { pending: 0, responded: 1, resolved: 2 };
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;
      return b.date.localeCompare(a.date);
    });

    if (statusFilter === 'all') return sorted;
    return sorted.filter((r) => r.status === statusFilter);
  }, [negativeReviews, statusFilter]);

  const statusCounts = useMemo(() => {
    return {
      all: negativeReviews.length,
      pending: negativeReviews.filter((r) => r.status === 'pending').length,
      responded: negativeReviews.filter((r) => r.status === 'responded').length,
      resolved: negativeReviews.filter((r) => r.status === 'resolved').length,
    };
  }, [negativeReviews]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? 'text-warning-500 fill-warning-500' : 'text-dark-600'}
          />
        ))}
      </div>
    );
  };

  const handleOpenEditModal = (review: NegativeReview) => {
    setSelectedReview(review);
    setFormData({
      responseStrategy: review.responseStrategy || '',
      reasonCategory: review.reasonCategory || '',
    });
    setShowEditModal(true);
  };

  const handleSaveResponse = () => {
    if (selectedReview && formData.responseStrategy && formData.reasonCategory) {
      updateReviewResponse(selectedReview.id, formData.responseStrategy, formData.reasonCategory);
      setShowEditModal(false);
      setSelectedReview(null);
      setFormData({ responseStrategy: '', reasonCategory: '' });
    }
  };

  const statusTabs = [
    { id: 'all' as const, label: '全部' },
    { id: 'pending' as const, label: '待处理' },
    { id: 'responded' as const, label: '已回复' },
    { id: 'resolved' as const, label: '已解决' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {statusTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
              statusFilter === tab.id
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
                : 'bg-dark-700/50 text-gray-400 hover:text-white hover:bg-dark-700 border border-white/10'
            }`}
          >
            {tab.label}
            <span className={`px-2 py-0.5 rounded-full text-xs font-mono ${
              statusFilter === tab.id
                ? 'bg-white/20 text-white'
                : 'bg-dark-600 text-gray-400'
            }`}>
              {statusCounts[tab.id]}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredReviews.map((review: NegativeReview, index: number) => {
          const product = getProductById(review.productId);
          const isExpanded = expandedReview === review.id;
          const StatusIcon = statusIcons[review.status];

          return (
            <div
              key={review.id}
              className="glass-card-hover overflow-hidden"
              style={{
                animationDelay: `${index * 50}ms`,
                opacity: 0,
                animation: `fadeInUp 0.5s ease-out ${index * 50}ms forwards`,
              }}
            >
              <div
                className="p-5 cursor-pointer"
                onClick={() => setExpandedReview(isExpanded ? null : review.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <StatusIcon size={16} className={
                          review.status === 'pending' ? 'text-danger-500' :
                          review.status === 'responded' ? 'text-warning-500' : 'text-success-500'
                        } />
                        <span className={reviewStatusColors[review.status]}>
                          {reviewStatusLabels[review.status]}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: platformColors[review.platform] }}
                        />
                        <span className="text-xs text-gray-500">
                          {platformNames[review.platform]}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">{formatDate(review.date)}</span>
                    </div>

                    <div className="flex items-center gap-3 mb-2">
                      {renderStars(review.rating)}
                      <span className="text-xs text-gray-500">by {review.reviewer}</span>
                    </div>

                    <h4 className="font-medium text-white mb-1">
                      {product?.name || '未知产品'}
                    </h4>
                    {product && (
                      <p className="text-xs text-gray-500 font-mono mb-3">SKU: {product.sku}</p>
                    )}

                    <p className="text-gray-300 line-clamp-2">{review.content}</p>

                    {review.reasonCategory && (
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <Tag size={14} className="text-gray-500" />
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          reasonCategoryColors[review.reasonCategory] || 'bg-dark-600 text-gray-400 border-dark-500'
                        }`}>
                          {review.reasonCategory}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {review.status === 'pending' && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-danger-600/20 text-danger-500 border border-danger-600/30 animate-pulse">
                        待处理
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditModal(review);
                      }}
                      className="btn-secondary text-sm px-3 py-1.5 flex items-center gap-1.5"
                    >
                      <MessageSquare size={14} />
                      <span>{review.responseStrategy ? '编辑' : '回复'}</span>
                    </button>
                    {isExpanded ? (
                      <ChevronUp size={20} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={20} className="text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-dark-700 p-5 bg-dark-800/30">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-sm font-semibold text-white mb-3">评论详情</h5>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">评论 ID</span>
                          <span className="text-gray-300 font-mono">{review.reviewId || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">评论日期</span>
                          <span className="text-gray-300">{formatDate(review.date)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">评分</span>
                          <div>{renderStars(review.rating)}</div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">原因分类</span>
                          <span className={review.reasonCategory ? 'text-gray-300' : 'text-gray-500'}>
                            {review.reasonCategory || '未分类'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-sm font-semibold text-white mb-3">回复策略</h5>
                      {review.responseStrategy ? (
                        <div className="bg-dark-700/50 rounded-lg p-4">
                          <p className="text-gray-300 text-sm leading-relaxed">
                            {review.responseStrategy}
                          </p>
                          {review.responseDate && (
                            <p className="text-xs text-gray-500 mt-3">
                              回复于 {formatDate(review.responseDate)}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="bg-dark-700/50 rounded-lg p-4 text-center">
                          <MessageSquare size={24} className="mx-auto text-gray-600 mb-2" />
                          <p className="text-sm text-gray-500">暂无回复策略</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <h5 className="text-sm font-semibold text-white mb-2">评论内容</h5>
                    <div className="bg-dark-700/50 rounded-lg p-4">
                      <p className="text-gray-300 text-sm leading-relaxed">{review.content}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredReviews.length === 0 && (
        <div className="glass-card p-12 text-center">
          <MessageSquare size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">暂无符合条件的差评</p>
        </div>
      )}

      {showEditModal && selectedReview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card p-6 w-full max-w-lg mx-4 animate-fadeInUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">处理差评</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-dark-700 rounded-lg transition-colors text-gray-400"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mb-6 p-4 bg-dark-700/50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                {renderStars(selectedReview.rating)}
                <span className="text-xs text-gray-500">{formatDate(selectedReview.date)}</span>
              </div>
              <p className="text-sm text-gray-300">{selectedReview.content}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">原因分类</label>
                <div className="flex flex-wrap gap-2">
                  {reasonCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setFormData({ ...formData, reasonCategory: category })}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                        formData.reasonCategory === category
                          ? `${reasonCategoryColors[category]} ring-2 ring-offset-2 ring-offset-dark-800`
                          : 'bg-dark-700/50 text-gray-400 border-dark-600 hover:bg-dark-700'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">回复策略</label>
                <textarea
                  value={formData.responseStrategy}
                  onChange={(e) => setFormData({ ...formData, responseStrategy: e.target.value })}
                  placeholder="请输入针对此差评的回复策略..."
                  rows={5}
                  className="input-field w-full resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="btn-secondary flex-1"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveResponse}
                  className="btn-primary flex-1"
                  disabled={!formData.responseStrategy.trim() || !formData.reasonCategory}
                >
                  保存回复
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
