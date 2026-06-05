import { useState, useEffect } from 'react';
import { Plus, ChevronDown, ChevronUp, Edit2, Check, X, TrendingUp, TrendingDown } from 'lucide-react';
import { usePortfolioStore } from '../../store/usePortfolioStore';
import { formatCurrency, formatNumber } from '../../utils/calculations';
import type { Transaction, TransactionType } from '../../types';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';


export default function Transactions() {
  const { transactions, stocks, addTransaction, updateTransaction, getStock, initializeWithMockData } = usePortfolioStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editReview, setEditReview] = useState('');

  const [formData, setFormData] = useState({
    stockCode: '',
    type: 'BUY' as TransactionType,
    date: new Date().toISOString().split('T')[0],
    price: '',
    quantity: '',
    fee: '',
    decisionReason: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (stocks.length === 0) {
      initializeWithMockData();
    }
  }, [stocks.length, initializeWithMockData]);

  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const calculateAmount = (price: number, quantity: number, fee: number, type: TransactionType) => {
    const base = price * quantity;
    return type === 'BUY' ? base + fee : base - fee;
  };

  const handleAddTransaction = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.stockCode.trim()) {
      newErrors.stockCode = '请输入股票代码';
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = '请输入有效价格';
    }
    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      newErrors.quantity = '请输入有效数量';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    addTransaction({
      stockCode: formData.stockCode.trim(),
      type: formData.type,
      date: formData.date,
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity),
      fee: parseFloat(formData.fee) || 0,
      decisionReason: formData.decisionReason.trim() || undefined,
    });

    setFormData({
      stockCode: '',
      type: 'BUY',
      date: new Date().toISOString().split('T')[0],
      price: '',
      quantity: '',
      fee: '',
      decisionReason: '',
    });
    setIsModalOpen(false);
  };

  const handleEditReview = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setEditReview(transaction.review || '');
  };

  const handleSaveReview = (id: string) => {
    updateTransaction(id, { review: editReview.trim() || undefined });
    setEditingId(null);
    setEditReview('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditReview('');
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="交易记录"
        description="记录和管理所有股票交易记录，包括买入、卖出操作"
        actions={
          <Button
            variant="primary"
            onClick={() => setIsModalOpen(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            添加交易
          </Button>
        }
      />

      {sortedTransactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-surface rounded-xl border border-border">
          <TrendingUp className="w-16 h-16 text-text-muted mb-4" />
          <h3 className="text-xl font-semibold text-text-primary mb-2">暂无交易记录</h3>
          <p className="text-text-muted mb-6">点击上方按钮添加您的第一笔交易记录</p>
          <Button
            variant="primary"
            onClick={() => setIsModalOpen(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            添加交易
          </Button>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-6">
            {sortedTransactions.map((transaction) => {
              const stock = getStock(transaction.stockCode);
              const stockName = stock?.name || transaction.stockCode;
              const amount = calculateAmount(transaction.price, transaction.quantity, transaction.fee, transaction.type);
              const isExpanded = expandedId === transaction.id;
              const isEditing = editingId === transaction.id;

              return (
                <div key={transaction.id} className="relative pl-16">
                  <div
                    className={`absolute left-4 w-4 h-4 rounded-full border-4 border-surface ${
                      transaction.type === 'BUY' ? 'bg-up' : 'bg-down'}`}
                  />

                  <div className="bg-surface rounded-xl border border-border card-hover">
                    <div
                      className="p-6 cursor-pointer"
                      onClick={() => toggleExpand(transaction.id)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              transaction.type === 'BUY'
                                ? 'bg-up/20 text-up'
                                : 'bg-down/20 text-down'
                            }`}
                          >
                            {transaction.type === 'BUY' ? (
                              <TrendingUp className="w-4 h-4 mr-1" />
                            ) : (
                              <TrendingDown className="w-4 h-4 mr-1" />
                            )}
                            {transaction.type === 'BUY' ? '买入' : '卖出'}
                          </span>
                          <h3 className="text-lg font-semibold text-text-primary">
                            {stockName}
                          </h3>
                          <span className="text-text-muted text-sm">
                            ({transaction.stockCode})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-text-muted text-sm">
                            {transaction.date}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-text-muted" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-text-muted" />
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-text-muted text-sm mb-1">成交价格</p>
                          <p className="font-mono text-text-primary font-semibold">
                            ¥{formatNumber(transaction.price)}
                          </p>
                        </div>
                        <div>
                          <p className="text-text-muted text-sm mb-1">成交数量</p>
                          <p className="font-mono text-text-primary font-semibold">
                            {formatNumber(transaction.quantity, 0)} 股
                          </p>
                        </div>
                        <div>
                          <p className="text-text-muted text-sm mb-1">手续费用</p>
                          <p className="font-mono text-text-primary font-semibold">
                            ¥{formatCurrency(transaction.fee)}
                          </p>
                        </div>
                        <div>
                          <p className="text-text-muted text-sm mb-1">交易金额</p>
                          <p className={`font-mono font-semibold ${
                            transaction.type === 'BUY' ? 'text-down' : 'text-up'
                          }`}>
                            {transaction.type === 'BUY' ? '-' : '+'}¥{formatCurrency(Math.abs(amount))}
                          </p>
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-6 pb-6 border-t border-border pt-6 space-y-6">
                        <div>
                          <h4 className="text-sm font-medium text-text-secondary mb-2">
                            决策理由
                          </h4>
                          <div className="bg-surface-hover rounded-lg p-4">
                            {transaction.decisionReason ? (
                              <p className="text-text-primary">
                                {transaction.decisionReason}
                              </p>
                            ) : (
                              <p className="text-text-muted italic">
                                暂无决策理由
                              </p>
                            )}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-text-secondary">
                              事后复盘
                            </h4>
                            {!isEditing && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditReview(transaction);
                                }}
                                icon={<Edit2 className="w-4 h-4" />}
                              >
                                编辑复盘
                              </Button>
                            )}
                          </div>

                          {isEditing ? (
                            <div className="space-y-3">
                              <Textarea
                                value={editReview}
                                onChange={(e) => setEditReview(e.target.value)}
                                placeholder="记录您对这笔交易的复盘总结..."
                                className="min-h-[120px]"
                              />
                              <div className="flex gap-2">
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSaveReview(transaction.id);
                                  }}
                                  icon={<Check className="w-4 h-4" />}
                                >
                                  保存
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancelEdit();
                                  }}
                                  icon={<X className="w-4 h-4" />}
                                >
                                  取消
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-surface-hover rounded-lg p-4">
                              {transaction.review ? (
                                <p className="text-text-primary">
                                  {transaction.review}
                                </p>
                              ) : (
                                <p className="text-text-muted italic">
                                  点击"编辑复盘"记录您的交易总结
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="添加交易记录"
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="股票代码"
              placeholder="例如：600519"
              value={formData.stockCode}
              onChange={(e) => setFormData({ ...formData, stockCode: e.target.value })}
              error={errors.stockCode}
            />
            <Select
              label="交易类型"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as TransactionType })}
            >
              <option value="BUY">买入</option>
              <option value="SELL">卖出</option>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="交易日期"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              error={errors.date}
            />
            <Input
              label="成交价格"
              type="number"
              step="0.01"
              placeholder="例如：1688.50"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              error={errors.price}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="成交数量"
              type="number"
              step="100"
              placeholder="例如：100"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              error={errors.quantity}
            />
            <Input
              label="手续费用"
              type="number"
              step="0.01"
              placeholder="例如：5.00"
              value={formData.fee}
              onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
            />
          </div>

          <Textarea
            label="决策理由"
            placeholder="记录您买入或卖出的决策理由，例如估值、基本面变化等..."
            value={formData.decisionReason}
            onChange={(e) => setFormData({ ...formData, decisionReason: e.target.value })}
            className="min-h-[100px]"
          />

          {formData.price && formData.quantity && (
            <div className="bg-surface-hover rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-text-muted">预计交易金额：</span>
                <span className={`font-mono font-bold text-lg ${
                  formData.type === 'BUY' ? 'text-down' : 'text-up'
                }`}>
                  {formData.type === 'BUY' ? '-' : '+'}
                  ¥{formatCurrency(
                    calculateAmount(
                      parseFloat(formData.price) || 0,
                      parseInt(formData.quantity) || 0,
                      parseFloat(formData.fee) || 0,
                      formData.type
                    )
                  )}
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              取消
            </Button>
            <Button
              variant="primary"
              onClick={handleAddTransaction}
              icon={<Plus className="w-4 h-4" />}
            >
              添加交易
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
