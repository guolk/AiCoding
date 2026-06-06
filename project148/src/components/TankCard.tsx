import { useNavigate } from 'react-router-dom';
import { Droplets, Calendar, Thermometer } from 'lucide-react';
import type { Aquarium, WaterTest } from '@/types';
import { StatusBadge } from './StatusBadge';
import { formatDate, getDaysSince } from '@/utils/helpers';

interface TankCardProps {
  tank: Aquarium;
  latestWaterTest?: WaterTest;
  anomalyCount: number;
}

export function TankCard({ tank, latestWaterTest, anomalyCount }: TankCardProps) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/tanks/${tank.id}`)}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-aqua-200"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={tank.coverImage}
          alt={tank.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-bold text-white font-serif">
            {tank.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge status={tank.status} size="sm" />
            {anomalyCount > 0 && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-coral-500 text-white font-medium animate-pulse-soft">
                {anomalyCount} 项异常
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
              <Droplets className="w-4 h-4" />
            </div>
            <p className="text-lg font-bold text-aqua-700 font-mono">
              {tank.volume}
            </p>
            <p className="text-xs text-gray-500">升水</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
              <Thermometer className="w-4 h-4" />
            </div>
            <p className="text-lg font-bold text-reef-700 font-mono">
              {tank.length}×{tank.width}×{tank.height}
            </p>
            <p className="text-xs text-gray-500">尺寸 cm</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
              <Calendar className="w-4 h-4" />
            </div>
            <p className="text-lg font-bold text-coral-700 font-mono">
              {getDaysSince(tank.setupDate)}
            </p>
            <p className="text-xs text-gray-500">天</p>
          </div>
        </div>

        {latestWaterTest && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">最新水质</span>
              <span className="text-gray-400">
                {formatDate(latestWaterTest.testDate)}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold font-mono text-aqua-700">
                    {latestWaterTest.ph.toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-400">pH</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold font-mono text-reef-700">
                    {latestWaterTest.nitrate.toFixed(0)}
                  </span>
                  <span className="text-xs text-gray-400">NO₃</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold font-mono text-coral-700">
                    {latestWaterTest.gh.toFixed(0)}
                  </span>
                  <span className="text-xs text-gray-400">GH</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            {tank.filterType} · {tank.lighting}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {tank.aquascapeStyle} · {tank.substrate}
          </p>
        </div>
      </div>
    </div>
  );
}
