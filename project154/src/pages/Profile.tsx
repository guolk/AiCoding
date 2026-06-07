import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Calendar,
  MapPin,
  Star,
  Bike,
  TrendingUp,
  Heart,
  Route as RouteIcon,
  FileText,
  Clock,
  Share2,
  Edit3,
  X,
  CheckCircle,
  Mail,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useUserStore } from '@/store/useUserStore';
import { useRouteStore } from '@/store/useRouteStore';
import { useReviewStore } from '@/store/useReviewStore';
import { useRecordStore } from '@/store/useRecordStore';
import { useCommunityStore } from '@/store/useCommunityStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Input } from '@/components/common/Input';
import { RouteCard } from '@/components/business/RouteCard';
import { ReviewCard } from '@/components/business/ReviewCard';
import { RecordTimeline } from '@/components/business/RecordTimeline';
import { ShareCard } from '@/components/business/ShareCard';
import { mockRoutes } from '@/mock/routes';
import { formatDate, formatDistance } from '@/utils/format';
import type { Route } from '@/types/route';
import type { Review } from '@/types/review';
import type { RideRecord } from '@/types/record';
import type { Share } from '@/types/community';

type TabType = 'favorites' | 'routes' | 'reviews' | 'records' | 'shares';

interface ProfileFormData {
  username: string;
  email: string;
  bio: string;
}

const tabIcons: Record<TabType, React.ElementType> = {
  favorites: Heart,
  routes: RouteIcon,
  reviews: Star,
  records: Clock,
  shares: Share2,
};

const tabLabels: Record<TabType, string> = {
  favorites: '我的收藏',
  routes: '我的路线',
  reviews: '我的评测',
  records: '我的记录',
  shares: '我的分享',
};

const tabVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

export default function Profile() {
  const currentUser = useUserStore((state) => state.currentUser);
  const updateProfile = useUserStore((state) => state.updateProfile);
  const loading = useUserStore((state) => state.loading);
  const getFavoriteRoutes = useRouteStore((state) => state.getFavoriteRoutes);
  const fetchReviews = useReviewStore((state) => state.fetchReviews);
  const fetchRecords = useRecordStore((state) => state.fetchRecords);
  const fetchCommunityFeed = useCommunityStore((state) => state.fetchCommunityFeed);
  const getBestRecords = useRecordStore((state) => state.getBestRecords);

  const [activeTab, setActiveTab] = useState<TabType>('favorites');
  const [showEditModal, setShowEditModal] = useState(false);
  const [favoriteRoutes, setFavoriteRoutes] = useState<Route[]>([]);
  const [myRoutes, setMyRoutes] = useState<Route[]>([]);
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [myRecords, setMyRecords] = useState<RideRecord[]>([]);
  const [myShares, setMyShares] = useState<Share[]>([]);
  const [stats, setStats] = useState({
    totalRoutes: 0,
    totalReviews: 0,
    totalRides: 0,
    totalDistance: 0,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    defaultValues: {
      username: currentUser?.username || '',
      email: currentUser?.email || '',
      bio: currentUser?.bio || '',
    },
  });

  useEffect(() => {
    const loadData = async () => {
      if (!currentUser) return;

      const favRoutes = getFavoriteRoutes();
      setFavoriteRoutes(favRoutes);

      const userRoutes = mockRoutes.filter((r) => r.creatorId === currentUser.id);
      setMyRoutes(userRoutes);

      const [reviewResult, recordResult, communityResult] = await Promise.all([
        fetchReviews({ userId: currentUser.id, sortBy: 'createdAt', sortOrder: 'desc' }),
        fetchRecords({ sortBy: 'rideDate', sortOrder: 'desc' }),
        fetchCommunityFeed({ userId: currentUser.id, type: 'share' }),
      ]);

      setMyReviews(reviewResult.reviews);
      setMyRecords(recordResult.records);

      const shares = communityResult.items.filter((item): item is Share => 'shareLink' in item);
      setMyShares(shares);

      const bestRecords = getBestRecords();
      setStats({
        totalRoutes: userRoutes.length,
        totalReviews: reviewResult.total,
        totalRides: bestRecords.totalRides,
        totalDistance: bestRecords.totalDistance,
      });
    };

    loadData();
  }, [currentUser, getFavoriteRoutes, fetchReviews, fetchRecords, fetchCommunityFeed, getBestRecords]);

  useEffect(() => {
    if (currentUser && showEditModal) {
      reset({
        username: currentUser.username,
        email: currentUser.email,
        bio: currentUser.bio,
      });
    }
  }, [currentUser, showEditModal, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!currentUser) return;

    const success = await updateProfile(data);
    if (success) {
      setShowEditModal(false);
    }
  };

  const handleEditClick = () => {
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">请先登录</p>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'favorites':
        return (
          <motion.div
            key="favorites"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {favoriteRoutes.length > 0 ? (
              favoriteRoutes.map((route, index) => (
                <RouteCard key={route.id} route={route} index={index} />
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">暂无收藏路线</p>
                <p className="text-gray-400 text-sm">去发现页面收藏喜欢的路线吧</p>
              </div>
            )}
          </motion.div>
        );

      case 'routes':
        return (
          <motion.div
            key="routes"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {myRoutes.length > 0 ? (
              myRoutes.map((route, index) => (
                <RouteCard key={route.id} route={route} index={index} />
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <RouteIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">暂无发布路线</p>
                <p className="text-gray-400 text-sm">分享你的骑行路线给更多骑友</p>
              </div>
            )}
          </motion.div>
        );

      case 'reviews':
        return (
          <motion.div
            key="reviews"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {myReviews.length > 0 ? (
              myReviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <ReviewCard review={review} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <Star className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">暂无评测</p>
                <p className="text-gray-400 text-sm">骑过的路线记得留下你的评测哦</p>
              </div>
            )}
          </motion.div>
        );

      case 'records':
        return (
          <motion.div
            key="records"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <RecordTimeline records={myRecords} />
          </motion.div>
        );

      case 'shares':
        return (
          <motion.div
            key="shares"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {myShares.length > 0 ? (
              myShares.map((share, index) => (
                <motion.div
                  key={share.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <ShareCard share={share} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <Share2 className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">暂无分享</p>
                <p className="text-gray-400 text-sm">分享你的骑行故事给社区</p>
              </div>
            )}
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mb-8 overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500" />

            <CardContent className="p-6 -mt-16">
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                <div className="flex flex-col sm:flex-row sm:items-end gap-6">
                  <div className="relative">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.username}
                      className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover"
                    />
                    {currentUser.role === 'verified' && (
                      <div className="absolute bottom-1 right-1 w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center border-2 border-white">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl font-bold text-gray-900">{currentUser.username}</h1>
                      {currentUser.role === 'verified' && (
                        <Badge variant="primary" size="sm" dot>
                          认证用户
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-4 h-4" />
                        <span>{currentUser.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>注册于 {formatDate(currentUser.createdAt, 'yyyy年MM月')}</span>
                      </div>
                    </div>

                    <p className="text-gray-600 leading-relaxed max-w-2xl">
                      {currentUser.bio}
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={handleEditClick}
                  className="self-start lg:self-auto"
                >
                  <Edit3 className="w-4 h-4" />
                  编辑资料
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-gray-100">
                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-gradient-to-br from-teal-50 to-teal-100/50 rounded-xl p-4 text-center"
                >
                  <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <RouteIcon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalRoutes}</p>
                  <p className="text-sm text-gray-500">发布路线</p>
                </motion.div>

                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl p-4 text-center"
                >
                  <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalReviews}</p>
                  <p className="text-sm text-gray-500">评测数</p>
                </motion.div>

                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-4 text-center"
                >
                  <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Bike className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalRides}</p>
                  <p className="text-sm text-gray-500">骑行次数</p>
                </motion.div>

                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 text-center"
                >
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{formatDistance(stats.totalDistance)}</p>
                  <p className="text-sm text-gray-500">总里程</p>
                </motion.div>
              </div>
            </CardContent>
          </Card>

          <Card padding="none">
            <div className="border-b border-gray-100">
              <div className="flex overflow-x-auto">
                {(Object.keys(tabLabels) as TabType[]).map((tab) => {
                  const Icon = tabIcons[tab];
                  const isActive = activeTab === tab;

                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex items-center gap-2 px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${
                        isActive
                          ? 'text-teal-600 border-teal-600'
                          : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tabLabels[tab]}
                    </button>
                  );
                })}
              </div>
            </div>

            <CardContent className="p-6">
              <AnimatePresence mode="wait">
                {renderTabContent()}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <CardHeader className="p-0">
                  <CardTitle>编辑个人资料</CardTitle>
                </CardHeader>
                <button
                  onClick={handleCloseModal}
                  className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.username}
                      className="w-24 h-24 rounded-full border-4 border-gray-100 object-cover"
                    />
                    <button
                      type="button"
                      className="absolute bottom-0 right-0 w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg hover:bg-teal-600 transition-colors"
                    >
                      <Edit3 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>

                <Input
                  label="用户名"
                  {...register('username', {
                    required: '请输入用户名',
                    minLength: { value: 2, message: '用户名至少2个字符' },
                    maxLength: { value: 20, message: '用户名最多20个字符' },
                  })}
                  error={errors.username?.message}
                />

                <Input
                  label="邮箱"
                  type="email"
                  {...register('email', {
                    required: '请输入邮箱',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: '请输入有效的邮箱地址',
                    },
                  })}
                  error={errors.email?.message}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    个人简介
                  </label>
                  <textarea
                    {...register('bio', {
                      maxLength: { value: 200, message: '个人简介最多200个字符' },
                    })}
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="介绍一下自己..."
                  />
                  {errors.bio && (
                    <p className="mt-1.5 text-sm text-red-500">{errors.bio.message}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-400">
                    {200 - (currentUser.bio?.length || 0)} 字符剩余
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleCloseModal}
                    className="flex-1"
                  >
                    取消
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSubmitting || loading}
                    className="flex-1"
                  >
                    保存修改
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
