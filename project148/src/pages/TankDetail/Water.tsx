import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Plus,
  Droplets,
  AlertTriangle,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Clock,
  Search,
  ChevronRight,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useStore } from '@/store/useStore';
import { Modal } from '@/components/Modal';
import { StatusBadge } from '@/components/StatusBadge';
import { StatCard } from '@/components/StatCard';
import {
  formatDate,
  formatDateShort,
  checkWaterParameter,
  getStatusText,
  getTreatmentStageText,
  getStatusColor,
} from '@/utils/helpers';
import type { WaterTest, Anomaly, TreatmentStep } from '@/types';

export default function Water() {
  const { id } = useParams<{ id: string }>();
  const {
    waterTests,
    anomalies,
    addWaterTest,
    addAnomaly,
    updateAnomaly,
  } = useStore();

  const [testModal, setTestModal] = useState(false);
  const [anomalyModal, setAnomalyModal] = useState(false);
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [stepModal, setStepModal] = useState(false);
  const [currentStage, setCurrentStage] = useState<TreatmentStep['stage']>('detection');

  const [testForm, setTestForm] = useState<Omit<WaterTest, 'id'>>({
    tankId: id || '',
    testDate: new Date().toISOString().split('T')[0],
    ph: 7.0,
    ammonia: 0,
    nitrite: 0,
    nitrate: 10,
    gh: 8,
    kh: 5,
    notes: '',
  });

  const [anomalyForm, setAnomalyForm] = useState<Omit<Anomaly, 'id' | 'steps'>>({
    tankId: id || '',
    detectDate: new Date().toISOString().split('T')[0],
    description: '',
    severity: 'medium',
    status: 'detected',
  });

  const [stepForm, setStepForm] = useState<Omit<TreatmentStep, 'id'>>({
    stage: 'detection',
    content: '',
    date: new Date().toISOString().split('T')[0],
    result: '',
  });

  const tankWaterTests = [...waterTests
    .filter((t) => t.tankId === id)]
    .sort((a, b) => new Date(a.testDate).getTime() - new Date(b.testDate).getTime());

  const tankAnomalies = anomalies.filter((a) => a.tankId === id);

  const now = new Date();
  const filteredTests = tankWaterTests.filter((t) => {
    const testDate = new Date(t.testDate);
    const daysDiff = (now.getTime() - testDate.getTime()) / (1000 * 60 * 60 * 24);
    if (timeRange === '7d') return daysDiff <= 7;
    if (timeRange === '30d') return daysDiff <= 30;
    return daysDiff <= 90;
  });

  const chartData = filteredTests.map((t) => ({
    date: formatDateShort(t.testDate),
    pH: t.ph,
    氨氮: t.ammonia,
    亚硝酸盐: t.nitrite,
    硝酸盐: t.nitrate,
    GH: t.gh,
    KH: t.kh,
  }));

  const latestTest = tankWaterTests[tankWaterTests.length - 1];

  const paramList = latestTest
    ? [
        {
          name: 'pH',
          value: latestTest.ph,
          unit: '',
          range: '6.5 - 7.5',
          ...checkWaterParameter('ph', latestTest.ph),
        },
        {
          name: '氨氮',
          value: latestTest.ammonia,
          unit: 'ppm',
          range: '0 - 0.25',
          ...checkWaterParameter('ammonia', latestTest.ammonia),
        },
        {
          name: '亚硝酸盐',
          value: latestTest.nitrite,
          unit: 'ppm',
          range: '0 - 0.3',
          ...checkWaterParameter('nitrite', latestTest.nitrite),
        },
        {
          name: '硝酸盐',
          value: latestTest.nitrate,
          unit: 'ppm',
          range: '0 - 20',
          ...checkWaterParameter('nitrate', latestTest.nitrate),
        },
        {
          name: 'GH',
          value: latestTest.gh,
          unit: '°dH',
          range: '4 - 12',
          ...checkWaterParameter('gh', latestTest.gh),
        },
        {
          name: 'KH',
          value: latestTest.kh,
          unit: '°dH',
          range: '3 - 8',
          ...checkWaterParameter('kh', latestTest.kh),
        },
      ]
    : [];

  const handleAddTest = (e: React.FormEvent) => {
    e.preventDefault();
    addWaterTest(testForm);
    setTestModal(false);
    setTestForm({
      tankId: id || '',
      testDate: new Date().toISOString().split('T')[0],
      ph: 7.0,
      ammonia: 0,
      nitrite: 0,
      nitrate: 10,
      gh: 8,
      kh: 5,
      notes: '',
    });
  };

  const handleAddAnomaly = (e: React.FormEvent) => {
    e.preventDefault();
    addAnomaly({
      ...anomalyForm,
      steps: [
        {
          id: Date.now().toString(36),
          stage: 'detection',
          content: anomalyForm.description,
          date: anomalyForm.detectDate,
          result: '已记录',
        },
      ],
    });
    setAnomalyModal(false);
    setAnomalyForm({
      tankId: id || '',
      detectDate: new Date().toISOString().split('T')[0],
      description: '',
      severity: 'medium',
      status: 'detected',
    });
  };

  const handleAddStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnomaly) return;

    const stageOrder: TreatmentStep['stage'][] = [
      'detection',
      'analysis',
      'action',
      'verification',
    ];
    const currentIndex = stageOrder.indexOf(currentStage);
    const newStatus =
      currentStage === 'verification'
        ? 'resolved'
        : (stageOrder[currentIndex + 1] as Anomaly['status']);

    updateAnomaly(selectedAnomaly.id, {
      status: newStatus,
      steps: [
        ...selectedAnomaly.steps,
        {
          ...stepForm,
          id: Date.now().toString(36),
          stage: currentStage,
        },
      ],
    });
    setStepModal(false);
    setSelectedAnomaly(null);
  };

  const openStepModal = (
    anomaly: Anomaly,
    stage: TreatmentStep['stage']
  ) => {
    setSelectedAnomaly(anomaly);
    setCurrentStage(stage);
    setStepForm({
      stage,
      content: '',
      date: new Date().toISOString().split('T')[0],
      result: '',
    });
    setStepModal(true);
  };

  const getNextStage = (status: Anomaly['status']): TreatmentStep['stage'] | null => {
    const stageMap: Record<Anomaly['status'], TreatmentStep['stage'] | null> = {
      detected: 'analysis',
      analyzing: 'action',
      treating: 'verification',
      verified: null,
      resolved: null,
    };
    return stageMap[status];
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-serif text-gray-900">
            水质监测
          </h2>
          <p className="text-gray-500 mt-1">
            共 {tankWaterTests.length} 条检测记录
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAnomalyModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-coral-50 text-coral-600 rounded-xl hover:bg-coral-100 transition-colors font-medium"
          >
            <AlertTriangle className="w-4 h-4" />
            记录异常
          </button>
          <button
            onClick={() => setTestModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-aqua-500 to-reef-500 text-white rounded-xl hover:from-aqua-600 hover:to-reef-600 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
          >
            <Plus className="w-5 h-5" />
            录入检测数据
          </button>
        </div>
      </div>

      {latestTest && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {paramList.map((param, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">{param.name}</span>
                <StatusBadge status={param.status} size="sm" />
              </div>
              <p className="text-2xl font-bold font-mono text-gray-900">
                {param.value.toFixed(param.value < 1 ? 2 : 0)}
                <span className="text-sm text-gray-400 ml-1">
                  {param.unit}
                </span>
              </p>
              <p className="text-xs text-gray-400 mt-1">正常：{param.range}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="最近检测"
          value={latestTest ? formatDateShort(latestTest.testDate) : '暂无'}
          icon={Calendar}
          status="normal"
        />
        <StatCard
          title="检测次数"
          value={tankWaterTests.length}
          unit="次"
          icon={Droplets}
          status="normal"
        />
        <StatCard
          title="待处理异常"
          value={tankAnomalies.filter((a) => a.status !== 'resolved').length}
          unit="项"
          icon={AlertTriangle}
          status={
            tankAnomalies.filter((a) => a.status !== 'resolved').length > 0
              ? 'warning'
              : 'normal'
          }
        />
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-aqua-600" />
            <h3 className="text-lg font-bold font-serif text-gray-900">
              水质趋势图
            </h3>
          </div>
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  timeRange === range
                    ? 'bg-white text-aqua-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {range === '7d' ? '7天' : range === '30d' ? '30天' : '90天'}
              </button>
            ))}
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="pH"
                stroke="#0EA5E9"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="硝酸盐"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="氨氮"
                stroke="#EA580C"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="亚硝酸盐"
                stroke="#DC2626"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <Search className="w-5 h-5 text-reef-600" />
          <h3 className="text-lg font-bold font-serif text-gray-900">
            历史检测记录
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  检测日期
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  pH
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  氨氮
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  亚硝酸盐
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  硝酸盐
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  GH
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  KH
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  备注
                </th>
              </tr>
            </thead>
            <tbody>
              {[...tankWaterTests]
                .sort(
                  (a, b) =>
                    new Date(b.testDate).getTime() - new Date(a.testDate).getTime()
                )
                .slice(0, 10)
                .map((test, index) => {
                  const hasAnomaly =
                    checkWaterParameter('ph', test.ph).status !== 'normal' ||
                    checkWaterParameter('ammonia', test.ammonia).status !==
                      'normal' ||
                    checkWaterParameter('nitrite', test.nitrite).status !==
                      'normal' ||
                    checkWaterParameter('nitrate', test.nitrate).status !==
                      'normal';

                  return (
                    <tr
                      key={test.id}
                      className={`border-b border-gray-50 hover:bg-gray-50 transition-colors animate-slide-up ${
                        hasAnomaly ? 'bg-coral-50/30' : ''
                      }`}
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <td className="py-4 px-4 text-gray-900 font-medium">
                        {formatDate(test.testDate)}
                      </td>
                      <td className="py-4 px-4 font-mono">{test.ph.toFixed(1)}</td>
                      <td className="py-4 px-4 font-mono">
                        {test.ammonia.toFixed(2)}
                      </td>
                      <td className="py-4 px-4 font-mono">
                        {test.nitrite.toFixed(2)}
                      </td>
                      <td className="py-4 px-4 font-mono">
                        {test.nitrate.toFixed(0)}
                      </td>
                      <td className="py-4 px-4 font-mono">{test.gh.toFixed(0)}</td>
                      <td className="py-4 px-4 font-mono">{test.kh.toFixed(0)}</td>
                      <td className="py-4 px-4 text-gray-500 text-sm">
                        {test.notes || '-'}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <AlertTriangle className="w-5 h-5 text-coral-600" />
          <h3 className="text-lg font-bold font-serif text-gray-900">
            异常处理记录
          </h3>
        </div>

        {tankAnomalies.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <CheckCircle2 className="w-12 h-12 mx-auto text-reef-400 mb-3" />
            <p>暂无异常记录，水质保持良好</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tankAnomalies.map((anomaly, index) => {
              const nextStage = getNextStage(anomaly.status);
              const progress =
                anomaly.status === 'detected'
                  ? 25
                  : anomaly.status === 'analyzing'
                  ? 50
                  : anomaly.status === 'treating'
                  ? 75
                  : anomaly.status === 'verified'
                  ? 90
                  : 100;

              return (
                <div
                  key={anomaly.id}
                  className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          anomaly.severity === 'critical'
                            ? 'bg-red-100'
                            : anomaly.severity === 'high'
                            ? 'bg-orange-100'
                            : anomaly.severity === 'medium'
                            ? 'bg-yellow-100'
                            : 'bg-gray-100'
                        }`}
                      >
                        <AlertTriangle
                          className={`w-5 h-5 ${
                            anomaly.severity === 'critical'
                              ? 'text-red-600'
                              : anomaly.severity === 'high'
                              ? 'text-orange-600'
                              : anomaly.severity === 'medium'
                              ? 'text-yellow-600'
                              : 'text-gray-600'
                          }`}
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">
                          {anomaly.description}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(anomaly.detectDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={anomaly.severity} size="sm" />
                      <StatusBadge status={anomaly.status} size="sm" />
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-500">处理进度</span>
                      <span className="font-medium text-gray-900">
                        {progress}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-aqua-500 to-reef-500 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 mb-4">
                    {['detection', 'analysis', 'action', 'verification'].map(
                      (stage) => {
                        const step = anomaly.steps.find(
                          (s) => s.stage === stage
                        );
                        const isActive = step !== undefined;
                        return (
                          <div
                            key={stage}
                            className={`flex-1 text-center p-2 rounded-lg ${
                              isActive
                                ? 'bg-reef-50 text-reef-700'
                                : 'bg-gray-50 text-gray-400'
                            }`}
                          >
                            <div className="text-xs font-medium">
                              {getTreatmentStageText(stage)}
                            </div>
                            <div className="mt-1">
                              {isActive ? (
                                <CheckCircle2 className="w-4 h-4 mx-auto" />
                              ) : (
                                <Clock className="w-4 h-4 mx-auto" />
                              )}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>

                  {anomaly.steps.length > 0 && (
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-sm text-gray-500 mb-3">处理详情</p>
                      <div className="space-y-3">
                        {anomaly.steps.map((step) => (
                          <div
                            key={step.id}
                            className="flex gap-3 text-sm"
                          >
                            <div className="flex-shrink-0">
                              <span
                                className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                                  step.stage === 'detection'
                                    ? 'detected'
                                    : step.stage
                                )}`}
                              >
                                {getTreatmentStageText(step.stage)}
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className="text-gray-700">{step.content}</p>
                              {step.result && (
                                <p className="text-gray-500 mt-1">
                                  结果：{step.result}
                                </p>
                              )}
                              <p className="text-gray-400 text-xs mt-1">
                                {formatDate(step.date)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {nextStage && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => openStepModal(anomaly, nextStage)}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-aqua-50 to-reef-50 text-aqua-700 rounded-xl hover:from-aqua-100 hover:to-reef-100 transition-colors font-medium"
                      >
                        继续{getTreatmentStageText(nextStage)}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal isOpen={testModal} onClose={() => setTestModal(false)} title="录入水质检测数据" size="lg">
        <form onSubmit={handleAddTest} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              检测日期
            </label>
            <input
              type="date"
              value={testForm.testDate}
              onChange={(e) =>
                setTestForm({ ...testForm, testDate: e.target.value })
              }
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-aqua-500 focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                pH
              </label>
              <input
                type="number"
                step="0.1"
                value={testForm.ph}
                onChange={(e) =>
                  setTestForm({ ...testForm, ph: Number(e.target.value) })
                }
                min="0"
                max="14"
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-aqua-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                氨氮 (ppm)
              </label>
              <input
                type="number"
                step="0.01"
                value={testForm.ammonia}
                onChange={(e) =>
                  setTestForm({
                    ...testForm,
                    ammonia: Number(e.target.value),
                  })
                }
                min="0"
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-aqua-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                亚硝酸盐 (ppm)
              </label>
              <input
                type="number"
                step="0.01"
                value={testForm.nitrite}
                onChange={(e) =>
                  setTestForm({
                    ...testForm,
                    nitrite: Number(e.target.value),
                  })
                }
                min="0"
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-aqua-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                硝酸盐 (ppm)
              </label>
              <input
                type="number"
                step="0.1"
                value={testForm.nitrate}
                onChange={(e) =>
                  setTestForm({
                    ...testForm,
                    nitrate: Number(e.target.value),
                  })
                }
                min="0"
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-aqua-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GH (°dH)
              </label>
              <input
                type="number"
                step="1"
                value={testForm.gh}
                onChange={(e) =>
                  setTestForm({ ...testForm, gh: Number(e.target.value) })
                }
                min="0"
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-aqua-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                KH (°dH)
              </label>
              <input
                type="number"
                step="1"
                value={testForm.kh}
                onChange={(e) =>
                  setTestForm({ ...testForm, kh: Number(e.target.value) })
                }
                min="0"
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-aqua-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              备注（可选）
            </label>
            <textarea
              value={testForm.notes}
              onChange={(e) =>
                setTestForm({ ...testForm, notes: e.target.value })
              }
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-aqua-500 focus:border-transparent resize-none"
              placeholder="记录检测时的特殊情况..."
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setTestModal(false)}
              className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-aqua-500 to-reef-500 text-white rounded-xl hover:from-aqua-600 hover:to-reef-600 transition-all font-medium"
            >
              保存
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={anomalyModal} onClose={() => setAnomalyModal(false)} title="记录水质异常">
        <form onSubmit={handleAddAnomaly} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              发现日期
            </label>
            <input
              type="date"
              value={anomalyForm.detectDate}
              onChange={(e) =>
                setAnomalyForm({ ...anomalyForm, detectDate: e.target.value })
              }
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-coral-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              异常描述
            </label>
            <textarea
              value={anomalyForm.description}
              onChange={(e) =>
                setAnomalyForm({ ...anomalyForm, description: e.target.value })
              }
              rows={3}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-coral-500 focus:border-transparent resize-none"
              placeholder="描述发现的异常情况..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              严重程度
            </label>
            <select
              value={anomalyForm.severity}
              onChange={(e) =>
                setAnomalyForm({
                  ...anomalyForm,
                  severity: e.target.value as Anomaly['severity'],
                })
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-coral-500 focus:border-transparent"
            >
              <option value="low">轻微</option>
              <option value="medium">中等</option>
              <option value="high">严重</option>
              <option value="critical">紧急</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setAnomalyModal(false)}
              className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-coral-500 to-coral-600 text-white rounded-xl hover:from-coral-600 hover:to-coral-700 transition-all font-medium"
            >
              记录异常
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={stepModal}
        onClose={() => {
          setStepModal(false);
          setSelectedAnomaly(null);
        }}
        title={`${getTreatmentStageText(currentStage)}`}
      >
        <form onSubmit={handleAddStep} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              日期
            </label>
            <input
              type="date"
              value={stepForm.date}
              onChange={(e) =>
                setStepForm({ ...stepForm, date: e.target.value })
              }
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-aqua-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {currentStage === 'analysis'
                ? '原因分析'
                : currentStage === 'action'
                ? '采取措施'
                : currentStage === 'verification'
                ? '验证结果'
                : '详细描述'}
            </label>
            <textarea
              value={stepForm.content}
              onChange={(e) =>
                setStepForm({ ...stepForm, content: e.target.value })
              }
              rows={3}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-aqua-500 focus:border-transparent resize-none"
              placeholder="请详细描述..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              结果（可选）
            </label>
            <input
              type="text"
              value={stepForm.result}
              onChange={(e) =>
                setStepForm({ ...stepForm, result: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-aqua-500 focus:border-transparent"
              placeholder="记录处理结果..."
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setStepModal(false);
                setSelectedAnomaly(null);
              }}
              className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-aqua-500 to-reef-500 text-white rounded-xl hover:from-aqua-600 hover:to-reef-600 transition-all font-medium"
            >
              保存
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
