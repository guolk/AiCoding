import { useState } from 'react';
import { ThumbsUp, MessageCircle, MoreHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardFooter } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { RatingStars } from '@/components/common/RatingStars';
import { formatRelativeTime, getRatingColor } from '@/utils/format';
import type { Review } from '@/types/review';
import { useReviewStore } from '@/store/useReviewStore';

interface ReviewCardProps {
  review: Review;
  showSegmentRatings?: boolean;
}

export const ReviewCard = ({ review, showSegmentRatings = false }: ReviewCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const likeReview = useReviewStore((state) => state.likeReview);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    likeReview(review.id);
  };

  const surfaceAvg = (review.surfaceScore.pothole + review.surfaceScore.bikeLane + review.surfaceScore.traffic) / 3;
  const safetyAvg = (review.safetyScore.intersection + review.safetyScore.lighting) / 2;
  const experienceAvg = (review.experienceScore.scenery + review.experienceScore.challenge + review.experienceScore.enjoyment) / 3;

  return (
    <Card className="w-full">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <img
              src={review.user.avatar}
              alt={review.user.username}
              className="w-12 h-12 rounded-full border-2 border-teal-100"
            />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-gray-900">{review.user.username}</h4>
                {review.user.role === 'verified' && (
                  <Badge variant="primary" size="sm" dot>认证</Badge>
                )}
              </div>
              <p className="text-sm text-gray-500">{formatRelativeTime(review.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`text-2xl font-bold ${getRatingColor(review.overallRating)}`}>
              {review.overallRating.toFixed(1)}
            </div>
            <RatingStars value={review.overallRating} readOnly size="sm" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-teal-50 rounded-lg p-3 text-center">
            <p className="text-xl font-bold text-teal-600">{surfaceAvg.toFixed(1)}</p>
            <p className="text-xs text-gray-500">路面质量</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 text-center">
            <p className="text-xl font-bold text-orange-500">{safetyAvg.toFixed(1)}</p>
            <p className="text-xs text-gray-500">安全性</p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-3 text-center">
            <p className="text-xl font-bold text-emerald-500">{experienceAvg.toFixed(1)}</p>
            <p className="text-xs text-gray-500">骑行体验</p>
          </div>
        </div>

        <AnimatePresence>
          {showSegmentRatings && review.segmentRatings.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="border-t border-gray-100 pt-4 mt-4">
                <h5 className="font-medium text-gray-900 mb-3">分段评分</h5>
                <div className="space-y-3">
                  {review.segmentRatings.map((segment, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-700">{segment.segmentName}</span>
                        <RatingStars
                          value={(segment.potholeScore + segment.bikeLaneScore + segment.trafficScore) / 3}
                          readOnly
                          size="sm"
                        />
                      </div>
                      <div className="grid grid-cols-5 gap-2 text-center text-xs">
                        <div>
                          <p className="font-medium text-gray-700">{segment.potholeScore}</p>
                          <p className="text-gray-400">坑洼</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">{segment.bikeLaneScore}</p>
                          <p className="text-gray-400">专用道</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">{segment.trafficScore}</p>
                          <p className="text-gray-400">机动车</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">{segment.intersectionScore}</p>
                          <p className="text-gray-400">路口</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">{segment.lightingScore}</p>
                          <p className="text-gray-400">光照</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-4">
          <p className={`text-gray-600 ${!isExpanded && review.comment.length > 150 ? 'line-clamp-3' : ''}`}>
            {review.comment}
          </p>
          {review.comment.length > 150 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-teal-600 text-sm font-medium hover:text-teal-700 mt-1"
            >
              {isExpanded ? '收起' : '展开全文'}
            </button>
          )}
        </div>
      </CardContent>

      <CardFooter className="px-5 py-3 bg-gray-50 flex justify-between">
        <div className="flex items-center gap-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
              review.isLiked
                ? 'bg-teal-100 text-teal-600'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <ThumbsUp className={`w-4 h-4 ${review.isLiked ? 'fill-current' : ''}`} />
            <span className="text-sm font-medium">{review.likes}</span>
          </motion.button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">回复</span>
          </button>
        </div>
        <button className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </CardFooter>
    </Card>
  );
};
