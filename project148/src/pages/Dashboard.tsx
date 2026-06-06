import { useNavigate } from 'react-router-dom';
import {
  Droplets,
  Leaf,
  Fish,
  AlertTriangle,
  Calendar,
  ArrowRight,
  Plus,
  Activity,
  ThermometerSun,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { StatCard } from '@/components/StatCard';
import { TankCard } from '@/components/TankCard';
import { StatusBadge } from '@/components/StatusBadge';
import { formatDateShort, formatDateTime } from '@/utils/helpers';

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    aquariums,
    waterTests,
    plants,
    fishes,
    anomalies,
    waterChanges,
    growthLogs,
    diseaseRecords,
  } = useStore();

  const totalTanks = aquariums.length;
  const totalPlants = plants.filter(
    (p) => p.status !== 'dead'
  ).reduce((sum, p) => sum + p.quantity, 0);
  const totalFishes = fishes
    .filter((f) => f.status !== 'dead')
    .reduce((sum, f) => sum + f.quantity, 0);
  const activeAnomalies = anomalies.filter((a) => a.status !== 'resolved').length;

  const latestWaterChange = [...waterChanges]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  const recentGrowth = [...growthLogs]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);
  const ongoingDiseases = diseaseRecords.filter((d) => d.result === 'ongoing');

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-serif text-gray-900">
            欢迎回来
          </h1>
          <p className="text-gray-500 mt-1">
            查看您的水族箱状态和近期活动
          </p>
        </div>
        <button
          onClick={() => navigate('/tanks/new')}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-reef-500 to-reef-600 text-white rounded-xl hover:from-reef-600 hover:to-reef-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          新建水族箱
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="水族箱数量"
          value={totalTanks}
          unit="个"
          icon={Fish}
          status="normal"
          description="正在运行中"
        />
        <StatCard
          title="水草总数"
          value={totalPlants}
          unit="株"
          icon={Leaf}
          status="normal"
          description="健康生长中"
        />
        <StatCard
          title="鱼类总数"
          value={totalFishes}
          unit="尾"
          icon={Droplets}
          status="normal"
          description="状态良好"
        />
        <StatCard
          title="待处理异常"
          value={activeAnomalies}
          unit="项"
          icon={AlertTriangle}
          status={activeAnomalies > 0 ? 'warning' : 'normal'}
          description={activeAnomalies > 0 ? '需要关注' : '一切正常'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-serif text-gray-900">
              我的水族箱
            </h2>
            <button
              onClick={() => navigate('/tanks')}
              className="flex items-center gap-1 text-sm text-aqua-600 hover:text-aqua-700 font-medium"
            >
              查看全部
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aquariums.slice(0, 2).map((tank) => {
              const tankWaterTests = waterTests
                .filter((t) => t.tankId === tank.id)
                .sort(
                  (a, b) =>
                    new Date(b.testDate).getTime() -
                    new Date(a.testDate).getTime()
                );
              const tankAnomalies = anomalies.filter(
                (a) => a.tankId === tank.id && a.status !== 'resolved'
              );

              return (
                <TankCard
                  key={tank.id}
                  tank={tank}
                  latestWaterTest={tankWaterTests[0]}
                  anomalyCount={tankAnomalies.length}
                />
              );
            })}
          </div>

          {latestWaterChange && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-aqua-600" />
                <h3 className="text-lg font-bold font-serif text-gray-900">
                  近期维护
                </h3>
              </div>
              <div className="flex items-center justify-between p-4 bg-aqua-50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-aqua-500 rounded-xl flex items-center justify-center">
                    <Droplets className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">换水</p>
                    <p className="text-sm text-gray-500">
                      {latestWaterChange.amount}L · {latestWaterChange.waterSource}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {formatDateTime(latestWaterChange.date)}
                  </p>
                  <StatusBadge status="normal" size="sm" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {ongoingDiseases.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-coral-100">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-coral-600" />
                <h3 className="text-lg font-bold font-serif text-gray-900">
                  需要关注
                </h3>
              </div>
              <div className="space-y-3">
                {ongoingDiseases.map((disease) => {
                  const fish = fishes.find((f) => f.id === disease.fishId);
                  const tank = aquariums.find(
                    (t) => t.id === fish?.tankId
                  );
                  return (
                    <div
                      key={disease.id}
                      className="p-4 bg-coral-50 rounded-xl border border-coral-100"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            {fish?.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {disease.diagnosis}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {tank?.name}
                          </p>
                        </div>
                        <StatusBadge status="sick" size="sm" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-reef-600" />
              <h3 className="text-lg font-bold font-serif text-gray-900">
                近期动态
              </h3>
            </div>
            <div className="space-y-4">
              {recentGrowth.map((log, index) => {
                const plant = plants.find((p) => p.id === log.plantId);
                const tank = aquariums.find(
                  (t) => t.id === plant?.tankId
                );
                return (
                  <div
                    key={log.id}
                    className="flex gap-3 animate-slide-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-reef-100 rounded-full flex items-center justify-center">
                        <Leaf className="w-4 h-4 text-reef-600" />
                      </div>
                      {index < recentGrowth.length - 1 && (
                        <div className="w-px h-full bg-gray-200 mt-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-medium text-gray-900 text-sm">
                        {plant?.name} - {log.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDateShort(log.date)} · {tank?.name}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-gradient-to-br from-aqua-500 to-reef-500 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-3">
              <ThermometerSun className="w-6 h-6" />
              <h3 className="text-lg font-bold font-serif">养殖小贴士</h3>
            </div>
            <p className="text-aqua-50 text-sm leading-relaxed">
              定期检测水质是保持水族箱健康的关键。建议每周检测一次pH、氨氮、亚硝酸盐和硝酸盐，及时发现问题并处理。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
