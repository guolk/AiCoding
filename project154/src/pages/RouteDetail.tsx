import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Play,
  Edit3,
  Share2,
  MapPin,
  Route as RouteIcon,
  TrendingUp,
  Star,
  ChevronLeft,
  Calendar,
  TreePine,
  Store,
  AlertTriangle,
} from 'lucide-react';
import L from 'leaflet';
import { Card, CardContent } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { RatingStars } from '@/components/common/RatingStars';
import { ReviewCard } from '@/components/business/ReviewCard';
import { useRouteStore } from '@/store/useRouteStore';
import { useReviewStore } from '@/store/useReviewStore';
import {
  formatDistance,
  formatElevation,
  getDifficultyColor,
  getRatingColor,
  difficultyLabels,
  routeTypeLabels,
  seasonLabels,
} from '@/utils/format';
import type { Route } from '@/types/route';
import type { Review } from '@/types/review';
import 'leaflet/dist/leaflet.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

type TabType = 'description' | 'scenery' | 'season';

const tabLabels: Record<TabType, string> = {
  description: '路线描述',
  scenery: '沿途信息',
  season: '季节适骑',
};

export default function RouteDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<TabType>('description');
  const [route, setRoute] = useState<Route | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRouteDetail = useRouteStore((state) => state.fetchRouteDetail);
  const toggleFavorite = useRouteStore((state) => state.toggleFavorite);
  const fetchReviewsByRouteId = useReviewStore((state) => state.fetchReviewsByRouteId);
  const getRatingDistribution = useReviewStore((state) => state.getRatingDistribution);

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      setLoading(true);
      const [routeData, reviewsData] = await Promise.all([
        fetchRouteDetail(id),
        fetchReviewsByRouteId(id),
      ]);
      setRoute(routeData);
      setReviews(reviewsData);
      setLoading(false);
    };

    loadData();
  }, [id, fetchRouteDetail, fetchReviewsByRouteId]);

  const handleFavoriteClick = () => {
    if (route) {
      toggleFavorite(route.id);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent" />
      </div>
    );
  }

  if (!route) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500 text-lg">路线不存在或已被删除</p>
        <Button onClick={handleBack}>返回</Button>
      </div>
    );
  }

  const ratingDistribution = getRatingDistribution(route.id);
  const centerCoords: [number, number] = route.coordinates.length > 0
    ? route.coordinates[Math.floor(route.coordinates.length / 2)]
    : [39.9042, 116.4074];

  const chartData = {
    labels: ratingDistribution.map((d) => `${d.rating}星`),
    datasets: [
      {
        label: '评分分布',
        data: ratingDistribution.map((d) => d.count),
        backgroundColor: [
          'rgba(239, 68, 68, 0.7)',
          'rgba(249, 115, 22, 0.7)',
          'rgba(234, 179, 8, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(34, 197, 94, 0.7)',
        ],
        borderColor: [
          'rgb(239, 68, 68)',
          'rgb(249, 115, 22)',
          'rgb(234, 179, 8)',
          'rgb(16, 185, 129)',
          'rgb(34, 197, 94)',
        ],
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const item = ratingDistribution[context.dataIndex];
            return `${item.count}条评价 (${item.percentage}%)`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  const renderTabContent = () => {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'description' && (
            <div className="space-y-4">
              <p className="text-gray-600 leading-relaxed">{route.description}</p>
            </div>
          )}

          {activeTab === 'scenery' && (
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <TreePine className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">沿途风景</h4>
                  <p className="text-gray-600">{route.scenery}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Store className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">周边设施</h4>
                  <p className="text-gray-600">{route.facilities}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">注意事项</h4>
                  <p className="text-gray-600">{route.notes}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'season' && (
            <div className="grid grid-cols-2 gap-4">
              {route.seasonRatings.map((season) => (
                <Card key={season.season} className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {seasonLabels[season.season]}
                      </h4>
                      <div className="flex items-center gap-1">
                        <RatingStars value={season.rating} readOnly size="sm" />
                        <span className="text-sm font-medium text-gray-700">
                          {season.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">{season.description}</p>
                </Card>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="relative h-72">
        <img
          src={route.imageUrl}
          alt={route.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        <button
          onClick={handleBack}
          className="absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="primary" size="sm">
              {routeTypeLabels[route.type]}
            </Badge>
            <Badge className={getDifficultyColor(route.difficulty) + ' text-white'} size="sm">
              {difficultyLabels[route.difficulty]}
            </Badge>
          </div>
          <h1 className="text-white text-2xl font-bold mb-2">{route.name}</h1>
          <div className="flex items-center gap-1 text-white/80">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">
              {route.startPoint} → {route.endPoint}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-6 relative z-10">
        <Card className="p-5">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <RouteIcon className="w-4 h-4 text-teal-500" />
              </div>
              <p className="text-lg font-bold text-gray-900">
                {formatDistance(route.distance)}
              </p>
              <p className="text-xs text-gray-500">距离</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="w-4 h-4 text-orange-500" />
              </div>
              <p className="text-lg font-bold text-gray-900">
                {formatElevation(route.elevation)}
              </p>
              <p className="text-xs text-gray-500">爬升</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <div className={`w-3 h-3 rounded-full ${getDifficultyColor(route.difficulty)}`} />
              </div>
              <p className="text-lg font-bold text-gray-900">
                {difficultyLabels[route.difficulty]}
              </p>
              <p className="text-xs text-gray-500">难度</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              </div>
              <p className={`text-lg font-bold ${getRatingColor(route.stats.avgOverallRating)}`}>
                {route.stats.avgOverallRating.toFixed(1)}
              </p>
              <p className="text-xs text-gray-500">评分</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="px-4 mt-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">路线轨迹</h2>
        <div className="h-64 rounded-xl overflow-hidden shadow-md" ref={mapRef}>
          <MapContainer
            center={centerCoords}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Polyline
              positions={route.coordinates}
              color="#0d9488"
              weight={5}
              opacity={0.8}
            />
            {route.coordinates.length > 0 && (
              <>
                <Marker position={route.coordinates[0]} icon={customIcon}>
                  <Popup>起点: {route.startPoint}</Popup>
                </Marker>
                <Marker position={route.coordinates[route.coordinates.length - 1]} icon={customIcon}>
                  <Popup>终点: {route.endPoint}</Popup>
                </Marker>
              </>
            )}
          </MapContainer>
        </div>
      </div>

      <div className="px-4 mt-6">
        <Card className="p-5">
          <div className="flex border-b border-gray-100 mb-5">
            {(Object.keys(tabLabels) as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === tab
                    ? 'text-teal-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tabLabels[tab]}
                {activeTab === tab && (
                  <motion.div
                    layoutId="tabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600"
                  />
                )}
              </button>
            ))}
          </div>
          {renderTabContent()}
        </Card>
      </div>

      <div className="px-4 mt-6">
        <Card className="p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-4">评分分布</h2>
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0 text-center">
              <div className={`text-4xl font-bold ${getRatingColor(route.stats.avgOverallRating)}`}>
                {route.stats.avgOverallRating.toFixed(1)}
              </div>
              <div className="my-2">
                <RatingStars value={route.stats.avgOverallRating} readOnly />
              </div>
              <p className="text-sm text-gray-500">
                共 {route.stats.totalReviews} 条评价
              </p>
            </div>
            <div className="flex-1 h-40">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
        </Card>
      </div>

      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">用户评测</h2>
          <span className="text-sm text-gray-500">{reviews.length} 条</span>
        </div>
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
          {reviews.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-gray-500">暂无评测，快来写第一条评测吧！</p>
            </Card>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 z-50">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFavoriteClick}
            className={route.isFavorite ? 'text-red-500' : ''}
          >
            <Heart className={`w-5 h-5 ${route.isFavorite ? 'fill-current' : ''}`} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/review/${route.id}`)}
          >
            <Edit3 className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => {/* 分享功能 */}}
          >
            <Share2 className="w-5 h-5" />
          </Button>

          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => navigate(`/ride/${route.id}`)}
          >
            <Play className="w-5 h-5 fill-current" />
            开始骑行
          </Button>
        </div>
      </div>
    </div>
  );
}
