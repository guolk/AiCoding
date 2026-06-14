import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Pencil,
  Plus,
  Save,
  FlaskConical,
  Thermometer,
  Beaker,
  Refrigerator,
  MapPin,
  Droplets,
  Microscope,
  Activity,
  Maximize2,
  Shapes,
  Palette,
} from 'lucide-react';
import { useLabStore } from '@/store/useLabStore';
import AppLayout from '@/components/Layout/AppLayout';
import { DataTable, Button, Badge, Modal } from '@/components/Common';
import type { BadgeType } from '@/components/Common';
import type { DataTableColumn } from '@/components/Common';
import type { Passage, Phenotype } from '@/types';
import { cn } from '@/lib/utils';

// Tabs类型定义
type TabKey = 'basic' | 'passage' | 'phenotype';

// 安全等级映射
const safetyLevelMap: Record<number, { label: string; type: BadgeType }> = {
  1: { label: 'BSL-1', type: 'success' },
  2: { label: 'BSL-2', type: 'info' },
  3: { label: 'BSL-3', type: 'danger' },
};

// 革兰氏染色自定义SVG图标组件
const GramStainIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="6" cy="6" r="2" fill="currentColor" />
    <circle cx="10" cy="8" r="2" />
    <circle cx="6" cy="12" r="2" fill="currentColor" />
    <circle cx="10" cy="14" r="2" />
    <circle cx="14" cy="6" r="2" fill="currentColor" />
    <circle cx="18" cy="8" r="2" />
    <circle cx="14" cy="12" r="2" fill="currentColor" />
    <circle cx="18" cy="14" r="2" />
    <path d="M4 20h16" strokeDasharray="2 2" />
  </svg>
);

export default function StrainDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { strains, passages, phenotypes, storages, addPassage, updatePhenotype, updateStorage } =
    useLabStore();

  // 当前Tab
  const [activeTab, setActiveTab] = useState<TabKey>('basic');

  // 添加传代弹窗
  const [passageModal, setPassageModal] = useState(false);
  const [passageForm, setPassageForm] = useState({
    passageDate: new Date().toISOString().split('T')[0],
    generation: 1,
    operator: '',
    notes: '',
  });

  // 编辑表型特征弹窗
  const [phenotypeModal, setPhenotypeModal] = useState(false);
  const [phenotypeForm, setPhenotypeForm] = useState({
    colonyMorphology: '',
    gramStain: '',
    motility: '',
    size: '',
    shape: '',
    color: '',
    otherFeatures: '',
  });

  // 当前菌株数据
  const strain = useMemo(() => strains.find((s) => s.id === id), [strains, id]);

  // 菌株传代记录（按日期倒序）
  const strainPassages = useMemo(
    () =>
      passages
        .filter((p) => p.strainId === id)
        .sort((a, b) => new Date(b.passageDate).getTime() - new Date(a.passageDate).getTime()),
    [passages, id]
  );

  // 菌株表型特征
  const strainPhenotype = useMemo(
    () => phenotypes.find((p) => p.strainId === id),
    [phenotypes, id]
  );

  // 菌株冻存位置
  const strainStorages = useMemo(
    () => storages.filter((s) => s.strainId === id),
    [storages, id]
  );

  // 打开编辑表型弹窗时回填数据
  const openPhenotypeModal = () => {
    if (strainPhenotype) {
      setPhenotypeForm({
        colonyMorphology: strainPhenotype.colonyMorphology,
        gramStain: strainPhenotype.gramStain,
        motility: strainPhenotype.motility,
        size: strainPhenotype.size,
        shape: strainPhenotype.shape,
        color: strainPhenotype.color,
        otherFeatures: strainPhenotype.otherFeatures,
      });
    }
    setPhenotypeModal(true);
  };

  // 提交传代记录
  const handleAddPassage = () => {
    if (!id) return;
    addPassage({
      strainId: id,
      passageDate: passageForm.passageDate,
      generation: passageForm.generation,
      operator: passageForm.operator,
      notes: passageForm.notes,
    });
    setPassageModal(false);
    setPassageForm({
      passageDate: new Date().toISOString().split('T')[0],
      generation: (strainPassages[0]?.generation || 0) + 1,
      operator: '',
      notes: '',
    });
  };

  // 提交表型特征
  const handleSavePhenotype = () => {
    if (!id) return;
    if (strainPhenotype) {
      updatePhenotype(strainPhenotype.id, phenotypeForm);
    }
    setPhenotypeModal(false);
  };

  // 传代表格列配置
  const passageColumns: DataTableColumn<Passage>[] = [
    {
      key: 'passageDate',
      title: '日期',
      width: 140,
      align: 'center',
      render: (row) => <span className="text-gray-700">{row.passageDate}</span>,
    },
    {
      key: 'generation',
      title: '代数',
      width: 100,
      align: 'center',
      render: (row) => (
        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-md bg-[#165DFF]/10 text-[#165DFF] font-semibold text-[13px]">
          第{row.generation}代
        </span>
      ),
    },
    {
      key: 'operator',
      title: '操作人',
      width: 120,
      align: 'center',
      render: (row) => <span className="text-gray-700">{row.operator}</span>,
    },
    {
      key: 'notes',
      title: '备注',
      render: (row) => (
        <span className="text-gray-600" title={row.notes}>
          {row.notes || '-'}
        </span>
      ),
    },
  ];

  // Tab配置
  const tabs: { key: TabKey; label: string }[] = [
    { key: 'basic', label: '基本信息' },
    { key: 'passage', label: '传代记录' },
    { key: 'phenotype', label: '表型特征' },
  ];

  // 菌株不存在
  if (!strain) {
    return (
      <AppLayout
        breadcrumbItems={[
          { label: '首页', path: '/' },
          { label: '菌株档案', path: '/strains' },
          { label: '详情' },
        ]}
      >
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <FlaskConical className="h-16 w-16 text-gray-300 mb-4" />
          <p className="text-lg text-gray-500">未找到该菌株信息</p>
          <Button className="mt-4" onClick={() => navigate('/strains')}>
            返回列表
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      breadcrumbItems={[
        { label: '首页', path: '/' },
        { label: '菌株档案', path: '/strains' },
        { label: strain.name },
      ]}
    >
      <div className="min-h-full bg-[#F2F3F5] -m-6 p-6">
        <div className="max-w-[1400px] mx-auto">
          {/* 顶部：返回按钮 + 标题 + 编辑按钮 */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4">
              <button
                onClick={() => navigate('/strains')}
                className="flex items-center justify-center h-10 w-10 rounded-lg bg-white border border-gray-200 text-gray-500 hover:border-[#165DFF] hover:text-[#165DFF] transition-colors shadow-sm"
                title="返回列表"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-[24px] font-bold text-gray-900">{strain.name}</h1>
                  <Badge type={safetyLevelMap[strain.safetyLevel]?.type || 'default'}>
                    {safetyLevelMap[strain.safetyLevel]?.label || `BSL-${strain.safetyLevel}`}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-[13px] text-gray-500">
                  <span className="font-mono">编号：{strain.code}</span>
                  <span>创建时间：{strain.createdAt}</span>
                  <span>建档人：{strain.operator}</span>
                </div>
              </div>
            </div>
            <Button
              leftIcon={<Pencil className="h-4 w-4" />}
              onClick={() => navigate(`/strains/${strain.id}/edit`)}
            >
              编辑菌株
            </Button>
          </div>

          {/* Tabs导航 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="border-b border-gray-100 px-6">
              <div className="flex items-center gap-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      'relative py-4 text-[15px] font-medium transition-colors',
                      activeTab === tab.key
                        ? 'text-[#165DFF]'
                        : 'text-gray-500 hover:text-gray-700'
                    )}
                  >
                    {tab.label}
                    {activeTab === tab.key && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#165DFF] rounded-t-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab内容区 */}
            <div className="p-6">
              {/* Tab1: 基本信息 */}
              {activeTab === 'basic' && (
                <div className="flex flex-col gap-6">
                  {/* 基本信息卡片 */}
                  <div className="border border-gray-100 rounded-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-50 to-white px-5 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <FlaskConical className="h-5 w-5 text-[#165DFF]" />
                        <h3 className="text-[15px] font-semibold text-gray-800">基本信息</h3>
                      </div>
                    </div>
                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
                      {[
                        { label: '菌株编号', value: strain.code, mono: true },
                        { label: '菌株名称', value: strain.name },
                        { label: '菌株来源', value: strain.source },
                        { label: '操作人', value: strain.operator },
                        { label: '分类地位', value: strain.taxonomy, full: true },
                        { label: '创建时间', value: strain.createdAt },
                        {
                          label: '安全等级',
                          value: (
                            <Badge type={safetyLevelMap[strain.safetyLevel]?.type || 'default'}>
                              {safetyLevelMap[strain.safetyLevel]?.label ||
                                `BSL-${strain.safetyLevel}`}
                            </Badge>
                          ),
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className={cn(item.full && 'md:col-span-2')}
                        >
                          <label className="block text-[13px] text-[#86909C] mb-1.5">
                            {item.label}
                          </label>
                          <div
                            className={cn(
                              'text-[14px] text-[#1D2129]',
                              item.mono && 'font-mono'
                            )}
                          >
                            {item.value || '-'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 培养条件卡片 */}
                  <div className="border border-gray-100 rounded-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-cyan-50 to-white px-5 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <Beaker className="h-5 w-5 text-cyan-600" />
                        <h3 className="text-[15px] font-semibold text-gray-800">培养条件</h3>
                      </div>
                    </div>
                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
                      {[
                        {
                          label: '培养条件',
                          value: strain.cultureConditions,
                          full: true,
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className={cn(item.full && 'md:col-span-2')}
                        >
                          <label className="block text-[13px] text-[#86909C] mb-1.5">
                            {item.label}
                          </label>
                          <div className="text-[14px] text-[#1D2129]">
                            {item.value || '-'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 冻存位置卡片 */}
                  <div className="border border-gray-100 rounded-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-violet-50 to-white px-5 py-3 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Refrigerator className="h-5 w-5 text-violet-600" />
                          <h3 className="text-[15px] font-semibold text-gray-800">冻存位置</h3>
                        </div>
                        <span className="text-[12px] text-gray-400">
                          共 {strainStorages.length} 个位置
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      {strainStorages.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {strainStorages.map((storage) => (
                            <div
                              key={storage.id}
                              className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-br from-violet-50/50 to-white border border-violet-100"
                            >
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                                <MapPin className="h-5 w-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-[13px] text-gray-500 mb-0.5">
                                  {storage.fridgeCode} / {storage.boxCode}
                                </div>
                                <div className="text-[15px] font-semibold text-gray-800">
                                  位置 {storage.position}
                                </div>
                                <div className="mt-1">
                                  <Badge
                                    type={
                                      storage.status === '正常'
                                        ? 'success'
                                        : storage.status === '需补充'
                                        ? 'warning'
                                        : 'default'
                                    }
                                  >
                                    {storage.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                          <Refrigerator className="h-12 w-12 mb-2 opacity-50" />
                          <p className="text-[13px]">暂无冻存位置记录</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab2: 传代记录 */}
              {activeTab === 'passage' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-[15px] font-semibold text-gray-800">传代历史记录</h3>
                      <p className="text-[12px] text-gray-400 mt-1">
                        共 {strainPassages.length} 条记录
                        {strainPassages.length > 0 && (
                          <span className="ml-2">
                            当前代数：第 {strainPassages[0].generation} 代
                          </span>
                        )}
                      </p>
                    </div>
                    <Button
                      leftIcon={<Plus className="h-4 w-4" />}
                      onClick={() => {
                        setPassageForm({
                          passageDate: new Date().toISOString().split('T')[0],
                          generation: (strainPassages[0]?.generation || 0) + 1,
                          operator: '',
                          notes: '',
                        });
                        setPassageModal(true);
                      }}
                    >
                      添加传代
                    </Button>
                  </div>

                  <DataTable<Passage>
                    columns={passageColumns}
                    data={strainPassages}
                    rowKey="id"
                    emptyText="暂无传代记录，点击'添加传代'开始记录"
                  />
                </div>
              )}

              {/* Tab3: 表型特征 */}
              {activeTab === 'phenotype' && (
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-[15px] font-semibold text-gray-800">表型特征信息</h3>
                      <p className="text-[12px] text-gray-400 mt-1">菌株形态与生理生化特征</p>
                    </div>
                    <Button
                      leftIcon={<Pencil className="h-4 w-4" />}
                      variant="secondary"
                      onClick={openPhenotypeModal}
                      disabled={!strainPhenotype}
                    >
                      编辑特征
                    </Button>
                  </div>

                  {strainPhenotype ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* 菌落形态 */}
                      <div className="border border-gray-100 rounded-xl p-5 bg-gradient-to-br from-gray-50 to-white">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                            <Activity className="h-5 w-5" />
                          </div>
                          <h4 className="text-[14px] font-semibold text-gray-800">菌落形态</h4>
                        </div>
                        <p className="text-[14px] text-[#1D2129] leading-relaxed">
                          {strainPhenotype.colonyMorphology || '-'}
                        </p>
                      </div>

                      {/* 革兰氏染色 */}
                      <div className="border border-gray-100 rounded-xl p-5 bg-gradient-to-br from-gray-50 to-white">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-pink-100 text-pink-600">
                            <GramStainIcon className="h-5 w-5" />
                          </div>
                          <h4 className="text-[14px] font-semibold text-gray-800">革兰氏染色</h4>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              'inline-flex items-center px-3 py-1 rounded-lg text-[14px] font-medium',
                              strainPhenotype.gramStain === '阳性'
                                ? 'bg-purple-100 text-purple-700'
                                : strainPhenotype.gramStain === '阴性'
                                ? 'bg-pink-100 text-pink-700'
                                : 'bg-gray-100 text-gray-600'
                            )}
                          >
                            {strainPhenotype.gramStain || '-'}
                          </span>
                        </div>
                      </div>

                      {/* 运动性 */}
                      <div className="border border-gray-100 rounded-xl p-5 bg-gradient-to-br from-gray-50 to-white">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                            <Activity className="h-5 w-5" />
                          </div>
                          <h4 className="text-[14px] font-semibold text-gray-800">运动性</h4>
                        </div>
                        <span
                          className={cn(
                            'inline-flex items-center px-3 py-1 rounded-lg text-[14px] font-medium',
                            strainPhenotype.motility === '有'
                              ? 'bg-green-100 text-green-700'
                              : strainPhenotype.motility === '弱'
                              ? 'bg-yellow-100 text-yellow-700'
                              : strainPhenotype.motility === '无'
                              ? 'bg-red-100 text-red-600'
                              : 'bg-gray-100 text-gray-600'
                          )}
                        >
                          {strainPhenotype.motility || '-'}
                        </span>
                      </div>

                      {/* 菌体大小 */}
                      <div className="border border-gray-100 rounded-xl p-5 bg-gradient-to-br from-gray-50 to-white">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-100 text-cyan-600">
                            <Maximize2 className="h-5 w-5" />
                          </div>
                          <h4 className="text-[14px] font-semibold text-gray-800">菌体大小</h4>
                        </div>
                        <p className="text-[14px] text-[#1D2129] font-mono">
                          {strainPhenotype.size || '-'}
                        </p>
                      </div>

                      {/* 细胞形状 */}
                      <div className="border border-gray-100 rounded-xl p-5 bg-gradient-to-br from-gray-50 to-white">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                            <Shapes className="h-5 w-5" />
                          </div>
                          <h4 className="text-[14px] font-semibold text-gray-800">细胞形状</h4>
                        </div>
                        <p className="text-[14px] text-[#1D2129]">
                          {strainPhenotype.shape || '-'}
                        </p>
                      </div>

                      {/* 菌落颜色 */}
                      <div className="border border-gray-100 rounded-xl p-5 bg-gradient-to-br from-gray-50 to-white">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                            <Palette className="h-5 w-5" />
                          </div>
                          <h4 className="text-[14px] font-semibold text-gray-800">菌落颜色</h4>
                        </div>
                        <p className="text-[14px] text-[#1D2129]">
                          {strainPhenotype.color || '-'}
                        </p>
                      </div>

                      {/* 其他特征 */}
                      {strainPhenotype.otherFeatures && (
                        <div className="md:col-span-2 border border-gray-100 rounded-xl p-5 bg-gradient-to-br from-gray-50 to-white">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100 text-green-600">
                              <Microscope className="h-5 w-5" />
                            </div>
                            <h4 className="text-[14px] font-semibold text-gray-800">其他特征</h4>
                          </div>
                          <p className="text-[14px] text-[#1D2129] leading-relaxed">
                            {strainPhenotype.otherFeatures}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 border border-dashed border-gray-200 rounded-xl">
                      <Microscope className="h-16 w-16 text-gray-300 mb-4" />
                      <p className="text-lg text-gray-500">暂未记录该菌株的表型特征</p>
                      <p className="text-[13px] text-gray-400 mt-1">
                        请通过系统管理模块补充该菌株的表型特征数据
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 添加传代弹窗 */}
      <Modal
        open={passageModal}
        onClose={() => setPassageModal(false)}
        title="添加传代记录"
        width={560}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setPassageModal(false)}>
              取消
            </Button>
            <Button
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={handleAddPassage}
              disabled={!passageForm.operator.trim()}
            >
              添加记录
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-5 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                传代日期 <span className="text-[#F53F3F]">*</span>
              </label>
              <input
                type="date"
                value={passageForm.passageDate}
                onChange={(e) =>
                  setPassageForm({ ...passageForm, passageDate: e.target.value })
                }
                className={cn(
                  'w-full h-10 px-3 rounded-lg border border-gray-200',
                  'focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                  'text-[14px] text-gray-700 transition-all'
                )}
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                代数 <span className="text-[#F53F3F]">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={passageForm.generation}
                onChange={(e) =>
                  setPassageForm({
                    ...passageForm,
                    generation: Number(e.target.value),
                  })
                }
                className={cn(
                  'w-full h-10 px-3 rounded-lg border border-gray-200',
                  'focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                  'text-[14px] text-gray-700 transition-all'
                )}
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
              操作人 <span className="text-[#F53F3F]">*</span>
            </label>
            <input
              type="text"
              placeholder="请输入操作人姓名"
              value={passageForm.operator}
              onChange={(e) =>
                setPassageForm({ ...passageForm, operator: e.target.value })
              }
              className={cn(
                'w-full h-10 px-3 rounded-lg border border-gray-200',
                'focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                'text-[14px] text-gray-700 placeholder-gray-400 transition-all'
              )}
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">备注</label>
            <textarea
              rows={4}
              placeholder="请输入传代备注信息，如培养目的、生长状态等..."
              value={passageForm.notes}
              onChange={(e) =>
                setPassageForm({ ...passageForm, notes: e.target.value })
              }
              className={cn(
                'w-full px-3 py-2.5 rounded-lg border border-gray-200 resize-none',
                'focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                'text-[14px] text-gray-700 placeholder-gray-400 transition-all'
              )}
            />
          </div>
        </div>
      </Modal>

      {/* 编辑表型特征弹窗 */}
      <Modal
        open={phenotypeModal}
        onClose={() => setPhenotypeModal(false)}
        title="编辑表型特征"
        width={680}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setPhenotypeModal(false)}>
              取消
            </Button>
            <Button leftIcon={<Save className="h-4 w-4" />} onClick={handleSavePhenotype}>
              保存修改
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                革兰氏染色
              </label>
              <select
                value={phenotypeForm.gramStain}
                onChange={(e) =>
                  setPhenotypeForm({ ...phenotypeForm, gramStain: e.target.value })
                }
                className={cn(
                  'w-full h-10 px-3 rounded-lg border border-gray-200',
                  'focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                  'text-[14px] text-gray-700 transition-all bg-white'
                )}
              >
                <option value="">请选择</option>
                <option value="阳性">阳性</option>
                <option value="阴性">阴性</option>
                <option value="不适用">不适用（真菌）</option>
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">运动性</label>
              <select
                value={phenotypeForm.motility}
                onChange={(e) =>
                  setPhenotypeForm({ ...phenotypeForm, motility: e.target.value })
                }
                className={cn(
                  'w-full h-10 px-3 rounded-lg border border-gray-200',
                  'focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                  'text-[14px] text-gray-700 transition-all bg-white'
                )}
              >
                <option value="">请选择</option>
                <option value="有">有</option>
                <option value="弱">弱</option>
                <option value="无">无</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">菌体大小</label>
              <input
                type="text"
                placeholder="如：0.5×1-3μm"
                value={phenotypeForm.size}
                onChange={(e) =>
                  setPhenotypeForm({ ...phenotypeForm, size: e.target.value })
                }
                className={cn(
                  'w-full h-10 px-3 rounded-lg border border-gray-200',
                  'focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                  'text-[14px] text-gray-700 placeholder-gray-400 transition-all'
                )}
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">细胞形状</label>
              <input
                type="text"
                placeholder="如：杆状/球状/弧形等"
                value={phenotypeForm.shape}
                onChange={(e) =>
                  setPhenotypeForm({ ...phenotypeForm, shape: e.target.value })
                }
                className={cn(
                  'w-full h-10 px-3 rounded-lg border border-gray-200',
                  'focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                  'text-[14px] text-gray-700 placeholder-gray-400 transition-all'
                )}
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">菌落颜色</label>
            <input
              type="text"
              placeholder="如：乳白色/金黄色/蓝绿色等"
              value={phenotypeForm.color}
              onChange={(e) =>
                setPhenotypeForm({ ...phenotypeForm, color: e.target.value })
              }
              className={cn(
                'w-full h-10 px-3 rounded-lg border border-gray-200',
                'focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                'text-[14px] text-gray-700 placeholder-gray-400 transition-all'
              )}
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">菌落形态</label>
            <textarea
              rows={2}
              placeholder="描述菌落形状、边缘、表面、凸起、大小等特征..."
              value={phenotypeForm.colonyMorphology}
              onChange={(e) =>
                setPhenotypeForm({ ...phenotypeForm, colonyMorphology: e.target.value })
              }
              className={cn(
                'w-full px-3 py-2.5 rounded-lg border border-gray-200 resize-none',
                'focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                'text-[14px] text-gray-700 placeholder-gray-400 transition-all'
              )}
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">其他特征</label>
            <textarea
              rows={3}
              placeholder="补充说明其他生理生化特征..."
              value={phenotypeForm.otherFeatures}
              onChange={(e) =>
                setPhenotypeForm({ ...phenotypeForm, otherFeatures: e.target.value })
              }
              className={cn(
                'w-full px-3 py-2.5 rounded-lg border border-gray-200 resize-none',
                'focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                'text-[14px] text-gray-700 placeholder-gray-400 transition-all'
              )}
            />
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
