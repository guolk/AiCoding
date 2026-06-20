import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Phone, Mail, MapPin, FileText, CreditCard, Star, Filter, ChevronRight, CheckCircle, Clock } from 'lucide-react';
import { useAppStore } from '@/store';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select, type SelectOption } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Rating } from '@/components/ui/Rating';
import { Table, type TableColumn } from '@/components/ui/Table';
import { formatCurrency, formatDate, getContractStatusText, getPaymentStatusText } from '@/utils/formatters';
import type { Vendor, Contract, Payment, VendorReview, VendorQuote } from '@/types';

const CATEGORIES = ['婚庆公司', '摄影', '花艺', '餐饮', '音响', '服装', '其他'];
const categoryOptions: SelectOption[] = CATEGORIES.map(c => ({ value: c, label: c }));
const BADGE_VARIANTS: Record<string, 'success' | 'warning' | 'error' | 'gray'> = { signed: 'success', pending: 'warning', paid: 'success', overdue: 'error', completed: 'success', draft: 'gray' };

export default function VendorManagement() {
  const { currentEventId, vendors, contracts, payments, vendorReviews: storeVendorReviews, vendorQuotes, addVendor, updateVendor, deleteVendor, addContract, addPayment, addVendorReview } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [vendorModalOpen, setVendorModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [detailTab, setDetailTab] = useState<'quotes' | 'contracts' | 'payments' | 'reviews'>('contracts');
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const [vendorForm, setVendorForm] = useState({ category: '', name: '', contact: '', phone: '', email: '', address: '', website: '', notes: '' });
  const [contractForm, setContractForm] = useState({ title: '', amount: '', startDate: '', endDate: '', notes: '' });
  const [paymentForm, setPaymentForm] = useState({ milestone: '', amount: '', dueDate: '', notes: '' });
  const [reviewForm, setReviewForm] = useState({ rating: 5, qualityRating: 5, punctualityRating: 5, attitudeRating: 5, comment: '' });
  const [paymentPlans, setPaymentPlans] = useState([{ milestone: '', amount: '', dueDate: '' }]);

  const filteredVendors = useMemo(() => selectedCategory ? vendors.filter(v => v.category === selectedCategory) : vendors, [vendors, selectedCategory]);

  const getVendorStats = (vendorId: string) => {
    const vc = contracts.filter(c => c.vendorId === vendorId);
    const vp = payments.filter(p => p.vendorId === vendorId);
    const vr = storeVendorReviews.filter(r => r.vendorId === vendorId);
    const signedCount = vc.filter(c => c.status === 'signed').length;
    const pendingAmount = vp.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0);
    const avgRating = vr.length > 0 ? vr.reduce((s, r) => s + r.rating, 0) / vr.length : 0;
    const status = vc.some(c => c.status === 'signed') ? 'signed' : vc.some(c => c.status === 'pending') ? 'pending' : 'none';
    return { vendorContracts: vc, vendorPayments: vp, vendorReviews: vr, signedCount, pendingAmount, avgRating, status };
  };

  const handleOpenAddVendor = () => { setEditingVendor(null); setVendorForm({ category: '', name: '', contact: '', phone: '', email: '', address: '', website: '', notes: '' }); setVendorModalOpen(true); };
  const handleEditVendor = (v: Vendor) => { setEditingVendor(v); setVendorForm({ category: v.category, name: v.name, contact: v.contact, phone: v.phone, email: v.email, address: v.address, website: v.website, notes: v.notes }); setVendorModalOpen(true); };
  const handleSaveVendor = () => { editingVendor ? updateVendor(editingVendor.id, vendorForm) : addVendor({ ...vendorForm, eventId: currentEventId }); setVendorModalOpen(false); };
  const handleDeleteVendor = (id: string) => { if (confirm('确定删除此供应商？')) deleteVendor(id); };

  const handleSaveContract = () => {
    if (!selectedVendor) return;
    addContract({ vendorId: selectedVendor.id, eventId: currentEventId, title: contractForm.title, status: 'pending', amount: Number(contractForm.amount), signedDate: null, startDate: contractForm.startDate, endDate: contractForm.endDate, notes: contractForm.notes });
    paymentPlans.forEach(plan => { if (plan.milestone && plan.amount && plan.dueDate) addPayment({ vendorId: selectedVendor.id, contractId: '', eventId: currentEventId, milestone: plan.milestone, amount: Number(plan.amount), dueDate: plan.dueDate, status: 'pending', paidDate: null, notes: '' }); });
    setContractModalOpen(false); setContractForm({ title: '', amount: '', startDate: '', endDate: '', notes: '' }); setPaymentPlans([{ milestone: '', amount: '', dueDate: '' }]);
  };

  const handleSavePayment = () => { if (!selectedVendor) return; addPayment({ vendorId: selectedVendor.id, contractId: '', eventId: currentEventId, ...paymentForm, amount: Number(paymentForm.amount), status: 'pending', paidDate: null }); setPaymentModalOpen(false); setPaymentForm({ milestone: '', amount: '', dueDate: '', notes: '' }); };
  const handleSaveReview = () => { if (!selectedVendor) return; addVendorReview({ vendorId: selectedVendor.id, eventId: currentEventId, ...reviewForm }); setReviewModalOpen(false); setReviewForm({ rating: 5, qualityRating: 5, punctualityRating: 5, attitudeRating: 5, comment: '' }); };
  const handleAddPaymentPlan = () => setPaymentPlans([...paymentPlans, { milestone: '', amount: '', dueDate: '' }]);

  const vendorQuotesForVendor = vendorQuotes.filter(q => q.vendorId === selectedVendor?.id);
  const { vendorContracts, vendorPayments, vendorReviews, signedCount, pendingAmount, avgRating, status } = getVendorStats(selectedVendor?.id || '');

  const quoteColumns: TableColumn<VendorQuote>[] = [
    { key: 'price', header: '报价', accessor: (q) => <span className="font-semibold text-accent-500">{formatCurrency(q.price)}</span>, align: 'right' },
    { key: 'description', header: '服务内容', accessor: (q) => <span className="text-sm">{q.description}</span> },
    { key: 'validUntil', header: '有效期', accessor: (q) => formatDate(q.validUntil) },
    { key: 'isSelected', header: '状态', accessor: (q) => q.isSelected ? <Badge variant="success" dot>已选中</Badge> : <Badge variant="gray" dot>未选中</Badge> }
  ];
  const contractColumns: TableColumn<Contract>[] = [
    { key: 'title', header: '合同名称', accessor: (c) => <span className="font-medium">{c.title}</span> },
    { key: 'amount', header: '金额', accessor: (c) => <span className="text-accent-500 font-semibold">{formatCurrency(c.amount)}</span>, align: 'right' },
    { key: 'status', header: '状态', accessor: (c) => <Badge variant={BADGE_VARIANTS[c.status] || 'gray'}>{getContractStatusText(c.status)}</Badge> },
    { key: 'startDate', header: '开始日期', accessor: (c) => formatDate(c.startDate) }
  ];
  const paymentColumns: TableColumn<Payment>[] = [
    { key: 'milestone', header: '里程碑', accessor: (p) => <span className="font-medium">{p.milestone}</span> },
    { key: 'amount', header: '金额', accessor: (p) => <span className="text-accent-500 font-semibold">{formatCurrency(p.amount)}</span>, align: 'right' },
    { key: 'dueDate', header: '到期日', accessor: (p) => formatDate(p.dueDate) },
    { key: 'status', header: '状态', accessor: (p) => <Badge variant={BADGE_VARIANTS[p.status] || 'gray'}>{getPaymentStatusText(p.status)}</Badge> }
  ];

  const StatusBadge = ({ s }: { s: string }) => s === 'signed' ? <Badge variant="success" dot><CheckCircle className="w-3 h-3" /> 已签约</Badge> : s === 'pending' ? <Badge variant="warning" dot><Clock className="w-3 h-3" /> 待签署</Badge> : <Badge variant="gray" dot>未合作</Badge>;
  const TabBtn = ({ tab, label }: { tab: typeof detailTab; label: string }) => <button onClick={() => setDetailTab(tab)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${detailTab === tab ? 'bg-primary-100 text-primary-600' : 'text-warmGray-500 hover:bg-warmGray-50'}`}>{label}</button>;

  return (
    <div className="p-6 lg:p-8 animate-fade-in space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-slide-up">
        <div><h2 className="text-2xl font-display font-semibold text-warmGray-900">供应商列表</h2><p className="text-warmGray-500 mt-1">管理活动相关供应商</p></div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={handleOpenAddVendor}>添加供应商</Button>
      </div>
      <div className="flex flex-wrap gap-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <Button variant={selectedCategory === '' ? 'primary' : 'ghost'} size="sm" onClick={() => setSelectedCategory('')}><Filter className="w-4 h-4" /> 全部</Button>
        {CATEGORIES.map(cat => <Button key={cat} variant={selectedCategory === cat ? 'primary' : 'ghost'} size="sm" onClick={() => setSelectedCategory(cat)}>{cat}</Button>)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVendors.map((v, i) => { const stats = getVendorStats(v.id); return (
          <Card key={v.id} hoverable className="animate-slide-up" style={{ animationDelay: `${0.1 + i * 0.05}s` }} onClick={() => setSelectedVendor(v)}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div><Badge variant="primary" className="mb-2">{v.category}</Badge><CardTitle>{v.name}</CardTitle></div>
                <div className="flex gap-1">
                  <button onClick={(e) => { e.stopPropagation(); handleEditVendor(v); }} className="p-1.5 rounded-lg text-warmGray-400 hover:text-primary-500 hover:bg-primary-50 transition-colors"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteVendor(v.id); }} className="p-1.5 rounded-lg text-warmGray-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <CardDescription><div className="space-y-1.5 mt-2">
                <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-primary-500" /><span>{v.contact} · {v.phone}</span></div>
                <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-primary-500" /><span className="truncate">{v.email}</span></div>
                <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-primary-500" /><span className="truncate">{v.address}</span></div>
              </div></CardDescription>
            </CardHeader>
            <CardContent><div className="grid grid-cols-3 gap-3 text-center">
              <div><div className="text-lg font-bold text-accent-500">{stats.signedCount}</div><div className="text-xs text-warmGray-500">已签合同</div></div>
              <div><div className="text-lg font-bold text-champagne-500">{formatCurrency(stats.pendingAmount)}</div><div className="text-xs text-warmGray-500">待付款</div></div>
              <div><div className="text-lg font-bold text-primary-500">{stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '-'}</div><div className="text-xs text-warmGray-500">评分</div></div>
            </div></CardContent>
            <CardFooter><div className="flex items-center justify-between"><StatusBadge s={stats.status} /><ChevronRight className="w-4 h-4 text-warmGray-400" /></div></CardFooter>
          </Card>
        ); })}
      </div>

      <Modal isOpen={!!selectedVendor} onClose={() => setSelectedVendor(null)} title={selectedVendor?.name} size="xl">
        <div className="space-y-4">
          <div className="flex gap-2 border-b border-warmGray-100 pb-4"><TabBtn tab="contracts" label="合同" /><TabBtn tab="quotes" label="报价" /><TabBtn tab="payments" label="付款" /><TabBtn tab="reviews" label="评价" /></div>
          <div className="flex gap-2 justify-end">
            {detailTab === 'contracts' && <Button size="sm" leftIcon={<FileText className="w-4 h-4" />} onClick={() => setContractModalOpen(true)}>添加合同</Button>}
            {detailTab === 'payments' && <Button size="sm" leftIcon={<CreditCard className="w-4 h-4" />} onClick={() => setPaymentModalOpen(true)}>添加付款</Button>}
            {detailTab === 'reviews' && <Button size="sm" leftIcon={<Star className="w-4 h-4" />} onClick={() => setReviewModalOpen(true)}>添加评价</Button>}
          </div>
          {detailTab === 'quotes' && <Table columns={quoteColumns as any} data={vendorQuotesForVendor as any} rowKey="id" />}
          {detailTab === 'contracts' && <Table columns={contractColumns as any} data={vendorContracts as any} rowKey="id" />}
          {detailTab === 'payments' && <Table columns={paymentColumns as any} data={vendorPayments as any} rowKey="id" />}
          {detailTab === 'reviews' && <div className="space-y-3">{vendorReviews.length === 0 ? <div className="text-center py-8 text-warmGray-400">暂无评价</div> : vendorReviews.map((r: any) => (
            <Card key={r.id} className="p-4">
              <div className="flex items-start justify-between mb-2"><Rating value={r.rating} size="sm" /><span className="text-xs text-warmGray-400">{formatDate(r.createdAt)}</span></div>
              <div className="grid grid-cols-3 gap-4 mb-2 text-sm"><div>服务质量 <Rating value={r.qualityRating} size="sm" /></div><div>准时性 <Rating value={r.punctualityRating} size="sm" /></div><div>服务态度 <Rating value={r.attitudeRating} size="sm" /></div></div>
              <p className="text-warmGray-600 text-sm">{r.comment}</p>
            </Card>
          ))}</div>}
        </div>
      </Modal>

      <Modal isOpen={vendorModalOpen} onClose={() => setVendorModalOpen(false)} title={editingVendor ? '编辑供应商' : '添加供应商'} footer={<><Button variant="ghost" onClick={() => setVendorModalOpen(false)}>取消</Button><Button onClick={handleSaveVendor}>保存</Button></>}>
        <div className="space-y-4">
          <Select label="类别" options={categoryOptions} value={vendorForm.category} onChange={(e) => setVendorForm({ ...vendorForm, category: e.target.value })} required />
          <Input label="供应商名称" value={vendorForm.name} onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4"><Input label="联系人" value={vendorForm.contact} onChange={(e) => setVendorForm({ ...vendorForm, contact: e.target.value })} /><Input label="联系电话" value={vendorForm.phone} onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })} /></div>
          <Input label="邮箱" type="email" value={vendorForm.email} onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })} />
          <Input label="地址" value={vendorForm.address} onChange={(e) => setVendorForm({ ...vendorForm, address: e.target.value })} />
          <Textarea label="备注" value={vendorForm.notes} onChange={(e) => setVendorForm({ ...vendorForm, notes: e.target.value })} />
        </div>
      </Modal>

      <Modal isOpen={contractModalOpen} onClose={() => setContractModalOpen(false)} title="添加合同" footer={<><Button variant="ghost" onClick={() => setContractModalOpen(false)}>取消</Button><Button onClick={handleSaveContract}>保存</Button></>}>
        <div className="space-y-4">
          <Input label="合同名称" value={contractForm.title} onChange={(e) => setContractForm({ ...contractForm, title: e.target.value })} required />
          <Input label="合同金额" type="number" value={contractForm.amount} onChange={(e) => setContractForm({ ...contractForm, amount: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4"><Input label="开始日期" type="date" value={contractForm.startDate} onChange={(e) => setContractForm({ ...contractForm, startDate: e.target.value })} required /><Input label="结束日期" type="date" value={contractForm.endDate} onChange={(e) => setContractForm({ ...contractForm, endDate: e.target.value })} required /></div>
          <div className="border-t border-warmGray-100 pt-4">
            <div className="flex items-center justify-between mb-3"><h4 className="font-semibold text-warmGray-700">付款计划</h4><Button size="sm" variant="ghost" onClick={handleAddPaymentPlan}><Plus className="w-4 h-4" /> 添加</Button></div>
            {paymentPlans.map((plan, idx) => <div key={idx} className="grid grid-cols-3 gap-3 mb-2">
              <Input placeholder="里程碑" value={plan.milestone} onChange={(e) => { const np = [...paymentPlans]; np[idx].milestone = e.target.value; setPaymentPlans(np); }} />
              <Input placeholder="金额" type="number" value={plan.amount} onChange={(e) => { const np = [...paymentPlans]; np[idx].amount = e.target.value; setPaymentPlans(np); }} />
              <Input placeholder="到期日" type="date" value={plan.dueDate} onChange={(e) => { const np = [...paymentPlans]; np[idx].dueDate = e.target.value; setPaymentPlans(np); }} />
            </div>)}
          </div>
        </div>
      </Modal>

      <Modal isOpen={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} title="添加付款记录" footer={<><Button variant="ghost" onClick={() => setPaymentModalOpen(false)}>取消</Button><Button onClick={handleSavePayment}>保存</Button></>}>
        <div className="space-y-4">
          <Input label="里程碑" value={paymentForm.milestone} onChange={(e) => setPaymentForm({ ...paymentForm, milestone: e.target.value })} required />
          <Input label="金额" type="number" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} required />
          <Input label="到期日" type="date" value={paymentForm.dueDate} onChange={(e) => setPaymentForm({ ...paymentForm, dueDate: e.target.value })} required />
          <Textarea label="备注" value={paymentForm.notes} onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })} />
        </div>
      </Modal>

      <Modal isOpen={reviewModalOpen} onClose={() => setReviewModalOpen(false)} title="添加服务评价" footer={<><Button variant="ghost" onClick={() => setReviewModalOpen(false)}>取消</Button><Button onClick={handleSaveReview}>提交评价</Button></>}>
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between"><span className="text-warmGray-600">总体评分</span><Rating value={reviewForm.rating} onChange={(v) => setReviewForm({ ...reviewForm, rating: v })} size="lg" /></div>
            <div className="flex items-center justify-between"><span className="text-warmGray-600">服务质量</span><Rating value={reviewForm.qualityRating} onChange={(v) => setReviewForm({ ...reviewForm, qualityRating: v })} /></div>
            <div className="flex items-center justify-between"><span className="text-warmGray-600">准时性</span><Rating value={reviewForm.punctualityRating} onChange={(v) => setReviewForm({ ...reviewForm, punctualityRating: v })} /></div>
            <div className="flex items-center justify-between"><span className="text-warmGray-600">服务态度</span><Rating value={reviewForm.attitudeRating} onChange={(v) => setReviewForm({ ...reviewForm, attitudeRating: v })} /></div>
          </div>
          <Textarea label="评价内容" value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} placeholder="请输入您的评价..." required />
        </div>
      </Modal>
    </div>
  );
}
