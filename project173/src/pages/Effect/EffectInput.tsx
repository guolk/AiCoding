import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectId } from '@/hooks/useProjectId';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import {
  Plus,
  Edit,
  Trash2,
  TrendingUp,
  AlertCircle,
  X,
  Check,
} from 'lucide-react';
import { useProjectStore, useProjectById, useProjectEffectData } from '@/store/projectStore';
import { ProjectSubNav } from '@/components/Layout';
import { StatusBadge, EmptyState, Modal, ConfirmDialog } from '@/components/UI';
import type { EffectData } from '@/types';

interface FormData {
  indicatorName: string;
  period: string;
  value: string;
  unit: string;
  recordDate: string;
  recorder: string;
  remark: string;
}

const INDICATOR_OPTIONS = [
  { name: '村民人均收入', unit: '元' },
  { name: '就业率', unit: '%' },
  { name: '生活质量评分', unit: '分' },
  { name: '环境卫生满意度', unit: '%' },
];

const PERIOD_OPTIONS = [
  '2024年Q1', '2024年Q2', '2024年Q3', '2024年Q4',
  '2025年Q1', '2025年Q2', '2025年Q3', '2025年Q4',
  '2026年Q1', '2026年Q2', '2026年Q3', '2026年Q4',
];

export default function EffectInput() {
  const navigate = useNavigate();
  const projectId = useProjectId();
  const {
    addEffectData,
    updateEffectData,
    setCurrentProjectId,
    initializeData,
  } = useProjectStore();

  const [selectedIndicator, setSelectedIndicator] = useState<string>(INDICATOR_OPTIONS[0].name);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<EffectData | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<EffectData | null>(null);
  const [formData, setFormData] = useState<FormData>({
    indicatorName: INDICATOR_OPTIONS[0].name,
    period: '',
    value: '',
    unit: INDICATOR_OPTIONS[0].unit,
    recordDate: dayjs().format('YYYY-MM-DD'),
    recorder: '',
    remark: '',
  });

  const project = useProjectById(projectId);
  const allEffectData = useProjectEffectData(projectId);

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

  const indicatorData = useMemo(() => {
    return allEffectData
      .filter((d) => d.indicatorName === selectedIndicator)
      .sort((a, b) => dayjs(b.recordDate).valueOf() - dayjs(a.recordDate).valueOf());
  }, [allEffectData, selectedIndicator]);

  const trendChartOption = useMemo(() => {
    const sortedData = [...indicatorData].sort(
      (a, b) => dayjs(a.recordDate).valueOf() - dayjs(b.recordDate).valueOf()
    );

    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        textStyle: { color: '#374151' },
        formatter: (params: any) => {
          const data = params[0];
          return `${data.name}<br/>${selectedIndicator}: ${data.value}${sortedData[0]?.unit || ''}`;
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: sortedData.map((d) => d.period),
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
      series: [
        {
          name: selectedIndicator,
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 10,
          lineStyle: { width: 3, color: '#2E7D32' },
          itemStyle: { color: '#2E7D32' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(46, 125, 50, 0.3)' },
                { offset: 1, color: 'rgba(46, 125, 50, 0.05)' },
              ],
            },
          },
          data: sortedData.map((d) => d.value),
        },
      ],
    };
  }, [indicatorData, selectedIndicator]);

  const handleOpenModal = (data?: EffectData) => {
    if (data) {
      setEditingData(data);
      setFormData({
        indicatorName: data.indicatorName,
        period: data.period,
        value: data.value.toString(),
        unit: data.unit,
        recordDate: data.recordDate,
        recorder: data.recorder,
        remark: '',
      });
    } else {
      setEditingData(null);
      const indicator = INDICATOR_OPTIONS.find((i) => i.name === selectedIndicator);
      setFormData({
        indicatorName: selectedIndicator,
        period: '',
        value: '',
        unit: indicator?.unit || '',
        recordDate: dayjs().format('YYYY-MM-DD'),
        recorder: '',
        remark: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingData(null);
  };

  const handleIndicatorChange = (indicatorName: string) => {
    setSelectedIndicator(indicatorName);
    const indicator = INDICATOR_OPTIONS.find((i) => i.name === indicatorName);
    setFormData((prev) => ({
      ...prev,
      indicatorName,
      unit: indicator?.unit || '',
    }));
  };

  const handleSubmit = () => {
    if (!projectId) return;

    const data = {
      projectId,
      indicatorName: formData.indicatorName,
      period: formData.period,
      value: parseFloat(formData.value),
      unit: formData.unit,
      recordDate: formData.recordDate,
      recorder: formData.recorder,
    };

    if (editingData) {
      updateEffectData(editingData.id, data);
    } else {
      addEffectData(data);
    }

    handleCloseModal();
  };

  const handleDelete = (data: EffectData) => {
    setConfirmDelete(data);
  };

  const confirmDeleteData = () => {
    if (confirmDelete && projectId) {
      useProjectStore.getState().effectData = useProjectStore
        .getState()
        .effectData.filter((e) => e.id !== confirmDelete.id);
      useProjectStore.getState().saveToStorage();
    }
    setConfirmDelete(null);
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
              <p className="mt-1 text-sm text-gray-500">{project.village} · 指标录入</p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="btn-primary inline-flex items-center gap-2 self-start md:self-auto"
            >
              <Plus size={18} />
              新增数据
            </button>
          </div>
        </div>
        <ProjectSubNav />
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">指标列表</h3>
            <div className="space-y-2">
              {INDICATOR_OPTIONS.map((indicator) => (
                <button
                  key={indicator.name}
                  onClick={() => handleIndicatorChange(indicator.name)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                    selectedIndicator === indicator.name
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{indicator.name}</span>
                    <span className="text-xs text-gray-400">
                      {allEffectData.filter((d) => d.indicatorName === indicator.name).length}条
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {selectedIndicator} - 趋势图
              </h3>
              {indicatorData.length === 0 ? (
                <EmptyState
                  icon={TrendingUp}
                  title="暂无数据"
                  description="请先录入该指标的数据"
                />
              ) : (
                <ReactECharts option={trendChartOption} style={{ height: '300px', width: '100%' }} />
              )}
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">历史数据</h3>
                <span className="text-sm text-gray-500">
                  共 {indicatorData.length} 条记录
                </span>
              </div>
              {indicatorData.length === 0 ? (
                <EmptyState
                  icon={TrendingUp}
                  title="暂无历史数据"
                  description="点击右上角新增数据按钮录入数据"
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">周期</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">数值</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">单位</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">记录日期</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">录入人</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {indicatorData.map((record) => (
                        <tr
                          key={record.id}
                          className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-3 px-4 text-sm text-gray-900">{record.period}</td>
                          <td className="py-3 px-4">
                            <span className="text-lg font-bold text-primary-600">
                              {record.value}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-500">{record.unit}</td>
                          <td className="py-3 px-4 text-sm text-gray-500">
                            {dayjs(record.recordDate).format('YYYY-MM-DD')}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-500">{record.recorder}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleOpenModal(record)}
                                className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(record)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        title={editingData ? '编辑数据' : '新增数据'}
        size="lg"
        footer={
          <>
            <button onClick={handleCloseModal} className="btn-secondary">
              取消
            </button>
            <button onClick={handleSubmit} className="btn-primary">
              {editingData ? '保存修改' : '确认添加'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">指标名称</label>
              <select
                value={formData.indicatorName}
                onChange={(e) => handleIndicatorChange(e.target.value)}
                className="input-field"
              >
                {INDICATOR_OPTIONS.map((opt) => (
                  <option key={opt.name} value={opt.name}>
                    {opt.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">统计周期</label>
              <select
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                className="input-field"
              >
                <option value="">请选择周期</option>
                {PERIOD_OPTIONS.map((period) => (
                  <option key={period} value={period}>
                    {period}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">指标数值</label>
              <input
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder="请输入数值"
                className="input-field"
              />
            </div>
            <div>
              <label className="label">单位</label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="请输入单位"
                className="input-field"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">记录日期</label>
              <input
                type="date"
                value={formData.recordDate}
                onChange={(e) => setFormData({ ...formData, recordDate: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">录入人</label>
              <input
                type="text"
                value={formData.recorder}
                onChange={(e) => setFormData({ ...formData, recorder: e.target.value })}
                placeholder="请输入录入人姓名"
                className="input-field"
              />
            </div>
          </div>
          <div>
            <label className="label">备注</label>
            <textarea
              value={formData.remark}
              onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
              placeholder="请输入备注信息（可选）"
              rows={3}
              className="input-field resize-none"
            />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        title="确认删除"
        message={`确定要删除"${confirmDelete?.indicatorName}"这条记录吗？此操作不可恢复。`}
        confirmText="删除"
        cancelText="取消"
        onConfirm={confirmDeleteData}
        onClose={() => setConfirmDelete(null)}
      />
    </div>
  );
}
