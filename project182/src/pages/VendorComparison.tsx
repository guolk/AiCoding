import { useState, useMemo } from 'react';
import { Plus, Filter, Eye, Check, TrendingDown, Calendar, FileText, Building2 } from 'lucide-react';
import { useAppStore } from '@/store';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select, type SelectOption } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Table, type TableColumn } from '@/components/ui/Table';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { VendorQuote, Vendor } from '@/types';

const CATEGORIES = ['婚庆公司', '摄影', '花艺', '餐饮', '音响', '服装', '其他'];
const categoryOptions: SelectOption[] = CATEGORIES.map(c => ({ value: c, label: c }));

export default function VendorComparison() {
  const { currentEventId, vendors, vendorQuotes, addVendorQuote, selectVendorQuote } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedQuote, setSelectedQuote] = useState<VendorQuote | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [quoteForm, setQuoteForm] = useState({ vendorId: '', price: '', description: '', validUntil: '' });

  const filteredVendors = useMemo(() => 
    selectedCategory ? vendors.filter(v => v.category === selectedCategory) : vendors
  , [vendors, selectedCategory]);

  const quotesWithVendor = useMemo(() => 
    vendorQuotes
      .filter(q => filteredVendors.some(v => v.id === q.vendorId))
      .map(q => ({ ...q, vendor: vendors.find(v => v.id === q.vendorId) }))
  , [vendorQuotes, filteredVendors, vendors]);

  const minPrice = useMemo(() => {
    if (quotesWithVendor.length === 0) return 0;
    return Math.min(...quotesWithVendor.map(q => q.price));
  }, [quotesWithVendor]);

  const vendorOptions: SelectOption[] = filteredVendors.map(v => ({ value: v.id, label: v.name }));

  const handleAddQuote = () => {
    addVendorQuote({
      vendorId: quoteForm.vendorId,
      eventId: currentEventId,
      price: Number(quoteForm.price),
      description: quoteForm.description,
      validUntil: quoteForm.validUntil,
      isSelected: false
    });
    setAddModalOpen(false);
    setQuoteForm({ vendorId: '', price: '', description: '', validUntil: '' });
  };

  const handleSelectVendor = (id: string) => {
    if (confirm('确定选择此供应商作为中标供应商？')) selectVendorQuote(id);
  };

  const columns: TableColumn<typeof quotesWithVendor[0]>[] = [
    {
      key: 'vendor',
      header: '供应商',
      accessor: (q) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-primary-500" />
          </div>
          <div>
            <div className="font-medium">{q.vendor?.name}</div>
            <div className="text-xs text-warmGray-400">{q.vendor?.category}</div>
          </div>
        </div>
      )
    },
    {
      key: 'price',
      header: '报价',
      align: 'right',
      accessor: (q) => (
        <div className={`font-bold ${q.price === minPrice ? 'text-green-600' : 'text-accent-500'}`}>
          {q.price === minPrice && <TrendingDown className="w-4 h-4 inline mr-1" />}
          {formatCurrency(q.price)}
        </div>
      )
    },
    {
      key: 'description',
      header: '服务内容',
      accessor: (q) => <span className="text-sm">{q.description}</span>
    },
    {
      key: 'validUntil',
      header: '有效期',
      accessor: (q) => (
        <div className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-warmGray-400" />
          <span>{formatDate(q.validUntil)}</span>
        </div>
      )
    },
    {
      key: 'isSelected',
      header: '状态',
      accessor: (q) => q.isSelected
        ? <Badge variant="success" dot><Check className="w-3 h-3" /> 已选中</Badge>
        : <Badge variant="gray" dot>待选择</Badge>
    },
    {
      key: 'actions',
      header: '操作',
      accessor: (q) => (
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={() => setSelectedQuote(q)}>
            <Eye className="w-4 h-4" />
          </Button>
          {!q.isSelected && (
            <Button size="sm" variant="primary" onClick={() => handleSelectVendor(q.id)}>
              <Check className="w-4 h-4" />
            </Button>
          )}
        </div>
      )
    }
  ];

  const getPriceDifference = (price: number) => {
    if (price === minPrice) return '最低价';
    const diff = price - minPrice;
    const percent = ((diff / minPrice) * 100).toFixed(1);
    return `+${formatCurrency(diff)} (${percent}%)`;
  };

  return (
    <div className="p-6 lg:p-8 animate-fade-in space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-slide-up">
        <div>
          <h2 className="text-2xl font-display font-semibold text-warmGray-900">比价记录</h2>
          <p className="text-warmGray-500 mt-1">对比不同供应商的报价</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setAddModalOpen(true)}>添加报价</Button>
      </div>

      <div className="flex flex-wrap gap-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <Button variant={selectedCategory === '' ? 'primary' : 'ghost'} size="sm" onClick={() => setSelectedCategory('')}>
          <Filter className="w-4 h-4" /> 全部
        </Button>
        {CATEGORIES.map(cat => (
          <Button key={cat} variant={selectedCategory === cat ? 'primary' : 'ghost'} size="sm" onClick={() => setSelectedCategory(cat)}>
            {cat}
          </Button>
        ))}
      </div>

      {quotesWithVendor.length > 0 && (
        <Card className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-green-500" />
              比价汇总
            </CardTitle>
            <CardDescription>共 {quotesWithVendor.length} 份报价，最低报价 {formatCurrency(minPrice)}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {quotesWithVendor.map((q, i) => (
                <div key={q.id} className={`p-4 rounded-xl border-2 transition-all ${q.isSelected ? 'border-green-400 bg-green-50' : q.price === minPrice ? 'border-primary-300 bg-primary-50' : 'border-warmGray-100'}`}
                  style={{ animationDelay: `${0.2 + i * 0.05}s` }}>
                  <div className="text-sm text-warmGray-500 mb-1">{q.vendor?.name}</div>
                  <div className={`text-xl font-bold ${q.price === minPrice ? 'text-green-600' : 'text-accent-500'}`}>
                    {formatCurrency(q.price)}
                  </div>
                  <div className={`text-xs mt-1 ${q.price === minPrice ? 'text-green-600 font-medium' : 'text-warmGray-400'}`}>
                    {getPriceDifference(q.price)}
                  </div>
                  {q.isSelected && <Badge variant="success" className="mt-2" dot><Check className="w-3 h-3" /> 已中标</Badge>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <Table columns={columns as any} data={quotesWithVendor as any} rowKey="id" />
      </div>

      <Modal isOpen={!!selectedQuote} onClose={() => setSelectedQuote(null)} title="报价详情" size="lg">
        {selectedQuote && (() => {
          const quote = selectedQuote as any;
          return (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-primary-50 rounded-xl">
                <div>
                  <div className="text-sm text-warmGray-500">供应商</div>
                  <div className="text-lg font-semibold">{quote.vendor?.name}</div>
                  <div className="text-sm text-warmGray-400">{quote.vendor?.category}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-warmGray-500">报价</div>
                  <div className="text-2xl font-bold text-accent-500">{formatCurrency(quote.price)}</div>
                  {quote.price === minPrice && <Badge variant="success" className="mt-1"><TrendingDown className="w-3 h-3" /> 最低价</Badge>}
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-warmGray-50 rounded-xl">
                  <FileText className="w-5 h-5 text-primary-500 mt-0.5" />
                  <div>
                    <div className="text-sm text-warmGray-500">服务内容</div>
                    <div className="text-warmGray-700">{quote.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-warmGray-50 rounded-xl">
                  <Calendar className="w-5 h-5 text-primary-500" />
                  <div>
                    <div className="text-sm text-warmGray-500">报价有效期</div>
                    <div className="text-warmGray-700">{formatDate(quote.validUntil)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-warmGray-50 rounded-xl">
                  <Building2 className="w-5 h-5 text-primary-500" />
                  <div>
                    <div className="text-sm text-warmGray-500">联系方式</div>
                    <div className="text-warmGray-700">{quote.vendor?.contact} · {quote.vendor?.phone}</div>
                  </div>
                </div>
              </div>
              {!quote.isSelected && (
                <Button className="w-full" onClick={() => { handleSelectVendor(quote.id); setSelectedQuote(null); }}>
                  <Check className="w-4 h-4" /> 选择此供应商
                </Button>
              )}
            </div>
          );
        })()}
      </Modal>

      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="添加新报价" footer={
        <>
          <Button variant="ghost" onClick={() => setAddModalOpen(false)}>取消</Button>
          <Button onClick={handleAddQuote}>保存</Button>
        </>
      }>
        <div className="space-y-4">
          <Select label="供应商" options={vendorOptions} value={quoteForm.vendorId} onChange={(e) => setQuoteForm({ ...quoteForm, vendorId: e.target.value })} required />
          <Input label="报价金额" type="number" value={quoteForm.price} onChange={(e) => setQuoteForm({ ...quoteForm, price: e.target.value })} required />
          <Input label="报价有效期" type="date" value={quoteForm.validUntil} onChange={(e) => setQuoteForm({ ...quoteForm, validUntil: e.target.value })} required />
          <Textarea label="服务内容" value={quoteForm.description} onChange={(e) => setQuoteForm({ ...quoteForm, description: e.target.value })} placeholder="请详细描述服务内容..." required />
        </div>
      </Modal>
    </div>
  );
}
