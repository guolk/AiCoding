import { useState, useMemo } from 'react';
import {
  Thermometer,
  Droplets,
  Wind,
  Ruler,
  AlertTriangle,
  Filter,
  MapPin,
  Calendar,
  Clock,
  Edit2,
  AlertCircle,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  Activity,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart as ReBarChart,
} from 'recharts';
import { useAppStore } from '@/store';
import { Header } from '@/components/Layout/Header';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';
import { EnvironmentalParam } from '@/types';

const PIE_COLORS = ['#ef4444', '#f59e0b', '#06b6d4', '#8b5cf6', '#40916c'];

interface AbnormalAnalysis {
  abnormalParam: string;
  abnormalParamLabel: string;
  cause: string;
  suggestion: string;
}

const analyzeAbnormal = (item: EnvironmentalParam): AbnormalAnalysis => {
  if (item.soilMoisture < 50) {
    return {
      abnormalParam: 'soilMoisture',
      abnormalParamLabel: '土壤湿度',
      cause: '当月降水量偏少，持续高温蒸发导致土壤水分不足。监测点植被覆盖率较去年同期下降约15%，保水能力减弱。',
      suggestion: '建议增加灌溉频次，关注周边植被健康状况，必要时采取覆盖保墑措施。',
    };
  }
  if (item.waterTransparency < 50) {
    return {
      abnormalParam: 'waterTransparency',
      abnormalParamLabel: '水体透明度',
      cause: '水体富营养化导致浮游植物大量繁殖，加之外来物种水葫芦过度繁殖覆盖水面，悬浮物浓度升高。',
      suggestion: '建议立即开展水葫芦清理工作，监测水体氮磷含量，评估是否需要投放生物制剂。',
    };
  }
  if (item.waterPH < 6.0) {
    return {
      abnormalParam: 'waterPH',
      abnormalParamLabel: '水体pH值',
      cause: '初步怀疑与该月酸雨频率增加有关（当月酸雨天数达8天），上游林地腐殖质冲刷也可能导致pH下降。',
      suggestion: '建议加密监测频次（每周1次），同步监测降雨pH值，排查上游是否存在污染源。',
    };
  }
  if (item.waterTemperature > 28) {
    return {
      abnormalParam: 'waterTemperature',
      abnormalParamLabel: '水温',
      cause: '持续高温天气，水体热容量大导致温度累积升高。监测点周边树荫减少，阳光直射水面时间延长。',
      suggestion: '建议关注水生生物状态，评估是否需要对敏感物种采取保护措施。',
    };
  }
  return {
    abnormalParam: 'general',
    abnormalParamLabel: '综合参数',
    cause: item.abnormalNote || '多项参数偏离正常范围，需综合分析。',
    suggestion: '建议进行全面复核，联系现场测量人员确认操作规范性。',
  };
};

export default function AbnormalData() {
  const { envParams, sites, updateEnvParam } = useAppStore();
  const [filterType, setFilterType] = useState<string>('');
  const [filterSiteId, setFilterSiteId] = useState<string>('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<EnvironmentalParam | null>(null);
  const [editForm, setEditForm] = useState({
    abnormalNote: '',
    cause: '',
    suggestion: '',
  });

  const abnormalData = useMemo(
    () => envParams.filter((e) => e.isAbnormal),
    [envParams]
  );

  const abnormalRate = useMemo(() => {
    if (envParams.length === 0) return '0%';
    return ((abnormalData.length / envParams.length) * 100).toFixed(1) + '%';
  }, [abnormalData.length, envParams.length]);

  const abnormalTypeStats = useMemo(() => {
    const counts: Record<string, number> = {
      土壤湿度异常: 0,
      透明度异常: 0,
      pH值异常: 0,
      水温异常: 0,
      其他异常: 0,
    };
    abnormalData.forEach((item) => {
      const analysis = analyzeAbnormal(item);
      switch (analysis.abnormalParam) {
        case 'soilMoisture':
          counts['土壤湿度异常']++;
          break;
        case 'waterTransparency':
          counts['透明度异常']++;
          break;
        case 'waterPH':
          counts['pH值异常']++;
          break;
        case 'waterTemperature':
          counts['水温异常']++;
          break;
        default:
          counts['其他异常']++;
      }
    });
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }));
  }, [abnormalData]);

  const mainAbnormalType = useMemo(() => {
    if (abnormalTypeStats.length === 0) return '暂无';
    return abnormalTypeStats.reduce((a, b) => (a.value > b.value ? a : b)).name;
  }, [abnormalTypeStats]);

  const siteAbnormalStats = useMemo(() => {
    const map: Record<string, number> = {};
    abnormalData.forEach((item) => {
      const siteName = sites.find((s) => s.id === item.siteId)?.name || '未知';
      map[siteName] = (map[siteName] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, 异常数]) => ({ name, 异常数 }))
      .sort((a, b) => b.异常数 - a.异常数);
  }, [abnormalData, sites]);

  const filteredAbnormalData = useMemo(() => {
    return abnormalData.filter((item) => {
      if (filterSiteId && item.siteId !== filterSiteId) return false;
      if (filterType) {
        const analysis = analyzeAbnormal(item);
        const typeMap: Record<string, string> = {
          soilMoisture: '土壤湿度异常',
          waterTransparency: '透明度异常',
          waterPH: 'pH值异常',
          waterTemperature: '水温异常',
          general: '其他异常',
        };
        if (typeMap[analysis.abnormalParam] !== filterType) return false;
      }
      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [abnormalData, filterSiteId, filterType]);

  const getSiteName = (siteId: string) => {
    return sites.find((s) => s.id === siteId)?.name || '未知监测点';
  };

  const getNormalAvg = (param: keyof EnvironmentalParam) => {
    const normal = envParams.filter((e) => !e.isAbnormal);
    if (normal.length === 0) return 0;
    const sum = normal.reduce((acc, e) => {
      const val = e[param];
      return acc + (typeof val === 'number' ? val : 0);
    }, 0);
    return sum / normal.length;
  };

  const buildMiniChartData = (abnormalItem: EnvironmentalParam) => {
    const params = [
      { key: 'soilTemperature' as const, label: '土温' },
      { key: 'soilMoisture' as const, label: '湿度' },
      { key: 'waterPH' as const, label: 'pH' },
      { key: 'waterTemperature' as const, label: '水温' },
      { key: 'waterTransparency' as const, label: '透明度' },
    ];
    return params.map(({ key, label }) => ({
      参数: label,
      正常值: parseFloat(getNormalAvg(key).toFixed(1)),
      异常值: parseFloat((abnormalItem[key] as number).toFixed(1)),
    }));
  };

  const handleOpenEditModal = (record: EnvironmentalParam) => {
    const analysis = analyzeAbnormal(record);
    setEditingRecord(record);
    setEditForm({
      abnormalNote: record.abnormalNote,
      cause: analysis.cause,
      suggestion: analysis.suggestion,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingRecord) return;
    updateEnvParam(editingRecord.id, {
      abnormalNote: editForm.abnormalNote,
    });
    setIsEditModalOpen(false);
    setEditingRecord(null);
  };

  const inputClass = cn(
    'w-full px-3 py-2 rounded-xl border border-forest-200',
    'text-sm text-forest-800 bg-white',
    'focus:outline-none focus:ring-2 focus:ring-forest-200 focus:border-forest-300',
    'transition-all duration-200'
  );

  const labelClass = 'block text-sm font-medium text-forest-700 mb-1.5';

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-50/50 via-white to-lake-50/30">
      <Header title="异常数据标注分析" subtitle="异常数据的标注、分析与处理追踪" />

      <div className="mx-auto max-w-7xl px-6 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-fade-in">
          <StatCard
            title="异常数据总数"
            value={`${abnormalData.length}条`}
            icon={<AlertTriangle className="h-6 w-6" strokeWidth={2} />}
            trend={`较上月 +${Math.max(0, abnormalData.length - 1)}条`}
            trendUp={true}
            color="forest"
          />
          <StatCard
            title="异常率"
            value={abnormalRate}
            icon={<Activity className="h-6 w-6" strokeWidth={2} />}
            trend={`总样本${envParams.length}条`}
            color="sun"
          />
          <StatCard
            title="主要异常类型"
            value={mainAbnormalType}
            icon={<AlertCircle className="h-6 w-6" strokeWidth={2} />}
            trend={`共${abnormalTypeStats.length}类`}
            color="lake"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          <div className="rounded-2xl border border-forest-100 bg-white p-6 shadow-card">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-forest-800 flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-lake-500" />
                  异常类型占比
                </h2>
                <p className="mt-1 text-sm text-forest-500">各类型异常数据的分布情况</p>
              </div>
            </div>
            {abnormalTypeStats.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-forest-400">暂无异常数据</div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={abnormalTypeStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {abnormalTypeStats.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #E5E7EB',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                      formatter={(value: number) => [`${value}条`, '数量']}
                    />
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      wrapperStyle={{ fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-forest-100 bg-white p-6 shadow-card">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-forest-800 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-forest-500" />
                  各监测点异常数
                </h2>
                <p className="mt-1 text-sm text-forest-500">不同监测站点的异常数据数量对比</p>
              </div>
            </div>
            {siteAbnormalStats.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-forest-400">暂无异常数据</div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ReBarChart data={siteAbnormalStats} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6B7280', fontSize: 11 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                      width={30}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #E5E7EB',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                      cursor={{ fill: 'rgba(64, 145, 108, 0.05)' }}
                    />
                    <Bar
                      dataKey="异常数"
                      fill="#40916C"
                      radius={[8, 8, 0, 0]}
                      barSize={36}
                    />
                  </ReBarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-forest-100 bg-white p-5 shadow-card animate-fade-in">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex items-center gap-2 text-forest-700">
                <Filter className="h-5 w-5" />
                <span className="font-medium">筛选条件</span>
              </div>

              <div className="min-w-[180px]">
                <label className={labelClass}>异常类型</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className={inputClass}
                >
                  <option value="">全部类型</option>
                  {abnormalTypeStats.map((t) => (
                    <option key={t.name} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="min-w-[180px]">
                <label className={labelClass}>监测点</label>
                <select
                  value={filterSiteId}
                  onChange={(e) => setFilterSiteId(e.target.value)}
                  className={inputClass}
                >
                  <option value="">全部监测点</option>
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-sm text-forest-600">
              共找到 <span className="font-bold text-red-600">{filteredAbnormalData.length}</span> 条异常记录
            </div>
          </div>
        </div>

        {filteredAbnormalData.length === 0 ? (
          <EmptyState
            icon={<AlertTriangle className="h-8 w-8" />}
            title="暂无异常数据"
            description="当前筛选条件下未找到异常记录，请尝试调整筛选条件"
          />
        ) : (
          <div className="space-y-5">
            {filteredAbnormalData.map((item, idx) => {
              const analysis = analyzeAbnormal(item);
              const miniChartData = buildMiniChartData(item);
              return (
                <div
                  key={item.id}
                  className={cn(
                    'rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-card-hover animate-fade-in',
                    'bg-white border-red-200 shadow-card'
                  )}
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <div className="bg-gradient-to-r from-red-50 to-sun-50 px-6 py-4 border-b border-red-100">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0">
                          <AlertTriangle className="h-5.5 w-5.5" strokeWidth={2} />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="text-base font-bold text-forest-800">
                              {analysis.abnormalParamLabel}异常
                            </h3>
                            <Badge text="异常" variant="danger" />
                            <Badge text={getSiteName(item.siteId)} variant="info" />
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-forest-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {item.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {item.measureTime}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {getSiteName(item.siteId)}
                            </span>
                            <span>
                              仪器：<span className="font-medium">{item.instrument}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className={cn(
                          'flex items-center gap-1.5 rounded-xl px-4 py-2',
                          'bg-forest-500 text-white text-sm font-medium',
                          'hover:bg-forest-600 active:bg-forest-700',
                          'transition-colors duration-200 shadow-sm'
                        )}
                      >
                        <Edit2 className="h-4 w-4" />
                        编辑标注
                      </button>
                    </div>
                  </div>

                  <div className="p-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div className="rounded-xl bg-gradient-to-br from-forest-50 to-forest-100/50 p-3">
                          <div className="flex items-center gap-1 text-xs text-forest-500 mb-1">
                            <Thermometer className="h-3 w-3" />
                            土壤温度
                          </div>
                          <div className="text-lg font-bold text-forest-800 tabular-nums">
                            {item.soilTemperature.toFixed(1)}<span className="text-xs font-normal text-forest-500 ml-0.5">℃</span>
                          </div>
                        </div>
                        <div className="rounded-xl bg-gradient-to-br from-lake-50 to-lake-100/50 p-3">
                          <div className="flex items-center gap-1 text-xs text-lake-600 mb-1">
                            <Droplets className="h-3 w-3" />
                            土壤湿度
                          </div>
                          <div className={cn(
                            'text-lg font-bold tabular-nums',
                            analysis.abnormalParam === 'soilMoisture' ? 'text-red-600' : 'text-lake-700'
                          )}>
                            {item.soilMoisture.toFixed(1)}<span className="text-xs font-normal opacity-70 ml-0.5">%</span>
                          </div>
                        </div>
                        <div className="rounded-xl bg-gradient-to-br from-sun-50 to-sun-100/50 p-3">
                          <div className="flex items-center gap-1 text-xs text-sun-600 mb-1">
                            <Wind className="h-3 w-3" />
                            水体pH
                          </div>
                          <div className={cn(
                            'text-lg font-bold tabular-nums',
                            analysis.abnormalParam === 'waterPH' ? 'text-red-600' : 'text-sun-700'
                          )}>
                            {item.waterPH.toFixed(1)}
                          </div>
                        </div>
                        <div className="rounded-xl bg-gradient-to-br from-red-50 to-sun-50 p-3">
                          <div className="flex items-center gap-1 text-xs text-red-500 mb-1">
                            <Thermometer className="h-3 w-3" />
                            水温
                          </div>
                          <div className={cn(
                            'text-lg font-bold tabular-nums',
                            analysis.abnormalParam === 'waterTemperature' ? 'text-red-600' : 'text-red-700'
                          )}>
                            {item.waterTemperature.toFixed(1)}<span className="text-xs font-normal opacity-70 ml-0.5">℃</span>
                          </div>
                        </div>
                        <div className="rounded-xl bg-gradient-to-br from-earth-50 to-earth-100/50 p-3">
                          <div className="flex items-center gap-1 text-xs text-earth-600 mb-1">
                            <Ruler className="h-3 w-3" />
                            透明度
                          </div>
                          <div className={cn(
                            'text-lg font-bold tabular-nums',
                            analysis.abnormalParam === 'waterTransparency' ? 'text-red-600' : 'text-earth-700'
                          )}>
                            {item.waterTransparency}<span className="text-xs font-normal opacity-70 ml-0.5">cm</span>
                          </div>
                        </div>
                      </div>

                      {item.abnormalNote && (
                        <div className="rounded-xl border border-sun-200 bg-sun-50/60 p-4">
                          <div className="flex items-center gap-2 text-sm font-semibold text-sun-700 mb-2">
                            <AlertCircle className="h-4 w-4" />
                            现场标注说明
                          </div>
                          <p className="text-sm text-forest-700 leading-relaxed">
                            {item.abnormalNote}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="lg:col-span-3 space-y-4">
                      <div className="h-48 bg-gradient-to-br from-forest-50/30 to-lake-50/30 rounded-xl p-3 border border-forest-100">
                        <div className="text-xs font-medium text-forest-600 mb-1 flex items-center gap-1.5">
                          <TrendingUp className="h-3.5 w-3.5" />
                          正常 vs 异常 参数对比
                        </div>
                        <ResponsiveContainer width="100%" height="85%">
                          <BarChart data={miniChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                            <XAxis
                              dataKey="参数"
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: '#6B7280', fontSize: 11 }}
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
                                borderRadius: '10px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                fontSize: '12px',
                              }}
                              cursor={{ fill: 'rgba(64, 145, 108, 0.05)' }}
                            />
                            <Bar dataKey="正常值" fill="#40916C" radius={[4, 4, 0, 0]} barSize={14} />
                            <Bar dataKey="异常值" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={14} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="rounded-xl border border-red-100 bg-red-50/50 p-4">
                          <div className="flex items-center gap-2 text-sm font-semibold text-red-700 mb-2">
                            <AlertCircle className="h-4 w-4" />
                            异常原因分析
                          </div>
                          <p className="text-sm text-forest-700 leading-relaxed">
                            {analysis.cause}
                          </p>
                        </div>
                        <div className="rounded-xl border border-forest-100 bg-forest-50/50 p-4">
                          <div className="flex items-center gap-2 text-sm font-semibold text-forest-700 mb-2">
                            <TrendingUp className="h-4 w-4" />
                            处理建议
                          </div>
                          <p className="text-sm text-forest-700 leading-relaxed">
                            {analysis.suggestion}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingRecord(null);
        }}
        title="编辑异常标注"
        footer={
          <>
            <button
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingRecord(null);
              }}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium',
                'border border-forest-200 text-forest-600',
                'hover:bg-forest-50 transition-colors duration-200'
              )}
            >
              取消
            </button>
            <button
              onClick={handleSaveEdit}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium',
                'bg-forest-500 text-white',
                'hover:bg-forest-600 active:bg-forest-700',
                'transition-colors duration-200 shadow-sm'
              )}
            >
              保存修改
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-xl bg-forest-50/50 p-4 border border-forest-100">
            <div className="text-xs text-forest-500 mb-1">当前记录</div>
            <div className="text-sm font-medium text-forest-800">
              {editingRecord && `${getSiteName(editingRecord.siteId)} - ${editingRecord.date}`}
            </div>
          </div>

          <div>
            <label className={labelClass}>异常标注说明</label>
            <textarea
              value={editForm.abnormalNote}
              onChange={(e) => setEditForm({ ...editForm, abnormalNote: e.target.value })}
              placeholder="请描述现场观测到的异常情况..."
              rows={3}
              className={cn(inputClass, 'resize-none')}
            />
          </div>

          <div>
            <label className={labelClass}>异常原因分析</label>
            <textarea
              value={editForm.cause}
              onChange={(e) => setEditForm({ ...editForm, cause: e.target.value })}
              placeholder="分析导致异常的可能原因..."
              rows={3}
              className={cn(inputClass, 'resize-none')}
            />
          </div>

          <div>
            <label className={labelClass}>处理建议</label>
            <textarea
              value={editForm.suggestion}
              onChange={(e) => setEditForm({ ...editForm, suggestion: e.target.value })}
              placeholder="给出后续处理和监测建议..."
              rows={3}
              className={cn(inputClass, 'resize-none')}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
