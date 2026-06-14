import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectId } from '@/hooks/useProjectId';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Heart,
  Star,
  ChevronRight,
  AlertCircle,
  Clock,
  User,
} from 'lucide-react';
import { useProjectStore, useProjectById, useProjectEffectData, useProjectTargets } from '@/store/projectStore';
import { ProjectSubNav } from '@/components/Layout';
import { StatusBadge, EmptyState, ProgressBar } from '@/components/UI';
import { ProjectStatusMap } from '@/types';
import type { EffectData, QuantitativeTarget } from '@/types';

interface IndicatorLatestData {
  name: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  completionRate: number;
  trend: number;
  trendUp: boolean;
}

export default function EffectOverview() {
  const navigate = useNavigate();
  const projectId = useProjectId();
  const {
    setCurrentProjectId,
    initializeData,
  } = useProjectStore();

  const project = useProjectById(projectId);
  const effectData = useProjectEffectData(projectId);
  const targets = useProjectTargets(projectId);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  useEffect(() => {
    if (projectId) {
      setCurrentProjectId(projectId);
    }
    return () => {
      setCurrentProjectId(null);
    };
  }, [projectId, setCurrentProjectId]);

  const indicatorConfig = useMemo(() => [
    { name: '村民人均收入', icon: Users, color: 'green' as const, unit: '元' },
    { name: '就业率', icon: Heart, color: 'blue' as const, unit: '%' },
    { name: '生活质量评分', icon: Star, color: 'orange' as const, unit: '分' },
  ], []);

  const indicatorLatestData = useMemo((): IndicatorLatestData[] => {
    return indicatorConfig.map((config) => {
      const indicatorData = effectData
        .filter((d) => d.indicatorName === config.name)
        .sort((a, b) => dayjs(b.recordDate).valueOf() - dayjs(a.recordDate).valueOf());

      const currentValue = indicatorData[0]?.value || 0;
      const previousValue = indicatorData[1]?.value || currentValue;
      const trend = previousValue > 0 ? Math.round(((currentValue - previousValue) / previousValue) * 100) : 0;

      const target = targets.find((t) => t.indicatorName === config.name);
      const targetValue = target?.targetValue || 100;
      const completionRate = Math.min(Math.round((currentValue / targetValue) * 100), 100);

      return {
        name: config.name,
        currentValue,
        targetValue,
        unit: config.unit,
        completionRate,
        trend: Math.abs(trend),
        trendUp: trend >= 0,
      };
    });
  }, [effectData, targets, indicatorConfig]);

  const overallCompletionRate = useMemo(() => {
    if (indicatorLatestData.length === 0) return 0;
    const totalRate = indicatorLatestData.reduce((sum, d) => sum + d.completionRate, 0);
    return Math.round(totalRate / indicatorLatestData.length);
  }, [indicatorLatestData]);

  const trendChartOption = useMemo(() => {
    const periods = Array.from(new Set(effectData.map((d) => d.period))).sort();

    const series = indicatorConfig.map((config) => {
      const data = periods.map((period) => {
        const record = effectData.find(
          (d) => d.indicatorName === config.name && d.period === period
        );
        return record ? record.value : null;
      });

      return {
        name: config.name,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { width: 3 },
        itemStyle: { color: config.color === 'green' ? '#2E7D32' : config.color === 'blue' ? '#3b82f6' : '#FF8F00' },
        data,
      };
    });

    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        textStyle: { color: '#374151' },
      },
      legend: {
        data: indicatorConfig.map((c) => c.name),
        top: 0,
        right: 0,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: periods,
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        axisLabel: { color: '#6b7280' },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: '#f3f4f6' } },
        axisLabel: { color: '#6b7280' },
      },
      series,
    };
  }, [effectData, indicatorConfig]);

  const recentRecords = useMemo(() => {
    return [...effectData]
      .sort((a, b) => dayjs(b.recordDate).valueOf() - dayjs(a.recordDate).valueOf())
      .slice(0, 5);
  }, [effectData]);

  const formatValue = (value: number, unit: string) => {
    if (unit === '元') {
      return value.toLocaleString();
    }
    return value.toString();
  };

  if (!project) {
    return (
      <div className="p-6">
        <EmptyState
          icon={AlertCircle}
          title="项目不存在"
          description="该项目可能已被删除或不存在"
          action={
            <button onClick={() => navigate('/projects')} className="btn-primary">
              返回项目列表
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
                <StatusBadge status={project.status} type="project" />
              </div>
              <p className="mt-1 text-sm text-gray-500">{project.village} · 成效数据概览</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm text-gray-500">整体目标完成率</div>
                <div className="text-2xl font-bold text-primary-600">{overallCompletionRate}%</div>
              </div>
              <div className="w-32">
                <ProgressBar value={overallCompletionRate} />
              </div>
            </div>
          </div>
        </div>
        <ProjectSubNav />
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {indicatorLatestData.map((data, index) => {
            const config = indicatorConfig[index];
            const Icon = config.icon;
            return (
              <div key={data.name} className="card p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      config.color === 'green' ? 'bg-green-50' :
                      config.color === 'blue' ? 'bg-blue-50' : 'bg-orange-50'
                    }`}>
                      <Icon size={24} className={
                        config.color === 'green' ? 'text-green-600' :
                        config.color === 'blue' ? 'text-blue-600' : 'text-orange-600'
                      } />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">{data.name}</h3>
                      <p className="text-sm text-gray-500">目标: {formatValue(data.targetValue, data.unit)}{data.unit}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-end justify-between mb-3">
                  <div>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatValue(data.currentValue, data.unit)}
                      <span className="text-base font-normal text-gray-500 ml-1">{data.unit}</span>
                    </p>
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    data.trendUp ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {data.trendUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    <span>{data.trendUp ? '+' : ''}{data.trend}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-500">完成进度</span>
                  <span className="font-medium text-gray-700">{data.completionRate}%</span>
                </div>
                <ProgressBar value={data.completionRate} />
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card p-6 hover:shadow-lg transition-shadow duration-300 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">指标趋势</h3>
              <button
                onClick={() => navigate(`/projects/${projectId}/effects/analysis`)}
                className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                对比分析 <ChevronRight size={16} />
              </button>
            </div>
            {effectData.length === 0 ? (
              <EmptyState
                icon={TrendingUp}
                title="暂无趋势数据"
                description="请先录入指标数据"
              />
            ) : (
              <ReactECharts option={trendChartOption} style={{ height: '300px', width: '100%' }} />
            )}
          </div>

          <div className="card p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">最近录入</h3>
              <button
                onClick={() => navigate(`/projects/${projectId}/effects/input`)}
                className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                数据录入 <ChevronRight size={16} />
              </button>
            </div>
            {recentRecords.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="暂无录入记录"
                description="请先录入指标数据"
              />
            ) : (
              <div className="space-y-4">
                {recentRecords.map((record) => (
                  <div
                    key={record.id}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">{record.indicatorName}</span>
                      <span className="text-xs text-gray-500">{record.period}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary-600">
                        {record.value}{record.unit}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <User size={12} />
                        <span>{record.recorder}</span>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-400">
                      {dayjs(record.recordDate).format('YYYY-MM-DD')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">受益案例</h3>
            <button
              onClick={() => navigate(`/projects/${projectId}/effects/cases`)}
              className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              查看全部 <ChevronRight size={16} />
            </button>
          </div>
          <div className="text-center py-8">
            <button
              onClick={() => navigate(`/projects/${projectId}/effects/cases`)}
              className="btn-primary inline-flex items-center gap-2"
            >
              查看受益案例详情
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
