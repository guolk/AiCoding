import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  ChevronDown,
  ThermometerSnowflake,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Trash2,
  Map,
  FileCheck,
  Plus,
  Search,
  Eye,
  User,
  Calendar,
  Package,
  EyeOff,
} from 'lucide-react';
import { useLabStore } from '@/store/useLabStore';
import AppLayout from '@/components/Layout/AppLayout';
import { Button, Badge, Modal, DataTable } from '@/components/Common';
import StatCard from '@/components/Common/StatCard';
import { cn } from '@/lib/utils';
import type { Storage, AuditLog, Disposal, Strain } from '@/types';

type TabKey = 'location' | 'audit' | 'disposal';
type TreeNodeType = 'fridge' | 'box' | 'cell';

interface SelectedNode {
  type: TreeNodeType;
  fridgeCode?: string;
  boxCode?: string;
  position?: string;
  storageId?: string;
}

const FRIDGE_INFO: Record<string, { name: string; temp: string }> = {
  'FRIDGE-A': { name: 'FRIDGE-A', temp: '-80℃超低温' },
  'FRIDGE-B': { name: 'FRIDGE-B', temp: '-20℃低温' },
};

const BOX_CODES = ['BOX-01', 'BOX-02', 'BOX-03'];
const ROWS = ['A', 'B', 'C', 'D', 'E'];
const COLS = [1, 2, 3, 4, 5];

const VIABILITY_BADGE: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  良好: 'success',
  一般: 'warning',
  活性下降: 'warning',
  较差: 'danger',
  失效: 'danger',
  死亡: 'danger',
};

const DISPOSAL_REASON_OPTIONS = [
  { key: '污染', color: 'bg-[#F53F3F]/10 text-[#F53F3F]' },
  { key: '项目结束', color: 'bg-[#165DFF]/10 text-[#165DFF]' },
  { key: '过期', color: 'bg-[#FF7D00]/10 text-[#FF7D00]' },
  { key: '其他', color: 'bg-[#86909C]/10 text-[#86909C]' },
];

const OPERATORS = ['张研究员', '李实验员', '王工程师', '赵技术员'];
const VIABILITY_OPTIONS = ['良好', '一般', '活性下降', '较差', '死亡'];
const REASON_OPTIONS = ['污染', '项目结束', '过期', '其他'];
const METHODS = ['高温高压灭菌', '化学消毒', '焚烧'];

export default function StorageIndex() {
  const navigate = useNavigate();
  const {
    storages,
    strains,
    audits,
    disposals,
    passages,
    updateStorage,
    addAudit,
    addDisposal,
    removeDisposal,
  } = useLabStore();

  const [activeTab, setActiveTab] = useState<TabKey>('location');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
    new Set(['FRIDGE-A', 'FRIDGE-B'])
  );
  const [selectedNode, setSelectedNode] = useState<SelectedNode | null>(null);
  const [fridgeFilter, setFridgeFilter] = useState('');
  const [auditStatusFilter, setAuditStatusFilter] = useState('');
  const [disposalSearch, setDisposalSearch] = useState('');

  const [allocateModalOpen, setAllocateModalOpen] = useState(false);
  const [allocateTarget, setAllocateTarget] = useState<Storage | null>(null);
  const [allocateStrainId, setAllocateStrainId] = useState('');

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailStorage, setDetailStorage] = useState<Storage | null>(null);

  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [auditTarget, setAuditTarget] = useState<Storage | null>(null);
  const [auditForm, setAuditForm] = useState({
    viability: '良好',
    survivalRate: 100,
    colorObservation: '正常',
    microscopyResult: '',
    needsRefresh: false,
    operator: OPERATORS[0],
    nextAuditDate: '',
  });

  const [disposalModalOpen, setDisposalModalOpen] = useState(false);
  const [disposalForm, setDisposalForm] = useState({
    strainId: '',
    reason: '',
    reasonOther: '',
    method: METHODS[0],
    operator: OPERATORS[0],
    approver: '',
    notes: '',
  });

  const [viewAuditDetail, setViewAuditDetail] = useState<AuditLog | null>(null);
  const [viewDisposalDetail, setViewDisposalDetail] = useState<Disposal | null>(null);

  const occupiedPositions = useMemo(
    () => storages.filter((s) => s.strainId !== null),
    [storages]
  );

  const toggleNode = (nodeId: string) => {
    const next = new Set(expandedNodes);
    if (next.has(nodeId)) {
      next.delete(nodeId);
    } else {
      next.add(nodeId);
    }
    setExpandedNodes(next);
  };

  const getStrain = (strainId: string | null) =>
    strainId ? strains.find((s) => s.id === strainId) : undefined;

  const getLatestAudit = (storageId: string) => {
    const list = audits.filter((a) => a.storageId === storageId);
    return list.sort(
      (a, b) => new Date(b.auditDate).getTime() - new Date(a.auditDate).getTime()
    )[0];
  };

  const getBoxStats = (fridgeCode: string, boxCode: string) => {
    const list = storages.filter(
      (s) => s.fridgeCode === fridgeCode && s.boxCode === boxCode
    );
    const occupied = list.filter((s) => s.strainId !== null).length;
    return { total: list.length, occupied };
  };

  const getFridgeStats = (fridgeCode: string) => {
    const list = storages.filter((s) => s.fridgeCode === fridgeCode);
    const occupied = list.filter((s) => s.strainId !== null).length;
    return { total: list.length, occupied };
  };

  const getCellStatus = (storage: Storage): 'occupied' | 'empty' | 'pending' => {
    if (!storage.strainId) return 'empty';
    const audit = getLatestAudit(storage.id);
    if (audit && audit.needsRefresh) return 'pending';
    return 'occupied';
  };

  const handleCellClick = (storage: Storage) => {
    if (storage.strainId) {
      setDetailStorage(storage);
      setDetailModalOpen(true);
    } else {
      setAllocateTarget(storage);
      setAllocateStrainId('');
      setAllocateModalOpen(true);
    }
  };

  const handleAllocate = () => {
    if (allocateTarget && allocateStrainId) {
      updateStorage(allocateTarget.id, {
        strainId: allocateStrainId,
        status: '正常',
      });
      setAllocateModalOpen(false);
      setAllocateTarget(null);
    }
  };

  const handleOpenAudit = (storage: Storage) => {
    setAuditTarget(storage);
    setAuditForm({
      viability: '良好',
      survivalRate: 100,
      colorObservation: '正常',
      microscopyResult: '',
      needsRefresh: false,
      operator: OPERATORS[0],
      nextAuditDate: '',
    });
    setAuditModalOpen(true);
  };

  const handleSaveAudit = () => {
    if (auditTarget) {
      addAudit({
        storageId: auditTarget.id,
        auditDate: new Date().toISOString().split('T')[0],
        viability: auditForm.viability,
        needsRefresh: auditForm.needsRefresh,
        operator: auditForm.operator,
      });
      setAuditModalOpen(false);
      setAuditTarget(null);
    }
  };

  const handleOutbound = (storage: Storage) => {
    updateStorage(storage.id, { strainId: null, status: '空' });
    setDetailModalOpen(false);
    setDetailStorage(null);
  };

  const handleSaveDisposal = () => {
    if (disposalForm.strainId && disposalForm.reason) {
      const reason =
        disposalForm.reason === '其他'
          ? disposalForm.reasonOther || '其他'
          : disposalForm.reason;
      addDisposal({
        strainId: disposalForm.strainId,
        reason,
        operator: disposalForm.operator,
        approver: disposalForm.approver || '待审批',
        date: new Date().toISOString().split('T')[0],
      });
      setDisposalModalOpen(false);
      setDisposalForm({
        strainId: '',
        reason: '',
        reasonOther: '',
        method: METHODS[0],
        operator: OPERATORS[0],
        approver: '',
        notes: '',
      });
    }
  };

  const filteredAudits = useMemo(() => {
    return audits
      .filter((audit) => {
        const storage = storages.find((s) => s.id === audit.storageId);
        if (fridgeFilter && storage?.fridgeCode !== fridgeFilter) return false;
        if (auditStatusFilter && audit.viability !== auditStatusFilter) return false;
        return true;
      })
      .sort(
        (a, b) => new Date(b.auditDate).getTime() - new Date(a.auditDate).getTime()
      );
  }, [audits, storages, fridgeFilter, auditStatusFilter]);

  const filteredDisposals = useMemo(() => {
    return disposals
      .filter((d) => {
        if (!disposalSearch) return true;
        const strain = strains.find((s) => s.id === d.strainId);
        const kw = disposalSearch.toLowerCase();
        return (
          strain?.name.toLowerCase().includes(kw) ||
          strain?.code.toLowerCase().includes(kw) ||
          d.reason.toLowerCase().includes(kw) ||
          d.operator.toLowerCase().includes(kw)
        );
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [disposals, strains, disposalSearch]);

  const renderTree = () => {
    const fridges = Object.keys(FRIDGE_INFO);
    return (
      <div className="space-y-1">
        {fridges.map((fridgeCode) => {
          const fridgeInfo = FRIDGE_INFO[fridgeCode];
          const fridgeExpanded = expandedNodes.has(fridgeCode);
          const fridgeStats = getFridgeStats(fridgeCode);
          return (
            <div key={fridgeCode}>
              <div
                className={cn(
                  'flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-all',
                  'hover:bg-gray-100',
                  selectedNode?.type === 'fridge' &&
                    selectedNode.fridgeCode === fridgeCode
                    ? 'bg-[#165DFF]/10'
                    : ''
                )}
                onClick={() => {
                  toggleNode(fridgeCode);
                  setSelectedNode({ type: 'fridge', fridgeCode });
                }}
              >
                {fridgeExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-500 shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500 shrink-0" />
                )}
                <ThermometerSnowflake className="h-4 w-4 text-[#165DFF] shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-medium text-gray-800 truncate">
                    {fridgeInfo.name}
                  </div>
                  <div className="text-[12px] text-gray-500">{fridgeInfo.temp}</div>
                </div>
                <Badge type="info" className="shrink-0">
                  {fridgeStats.occupied}/{fridgeStats.total}
                </Badge>
              </div>

              {fridgeExpanded && (
                <div className="ml-6 mt-1 space-y-1">
                  {BOX_CODES.map((boxCode) => {
                    const boxNodeId = `${fridgeCode}-${boxCode}`;
                    const boxExpanded = expandedNodes.has(boxNodeId);
                    const boxStats = getBoxStats(fridgeCode, boxCode);
                    return (
                      <div key={boxCode}>
                        <div
                          className={cn(
                            'flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-all',
                            'hover:bg-gray-100',
                            selectedNode?.type === 'box' &&
                              selectedNode.fridgeCode === fridgeCode &&
                              selectedNode.boxCode === boxCode
                              ? 'bg-[#165DFF]/10'
                              : ''
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleNode(boxNodeId);
                            setSelectedNode({ type: 'box', fridgeCode, boxCode });
                          }}
                        >
                          {boxExpanded ? (
                            <ChevronDown className="h-4 w-4 text-gray-500 shrink-0" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-500 shrink-0" />
                          )}
                          <Package className="h-4 w-4 text-[#FF7D00] shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-medium text-gray-700 truncate">
                              {boxCode}
                            </div>
                            <div className="text-[11px] text-gray-400">25格</div>
                          </div>
                          <Badge type="default" className="shrink-0">
                            {boxStats.occupied}/{boxStats.total}
                          </Badge>
                        </div>

                        {boxExpanded && (
                          <div className="ml-6 mt-2">
                            <div className="grid grid-cols-5 gap-1 p-2 bg-gray-50 rounded-lg">
                              {ROWS.map((row) =>
                                COLS.map((col) => {
                                  const position = `${row}${col}`;
                                  const storage = storages.find(
                                    (s) =>
                                      s.fridgeCode === fridgeCode &&
                                      s.boxCode === boxCode &&
                                      s.position === position
                                  );
                                  if (!storage) return null;
                                  const status = getCellStatus(storage);
                                  const strain = getStrain(storage.strainId);
                                  return (
                                    <div
                                      key={position}
                                      className={cn(
                                        'h-8 w-8 rounded cursor-pointer transition-all flex items-center justify-center',
                                        'text-[10px] font-medium',
                                        status === 'occupied' &&
                                          'bg-[#165DFF] text-white',
                                        status === 'empty' &&
                                          'bg-[#F2F3F5] text-gray-400 border border-dashed border-gray-300 hover:border-[#165DFF]',
                                        status === 'pending' &&
                                          'bg-[#FF7D00] text-white',
                                        selectedNode?.type === 'cell' &&
                                          selectedNode.storageId === storage.id
                                          ? 'ring-2 ring-offset-1 ring-[#165DFF]'
                                          : ''
                                      )}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedNode({
                                          type: 'cell',
                                          fridgeCode,
                                          boxCode,
                                          position,
                                          storageId: storage.id,
                                        });
                                        handleCellClick(storage);
                                      }}
                                      title={
                                        strain
                                          ? `${strain.name} (${position})`
                                          : position
                                      }
                                    >
                                      {strain
                                        ? strain.code?.slice(-2) || '·'
                                        : ''}
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderDetailPanel = () => {
    if (!selectedNode) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-400 py-20">
          <Map className="h-16 w-16 mb-4 opacity-30" />
          <p className="text-[14px]">请从左侧选择节点查看详情</p>
        </div>
      );
    }

    if (selectedNode.type === 'fridge' && selectedNode.fridgeCode) {
      const fridgeCode = selectedNode.fridgeCode;
      const fridgeInfo = FRIDGE_INFO[fridgeCode];
      const stats = getFridgeStats(fridgeCode);
      const occupancyRate =
        stats.total > 0
          ? Math.round((stats.occupied / stats.total) * 100)
          : 0;

      return (
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#165DFF]/10">
                <ThermometerSnowflake className="h-6 w-6 text-[#165DFF]" />
              </div>
              <div>
                <h2 className="text-[20px] font-bold text-gray-900">
                  {fridgeInfo.name}
                </h2>
                <p className="text-[13px] text-gray-500">{fridgeInfo.temp}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <StatCard
              label="总盒数"
              value="3"
              icon={Package}
              change={0}
              gradient="from-[#165DFF] to-[#4080FF]"
            />
            <StatCard
              label="总容量"
              value={`${stats.total}格`}
              icon={Map}
              change={0}
              gradient="from-[#722ED1] to-[#945BF7]"
            />
            <StatCard
              label="已占用"
              value={`${stats.occupied}格`}
              icon={CheckCircle2}
              change={0}
              gradient="from-[#00B42A] to-[#23C343]"
            />
            <StatCard
              label="占用率"
              value={`${occupancyRate}%`}
              icon={AlertTriangle}
              change={0}
              gradient={
                occupancyRate > 80
                  ? 'from-[#FF7D00] to-[#FF9A2E]'
                  : 'from-[#165DFF] to-[#4080FF]'
              }
            />
          </div>

          <div>
            <h3 className="text-[15px] font-semibold text-gray-800 mb-3">
              冻存盒概览
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {BOX_CODES.map((boxCode) => {
                const boxStats = getBoxStats(fridgeCode, boxCode);
                const rate =
                  boxStats.total > 0
                    ? Math.round((boxStats.occupied / boxStats.total) * 100)
                    : 0;
                return (
                  <div
                    key={boxCode}
                    className="bg-gray-50 rounded-xl p-4 border border-gray-100 cursor-pointer hover:shadow-md transition-all hover:border-[#165DFF]/30"
                    onClick={() =>
                      setSelectedNode({ type: 'box', fridgeCode, boxCode })
                    }
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[14px] font-semibold text-gray-800">
                        {boxCode}
                      </span>
                      <Badge type="info">
                        {boxStats.occupied}/{boxStats.total}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-5 gap-0.5">
                      {Array.from({ length: 25 }).map((_, idx) => {
                        const rowIdx = Math.floor(idx / 5);
                        const colIdx = idx % 5;
                        const position = `${ROWS[rowIdx]}${COLS[colIdx]}`;
                        const storage = storages.find(
                          (s) =>
                            s.fridgeCode === fridgeCode &&
                            s.boxCode === boxCode &&
                            s.position === position
                        );
                        const hasStrain = storage?.strainId;
                        return (
                          <div
                            key={idx}
                            className={cn(
                              'h-5 w-5 rounded-sm',
                              hasStrain ? 'bg-[#165DFF]' : 'bg-gray-200'
                            )}
                          />
                        );
                      })}
                    </div>
                    <div className="mt-3 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#165DFF] rounded-full transition-all"
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    if (
      selectedNode.type === 'box' &&
      selectedNode.fridgeCode &&
      selectedNode.boxCode
    ) {
      const { fridgeCode, boxCode } = selectedNode;
      const boxStorages = storages.filter(
        (s) => s.fridgeCode === fridgeCode && s.boxCode === boxCode
      );
      const stats = getBoxStats(fridgeCode, boxCode);

      return (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FF7D00]/10">
              <Package className="h-6 w-6 text-[#FF7D00]" />
            </div>
            <div>
              <h2 className="text-[20px] font-bold text-gray-900">
                {fridgeCode} / {boxCode}
              </h2>
              <p className="text-[13px] text-gray-500">
                已占用 {stats.occupied}/{stats.total} 格 · 占用率{' '}
                {stats.total > 0
                  ? Math.round((stats.occupied / stats.total) * 100)
                  : 0}
                %
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl">
            <div className="grid grid-cols-5 gap-3 justify-items-center">
              {ROWS.map((row) =>
                COLS.map((col) => {
                  const position = `${row}${col}`;
                  const storage = boxStorages.find(
                    (s) => s.position === position
                  );
                  if (!storage) return null;
                  const status = getCellStatus(storage);
                  const strain = getStrain(storage.strainId);
                  return (
                    <div
                      key={position}
                      className={cn(
                        'w-12 h-12 rounded-[4px] border flex flex-col items-center justify-center cursor-pointer transition-all',
                        status === 'occupied' &&
                          'bg-[#165DFF] border-[#165DFF]',
                        status === 'empty' &&
                          'bg-[#F2F3F5] border-dashed border-gray-300 hover:border-[#165DFF] hover:bg-white',
                        status === 'pending' &&
                          'bg-[#FF7D00] border-[#FF7D00]'
                      )}
                      onClick={() => {
                        setSelectedNode({
                          type: 'cell',
                          fridgeCode,
                          boxCode,
                          position,
                          storageId: storage.id,
                        });
                        handleCellClick(storage);
                      }}
                    >
                      {strain ? (
                        <>
                          <span className="text-white text-[10px] font-bold">
                            {strain.code?.slice(-3)}
                          </span>
                          <span className="text-white/80 text-[9px] truncate w-full text-center px-1">
                            {strain.name?.slice(0, 3)}
                          </span>
                        </>
                      ) : (
                        <Plus
                          className={cn(
                            'h-5 w-5',
                            status === 'empty' ? 'text-gray-400' : 'text-white'
                          )}
                        />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex items-center gap-6 text-[12px]">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-[#165DFF]" />
              <span className="text-gray-600">已占用</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-[#F2F3F5] border border-dashed border-gray-300" />
              <span className="text-gray-600">空闲</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-[#FF7D00]" />
              <span className="text-gray-600">待核查</span>
            </div>
          </div>
        </div>
      );
    }

    if (selectedNode.type === 'cell' && selectedNode.storageId) {
      const storage = storages.find((s) => s.id === selectedNode.storageId);
      if (!storage) return null;
      const strain = getStrain(storage.strainId);
      const latestAudit = getLatestAudit(storage.id);
      const strainPassage = strain
        ? [...passages]
            .filter((p) => p.strainId === strain.id)
            .sort((a, b) => b.generation - a.generation)[0]
        : undefined;

      if (!strain) {
        return (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Package className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-[14px]">空闲位置</p>
            <p className="text-[12px] mt-1">
              {storage.fridgeCode} / {storage.boxCode} / {storage.position}
            </p>
            <Button
              className="mt-4"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => {
                setAllocateTarget(storage);
                setAllocateStrainId('');
                setAllocateModalOpen(true);
              }}
            >
              分配菌株
            </Button>
          </div>
        );
      }

      return (
        <div className="space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[12px] text-gray-500 mb-1">
                {storage.fridgeCode} / {storage.boxCode} / {storage.position}
              </div>
              <h2 className="text-[20px] font-bold text-gray-900">
                {strain.name}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <Badge type="info">{strain.code}</Badge>
                <Badge
                  type={storage.status === '正常' ? 'success' : 'warning'}
                >
                  {storage.status}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-[12px] text-gray-500">传代次数</span>
              </div>
              <div className="text-[18px] font-bold text-gray-800 mt-1">
                第 {strainPassage?.generation || 1} 代
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-[12px] text-gray-500">入存日期</span>
              </div>
              <div className="text-[18px] font-bold text-gray-800 mt-1">
                {strain.createdAt}
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-[12px] text-gray-500">操作人</span>
              </div>
              <div className="text-[18px] font-bold text-gray-800 mt-1">
                {strain.operator}
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <FileCheck className="h-4 w-4 text-gray-400" />
                <span className="text-[12px] text-gray-500">最近核查</span>
              </div>
              <div className="text-[18px] font-bold text-gray-800 mt-1">
                {latestAudit?.auditDate || '未核查'}
              </div>
              {latestAudit && (
                <Badge
                  type={VIABILITY_BADGE[latestAudit.viability] || 'default'}
                  className="mt-1"
                >
                  {latestAudit.viability}
                </Badge>
              )}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-[13px] font-medium text-gray-700 mb-2">
              菌株信息
            </div>
            <div className="grid grid-cols-1 gap-2 text-[13px]">
              <div className="flex justify-between py-1">
                <span className="text-gray-500">来源</span>
                <span className="text-gray-800">{strain.source}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">培养条件</span>
                <span className="text-gray-800">{strain.cultureConditions}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">安全等级</span>
                <span className="text-gray-800">BSL-{strain.safetyLevel}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              leftIcon={<Eye className="h-4 w-4" />}
              onClick={() => navigate(`/strains/${strain.id}`)}
            >
              菌株详情
            </Button>
            <Button
              variant="secondary"
              leftIcon={<EyeOff className="h-4 w-4" />}
              onClick={() => handleOutbound(storage)}
            >
              出库
            </Button>
            <Button
              leftIcon={<FileCheck className="h-4 w-4" />}
              onClick={() => handleOpenAudit(storage)}
            >
              标记核查
            </Button>
          </div>
        </div>
      );
    }

    return null;
  };

  const auditColumns = [
    {
      key: 'id',
      title: '核查编号',
      width: 120,
      render: (_row: AuditLog, index: number) => (
        <span className="font-mono text-[13px] text-gray-700">
          AUD-{String(index + 1).padStart(4, '0')}
        </span>
      ),
    },
    {
      key: 'location',
      title: '位置',
      width: 160,
      render: (row: AuditLog) => {
        const storage = storages.find((s) => s.id === row.storageId);
        if (!storage) return '-';
        return (
          <span className="text-[13px] text-gray-700">
            {storage.fridgeCode}-{storage.boxCode}-{storage.position}
          </span>
        );
      },
    },
    {
      key: 'strain',
      title: '菌株',
      width: 180,
      render: (row: AuditLog) => {
        const storage = storages.find((s) => s.id === row.storageId);
        const strain = storage
          ? strains.find((s) => s.id === storage.strainId)
          : undefined;
        return strain ? (
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium text-gray-800">
              {strain.name}
            </span>
            <Badge type="info">{strain.code}</Badge>
          </div>
        ) : (
          '-'
        );
      },
    },
    {
      key: 'auditDate',
      title: '核查日期',
      width: 120,
      render: (row: AuditLog) => (
        <span className="text-[13px] text-gray-700">{row.auditDate}</span>
      ),
    },
    {
      key: 'viability',
      title: '活性结果',
      width: 120,
      render: (row: AuditLog) => (
        <Badge type={VIABILITY_BADGE[row.viability] || 'default'}>
          {row.viability}
        </Badge>
      ),
    },
    {
      key: 'needsRefresh',
      title: '需补充',
      width: 100,
      align: 'center' as const,
      render: (row: AuditLog) =>
        row.needsRefresh ? (
          <CheckCircle2 className="h-5 w-5 text-[#00B42A] mx-auto" />
        ) : (
          <XCircle className="h-5 w-5 text-[#F53F3F] mx-auto" />
        ),
    },
    {
      key: 'operator',
      title: '操作人',
      width: 120,
      render: (row: AuditLog) => (
        <span className="text-[13px] text-gray-700">{row.operator}</span>
      ),
    },
    {
      key: 'action',
      title: '操作',
      width: 120,
      render: (row: AuditLog) => (
        <Button
          size="sm"
          variant="ghost"
          leftIcon={<Eye className="h-3.5 w-3.5" />}
          onClick={() => setViewAuditDetail(row)}
        >
          查看
        </Button>
      ),
    },
  ];

  const disposalColumns = [
    {
      key: 'id',
      title: '销毁编号',
      width: 120,
      render: (_row: Disposal, index: number) => (
        <span className="font-mono text-[13px] text-gray-700">
          DSP-{String(index + 1).padStart(4, '0')}
        </span>
      ),
    },
    {
      key: 'strain',
      title: '菌株名称编号',
      width: 200,
      render: (row: Disposal) => {
        const strain = strains.find((s) => s.id === row.strainId);
        return strain ? (
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium text-gray-800">
              {strain.name}
            </span>
            <Badge type="info">{strain.code}</Badge>
          </div>
        ) : (
          '-'
        );
      },
    },
    {
      key: 'reason',
      title: '销毁原因',
      width: 120,
      render: (row: Disposal) => {
        const reasonKey =
          DISPOSAL_REASON_OPTIONS.find((r) => row.reason.includes(r.key))
            ?.key || '其他';
        const reasonStyle =
          DISPOSAL_REASON_OPTIONS.find((r) => r.key === reasonKey) ||
          DISPOSAL_REASON_OPTIONS[3];
        return (
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-medium',
              reasonStyle.color
            )}
          >
            {reasonKey}
          </span>
        );
      },
    },
    {
      key: 'operator',
      title: '操作人',
      width: 120,
      render: (row: Disposal) => (
        <span className="text-[13px] text-gray-700">{row.operator}</span>
      ),
    },
    {
      key: 'approver',
      title: '审批状态',
      width: 120,
      render: (row: Disposal) => {
        const isApproved = !row.approver.includes('待审批');
        return (
          <Badge type={isApproved ? 'success' : 'warning'}>
            {isApproved ? '已审批' : '待审批'}
          </Badge>
        );
      },
    },
    {
      key: 'date',
      title: '销毁日期',
      width: 120,
      render: (row: Disposal) => (
        <span className="text-[13px] text-gray-700">{row.date}</span>
      ),
    },
    {
      key: 'action',
      title: '操作',
      width: 160,
      render: (row: Disposal) => (
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<Eye className="h-3.5 w-3.5" />}
            onClick={() => setViewDisposalDetail(row)}
          >
            查看
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-[#F53F3F] hover:bg-[#F53F3F]/10 hover:text-[#F53F3F]"
            leftIcon={<Trash2 className="h-3.5 w-3.5" />}
            onClick={() => {
              if (confirm('确定撤销此销毁记录？')) {
                removeDisposal(row.id);
              }
            }}
          >
            撤销
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AppLayout breadcrumbItems={[{ label: '储存管理' }]}>
      <div className="min-h-full bg-[#F2F3F5] -m-6 p-6">
        <div className="max-w-[1600px] mx-auto">
          <div className="mb-6">
            <h1 className="text-[22px] font-bold text-gray-900">储存管理</h1>
            <p className="text-[13px] text-gray-500 mt-1">
              管理菌株冻存位置、核查记录与销毁流程
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-5">
            <div className="border-b border-gray-100 px-6">
              <div className="flex gap-8">
                {[
                  { key: 'location' as TabKey, label: '位置管理', icon: Map },
                  {
                    key: 'audit' as TabKey,
                    label: '冻存核查',
                    icon: FileCheck,
                  },
                  {
                    key: 'disposal' as TabKey,
                    label: '销毁记录',
                    icon: Trash2,
                  },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={cn(
                        'relative flex items-center gap-2 py-4 px-1 text-[15px] font-medium transition-colors',
                        isActive
                          ? 'text-[#165DFF]'
                          : 'text-gray-500 hover:text-gray-700'
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

          {activeTab === 'location' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex" style={{ minHeight: '600px' }}>
                <div
                  className="w-[40%] border-r border-gray-100 p-4 overflow-y-auto"
                  style={{ maxHeight: 'calc(100vh - 240px)' }}
                >
                  <div className="text-[13px] font-semibold text-gray-700 mb-3 px-2">
                    冰箱层级
                  </div>
                  {renderTree()}
                </div>
                <div
                  className="w-[60%] p-6 overflow-y-auto"
                  style={{ maxHeight: 'calc(100vh - 240px)' }}
                >
                  {renderDetailPanel()}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div>
              <div className="bg-white rounded-lg p-4 mb-5 shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] text-gray-500 shrink-0">
                        冰箱：
                      </span>
                      <select
                        value={fridgeFilter}
                        onChange={(e) => setFridgeFilter(e.target.value)}
                        className={cn(
                          'h-10 px-3 rounded-lg border border-gray-200 bg-white',
                          'focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                          'text-[14px] text-gray-700 min-w-[140px] transition-all'
                        )}
                      >
                        <option value="">全部冰箱</option>
                        {Object.keys(FRIDGE_INFO).map((code) => (
                          <option key={code} value={code}>
                            {FRIDGE_INFO[code].name} ({FRIDGE_INFO[code].temp})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] text-gray-500 shrink-0">
                        状态：
                      </span>
                      <select
                        value={auditStatusFilter}
                        onChange={(e) => setAuditStatusFilter(e.target.value)}
                        className={cn(
                          'h-10 px-3 rounded-lg border border-gray-200 bg-white',
                          'focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                          'text-[14px] text-gray-700 min-w-[140px] transition-all'
                        )}
                      >
                        <option value="">全部状态</option>
                        <option value="良好">良好</option>
                        <option value="一般">一般</option>
                        <option value="活性下降">活性下降</option>
                        <option value="较差">较差</option>
                        <option value="死亡">死亡</option>
                      </select>
                    </div>
                  </div>
                  <Button
                    leftIcon={<FileCheck className="h-4 w-4" />}
                    onClick={() => {
                      const pendingStorage = occupiedPositions.filter(
                        (s) => !getLatestAudit(s.id)
                      );
                      if (pendingStorage.length > 0) {
                        handleOpenAudit(pendingStorage[0]);
                      }
                    }}
                  >
                    批量核查
                  </Button>
                </div>
              </div>

              <DataTable<AuditLog>
                columns={auditColumns}
                data={filteredAudits}
                rowKey="id"
              />

              <div className="mt-5 text-[13px] text-gray-500">
                共{' '}
                <span className="text-gray-800 font-semibold">
                  {filteredAudits.length}
                </span>{' '}
                条核查记录
              </div>
            </div>
          )}

          {activeTab === 'disposal' && (
            <div>
              <div className="bg-white rounded-lg p-4 mb-5 shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="搜索菌株名称、编号或原因..."
                      value={disposalSearch}
                      onChange={(e) => setDisposalSearch(e.target.value)}
                      className={cn(
                        'w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200',
                        'focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                        'text-[14px] text-gray-700 placeholder-gray-400 transition-all'
                      )}
                    />
                  </div>
                  <Button
                    leftIcon={<Plus className="h-4 w-4" />}
                    onClick={() => setDisposalModalOpen(true)}
                  >
                    申请销毁
                  </Button>
                </div>
              </div>

              <DataTable<Disposal>
                columns={disposalColumns}
                data={filteredDisposals}
                rowKey="id"
              />

              <div className="mt-5 text-[13px] text-gray-500">
                共{' '}
                <span className="text-gray-800 font-semibold">
                  {filteredDisposals.length}
                </span>{' '}
                条销毁记录
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 分配菌株Modal */}
      <Modal
        open={allocateModalOpen}
        onClose={() => setAllocateModalOpen(false)}
        title="分配菌株到位置"
        width={520}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setAllocateModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleAllocate} disabled={!allocateStrainId}>
              确认分配
            </Button>
          </div>
        }
      >
        {allocateTarget && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-[12px] text-gray-500 mb-1">目标位置</div>
              <div className="text-[16px] font-semibold text-gray-800">
                {allocateTarget.fridgeCode} / {allocateTarget.boxCode} /{' '}
                {allocateTarget.position}
              </div>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-2">
                选择菌株
              </label>
              <select
                value={allocateStrainId}
                onChange={(e) => setAllocateStrainId(e.target.value)}
                className={cn(
                  'w-full h-11 px-4 rounded-lg border border-gray-200 bg-white',
                  'focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                  'text-[14px] text-gray-700 transition-all'
                )}
              >
                <option value="">请选择菌株</option>
                {strains
                  .filter((s) => {
                    const isInStorage = storages.some(
                      (st) => st.strainId === s.id
                    );
                    return !isInStorage;
                  })
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
              </select>
            </div>
          </div>
        )}
      </Modal>

      {/* 菌株详情Modal */}
      <Modal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="菌株储存详情"
        width={560}
        footer={null}
      >
        {detailStorage && (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[12px] text-gray-500">
                  {detailStorage.fridgeCode} / {detailStorage.boxCode} /{' '}
                  {detailStorage.position}
                </div>
                <h3 className="text-[18px] font-bold text-gray-900 mt-1">
                  {getStrain(detailStorage.strainId)?.name}
                </h3>
              </div>
              <Badge type="success">正常储存</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-[11px] text-gray-500">菌株编号</div>
                <div className="text-[15px] font-semibold text-gray-800 mt-1">
                  {getStrain(detailStorage.strainId)?.code}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-[11px] text-gray-500">生物安全等级</div>
                <div className="text-[15px] font-semibold text-gray-800 mt-1">
                  BSL-{getStrain(detailStorage.strainId)?.safetyLevel}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-[11px] text-gray-500">入存日期</div>
                <div className="text-[15px] font-semibold text-gray-800 mt-1">
                  {getStrain(detailStorage.strainId)?.createdAt}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-[11px] text-gray-500">操作人</div>
                <div className="text-[15px] font-semibold text-gray-800 mt-1">
                  {getStrain(detailStorage.strainId)?.operator}
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-[12px] font-medium text-gray-600 mb-2">
                培养条件
              </div>
              <div className="text-[13px] text-gray-700">
                {getStrain(detailStorage.strainId)?.cultureConditions}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                className="flex-1"
                leftIcon={<Eye className="h-4 w-4" />}
                onClick={() => {
                  const strain = getStrain(detailStorage.strainId);
                  if (strain) navigate(`/strains/${strain.id}`);
                  setDetailModalOpen(false);
                }}
              >
                跳转菌株详情
              </Button>
              <Button
                className="flex-1"
                leftIcon={<FileCheck className="h-4 w-4" />}
                onClick={() => {
                  handleOpenAudit(detailStorage);
                  setDetailModalOpen(false);
                }}
              >
                开始核查
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* 核查Modal */}
      <Modal
        open={auditModalOpen}
        onClose={() => setAuditModalOpen(false)}
        title="冻存活性核查"
        width={600}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setAuditModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveAudit}>保存核查记录</Button>
          </div>
        }
      >
        {auditTarget && (
          <div className="space-y-5">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-[11px] text-gray-500">位置</div>
                  <div className="text-[14px] font-semibold text-gray-800">
                    {auditTarget.fridgeCode}-{auditTarget.boxCode}-
                    {auditTarget.position}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-500">菌株</div>
                  <div className="text-[14px] font-semibold text-gray-800">
                    {getStrain(auditTarget.strainId)?.name || '-'}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-500">核查日期</div>
                  <div className="text-[14px] font-semibold text-gray-800">
                    {new Date().toISOString().split('T')[0]}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-2">
                存活率 (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={auditForm.survivalRate}
                onChange={(e) =>
                  setAuditForm({
                    ...auditForm,
                    survivalRate: Number(e.target.value),
                  })
                }
                className={cn(
                  'w-full h-10 px-4 rounded-lg border border-gray-200',
                  'focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                  'text-[14px] text-gray-700 transition-all'
                )}
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-2">
                颜色观察
              </label>
              <select
                value={auditForm.colorObservation}
                onChange={(e) =>
                  setAuditForm({ ...auditForm, colorObservation: e.target.value })
                }
                className={cn(
                  'w-full h-10 px-4 rounded-lg border border-gray-200 bg-white',
                  'focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                  'text-[14px] text-gray-700 transition-all'
                )}
              >
                <option value="正常">正常</option>
                <option value="异常">异常</option>
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-2">
                镜检结果
              </label>
              <textarea
                rows={3}
                placeholder="请输入镜检观察结果..."
                value={auditForm.microscopyResult}
                onChange={(e) =>
                  setAuditForm({
                    ...auditForm,
                    microscopyResult: e.target.value,
                  })
                }
                className={cn(
                  'w-full px-4 py-3 rounded-lg border border-gray-200 resize-none',
                  'focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                  'text-[14px] text-gray-700 transition-all'
                )}
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-2">
                活性评价
              </label>
              <div className="flex flex-wrap gap-2">
                {VIABILITY_OPTIONS.map((v) => (
                  <button
                    key={v}
                    onClick={() => setAuditForm({ ...auditForm, viability: v })}
                    className={cn(
                      'px-4 py-2 rounded-lg border-2 text-[13px] font-medium transition-all',
                      auditForm.viability === v
                        ? 'border-[#165DFF] bg-[#165DFF]/10 text-[#165DFF]'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-2">
                  下次核查日期
                </label>
                <input
                  type="date"
                  value={auditForm.nextAuditDate}
                  onChange={(e) =>
                    setAuditForm({
                      ...auditForm,
                      nextAuditDate: e.target.value,
                    })
                  }
                  className={cn(
                    'w-full h-10 px-4 rounded-lg border border-gray-200',
                    'focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                    'text-[14px] text-gray-700 transition-all'
                  )}
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-2">
                  操作人
                </label>
                <select
                  value={auditForm.operator}
                  onChange={(e) =>
                    setAuditForm({ ...auditForm, operator: e.target.value })
                  }
                  className={cn(
                    'w-full h-10 px-4 rounded-lg border border-gray-200 bg-white',
                    'focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                    'text-[14px] text-gray-700 transition-all'
                  )}
                >
                  {OPERATORS.map((op) => (
                    <option key={op} value={op}>
                      {op}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="needsRefresh"
                checked={auditForm.needsRefresh}
                onChange={(e) =>
                  setAuditForm({
                    ...auditForm,
                    needsRefresh: e.target.checked,
                  })
                }
                className="h-4 w-4 rounded border-gray-300 text-[#165DFF] focus:ring-[#165DFF]"
              />
              <label
                htmlFor="needsRefresh"
                className="text-[13px] text-gray-700"
              >
                需要补充传代
              </label>
            </div>
          </div>
        )}
      </Modal>

      {/* 销毁申请Modal */}
      <Modal
        open={disposalModalOpen}
        onClose={() => setDisposalModalOpen(false)}
        title="申请菌株销毁"
        width={640}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDisposalModalOpen(false)}>
              取消
            </Button>
            <Button
              variant="danger"
              onClick={handleSaveDisposal}
              disabled={!disposalForm.strainId || !disposalForm.reason}
            >
              提交申请
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-2">
              选择菌株
            </label>
            <select
              value={disposalForm.strainId}
              onChange={(e) =>
                setDisposalForm({ ...disposalForm, strainId: e.target.value })
              }
              className={cn(
                'w-full h-11 px-4 rounded-lg border border-gray-200 bg-white',
                'focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                'text-[14px] text-gray-700 transition-all'
              )}
            >
              <option value="">请选择要销毁的菌株</option>
              {strains
                .filter((s) => {
                  const isDisposed = disposals.some((d) => d.strainId === s.id);
                  return !isDisposed;
                })
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-2">
              销毁原因
            </label>
            <div className="grid grid-cols-4 gap-3">
              {REASON_OPTIONS.map((reason) => (
                <button
                  key={reason}
                  onClick={() =>
                    setDisposalForm({ ...disposalForm, reason })
                  }
                  className={cn(
                    'py-3 rounded-lg border-2 text-[13px] font-medium transition-all text-center',
                    disposalForm.reason === reason
                      ? 'border-[#F53F3F] bg-[#F53F3F]/10 text-[#F53F3F]'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  )}
                >
                  {reason}
                </button>
              ))}
            </div>
            {disposalForm.reason === '其他' && (
              <input
                type="text"
                placeholder="请输入其他销毁原因..."
                value={disposalForm.reasonOther}
                onChange={(e) =>
                  setDisposalForm({
                    ...disposalForm,
                    reasonOther: e.target.value,
                  })
                }
                className={cn(
                  'mt-3 w-full h-10 px-4 rounded-lg border border-gray-200',
                  'focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                  'text-[14px] text-gray-700 transition-all'
                )}
              />
            )}
          </div>

          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-2">
              销毁方式
            </label>
            <select
              value={disposalForm.method}
              onChange={(e) =>
                setDisposalForm({ ...disposalForm, method: e.target.value })
              }
              className={cn(
                'w-full h-11 px-4 rounded-lg border border-gray-200 bg-white',
                'focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                'text-[14px] text-gray-700 transition-all'
              )}
            >
              {METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-2">
                操作人
              </label>
              <select
                value={disposalForm.operator}
                onChange={(e) =>
                  setDisposalForm({
                    ...disposalForm,
                    operator: e.target.value,
                  })
                }
                className={cn(
                  'w-full h-10 px-4 rounded-lg border border-gray-200 bg-white',
                  'focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                  'text-[14px] text-gray-700 transition-all'
                )}
              >
                {OPERATORS.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-2">
                审批人
              </label>
              <input
                type="text"
                placeholder="请输入审批人姓名"
                value={disposalForm.approver}
                onChange={(e) =>
                  setDisposalForm({
                    ...disposalForm,
                    approver: e.target.value,
                  })
                }
                className={cn(
                  'w-full h-10 px-4 rounded-lg border border-gray-200',
                  'focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                  'text-[14px] text-gray-700 transition-all'
                )}
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-2">
              备注
            </label>
            <textarea
              rows={3}
              placeholder="请输入备注信息..."
              value={disposalForm.notes}
              onChange={(e) =>
                setDisposalForm({ ...disposalForm, notes: e.target.value })
              }
              className={cn(
                'w-full px-4 py-3 rounded-lg border border-gray-200 resize-none',
                'focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                'text-[14px] text-gray-700 transition-all'
              )}
            />
          </div>
        </div>
      </Modal>

      {/* 查看核查详情Modal */}
      <Modal
        open={!!viewAuditDetail}
        onClose={() => setViewAuditDetail(null)}
        title="核查详情"
        width={520}
        footer={null}
      >
        {viewAuditDetail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-[11px] text-gray-500">核查日期</div>
                <div className="text-[15px] font-semibold text-gray-800 mt-1">
                  {viewAuditDetail.auditDate}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-[11px] text-gray-500">活性评价</div>
                <div className="mt-1">
                  <Badge
                    type={
                      VIABILITY_BADGE[viewAuditDetail.viability] || 'default'
                    }
                  >
                    {viewAuditDetail.viability}
                  </Badge>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-[11px] text-gray-500">需补充传代</div>
                <div className="text-[15px] font-semibold text-gray-800 mt-1">
                  {viewAuditDetail.needsRefresh ? '是' : '否'}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-[11px] text-gray-500">操作人</div>
                <div className="text-[15px] font-semibold text-gray-800 mt-1">
                  {viewAuditDetail.operator}
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-[12px] font-medium text-gray-600 mb-2">
                位置信息
              </div>
              <div className="text-[13px] text-gray-700">
                {(() => {
                  const storage = storages.find(
                    (s) => s.id === viewAuditDetail.storageId
                  );
                  if (!storage) return '-';
                  return `${storage.fridgeCode}-${storage.boxCode}-${storage.position}`;
                })()}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 查看销毁详情Modal */}
      <Modal
        open={!!viewDisposalDetail}
        onClose={() => setViewDisposalDetail(null)}
        title="销毁详情"
        width={520}
        footer={null}
      >
        {viewDisposalDetail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-[11px] text-gray-500">菌株</div>
                <div className="text-[15px] font-semibold text-gray-800 mt-1">
                  {strains.find((s) => s.id === viewDisposalDetail.strainId)
                    ?.name || '-'}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-[11px] text-gray-500">菌株编号</div>
                <div className="text-[15px] font-semibold text-gray-800 mt-1">
                  {strains.find((s) => s.id === viewDisposalDetail.strainId)
                    ?.code || '-'}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-[11px] text-gray-500">销毁日期</div>
                <div className="text-[15px] font-semibold text-gray-800 mt-1">
                  {viewDisposalDetail.date}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-[11px] text-gray-500">审批状态</div>
                <div className="mt-1">
                  <Badge
                    type={
                      !viewDisposalDetail.approver.includes('待审批')
                        ? 'success'
                        : 'warning'
                    }
                  >
                    {!viewDisposalDetail.approver.includes('待审批')
                      ? '已审批'
                      : '待审批'}
                  </Badge>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-[11px] text-gray-500">操作人</div>
                <div className="text-[15px] font-semibold text-gray-800 mt-1">
                  {viewDisposalDetail.operator}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-[11px] text-gray-500">审批人</div>
                <div className="text-[15px] font-semibold text-gray-800 mt-1">
                  {viewDisposalDetail.approver}
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-[12px] font-medium text-gray-600 mb-2">
                销毁原因
              </div>
              <div className="text-[13px] text-gray-700 leading-relaxed">
                {viewDisposalDetail.reason}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}
