import { useState, useEffect, useMemo } from 'react';
import { Plus, RefreshCw, Edit2, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { usePortfolioStore } from '../../store/usePortfolioStore';
import { formatCurrency, formatPercent, getColorClass } from '../../utils/calculations';
import { mockStocks } from '../../data/mockData';
import type { Holding } from '../../types';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Empty from '../../components/Empty';

type SortField = 'marketValue' | 'profitLossRate' | 'profitLoss' | 'quantity' | 'proportion';
type SortOrder = 'asc' | 'desc';

interface FormData {
  stockCode: string;
  quantity: string;
  avgCost: string;
  buyDate: string;
  notes: string;
}

interface FormErrors {
  stockCode?: string;
  quantity?: string;
  avgCost?: string;
  buyDate?: string;
}

const initialFormData: FormData = {
  stockCode: '',
  quantity: '',
  avgCost: '',
  buyDate: new Date().toISOString().split('T')[0],
  notes: '',
};

export default function Portfolio() {
  const {
    holdings,
    stocks,
    isLoading,
    lastUpdateTime,
    getHoldingsWithMetrics,
    addHolding,
    updateHolding,
    deleteHolding,
    refreshPrices,
    initializeWithMockData,
  } = usePortfolioStore();

  useEffect(() => {
    if (holdings.length === 0) {
      initializeWithMockData();
    }
  }, [holdings.length, initializeWithMockData]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHolding, setEditingHolding] = useState<Holding | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [sortField, setSortField] = useState<SortField>('marketValue');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const holdingsWithMetrics = useMemo(() => {
    const data = getHoldingsWithMetrics();
    return [...data].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'marketValue':
          comparison = a.metrics.marketValue - b.metrics.marketValue;
          break;
        case 'profitLossRate':
          comparison = a.metrics.profitLossRate - b.metrics.profitLossRate;
          break;
        case 'profitLoss':
          comparison = a.metrics.profitLoss - b.metrics.profitLoss;
          break;
        case 'quantity':
          comparison = a.quantity - b.quantity;
          break;
        case 'proportion':
          comparison = a.metrics.proportion - b.metrics.proportion;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [holdings, stocks, getHoldingsWithMetrics, sortField, sortOrder]);

  const availableStocks = useMemo(() => {
    const heldCodes = new Set(holdings.map(h => h.stockCode));
    return stocks.filter(s => !heldCodes.has(s.code));
  }, [holdings, stocks]);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.stockCode) {
      errors.stockCode = '请选择股票';
    }

    const quantity = parseFloat(formData.quantity);
    if (!formData.quantity || isNaN(quantity) || quantity <= 0) {
      errors.quantity = '请输入有效的数量';
    }

    const avgCost = parseFloat(formData.avgCost);
    if (!formData.avgCost || isNaN(avgCost) || avgCost <= 0) {
      errors.avgCost = '请输入有效的价格';
    }

    if (!formData.buyDate) {
      errors.buyDate = '请选择买入日期';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleAddClick = () => {
    setEditingHolding(null);
    setFormData(initialFormData);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleEditClick = (holding: Holding) => {
    setEditingHolding(holding);
    setFormData({
      stockCode: holding.stockCode,
      quantity: holding.quantity.toString(),
      avgCost: holding.avgCost.toString(),
      buyDate: holding.buyDate,
      notes: holding.notes || '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      deleteHolding(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const holdingData = {
      stockCode: formData.stockCode,
      quantity: parseFloat(formData.quantity),
      avgCost: parseFloat(formData.avgCost),
      buyDate: formData.buyDate,
      notes: formData.notes || undefined,
    };

    if (editingHolding) {
      updateHolding(editingHolding.id, holdingData);
    } else {
      addHolding(holdingData);
    }

    setIsModalOpen(false);
    setFormData(initialFormData);
    setEditingHolding(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(initialFormData);
    setEditingHolding(null);
    setFormErrors({});
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 opacity-50" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-4 h-4 text-primary" />
    ) : (
      <ArrowDown className="w-4 h-4 text-primary" />
    );
  };

  const stockOptions = editingHolding
    ? stocks.filter(s => s.code === editingHolding.stockCode)
    : availableStocks.length > 0
    ? availableStocks
    : mockStocks;

  return (
    <div className="space-y-6">
      <PageHeader
        title="持仓管理"
        description="管理您的股票持仓，追踪持仓明细和盈亏状况"
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => refreshPrices()}
              loading={isLoading}
              icon={<RefreshCw className="w-4 h-4" />}
            >
              {lastUpdateTime
                ? `更新于 ${new Date(lastUpdateTime).toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}`
                : '刷新行情'}
            </Button>
            <Button variant="primary" onClick={handleAddClick} icon={<Plus className="w-4 h-4" />}>
              添加持仓
            </Button>
          </>
        }
      />

      {holdingsWithMetrics.length === 0 ? (
        <Empty
          title="暂无持仓"
          description="点击上方按钮添加您的第一笔持仓"
          icon={<Plus className="w-8 h-8 text-text-muted" />}
          action={
            <Button variant="primary" onClick={handleAddClick} icon={<Plus className="w-4 h-4" />}>
              添加持仓
            </Button>
          }
        />
      ) : (
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <div className="max-h-[600px] overflow-y-auto">
              <table className="w-full table-zebra">
                <thead className="sticky top-0 bg-surface border-b border-border z-10">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary whitespace-nowrap">
                      股票代码
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary whitespace-nowrap">
                      名称
                    </th>
                    <th
                      className="px-4 py-3 text-right text-sm font-semibold text-text-primary whitespace-nowrap cursor-pointer hover:text-primary transition-colors"
                      onClick={() => handleSort('quantity')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        持有数量
                        <SortIcon field="quantity" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-text-primary whitespace-nowrap">
                      买入均价
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-text-primary whitespace-nowrap">
                      买入日期
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-text-primary whitespace-nowrap">
                      当前价格
                    </th>
                    <th
                      className="px-4 py-3 text-right text-sm font-semibold text-text-primary whitespace-nowrap cursor-pointer hover:text-primary transition-colors"
                      onClick={() => handleSort('marketValue')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        市值
                        <SortIcon field="marketValue" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-text-primary whitespace-nowrap">
                      成本
                    </th>
                    <th
                      className="px-4 py-3 text-right text-sm font-semibold text-text-primary whitespace-nowrap cursor-pointer hover:text-primary transition-colors"
                      onClick={() => handleSort('profitLoss')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        盈亏金额
                        <SortIcon field="profitLoss" />
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-right text-sm font-semibold text-text-primary whitespace-nowrap cursor-pointer hover:text-primary transition-colors"
                      onClick={() => handleSort('profitLossRate')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        盈亏率
                        <SortIcon field="profitLossRate" />
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-right text-sm font-semibold text-text-primary whitespace-nowrap cursor-pointer hover:text-primary transition-colors"
                      onClick={() => handleSort('proportion')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        占比
                        <SortIcon field="proportion" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-text-primary whitespace-nowrap">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {holdingsWithMetrics.map((holding) => (
                    <tr
                      key={holding.id}
                      className="border-b border-border/50 hover:bg-surface-hover/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-text-secondary font-mono">
                        {holding.stockCode}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-primary font-medium">
                        {holding.stock?.name || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-primary text-right font-mono">
                        {holding.quantity.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-primary text-right font-mono">
                        {formatCurrency(holding.avgCost)}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary text-right">
                        {holding.buyDate}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-mono">
                        <span className={getColorClass(holding.stock?.priceChange || 0)}>
                          {formatCurrency(holding.stock?.currentPrice || holding.avgCost)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-primary text-right font-mono font-medium">
                        {formatCurrency(holding.metrics.marketValue)}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary text-right font-mono">
                        {formatCurrency(holding.metrics.costValue)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-mono font-medium">
                        <span className={getColorClass(holding.metrics.profitLoss)}>
                          {holding.metrics.profitLoss >= 0 ? '+' : ''}
                          {formatCurrency(holding.metrics.profitLoss)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-mono font-medium">
                        <span className={getColorClass(holding.metrics.profitLossRate)}>
                          {formatPercent(holding.metrics.profitLossRate)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-primary text-right font-mono">
                        {holding.metrics.proportion.toFixed(2)}%
                      </td>
                      <td className="px-4 py-3 text-sm text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(holding)}
                            icon={<Edit2 className="w-4 h-4" />}
                            className="px-2 py-1"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(holding.id)}
                            icon={<Trash2 className="w-4 h-4" />}
                            className="px-2 py-1 hover:text-down hover:bg-down/10"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingHolding ? '编辑持仓' : '添加持仓'}
        size="md"
      >
        <div className="space-y-5">
          <Select
            label="股票代码"
            value={formData.stockCode}
            onChange={(e) => {
              setFormData({ ...formData, stockCode: e.target.value });
              if (formErrors.stockCode) {
                setFormErrors({ ...formErrors, stockCode: undefined });
              }
            }}
            error={formErrors.stockCode}
            disabled={!!editingHolding}
          >
            <option value="">请选择股票</option>
            {stockOptions.map((stock) => (
              <option key={stock.code} value={stock.code}>
                {stock.code} - {stock.name}
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="持有数量"
              type="number"
              value={formData.quantity}
              onChange={(e) => {
                setFormData({ ...formData, quantity: e.target.value });
                if (formErrors.quantity) {
                  setFormErrors({ ...formErrors, quantity: undefined });
                }
              }}
              error={formErrors.quantity}
              placeholder="请输入数量"
              min="1"
              step="1"
            />
            <Input
              label="买入均价"
              type="number"
              value={formData.avgCost}
              onChange={(e) => {
                setFormData({ ...formData, avgCost: e.target.value });
                if (formErrors.avgCost) {
                  setFormErrors({ ...formErrors, avgCost: undefined });
                }
              }}
              error={formErrors.avgCost}
              placeholder="请输入价格"
              min="0.01"
              step="0.01"
            />
          </div>

          <Input
            label="买入日期"
            type="date"
            value={formData.buyDate}
            onChange={(e) => {
              setFormData({ ...formData, buyDate: e.target.value });
              if (formErrors.buyDate) {
                setFormErrors({ ...formErrors, buyDate: undefined });
              }
            }}
            error={formErrors.buyDate}
          />

          <Textarea
            label="备注（可选）"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="添加持仓备注..."
            rows={3}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button variant="secondary" onClick={handleCloseModal}>
              取消
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              {editingHolding ? '保存修改' : '添加持仓'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="确认删除"
        size="sm"
      >
        <div className="space-y-6">
          <p className="text-text-secondary">
            确定要删除这笔持仓吗？此操作无法撤销。
          </p>
          <div className="flex items-center justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeleteConfirmId(null)}>
              取消
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              确认删除
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
