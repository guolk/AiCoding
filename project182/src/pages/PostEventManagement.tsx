import { useState } from 'react';
import {
  Mail, Gift, Image, CheckCircle, Clock, Plus, Edit2, Trash2, Share2,
  Eye, Link, Upload, CheckSquare, Square, Filter,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import { useAppStore } from '@/store';
import {
  formatCurrency, formatDate, formatDateTime,
  getThankYouStatusColor, getThankYouStatusText,
} from '@/utils/formatters';
import type { GiftRecord, GiftType, PhotoAlbum, ThankYou } from '@/types';

const tabs = [
  { id: 'thankYou', label: '感谢信', icon: Mail },
  { id: 'gift', label: '礼金明细', icon: Gift },
  { id: 'album', label: '照片分享', icon: Image },
];

const COLORS = ['#D99B87', '#C47D65', '#8B2635', '#D4AF37'];
const giftTypeOptions = [
  { value: 'cash', label: '现金' }, { value: 'gift', label: '礼物' },
  { value: 'check', label: '支票' }, { value: 'bankTransfer', label: '银行转账' },
];
const thankYouStatusOptions = [
  { value: '', label: '全部' }, { value: 'pending', label: '待发送' },
  { value: 'sent', label: '已发送' }, { value: 'completed', label: '已完成' },
];
const giftTypeText: Record<string, string> = { cash: '现金', gift: '礼物', check: '支票', bankTransfer: '银行转账' };
const giftTypeColor: Record<string, string> = {
  cash: 'bg-green-100 text-green-700', gift: 'bg-pink-100 text-pink-700',
  check: 'bg-blue-100 text-blue-700', bankTransfer: 'bg-purple-100 text-purple-700',
};
const defaultTemplate = `亲爱的[宾客姓名]：

非常感谢您出席我们的婚礼，见证这美好时刻。

您的祝福让我们的婚礼更加圆满。

再次感谢您的关爱与支持！

此致
敬礼

[新人姓名]
[日期]`;

export default function PostEventManagement() {
  const [activeTab, setActiveTab] = useState('thankYou');
  const [thankYouFilter, setThankYouFilter] = useState('');
  const [selectedThankYous, setSelectedThankYous] = useState<string[]>([]);
  const [giftFilter, setGiftFilter] = useState('');
  const [giftModalOpen, setGiftModalOpen] = useState(false);
  const [albumModalOpen, setAlbumModalOpen] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState('');
  const [editingGift, setEditingGift] = useState<GiftRecord | null>(null);
  const [editingAlbum, setEditingAlbum] = useState<PhotoAlbum | null>(null);
  const [giftForm, setGiftForm] = useState({ guestName: '', type: 'cash' as GiftType, amount: 0, description: '', date: '', notes: '' });
  const [albumForm, setAlbumForm] = useState({ name: '', description: '' });

  const { currentEventId, thankYous, guests, giftRecords, photoAlbums,
    addGiftRecord, updateGiftRecord, deleteGiftRecord,
    markThankYouSent, addPhotoAlbum, updatePhotoAlbum } = useAppStore();

  const eventThankYous = thankYous.filter(t => t.eventId === currentEventId);
  const filteredThankYous = thankYouFilter ? eventThankYous.filter(t => t.status === thankYouFilter) : eventThankYous;
  const eventGifts = giftRecords.filter(g => g.eventId === currentEventId);
  const filteredGifts = giftFilter ? eventGifts.filter(g => g.type === giftFilter) : eventGifts;
  const eventAlbums = photoAlbums.filter(a => a.eventId === currentEventId);

  const totalThankYous = eventThankYous.length;
  const sentThankYous = eventThankYous.filter(t => t.status === 'sent').length;
  const pendingThankYous = eventThankYous.filter(t => t.status === 'pending').length;
  const cashTotal = eventGifts.filter(g => g.type === 'cash').reduce((s, g) => s + g.amount, 0);
  const giftTotal = eventGifts.filter(g => g.type === 'gift').reduce((s, g) => s + g.amount, 0);
  const totalIncome = eventGifts.reduce((s, g) => s + g.amount, 0);

  const pieData = [
    { name: '现金', value: eventGifts.filter(g => g.type === 'cash').length, color: COLORS[0] },
    { name: '礼物', value: eventGifts.filter(g => g.type === 'gift').length, color: COLORS[1] },
    { name: '支票', value: eventGifts.filter(g => g.type === 'check').length, color: COLORS[2] },
    { name: '银行转账', value: eventGifts.filter(g => g.type === 'bankTransfer').length, color: COLORS[3] },
  ].filter(d => d.value > 0);

  const handleBulkMarkSent = () => {
    if (selectedThankYous.length === 0) return;
    const now = new Date().toISOString();
    selectedThankYous.forEach(id => markThankYouSent(id, now));
    setSelectedThankYous([]);
  };
  const toggleThankYouSelection = (id: string) => {
    setSelectedThankYous(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };
  const handleViewTemplate = (template: string) => { setCurrentTemplate(template); setTemplateModalOpen(true); };
  const getGuestName = (guestId: string) => guests.find(g => g.id === guestId)?.name || '未知宾客';

  const openGiftModal = (gift?: GiftRecord) => {
    if (gift) { setEditingGift(gift); setGiftForm(gift); }
    else { setEditingGift(null); setGiftForm({ guestName: '', type: 'cash', amount: 0, description: '', date: new Date().toISOString().split('T')[0], notes: '' }); }
    setGiftModalOpen(true);
  };
  const handleSaveGift = () => {
    if (!giftForm.guestName.trim()) return;
    if (editingGift) updateGiftRecord(editingGift.id, { ...giftForm });
    else addGiftRecord({ ...giftForm, eventId: currentEventId });
    setGiftModalOpen(false);
  };

  const openAlbumModal = (album?: PhotoAlbum) => {
    if (album) { setEditingAlbum(album); setAlbumForm({ name: album.name, description: album.description }); }
    else { setEditingAlbum(null); setAlbumForm({ name: '', description: '' }); }
    setAlbumModalOpen(true);
  };
  const handleSaveAlbum = () => {
    if (!albumForm.name.trim()) return;
    if (editingAlbum) updatePhotoAlbum(editingAlbum.id, { ...albumForm });
    else addPhotoAlbum({ ...albumForm, eventId: currentEventId, photoUrls: [], shareLink: '', shareDate: null, isShared: false });
    setAlbumModalOpen(false);
  };
  const handleGenerateLink = (id: string) => {
    updatePhotoAlbum(id, { shareLink: `https://wedding.example.com/album/${Math.random().toString(36).substring(2, 10)}` });
  };
  const handleMarkShared = (id: string) => {
    updatePhotoAlbum(id, { isShared: true, shareDate: new Date().toISOString() });
  };

  const thankYouColumns = [
    { key: 'select', header: '', width: '40px', accessor: (row: ThankYou) => (
      <button onClick={(e) => { e.stopPropagation(); toggleThankYouSelection(row.id); }} className="text-warmGray-400 hover:text-primary-500">
        {selectedThankYous.includes(row.id) ? <CheckSquare className="h-5 w-5 text-primary-500" /> : <Square className="h-5 w-5" />}
      </button>
    )},
    { key: 'guestName', header: '宾客姓名', accessor: (row: ThankYou) => getGuestName(row.guestId) },
    { key: 'status', header: '状态', accessor: (row: ThankYou) => (
      <Badge className={getThankYouStatusColor(row.status)}>{getThankYouStatusText(row.status)}</Badge>
    )},
    { key: 'sentAt', header: '发送时间', accessor: (row: ThankYou) => row.sentAt ? formatDateTime(row.sentAt) : '-' },
    { key: 'template', header: '模板', accessor: (row: ThankYou) => (
      <Button variant="ghost" size="sm" leftIcon={<Eye className="h-4 w-4" />} onClick={() => handleViewTemplate(row.template)}>查看</Button>
    )},
  ];

  const giftColumns = [
    { key: 'date', header: '日期', accessor: (row: GiftRecord) => formatDate(row.date) },
    { key: 'guestName', header: '宾客姓名' },
    { key: 'type', header: '类型', accessor: (row: GiftRecord) => (
      <Badge className={giftTypeColor[row.type]}>{giftTypeText[row.type]}</Badge>
    )},
    { key: 'amount', header: '金额', align: 'right' as const, accessor: (row: GiftRecord) => formatCurrency(row.amount) },
    { key: 'description', header: '描述' },
    { key: 'actions', header: '操作', align: 'center' as const, accessor: (row: GiftRecord) => (
      <div className="flex justify-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => openGiftModal(row)}><Edit2 className="h-4 w-4" /></Button>
        <Button variant="ghost" size="sm" onClick={() => deleteGiftRecord(row.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
      </div>
    )},
  ];

  const StatCard = ({ icon: Icon, title, value, color }: { icon: any; title: string; value: string | number; color: string }) => (
    <Card>
      <div className="flex items-center gap-4">
        <div className={`p-3 ${color} rounded-xl`}><Icon className="h-6 w-6" /></div>
        <div>
          <p className="text-sm text-warmGray-500">{title}</p>
          <p className="text-2xl font-bold text-warmGray-900">{value}</p>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-display font-semibold text-warmGray-900">后续管理</h2>
        <p className="text-warmGray-500 mt-1">活动结束后的感谢和收尾工作</p>
      </div>

      <div className="flex gap-2 p-1 bg-warmGray-100 rounded-xl">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
              activeTab === tab.id ? 'bg-white text-accent-500 shadow-sm' : 'text-warmGray-500 hover:text-warmGray-700'
            }`}>
            <tab.icon className="h-5 w-5" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'thankYou' && (
        <div className="space-y-6 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard icon={Mail} title="总数量" value={totalThankYous} color="bg-primary-100 text-primary-500" />
            <StatCard icon={CheckCircle} title="已发送" value={sentThankYous} color="bg-green-100 text-green-500" />
            <StatCard icon={Clock} title="待发送" value={pendingThankYous} color="bg-amber-100 text-amber-500" />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-warmGray-400" />
              <Select value={thankYouFilter} onChange={(e) => setThankYouFilter(e.target.value)}
                options={thankYouStatusOptions} size="sm" className="w-32" />
            </div>
            <Button onClick={handleBulkMarkSent} disabled={selectedThankYous.length === 0} leftIcon={<CheckCircle className="h-4 w-4" />}>
              批量标记已发送 ({selectedThankYous.length})
            </Button>
          </div>
          <Table columns={thankYouColumns} data={filteredThankYous} rowKey="id" emptyText="暂无感谢信记录" />
        </div>
      )}

      {activeTab === 'gift' && (
        <div className="space-y-6 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard icon={CheckCircle} title="现金总额" value={formatCurrency(cashTotal)} color="bg-green-100 text-green-500" />
            <StatCard icon={Gift} title="礼物总额" value={formatCurrency(giftTotal)} color="bg-pink-100 text-pink-500" />
            <StatCard icon={CheckCircle} title="总收入" value={formatCurrency(totalIncome)} color="bg-champagne-100 text-champagne-500" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <h3 className="text-lg font-semibold text-warmGray-900 mb-4">礼金类型分布</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                      {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-3 justify-center mt-4">
                {pieData.map(item => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-warmGray-600">{item.name} ({item.value})</span>
                  </div>
                ))}
              </div>
            </Card>
            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-warmGray-400" />
                  <Select value={giftFilter} onChange={(e) => setGiftFilter(e.target.value)}
                    options={[{ value: '', label: '全部类型' }, ...giftTypeOptions]} size="sm" className="w-32" />
                </div>
                <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => openGiftModal()}>添加记录</Button>
              </div>
              <Table columns={giftColumns} data={filteredGifts} rowKey="id" emptyText="暂无礼金记录" />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'album' && (
        <div className="space-y-6 animate-slide-up">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-warmGray-900">相册列表</h3>
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => openAlbumModal()}>创建相册</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventAlbums.map(album => (
              <Card key={album.id} hoverable className="animate-slide-up">
                <div className="aspect-video bg-gradient-to-br from-primary-100 to-accent-100 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
                  <Image className="h-12 w-12 text-primary-400" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-warmGray-900/50">
                    <Button variant="secondary" size="sm" leftIcon={<Upload className="h-4 w-4" />}>添加照片</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-warmGray-900">{album.name}</h4>
                    <Badge variant={album.isShared ? 'success' : 'gray'} dot>{album.isShared ? '已分享' : '未分享'}</Badge>
                  </div>
                  <p className="text-sm text-warmGray-500 line-clamp-2">{album.description}</p>
                  <div className="flex items-center gap-4 text-sm text-warmGray-400">
                    <span className="flex items-center gap-1"><Image className="h-4 w-4" />{album.photoUrls.length} 张</span>
                  </div>
                  {album.shareDate && <p className="text-xs text-warmGray-400">分享时间：{formatDateTime(album.shareDate)}</p>}
                  <div className="flex gap-2 pt-2">
                    <Button variant="secondary" size="sm" className="flex-1" onClick={() => openAlbumModal(album)}><Edit2 className="h-4 w-4" /></Button>
                    <Button variant="secondary" size="sm" className="flex-1" disabled={!album.shareLink}
                      onClick={() => navigator.clipboard.writeText(album.shareLink)}><Link className="h-4 w-4" /></Button>
                    <Button variant="primary" size="sm" className="flex-1" onClick={() => handleGenerateLink(album.id)} leftIcon={<Share2 className="h-4 w-4" />}>
                      {album.shareLink ? '重新生成' : '生成链接'}
                    </Button>
                    {!album.isShared && album.shareLink && (
                      <Button variant="accent" size="sm" className="flex-1" onClick={() => handleMarkShared(album.id)}>标记已分享</Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Modal isOpen={giftModalOpen} onClose={() => setGiftModalOpen(false)}
        title={editingGift ? '编辑礼金记录' : '添加礼金记录'} size="md"
        footer={<><Button variant="ghost" onClick={() => setGiftModalOpen(false)}>取消</Button><Button onClick={handleSaveGift}>保存</Button></>}>
        <div className="space-y-4">
          <Input label="宾客姓名" value={giftForm.guestName} onChange={(e) => setGiftForm({ ...giftForm, guestName: e.target.value })} required />
          <Select label="类型" value={giftForm.type} onChange={(e) => setGiftForm({ ...giftForm, type: e.target.value as GiftType })} options={giftTypeOptions} required />
          <Input label="金额" type="number" value={giftForm.amount || ''} onChange={(e) => setGiftForm({ ...giftForm, amount: Number(e.target.value) })} />
          <Input label="日期" type="date" value={giftForm.date} onChange={(e) => setGiftForm({ ...giftForm, date: e.target.value })} required />
          <Input label="描述" value={giftForm.description} onChange={(e) => setGiftForm({ ...giftForm, description: e.target.value })} />
          <Textarea label="备注" value={giftForm.notes} onChange={(e) => setGiftForm({ ...giftForm, notes: e.target.value })} rows={3} />
        </div>
      </Modal>

      <Modal isOpen={albumModalOpen} onClose={() => setAlbumModalOpen(false)}
        title={editingAlbum ? '编辑相册' : '创建相册'} size="md"
        footer={<><Button variant="ghost" onClick={() => setAlbumModalOpen(false)}>取消</Button><Button onClick={handleSaveAlbum}>保存</Button></>}>
        <div className="space-y-4">
          <Input label="相册名称" value={albumForm.name} onChange={(e) => setAlbumForm({ ...albumForm, name: e.target.value })} required />
          <Textarea label="描述" value={albumForm.description} onChange={(e) => setAlbumForm({ ...albumForm, description: e.target.value })} rows={3} />
        </div>
      </Modal>

      <Modal isOpen={templateModalOpen} onClose={() => setTemplateModalOpen(false)} title="感谢信模板" size="lg"
        footer={<Button variant="ghost" onClick={() => setTemplateModalOpen(false)}>关闭</Button>}>
        <div className="p-4 bg-warmGray-50 rounded-xl whitespace-pre-wrap text-warmGray-700 leading-relaxed">
          {currentTemplate || defaultTemplate}
        </div>
      </Modal>
    </div>
  );
}
