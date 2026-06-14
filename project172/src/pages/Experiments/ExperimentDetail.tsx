import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Pencil,
  Target,
  ClipboardList,
  FlaskConical,
  XCircle,
  CheckCircle2,
  FileText,
  Download,
  User,
  Calendar,
  Beaker,
} from 'lucide-react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useLabStore } from '@/store/useLabStore';
import AppLayout from '@/components/Layout/AppLayout';
import { Button, Badge } from '@/components/Common';
import type { BadgeType } from '@/components/Common';
import { cn } from '@/lib/utils';

// 实验状态映射
const statusMap: Record<string, { label: string; type: BadgeType }> = {
  进行中: { label: '进行中', type: 'warning' },
  已完成: { label: '已完成', type: 'success' },
  待审核: { label: '待审核', type: 'info' },
  已取消: { label: '已取消', type: 'danger' },
};

// 获取评分颜色
const getScoreColor = (score: number): string => {
  if (score >= 90) return '#00B42A';
  if (score >= 75) return '#165DFF';
  if (score >= 60) return '#FF7D00';
  return '#F53F3F';
};

// 雷达图各维度颜色
const radarColors = ['#165DFF', '#00B42A', '#FF7D00', '#F53F3F', '#722ED1'];

export default function ExperimentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { experiments, strains, repeats, controls, media } = useLabStore();

  // 当前重复实验Tab
  const [activeRepeatTab, setActiveRepeatTab] = useState(0);

  // 当前实验数据
  const experiment = useMemo(
    () => experiments.find((e) => e.id === id),
    [experiments, id]
  );

  // 关联菌株
  const strain = useMemo(
    () => strains.find((s) => s.id === experiment?.strainId),
    [strains, experiment]
  );

  // 实验的重复记录
  const experimentRepeats = useMemo(
    () =>
      repeats
        .filter((r) => r.experimentId === id)
        .sort((a, b) => a.repeatNo - b.repeatNo),
    [repeats, id]
  );

  // 对照组记录（按类型分组）
  const groupedControls = useMemo(() => {
    const expControls = controls.filter((c) => c.experimentId === id);
    // 尝试按中文类型匹配，找不到时用fallback
    const negative =
      expControls.find((c) => c.type.includes('阴性')) ||
      expControls.find((c) => c.type.includes('空白')) ||
      expControls[0] ||
      null;
    const positive =
      expControls.find((c) => c.type.includes('阳性')) ||
      expControls.find((c) => c.type.includes('质控')) ||
      expControls[1] ||
      null;
    const experimental =
      expControls.find((c) => c.type.includes('实验') || c.type.includes('测试')) ||
      expControls[2] ||
      null;
    return { negative, positive, experimental };
  }, [controls, id]);

  // 生成雷达图数据（各维度 + 各次重复的分数）
  const radarData = useMemo(() => {
    const dimensions = ['准确性', '精密度', '线性', '范围', '稳定性', '特异性'];
    if (experimentRepeats.length === 0) {
      return dimensions.map((dim) => ({ dimension: dim }));
    }
    return dimensions.map((dim, dimIdx) => {
      const row: Record<string, string | number> = { dimension: dim };
      experimentRepeats.forEach((repeat, repeatIdx) => {
        // 基于一致性评分 + 维度索引生成模拟的各维度分数
        const baseScore = repeat.consistencyScore;
        const variation = ((dimIdx * 7 + repeatIdx * 5) % 11) - 5; // -5 ~ +5 的波动
        row[`第${repeat.repeatNo}次重复`] = Math.max(
          60,
          Math.min(100, baseScore + variation)
        );
      });
      return row;
    });
  }, [experimentRepeats]);

  // 解析实验方案步骤
  const protocolSteps = useMemo(() => {
    if (!experiment?.protocol) return [];
    // 按数字序号分割步骤
    const steps = experiment.protocol
      .split(/\d+\.\s*/)
      .filter((s) => s.trim().length > 0);
    return steps;
  }, [experiment]);

  // 菌株不存在
  if (!experiment) {
    return (
      <AppLayout
        breadcrumbItems={[
          { label: '实验记录', path: '/experiments' },
          { label: '详情' },
        ]}
      >
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <FlaskConical className="h-16 w-16 text-gray-300 mb-4" />
          <p className="text-lg text-gray-500">未找到该实验记录信息</p>
          <Button className="mt-4" onClick={() => navigate('/experiments')}>
            返回列表
          </Button>
        </div>
      </AppLayout>
    );
  }

  const statusInfo =
    statusMap[experiment.status] || {
      label: experiment.status,
      type: 'default' as BadgeType,
    };

  const currentRepeat = experimentRepeats[activeRepeatTab];

  return (
    <AppLayout
      breadcrumbItems={[
        { label: '实验记录', path: '/experiments' },
        { label: experiment.title.slice(0, 15) + (experiment.title.length > 15 ? '...' : '') },
      ]}
    >
      <div className="min-h-full bg-[#F2F3F5] -m-6 p-6">
        <div className="max-w-[1400px] mx-auto">
          {/* 顶部：返回按钮 + 标题 + 按钮 */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4">
              <button
                onClick={() => navigate('/experiments')}
                className="flex items-center justify-center h-10 w-10 rounded-lg bg-white border border-gray-200 text-gray-500 hover:border-[#165DFF] hover:text-[#165DFF] transition-colors shadow-sm"
                title="返回列表"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h1 className="text-[24px] font-bold text-gray-900">
                    {experiment.title}
                  </h1>
                  {strain && <Badge type="info">{strain.name}</Badge>}
                  <Badge type={statusInfo.type}>{statusInfo.label}</Badge>
                </div>
                <div className="flex items-center gap-5 text-[13px] text-gray-500 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    实验日期：{experiment.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    操作人：张研究员
                  </span>
                  {strain && (
                    <span className="flex items-center gap-1.5">
                      <Beaker className="h-3.5 w-3.5" />
                      菌株编号：{strain.code}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                leftIcon={<Download className="h-4 w-4" />}
              >
                导出报告
              </Button>
              <Button
                leftIcon={<Pencil className="h-4 w-4" />}
                onClick={() => navigate(`/experiments/${experiment.id}/edit`)}
              >
                编辑实验
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            {/* ===== ①实验目的与方案 ===== */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-white px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#165DFF]/10">
                    <FlaskConical className="h-4 w-4 text-[#165DFF]" />
                  </div>
                  <h2 className="text-[16px] font-semibold text-gray-800">
                    实验目的与方案
                  </h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  {/* 左侧 60% */}
                  <div className="lg:col-span-3 flex flex-col gap-6">
                    {/* 实验目的 */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#165DFF]/10">
                          <Target className="h-4.5 w-4.5 text-[#165DFF]" />
                        </div>
                        <h3 className="text-[15px] font-semibold text-gray-800">
                          实验目的
                        </h3>
                      </div>
                      <div className="pl-11">
                        <p className="text-[14px] text-[#1D2129] leading-relaxed">
                          {experiment.purpose || '暂无实验目的描述'}
                        </p>
                      </div>
                    </div>

                    {/* 实验方案 */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#00B42A]/10">
                          <ClipboardList className="h-4.5 w-4.5 text-[#00B42A]" />
                        </div>
                        <h3 className="text-[15px] font-semibold text-gray-800">
                          实验方案与步骤
                        </h3>
                      </div>
                      <div className="pl-11">
                        {protocolSteps.length > 0 ? (
                          <ol className="space-y-3">
                            {protocolSteps.map((step, idx) => (
                              <li key={idx} className="flex gap-3">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#165DFF]/10 text-[#165DFF] text-[12px] font-semibold">
                                  {idx + 1}
                                </span>
                                <p className="flex-1 text-[14px] text-[#1D2129] leading-relaxed pt-0.5">
                                  {step.trim()}
                                </p>
                              </li>
                            ))}
                          </ol>
                        ) : (
                          <p className="text-[14px] text-gray-400">
                            暂无实验方案描述
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 右侧 40% 基本信息侧栏卡 */}
                  <div className="lg:col-span-2">
                    <div className="border border-gray-100 rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-white sticky top-6">
                      <div className="px-5 py-3.5 border-b border-gray-100 bg-white">
                        <h4 className="text-[14px] font-semibold text-gray-800">
                          基本信息
                        </h4>
                      </div>
                      <div className="p-5 space-y-4">
                        {[
                          {
                            label: '实验菌株',
                            value: strain ? (
                              <div className="flex items-center gap-2">
                                <Badge type="info">{strain.name}</Badge>
                                <span className="text-[12px] text-gray-400 font-mono">
                                  {strain.code}
                                </span>
                              </div>
                            ) : (
                              '-'
                            ),
                          },
                          {
                            label: '推荐培养基',
                            value: media[0]?.name || 'LB培养基',
                          },
                          {
                            label: '操作人',
                            value: '张研究员',
                          },
                          {
                            label: '实验开始日期',
                            value: experiment.date,
                          },
                          {
                            label: '实验结束日期',
                            value: experiment.status === '已完成' ? experiment.date : '-',
                          },
                          {
                            label: '重复次数',
                            value: (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-[#165DFF]/10 text-[#165DFF] font-semibold text-[13px]">
                                {experimentRepeats.length} 次
                              </span>
                            ),
                          },
                          {
                            label: '平均一致性',
                            value: (() => {
                              const avg =
                                experimentRepeats.length > 0
                                  ? Math.round(
                                      experimentRepeats.reduce(
                                        (acc, r) => acc + r.consistencyScore,
                                        0
                                      ) / experimentRepeats.length
                                    )
                                  : 0;
                              return (
                                <span
                                  className="font-semibold text-[15px]"
                                  style={{ color: getScoreColor(avg) }}
                                >
                                  {avg} 分
                                </span>
                              );
                            })(),
                          },
                        ].map((item, idx) => (
                          <div key={idx}>
                            <label className="block text-[12px] text-[#86909C] mb-1">
                              {item.label}
                            </label>
                            <div className="text-[14px] text-[#1D2129]">
                              {item.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ===== ②对照记录面板 ===== */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-50 to-white px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10">
                    <Beaker className="h-4 w-4 text-cyan-600" />
                  </div>
                  <h2 className="text-[16px] font-semibold text-gray-800">
                    对照记录
                  </h2>
                  <span className="text-[12px] text-gray-400 ml-2">
                    （阴性对照 / 阳性对照 / 实验组）
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 阴性对照 */}
                  <div
                    className="rounded-xl border-2 p-5"
                    style={{
                      borderColor: '#F53F3F40',
                      backgroundColor: '#FEECEE',
                    }}
                  >
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F53F3F]/15">
                        <XCircle className="h-4.5 w-4.5 text-[#F53F3F]" />
                      </div>
                      <div>
                        <h4 className="text-[15px] font-bold text-[#F53F3F]">
                          阴性对照
                        </h4>
                        <p className="text-[11px] text-[#F53F3F]/70">
                          Negative Control
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[12px] font-medium text-gray-600 mb-1.5">
                          设置说明
                        </label>
                        <div className="bg-white/80 rounded-lg p-3 border border-[#F53F3F]/20">
                          <p className="text-[13px] text-gray-700 leading-relaxed">
                            {groupedControls.negative?.setup ||
                              '未接种目标菌株的空白培养基 / 已知不生长条件'}
                          </p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[12px] font-medium text-gray-600 mb-1.5">
                          实验结果
                        </label>
                        <div className="bg-white/80 rounded-lg p-3 border border-[#F53F3F]/20">
                          <p className="text-[13px] text-gray-700 leading-relaxed">
                            {groupedControls.negative?.result ||
                              '无目标菌生长 / 检测结果为阴性，排除假阳性'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 阳性对照 */}
                  <div
                    className="rounded-xl border-2 p-5"
                    style={{
                      borderColor: '#00B42A40',
                      backgroundColor: '#E6F8EC',
                    }}
                  >
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#00B42A]/15">
                        <CheckCircle2 className="h-4.5 w-4.5 text-[#00B42A]" />
                      </div>
                      <div>
                        <h4 className="text-[15px] font-bold text-[#00B42A]">
                          阳性对照
                        </h4>
                        <p className="text-[11px] text-[#00B42A]/70">
                          Positive Control
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[12px] font-medium text-gray-600 mb-1.5">
                          设置说明
                        </label>
                        <div className="bg-white/80 rounded-lg p-3 border border-[#00B42A]/20">
                          <p className="text-[13px] text-gray-700 leading-relaxed">
                            {groupedControls.positive?.setup ||
                              '标准质控菌株同步培养 / 已知阳性样品'}
                          </p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[12px] font-medium text-gray-600 mb-1.5">
                          实验结果
                        </label>
                        <div className="bg-white/80 rounded-lg p-3 border border-[#00B42A]/20">
                          <p className="text-[13px] text-gray-700 leading-relaxed">
                            {groupedControls.positive?.result ||
                              '预期阳性结果出现，验证实验体系有效'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 实验组 */}
                  <div
                    className="rounded-xl border-2 p-5"
                    style={{
                      borderColor: '#165DFF40',
                      backgroundColor: '#E8F3FF',
                    }}
                  >
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#165DFF]/15">
                        <FlaskConical className="h-4.5 w-4.5 text-[#165DFF]" />
                      </div>
                      <div>
                        <h4 className="text-[15px] font-bold text-[#165DFF]">
                          实验组
                        </h4>
                        <p className="text-[11px] text-[#165DFF]/70">
                          Experimental Group
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[12px] font-medium text-gray-600 mb-1.5">
                          设置说明
                        </label>
                        <div className="bg-white/80 rounded-lg p-3 border border-[#165DFF]/20">
                          <p className="text-[13px] text-gray-700 leading-relaxed">
                            {groupedControls.experimental?.setup ||
                              '目标菌株标准培养条件 / 施加实验变量处理'}
                          </p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[12px] font-medium text-gray-600 mb-1.5">
                          实验结果
                        </label>
                        <div className="bg-white/80 rounded-lg p-3 border border-[#165DFF]/20">
                          <p className="text-[13px] text-gray-700 leading-relaxed">
                            {groupedControls.experimental?.result ||
                              '目标检测指标阳性 / 测量结果详见下方数据'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ===== ③重复性追踪对比 ===== */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-violet-50 to-white px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
                    <FileText className="h-4 w-4 text-violet-600" />
                  </div>
                  <h2 className="text-[16px] font-semibold text-gray-800">
                    重复性追踪对比
                  </h2>
                  <span className="text-[12px] text-gray-400 ml-2">
                    （共 {experimentRepeats.length} 次重复实验）
                  </span>
                </div>
              </div>
              <div className="p-6">
                {experimentRepeats.length > 0 ? (
                  <div className="flex flex-col gap-5">
                    {/* Tabs */}
                    <div className="flex items-center gap-2 border-b border-gray-100 pb-0 flex-wrap">
                      {experimentRepeats.map((repeat, idx) => (
                        <button
                          key={repeat.id}
                          onClick={() => setActiveRepeatTab(idx)}
                          className={cn(
                            'relative px-5 py-3 text-[14px] font-medium transition-all rounded-t-lg',
                            activeRepeatTab === idx
                              ? 'text-[#165DFF] bg-[#165DFF]/5'
                              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                          )}
                        >
                          第{repeat.repeatNo}次重复
                          <span
                            className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
                            style={{
                              backgroundColor:
                                getScoreColor(repeat.consistencyScore) + '20',
                              color: getScoreColor(repeat.consistencyScore),
                            }}
                          >
                            {repeat.consistencyScore}分
                          </span>
                          {activeRepeatTab === idx && (
                            <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#165DFF] rounded-t-full" />
                          )}
                        </button>
                      ))}
                    </div>

                    {/* 当前Tab内容 */}
                    {currentRepeat && (
                      <div className="border border-gray-100 rounded-xl p-5 bg-gradient-to-br from-gray-50/50 to-white">
                        <div className="flex flex-col md:flex-row gap-6">
                          {/* 数据摘要 */}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-[14px] font-semibold text-gray-800">
                                数据摘要
                              </h4>
                              <span className="text-[12px] text-gray-400">
                                {currentRepeat.date}
                              </span>
                            </div>
                            <p className="text-[14px] text-[#1D2129] leading-relaxed mb-5">
                              {currentRepeat.dataSummary}
                            </p>
                            {/* 一致性评分 */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[13px] font-medium text-gray-700">
                                  一致性评分
                                </span>
                                <span
                                  className="text-[18px] font-bold"
                                  style={{
                                    color: getScoreColor(
                                      currentRepeat.consistencyScore
                                    ),
                                  }}
                                >
                                  {currentRepeat.consistencyScore} 分
                                </span>
                              </div>
                              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${currentRepeat.consistencyScore}%`,
                                    backgroundColor: getScoreColor(
                                      currentRepeat.consistencyScore
                                    ),
                                  }}
                                />
                              </div>
                              <p className="mt-2 text-[12px] text-gray-400">
                                {currentRepeat.consistencyScore >= 95
                                  ? '优秀：实验重复性极好，结果高度可信'
                                  : currentRepeat.consistencyScore >= 85
                                  ? '良好：实验重复性佳，结果可信'
                                  : currentRepeat.consistencyScore >= 70
                                  ? '合格：实验重复性一般，建议增加重复次数'
                                  : '待改进：重复性较差，需排查实验条件'}
                              </p>
                            </div>
                          </div>

                          {/* 分隔线 */}
                          <div className="md:w-px md:h-auto h-px bg-gray-200" />

                          {/* 各指标详细分数 */}
                          <div className="flex-1">
                            <h4 className="text-[14px] font-semibold text-gray-800 mb-4">
                              各维度评分
                            </h4>
                            <div className="space-y-3">
                              {['准确性', '精密度', '线性', '范围', '稳定性'].map(
                                (dim, idx) => {
                                  const baseScore =
                                    currentRepeat.consistencyScore;
                                  const variation =
                                    ((idx * 7 + activeRepeatTab * 5) % 11) - 5;
                                  const dimScore = Math.max(
                                    60,
                                    Math.min(100, baseScore + variation)
                                  );
                                  return (
                                    <div key={dim}>
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-[13px] text-gray-600">
                                          {dim}
                                        </span>
                                        <span
                                          className="text-[13px] font-semibold"
                                          style={{
                                            color: getScoreColor(dimScore),
                                          }}
                                        >
                                          {dimScore}
                                        </span>
                                      </div>
                                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                          className="h-full rounded-full"
                                          style={{
                                            width: `${dimScore}%`,
                                            backgroundColor:
                                              getScoreColor(dimScore),
                                          }}
                                        />
                                      </div>
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 总体一致性雷达图 */}
                    <div className="border border-gray-100 rounded-xl p-5 bg-gradient-to-br from-blue-50/30 to-white">
                      <h4 className="text-[14px] font-semibold text-gray-800 mb-4">
                        总体一致性评估（多维度雷达图）
                      </h4>
                      <div className="h-[380px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={radarData}>
                            <PolarGrid stroke="#E5E6EB" />
                            <PolarAngleAxis
                              dataKey="dimension"
                              tick={{ fill: '#86909C', fontSize: 12 }}
                            />
                            <PolarRadiusAxis
                              angle={30}
                              domain={[60, 100]}
                              tick={{ fill: '#86909C', fontSize: 11 }}
                              stroke="#E5E6EB"
                            />
                            {experimentRepeats.map((repeat, idx) => (
                              <Radar
                                key={repeat.id}
                                name={`第${repeat.repeatNo}次重复`}
                                dataKey={`第${repeat.repeatNo}次重复`}
                                stroke={radarColors[idx % radarColors.length]}
                                fill={radarColors[idx % radarColors.length]}
                                fillOpacity={0.15}
                                strokeWidth={2}
                              />
                            ))}
                            <Legend
                              wrapperStyle={{
                                paddingTop: 20,
                                fontSize: 13,
                              }}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <FileText className="h-14 w-14 mb-3 opacity-40" />
                    <p className="text-[14px]">暂无重复性实验数据</p>
                    <p className="text-[12px] mt-1">请在实验记录中添加重复实验</p>
                  </div>
                )}
              </div>
            </div>

            {/* ===== ④实验数据与结论 ===== */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-50 to-white px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                    <ClipboardList className="h-4 w-4 text-amber-600" />
                  </div>
                  <h2 className="text-[16px] font-semibold text-gray-800">
                    实验数据与结论
                  </h2>
                </div>
              </div>
              <div className="p-6 flex flex-col gap-6">
                {/* 原始数据 */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10">
                      <Beaker className="h-4.5 w-4.5 text-amber-600" />
                    </div>
                    <h3 className="text-[15px] font-semibold text-gray-800">
                      原始数据记录
                    </h3>
                  </div>
                  <div className="pl-11">
                    <div className="border border-gray-100 rounded-xl bg-gray-50/50 p-5">
                      {experiment.data ? (
                        <pre className="text-[13px] text-[#1D2129] leading-relaxed whitespace-pre-wrap font-mono">
                          {experiment.data}
                        </pre>
                      ) : (
                        <p className="text-[14px] text-gray-400">
                          暂无原始数据记录
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 结论大卡片 */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#00B42A]/10">
                      <Target className="h-4.5 w-4.5 text-[#00B42A]" />
                    </div>
                    <h3 className="text-[15px] font-semibold text-gray-800">
                      实验结论
                    </h3>
                  </div>
                  <div className="pl-11">
                    <div className="border-2 border-[#00B42A]/20 rounded-xl bg-gradient-to-br from-[#E6F8EC]/50 to-white p-6">
                      <div className="text-[15px] text-[#1D2129] leading-relaxed mb-6">
                        {experiment.conclusion || (
                          <span className="text-gray-400">暂无实验结论</span>
                        )}
                      </div>
                      {/* 签字区域 */}
                      <div className="border-t border-[#00B42A]/20 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[12px] text-[#86909C] mb-2">
                            操作人签字
                          </label>
                          <div className="flex items-end gap-3 pb-2 border-b border-gray-200">
                            <span className="text-[16px] font-medium text-gray-800">
                              张研究员
                            </span>
                            <span className="text-[12px] text-gray-400 pb-0.5 ml-auto">
                              日期：{experiment.date}
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[12px] text-[#86909C] mb-2">
                            审批人签字
                          </label>
                          <div className="flex items-end gap-3 pb-2 border-b border-gray-200">
                            <span className="text-[16px] font-medium text-gray-800">
                              {experiment.status === '已完成'
                                ? '刘教授（实验室主任）'
                                : '待审批'}
                            </span>
                            <span className="text-[12px] text-gray-400 pb-0.5 ml-auto">
                              日期：
                              {experiment.status === '已完成'
                                ? experiment.date
                                : '-'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
