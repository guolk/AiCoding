import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Share2, MoreHorizontal, MapPin, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardFooter } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { RatingStars } from '@/components/common/RatingStars';
import { formatRelativeTime, truncateText } from '@/utils/format';
import type { Share } from '@/types/community';
import { useCommunityStore } from '@/store/useCommunityStore';

interface ShareCardProps {
  share: Share;
}

export const ShareCard = ({ share }: ShareCardProps) => {
  const [isLiked, setIsLiked] = useState(share.isLiked);
  const [likes, setLikes] = useState(share.likes);
  const [showAllImages, setShowAllImages] = useState(false);
  const toggleLike = useCommunityStore((state) => state.toggleLike);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
    toggleLike('share', share.id);
  };

  const displayedImages = showAllImages ? share.images : share.images.slice(0, 4);
  const remainingCount = share.images.length - 4;

  return (
    <Card className="w-full">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <img
              src={share.user.avatar}
              alt={share.user.username}
              className="w-12 h-12 rounded-full border-2 border-teal-100"
            />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-gray-900">{share.user.username}</h4>
                {share.user.role === 'verified' && (
                  <Badge variant="primary" size="sm" dot>认证</Badge>
                )}
              </div>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatRelativeTime(share.createdAt)}
              </p>
            </div>
          </div>
          <button className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {share.route && (
          <Link
            to={`/routes/${share.route.id}`}
            className="flex items-center gap-3 p-3 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl mb-4 hover:from-teal-100 hover:to-emerald-100 transition-colors"
          >
            <img
              src={share.route.imageUrl}
              alt={share.route.name}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <h5 className="font-semibold text-gray-900 truncate">{share.route.name}</h5>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-sm text-gray-500 truncate">
                  {share.route.startPoint} → {share.route.endPoint}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <RatingStars value={share.route.stats.avgOverallRating} readOnly size="sm" />
                <span className="text-sm font-medium text-gray-600">
                  {share.route.stats.avgOverallRating.toFixed(1)}
                </span>
              </div>
            </div>
          </Link>
        )}

        <p className="text-gray-700 leading-relaxed mb-4 whitespace-pre-wrap">
          {share.content}
        </p>

        {share.images.length > 0 && (
          <div className="mb-4">
            <div className={`grid gap-2 ${share.images.length === 1 ? 'grid-cols-1' : share.images.length === 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
              {displayedImages.map((image, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className={`relative overflow-hidden rounded-xl ${
                    index === 0 && share.images.length > 4 ? 'col-span-2 row-span-2' : ''
                  }`}
                >
                  <img
                    src={image}
                    alt={`分享图片 ${index + 1}`}
                    className="w-full h-40 object-cover hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {!showAllImages && index === 3 && remainingCount > 0 && (
                    <button
                      onClick={() => setShowAllImages(true)}
                      className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-xl"
                    >
                      +{remainingCount}
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
            {share.images.length > 4 && !showAllImages && (
              <button
                onClick={() => setShowAllImages(true)}
                className="text-teal-600 text-sm font-medium hover:text-teal-700 mt-2"
              >
                查看全部 {share.images.length} 张图片
              </button>
            )}
            {showAllImages && (
              <button
                onClick={() => setShowAllImages(false)}
                className="text-gray-500 text-sm font-medium hover:text-gray-700 mt-2"
              >
                收起图片
              </button>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="px-5 py-3 bg-gray-50 flex justify-between">
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-colors ${
              isLiked
                ? 'bg-red-50 text-red-500'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            <span className="font-medium">{likes}</span>
          </motion.button>

          <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
            <MessageCircle className="w-5 h-5" />
            <span className="font-medium">{share.comments.length}</span>
          </button>

          <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
            <Share2 className="w-5 h-5" />
            <span className="font-medium">分享</span>
          </button>
        </div>

        {share.comments.length > 0 && (
          <button className="text-sm text-gray-500 hover:text-gray-700">
            查看 {share.comments.length} 条评论
          </button>
        )}
      </CardFooter>

      <AnimatePresence>
        {share.comments.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="border-t border-gray-100 bg-gray-50/50 overflow-hidden"
          >
            <div className="px-5 py-4 space-y-3">
              {share.comments.slice(0, 2).map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <img
                    src={comment.user.avatar}
                    alt={comment.user.username}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1 bg-white rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-gray-900">
                        {comment.user.username}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatRelativeTime(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};
