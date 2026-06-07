import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Route as RouteIcon,
  Star,
  Bike,
  Users,
  TrendingUp,
  Clock,
  ChevronRight,
  Database,
  ShieldCheck,
  Activity,
  Share2,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { RouteCard } from '@/components/business/RouteCard';
import { ReviewCard } from '@/components/business/ReviewCard';
import { useRouteStore } from '@/store/useRouteStore';
import { useReviewStore } from '@/store/useReviewStore';
import { mockRoutes } from '@/mock/routes';
import { mockReviews } from '@/mock/reviews';
import { mockRecords } from '@/mock/records';
import type { Route } from '@/types/route';
import type { Review } from '@/types/review';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

const featureIcons = [Database, ShieldCheck, Activity, Share2];
const featureTitles = ['路线数据库', '评测体系', '骑行记录', '社区分享'];
const featureDescriptions = [
  '汇聚全国优质骑行路线，覆盖通勤、休闲、竞技等多种类型，满足不同骑行需求',
  '专业的多维度评测体系，从路面、安全、体验三大维度提供客观详实的路线评价',
  '智能记录每一次骑行，追踪速度、里程、卡路里等数据，见证你的成长',
  '与百万骑友分享路线、交流经验，共同发现更多精彩骑行路线',
];
const featureColors = [
  'bg-teal-100 text-teal-600',
  'bg-orange-100 text-orange-500',
  'bg-emerald-100 text-emerald-600',
  'bg-blue-100 text-blue-600',
];

export default function Home() {
  const fetchRoutes = useRouteStore((state) => state.fetchRoutes);
  const fetchReviews = useReviewStore((state) => state.fetchReviews);
  const [popularRoutes, setPopularRoutes] = useState<Route[]>([]);
  const [latestReviews, setLatestReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({
    totalRoutes: 0,
    totalReviews: 0,
    totalRides: 0,
    totalDistance: 0,
    totalUsers: 0,
    totalDuration: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      const [routeResult, reviewResult] = await Promise.all([
        fetchRoutes({ sortBy: 'rating', sortOrder: 'desc', limit: 4 }),
        fetchReviews({ sortBy: 'createdAt', sortOrder: 'desc', limit: 2 }),
      ]);

      setPopularRoutes(routeResult.routes);
      setLatestReviews(reviewResult.reviews);

      const totalRoutes = mockRoutes.length;
      const totalReviews = mockReviews.length;
      const totalRides = mockRecords.length;
      const totalDistance = mockRoutes.reduce((sum, r) => sum + r.stats.totalRides * r.distance, 0);
      const totalDuration = mockRecords.reduce((sum, r) => sum + r.duration, 0);
      const totalUsers = new Set([
        ...mockRoutes.map((r) => r.creatorId),
        ...mockReviews.map((r) => r.userId),
        ...mockRecords.map((r) => r.userId),
      ]).size;

      setStats({
        totalRoutes,
        totalReviews,
        totalRides,
        totalDistance,
        totalUsers,
        totalDuration,
      });
    };

    loadData();
  }, [fetchRoutes, fetchReviews]);

  return (
    <div className="min-h-screen">
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=group%20of%20cyclists%20riding%20on%20scenic%20country%20road%20at%20sunrise%20with%20mountains%20in%20background&image_size=landscape_16_9"
            alt="骑行背景"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F766E]/90 via-[#0F766E]/70 to-[#0F766E]/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="text-center lg:text-left max-w-3xl lg:max-w-2xl"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Bike className="w-4 h-4 text-orange-400" />
              <span className="text-white/90 text-sm font-medium">发现你的下一条精彩路线</span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
            >
              探索中国
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-300">
                最美骑行路线
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-xl text-white/80 mb-8 leading-relaxed"
            >
              汇聚全国优质骑行路线，专业评测体系，智能骑行记录，与百万骑友一起发现更多精彩。
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                variant="secondary"
                size="lg"
                className="shadow-xl shadow-orange-500/30"
                onClick={() => (window.location.href = '/routes')}
              >
                开始探索
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:border-white/50 focus:ring-white/30"
                onClick={() => (window.location.href = '/community')}
              >
                加入社区
              </Button>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="mt-12 flex flex-wrap gap-6 justify-center lg:justify-start"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <RouteIcon className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.totalRoutes}</p>
                  <p className="text-white/60 text-sm">优质路线</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-teal-300" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                  <p className="text-white/60 text-sm">活跃骑友</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.totalReviews}</p>
                  <p className="text-white/60 text-sm">真实评测</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="flex flex-col items-center gap-2 text-white/60">
            <span className="text-sm">向下滚动</span>
            <ChevronRight className="w-5 h-5 rotate-90" />
          </div>
        </motion.div>
      </section>

      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 bg-teal-50 text-[#0F766E] text-sm font-medium rounded-full mb-4">
              核心功能
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              专为骑行爱好者打造
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              从路线发现到骑行记录，从业评测到社区分享，我们提供全方位的骑行服务
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {featureTitles.map((title, index) => {
              const Icon = featureIcons[index];
              return (
                <motion.div key={title} variants={itemVariants}>
                  <Card hoverable className="h-full group">
                    <div className="p-6">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                        className={`w-14 h-14 rounded-2xl ${featureColors[index]} flex items-center justify-center mb-5`}
                      >
                        <Icon className="w-7 h-7" />
                      </motion.div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#0F766E] transition-colors">
                        {title}
                      </h3>
                      <p className="text-gray-500 leading-relaxed">
                        {featureDescriptions[index]}
                      </p>
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: '100%' }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                        className={`h-0.5 mt-6 rounded-full ${index % 2 === 0 ? 'bg-[#0F766E]' : 'bg-[#F97316]'}`}
                      />
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 gap-4"
          >
            <div>
              <span className="inline-block px-4 py-1.5 bg-orange-50 text-[#F97316] text-sm font-medium rounded-full mb-4">
                精选推荐
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                热门骑行路线
              </h2>
              <p className="text-gray-500">经过真实骑友验证的高品质路线</p>
            </div>
            <Button
              variant="ghost"
              className="text-[#0F766E] hover:text-[#0F766E] hover:bg-teal-50 px-0 sm:px-4"
              onClick={() => (window.location.href = '/routes')}
            >
              查看全部路线
              <ChevronRight className="w-4 h-4" />
            </Button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularRoutes.map((route, index) => (
              <RouteCard key={route.id} route={route} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 gap-4"
          >
            <div>
              <span className="inline-block px-4 py-1.5 bg-teal-50 text-[#0F766E] text-sm font-medium rounded-full mb-4">
                真实体验
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                最新评测
              </h2>
              <p className="text-gray-500">来自骑友们的真实骑行体验分享</p>
            </div>
            <Button
              variant="ghost"
              className="text-[#0F766E] hover:text-[#0F766E] hover:bg-teal-50 px-0 sm:px-4"
              onClick={() => (window.location.href = '/community')}
            >
              查看全部评测
              <ChevronRight className="w-4 h-4" />
            </Button>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {latestReviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ReviewCard review={review} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-[#0F766E] to-[#0D9488] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-400 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              数据统计
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              每一次骑行都在创造历史，让我们一起见证这些数字背后的故事
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={containerVariants}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
          >
            <motion.div variants={itemVariants} className="text-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
              >
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <RouteIcon className="w-6 h-6 text-orange-400" />
                </div>
                <p className="text-3xl sm:text-4xl font-bold text-white mb-1">
                  {stats.totalRoutes}
                </p>
                <p className="text-white/60 text-sm">总路线数</p>
              </motion.div>
            </motion.div>

            <motion.div variants={itemVariants} className="text-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
              >
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Star className="w-6 h-6 text-yellow-400" />
                </div>
                <p className="text-3xl sm:text-4xl font-bold text-white mb-1">
                  {stats.totalReviews}
                </p>
                <p className="text-white/60 text-sm">总评测数</p>
              </motion.div>
            </motion.div>

            <motion.div variants={itemVariants} className="text-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
              >
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Bike className="w-6 h-6 text-teal-300" />
                </div>
                <p className="text-3xl sm:text-4xl font-bold text-white mb-1">
                  {stats.totalRides}
                </p>
                <p className="text-white/60 text-sm">总骑行次数</p>
              </motion.div>
            </motion.div>

            <motion.div variants={itemVariants} className="text-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
              >
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-emerald-300" />
                </div>
                <p className="text-3xl sm:text-4xl font-bold text-white mb-1">
                  {Math.round(stats.totalDistance)}
                </p>
                <p className="text-white/60 text-sm">总里程(公里)</p>
              </motion.div>
            </motion.div>

            <motion.div variants={itemVariants} className="text-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
              >
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-blue-300" />
                </div>
                <p className="text-3xl sm:text-4xl font-bold text-white mb-1">
                  {Math.floor(stats.totalDuration / 60)}
                </p>
                <p className="text-white/60 text-sm">总时长(小时)</p>
              </motion.div>
            </motion.div>

            <motion.div variants={itemVariants} className="text-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
              >
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-pink-300" />
                </div>
                <p className="text-3xl sm:text-4xl font-bold text-white mb-1">
                  {stats.totalUsers}
                </p>
                <p className="text-white/60 text-sm">活跃用户</p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#F97316] to-[#FB923C] p-8 md:p-12 lg:p-16"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="text-center lg:text-left max-w-xl">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  准备好开始你的骑行之旅了吗？
                </h2>
                <p className="text-lg text-white/80 mb-8">
                  加入我们，发现更多精彩路线，记录每一次骑行的美好瞬间。
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button
                    variant="primary"
                    size="lg"
                    className="bg-white text-[#0F766E] hover:bg-gray-100 shadow-xl"
                    onClick={() => (window.location.href = '/routes')}
                  >
                    <MapPin className="w-5 h-5" />
                    发现路线
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white/50 text-white hover:bg-white/10"
                    onClick={() => (window.location.href = '/records/new')}
                  >
                    <Bike className="w-5 h-5" />
                    记录骑行
                  </Button>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2, type: 'spring' }}
                className="hidden lg:block"
              >
                <div className="w-48 h-48 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <div className="w-36 h-36 bg-white/30 rounded-full flex items-center justify-center">
                    <Bike className="w-20 h-20 text-white" />
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
