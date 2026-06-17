import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Search,
  Plus,
  Leaf,
  Thermometer,
  Calendar,
  Navigation,
  Filter,
  Trash2,
  Edit2,
  AlertTriangle,
} from 'lucide-react';
import { Header } from '@/components/Layout/Header';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';
import SiteFormModal from './SiteFormModal';

export default function SiteList() {
  const navigate = useNavigate();
  const { sites, species, envParams, deleteSite } = useAppStore();

  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterEcosystem, setFilterEcosystem] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<null | any>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const ecosystemTypes = useMemo(() => {
    const types = new Set(sites.map((s) => s.ecosystemType));
    return Array.from(types);
  }, [sites]);

  const filteredSites = useMemo(() => {
    return sites.filter((site) => {
      const matchKeyword =
        !searchKeyword ||
        site.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        site.description.toLowerCase().includes(searchKeyword.toLowerCase());
      const matchEcosystem =
        !filterEcosystem || site.ecosystemType === filterEcosystem;
      return matchKeyword && matchEcosystem;
    });
  }, [sites, searchKeyword, filterEcosystem]);

  const speciesBySiteId = useMemo(() => {
    const map: Record<string, number> = {};
    species.forEach((s) => {
      map[s.siteId] = (map[s.siteId] || 0) + 1;
    });
    return map;
  }, [species]);

  const envParamsBySiteId = useMemo(() => {
    const map: Record<string, number> = {};
    envParams.forEach((e) => {
      map[e.siteId] = (map[e.siteId] || 0) + 1;
    });
    return map;
  }, [envParams]);

  const handleCardClick = (siteId: string) => {
    navigate(`/sites/${siteId}`);
  };

  const handleDelete = (siteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmId(siteId);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      deleteSite(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-50/50 via-white to-lake-50/30">
      <Header title="监测点管理" subtitle="生态监测站点的综合管理" />

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-forest-400" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="搜索监测点名称或描述..."
                className={cn(
                  'w-full sm:w-72 h-11 pl-10 pr-4 rounded-xl',
                  'bg-white border border-forest-200 shadow-card',
                  'text-sm text-forest-800 placeholder-forest-400',
                  'focus:outline-none focus:ring-2 focus:ring-forest-300 focus:border-forest-400',
                  'transition-all duration-200'
                )}
              />
            </div>

            <div className="relative">
              <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-forest-400" />
              <select
                value={filterEcosystem}
                onChange={(e) => setFilterEcosystem(e.target.value)}
                className={cn(
                  'w-full sm:w-56 h-11 pl-10 pr-10 rounded-xl appearance-none',
                  'bg-white border border-forest-200 shadow-card',
                  'text-sm text-forest-800',
                  'focus:outline-none focus:ring-2 focus:ring-forest-300 focus:border-forest-400',
                  'transition-all duration-200 cursor-pointer'
                )}
              >
                <option value="">全部生态系统类型</option>
                {ecosystemTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className={cn(
              'flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl',
              'bg-forest-500 text-white text-sm font-medium',
              'hover:bg-forest-600 active:bg-forest-700',
              'transition-all duration-200 shadow-card hover:shadow-card-hover',
              'hover:-translate-y-0.5'
            )}
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            新增监测点
          </button>
        </div>

        {filteredSites.length === 0 ? (
          <EmptyState
            icon={<MapPin className="w-8 h-8" strokeWidth={1.5} />}
            title="暂无监测点"
            description={searchKeyword || filterEcosystem ? '没有找到匹配的监测点，请调整搜索条件或筛选器。' : '还没有创建任何监测点，点击右上角按钮开始创建第一个监测站点。'}
            actionText={searchKeyword || filterEcosystem ? '清除筛选' : '新增监测点'}
            onAction={() => {
              if (searchKeyword || filterEcosystem) {
                setSearchKeyword('');
                setFilterEcosystem('');
              } else {
                setIsModalOpen(true);
              }
            }}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredSites.map((site, index) => {
              const firstPhoto = site.photos[0]?.url;
              const speciesCount = speciesBySiteId[site.id] || 0;
              const envCount = envParamsBySiteId[site.id] || 0;

              return (
                <div
                  key={site.id}
                  onClick={() => handleCardClick(site.id)}
                  className={cn(
                    'group cursor-pointer overflow-hidden rounded-xl bg-white shadow-card',
                    'border border-forest-100/50',
                    'transition-all duration-300 ease-out',
                    'hover:shadow-card-hover hover:-translate-y-1 hover:border-forest-200',
                    'animate-slide-up'
                  )}
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-forest-100 to-lake-100">
                    {firstPhoto ? (
                      <img
                        src={firstPhoto}
                        alt={site.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Leaf className="h-20 w-20 text-forest-300 opacity-50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      <button
                        onClick={(e) => handleDelete(site.id, e)}
                        className="w-7 h-7 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center text-red-500 hover:bg-white hover:shadow-md transition-all duration-200"
                        title="删除监测点"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <Badge text={site.ecosystemType} variant="info" />
                    </div>
                    <div className="absolute bottom-3 left-4 right-4">
                      <h3 className="font-bold text-white text-lg drop-shadow-sm truncate">
                        {site.name}
                      </h3>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="flex items-center gap-2 text-sm text-forest-600">
                      <Navigation className="w-4 h-4 shrink-0 text-forest-400" />
                      <span className="font-mono text-xs">
                        {site.latitude.toFixed(4)}, {site.longitude.toFixed(4)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-forest-600">
                      <Calendar className="w-4 h-4 shrink-0 text-sun-500" />
                      <span>建立于 {site.establishmentDate}</span>
                    </div>

                    <div className="flex items-center gap-4 pt-3 border-t border-forest-100">
                      <div className="flex items-center gap-1.5">
                        <Leaf className="w-4 h-4 text-lake-500" />
                        <span className="text-sm">
                          <span className="font-semibold text-forest-700">{speciesCount}</span>
                          <span className="text-forest-500"> 种</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Thermometer className="w-4 h-4 text-sun-600" />
                        <span className="text-sm">
                          <span className="font-semibold text-forest-700">{envCount}</span>
                          <span className="text-forest-500"> 参数</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <SiteFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSite(null);
        }}
        editingSite={editingSite}
      />

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl animate-slide-up">
            <div className="mb-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-forest-800">确认删除</h3>
                <p className="text-sm text-forest-600">此操作不可撤销</p>
              </div>
            </div>
            <div className="mb-6 rounded-xl bg-red-50 p-4">
              <p className="text-sm text-red-700">
                您确定要删除该监测点吗？这将同时删除该监测点下的所有物种记录和环境参数数据。
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-forest-600 border border-forest-200 hover:bg-forest-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
