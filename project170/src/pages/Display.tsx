import { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  X,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronRight,
  MapPin,
  Calendar,
  Box,
  Archive,
  Layers,
  Eye,
  Package,
  Handshake,
  Building2,
  FlaskConical,
  Users,
  Building,
  Mail,
  Phone,
  FileText,
  DollarSign,
  RotateCcw,
  Grid3X3,
  ListTree,
  ToggleLeft,
  ToggleRight,
  Tag,
  Hash,
  AlignLeft,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { formatDate } from '@/utils/dateUtils';
import type {
  DisplayLocation,
  DisplayPlacement,
  LoanRecord,
  LoanStatus,
} from '@/types';
import {
  LOAN_STATUS_LABELS,
  LOAN_STATUS_COLORS,
  SPECIMEN_TYPE_COLORS,
  SPECIMEN_TYPE_LABELS,
} from '@/types';

const LOCATION_TYPE_LABELS: Record<DisplayLocation['type'], string> = {
  cabinet: '展柜',
  drawer: '抽屉',
  'storage-box': '储存盒',
  shelf: '架子',
  rack: '搁架',
};

const LOCATION_TYPE_ICONS = {
  cabinet: Archive,
  drawer: Box,
  'storage-box': Package,
  shelf: Layers,
  rack: Layers,
};

const BORROWER_TYPE_LABELS: Record<LoanRecord['borrowerType'], string> = {
  museum: '博物馆',
  exhibition: '展览',
  research: '科研机构',
  other: '其他',
};

const BORROWER_TYPE_COLORS: Record<LoanRecord['borrowerType'], string> = {
  museum: 'bg-indigo-100 text-indigo-700',
  exhibition: 'bg-rose-100 text-rose-700',
  research: 'bg-teal-100 text-teal-700',
  other: 'bg-gray-100 text-gray-700',
};

const BORROWER_TYPE_ICONS = {
  museum: Building2,
  exhibition: Building,
  research: FlaskConical,
  other: Users,
};

interface TreeNode {
  location: DisplayLocation;
  children: TreeNode[];
  count: number;
}

function buildLocationTree(
  locations: DisplayLocation[],
  placements: DisplayPlacement[],
  parentId?: string
): TreeNode[] {
  return locations
    .filter((l) => l.parentId === parentId)
    .map((loc) => {
      const children = buildLocationTree(locations, placements, loc.id);
      const directCount = placements.filter((p) => p.locationId === loc.id).length;
      const childrenCount = children.reduce((sum, c) => sum + c.count, 0);
      return {
        location: loc,
        children,
        count: directCount + childrenCount,
      };
    })
    .sort((a, b) => a.location.locationCode.localeCompare(b.location.locationCode));
}

function getDescendantIds(locations: DisplayLocation[], parentId: string): string[] {
  const ids: string[] = [parentId];
  const children = locations.filter((l) => l.parentId === parentId);
  children.forEach((c) => {
    ids.push(...getDescendantIds(locations, c.id));
  });
  return ids;
}

function getLocationPath(
  locations: DisplayLocation[],
  locationId: string
): DisplayLocation[] {
  const path: DisplayLocation[] = [];
  let current = locations.find((l) => l.id === locationId);
  while (current) {
    path.unshift(current);
    current = locations.find((l) => l.id === current!.parentId);
  }
  return path;
}

interface PlacementFormData {
  specimenId: string;
  locationId: string;
  positionIndex: string;
  displayOrder: string;
  categoryLabel: string;
  onDisplay: boolean;
  arrangementNotes: string;
}

const defaultPlacementForm: PlacementFormData = {
  specimenId: '',
  locationId: '',
  positionIndex: '1',
  displayOrder: '1',
  categoryLabel: '',
  onDisplay: true,
  arrangementNotes: '',
};

interface LoanFormData {
  specimenIds: string[];
  borrowerType: LoanRecord['borrowerType'];
  borrowerName: string;
  institution: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  loanDate: string;
  expectedReturnDate: string;
  actualReturnDate: string;
  status: LoanStatus;
  purpose: string;
  exhibitionName: string;
  exhibitionLocation: string;
  conditions: string;
  insuranceAmount: string;
  notes: string;
}

const defaultLoanForm: LoanFormData = {
  specimenIds: [],
  borrowerType: 'museum',
  borrowerName: '',
  institution: '',
  contactPerson: '',
  contactEmail: '',
  contactPhone: '',
  loanDate: new Date().toISOString().split('T')[0],
  expectedReturnDate: '',
  actualReturnDate: '',
  status: 'on-loan',
  purpose: '',
  exhibitionName: '',
  exhibitionLocation: '',
  conditions: '',
  insuranceAmount: '',
  notes: '',
};

function StatsCard({
  icon: Icon,
  label,
  value,
  subValue,
  gradient,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  subValue?: string;
  gradient: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5 flex items-center gap-4 hover:shadow-card-hover transition-all">
      <div className={`w-14 h-14 rounded-2xl ${gradient} flex items-center justify-center shadow-md`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-500 mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        {subValue && <p className="text-xs text-gray-400 mt-0.5">{subValue}</p>}
      </div>
    </div>
  );
}

function TreeNodeItem({
  node,
  selectedId,
  onSelect,
  placements,
  depth = 0,
}: {
  node: TreeNode;
  selectedId: string | null;
  onSelect: (id: string) => void;
  placements: DisplayPlacement[];
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(depth < 1);
  const Icon = LOCATION_TYPE_ICONS[node.location.type];
  const isSelected = selectedId === node.location.id;
  const directCount = placements.filter((p) => p.locationId === node.location.id).length;

  return (
    <div>
      <button
        onClick={() => onSelect(node.location.id)}
        className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all group ${
          isSelected
            ? 'bg-amber-100 text-amber-900 shadow-sm'
            : 'hover:bg-amber-50 text-gray-700'
        }`}
        style={{ paddingLeft: `${depth * 16 + 12}px` }}
      >
        {node.children.length > 0 ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-amber-600 transition-colors"
          >
            {expanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        ) : (
          <div className="w-5 h-5" />
        )}
        <Icon className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-amber-600' : 'text-amber-500'}`} />
        <div className="flex-1 min-w-0 text-left">
          <div className="font-medium truncate">{node.location.name}</div>
          <div className="text-xs text-gray-400 truncate">
            {node.location.locationCode}
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              isSelected
                ? 'bg-amber-200 text-amber-800'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {directCount}/{node.location.capacity ?? '-'}
          </span>
        </div>
      </button>
      {expanded && node.children.length > 0 && (
        <div className="ml-2 border-l border-amber-100 ml-4">
          {node.children.map((child) => (
            <TreeNodeItem
              key={child.location.id}
              node={child}
              selectedId={selectedId}
              onSelect={onSelect}
              placements={placements}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Display() {
  const displayLocations = useAppStore((s) => s.displayLocations);
  const displayPlacements = useAppStore((s) => s.displayPlacements);
  const loanRecords = useAppStore((s) => s.loanRecords);
  const specimens = useAppStore((s) => s.specimens);

  const addDisplayPlacement = useAppStore((s) => s.addDisplayPlacement);
  const updateDisplayPlacement = useAppStore((s) => s.updateDisplayPlacement);
  const deleteDisplayPlacement = useAppStore((s) => s.deleteDisplayPlacement);
  const addLoanRecord = useAppStore((s) => s.addLoanRecord);
  const updateLoanRecord = useAppStore((s) => s.updateLoanRecord);
  const deleteLoanRecord = useAppStore((s) => s.deleteLoanRecord);

  const [activeTab, setActiveTab] = useState<'placements' | 'loans'>('placements');
  const [cabinetView, setCabinetView] = useState<'list' | 'overview'>('list');
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [placementSearch, setPlacementSearch] = useState('');

  const [placementFormOpen, setPlacementFormOpen] = useState(false);
  const [editingPlacement, setEditingPlacement] = useState<DisplayPlacement | null>(null);
  const [placementForm, setPlacementForm] = useState<PlacementFormData>(defaultPlacementForm);

  const [loanSearch, setLoanSearch] = useState('');
  const [loanStatusFilter, setLoanStatusFilter] = useState<'all' | LoanStatus>('all');

  const [loanFormOpen, setLoanFormOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<LoanRecord | null>(null);
  const [loanForm, setLoanForm] = useState<LoanFormData>(defaultLoanForm);

  const [loanDetailOpen, setLoanDetailOpen] = useState(false);
  const [viewingLoan, setViewingLoan] = useState<LoanRecord | null>(null);

  const stats = useMemo(() => {
    const cabinetCount = displayLocations.filter((l) => l.type === 'cabinet').length;
    const onDisplayCount = displayPlacements.filter((p) => p.onDisplay).length;
    const onLoanBatches = loanRecords.filter((l) => l.status === 'on-loan').length;
    const onLoanSpecimens = loanRecords
      .filter((l) => l.status === 'on-loan')
      .reduce((sum, l) => sum + l.specimenIds.length, 0);
    return { cabinetCount, onDisplayCount, onLoanBatches, onLoanSpecimens };
  }, [displayLocations, displayPlacements, loanRecords]);

  const locationTree = useMemo(
    () => buildLocationTree(displayLocations, displayPlacements),
    [displayLocations, displayPlacements]
  );

  const filteredPlacements = useMemo(() => {
    let result = displayPlacements;
    if (selectedLocationId) {
      const ids = getDescendantIds(displayLocations, selectedLocationId);
      result = result.filter((p) => ids.includes(p.locationId));
    }
    if (placementSearch) {
      const q = placementSearch.toLowerCase();
      result = result.filter((p) => {
        const spec = specimens.find((s) => s.id === p.specimenId);
        if (!spec) return false;
        return (
          spec.name.toLowerCase().includes(q) ||
          spec.specimenNo.toLowerCase().includes(q) ||
          (p.categoryLabel && p.categoryLabel.toLowerCase().includes(q))
        );
      });
    }
    return [...result].sort((a, b) => a.displayOrder - b.displayOrder);
  }, [displayPlacements, selectedLocationId, placementSearch, displayLocations, specimens]);

  const cabinets = useMemo(
    () => displayLocations.filter((l) => l.type === 'cabinet'),
    [displayLocations]
  );

  const filteredLoans = useMemo(() => {
    let result = loanRecords;
    if (loanStatusFilter !== 'all') {
      result = result.filter((l) => l.status === loanStatusFilter);
    }
    if (loanSearch) {
      const q = loanSearch.toLowerCase();
      result = result.filter((l) =>
        l.id.toLowerCase().includes(q) ||
        l.borrowerName.toLowerCase().includes(q) ||
        (l.institution && l.institution.toLowerCase().includes(q)) ||
        (l.exhibitionName && l.exhibitionName.toLowerCase().includes(q))
      );
    }
    return [...result].sort((a, b) => b.loanDate.localeCompare(a.loanDate));
  }, [loanRecords, loanStatusFilter, loanSearch]);

  const getSpecimen = (id: string) => specimens.find((s) => s.id === id);

  const getLocation = (id: string) => displayLocations.find((l) => l.id === id);

  const openAddPlacement = () => {
    setEditingPlacement(null);
    setPlacementForm({
      ...defaultPlacementForm,
      locationId: selectedLocationId ?? displayLocations[0]?.id ?? '',
    });
    setPlacementFormOpen(true);
  };

  const openEditPlacement = (placement: DisplayPlacement) => {
    setEditingPlacement(placement);
    setPlacementForm({
      specimenId: placement.specimenId,
      locationId: placement.locationId,
      positionIndex: placement.positionIndex.toString(),
      displayOrder: placement.displayOrder.toString(),
      categoryLabel: placement.categoryLabel ?? '',
      onDisplay: placement.onDisplay,
      arrangementNotes: placement.arrangementNotes ?? '',
    });
    setPlacementFormOpen(true);
  };

  const closePlacementForm = () => {
    setPlacementFormOpen(false);
    setEditingPlacement(null);
    setPlacementForm(defaultPlacementForm);
  };

  const handlePlacementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!placementForm.specimenId || !placementForm.locationId) return;

    const data = {
      specimenId: placementForm.specimenId,
      locationId: placementForm.locationId,
      positionIndex: parseInt(placementForm.positionIndex) || 1,
      displayOrder: parseInt(placementForm.displayOrder) || 1,
      categoryLabel: placementForm.categoryLabel || undefined,
      onDisplay: placementForm.onDisplay,
      arrangementNotes: placementForm.arrangementNotes || undefined,
    };

    if (editingPlacement) {
      updateDisplayPlacement(editingPlacement.id, data);
    } else {
      addDisplayPlacement(data);
    }
    closePlacementForm();
  };

  const handleDeletePlacement = (placement: DisplayPlacement) => {
    const spec = getSpecimen(placement.specimenId);
    if (window.confirm(`确定要移除"${spec?.name ?? '标本'}"的陈列安排吗？`)) {
      deleteDisplayPlacement(placement.id);
    }
  };

  const openAddLoan = () => {
    setEditingLoan(null);
    setLoanForm(defaultLoanForm);
    setLoanFormOpen(true);
  };

  const openEditLoan = (loan: LoanRecord) => {
    setEditingLoan(loan);
    setLoanForm({
      specimenIds: [...loan.specimenIds],
      borrowerType: loan.borrowerType,
      borrowerName: loan.borrowerName,
      institution: loan.institution ?? '',
      contactPerson: loan.contactPerson ?? '',
      contactEmail: loan.contactEmail ?? '',
      contactPhone: loan.contactPhone ?? '',
      loanDate: loan.loanDate,
      expectedReturnDate: loan.expectedReturnDate ?? '',
      actualReturnDate: loan.actualReturnDate ?? '',
      status: loan.status,
      purpose: loan.purpose ?? '',
      exhibitionName: loan.exhibitionName ?? '',
      exhibitionLocation: loan.exhibitionLocation ?? '',
      conditions: loan.conditions ?? '',
      insuranceAmount: loan.insuranceAmount?.toString() ?? '',
      notes: loan.notes ?? '',
    });
    setLoanFormOpen(true);
  };

  const closeLoanForm = () => {
    setLoanFormOpen(false);
    setEditingLoan(null);
    setLoanForm(defaultLoanForm);
  };

  const handleLoanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loanForm.borrowerName || loanForm.specimenIds.length === 0 || !loanForm.loanDate) return;

    const data = {
      specimenIds: loanForm.specimenIds,
      borrowerType: loanForm.borrowerType,
      borrowerName: loanForm.borrowerName,
      institution: loanForm.institution || undefined,
      contactPerson: loanForm.contactPerson || undefined,
      contactEmail: loanForm.contactEmail || undefined,
      contactPhone: loanForm.contactPhone || undefined,
      loanDate: loanForm.loanDate,
      expectedReturnDate: loanForm.expectedReturnDate || undefined,
      actualReturnDate: loanForm.actualReturnDate || undefined,
      status: loanForm.status,
      purpose: loanForm.purpose || undefined,
      exhibitionName: loanForm.exhibitionName || undefined,
      exhibitionLocation: loanForm.exhibitionLocation || undefined,
      conditions: loanForm.conditions || undefined,
      insuranceAmount: loanForm.insuranceAmount ? parseFloat(loanForm.insuranceAmount) : undefined,
      notes: loanForm.notes || undefined,
    };

    if (editingLoan) {
      updateLoanRecord(editingLoan.id, data);
    } else {
      addLoanRecord(data);
    }
    closeLoanForm();
  };

  const handleMarkReturned = (loan: LoanRecord) => {
    if (window.confirm(`确定标记"${loan.borrowerName}"的出借已归还吗？`)) {
      updateLoanRecord(loan.id, {
        status: 'returned',
        actualReturnDate: new Date().toISOString().split('T')[0],
      });
    }
  };

  const handleDeleteLoan = (loan: LoanRecord) => {
    if (window.confirm(`确定删除出借记录"${loan.id}"吗？`)) {
      deleteLoanRecord(loan.id);
      if (viewingLoan?.id === loan.id) {
        setLoanDetailOpen(false);
        setViewingLoan(null);
      }
    }
  };

  const openLoanDetail = (loan: LoanRecord) => {
    setViewingLoan(loan);
    setLoanDetailOpen(true);
  };

  const toggleSpecimenInLoan = (specId: string) => {
    setLoanForm((f) => ({
      ...f,
      specimenIds: f.specimenIds.includes(specId)
        ? f.specimenIds.filter((id) => id !== specId)
        : [...f.specimenIds, specId],
    }));
  };

  const renderCabinetOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {cabinets.map((cabinet) => {
        const ids = getDescendantIds(displayLocations, cabinet.id);
        const cabinetPlacements = displayPlacements.filter((p) => ids.includes(p.locationId));
        const capacity = cabinet.capacity ?? 0;
        const used = cabinetPlacements.length;
        const percent = capacity > 0 ? Math.min((used / capacity) * 100, 100) : 0;
        const previewSpecimens = cabinetPlacements.slice(0, 6);

        return (
          <div
            key={cabinet.id}
            onClick={() => {
              setSelectedLocationId(cabinet.id);
              setCabinetView('list');
            }}
            className="group bg-white rounded-2xl shadow-card border border-amber-50 overflow-hidden cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 border-b border-amber-100">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
                    <Archive className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 font-serif">{cabinet.name}</h3>
                    <p className="text-xs text-amber-600 font-mono">{cabinet.locationCode}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
                  {LOCATION_TYPE_LABELS[cabinet.type]}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">容纳量</span>
                <span className="font-bold text-amber-700">
                  {used} / {capacity}
                </span>
              </div>
              <div className="h-2.5 bg-white/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
            <div className="p-4">
              {previewSpecimens.length > 0 ? (
                <div className="grid grid-cols-6 gap-2">
                  {previewSpecimens.map((p) => {
                    const spec = getSpecimen(p.specimenId);
                    return (
                      <div
                        key={p.id}
                        className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-100 group-hover:border-amber-200 transition-colors"
                      >
                        {spec?.photos[0]?.url ? (
                          <img
                            src={spec.photos[0].url}
                            alt={spec.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-amber-300" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {Array.from({ length: Math.max(0, 6 - previewSpecimens.length) }).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="aspect-square rounded-lg bg-gray-50 border border-dashed border-gray-200"
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-sm text-gray-400">
                  <Package className="w-8 h-8 mx-auto mb-1 text-gray-300" />
                  暂无陈列
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          icon={Archive}
          label="展柜数量"
          value={stats.cabinetCount}
          subValue="展示空间"
          gradient="bg-gradient-to-br from-amber-400 to-orange-500"
        />
        <StatsCard
          icon={Eye}
          label="在展标本"
          value={stats.onDisplayCount}
          subValue="公开展示中"
          gradient="bg-gradient-to-br from-emerald-400 to-teal-500"
        />
        <StatsCard
          icon={Handshake}
          label="出借中批次"
          value={stats.onLoanBatches}
          subValue="进行中"
          gradient="bg-gradient-to-br from-blue-400 to-indigo-500"
        />
        <StatsCard
          icon={Package}
          label="出借标本总数"
          value={stats.onLoanSpecimens}
          subValue="件在外"
          gradient="bg-gradient-to-br from-rose-400 to-pink-500"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 px-6 flex items-center gap-1">
          <button
            onClick={() => setActiveTab('placements')}
            className={`px-5 py-4 text-sm font-medium border-b-2 transition-all ${
              activeTab === 'placements'
                ? 'border-amber-500 text-amber-700 bg-amber-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              陈列管理
            </span>
          </button>
          <button
            onClick={() => setActiveTab('loans')}
            className={`px-5 py-4 text-sm font-medium border-b-2 transition-all ${
              activeTab === 'loans'
                ? 'border-blue-500 text-blue-700 bg-blue-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <Handshake className="w-4 h-4" />
              出借记录
            </span>
          </button>
        </div>

        {activeTab === 'placements' ? (
          <div>
            <div className="px-6 py-4 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-gradient-to-r from-amber-50/30 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
                  <Layers className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800 font-serif">陈列管理</h2>
                  <p className="text-xs text-gray-500">管理标本的陈列位置与展示状态</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
                  <button
                    onClick={() => setCabinetView('list')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      cabinetView === 'list'
                        ? 'bg-white shadow-sm text-amber-700'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <ListTree className="w-3.5 h-3.5" />
                      列表视图
                    </span>
                  </button>
                  <button
                    onClick={() => setCabinetView('overview')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      cabinetView === 'overview'
                        ? 'bg-white shadow-sm text-amber-700'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Grid3X3 className="w-3.5 h-3.5" />
                      展柜总览
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {cabinetView === 'overview' ? (
              <div className="p-6">{renderCabinetOverview()}</div>
            ) : (
              <div className="flex flex-col lg:flex-row min-h-[600px]">
                <div className="w-full lg:w-72 lg:min-w-72 border-b lg:border-b-0 lg:border-r border-gray-100 p-4 overflow-y-auto max-h-96 lg:max-h-none">
                  <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2 px-2">
                    <MapPin className="w-4 h-4 text-amber-500" />
                    展示位置
                  </h3>
                  <div className="space-y-0.5">
                    <button
                      onClick={() => setSelectedLocationId(null)}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all ${
                        selectedLocationId === null
                          ? 'bg-amber-100 text-amber-900 shadow-sm'
                          : 'hover:bg-amber-50 text-gray-700'
                      }`}
                    >
                      <Layers className="w-4 h-4 text-amber-500" />
                      <span className="font-medium">全部位置</span>
                      <span
                        className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${
                          selectedLocationId === null
                            ? 'bg-amber-200 text-amber-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {displayPlacements.length}
                      </span>
                    </button>
                    {locationTree.map((node) => (
                      <TreeNodeItem
                        key={node.location.id}
                        node={node}
                        selectedId={selectedLocationId}
                        onSelect={setSelectedLocationId}
                        placements={displayPlacements}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                    <div className="relative flex-1 sm:max-w-xs">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={placementSearch}
                        onChange={(e) => setPlacementSearch(e.target.value)}
                        placeholder="搜索标本名称、编号..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-sm"
                      />
                    </div>
                    <button
                      onClick={openAddPlacement}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg hover:from-amber-600 hover:to-orange-600 transition-all text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      安排存放
                    </button>
                  </div>

                  {filteredPlacements.length === 0 ? (
                    <div className="py-20 text-center">
                      <div className="w-20 h-20 mx-auto rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
                        <Package className="w-10 h-10 text-amber-300" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        {selectedLocationId ? '该位置暂无陈列' : '暂无陈列安排'}
                      </h3>
                      <p className="text-gray-500 text-sm">
                        点击"安排存放"按钮开始添加
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredPlacements.map((placement) => {
                        const spec = getSpecimen(placement.specimenId);
                        const loc = getLocation(placement.locationId);
                        const locPath = loc
                          ? getLocationPath(displayLocations, loc.id)
                          : [];

                        if (!spec) return null;

                        return (
                          <div
                            key={placement.id}
                            className="bg-white rounded-xl border border-gray-100 p-4 hover:border-amber-200 hover:shadow-md transition-all"
                          >
                            <div className="flex flex-col sm:flex-row gap-4">
                              <div className="w-full sm:w-24 h-24 rounded-xl overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 flex-shrink-0">
                                {spec.photos[0]?.url ? (
                                  <img
                                    src={spec.photos[0].url}
                                    alt={spec.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Sparkles className="w-8 h-8 text-amber-300" />
                                  </div>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                      <h4 className="font-bold text-gray-800 font-serif">
                                        {spec.name}
                                      </h4>
                                      <span className="text-xs text-amber-600 font-mono">
                                        {spec.specimenNo}
                                      </span>
                                      <span
                                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${SPECIMEN_TYPE_COLORS[spec.type]}`}
                                      >
                                        {SPECIMEN_TYPE_LABELS[spec.type]}
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 mt-2">
                                      {placement.categoryLabel && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-medium">
                                          <Tag className="w-3 h-3" />
                                          {placement.categoryLabel}
                                        </span>
                                      )}
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium">
                                        <MapPin className="w-3 h-3" />
                                        {locPath.map((l) => l.name).join(' / ')}
                                      </span>
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-50 text-gray-600 text-xs font-medium">
                                        <Hash className="w-3 h-3" />
                                        #{placement.displayOrder}
                                      </span>
                                    </div>
                                    {placement.arrangementNotes && (
                                      <p className="mt-2 text-sm text-gray-500 flex items-start gap-1.5">
                                        <AlignLeft className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                        {placement.arrangementNotes}
                                      </p>
                                    )}
                                  </div>

                                  <div className="flex sm:flex-col items-end gap-2">
                                    <button
                                      onClick={() =>
                                        updateDisplayPlacement(placement.id, {
                                          onDisplay: !placement.onDisplay,
                                        })
                                      }
                                      className="transition-colors"
                                      title={placement.onDisplay ? '在展中' : '未展出'}
                                    >
                                      {placement.onDisplay ? (
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium">
                                          <ToggleRight className="w-4 h-4" />
                                          在展
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 text-gray-500 text-xs font-medium">
                                          <ToggleLeft className="w-4 h-4" />
                                          存库
                                        </div>
                                      )}
                                    </button>
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => openEditPlacement(placement)}
                                        className="w-8 h-8 rounded-lg hover:bg-amber-50 flex items-center justify-center text-amber-600 hover:text-amber-700 transition-colors"
                                        title="编辑"
                                      >
                                        <Edit2 className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDeletePlacement(placement)}
                                        className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-red-500 hover:text-red-600 transition-colors"
                                        title="移除"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
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
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="px-6 py-4 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-gradient-to-r from-blue-50/30 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-md">
                  <Handshake className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800 font-serif">出借记录</h2>
                  <p className="text-xs text-gray-500">管理标本的外借与归还</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={loanSearch}
                    onChange={(e) => setLoanSearch(e.target.value)}
                    placeholder="搜索出借编号、出借方..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                  />
                </div>
                <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
                  {(['all', 'available', 'on-loan', 'returned'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setLoanStatusFilter(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        loanStatusFilter === s
                          ? 'bg-white shadow-sm text-blue-700'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {s === 'all' ? '全部' : LOAN_STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
                <button
                  onClick={openAddLoan}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg hover:from-blue-600 hover:to-indigo-600 transition-all text-sm"
                >
                  <Plus className="w-4 h-4" />
                  新增出借
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      出借编号
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      出借方
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      机构
                    </th>
                    <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      标本数
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      出借日期
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      预计归还
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      实际归还
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredLoans.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-16 text-center">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 flex items-center justify-center mb-3">
                          <Handshake className="w-8 h-8 text-blue-300" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-700 mb-1">
                          暂无出借记录
                        </h3>
                        <p className="text-sm text-gray-500">
                          点击"新增出借"按钮开始记录
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredLoans.map((loan) => {
                      const BorrowerIcon = BORROWER_TYPE_ICONS[loan.borrowerType];
                      const borrowerBg = BORROWER_TYPE_COLORS[loan.borrowerType].split(' ')[0];
                      const borrowerText = BORROWER_TYPE_COLORS[loan.borrowerType].split(' ')[1];
                      return (
                        <tr
                          key={loan.id}
                          className="hover:bg-blue-50/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <span className="font-mono text-sm text-blue-600 font-medium">
                              {loan.id}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center ${borrowerBg}`}
                              >
                                <BorrowerIcon className={`w-4 h-4 ${borrowerText}`} />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-800">
                                  {loan.borrowerName}
                                </div>
                                <span
                                  className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${BORROWER_TYPE_COLORS[loan.borrowerType]}`}
                                >
                                  {BORROWER_TYPE_LABELS[loan.borrowerType]}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {loan.institution || '-'}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-sm font-semibold">
                              {loan.specimenIds.length}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {formatDate(loan.loanDate)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {loan.expectedReturnDate
                              ? formatDate(loan.expectedReturnDate)
                              : '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {loan.actualReturnDate
                              ? formatDate(loan.actualReturnDate)
                              : '-'}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${LOAN_STATUS_COLORS[loan.status]}`}
                            >
                              {LOAN_STATUS_LABELS[loan.status]}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => openLoanDetail(loan)}
                                className="w-8 h-8 rounded-lg hover:bg-blue-50 flex items-center justify-center text-blue-600 hover:text-blue-700 transition-colors"
                                title="查看"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openEditLoan(loan)}
                                className="w-8 h-8 rounded-lg hover:bg-amber-50 flex items-center justify-center text-amber-600 hover:text-amber-700 transition-colors"
                                title="编辑"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              {loan.status === 'on-loan' && (
                                <button
                                  onClick={() => handleMarkReturned(loan)}
                                  className="w-8 h-8 rounded-lg hover:bg-emerald-50 flex items-center justify-center text-emerald-600 hover:text-emerald-700 transition-colors"
                                  title="标记归还"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteLoan(loan)}
                                className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-red-500 hover:text-red-600 transition-colors"
                                title="删除"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {placementFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={closePlacementForm}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
                  {editingPlacement ? (
                    <Edit2 className="w-5 h-5 text-white" />
                  ) : (
                    <Plus className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 font-serif">
                    {editingPlacement ? '编辑陈列' : '安排存放'}
                  </h2>
                  <p className="text-xs text-gray-500">设置标本的陈列信息</p>
                </div>
              </div>
              <button
                onClick={closePlacementForm}
                className="w-9 h-9 rounded-full hover:bg-white/80 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handlePlacementSubmit}
              className="p-6 overflow-y-auto max-h-[calc(90vh-12rem)] space-y-5"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    选择标本 *
                  </label>
                  <select
                    value={placementForm.specimenId}
                    onChange={(e) =>
                      setPlacementForm((f) => ({ ...f, specimenId: e.target.value }))
                    }
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-sm"
                  >
                    <option value="">请选择标本...</option>
                    {specimens.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.specimenNo})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    陈列位置 *
                  </label>
                  <select
                    value={placementForm.locationId}
                    onChange={(e) =>
                      setPlacementForm((f) => ({ ...f, locationId: e.target.value }))
                    }
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-sm"
                  >
                    <option value="">请选择位置...</option>
                    {displayLocations.map((loc) => {
                      const path = getLocationPath(displayLocations, loc.id);
                      return (
                        <option key={loc.id} value={loc.id}>
                          {path.map((p) => p.name).join(' / ')} ({loc.locationCode})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    位置索引
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={placementForm.positionIndex}
                    onChange={(e) =>
                      setPlacementForm((f) => ({
                        ...f,
                        positionIndex: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    展示顺序号
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={placementForm.displayOrder}
                    onChange={(e) =>
                      setPlacementForm((f) => ({
                        ...f,
                        displayOrder: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-sm"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    分类标签
                  </label>
                  <input
                    type="text"
                    value={placementForm.categoryLabel}
                    onChange={(e) =>
                      setPlacementForm((f) => ({
                        ...f,
                        categoryLabel: e.target.value,
                      }))
                    }
                    placeholder="如：硅酸盐矿物-架状硅酸盐"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-sm"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div
                      onClick={() =>
                        setPlacementForm((f) => ({ ...f, onDisplay: !f.onDisplay }))
                      }
                      className={`relative w-12 h-7 rounded-full transition-colors ${
                        placementForm.onDisplay
                          ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                          : 'bg-gray-200'
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${
                          placementForm.onDisplay ? 'translate-x-5' : 'translate-x-0.5'
                        }`}
                      />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        是否在展
                      </span>
                      <p className="text-xs text-gray-400">
                        {placementForm.onDisplay ? '公开对外展示中' : '仅储存未展出'}
                      </p>
                    </div>
                  </label>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    陈列布置说明
                  </label>
                  <textarea
                    rows={3}
                    value={placementForm.arrangementNotes}
                    onChange={(e) =>
                      setPlacementForm((f) => ({
                        ...f,
                        arrangementNotes: e.target.value,
                      }))
                    }
                    placeholder="描述陈列位置、搭配、灯光等布置信息..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-sm resize-none"
                  />
                </div>
              </div>
            </form>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closePlacementForm}
                className="px-5 py-2.5 text-gray-600 bg-white border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handlePlacementSubmit}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg hover:from-amber-600 hover:to-orange-600 transition-all text-sm"
              >
                {editingPlacement ? '保存修改' : '确认安排'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loanFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={closeLoanForm}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-md">
                  {editingLoan ? (
                    <Edit2 className="w-5 h-5 text-white" />
                  ) : (
                    <Plus className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 font-serif">
                    {editingLoan ? '编辑出借' : '新增出借'}
                  </h2>
                  <p className="text-xs text-gray-500">填写出借详细信息</p>
                </div>
              </div>
              <button
                onClick={closeLoanForm}
                className="w-9 h-9 rounded-full hover:bg-white/80 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleLoanSubmit}
              className="p-6 overflow-y-auto max-h-[calc(90vh-12rem)] space-y-6"
            >
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-500" />
                  出借标本 ({loanForm.specimenIds.length} 件已选)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-3 bg-gray-50 rounded-xl border border-gray-100">
                  {specimens.map((spec) => {
                    const checked = loanForm.specimenIds.includes(spec.id);
                    return (
                      <label
                        key={spec.id}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                          checked
                            ? 'bg-blue-100 border border-blue-300'
                            : 'bg-white border border-gray-200 hover:border-blue-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleSpecimenInLoan(spec.id)}
                          className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-gray-800 truncate">
                            {spec.name}
                          </div>
                          <div className="text-[10px] text-gray-400 font-mono truncate">
                            {spec.specimenNo}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  出借方信息
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      出借方类型
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {(Object.keys(BORROWER_TYPE_LABELS) as Array<LoanRecord['borrowerType']>).map((t) => {
                        const BIcon = BORROWER_TYPE_ICONS[t];
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() =>
                              setLoanForm((f) => ({ ...f, borrowerType: t as LoanRecord['borrowerType'] }))
                            }
                            className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl text-xs font-medium border-2 transition-all ${
                              loanForm.borrowerType === t
                                ? 'border-blue-400 bg-blue-50 text-blue-700'
                                : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                            }`}
                          >
                            <BIcon className="w-4 h-4" />
                            {BORROWER_TYPE_LABELS[t]}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      出借方名称 *
                    </label>
                    <input
                      type="text"
                      value={loanForm.borrowerName}
                      onChange={(e) =>
                        setLoanForm((f) => ({ ...f, borrowerName: e.target.value }))
                      }
                      required
                      placeholder="如：上海天文博物馆"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      机构名称
                    </label>
                    <input
                      type="text"
                      value={loanForm.institution}
                      onChange={(e) =>
                        setLoanForm((f) => ({ ...f, institution: e.target.value }))
                      }
                      placeholder="如：上海科技馆分馆"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      联系人
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={loanForm.contactPerson}
                        onChange={(e) =>
                          setLoanForm((f) => ({ ...f, contactPerson: e.target.value }))
                        }
                        placeholder="联系人姓名"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      邮箱
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={loanForm.contactEmail}
                        onChange={(e) =>
                          setLoanForm((f) => ({ ...f, contactEmail: e.target.value }))
                        }
                        placeholder="example@email.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      电话
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        value={loanForm.contactPhone}
                        onChange={(e) =>
                          setLoanForm((f) => ({ ...f, contactPhone: e.target.value }))
                        }
                        placeholder="联系电话"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  日期与状态
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      出借日期 *
                    </label>
                    <input
                      type="date"
                      value={loanForm.loanDate}
                      onChange={(e) =>
                        setLoanForm((f) => ({ ...f, loanDate: e.target.value }))
                      }
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      预计归还日期
                    </label>
                    <input
                      type="date"
                      value={loanForm.expectedReturnDate}
                      onChange={(e) =>
                        setLoanForm((f) => ({ ...f, expectedReturnDate: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                    />
                  </div>
                  {editingLoan && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        实际归还日期
                      </label>
                      <input
                        type="date"
                        value={loanForm.actualReturnDate}
                        onChange={(e) =>
                          setLoanForm((f) => ({ ...f, actualReturnDate: e.target.value }))
                        }
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      状态
                    </label>
                    <select
                      value={loanForm.status}
                      onChange={(e) =>
                        setLoanForm((f) => ({
                          ...f,
                          status: e.target.value as LoanStatus,
                        }))
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                    >
                      {Object.entries(LOAN_STATUS_LABELS).map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {(loanForm.borrowerType === 'museum' || loanForm.borrowerType === 'exhibition') && (
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <Building className="w-4 h-4 text-blue-500" />
                    展览信息
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        展览名称
                      </label>
                      <input
                        type="text"
                        value={loanForm.exhibitionName}
                        onChange={(e) =>
                          setLoanForm((f) => ({ ...f, exhibitionName: e.target.value }))
                        }
                        placeholder="如：天外来客 - 陨石的奥秘特展"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        展览地点
                      </label>
                      <input
                        type="text"
                        value={loanForm.exhibitionLocation}
                        onChange={(e) =>
                          setLoanForm((f) => ({ ...f, exhibitionLocation: e.target.value }))
                        }
                        placeholder="如：上海天文博物馆，第三展厅"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  其他信息
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      出借用途
                    </label>
                    <input
                      type="text"
                      value={loanForm.purpose}
                      onChange={(e) =>
                        setLoanForm((f) => ({ ...f, purpose: e.target.value }))
                      }
                      placeholder="如：临时展览、科学研究等"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      保险金额
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        step="0.01"
                        value={loanForm.insuranceAmount}
                        onChange={(e) =>
                          setLoanForm((f) => ({ ...f, insuranceAmount: e.target.value }))
                        }
                        placeholder="保险金额"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      条件说明
                    </label>
                    <textarea
                      rows={2}
                      value={loanForm.conditions}
                      onChange={(e) =>
                        setLoanForm((f) => ({ ...f, conditions: e.target.value }))
                      }
                      placeholder="描述出借条件、环境要求、安保措施等..."
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm resize-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      备注
                    </label>
                    <textarea
                      rows={2}
                      value={loanForm.notes}
                      onChange={(e) =>
                        setLoanForm((f) => ({ ...f, notes: e.target.value }))
                      }
                      placeholder="其他备注信息..."
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm resize-none"
                    />
                  </div>
                </div>
              </div>
            </form>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeLoanForm}
                className="px-5 py-2.5 text-gray-600 bg-white border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleLoanSubmit}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg hover:from-blue-600 hover:to-indigo-600 transition-all text-sm"
              >
                {editingLoan ? '保存修改' : '确认出借'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loanDetailOpen && viewingLoan && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={() => {
            setLoanDetailOpen(false);
            setViewingLoan(null);
          }}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-md">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 font-serif">出借详情</h2>
                  <p className="text-xs font-mono text-blue-600">{viewingLoan.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${LOAN_STATUS_COLORS[viewingLoan.status]}`}
                >
                  {LOAN_STATUS_LABELS[viewingLoan.status]}
                </span>
                <button
                  onClick={() => {
                    setLoanDetailOpen(false);
                    setViewingLoan(null);
                  }}
                  className="w-9 h-9 rounded-full hover:bg-white/80 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)] space-y-6">
              <div className="flex flex-wrap items-center gap-4">
                {(() => {
                  const BIcon = BORROWER_TYPE_ICONS[viewingLoan.borrowerType];
                  const borrowerBg = BORROWER_TYPE_COLORS[viewingLoan.borrowerType].split(' ')[0];
                  const borrowerText = BORROWER_TYPE_COLORS[viewingLoan.borrowerType].split(' ')[1];
                  return (
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${borrowerBg}`}
                      >
                        <BIcon className={`w-6 h-6 ${borrowerText}`} />
                      </div>
                      <div>
                        <div className="font-bold text-gray-800">
                          {viewingLoan.borrowerName}
                        </div>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${BORROWER_TYPE_COLORS[viewingLoan.borrowerType]}`}
                        >
                          {BORROWER_TYPE_LABELS[viewingLoan.borrowerType]}
                        </span>
                      </div>
                    </div>
                  );
                })()}
                {viewingLoan.institution && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building2 className="w-4 h-4 text-blue-500" />
                    {viewingLoan.institution}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">出借日期</p>
                  <p className="font-semibold text-gray-800">
                    {formatDate(viewingLoan.loanDate)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">预计归还</p>
                  <p className="font-semibold text-gray-800">
                    {viewingLoan.expectedReturnDate
                      ? formatDate(viewingLoan.expectedReturnDate)
                      : '-'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">实际归还</p>
                  <p className="font-semibold text-gray-800">
                    {viewingLoan.actualReturnDate
                      ? formatDate(viewingLoan.actualReturnDate)
                      : '-'}
                  </p>
                </div>
                <div className="bg-indigo-50 rounded-xl p-3">
                  <p className="text-xs text-indigo-500 mb-1">出借标本</p>
                  <p className="font-bold text-indigo-700">
                    {viewingLoan.specimenIds.length} 件
                  </p>
                </div>
              </div>

              {(viewingLoan.contactPerson || viewingLoan.contactEmail || viewingLoan.contactPhone) && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    联系方式
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {viewingLoan.contactPerson && (
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{viewingLoan.contactPerson}</span>
                      </div>
                    )}
                    {viewingLoan.contactEmail && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{viewingLoan.contactEmail}</span>
                      </div>
                    )}
                    {viewingLoan.contactPhone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{viewingLoan.contactPhone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(viewingLoan.exhibitionName || viewingLoan.exhibitionLocation) && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Building className="w-4 h-4 text-blue-500" />
                    展览信息
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {viewingLoan.exhibitionName && (
                      <div className="bg-rose-50 rounded-xl p-3">
                        <p className="text-xs text-rose-500 mb-1">展览名称</p>
                        <p className="font-medium text-rose-800">
                          {viewingLoan.exhibitionName}
                        </p>
                      </div>
                    )}
                    {viewingLoan.exhibitionLocation && (
                      <div className="bg-rose-50 rounded-xl p-3">
                        <p className="text-xs text-rose-500 mb-1">展览地点</p>
                        <p className="font-medium text-rose-800">
                          {viewingLoan.exhibitionLocation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(viewingLoan.purpose || viewingLoan.conditions || viewingLoan.insuranceAmount || viewingLoan.notes) && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    详细信息
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {viewingLoan.purpose && (
                      <div className="bg-gray-50 rounded-xl p-3 md:col-span-2">
                        <p className="text-xs text-gray-500 mb-1">出借用途</p>
                        <p className="font-medium text-gray-700">{viewingLoan.purpose}</p>
                      </div>
                    )}
                    {viewingLoan.insuranceAmount !== undefined && (
                      <div className="bg-emerald-50 rounded-xl p-3">
                        <p className="text-xs text-emerald-500 mb-1">保险金额</p>
                        <p className="font-bold text-emerald-700">
                          ¥ {viewingLoan.insuranceAmount.toLocaleString()}
                        </p>
                      </div>
                    )}
                    {viewingLoan.conditions && (
                      <div className="bg-gray-50 rounded-xl p-3 md:col-span-2">
                        <p className="text-xs text-gray-500 mb-1">条件说明</p>
                        <p className="font-medium text-gray-700 text-sm whitespace-pre-wrap">
                          {viewingLoan.conditions}
                        </p>
                      </div>
                    )}
                    {viewingLoan.notes && (
                      <div className="bg-amber-50 rounded-xl p-3 md:col-span-2">
                        <p className="text-xs text-amber-600 mb-1">备注</p>
                        <p className="font-medium text-amber-800 text-sm whitespace-pre-wrap">
                          {viewingLoan.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-500" />
                  出借标本清单 ({viewingLoan.specimenIds.length} 件)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {viewingLoan.specimenIds.map((sid) => {
                    const spec = getSpecimen(sid);
                    if (!spec) return null;
                    return (
                      <div
                        key={sid}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-white border border-gray-100 flex-shrink-0">
                          {spec.photos[0]?.url ? (
                            <img
                              src={spec.photos[0].url}
                              alt={spec.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Sparkles className="w-5 h-5 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-800 text-sm truncate">
                            {spec.name}
                          </div>
                          <div className="text-xs text-gray-500 font-mono truncate">
                            {spec.specimenNo}
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${SPECIMEN_TYPE_COLORS[spec.type]}`}
                        >
                          {SPECIMEN_TYPE_LABELS[spec.type]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
