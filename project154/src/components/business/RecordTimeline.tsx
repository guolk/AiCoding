import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sun, Cloud, CloudRain, Wind, Thermometer, Snowflake, Gauge, Clock, Flame, MapPin, ChevronRight } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { formatDate, formatSpeed, formatDuration, formatCalories, formatDistance, roadConditionLabels } from '@/utils/format';
import type { RideRecord, Weather } from '@/types/record';
import { weatherLabels } from '@/types/record';

const weatherIconMap: Record<Weather, React.ElementType> = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
  windy: Wind,
  hot: Thermometer,
  cold: Snowflake,
};

const weatherColorMap: Record<Weather, string> = {
  sunny: 'bg-yellow-100 text-yellow-600',
  cloudy: 'bg-gray-100 text-gray-600',
  rainy: 'bg-blue-100 text-blue-600',
  windy: 'bg-cyan-100 text-cyan-600',
  hot: 'bg-orange-100 text-orange-600',
  cold: 'bg-sky-100 text-sky-600',
};

interface RecordTimelineProps {
  records: RideRecord[];
}

export const RecordTimeline = ({ records }: RecordTimelineProps) => {
  if (records.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">暂无骑行记录</p>
        <Link
          to="/records/new"
          className="inline-block mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          记录第一次骑行
        </Link>
      </div>
    );
  }

  const sortedRecords = [...records].sort((a, b) =>
    new Date(b.rideDate).getTime() - new Date(a.rideDate).getTime()
  );

  return (
    <div className="relative">
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-teal-500 via-teal-300 to-gray-200" />

      <div className="space-y-6">
        {sortedRecords.map((record, index) => {
          const WeatherIcon = weatherIconMap[record.weather];

          return (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="relative pl-16"
            >
              <div className="absolute left-4 w-5 h-5 rounded-full bg-teal-500 border-4 border-white shadow-lg -translate-x-1/2" />

              <Link to={`/records/${record.id}`}>
                <Card hoverable padding="sm" className="transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-xl ${weatherColorMap[record.weather]} flex items-center justify-center`}>
                        <WeatherIcon className="w-7 h-7" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">
                            {record.route?.name || '未命名路线'}
                          </h4>
                          <Badge variant="primary" size="sm">
                            {weatherLabels[record.weather]}
                          </Badge>
                          <Badge variant="secondary" size="sm">
                            {roadConditionLabels[record.roadCondition]}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span>{formatDate(record.rideDate)}</span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {record.route ? formatDistance(record.route.distance) : '--'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>

                  <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-teal-600 mb-1">
                        <Gauge className="w-4 h-4" />
                        <span className="font-bold">{formatSpeed(record.avgSpeed)}</span>
                      </div>
                      <p className="text-xs text-gray-500">平均速度</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-orange-500 mb-1">
                        <Gauge className="w-4 h-4" />
                        <span className="font-bold">{formatSpeed(record.maxSpeed)}</span>
                      </div>
                      <p className="text-xs text-gray-500">最高速度</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-blue-500 mb-1">
                        <Clock className="w-4 h-4" />
                        <span className="font-bold">{formatDuration(record.duration)}</span>
                      </div>
                      <p className="text-xs text-gray-500">骑行时长</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-red-500 mb-1">
                        <Flame className="w-4 h-4" />
                        <span className="font-bold">{formatCalories(record.calories)}</span>
                      </div>
                      <p className="text-xs text-gray-500">消耗热量</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium text-gray-700">感受：</span>
                        {record.feeling}
                      </p>
                      <Badge variant="outline" size="sm">
                        查看详情
                      </Badge>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
