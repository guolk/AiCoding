import { Link } from 'react-router-dom';
import { MapPin, Route as RouteIcon, TrendingUp, Star, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { RatingStars } from '@/components/common/RatingStars';
import { formatDistance, formatElevation, getDifficultyColor, difficultyLabels, routeTypeLabels, getRatingColor, truncateText } from '@/utils/format';
import type { Route } from '@/types/route';
import { useRouteStore } from '@/store/useRouteStore';

interface RouteCardProps {
  route: Route;
  index?: number;
}

export const RouteCard = ({ route, index = 0 }: RouteCardProps) => {
  const toggleFavorite = useRouteStore((state) => state.toggleFavorite);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(route.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
    >
      <Link to={`/routes/${route.id}`}>
        <Card hoverable padding="none" className="overflow-hidden h-full flex flex-col">
          <div className="relative h-48 overflow-hidden">
            <img
              src={route.imageUrl}
              alt={route.name}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            <div className="absolute top-3 left-3 flex gap-2">
              <Badge variant="primary" size="sm">
                {routeTypeLabels[route.type]}
              </Badge>
              <Badge className={getDifficultyColor(route.difficulty) + ' text-white'} size="sm">
                {difficultyLabels[route.difficulty]}
              </Badge>
            </div>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleFavoriteClick}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition-colors"
            >
              <Heart
                className={`w-5 h-5 transition-colors ${
                  route.isFavorite
                    ? 'fill-red-500 text-red-500'
                    : 'text-gray-400 hover:text-red-500'
                }`}
              />
            </motion.button>

            <div className="absolute bottom-3 left-4 right-4">
              <h3 className="text-white font-bold text-lg truncate">{route.name}</h3>
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="w-4 h-4 text-white/80" />
                <span className="text-white/80 text-sm truncate">
                  {route.startPoint} → {route.endPoint}
                </span>
              </div>
            </div>
          </div>

          <CardContent className="p-4 flex-1">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <RouteIcon className="w-4 h-4 text-teal-500" />
                  <span>{formatDistance(route.distance)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                  <span>{formatElevation(route.elevation)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className={`font-bold ${getRatingColor(route.stats.avgOverallRating)}`}>
                  {route.stats.avgOverallRating.toFixed(1)}
                </span>
                <span className="text-gray-400 text-sm">({route.stats.totalReviews})</span>
              </div>
            </div>

            <p className="text-gray-500 text-sm line-clamp-2">
              {truncateText(route.description, 80)}
            </p>
          </CardContent>

          <CardFooter className="px-4 py-3 bg-gray-50 border-t border-gray-100">
            <div className="w-full">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">综合评分</span>
                <RatingStars value={route.stats.avgOverallRating} readOnly size="sm" />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold text-teal-600">{route.stats.avgSurfaceScore.toFixed(1)}</p>
                  <p className="text-xs text-gray-500">路面</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-orange-500">{route.stats.avgSafetyScore.toFixed(1)}</p>
                  <p className="text-xs text-gray-500">安全</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-emerald-500">{route.stats.avgExperienceScore.toFixed(1)}</p>
                  <p className="text-xs text-gray-500">体验</p>
                </div>
              </div>
            </div>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
};
