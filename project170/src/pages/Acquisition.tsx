import { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  Star,
  Phone,
  Mail,
  MapPin,
  Globe,
  FileText,
  DollarSign,
  TrendingUp,
  Receipt,
  Package,
  Building2,
  User,
  Calendar,
  Tag,
  ArrowUpRight,
  Download,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { formatDate } from '@/utils/dateUtils';
import type { AcquisitionRecord, Supplier, SourceType } from '@/types';
import { SOURCE_TYPE_LABELS, SOURCE_TYPE_COLORS } from '@/types';

type TabType = 'records' | 'suppliers';

const SOURCE_TYPE_FILTERS: Array<{ value: SourceType | 'all'; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'purchase', label: '购买' },
  { value: 'field-collection', label: '野外采集' },
  { value: 'exchange', label: '交换' },
  { value: 'gift', label: '赠送' },
  { value: 'auction', label: '拍卖' },
];

const CURRENCY_OPTIONS = [
  { value: 'CNY', label: '人民币 (CNY)', symbol: '￥' },
  { value: 'USD', label: '美元 (USD)', symbol: '$' },
];

function getCurrencySymbol(currency?: string) {
  return currency === 'USD' ? '$' : '￥';
}

function formatPrice(amount?: number, currency?: string) {
  if (amount === undefined || amount === null) return '-';
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function StarRating({ value, onChange, readonly }: { value: number; onChange?: (v: number) => void; readonly?: boolean }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(n)}
          className={cn(
            'transition-all duration-150',
            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
          )}
        >
          <Star
            className={cn(
              'w-5 h-5',
              n <= value ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
            )}
          />
        </button>
      ))}
    </div>
  );
}

export default function Acquisition() {
  const [activeTab, setActiveTab] = useState<TabType>('records');

  const specimens = useAppStore((s) => s.specimens);
  const suppliers = useAppStore((s) => s.suppliers);
  const acquisitionRecords = useAppStore((s) => s.acquisitionRecords);
  const addSupplier = useAppStore((s) => s.addSupplier);
  const updateSupplier = useAppStore((s) => s.updateSupplier);
  const deleteSupplier = useAppStore((s) => s.deleteSupplier);
  const addAcquisitionRecord = useAppStore((s) => s.addAcquisitionRecord);
  const updateAcquisitionRecord = useAppStore((s) => s.updateAcquisitionRecord);
  const deleteAcquisitionRecord = useAppStore((s) => s.deleteAcquisitionRecord);

  const [recordSearch, setRecordSearch] = useState('');
  const [sourceTypeFilter, setSourceTypeFilter] = useState<SourceType | 'all'>('all');
  const [supplierSearch, setSupplierSearch] = useState('');

  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AcquisitionRecord | null>(null);
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'record' | 'supplier'; id: string; name: string } | null>(null);

  const [recordForm, setRecordForm] = useState<Partial<AcquisitionRecord>>({
    specimenId: '',
    sourceType: 'purchase',
    sourceDate: new Date().toISOString().split('T')[0],
    purchasePrice: undefined,
    currency: 'CNY',
    currentValuation: undefined,
    supplierId: '',
    sellerName: '',
    exchangeWithSpecimenId: '',
    donorName: '',
    auctionHouse: '',
    lotNumber: '',
    notes: '',
    receiptFileId: '',
  });

  const [supplierForm, setSupplierForm] = useState<Partial<Supplier>>({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    reputation: 3,
    notes: '',
  });

  const filteredRecords = useMemo(() => {
    return acquisitionRecords.filter((r) => {
      const spec = specimens.find((s) => s.id === r.specimenId);
      const matchSearch =
        !recordSearch ||
        (spec && (spec.name.includes(recordSearch) || spec.specimenNo.includes(recordSearch))) ||
        (r.sellerName && r.sellerName.includes(recordSearch)) ||
        (r.auctionHouse && r.auctionHouse.includes(recordSearch)) ||
        (r.donorName && r.donorName.includes(recordSearch));
      const matchType = sourceTypeFilter === 'all' || r.sourceType === sourceTypeFilter;
      return matchSearch && matchType;
    });
  }, [acquisitionRecords, specimens, recordSearch, sourceTypeFilter]);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(
      (s) =>
        !supplierSearch ||
        s.name.includes(supplierSearch) ||
        (s.contactPerson && s.contactPerson.includes(supplierSearch)) ||
        (s.email && s.email.includes(supplierSearch))
    );
  }, [suppliers, supplierSearch]);

  const stats = useMemo(() => {
    let totalCostCNY = 0;
    let totalCostUSD = 0;
    let totalValueCNY = 0;
    let totalValueUSD = 0;
    let countValued = 0;

    acquisitionRecords.forEach((r) => {
      if (r.purchasePrice) {
        if (r.currency === 'USD') totalCostUSD += r.purchasePrice;
        else totalCostCNY += r.purchasePrice;
      }
      if (r.currentValuation && r.purchasePrice) {
        if (r.currency === 'USD') totalValueUSD += r.currentValuation;
        else totalValueCNY += r.currentValuation;
        countValued++;
      }
    });

    const profitCNY = totalValueCNY - totalCostCNY;
    const profitUSD = totalValueUSD - totalCostUSD;
    const avgGrowthRate = useMemo(() => {
      let totalRate = 0;
      let cnt = 0;
      acquisitionRecords.forEach((r) => {
        if (r.purchasePrice && r.currentValuation && r.purchasePrice > 0) {
          totalRate += ((r.currentValuation - r.purchasePrice) / r.purchasePrice) * 100;
          cnt++;
        }
      });
      return cnt > 0 ? totalRate / cnt : 0;
    }, [acquisitionRecords]);

    return {
      totalCostCNY,
      totalCostUSD,
      totalValueCNY,
      totalValueUSD,
      profitCNY,
      profitUSD,
      avgGrowthRate,
      countValued,
    };
  }, [acquisitionRecords]);

  function openRecordModal(record?: AcquisitionRecord) {
    if (record) {
      setEditingRecord(record);
      setRecordForm({ ...record });
    } else {
      setEditingRecord(null);
      setRecordForm({
        specimenId: '',
        sourceType: 'purchase',
        sourceDate: new Date().toISOString().split('T')[0],
        purchasePrice: undefined,
        currency: 'CNY',
        currentValuation: undefined,
        supplierId: '',
        sellerName: '',
        exchangeWithSpecimenId: '',
        donorName: '',
        auctionHouse: '',
        lotNumber: '',
        notes: '',
        receiptFileId: '',
      });
    }
    setRecordModalOpen(true);
  }

  function openSupplierModal(supplier?: Supplier) {
    if (supplier) {
      setEditingSupplier(supplier);
      setSupplierForm({ ...supplier });
    } else {
      setEditingSupplier(null);
      setSupplierForm({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        website: '',
        reputation: 3,
        notes: '',
      });
    }
    setSupplierModalOpen(true);
  }

  function handleSaveRecord() {
    if (!recordForm.specimenId || !recordForm.sourceType || !recordForm.sourceDate) return;
    if (editingRecord) {
      updateAcquisitionRecord(editingRecord.id, recordForm);
    } else {
      addAcquisitionRecord(recordForm as Omit<AcquisitionRecord, 'id' | 'createdAt' | 'updatedAt'>);
    }
    setRecordModalOpen(false);
  }

  function handleSaveSupplier() {
    if (!supplierForm.name) return;
    if (editingSupplier) {
      updateSupplier(editingSupplier.id, supplierForm);
    } else {
      addSupplier(supplierForm as Omit<Supplier, 'id' | 'createdAt'>);
    }
    setSupplierModalOpen(false);
  }

  function handleDeleteConfirm() {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'record') {
      deleteAcquisitionRecord(deleteConfirm.id);
    } else {
      deleteSupplier(deleteConfirm.id);
    }
    setDeleteConfirm(null);
  }

  function getSupplierRecordCount(supplierId: string) {
    return acquisitionRecords.filter((r) => r.supplierId === supplierId).length;
  }

  function getSourcePartyName(record: AcquisitionRecord) {
    switch (record.sourceType) {
      case 'purchase':
        if (record.supplierId) {
          return suppliers.find((s) => s.id === record.supplierId)?.name || '-';
        }
        return record.sellerName || '-';
      case 'auction':
        return record.auctionHouse ? `${record.auctionHouse}${record.lotNumber ? ` (${record.lotNumber})` : ''}` : '-';
      case 'exchange':
        if (record.exchangeWithSpecimenId) {
          const es = specimens.find((s) => s.id === record.exchangeWithSpecimenId);
          return es ? `交换: ${es.name}` : '-';
        }
        return '-';
      case 'gift':
        return record.donorName || '-';
      case 'field-collection':
        return record.donorName || '自行采集';
      default:
        return '-';
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl p-5 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 border border-amber-200/60 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-amber-700/80">总购入成本</span>
            <div className="p-2 rounded-lg bg-white/60">
              <DollarSign className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold font-serif text-amber-900">
              ￥{stats.totalCostCNY.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}
            </p>
            {stats.totalCostUSD > 0 && (
              <p className="text-sm text-amber-700/70">
                ${stats.totalCostUSD.toLocaleString('zh-CN', { maximumFractionDigits: 0 })} USD
              </p>
            )}
          </div>
        </div>

        <div className="rounded-xl p-5 bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 border border-emerald-200/60 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-emerald-700/80">总当前估值</span>
            <div className="p-2 rounded-lg bg-white/60">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold font-serif text-emerald-900">
              ￥{stats.totalValueCNY.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}
            </p>
            {stats.totalValueUSD > 0 && (
              <p className="text-sm text-emerald-700/70">
                ${stats.totalValueUSD.toLocaleString('zh-CN', { maximumFractionDigits: 0 })} USD
              </p>
            )}
          </div>
        </div>

        <div className="rounded-xl p-5 bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 border border-rose-200/60 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-rose-700/80">总收益/增值</span>
            <div className="p-2 rounded-lg bg-white/60">
              <ArrowUpRight className="w-4 h-4 text-rose-600" />
            </div>
          </div>
          <div className="space-y-1">
            <p className={cn(
              'text-2xl font-bold font-serif',
              stats.profitCNY >= 0 ? 'text-emerald-700' : 'text-rose-700'
            )}>
              {stats.profitCNY >= 0 ? '+' : ''}￥{stats.profitCNY.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}
            </p>
            {stats.profitUSD !== 0 && (
              <p className={cn(
                'text-sm',
                stats.profitUSD >= 0 ? 'text-emerald-700/70' : 'text-rose-700/70'
              )}>
                {stats.profitUSD >= 0 ? '+' : ''}${stats.profitUSD.toLocaleString('zh-CN', { maximumFractionDigits: 0 })} USD
              </p>
            )}
          </div>
        </div>

        <div className="rounded-xl p-5 bg-gradient-to-br from-sky-50 via-blue-50 to-sky-100 border border-sky-200/60 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-sky-700/80">平均增值率</span>
            <div className="p-2 rounded-lg bg-white/60">
              <Tag className="w-4 h-4 text-sky-600" />
            </div>
          </div>
          <div className="space-y-1">
            <p className={cn(
              'text-2xl font-bold font-serif',
              stats.avgGrowthRate >= 0 ? 'text-emerald-700' : 'text-rose-700'
            )}>
              {stats.avgGrowthRate >= 0 ? '+' : ''}{stats.avgGrowthRate.toFixed(1)}%
            </p>
            <p className="text-sm text-sky-700/70">
              基于 {stats.countValued} 条有效记录
            </p>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-gray-100 px-6 pt-4">
          <div className="flex items-center gap-1 -mb-px">
            <button
              onClick={() => setActiveTab('records')}
              className={cn(
                'px-5 py-3 text-sm font-medium transition-all duration-200 relative',
                activeTab === 'records'
                  ? 'text-amber-800'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'
              )}
            >
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4" />
                <span>来源记录</span>
                <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                  {acquisitionRecords.length}
                </span>
              </div>
              {activeTab === 'records' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('suppliers')}
              className={cn(
                'px-5 py-3 text-sm font-medium transition-all duration-200 relative',
                activeTab === 'suppliers'
                  ? 'text-amber-800'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'
              )}
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>供应商管理</span>
                <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                  {suppliers.length}
                </span>
              </div>
              {activeTab === 'suppliers' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-t-full" />
              )}
            </button>
          </div>
        </div>

        {activeTab === 'records' && (
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
              <h2 className="page-title flex items-center gap-2">
                <Package className="w-6 h-6 text-amber-600" />
                来源记录管理
              </h2>
              <div className="flex-1 flex flex-col sm:flex-row gap-3 lg:justify-end">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="搜索标本名称/编号/卖方..."
                    value={recordSearch}
                    onChange={(e) => setRecordSearch(e.target.value)}
                    className="input pl-10 w-full sm:w-64"
                  />
                </div>
                <select
                  value={sourceTypeFilter}
                  onChange={(e) => setSourceTypeFilter(e.target.value as SourceType | 'all')}
                  className="input w-full sm:w-auto"
                >
                  {SOURCE_TYPE_FILTERS.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
                <button onClick={() => openRecordModal()} className="btn-primary whitespace-nowrap">
                  <Plus className="w-4 h-4" />
                  新增记录
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="bg-gradient-to-r from-amber-50/80 to-orange-50/80 border-b border-gray-100">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">标本信息</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">来源类型</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">来源日期</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">购入价格</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">当前估值</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">供应商/卖方</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-16 text-center">
                        <div className="flex flex-col items-center gap-2 text-gray-400">
                          <Package className="w-12 h-12 opacity-40" />
                          <p className="text-sm">暂无来源记录</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((r) => {
                      const spec = specimens.find((s) => s.id === r.specimenId);
                      const photo = spec?.photos.find((p) => p.isPrimary) || spec?.photos[0];
                      const hasProfit = r.currentValuation && r.purchasePrice && r.currentValuation > r.purchasePrice;
                      return (
                        <tr key={r.id} className="hover:bg-amber-50/30 transition-colors duration-150">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                                {photo ? (
                                  <img src={photo.url} alt={spec?.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package className="w-5 h-5 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate max-w-[180px]">{spec?.name || '-'}</p>
                                <p className="text-xs text-gray-500 truncate max-w-[180px]">{spec?.specimenNo || '-'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn('badge', SOURCE_TYPE_COLORS[r.sourceType])}>
                              {SOURCE_TYPE_LABELS[r.sourceType]}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              {formatDate(r.sourceDate)}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm font-medium text-gray-700">
                              {formatPrice(r.purchasePrice, r.currency)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn(
                              'text-sm font-semibold',
                              hasProfit ? 'text-emerald-600' : 'text-gray-700'
                            )}>
                              {formatPrice(r.currentValuation, r.currency)}
                              {hasProfit && r.purchasePrice && r.currentValuation && (
                                <span className="ml-1 text-xs font-normal text-emerald-500">
                                  ↑{(((r.currentValuation - r.purchasePrice) / r.purchasePrice) * 100).toFixed(1)}%
                                </span>
                              )}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-gray-700 max-w-[180px] truncate inline-block">
                              {getSourcePartyName(r)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => openRecordModal(r)}
                                className="p-2 rounded-lg text-gray-500 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                                title="编辑"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm({ type: 'record', id: r.id, name: spec?.name || '记录' })}
                                className="p-2 rounded-lg text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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

        {activeTab === 'suppliers' && (
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
              <h2 className="page-title flex items-center gap-2">
                <Building2 className="w-6 h-6 text-amber-600" />
                供应商管理
              </h2>
              <div className="flex-1 flex flex-col sm:flex-row gap-3 lg:justify-end">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="搜索供应商名称/联系人/邮箱..."
                    value={supplierSearch}
                    onChange={(e) => setSupplierSearch(e.target.value)}
                    className="input pl-10 w-full sm:w-72"
                  />
                </div>
                <button onClick={() => openSupplierModal()} className="btn-primary whitespace-nowrap">
                  <Plus className="w-4 h-4" />
                  新增供应商
                </button>
              </div>
            </div>

            {filteredSuppliers.length === 0 ? (
              <div className="py-20 flex flex-col items-center gap-3 text-gray-400">
                <Building2 className="w-16 h-16 opacity-30" />
                <p className="text-sm">暂无供应商数据</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 stagger-animation">
                {filteredSuppliers.map((sup) => {
                  const recordCount = getSupplierRecordCount(sup.id);
                  return (
                    <div
                      key={sup.id}
                      className="card card-hover p-5 group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-md flex-shrink-0">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate" title={sup.name}>
                              {sup.name}
                            </h3>
                            <StarRating value={sup.reputation} readonly />
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openSupplierModal(sup)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                            title="编辑"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm({ type: 'supplier', id: sup.id, name: sup.name })}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2.5 mb-4">
                        {sup.contactPerson && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{sup.contactPerson}</span>
                          </div>
                        )}
                        {sup.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{sup.phone}</span>
                          </div>
                        )}
                        {sup.email && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{sup.email}</span>
                          </div>
                        )}
                        {sup.address && (
                          <div className="flex items-start gap-2 text-sm text-gray-600">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{sup.address}</span>
                          </div>
                        )}
                        {sup.website && (
                          <div className="flex items-center gap-2 text-sm">
                            <Globe className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            <a
                              href={sup.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-amber-600 hover:text-amber-700 hover:underline truncate"
                            >
                              {sup.website.replace(/^https?:\/\//, '')}
                            </a>
                          </div>
                        )}
                      </div>

                      {sup.notes && (
                        <div className="mb-4 p-3 rounded-lg bg-amber-50/60 border border-amber-100/60">
                          <p className="text-xs text-gray-600 line-clamp-2">{sup.notes}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                            <Receipt className="w-3 h-3 text-amber-600" />
                          </div>
                          <span className="text-xs text-gray-500">
                            相关记录 <span className="font-semibold text-amber-700">{recordCount}</span> 条
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {formatDate(sup.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {recordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setRecordModalOpen(false)} />
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-card-hover animate-fade-in-up scrollbar-thin">
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-gray-100 rounded-t-2xl">
              <h3 className="font-serif text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-600" />
                {editingRecord ? '编辑来源记录' : '新增来源记录'}
              </h3>
              <button
                onClick={() => setRecordModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="label">
                    <Package className="w-3.5 h-3.5 inline mr-1" />
                    选择标本 <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={recordForm.specimenId || ''}
                    onChange={(e) => setRecordForm({ ...recordForm, specimenId: e.target.value })}
                    className="input"
                  >
                    <option value="">请选择标本...</option>
                    {specimens.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.specimenNo})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">
                    <Tag className="w-3.5 h-3.5 inline mr-1" />
                    来源类型 <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={recordForm.sourceType || 'purchase'}
                    onChange={(e) => setRecordForm({ ...recordForm, sourceType: e.target.value as SourceType })}
                    className="input"
                  >
                    {Object.entries(SOURCE_TYPE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">
                    <Calendar className="w-3.5 h-3.5 inline mr-1" />
                    来源日期 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={recordForm.sourceDate || ''}
                    onChange={(e) => setRecordForm({ ...recordForm, sourceDate: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              {(recordForm.sourceType === 'purchase' || recordForm.sourceType === 'auction') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">
                      <DollarSign className="w-3.5 h-3.5 inline mr-1" />
                      购入价格
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={recordForm.purchasePrice ?? ''}
                      onChange={(e) => setRecordForm({ ...recordForm, purchasePrice: e.target.value ? Number(e.target.value) : undefined })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">币种</label>
                    <select
                      value={recordForm.currency || 'CNY'}
                      onChange={(e) => setRecordForm({ ...recordForm, currency: e.target.value })}
                      className="input"
                    >
                      {CURRENCY_OPTIONS.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {recordForm.sourceType !== 'field-collection' && (
                <div>
                  <label className="label">
                    <TrendingUp className="w-3.5 h-3.5 inline mr-1" />
                    当前估值
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={recordForm.currentValuation ?? ''}
                    onChange={(e) => setRecordForm({ ...recordForm, currentValuation: e.target.value ? Number(e.target.value) : undefined })}
                    className="input"
                  />
                </div>
              )}

              <div className="pt-3 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-amber-600" />
                  来源方信息
                </p>

                {recordForm.sourceType === 'purchase' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">选择供应商</label>
                      <select
                        value={recordForm.supplierId || ''}
                        onChange={(e) => setRecordForm({ ...recordForm, supplierId: e.target.value })}
                        className="input"
                      >
                        <option value="">-- 从供应商列表选择 --</option>
                        {suppliers.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label">或填写卖方名称</label>
                      <input
                        type="text"
                        placeholder="个人卖方姓名..."
                        value={recordForm.sellerName || ''}
                        onChange={(e) => setRecordForm({ ...recordForm, sellerName: e.target.value })}
                        className="input"
                      />
                    </div>
                  </div>
                )}

                {recordForm.sourceType === 'auction' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">拍卖行</label>
                      <input
                        type="text"
                        placeholder="拍卖行名称..."
                        value={recordForm.auctionHouse || ''}
                        onChange={(e) => setRecordForm({ ...recordForm, auctionHouse: e.target.value })}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="label">批号</label>
                      <input
                        type="text"
                        placeholder="LOT 编号..."
                        value={recordForm.lotNumber || ''}
                        onChange={(e) => setRecordForm({ ...recordForm, lotNumber: e.target.value })}
                        className="input"
                      />
                    </div>
                  </div>
                )}

                {recordForm.sourceType === 'exchange' && (
                  <div>
                    <label className="label">交换标本</label>
                    <select
                      value={recordForm.exchangeWithSpecimenId || ''}
                      onChange={(e) => setRecordForm({ ...recordForm, exchangeWithSpecimenId: e.target.value })}
                      className="input"
                    >
                      <option value="">请选择用于交换的对方标本...</option>
                      {specimens.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.specimenNo})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {recordForm.sourceType === 'gift' && (
                  <div>
                    <label className="label">赠送者</label>
                    <input
                      type="text"
                      placeholder="赠送者姓名或机构..."
                      value={recordForm.donorName || ''}
                      onChange={(e) => setRecordForm({ ...recordForm, donorName: e.target.value })}
                      className="input"
                    />
                  </div>
                )}

                {recordForm.sourceType === 'field-collection' && (
                  <div>
                    <label className="label">采集团队/协助方（可选）</label>
                    <input
                      type="text"
                      placeholder="协助采集的团队或机构..."
                      value={recordForm.donorName || ''}
                      onChange={(e) => setRecordForm({ ...recordForm, donorName: e.target.value })}
                      className="input"
                    />
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-gray-100">
                <label className="label">
                  <FileText className="w-3.5 h-3.5 inline mr-1" />
                  备注
                </label>
                <textarea
                  rows={3}
                  placeholder="记录相关备注信息..."
                  value={recordForm.notes || ''}
                  onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
                  className="input resize-none"
                />
              </div>

              <div>
                <label className="label">
                  <Download className="w-3.5 h-3.5 inline mr-1" />
                  发票/收据（文件引用）
                </label>
                <input
                  type="text"
                  placeholder="输入发票编号或文件存储路径..."
                  value={recordForm.receiptFileId || ''}
                  onChange={(e) => setRecordForm({ ...recordForm, receiptFileId: e.target.value })}
                  className="input"
                />
              </div>
            </div>
            <div className="sticky bottom-0 px-6 py-4 bg-white border-t border-gray-100 rounded-b-2xl flex items-center justify-end gap-3">
              <button onClick={() => setRecordModalOpen(false)} className="btn-secondary">
                取消
              </button>
              <button
                onClick={handleSaveRecord}
                disabled={!recordForm.specimenId || !recordForm.sourceType || !recordForm.sourceDate}
                className="btn-primary"
              >
                {editingRecord ? '保存修改' : '确认新增'}
              </button>
            </div>
          </div>
        </div>
      )}

      {supplierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSupplierModalOpen(false)} />
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-card-hover animate-fade-in-up scrollbar-thin">
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-gray-100 rounded-t-2xl">
              <h3 className="font-serif text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-600" />
                {editingSupplier ? '编辑供应商' : '新增供应商'}
              </h3>
              <button
                onClick={() => setSupplierModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="label">
                    <Building2 className="w-3.5 h-3.5 inline mr-1" />
                    供应商名称 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="请输入供应商名称..."
                    value={supplierForm.name || ''}
                    onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">
                    <User className="w-3.5 h-3.5 inline mr-1" />
                    联系人
                  </label>
                  <input
                    type="text"
                    placeholder="联系人姓名..."
                    value={supplierForm.contactPerson || ''}
                    onChange={(e) => setSupplierForm({ ...supplierForm, contactPerson: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">
                    <Star className="w-3.5 h-3.5 inline mr-1" />
                    信誉评级
                  </label>
                  <div className="pt-1.5">
                    <StarRating
                      value={supplierForm.reputation || 3}
                      onChange={(v) => setSupplierForm({ ...supplierForm, reputation: v })}
                    />
                  </div>
                </div>
                <div>
                  <label className="label">
                    <Phone className="w-3.5 h-3.5 inline mr-1" />
                    联系电话
                  </label>
                  <input
                    type="text"
                    placeholder="电话号码..."
                    value={supplierForm.phone || ''}
                    onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">
                    <Mail className="w-3.5 h-3.5 inline mr-1" />
                    电子邮箱
                  </label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={supplierForm.email || ''}
                    onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                    className="input"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">
                    <MapPin className="w-3.5 h-3.5 inline mr-1" />
                    地址
                  </label>
                  <input
                    type="text"
                    placeholder="详细地址..."
                    value={supplierForm.address || ''}
                    onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
                    className="input"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">
                    <Globe className="w-3.5 h-3.5 inline mr-1" />
                    网站
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={supplierForm.website || ''}
                    onChange={(e) => setSupplierForm({ ...supplierForm, website: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="label">
                  <FileText className="w-3.5 h-3.5 inline mr-1" />
                  备注
                </label>
                <textarea
                  rows={3}
                  placeholder="供应商相关备注..."
                  value={supplierForm.notes || ''}
                  onChange={(e) => setSupplierForm({ ...supplierForm, notes: e.target.value })}
                  className="input resize-none"
                />
              </div>
            </div>
            <div className="sticky bottom-0 px-6 py-4 bg-white border-t border-gray-100 rounded-b-2xl flex items-center justify-end gap-3">
              <button onClick={() => setSupplierModalOpen(false)} className="btn-secondary">
                取消
              </button>
              <button
                onClick={handleSaveSupplier}
                disabled={!supplierForm.name}
                className="btn-primary"
              >
                {editingSupplier ? '保存修改' : '确认新增'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-white shadow-card-hover animate-fade-in-up overflow-hidden">
            <div className="px-6 pt-6 pb-4">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-rose-100 flex items-center justify-center">
                <Trash2 className="w-7 h-7 text-rose-600" />
              </div>
              <h3 className="text-center font-serif text-lg font-semibold text-gray-900 mb-2">确认删除</h3>
              <p className="text-center text-sm text-gray-500">
                确定要删除 <span className="font-semibold text-rose-600">「{deleteConfirm.name}」</span> 吗？
                <br />
                <span className="text-xs text-gray-400 mt-1 block">此操作不可撤销</span>
              </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1">
                取消
              </button>
              <button onClick={handleDeleteConfirm} className="btn-danger flex-1">
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
