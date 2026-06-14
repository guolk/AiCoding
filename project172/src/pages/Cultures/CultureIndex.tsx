import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Pencil, Eye, FlaskConical, Thermometer, Clock, Wind, Beaker } from 'lucide-react';
import { useLabStore } from '@/store/useLabStore';
import AppLayout from '@/components/Layout/AppLayout';
import { Button, Badge } from '@/components/Common';
import { cn } from '@/lib/utils';

type TabKey = 'media' | 'cultures';

interface IngredientItem {
  name: string;
  amount: string;
  unit: string;
}

interface CultureDisplay {
  id: string;
  strainName: string;
  mediumName: string;
  date: string;
  operator: string;
  inoculumVolume: number;
  temperature: number;
  durationHours: number;
  aeration: string;
  growthRate: string;
  morphologyObservation: string;
  densityOd600: number;
}

const GROWTH_RATE_COLORS: Record<string, string> = {
  快: 'bg-[#00B42A]/10 text-[#00B42A]',
  中: 'bg-[#FF7D00]/10 text-[#FF7D00]',
  慢: 'bg-[#86909C]/10 text-[#86909C]',
};

const OPERATORS = ['张研究员', '李实验员', '王工程师', '赵技术员'];

const parseFormula = (formula: string): IngredientItem[] => {
  const result: IngredientItem[] = [];
  if (!formula) return result;

  const parts = formula.split(/[，,、]/).map((p) => p.trim()).filter(Boolean);
  for (const part of parts) {
    if (part.includes('（') || part.includes('(')) continue;
    const match = part.match(/^([^\d]+)([\d.]+)\s*([a-zA-Z\/]+)/);
    if (match) {
      result.push({
        name: match[1].trim(),
        amount: match[2],
        unit: match[3],
      });
    } else {
      const altMatch = part.match(/^([^\d]+)([\d.]+)/);
      if (altMatch) {
        result.push({
          name: altMatch[1].trim(),
          amount: altMatch[2],
          unit: 'g/L',
        });
      } else if (part) {
        result.push({
          name: part,
          amount: '-',
          unit: '',
        });
      }
    }
  }
  return result;
};

const generateCultureDate = (index: number): string => {
  const baseDate = new Date('2025-05-01');
  baseDate.setDate(baseDate.getDate() + index * 3);
  return baseDate.toISOString().split('T')[0];
};

export default function CultureIndex() {
  const navigate = useNavigate();
  const { media, cultures, strains } = useLabStore();

  const [activeTab, setActiveTab] = useState<TabKey>('media');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [strainFilter, setStrainFilter] = useState<string>('');
  const [mediumFilter, setMediumFilter] = useState<string>('');

  const filteredMedia = useMemo(() => {
    return media.filter((m) => {
      if (!searchKeyword) return true;
      const kw = searchKeyword.toLowerCase();
      return (
        m.name.toLowerCase().includes(kw) ||
        m.formula.toLowerCase().includes(kw)
      );
    });
  }, [media, searchKeyword]);

  const cultureDisplayList: CultureDisplay[] = useMemo(() => {
    return cultures
      .filter((c) => {
        if (strainFilter && c.strainId !== strainFilter) return false;
        if (mediumFilter && c.mediumId !== mediumFilter) return false;
        return true;
      })
      .map((c, index) => {
        const strain = strains.find((s) => s.id === c.strainId);
        const medium = media.find((m) => m.id === c.mediumId);
        return {
          id: c.id,
          strainName: strain?.name || '未知菌株',
          mediumName: medium?.name || '未知培养基',
          date: generateCultureDate(index),
          operator: OPERATORS[index % OPERATORS.length],
          inoculumVolume: c.inoculumVolume,
          temperature: c.temperature,
          durationHours: c.durationHours,
          aeration: c.aeration,
          growthRate: c.growthRate,
          morphologyObservation: c.morphologyObservation,
          densityOd600: c.densityOd600,
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [cultures, strains, media, strainFilter, mediumFilter]);

  return (
    <AppLayout breadcrumbItems={[{ label: '培养记录' }]}>
      <div className="min-h-full bg-[#F2F3F5] -m-6 p-6">
        <div className="max-w-[1600px] mx-auto">
          <div className="mb-6">
            <h1 className="text-[22px] font-bold text-gray-900">培养记录</h1>
            <p className="text-[13px] text-gray-500 mt-1">
              管理培养基配方库和微生物培养操作记录
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-5">
            <div className="border-b border-gray-100 px-6">
              <div className="flex gap-8">
                {[
                  { key: 'media' as TabKey, label: '培养基配方库', icon: Beaker },
                  { key: 'cultures' as TabKey, label: '培养操作记录', icon: FlaskConical },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={cn(
                        'relative flex items-center gap-2 py-4 px-1 text-[15px] font-medium transition-colors',
                        isActive ? 'text-[#165DFF]' : 'text-gray-500 hover:text-gray-700',
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                      {isActive && (
                        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#165DFF] rounded-t" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {activeTab === 'media' && (
            <div>
              <div className="bg-white rounded-lg p-4 mb-5 shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="搜索培养基名称或成分..."
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      className={cn(
                        'w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200',
                        'focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                        'text-[14px] text-gray-700 placeholder-gray-400 transition-all',
                      )}
                    />
                  </div>
                  <Button
                    leftIcon={<Plus className="h-4 w-4" />}
                    onClick={() => navigate('/cultures/media/new')}
                  >
                    新增配方
                  </Button>
                </div>
              </div>

              {filteredMedia.length === 0 ? (
                <div className="bg-white rounded-lg p-12 text-center shadow-sm border border-gray-100">
                  <Beaker className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    {searchKeyword ? '未找到匹配的培养基配方' : '暂无培养基配方，点击"新增配方"添加'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredMedia.map((medium) => {
                    const ingredients = parseFormula(medium.formula);
                    return (
                      <div
                        key={medium.id}
                        className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                        style={{ borderRadius: '8px' }}
                      >
                        <div className="px-5 py-4 border-b border-gray-50 bg-gradient-to-r from-blue-50/50 to-white">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="text-[17px] font-bold text-gray-900 leading-snug flex-1">
                              {medium.name}
                            </h3>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <Badge type="info">pH {medium.phValue}</Badge>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center gap-2 flex-wrap">
                            <span className={cn(
                              'inline-flex items-center rounded-md px-2 py-0.5 text-[12px] font-medium',
                              'bg-[#722ED1]/10 text-[#722ED1]',
                            )}>
                              {medium.sterilizationMethod.split('，')[0].split('高压蒸汽')[0] ||
                                medium.sterilizationMethod.slice(0, 12)}
                            </span>
                          </div>
                        </div>

                        <div className="p-4">
                          <div className="text-[12px] font-medium text-gray-500 mb-2">配方成分</div>
                          <div className="max-h-[120px] overflow-y-auto pr-1 space-y-1.5">
                            {ingredients.length > 0 ? (
                              ingredients.map((ing, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md bg-gray-50"
                                >
                                  <span className="text-[13px] text-gray-700 truncate">
                                    {ing.name}
                                  </span>
                                  <span className="text-[12px] font-medium text-[#165DFF] shrink-0 ml-2">
                                    {ing.amount}
                                    {ing.unit}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <div className="text-[12px] text-gray-400 py-2 text-center">
                                {medium.formula || '暂无成分信息'}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
                          <span className="text-[12px] text-gray-400">创建于 {medium.createdAt}</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => navigate(`/cultures/media/${medium.id}/edit`)}
                              className="p-2 rounded-md text-gray-500 hover:bg-[#165DFF]/10 hover:text-[#165DFF] transition-colors"
                              title="编辑配方"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => navigate(`/cultures/media/${medium.id}/edit`)}
                              className="p-2 rounded-md text-gray-500 hover:bg-[#00B42A]/10 hover:text-[#00B42A] transition-colors"
                              title="查看详情"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-5 text-[13px] text-gray-500">
                共 <span className="text-gray-800 font-semibold">{filteredMedia.length}</span> 个培养基配方
              </div>
            </div>
          )}

          {activeTab === 'cultures' && (
            <div>
              <div className="bg-white rounded-lg p-4 mb-5 shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] text-gray-500 shrink-0">菌株：</span>
                      <select
                        value={strainFilter}
                        onChange={(e) => setStrainFilter(e.target.value)}
                        className={cn(
                          'h-10 px-3 rounded-lg border border-gray-200 bg-white',
                          'focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                          'text-[14px] text-gray-700 min-w-[140px] transition-all',
                        )}
                      >
                        <option value="">全部菌株</option>
                        {strains.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] text-gray-500 shrink-0">培养基：</span>
                      <select
                        value={mediumFilter}
                        onChange={(e) => setMediumFilter(e.target.value)}
                        className={cn(
                          'h-10 px-3 rounded-lg border border-gray-200 bg-white',
                          'focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                          'text-[14px] text-gray-700 min-w-[160px] transition-all',
                        )}
                      >
                        <option value="">全部培养基</option>
                        {media.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <Button
                    leftIcon={<Plus className="h-4 w-4" />}
                    onClick={() => navigate('/cultures/new')}
                  >
                    新增培养
                  </Button>
                </div>
              </div>

              {cultureDisplayList.length === 0 ? (
                <div className="bg-white rounded-lg p-12 text-center shadow-sm border border-gray-100">
                  <FlaskConical className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    {strainFilter || mediumFilter
                      ? '未找到匹配的培养记录'
                      : '暂无培养记录，点击"新增培养"添加第一条记录'}
                  </p>
                </div>
              ) : (
                <div className="relative pl-8">
                  <div className="absolute left-[15px] top-2 bottom-2 w-[2px] bg-gray-200" />
                  <div className="space-y-6">
                    {cultureDisplayList.map((item, idx) => (
                      <div key={item.id} className="relative">
                        <div
                          className="absolute -left-[30px] top-5 h-[8px] w-[8px] rounded-full bg-[#165DFF] ring-4 ring-[#165DFF]/15 z-10"
                        />
                        {idx < cultureDisplayList.length - 1 && (
                          <div className="absolute -left-[27px] top-[34px] bottom-[-24px] w-[2px] bg-gray-200" />
                        )}

                        <div
                          className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden ml-2 hover:shadow-md transition-shadow"
                          style={{ borderRadius: '8px' }}
                        >
                          <div className="px-5 py-4 border-b border-gray-50">
                            <div className="flex items-start justify-between gap-4 flex-wrap">
                              <div className="flex items-center gap-3 flex-wrap">
                                <h3 className="text-[17px] font-bold text-gray-900">
                                  {item.strainName}
                                </h3>
                                <Badge type="info">{item.mediumName}</Badge>
                              </div>
                              <span className="text-[13px] text-gray-500">{item.date}</span>
                            </div>
                          </div>

                          <div className="px-5 py-4 border-b border-gray-50">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#165DFF]/8">
                                  <FlaskConical className="h-4 w-4 text-[#165DFF]" />
                                </div>
                                <div>
                                  <div className="text-[11px] text-gray-400">接种量</div>
                                  <div className="text-[14px] font-semibold text-gray-800">
                                    {item.inoculumVolume} μL
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F53F3F]/8">
                                  <Thermometer className="h-4 w-4 text-[#F53F3F]" />
                                </div>
                                <div>
                                  <div className="text-[11px] text-gray-400">温度</div>
                                  <div className="text-[14px] font-semibold text-gray-800">
                                    {item.temperature} ℃
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FF7D00]/8">
                                  <Clock className="h-4 w-4 text-[#FF7D00]" />
                                </div>
                                <div>
                                  <div className="text-[11px] text-gray-400">时间</div>
                                  <div className="text-[14px] font-semibold text-gray-800">
                                    {item.durationHours} h
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#00B42A]/8">
                                  <Wind className="h-4 w-4 text-[#00B42A]" />
                                </div>
                                <div>
                                  <div className="text-[11px] text-gray-400">通气</div>
                                  <div className="text-[14px] font-semibold text-gray-800">
                                    {item.aeration}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="px-5 py-4 border-b border-gray-50 bg-gradient-to-r from-green-50/30 to-white">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                              <div>
                                <div className="text-[11px] text-gray-400 mb-1.5">生长速度</div>
                                <span
                                  className={cn(
                                    'inline-flex items-center rounded-full px-3 py-1 text-[13px] font-semibold',
                                    GROWTH_RATE_COLORS[item.growthRate] || GROWTH_RATE_COLORS.中,
                                  )}
                                >
                                  {item.growthRate}
                                </span>
                              </div>
                              <div className="md:col-span-1">
                                <div className="text-[11px] text-gray-400 mb-1.5">形态观察</div>
                                <p className="text-[13px] text-gray-700 leading-relaxed">
                                  {item.morphologyObservation}
                                </p>
                              </div>
                              <div className="flex flex-col items-center justify-center">
                                <div className="text-[11px] text-gray-400 mb-1">OD600 密度</div>
                                <div className="text-[32px] font-bold text-[#165DFF] leading-none">
                                  {item.densityOd600 > 0 ? item.densityOd600.toFixed(2) : '-'}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="px-5 py-3 bg-gray-50/50 flex items-center justify-between">
                            <span className="text-[13px] text-gray-500">
                              操作人：<span className="text-gray-700 font-medium">{item.operator}</span>
                            </span>
                            <Button
                              variant="secondary"
                              size="sm"
                              leftIcon={<Eye className="h-3.5 w-3.5" />}
                            >
                              查看详情
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-5 text-[13px] text-gray-500">
                共 <span className="text-gray-800 font-semibold">{cultureDisplayList.length}</span> 条培养记录
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
