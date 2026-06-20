import { useState, useMemo } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  Wallet, TrendingUp, AlertTriangle, Plus, Edit2, Trash2, Filter, DollarSign, Clock,
  ChevronDown, History, PieChart as PieChartIcon, BarChart3, Target,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select, SelectOption } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Table, TableColumn } from '@/components/ui/Table';
import { formatCurrency, formatDate, getBudgetProgress, isOverBudget, formatDateTime } from '@/utils/formatters';
import type { Expense, BudgetCategory } from '@/types';

const COLORS = ['#E8B4A0', '#D99B87', '#C47D65', '#8B2635', '#D4AF37', '#A8644E', '#9C9080'];

export default function BudgetControl() {
  const { currentEventId, budgetCategories, expenses, budgetAdjustments, vendors, updateBudgetCategory, addExpense, updateExpense, deleteExpense } = useAppStore();

  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editBudgetValue, setEditBudgetValue] = useState('');

  const [expenseForm, setExpenseForm] = useState({
    categoryId: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    vendorId: '',
    notes: '',
  });

  const categorySpent = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach(e => {
      map[e.categoryId] = (map[e.categoryId] || 0) + e.amount;
    });
    return map;
  }, [expenses]);

  const totalBudget = useMemo(() => budgetCategories.reduce((sum, c) => sum + c.budgeted, 0), [budgetCategories]);
  const totalSpent = useMemo(() => Object.values(categorySpent).reduce((sum, s) => sum + s, 0), [categorySpent]);
  const remaining = totalBudget - totalSpent;
  const overBudgetCategories = useMemo(() => budgetCategories.filter(c => isOverBudget(c.budgeted, categorySpent[c.id] || 0)), [budgetCategories, categorySpent]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      if (filterCategory && e.categoryId !== filterCategory) return false;
      if (filterStartDate && e.date < filterStartDate) return false;
      if (filterEndDate && e.date > filterEndDate) return false;
      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, filterCategory, filterStartDate, filterEndDate]);

  const barChartData = useMemo(() => budgetCategories.map(c => ({
    name: c.name,
    预算: c.budgeted,
    实际支出: categorySpent[c.id] || 0,
  })), [budgetCategories, categorySpent]);

  const pieChartData = useMemo(() => budgetCategories.map(c => ({
    name: c.name,
    value: categorySpent[c.id] || 0,
  })).filter(d => d.value > 0), [budgetCategories, categorySpent]);

  const categoryOptions: SelectOption[] = budgetCategories.map(c => ({ value: c.id, label: c.name }));
  const vendorOptions: SelectOption[] = vendors.map(v => ({ value: v.id, label: v.name }));

  const handleOpenExpenseModal = (expense?: Expense) => {
    if (expense) {
      setEditingExpense(expense);
      setExpenseForm({
        categoryId: expense.categoryId,
        description: expense.description,
        amount: expense.amount.toString(),
        date: expense.date,
        vendorId: expense.vendorId || '',
        notes: expense.notes,
      });
    } else {
      setEditingExpense(null);
      setExpenseForm({
        categoryId: budgetCategories[0]?.id || '',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        vendorId: '',
        notes: '',
      });
    }
    setExpenseModalOpen(true);
  };

  const handleSaveExpense = () => {
    if (!expenseForm.categoryId || !expenseForm.description || !expenseForm.amount) return;
    const expenseData = {
      categoryId: expenseForm.categoryId,
      eventId: currentEventId,
      description: expenseForm.description,
      amount: parseFloat(expenseForm.amount),
      date: expenseForm.date,
      vendorId: expenseForm.vendorId || null,
      notes: expenseForm.notes,
      receiptUrl: null,
    };
    if (editingExpense) {
      updateExpense(editingExpense.id, expenseData);
    } else {
      addExpense(expenseData);
    }
    setExpenseModalOpen(false);
  };

  const handleDeleteExpense = (id: string) => {
    if (confirm('确定要删除这条支出记录吗？')) {
      deleteExpense(id);
    }
  };

  const handleBudgetEdit = (category: BudgetCategory) => {
    setEditingCategoryId(category.id);
    setEditBudgetValue(category.budgeted.toString());
  };

  const handleBudgetSave = (categoryId: string) => {
    const newBudget = parseFloat(editBudgetValue);
    if (!isNaN(newBudget) && newBudget >= 0) {
      updateBudgetCategory(categoryId, { budgeted: newBudget });
    }
    setEditingCategoryId(null);
  };

  const getCategoryName = (categoryId: string) => budgetCategories.find(c => c.id === categoryId)?.name || '-';
  const getVendorName = (vendorId: string | null) => vendors.find(v => v.id === vendorId)?.name || '-';

  const expenseColumns: TableColumn<Expense>[] = [
    { key: 'date', header: '日期', accessor: (row) => formatDate(row.date) },
    { key: 'categoryId', header: '类别', accessor: (row) => getCategoryName(row.categoryId) },
    { key: 'description', header: '描述' },
    { key: 'amount', header: '金额', accessor: (row) => <span className="font-semibold text-accent-500">{formatCurrency(row.amount)}</span>, align: 'right' },
    { key: 'vendorId', header: '供应商', accessor: (row) => getVendorName(row.vendorId) },
    { key: 'notes', header: '备注' },
    {
      key: 'actions', header: '操作', align: 'right', accessor: (row) => (
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" leftIcon={<Edit2 className="h-4 w-4" />} onClick={() => handleOpenExpenseModal(row)}>编辑</Button>
          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" leftIcon={<Trash2 className="h-4 w-4" />} onClick={() => handleDeleteExpense(row.id)}>删除</Button>
        </div>
      ),
    },
  ];

  const renderRingProgress = (value: number, max: number) => {
    const percentage = Math.min((value / max) * 100, 100);
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    const color = percentage >= 100 ? '#EF4444' : percentage >= 80 ? '#F59E0B' : '#C47D65';

    return (
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 transform -rotate-90">
          <circle cx="64" cy="64" r={radius} stroke="#F2EFEB" strokeWidth="8" fill="none" />
          <circle cx="64" cy="64" r={radius} stroke={color} strokeWidth="8" fill="none" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-500" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-warmGray-800">{Math.round(percentage)}%</span>
          <span className="text-xs text-warmGray-500">使用率</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="animate-slide-up">
        <h2 className="text-2xl font-display font-semibold text-warmGray-900 dark:text-white">预算控制</h2>
        <p className="text-warmGray-500 mt-1">管理活动预算和支出</p>
      </div>

      {overBudgetCategories.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-slide-up">
          <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-red-700">超支预警</h4>
            <p className="text-sm text-red-600 mt-1">
              以下类别已超支：{overBudgetCategories.map(c => c.name).join('、')}，请及时调整预算或控制支出。
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-slide-up">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Wallet className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-warmGray-500">总预算</p>
              <p className="text-2xl font-bold text-warmGray-800">{formatCurrency(totalBudget)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 bg-champagne-100 rounded-xl flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-champagne-600" />
            </div>
            <div>
              <p className="text-sm text-warmGray-500">已支出</p>
              <p className="text-2xl font-bold text-champagne-600">{formatCurrency(totalSpent)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className={`w-12 h-12 ${remaining >= 0 ? 'bg-green-100' : 'bg-red-100'} rounded-xl flex items-center justify-center`}>
              <TrendingUp className={`h-6 w-6 ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            <div>
              <p className="text-sm text-warmGray-500">剩余</p>
              <p className={`text-2xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(remaining)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-center">
            {renderRingProgress(totalSpent, totalBudget)}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" />分项预算设置</CardTitle>
            <CardDescription>点击编辑图标调整各分类预算</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {budgetCategories.map((category, index) => {
              const spent = categorySpent[category.id] || 0;
              const progress = getBudgetProgress(category.budgeted, spent);
              const over = isOverBudget(category.budgeted, spent);
              return (
                <div key={category.id} className={`p-4 rounded-xl border transition-all ${over ? 'bg-red-50 border-red-200' : 'bg-warmGray-50 border-warmGray-100'}`} style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="font-medium text-warmGray-800">{category.name}</span>
                    </div>
                    {editingCategoryId === category.id ? (
                      <div className="flex items-center gap-2">
                        <Input size="sm" type="number" value={editBudgetValue} onChange={(e) => setEditBudgetValue(e.target.value)} className="w-28" />
                        <Button size="sm" onClick={() => handleBudgetSave(category.id)}>保存</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingCategoryId(null)}>取消</Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${over ? 'text-red-600' : 'text-warmGray-700'}`}>
                          {formatCurrency(spent)} / {formatCurrency(category.budgeted)}
                        </span>
                        <Button variant="ghost" size="sm" leftIcon={<Edit2 className="h-4 w-4" />} onClick={() => handleBudgetEdit(category)} />
                      </div>
                    )}
                  </div>
                  <ProgressBar value={progress} variant={over ? 'accent' : 'primary'} showPercentage size="sm" />
                  {over && <p className="text-xs text-red-500 mt-1">已超支 {formatCurrency(spent - category.budgeted)}</p>}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />预算 vs 实际支出</CardTitle>
            <CardDescription>各分类预算与实际支出对比</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6E1DB" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9C9080" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9C9080" tickFormatter={(v) => `¥${v / 1000}k`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Legend />
                <Bar dataKey="预算" fill="#D99B87" radius={[4, 4, 0, 0]} />
                <Bar dataKey="实际支出" fill="#8B2635" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><PieChartIcon className="h-5 w-5" />支出占比</CardTitle>
            <CardDescription>各类别实际支出占比</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieChartData.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><History className="h-5 w-5" />预算调整记录</CardTitle>
            <CardDescription>所有预算调整历史</CardDescription>
          </CardHeader>
          <CardContent className="max-h-[350px] overflow-y-auto space-y-3">
            {budgetAdjustments.length === 0 ? (
              <p className="text-center text-warmGray-400 py-8">暂无调整记录</p>
            ) : (
              budgetAdjustments.slice().reverse().map(adj => (
                <div key={adj.id} className="p-3 bg-warmGray-50 rounded-xl border border-warmGray-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-warmGray-800">{getCategoryName(adj.categoryId)}</span>
                    <span className="text-xs text-warmGray-500 flex items-center gap-1"><Clock className="h-3 w-3" />{formatDateTime(adj.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-warmGray-600">{formatCurrency(adj.previousAmount)}</span>
                    <ChevronDown className="h-4 w-4 text-primary-500" />
                    <span className="font-semibold text-primary-600">{formatCurrency(adj.newAmount)}</span>
                  </div>
                  {adj.reason && <p className="text-xs text-warmGray-500 mt-1">原因：{adj.reason}</p>}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="animate-slide-up">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" />支出记录管理</CardTitle>
              <CardDescription>管理所有支出记录</CardDescription>
            </div>
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => handleOpenExpenseModal()}>添加支出</Button>
          </div>
          <div className="flex flex-wrap gap-3 mt-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-warmGray-400" />
              <Select size="sm" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} options={[{ value: '', label: '全部类别' }, ...categoryOptions]} className="w-40" />
            </div>
            <Input size="sm" type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} className="w-40" placeholder="开始日期" />
            <Input size="sm" type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} className="w-40" placeholder="结束日期" />
            {(filterCategory || filterStartDate || filterEndDate) && (
              <Button variant="ghost" size="sm" onClick={() => { setFilterCategory(''); setFilterStartDate(''); setFilterEndDate(''); }}>清除筛选</Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table columns={expenseColumns} data={filteredExpenses} rowKey="id" emptyText="暂无支出记录" />
        </CardContent>
      </Card>

      <Modal isOpen={expenseModalOpen} onClose={() => setExpenseModalOpen(false)} title={editingExpense ? '编辑支出' : '添加支出'} size="lg" footer={
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setExpenseModalOpen(false)}>取消</Button>
          <Button onClick={handleSaveExpense}>{editingExpense ? '保存修改' : '添加支出'}</Button>
        </div>
      }>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select label="支出类别" value={expenseForm.categoryId} onChange={(e) => setExpenseForm({ ...expenseForm, categoryId: e.target.value })} options={categoryOptions} required />
            <Input label="金额" type="number" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} placeholder="请输入金额" required leftIcon={<DollarSign className="h-4 w-4" />} />
          </div>
          <Input label="支出描述" value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} placeholder="请输入支出描述" required />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="日期" type="date" value={expenseForm.date} onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })} required />
            <Select label="供应商" value={expenseForm.vendorId} onChange={(e) => setExpenseForm({ ...expenseForm, vendorId: e.target.value })} options={[{ value: '', label: '无' }, ...vendorOptions]} />
          </div>
          <Textarea label="备注" value={expenseForm.notes} onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })} placeholder="可选备注信息" rows={3} />
        </div>
      </Modal>
    </div>
  );
}
