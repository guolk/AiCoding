import { useNavigate } from 'react-router-dom';
import { Plus, Filter } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { TankCard } from '@/components/TankCard';

export default function TankList() {
  const navigate = useNavigate();
  const { aquariums, waterTests, anomalies } = useStore();

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-serif text-gray-900">
            我的水族箱
          </h1>
          <p className="text-gray-500 mt-1">
            共 {aquariums.length} 个水族箱
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            筛选
          </button>
          <button
            onClick={() => navigate('/tanks/new')}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-reef-500 to-reef-600 text-white rounded-xl hover:from-reef-600 hover:to-reef-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            新建水族箱
          </button>
        </div>
      </div>

      {aquariums.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="w-20 h-20 mx-auto bg-aqua-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-10 h-10 text-aqua-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            还没有水族箱
          </h3>
          <p className="text-gray-500 mb-6">点击上方按钮创建您的第一个水族箱档案</p>
          <button
            onClick={() => navigate('/tanks/new')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-reef-500 to-reef-600 text-white rounded-xl hover:from-reef-600 hover:to-reef-700 transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            开始创建
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aquariums.map((tank) => {
            const tankWaterTests = waterTests
              .filter((t) => t.tankId === tank.id)
              .sort(
                (a, b) =>
                  new Date(b.testDate).getTime() - new Date(a.testDate).getTime()
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
      )}
    </div>
  );
}
