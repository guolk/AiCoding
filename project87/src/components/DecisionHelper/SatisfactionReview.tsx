import React, { useState } from 'react';
import { Star, Plus, MessageSquare, ShoppingBag, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useApp } from '../../store/AppContext';

const SatisfactionReview: React.FC = () => {
  const { products, satisfactionReviews, addSatisfactionReview } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReview, setNewReview] = useState({
    productId: '',
    purchaseDate: '',
    rating: 5,
    pros: ['', '', ''],
    cons: ['', '', ''],
    overallFeeling: '',
    wouldRecommend: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find((p) => p.id === newReview.productId);
    if (product && newReview.purchaseDate) {
      addSatisfactionReview({
        productId: newReview.productId,
        productName: product.name,
        purchaseDate: newReview.purchaseDate,
        reviewDate: new Date().toISOString().split('T')[0],
        rating: newReview.rating,
        pros: newReview.pros.filter((p) => p.trim()),
        cons: newReview.cons.filter((c) => c.trim()),
        overallFeeling: newReview.overallFeeling,
        wouldRecommend: newReview.wouldRecommend,
      });
      setNewReview({
        productId: '',
        purchaseDate: '',
        rating: 5,
        pros: ['', '', ''],
        cons: ['', '', ''],
        overallFeeling: '',
        wouldRecommend: true,
      });
      setShowAddForm(false);
    }
  };

  const updatePro = (index: number, value: string) => {
    const newPros = [...newReview.pros];
    newPros[index] = value;
    setNewReview({ ...newReview, pros: newPros });
  };

  const updateCon = (index: number, value: string) => {
    const newCons = [...newReview.cons];
    newCons[index] = value;
    setNewReview({ ...newReview, cons: newCons });
  };

  const renderStars = (rating: number, interactive = false, onChange?: (r: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onChange && onChange(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          >
            <Star
              size={24}
              className={star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
            />
          </button>
        ))}
      </div>
    );
  };

  const avgRating = satisfactionReviews.length > 0
    ? (satisfactionReviews.reduce((sum, r) => sum + r.rating, 0) / satisfactionReviews.length).toFixed(1)
    : 0;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">满意度回访</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Plus size={18} />
          记录回访
        </button>
      </div>

      {satisfactionReviews.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">已评价产品</p>
            <p className="text-3xl font-bold text-gray-800">{satisfactionReviews.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">平均评分</p>
            <p className="text-3xl font-bold text-yellow-500">{avgRating}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">推荐率</p>
            <p className="text-3xl font-bold text-green-500">
              {Math.round(
                (satisfactionReviews.filter((r) => r.wouldRecommend).length / satisfactionReviews.length) * 100
              )}%
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">使用天数</p>
            <p className="text-3xl font-bold text-blue-500">
              {Math.round(
                satisfactionReviews.reduce((sum, r) => {
                  const days = (new Date().getTime() - new Date(r.purchaseDate).getTime()) / (1000 * 60 * 60 * 24);
                  return sum + days;
                }, 0) / satisfactionReviews.length
              )}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {satisfactionReviews.map((review) => (
          <div key={review.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-orange-400 to-amber-500 px-4 py-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-white">{review.productName}</h3>
                  <p className="text-orange-100 text-sm">
                    购买于 {new Date(review.purchaseDate).toLocaleDateString('zh-CN')}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    review.wouldRecommend ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {review.wouldRecommend ? '推荐' : '不推荐'}
                </span>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                {renderStars(review.rating)}
                <span className="text-2xl font-bold text-gray-800">{review.rating}.0</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <ThumbsUp size={14} className="text-green-500" />
                    优点
                  </h4>
                  <ul className="space-y-1">
                    {review.pros.slice(0, 2).map((pro, idx) => (
                      <li key={idx} className="text-sm text-gray-600">• {pro}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <ThumbsDown size={14} className="text-red-500" />
                    缺点
                  </h4>
                  <ul className="space-y-1">
                    {review.cons.slice(0, 2).map((con, idx) => (
                      <li key={idx} className="text-sm text-gray-600">• {con}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {review.overallFeeling && (
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-start gap-2">
                    <MessageSquare size={14} className="text-gray-400 mt-0.5" />
                    <p className="text-sm text-gray-600">{review.overallFeeling}</p>
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-400 mt-3 text-right">
                回访于 {new Date(review.reviewDate).toLocaleDateString('zh-CN')}
              </p>
            </div>
          </div>
        ))}
      </div>

      {satisfactionReviews.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
          <ShoppingBag size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-lg">还没有满意度回访记录</p>
          <p className="mt-2">购买产品后，记录一个月后的真实感受</p>
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">记录满意度回访</h3>
              <button onClick={() => setShowAddForm(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">产品</label>
                  <select
                    value={newReview.productId}
                    onChange={(e) => setNewReview({ ...newReview, productId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  >
                    <option value="">选择已购买的产品</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">购买日期</label>
                  <input
                    type="date"
                    value={newReview.purchaseDate}
                    onChange={(e) => setNewReview({ ...newReview, purchaseDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">整体评分</label>
                {renderStars(newReview.rating, true, (r) => setNewReview({ ...newReview, rating: r }))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <ThumbsUp size={14} className="inline mr-1 text-green-500" />
                    最满意的三点
                  </label>
                  {[0, 1, 2].map((idx) => (
                    <input
                      key={idx}
                      type="text"
                      value={newReview.pros[idx]}
                      onChange={(e) => updatePro(idx, e.target.value)}
                      className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder={`优点 ${idx + 1}`}
                    />
                  ))}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <ThumbsDown size={14} className="inline mr-1 text-red-500" />
                    不满意的三点
                  </label>
                  {[0, 1, 2].map((idx) => (
                    <input
                      key={idx}
                      type="text"
                      value={newReview.cons[idx]}
                      onChange={(e) => updateCon(idx, e.target.value)}
                      className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder={`缺点 ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">整体感受</label>
                <textarea
                  value={newReview.overallFeeling}
                  onChange={(e) => setNewReview({ ...newReview, overallFeeling: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  placeholder="用一句话描述使用一个月后的真实感受..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="wouldRecommend"
                  checked={newReview.wouldRecommend}
                  onChange={(e) => setNewReview({ ...newReview, wouldRecommend: e.target.checked })}
                  className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                />
                <label htmlFor="wouldRecommend" className="text-sm text-gray-700">
                  我会推荐这款产品给朋友
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  保存回访
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SatisfactionReview;
