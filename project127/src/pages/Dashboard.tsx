
import { useWorldStore } from '@/store/useWorldStore';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import {
  Globe,
  Users,
  Languages,
  MapPin,
  BookOpen,
  Sparkles,
  Calendar,
  Plus,
  TrendingUp
} from 'lucide-react';
import { useState } from 'react';

const Dashboard = () => {
  const {
    worldSetting,
    characters,
    factions,
    continents,
    languages,
    historyEvents,
    mapMarkers,
    references,
    lastEdited,
    createWorldSetting
  } = useWorldStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [worldName, setWorldName] = useState('');

  const handleCreateWorld = () => {
    if (worldName.trim()) {
      createWorldSetting(worldName.trim());
      setWorldName('');
      setShowCreateModal(false);
    }
  };

  const stats = [
    { label: '大陆', value: continents.length, icon: <Globe className="w-6 h-6" />, color: 'from-blue-500 to-cyan-500' },
    { label: '人物', value: characters.length, icon: <Users className="w-6 h-6" />, color: 'from-purple-500 to-pink-500' },
    { label: '阵营', value: factions.length, icon: <Sparkles className="w-6 h-6" />, color: 'from-amber-500 to-orange-500' },
    { label: '语言', value: languages.length, icon: <Languages className="w-6 h-6" />, color: 'from-green-500 to-emerald-500' },
    { label: '历史事件', value: historyEvents.length, icon: <Calendar className="w-6 h-6" />, color: 'from-indigo-500 to-violet-500' },
    { label: '地图标记', value: mapMarkers.length, icon: <MapPin className="w-6 h-6" />, color: 'from-rose-500 to-red-500' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white mb-2">
          {worldSetting ? worldSetting.name : '世界构建工作台'}
        </h1>
        {worldSetting ? (
          <p className="text-gray-400">
            {worldSetting.description || '开始构建你的幻想世界...'}
          </p>
        ) : (
          <div className="mt-4">
            <Button onClick={() => setShowCreateModal(true)} icon={<Plus className="w-4 h-4" />}>
              创建新世界
            </Button>
          </div>
        )}
        {lastEdited && (
          <p className="text-sm text-gray-500 mt-2">
            上次编辑: {new Date(lastEdited).toLocaleString('zh-CN')}
          </p>
        )}
      </div>

      {worldSetting && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-dark-card border border-dark-border rounded-xl p-6 card-hover"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                    <p className="font-display text-3xl font-bold text-white">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                    <div className="text-white">{stat.icon}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="快速操作">
              <div className="grid grid-cols-2 gap-3">
                <QuickAction
                  to="/world"
                  icon={<Globe className="w-5 h-5" />}
                  label="世界设定"
                />
                <QuickAction
                  to="/characters"
                  icon={<Users className="w-5 h-5" />}
                  label="人物管理"
                />
                <QuickAction
                  to="/factions"
                  icon={<Sparkles className="w-5 h-5" />}
                  label="阵营组织"
                />
                <QuickAction
                  to="/map"
                  icon={<MapPin className="w-5 h-5" />}
                  label="世界地图"
                />
                <QuickAction
                  to="/languages"
                  icon={<Languages className="w-5 h-5" />}
                  label="语言设计"
                />
                <QuickAction
                  to="/rules-check"
                  icon={<BookOpen className="w-5 h-5" />}
                  label="规则检查"
                />
              </div>
            </Card>

            <Card title="参考素材">
              {references.length > 0 ? (
                <div className="space-y-3">
                  {references.slice(0, 3).map((ref) => (
                    <div
                      key={ref.id}
                      className="flex items-center gap-3 p-3 bg-dark-bg/50 rounded-lg"
                    >
                      <BookOpen className="w-5 h-5 text-gold flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{ref.title}</p>
                        <p className="text-gray-400 text-xs">{ref.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>暂无参考素材</p>
                </div>
              )}
            </Card>
          </div>
        </>
      )}

      {!worldSetting && (
        <div className="mt-12 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-gold/20 to-copper/20 mb-6">
            <Sparkles className="w-12 h-12 text-gold" />
          </div>
          <h2 className="font-display text-2xl font-bold text-white mb-4">
            开始你的世界构建之旅
          </h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            创建完整的科幻或奇幻世界观，包括地理、人物、文化、历史等各个维度。
            所有数据都会自动保存到浏览器本地存储中。
          </p>
          <Button
            size="lg"
            onClick={() => setShowCreateModal(true)}
            icon={<Plus className="w-5 h-5" />}
          >
            创建第一个世界
          </Button>
        </div>
      )}

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="创建新世界"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              取消
            </Button>
            <Button onClick={handleCreateWorld} disabled={!worldName.trim()}>
              创建
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              世界名称
            </label>
            <input
              type="text"
              value={worldName}
              onChange={(e) => setWorldName(e.target.value)}
              placeholder="例如：艾泽拉斯、中土世界..."
              className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/50"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

const QuickAction = ({
  to,
  icon,
  label
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
}) => {
  return (
    <a
      href={to}
      className="flex items-center gap-3 p-4 bg-dark-bg/50 rounded-lg text-gray-300 hover:bg-dark-bg hover:text-gold transition-colors"
    >
      <span className="text-gold">{icon}</span>
      <span className="font-medium">{label}</span>
      <TrendingUp className="w-4 h-4 ml-auto opacity-50" />
    </a>
  );
};

export default Dashboard;
