import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Eye, FileText, Trash2, Filter } from 'lucide-react';
import { useLabStore } from '@/store/useLabStore';
import AppLayout from '@/components/Layout/AppLayout';
import { DataTable, Button, Badge, Modal } from '@/components/Common';
import type { BadgeType, DataTableColumn } from '@/components/Common';
import type { Experiment } from '@/types';
import { cn } from '@/lib/utils';

// 实验状态映射配置
const statusMap: Record<string, { label: string; type: BadgeType }> = {
  进行中: { label: '进行中', type: 'warning' },
  已完成: { label: '已完成', type: 'success' },
  待审核: { label: '待审核', type: 'info' },
  已取消: { label: '已取消', type: 'danger' },
};

// 生成实验编号
const generateExperimentCode = (index: number): string => {
  return `EXP-${String(index + 1).padStart(4, '0')}`;
};

export default function ExperimentList() {
  const navigate = useNavigate();
  const { experiments, strains, repeats, removeExperiment } = useLabStore();

  // 搜索关键词（按实验标题搜索）
  const [searchKeyword, setSearchKeyword] = useState('');
  // 菌株筛选
  const [strainFilter, setStrainFilter] = useState<string | null>(null);
  // 状态筛选
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  // 删除确认弹窗
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; experiment: Experiment | null }>({
    open: false,
    experiment: null,
  });
  // 分页：当前页
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // 根据菌株ID获取菌株名称
  const getStrainName = (strainId: string): string => {
    const strain = strains.find((s) => s.id === strainId);
    return strain ? strain.name : '-';
  };

  // 计算实验的平均一致性评分
  const getAvgConsistencyScore = (experimentId: string): number => {
    const expRepeats = repeats.filter((r) => r.experimentId === experimentId);
    if (expRepeats.length === 0) return 0;
    const sum = expRepeats.reduce((acc, r) => acc + r.consistencyScore, 0);
    return Math.round(sum / expRepeats.length);
  };

  // 获取一致性评分对应的颜色
  const getScoreColor = (score: number): string => {
    if (score >= 90) return '#00B42A';
    if (score >= 75) return '#165DFF';
    if (score >= 60) return '#FF7D00';
    return '#F53F3F';
  };

  // 筛选后的数据
  const filteredExperiments = useMemo(() => {
    return experiments.filter((exp) => {
      // 关键词匹配（标题）
      const keywordMatch =
        !searchKeyword ||
        exp.title.toLowerCase().includes(searchKeyword.toLowerCase());

      // 菌株匹配
      const strainMatch = strainFilter === null || exp.strainId === strainFilter;

      // 状态匹配
      const statusMatch = statusFilter === null || exp.status === statusFilter;

      return keywordMatch && strainMatch && statusMatch;
    });
  }, [experiments, searchKeyword, strainFilter, statusFilter]);

  // 分页后的数据
  const paginatedExperiments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredExperiments.slice(start, start + pageSize);
  }, [filteredExperiments, currentPage]);

  // 总页数
  const totalPages = Math.ceil(filteredExperiments.length / pageSize);

  // 表格列配置
  const columns: DataTableColumn<Experiment>[] = [
    {
      key: 'code',
      title: '实验编号',
      width: 130,
      render: (_row, index) => {
        const globalIndex = experiments.findIndex((e) => e.id === _row.id);
        return (
          <span className="font-mono text-[#165DFF] font-medium">
            {generateExperimentCode(globalIndex >= 0 ? globalIndex : index)}
          </span>
        );
      },
    },
    {
      key: 'title',
      title: '标题',
      width: 280,
      render: (row) => (
        <span
          className="font-medium text-gray-800 truncate block max-w-[260px]"
          title={row.title}
        >
          {row.title}
        </span>
      ),
    },
    {
      key: 'strainId',
      title: '关联菌株',
      width: 140,
      align: 'center',
      render: (row) => <Badge type="info">{getStrainName(row.strainId)}</Badge>,
    },
    {
      key: 'date',
      title: '实验日期',
      width: 120,
      align: 'center',
      render: (row) => <span className="text-gray-600">{row.date}</span>,
    },
    {
      key: 'status',
      title: '状态',
      width: 100,
      align: 'center',
      render: (row) => {
        const status =
          statusMap[row.status] || { label: row.status, type: 'default' as BadgeType };
        return <Badge type={status.type}>{status.label}</Badge>;
      },
    },
    {
      key: 'consistencyScore',
      title: '一致性评分',
      width: 200,
      render: (row) => {
        const score = getAvgConsistencyScore(row.id);
        const color = getScoreColor(score);
        return (
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${score}%`, backgroundColor: color }}
              />
            </div>
            <span
              className="text-[13px] font-semibold min-w-[38px]"
              style={{ color }}
            >
              {score}
            </span>
          </div>
        );
      },
    },
    {
      key: 'operator',
      title: '操作人',
      width: 100,
      align: 'center',
      render: (row) => <span className="text-gray-600">{row.operator || '-'}</span>,
    },
    {
      key: 'actions',
      title: '操作',
      width: 160,
      align: 'center',
      render: (row) => (
        <div className="flex items-center justify-center gap-1">
          {/* 查看详情 */}
          <button
            onClick={() => navigate(`/experiments/${row.id}`)}
            className="p-2 rounded-md text-gray-500 hover:bg-[#165DFF]/10 hover:text-[#165DFF] transition-colors"
            title="查看详情"
          >
            <Eye className="h-4 w-4" />
          </button>
          {/* 查看报告 */}
          <button
            onClick={() => navigate(`/experiments/${row.id}`)}
            className="p-2 rounded-md text-gray-500 hover:bg-[#00B42A]/10 hover:text-[#00B42A] transition-colors"
            title="查看报告"
          >
            <FileText className="h-4 w-4" />
          </button>
          {/* 删除 */}
          <button
            onClick={() => setDeleteModal({ open: true, experiment: row })}
            className="p-2 rounded-md text-gray-500 hover:bg-[#F53F3F]/10 hover:text-[#F53F3F] transition-colors"
            title="删除"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  // 确认删除
  const handleConfirmDelete = () => {
    if (deleteModal.experiment) {
      removeExperiment(deleteModal.experiment.id);
      setDeleteModal({ open: false, experiment: null });
    }
  };

  return (
    <AppLayout
      breadcrumbItems={[{ label: '实验记录' }]}
    >
      <div className="min-h-full bg-[#F2F3F5] -m-6 p-6">
        <div className="max-w-[1600px] mx-auto">
          {/* 页面标题 */}
          <div className="mb-6">
            <h1 className="text-[22px] font-bold text-gray-900">实验记录</h1>
            <p className="text-[13px] text-gray-500 mt-1">
              管理实验室所有实验的记录、方案和结果数据
            </p>
          </div>

          {/* 顶部操作栏 */}
          <div className="bg-white rounded-lg p-4 mb-5 shadow-sm border border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* 左侧搜索 + 筛选 */}
              <div className="flex flex-col lg:flex-row lg:items-center gap-3 flex-1">
                {/* 搜索框 */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="输入实验标题搜索..."
                    value={searchKeyword}
                    onChange={(e) => {
                      setSearchKeyword(e.target.value);
                      setCurrentPage(1);
                    }}
                    className={cn(
                      'w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200',
                      'focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                      'text-[14px] text-gray-700 placeholder-gray-400 transition-all',
                    )}
                  />
                </div>

                {/* 菌株筛选 */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Filter className="h-4 w-4" />
                    <span className="text-[13px]">菌株：</span>
                  </div>
                  <select
                    value={strainFilter || ''}
                    onChange={(e) => {
                      setStrainFilter(e.target.value || null);
                      setCurrentPage(1);
                    }}
                    className={cn(
                      'h-10 px-3 rounded-lg border border-gray-200 min-w-[140px]',
                      'focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                      'text-[14px] text-gray-700 bg-white transition-all',
                    )}
                  >
                    <option value="">全部菌株</option>
                    {strains.map((strain) => (
                      <option key={strain.id} value={strain.id}>
                        {strain.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 状态筛选 */}
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-gray-500">状态：</span>
                  <div className="flex items-center gap-1.5">
                    {[
                      { value: null, label: '全部' },
                      { value: '进行中', label: '进行中' },
                      { value: '已完成', label: '已完成' },
                      { value: '待审核', label: '待审核' },
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={() => {
                          setStatusFilter(item.value);
                          setCurrentPage(1);
                        }}
                        className={cn(
                          'px-3 py-1.5 rounded-md text-[13px] font-medium transition-all',
                          statusFilter === item.value
                            ? 'bg-[#165DFF] text-white shadow-sm'
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100',
                        )}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 右侧新增按钮 */}
              <Button
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => navigate('/experiments/new')}
              >
                新建实验
              </Button>
            </div>
          </div>

          {/* 数据表格 */}
          <DataTable<Experiment>
            columns={columns}
            data={paginatedExperiments}
            rowKey="id"
            emptyText={
              searchKeyword || strainFilter || statusFilter
                ? '未找到匹配的实验记录，请调整搜索条件'
                : '暂无实验记录数据，点击"新建实验"添加第一个实验'
            }
            showZebra
          />

          {/* 底部分页 */}
          {filteredExperiments.length > 0 && (
            <div className="mt-4 flex items-center justify-between bg-white rounded-lg border border-gray-100 px-5 py-3">
              <span className="text-[13px] text-gray-500">
                共{' '}
                <span className="text-gray-800 font-semibold">
                  {filteredExperiments.length}
                </span>{' '}
                条记录，当前第 {currentPage}/{totalPages || 1} 页
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-[13px] font-medium transition-all',
                    currentPage === 1
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-600 hover:bg-gray-100',
                  )}
                >
                  上一页
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      'min-w-[32px] h-8 rounded-md text-[13px] font-medium transition-all',
                      currentPage === page
                        ? 'bg-[#165DFF] text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100',
                    )}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages || totalPages === 0}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-[13px] font-medium transition-all',
                    (currentPage === totalPages || totalPages === 0)
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-600 hover:bg-gray-100',
                  )}
                >
                  下一页
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 删除确认弹窗 */}
      <Modal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, experiment: null })}
        title="删除实验记录确认"
        width={480}
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setDeleteModal({ open: false, experiment: null })}
            >
              取消
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              leftIcon={<Trash2 className="h-4 w-4" />}
            >
              确认删除
            </Button>
          </div>
        }
      >
        <div className="py-2">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F53F3F]/10">
              <Trash2 className="h-5 w-5 text-[#F53F3F]" />
            </div>
            <div className="flex-1">
              <p className="text-[15px] font-semibold text-gray-900 mb-1">
                确定要删除实验「{deleteModal.experiment?.title}」吗？
              </p>
              <p className="text-[13px] text-gray-500 leading-relaxed mt-1">
                此操作不可撤销，删除后相关的重复性记录、对照组数据等关联内容也将受到影响。
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
