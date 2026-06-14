import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectId } from '@/hooks/useProjectId';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  AlertCircle,
  Users,
  Heart,
  Star,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useProjectStore, useProjectById, useProjectEffectData, useProjectTargets } from '@/store/projectStore';
import { ProjectSubNav } from '@/components/Layout';
import { StatusBadge, EmptyState, ProgressBar } from '@/components/UI';
import type { EffectData, QuantitativeTarget } from '@/types';

interface ComparisonData {
  name: string;
  baselineValue: number;
  latestValue: number;
  targetValue: number;
  unit: string;
  change: number;
  changePercent: number;
  isPositive: boolean;
  isMet: boolean;
}

const INDICATOR_CONFIG = [
  { name: '村民人均收入', icon: Users, color: '#2E7D32' },
  { name: '就业率', icon: Heart, color: '#3b82f6' },
  { name: '生活质量评分', icon: Star, color: '#FF8F00' },
];

export default function EffectAnalysis() {
  const navigate = useNavigate();
  const projectId = useProjectId();
  const {
    setCurrentProjectId,
    initializeData,
  } = useProjectStore();

  const [selectedIndicators, setSelectedIndicators] = useState<string[]>(
    INDICATOR_CONFIG.map((c) => c.name)
  );

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

  const comparisonData = useMemo((): ComparisonData[] => {
    return INDICATOR_CONFIG.filter((config) =>
      selectedIndicators.includes(config.name)
    ).map((config) => {
      const indicatorData = effectData
        .filter((d) => d.indicatorName === config.name)
        .sort((a, b) => dayjs(a.recordDate).valueOf() - dayjs(b.recordDate).valueOf());

      const baselineValue = indicatorData[0]?.value || 0;
      const latestValue = indicatorData[indicatorData.length - 1]?.value || 0;
      const change = latestValue - baselineValue;
      const changePercent = baselineValue > 0
        ? Math.round((change / baselineValue) * 100)
        : latestValue > 0 ? 100 : 0;

      const target = targets.find((t) => t.indicatorName === config.name);
      const targetValue = target?.targetValue || 0;
      const unit = target?.unit || (config.name === '村民人均收入' ? '元' : config.name === '就业率' ? '%' : '分');

      return {
        name: config.name,
        baselineValue,
        latestValue,
        targetValue,
        unit,
        change,
        changePercent,
        isPositive: change >= 0,
        isMet: latestValue >= targetValue,
      };
    });
  }, [effectData, targets, selectedIndicators]);

  const barChartOption = useMemo(() => {
    const filteredData = comparisonData.filter((d) =>
      selectedIndicators.includes(d.name)
    );

    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        textStyle: { color: '#374151' },
        axisPointer: {
          type: 'shadow',
        },
      },
      legend: {
        data: ['基线值', '最新值', '目标值'],
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
        data: filteredData.map((d) => d.name),
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        axisLabel: { color: '#6b7280', interval: 0 },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: '#f3f4f6' } },
        axisLabel: { color: '#6b7280' },
      },
      series: [
        {
          name: '基线值',
          type: 'bar',
          barWidth: '20%',
          itemStyle: { color: '#9ca3af' },
          data: filteredData.map((d) => d.baselineValue),
        },
        {
          name: '最新值',
          type: 'bar',
          barWidth: '20%',
          itemStyle: { color: '#2E7D32' },
          data: filteredData.map((d) => d.latestValue),
        },
        {
          name: '目标值',
          type: 'bar',
          barWidth: '20%',
          itemStyle: { color: '#FF8F00' },
          data: filteredData.map((d) => d.targetValue),
        },
      ],
    };
  }, [comparisonData, selectedIndicators]);

  const formatValue = (value: number, unit: string) => {
    if (unit === '元') {
      return value.toLocaleString();
    }
    return value.toString();
  };

  const handleIndicatorToggle = (indicatorName: string) => {
    setSelectedIndicators((prev) => {
      if (prev.includes(indicatorName)) {
        if (prev.length === 1) return prev;
        return prev.filter((i) => i !== indicatorName);
      }
      return [...prev, indicatorName];
    });
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

  const hasData = effectData.length > 0;

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
              <p className="mt-1 text-sm text-gray-500">{project.village} · 对比分析</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-500">指标筛选：</span>
              {INDICATOR_CONFIG.map((config) => {
                const Icon = config.icon;
                const isSelected = selectedIndicators.includes(config.name);
                return (
                  <button
                    key={config.name}
                    onClick={() => handleIndicatorToggle(config.name)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all duration-200 ${
                      isSelected
                        ? 'bg-primary-100 text-primary-700 font-medium'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    <Icon size={14} />
                    {config.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <ProjectSubNav />
      </div>

      <div className="p-6 space-y-6">
        {!hasData ? (
          <div className="card p-12 text-center">
            <EmptyState
              icon={AlertCircle}
              title="暂无数据"
              description="请先录入指标数据后再进行对比分析"
              action={
                <button
                  onClick={() => navigate(`/projects/${projectId}/effects/input`)}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  前往录入数据
                </button>
              }
            />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {comparisonData.map((data) => {
                const config = INDICATOR_CONFIG.find((c) => c.name === data.name);
                const Icon = config?.icon || Users;
                return (
                  <div key={data.name} className="card p-6 hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-center gap-3 mb-6">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${config?.color}15` }}
                      >
                        <Icon size={24} style={{ color: config?.color }} />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">{data.name}</h3>
                    </div>

                    <div className="flex items-stretch gap-4">
                      <div className="flex-1 text-center p-4 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500 mb-2">基线数据</p>
                        <p className="text-2xl font-bold text-gray-700">
                          {formatValue(data.baselineValue, data.unit)}
                          <span className="text-sm font-normal text-gray-400 ml-1">{data.unit}</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">项目启动时</p>
                      </div>

                      <div className="flex flex-col items-center justify-center">
                        <div className={`p-2 rounded-full ${
                          data.isPositive ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {data.isPositive ? (
                            <TrendingUp size={20} className="text-green-600" />
                          ) : (
                            <TrendingDown size={20} className="text-red-600" />
                          )}
                        </div>
                        <ArrowRight size={16} className="text-gray-300 my-1" />
                      </div>

                      <div className="flex-1 text-center p-4 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500 mb-2">最新数据</p>
                        <p className="text-2xl font-bold text-primary-600">
                          {formatValue(data.latestValue, data.unit)}
                          <span className="text-sm font-normal text-gray-400 ml-1">{data.unit}</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">当前</p>
                      </div>
                    </div>

                    <div className={`mt-4 text-center p-3 rounded-lg ${
                      data.isPositive ? 'bg-green-50' : 'bg-red-50'
                    }`}>
                      <div className={`inline-flex items-center gap-1.5 ${
                        data.isPositive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {data.isPositive ? (
                          <TrendingUp size={18} />
                        ) : (
                          <TrendingDown size={18} />
                        )}
                        <span className="text-lg font-bold">
                          {data.isPositive ? '+' : ''}{formatValue(Math.abs(data.change), data.unit)}{data.unit}
                        </span>
                        <span className="text-sm font-medium">
                          ({data.isPositive ? '+' : ''}{data.changePercent}%)
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="card p-6 hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">指标对比柱状图</h3>
              <ReactECharts option={barChartOption} style={{ height: '350px', width: '100%' }} />
            </div>

            <div className="card p-6 hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">详细对比分析</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">指标名称</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">基线值</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">最新值</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">目标值</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">变化量</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">变化率</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">完成进度</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.map((data) => {
                      const progress = data.targetValue > 0
                        ? Math.min(Math.round((data.latestValue / data.targetValue) * 100), 100)
                        : 0;
                      return (
                        <tr
                          key={data.name}
                          className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <span className="font-medium text-gray-900">{data.name}</span>
                          </td>
                          <td className="py-4 px-4 text-gray-600">
                            {formatValue(data.baselineValue, data.unit)}{data.unit}
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-bold text-primary-600">
                              {formatValue(data.latestValue, data.unit)}{data.unit}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-gray-600">
                            {formatValue(data.targetValue, data.unit)}{data.unit}
                          </td>
                          <td className="py-4 px-4">
                            <span className={data.isPositive ? 'text-green-600' : 'text-red-600'}>
                              {data.isPositive ? '+' : ''}{formatValue(data.change, data.unit)}{data.unit}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center gap-1 ${
                              data.isPositive ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {data.isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                              {data.isPositive ? '+' : ''}{data.changePercent}%
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2 min-w-[120px]">
                              <div className="flex-1">
                                <ProgressBar value={progress} />
                              </div>
                              <span className="text-sm font-medium text-gray-700 w-12 text-right">
                                {progress}%
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            {data.isMet ? (
                              <span className="inline-flex items-center gap-1 text-green-600">
                                <CheckCircle2 size={16} />
                                <span className="text-sm font-medium">达标</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-red-500">
                                <XCircle size={16} />
                                <span className="text-sm font-medium">未达标</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card p-6 hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">目标完成进度</h3>
              <div className="space-y-6">
                {comparisonData.map((data) => {
                  const progress = data.targetValue > 0
                    ? Math.min(Math.round((data.latestValue / data.targetValue) * 100), 100)
                    : 0;
                  const config = INDICATOR_CONFIG.find((c) => c.name === data.name);
                  const Icon = config?.icon || Users;
                  return (
                    <div key={data.name} className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${config?.color}15` }}
                          >
                            <Icon size={20} style={{ color: config?.color }} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{data.name}</p>
                            <p className="text-xs text-gray-500">
                              目标: {formatValue(data.targetValue, data.unit)}{data.unit}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">
                            {formatValue(data.latestValue, data.unit)}
                            <span className="text-sm font-normal text-gray-400 ml-1">{data.unit}</span>
                          </p>
                          <p className={`text-sm font-medium ${
                            data.isPositive ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {progress}% 完成
                          </p>
                        </div>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${progress}%`,
                            backgroundColor: config?.color || '#2E7D32',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
