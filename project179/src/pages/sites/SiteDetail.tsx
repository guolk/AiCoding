import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit3,
  Navigation,
  Leaf,
  Thermometer,
  Image as ImageIcon,
  Calendar,
  Plus,
  Upload,
  Clock,
  AlertTriangle,
  Info,
  Camera,
  FileText,
  ChevronRight,
  X,
  MapPin,
  BarChart3,
  Bird,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Header } from '@/components/Layout/Header';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAppStore } from '@/store';
import { MonitoringSite } from '@/types';
import { TabType } from '@/types';
import { cn } from '@/lib/utils';
import SiteFormModal from './SiteFormModal';

export default function SiteDetail() {
  const { siteId } = useParams<{ siteId: string }>();
  const navigate = useNavigate();
  const {
    getSiteById,
    getSpeciesBySiteId,
    getEnvParamsBySiteId,
    addSitePhoto,
    addSiteHistory,
  } = useAppStore();

  const site = useMemo(() => (siteId ? getSiteById(siteId) : undefined), [siteId, getSiteById]);
  const speciesList = useMemo(() => (siteId ? getSpeciesBySiteId(siteId) : []), [siteId, getSpeciesBySiteId]);
  const envParamsList = useMemo(() => (siteId ? getEnvParamsBySiteId(siteId) : []), [siteId, getEnvParamsBySiteId]);

  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  const [newPhoto, setNewPhoto] = useState({
    url: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });
  const [newHistory, setNewHistory] = useState({
    date: new Date().toISOString().split('T')[0],
    event: '',
  });

  const bannerPhoto = site?.photos[0]?.url;

  const envTrendData = useMemo(() => {
    return [...envParamsList]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((e) => ({
        date: e.date.slice(5),
        水温: e.waterTemperature,
        土温: e.soilTemperature,
        pH: e.waterPH,
      }));
  }, [envParamsList]);

  const handleAddPhoto = () => {
    if (!siteId || !newPhoto.url.trim()) return;
    addSitePhoto(siteId, newPhoto);
    setNewPhoto({
      url: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
    });
  };

  const handleAddHistory = () => {
    if (!siteId || !newHistory.event.trim()) return;
    addSiteHistory(siteId, newHistory);
    setNewHistory({
      date: new Date().toISOString().split('T')[0],
      event: '',
    });
  };

  if (!site) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-forest-50/50 via-white to-lake-50/30">
        <Header title="监测点详情" />
        <div className="mx-auto max-w-7xl px-6 py-16">
          <EmptyState
            icon={<MapPin className="w-8 h-8" strokeWidth={1.5} />}
            title="监测点不存在"
            description="未找到该监测点的信息，可能已被删除或不存在。"
            actionText="返回列表"
            onAction={() => navigate('/sites')}
          />
        </div>
      </div>
    );
  }

  const tabs: { key: TabType; label: string; icon: typeof Info }[] = [
    { key: 'info', label: '基本信息', icon: Info },
    { key: 'photos', label: '照片档案', icon: Camera },
    { key: 'history', label: '历史沿革', icon: Clock },
  ];

  const inputClass = cn(
    'w-full rounded-xl border border-forest-200 bg-white px-4 py-2.5 text-sm',
    'text-forest-800 placeholder-forest-400',
    'focus:outline-none focus:ring-2 focus:ring-forest-300 focus:border-forest-400',
    'transition-all duration-200'
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-50/50 via-white to-lake-50/30">
      <Header title="监测点详情" subtitle={site.name} />

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between animate-fade-in">
          <button
            onClick={() => navigate('/sites')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl',
              'text-forest-600 hover:text-forest-800',
              'hover:bg-forest-100/50',
              'transition-colors duration-200'
            )}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">返回列表</span>
          </button>

          <button
            onClick={() => setIsEditModalOpen(true)}
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 rounded-xl',
              'bg-forest-500 text-white text-sm font-medium',
              'hover:bg-forest-600 active:bg-forest-700',
              'transition-colors duration-200 shadow-card'
            )}
          >
            <Edit3 className="w-4 h-4" />
            编辑监测点
          </button>
        </div>

        <div className="mb-8 overflow-hidden rounded-2xl shadow-card animate-slide-up">
          <div className="relative h-64 md:h-80 bg-gradient-to-br from-forest-400 to-lake-500">
            {bannerPhoto ? (
              <img
                src={bannerPhoto}
                alt={site.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Leaf className="h-32 w-32 text-white/20" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -left-16 top-0 h-64 w-64 rounded-full bg-forest-300/20 blur-3xl" />
              <div className="absolute -bottom-24 right-1/4 h-72 w-72 rounded-full bg-lake-300/20 blur-3xl" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-md">
                    {site.name}
                  </h1>
                  <Badge text={site.ecosystemType} variant="info" />
                </div>
                <div className="flex flex-wrap items-center gap-4 text-white/90">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">建立于 {site.establishmentDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Navigation className="w-4 h-4" />
                    <span className="text-sm font-mono">
                      {site.latitude.toFixed(4)}, {site.longitude.toFixed(4)}
                    </span>
                  </div>
                </div>
                <p className="max-w-2xl text-white/80 text-sm md:text-base leading-relaxed">
                  {site.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 flex gap-2 rounded-2xl bg-white p-2 shadow-card animate-fade-in">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex items-center justify-center gap-2 flex-1 md:flex-none md:px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                  activeTab === tab.key
                    ? 'bg-forest-500 text-white shadow-md'
                    : 'text-forest-600 hover:bg-forest-50'
                )}
              >
                <TabIcon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === 'info' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 animate-slide-up">
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl bg-white p-6 shadow-card">
                <div className="mb-5 flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-forest-100 flex items-center justify-center text-forest-600">
                    <Navigation className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-forest-800">GPS 坐标位置</h3>
                    <p className="text-xs text-forest-500">监测点地理信息</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="rounded-xl bg-forest-50 p-4">
                    <p className="text-xs text-forest-500 mb-1">纬度</p>
                    <p className="font-mono font-semibold text-forest-800">
                      {site.latitude.toFixed(6)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-lake-50 p-4">
                    <p className="text-xs text-lake-600 mb-1">经度</p>
                    <p className="font-mono font-semibold text-lake-700">
                      {site.longitude.toFixed(6)}
                    </p>
                  </div>
                </div>
                <div className="h-48 rounded-xl bg-gradient-to-br from-forest-100 via-lake-50 to-sun-50 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-4 left-4 h-24 w-24 rounded-full bg-forest-200 blur-2xl" />
                    <div className="absolute bottom-4 right-8 h-32 w-32 rounded-full bg-lake-200 blur-2xl" />
                  </div>
                  <div className="relative flex flex-col items-center gap-2 text-forest-600">
                    <MapPin className="w-10 h-10 text-forest-500 animate-pulse" />
                    <p className="text-sm font-medium">地图占位图</p>
                    <p className="text-xs text-forest-400">
                      {site.latitude.toFixed(4)}, {site.longitude.toFixed(4)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-card">
                <div className="mb-5 flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-sun-100 flex items-center justify-center text-sun-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-forest-800">周边环境描述</h3>
                    <p className="text-xs text-forest-500">监测点环境概况</p>
                  </div>
                </div>
                <p className="text-forest-700 leading-relaxed text-sm">
                  {site.description || '暂无详细描述'}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-card">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-lake-100 flex items-center justify-center text-lake-600">
                      <Bird className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-forest-800">物种记录摘要</h3>
                      <p className="text-xs text-forest-500">该监测点已记录的物种</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/species')}
                    className="flex items-center gap-1 text-sm font-medium text-forest-600 hover:text-forest-700 transition-colors"
                  >
                    查看全部
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                {speciesList.length === 0 ? (
                  <div className="py-8 text-center text-forest-400 text-sm">
                    暂无物种记录
                  </div>
                ) : (
                  <div className="space-y-3">
                    {speciesList.slice(0, 5).map((sp) => (
                    <div
                      key={sp.id}
                      className={cn(
                        'flex items-center gap-4 p-3 rounded-xl',
                        'border border-forest-100 hover:border-forest-200',
                        'hover:bg-forest-50/50 transition-all duration-200 cursor-pointer'
                      )}
                    >
                      <div className="relative h-12 w-12 shrink-0 rounded-lg bg-gradient-to-br from-forest-100 to-lake-100 overflow-hidden">
                        {sp.photos[0] ? (
                          <img src={sp.photos[0]} alt={sp.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-forest-400">
                            <Leaf className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-forest-800 truncate">{sp.name}</h4>
                          {sp.isInvasive && (
                            <Badge text="入侵" variant="danger" />
                          )}
                        </div>
                        <p className="text-xs text-forest-500 truncate">{sp.taxonomy}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold text-forest-700">{sp.count}</p>
                        <p className="text-xs text-forest-400">个体</p>
                      </div>
                    </div>
                  ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl bg-white p-6 shadow-card">
                <div className="mb-5 flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-forest-100 flex items-center justify-center text-forest-600">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-forest-800">统计概览</h3>
                    <p className="text-xs text-forest-500">数据统计信息</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-forest-50 to-lake-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-forest-100 flex items-center justify-center text-forest-600">
                        <Leaf className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-forest-500">物种数</p>
                        <p className="font-bold text-forest-800">{speciesList.length} 种</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-sun-50 to-forest-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-sun-100 flex items-center justify-center text-sun-600">
                        <Thermometer className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-forest-500">环境参数</p>
                        <p className="font-bold text-forest-800">{envParamsList.length} 条</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-lake-50 to-sun-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-lake-100 flex items-center justify-center text-lake-600">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-forest-500">照片数</p>
                        <p className="font-bold text-forest-800">{site.photos.length} 张</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-card">
                <div className="mb-5 flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-lake-100 flex items-center justify-center text-lake-600">
                    <Thermometer className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-forest-800">环境参数趋势</h3>
                    <p className="text-xs text-forest-500">近期温度与pH变化</p>
                  </div>
                </div>
                {envTrendData.length === 0 ? (
                  <div className="py-12 text-center text-forest-400 text-sm">
                    暂无环境数据
                  </div>
                ) : (
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={envTrendData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                        <XAxis
                          dataKey="date"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#6B7280', fontSize: 10 }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#6B7280', fontSize: 10 }}
                          width={30}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #E5E7EB',
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            fontSize: '12px',
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="水温"
                          stroke="#40916C"
                          strokeWidth={2}
                          dot={{ r: 3, fill: '#40916C' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="土温"
                          stroke="#D4A373"
                          strokeWidth={2}
                          dot={{ r: 3, fill: '#D4A373' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <div className="mt-3 flex justify-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-lake-500" />
                    <span className="text-forest-600">水温</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-sun-500" />
                    <span className="text-forest-600">土温</span>
                  </div>
                </div>
              </div>

              {envParamsList.some((e) => e.isAbnormal) && (
                <div className="rounded-2xl bg-red-50 border border-red-200 p-5">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-red-700">异常提醒</h4>
                      <p className="mt-1 text-sm text-red-600">
                        监测到 {envParamsList.filter((e) => e.isAbnormal).length} 条异常环境参数记录
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'photos' && (
          <div className="space-y-6 animate-slide-up">
            <div className="rounded-2xl bg-white p-6 shadow-card">
              <div className="mb-5 flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-lake-100 flex items-center justify-center text-lake-600">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-forest-800">上传新照片</h3>
                  <p className="text-xs text-forest-500">添加监测点照片记录</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-forest-700 mb-1.5">
                    照片URL</label>
                  <input
                    type="text"
                    value={newPhoto.url}
                    onChange={(e) => setNewPhoto({ ...newPhoto, url: e.target.value })}
                    placeholder="请输入照片URL链接"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-forest-700 mb-1.5">
                    拍摄日期</label>
                  <input
                    type="date"
                    value={newPhoto.date}
                    onChange={(e) => setNewPhoto({ ...newPhoto, date: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-forest-700 mb-1.5">
                    照片描述</label>
                  <input
                    type="text"
                    value={newPhoto.description}
                    onChange={(e) => setNewPhoto({ ...newPhoto, description: e.target.value })}
                    placeholder="描述照片内容、拍摄地点等信息"
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleAddPhoto}
                  disabled={!newPhoto.url.trim()}
                  className={cn(
                    'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium',
                    'bg-forest-500 text-white',
                    'hover:bg-forest-600 active:bg-forest-700',
                    'transition-colors duration-200 shadow-card',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  <Plus className="w-4 h-4" />
                  添加照片
                </button>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-card">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-forest-100 flex items-center justify-center text-forest-600">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-forest-800">照片档案</h3>
                    <p className="text-xs text-forest-500">共 {site.photos.length} 张照片</p>
                  </div>
                </div>
              </div>
              {site.photos.length === 0 ? (
                <EmptyState
                  icon={<Camera className="w-8 h-8" strokeWidth={1.5} />}
                  title="暂无照片"
                  description="还没有上传任何照片，使用上方表单添加第一张照片。"
                />
              ) : (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {site.photos.map((photo) => (
                    <div
                      key={photo.id}
                      onClick={() => setPreviewPhoto(photo.url)}
                      className="group cursor-pointer overflow-hidden rounded-xl bg-gradient-to-br from-forest-100 to-lake-100 aspect-square relative"
                    >
                      <img
                        src={photo.url}
                        alt={photo.description || '监测点照片'}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <p className="text-xs text-white font-medium truncate">
                          {photo.description || '未命名'}
                        </p>
                        <p className="text-xs text-white/70 mt-0.5">{photo.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6 animate-slide-up">
            <div className="rounded-2xl bg-white p-6 shadow-card">
              <div className="mb-5 flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-sun-100 flex items-center justify-center text-sun-600">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-forest-800">添加历史事件</h3>
                  <p className="text-xs text-forest-500">记录监测点重要事件</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-forest-700 mb-1.5">
                    事件日期
                  </label>
                  <input
                    type="date"
                    value={newHistory.date}
                    onChange={(e) => setNewHistory({ ...newHistory, date: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-forest-700 mb-1.5">
                    事件内容
                  </label>
                  <input
                    type="text"
                    value={newHistory.event}
                    onChange={(e) => setNewHistory({ ...newHistory, event: e.target.value })}
                    placeholder="描述发生的重要事件..."
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-1 flex items-end">
                  <button
                    onClick={handleAddHistory}
                    disabled={!newHistory.event.trim()}
                    className={cn(
                      'w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium',
                      'bg-forest-500 text-white',
                      'hover:bg-forest-600 active:bg-forest-700',
                      'transition-colors duration-200 shadow-card',
                      'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                  >
                    <Plus className="w-4 h-4" />
                    添加事件
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-card">
              <div className="mb-6 flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-forest-100 flex items-center justify-center text-forest-600">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-forest-800">历史沿革</h3>
                  <p className="text-xs text-forest-500">共 {site.historyEvents.length} 条记录</p>
                </div>
              </div>
              {site.historyEvents.length === 0 ? (
                <EmptyState
                  icon={<Clock className="w-8 h-8" strokeWidth={1.5} />}
                  title="暂无历史记录"
                  description="使用上方表单添加第一条历史事件。"
                />
              ) : (
                <div className="relative space-y-1">
                  <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-forest-200 via-lake-200 to-sun-200" />
                  {[...site.historyEvents]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .reverse()
                    .map((event, index) => (
                      <div
                        key={event.id}
                        className="group relative flex gap-4 rounded-xl p-3 transition-all duration-300 hover:bg-forest-50/50"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-white bg-forest-100 text-forest-600 shadow-md">
                          {index === 0 ? (
                            <Leaf className="h-5 w-5" />
                          ) : (
                            <FileText className="h-5 w-5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium text-forest-800">
                              {event.event}
                            </h4>
                            <div className="flex items-center gap-1 shrink-0 text-xs text-forest-400">
                              <Calendar className="h-3 w-3" />
                              {event.date}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {previewPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setPreviewPhoto(null)}
        >
          <div className="relative max-w-5xl w-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewPhoto(null)}
              className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewPhoto}
              alt="预览"
              className="w-full h-full object-contain rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}

      <SiteFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        editingSite={site as MonitoringSite}
      />
    </div>
  );
}
