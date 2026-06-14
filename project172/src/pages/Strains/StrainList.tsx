import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Eye, Pencil, Trash2, Filter } from 'lucide-react';
import { useLabStore } from '@/store/useLabStore';
import AppLayout from '@/components/Layout/AppLayout';
import { DataTable, Button, Badge, Modal } from '@/components/Common';
import type { BadgeType } from '@/components/Common';
import type { DataTableColumn } from '@/components/Common';
import type { Strain } from '@/types';
import { cn } from '@/lib/utils';

// 安全等级映射配置
const safetyLevelMap: Record<number, { label: string; type: BadgeType }> = {
  1: { label: 'BSL-1', type: 'success' },
  2: { label: 'BSL-2', type: 'info' },
  3: { label: 'BSL-3', type: 'danger' },
};

export default function StrainList() {
  const navigate = useNavigate();
  const { strains, passages, removeStrain } = useLabStore();

  // 搜索关键词
  const [searchKeyword, setSearchKeyword] = useState('');
  // 安全等级筛选
  const [safetyFilter, setSafetyFilter] = useState<number | null>(null);
  // 删除确认弹窗
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; strain: Strain | null }>({
    open: false,
    strain: null,
  });

  // 获取菌株最新传代信息
  const getLatestPassage = (strainId: string) => {
    const strainPassages = passages
      .filter((p) => p.strainId === strainId)
      .sort((a, b) => new Date(b.passageDate).getTime() - new Date(a.passageDate).getTime());
    return strainPassages[0] || null;
  };

  // 筛选后的数据
  const filteredStrains = useMemo(() => {
    return strains.filter((strain) => {
      // 关键词匹配（编号或名称）
      const keywordMatch =
        !searchKeyword ||
        strain.code.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        strain.name.toLowerCase().includes(searchKeyword.toLowerCase());

      // 安全等级匹配
      const safetyMatch = safetyFilter === null || strain.safetyLevel === safetyFilter;

      return keywordMatch && safetyMatch;
    });
  }, [strains, searchKeyword, safetyFilter]);

  // 表格列配置
  const columns: DataTableColumn<Strain>[] = [
    {
      key: 'code',
      title: '编号',
      width: 120,
      render: (row) => (
        <span className="font-mono text-[#165DFF] font-medium">{row.code}</span>
      ),
    },
    {
      key: 'name',
      title: '名称',
      width: 140,
      render: (row) => (
        <span className="font-medium text-gray-800">{row.name}</span>
      ),
    },
    {
      key: 'taxonomy',
      title: '分类',
      width: 280,
      render: (row) => (
        <span className="text-gray-600 truncate block max-w-[260px]" title={row.taxonomy}>
          {row.taxonomy}
        </span>
      ),
    },
    {
      key: 'source',
      title: '来源',
      width: 200,
      render: (row) => (
        <span className="text-gray-600 truncate block max-w-[180px]" title={row.source}>
          {row.source}
        </span>
      ),
    },
    {
      key: 'safetyLevel',
      title: '安全等级',
      width: 100,
      align: 'center',
      render: (row) => {
        const level = safetyLevelMap[row.safetyLevel] || { label: `BSL-${row.safetyLevel}`, type: 'default' as BadgeType };
        return <Badge type={level.type}>{level.label}</Badge>;
      },
    },
    {
      key: 'latestPassage',
      title: '最新传代',
      width: 140,
      align: 'center',
      render: (row) => {
        const latest = getLatestPassage(row.id);
        if (!latest) return <span className="text-gray-400">-</span>;
        return (
          <div className="text-center">
            <span className="text-gray-800 font-medium">第{latest.generation}代</span>
            <div className="text-[12px] text-gray-400 mt-0.5">{latest.passageDate}</div>
          </div>
        );
      },
    },
    {
      key: 'operator',
      title: '操作人',
      width: 100,
      align: 'center',
      render: (row) => <span className="text-gray-600">{row.operator}</span>,
    },
    {
      key: 'createdAt',
      title: '创建时间',
      width: 120,
      align: 'center',
      render: (row) => <span className="text-gray-600">{row.createdAt}</span>,
    },
    {
      key: 'actions',
      title: '操作',
      width: 140,
      align: 'center',
      render: (row) => (
        <div className="flex items-center justify-center gap-1">
          {/* 查看 */}
          <button
            onClick={() => navigate(`/strains/${row.id}`)}
            className="p-2 rounded-md text-gray-500 hover:bg-[#165DFF]/10 hover:text-[#165DFF] transition-colors"
            title="查看详情"
          >
            <Eye className="h-4 w-4" />
          </button>
          {/* 编辑 */}
          <button
            onClick={() => navigate(`/strains/${row.id}/edit`)}
            className="p-2 rounded-md text-gray-500 hover:bg-[#165DFF]/10 hover:text-[#165DFF] transition-colors"
            title="编辑"
          >
            <Pencil className="h-4 w-4" />
          </button>
          {/* 删除 */}
          <button
            onClick={() => setDeleteModal({ open: true, strain: row })}
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
    if (deleteModal.strain) {
      removeStrain(deleteModal.strain.id);
      setDeleteModal({ open: false, strain: null });
    }
  };

  return (
    <AppLayout
      breadcrumbItems={[
        { label: '首页', path: '/' },
        { label: '菌株档案' },
      ]}
    >
      <div className="min-h-full bg-[#F2F3F5] -m-6 p-6">
        <div className="max-w-[1600px] mx-auto">
          {/* 页面标题 */}
          <div className="mb-6">
            <h1 className="text-[22px] font-bold text-gray-900">菌株档案</h1>
            <p className="text-[13px] text-gray-500 mt-1">管理实验室所有菌株的基础档案信息</p>
          </div>

          {/* 顶部操作栏 */}
          <div className="bg-white rounded-lg p-4 mb-5 shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* 左侧搜索 + 筛选 */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
                {/* 搜索框 */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="输入菌株编号或名称搜索..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className={cn(
                      'w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200',
                      'focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                      'text-[14px] text-gray-700 placeholder-gray-400 transition-all',
                    )}
                  />
                </div>

                {/* 安全等级筛选 */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Filter className="h-4 w-4" />
                    <span className="text-[13px]">安全等级：</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[
                      { value: null, label: '全部' },
                      { value: 1, label: 'BSL-1' },
                      { value: 2, label: 'BSL-2' },
                      { value: 3, label: 'BSL-3' },
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={() => setSafetyFilter(item.value)}
                        className={cn(
                          'px-3 py-1.5 rounded-md text-[13px] font-medium transition-all',
                          safetyFilter === item.value
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
                onClick={() => navigate('/strains/new')}
              >
                新增菌株
              </Button>
            </div>
          </div>

          {/* 数据表格 */}
          <DataTable<Strain>
            columns={columns}
            data={filteredStrains}
            rowKey="id"
            emptyText={
              searchKeyword || safetyFilter !== null
                ? '未找到匹配的菌株，请调整搜索条件'
                : '暂无菌株数据，点击"新增菌株"添加第一株菌'
            }
            showZebra
          />

          {/* 统计信息 */}
          <div className="mt-4 flex items-center justify-between text-[13px] text-gray-500">
            <span>
              共 <span className="text-gray-800 font-semibold">{filteredStrains.length}</span> 条记录
            </span>
            <div className="flex items-center gap-4">
              {Object.entries(safetyLevelMap).map(([level, config]) => {
                const count = strains.filter((s) => s.safetyLevel === Number(level)).length;
                return (
                  <span key={level} className="flex items-center gap-1.5">
                    <Badge type={config.type}>{config.label}</Badge>
                    <span>{count}株</span>
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 删除确认弹窗 */}
      <Modal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, strain: null })}
        title="删除菌株确认"
        width={480}
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setDeleteModal({ open: false, strain: null })}
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
                确定要删除菌株「{deleteModal.strain?.name}」吗？
              </p>
              <p className="text-[13px] text-gray-500 leading-relaxed">
                菌株编号：<span className="font-mono">{deleteModal.strain?.code}</span>
              </p>
              <p className="text-[13px] text-gray-500 leading-relaxed mt-1">
                此操作不可撤销，删除后相关的传代记录、培养记录等关联数据可能会受到影响。
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
