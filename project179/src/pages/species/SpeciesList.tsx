import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Leaf,
  MapPin,
  Filter,
  AlertTriangle,
  Users,
} from 'lucide-react';
import { Header } from '@/components/Layout/Header';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';
import SpeciesFormModal from './SpeciesFormModal';

export default function SpeciesList() {
  const navigate = useNavigate();
  const {
    species,
    sites,
    searchKeyword,
    filterSiteId,
    filterInvasive,
    setSearchKeyword,
    setFilterSiteId,
    setFilterInvasive,
  } = useAppStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localKeyword, setLocalKeyword] = useState(searchKeyword);

  const siteNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    sites.forEach((s) => {
      map[s.id] = s.name;
    });
    return map;
  }, [sites]);

  const filteredSpecies = useMemo(() => {
    return species.filter((sp) => {
      const matchKeyword =
        !localKeyword ||
        sp.name.toLowerCase().includes(localKeyword.toLowerCase()) ||
        sp.taxonomy.toLowerCase().includes(localKeyword.toLowerCase()) ||
        sp.location.toLowerCase().includes(localKeyword.toLowerCase());
      const matchSite = !filterSiteId || sp.siteId === filterSiteId;
      const matchInvasive =
        filterInvasive === null || sp.isInvasive === filterInvasive;
      return matchKeyword && matchSite && matchInvasive;
    });
  }, [species, localKeyword, filterSiteId, filterInvasive]);

  const handleSearchChange = (value: string) => {
    setLocalKeyword(value);
    setSearchKeyword(value);
  };

  const handleCardClick = (speciesId: string) => {
    navigate(`/species/${speciesId}`);
  };

  const handleClearFilters = () => {
    setLocalKeyword('');
    setSearchKeyword('');
    setFilterSiteId(null);
    setFilterInvasive(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-50/50 via-white to-lake-50/30">
      <Header title="物种记录管理" subtitle="生物多样性观测数据综合管理" />

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 animate-fade-in lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-forest-400" />
              <input
                type="text"
                value={localKeyword}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="搜索物种名称、分类或位置..."
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
                value={filterSiteId || ''}
                onChange={(e) => setFilterSiteId(e.target.value || null)}
                className={cn(
                  'w-full sm:w-52 h-11 pl-10 pr-10 rounded-xl appearance-none',
                  'bg-white border border-forest-200 shadow-card',
                  'text-sm text-forest-800',
                  'focus:outline-none focus:ring-2 focus:ring-forest-300 focus:border-forest-400',
                  'transition-all duration-200 cursor-pointer'
                )}
              >
                <option value="">全部监测点</option>
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-forest-400" />
              <select
                value={filterInvasive === null ? '' : String(filterInvasive)}
                onChange={(e) => {
                  const v = e.target.value;
                  setFilterInvasive(v === '' ? null : v === 'true');
                }}
                className={cn(
                  'w-full sm:w-48 h-11 pl-10 pr-10 rounded-xl appearance-none',
                  'bg-white border border-forest-200 shadow-card',
                  'text-sm text-forest-800',
                  'focus:outline-none focus:ring-2 focus:ring-forest-300 focus:border-forest-400',
                  'transition-all duration-200 cursor-pointer'
                )}
              >
                <option value="">全部物种</option>
                <option value="true">仅入侵物种</option>
                <option value="false">仅本土物种</option>
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
            新增物种记录
          </button>
        </div>

        {filteredSpecies.length === 0 ? (
          <EmptyState
            icon={<Leaf className="w-8 h-8" strokeWidth={1.5} />}
            title="暂无物种记录"
            description={
              localKeyword || filterSiteId || filterInvasive !== null
                ? '没有找到匹配的物种记录，请调整搜索条件或筛选器。'
                : '还没有创建任何物种记录，点击右上角按钮开始添加第一条物种观测数据。'
            }
            actionText={
              localKeyword || filterSiteId || filterInvasive !== null
                ? '清除筛选'
                : '新增物种记录'
            }
            onAction={() => {
              if (localKeyword || filterSiteId || filterInvasive !== null) {
                handleClearFilters();
              } else {
                setIsModalOpen(true);
              }
            }}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredSpecies.map((sp, index) => {
              const firstPhoto = sp.photos[0];
              const siteName = siteNameMap[sp.siteId] || '未知监测点';

              return (
                <div
                  key={sp.id}
                  onClick={() => handleCardClick(sp.id)}
                  className={cn(
                    'group cursor-pointer overflow-hidden rounded-xl bg-white shadow-card',
                    'transition-all duration-300 ease-out',
                    'hover:shadow-card-hover hover:-translate-y-1',
                    'animate-slide-up',
                    sp.isInvasive
                      ? 'border-2 border-red-300 hover:border-red-400'
                      : 'border border-forest-100/50 hover:border-forest-200'
                  )}
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-forest-100 to-lake-100">
                    {firstPhoto ? (
                      <img
                        src={firstPhoto}
                        alt={sp.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Leaf className="h-20 w-20 text-forest-300 opacity-50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                    {sp.isInvasive && (
                      <div className="absolute top-3 left-3">
                        <Badge text="入侵物种" variant="danger" />
                      </div>
                    )}

                    <div className="absolute bottom-3 left-4 right-4">
                      <h3 className="font-bold text-white text-lg drop-shadow-sm truncate">
                        {sp.name}
                      </h3>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <Badge text={sp.taxonomy} variant="info" />
                      <div className="flex items-center gap-1 shrink-0">
                        <Users className="w-3.5 h-3.5 text-lake-500" />
                        <span className="text-sm font-semibold text-forest-700">
                          {sp.count}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-forest-600">
                      <MapPin className="w-4 h-4 shrink-0 text-forest-400" />
                      <span className="truncate">{sp.location}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-forest-600 pt-2 border-t border-forest-100">
                      <div className="flex items-center gap-1.5">
                        <Leaf className="w-4 h-4 shrink-0 text-lake-500" />
                        <span className="truncate">{siteName}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <SpeciesFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
