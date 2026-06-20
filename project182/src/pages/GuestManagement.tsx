import { useState, useMemo } from 'react';
import {
  Users, Plus, Edit2, Trash2, Search, Filter, CheckSquare,
  Square, UserPlus, Phone, Mail, Utensils, Users2, Check, X, MoreHorizontal
} from 'lucide-react';
import { useAppStore } from '@/store';
import { getRSVPStatusColor, getRSVPStatusText } from '@/utils/formatters';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Textarea } from '@/components/ui/Textarea';
import type { Guest, RSVPStatus } from '@/types';
import { cn } from '@/lib/utils';

export default function GuestManagement() {
  const {
    guests, tables, currentEventId,
    addGuest, updateGuest, deleteGuest, bulkUpdateGuests
  } = useAppStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState('');
  const [filterRSVP, setFilterRSVP] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Partial<Guest> | null>(null);
  const [bulkAction, setBulkAction] = useState<'rsvp' | 'table' | null>(null);
  const [bulkValue, setBulkValue] = useState('');

  const [formData, setFormData] = useState({
    name: '', relation: '', phone: '', email: '',
    dietaryRestrictions: '', plusOne: false, plusOneName: '', notes: '', group: ''
  });

  const groups = useMemo(() => [...new Set(guests.map(g => g.group))], [guests]);

  const filteredGuests = useMemo(() => {
    return guests.filter(g => {
      const matchSearch = g.name.includes(searchTerm) || g.phone.includes(searchTerm);
      const matchGroup = !filterGroup || g.group === filterGroup;
      const matchRSVP = !filterRSVP || g.rsvpStatus === filterRSVP;
      return matchSearch && matchGroup && matchRSVP;
    });
  }, [guests, searchTerm, filterGroup, filterRSVP]);

  const stats = useMemo(() => ({
    total: guests.length,
    confirmed: guests.filter(g => g.rsvpStatus === 'confirmed').length,
    pending: guests.filter(g => g.rsvpStatus === 'pending').length,
    declined: guests.filter(g => g.rsvpStatus === 'declined').length,
  }), [guests]);

  const openAddModal = () => {
    setEditingGuest(null);
    setFormData({ name: '', relation: '', phone: '', email: '', dietaryRestrictions: '', plusOne: false, plusOneName: '', notes: '', group: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (guest: Guest) => {
    setEditingGuest(guest);
    setFormData({
      name: guest.name, relation: guest.relation, phone: guest.phone, email: guest.email,
      dietaryRestrictions: guest.dietaryRestrictions, plusOne: guest.plusOne,
      plusOneName: guest.plusOneName, notes: guest.notes, group: guest.group
    });
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) return;
    if (editingGuest?.id) {
      updateGuest(editingGuest.id, formData);
    } else {
      addGuest({ ...formData, eventId: currentEventId, tableId: null, seatNumber: null, rsvpStatus: 'pending' });
    }
    setIsModalOpen(false);
  };

  const toggleSelectAll = () => {
    setSelectedIds(selectedIds.length === filteredGuests.length ? [] : filteredGuests.map(g => g.id));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkAction = () => {
    if (!bulkAction || !bulkValue || selectedIds.length === 0) return;
    const updates = bulkAction === 'rsvp'
      ? { rsvpStatus: bulkValue as RSVPStatus }
      : { tableId: bulkValue || null };
    bulkUpdateGuests(selectedIds, updates);
    setBulkAction(null);
    setBulkValue('');
    setSelectedIds([]);
  };

  const getTableName = (tableId: string | null) => {
    return tables.find(t => t.id === tableId)?.name || '未分配';
  };

  const columns = [
    {
      key: 'select',
      header: (
        <button onClick={toggleSelectAll} className="p-1 hover:bg-warmGray-100 rounded">
          {selectedIds.length === filteredGuests.length && filteredGuests.length > 0
            ? <CheckSquare className="w-4 h-4 text-primary-500" />
            : <Square className="w-4 h-4 text-warmGray-400" />}
        </button>
      ),
      accessor: (row: Guest) => (
        <button onClick={() => toggleSelect(row.id)} className="p-1 hover:bg-warmGray-100 rounded">
          {selectedIds.includes(row.id)
            ? <CheckSquare className="w-4 h-4 text-primary-500" />
            : <Square className="w-4 h-4 text-warmGray-400" />}
        </button>
      ),
      width: '40px',
    },
    { key: 'name', header: '姓名', accessor: (g: Guest) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
          <span className="text-sm font-medium text-primary-600">{g.name[0]}</span>
        </div>
        <span className="font-medium">{g.name}</span>
      </div>
    )},
    { key: 'relation', header: '关系', accessor: (g: Guest) => (
      <Badge variant="champagne" dot>{g.relation}</Badge>
    )},
    { key: 'phone', header: '联系方式', accessor: (g: Guest) => (
      <div className="space-y-1">
        <div className="flex items-center gap-1 text-sm"><Phone className="w-3 h-3" />{g.phone}</div>
        {g.email && <div className="flex items-center gap-1 text-xs text-warmGray-500"><Mail className="w-3 h-3" />{g.email}</div>}
      </div>
    )},
    { key: 'dietary', header: '饮食禁忌', accessor: (g: Guest) => (
      <div className="flex items-center gap-1">
        <Utensils className="w-4 h-4 text-warmGray-400" />
        <span className={cn(!g.dietaryRestrictions && 'text-warmGray-400')}>
          {g.dietaryRestrictions || '无'}
        </span>
      </div>
    )},
    { key: 'table', header: '桌位', accessor: (g: Guest) => (
      <Badge variant="secondary" dot>{getTableName(g.tableId)}</Badge>
    )},
    { key: 'rsvp', header: '出席状态', accessor: (g: Guest) => (
      <span className={cn('px-2 py-1 rounded-full text-xs font-medium', getRSVPStatusColor(g.rsvpStatus))}>
        {getRSVPStatusText(g.rsvpStatus)}
      </span>
    )},
    { key: 'actions', header: '操作', accessor: (g: Guest) => (
      <div className="flex items-center gap-1">
        <button onClick={() => openEditModal(g)} className="p-1.5 hover:bg-primary-100 rounded-lg text-primary-500 transition-colors">
          <Edit2 className="w-4 h-4" />
        </button>
        <button onClick={() => deleteGuest(g.id)} className="p-1.5 hover:bg-red-100 rounded-lg text-red-500 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    ), align: 'right' as const},
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold text-accent-500">宾客名单管理</h1>
          <p className="text-warmGray-500 mt-1">管理受邀宾客信息和出席状态</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={openAddModal}>
          添加宾客
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: '总人数', value: stats.total, icon: Users, color: 'bg-primary-100 text-primary-600' },
          { label: '已确认', value: stats.confirmed, icon: Check, color: 'bg-green-100 text-green-600' },
          { label: '待确认', value: stats.pending, icon: MoreHorizontal, color: 'bg-yellow-100 text-yellow-600' },
          { label: '婉拒', value: stats.declined, icon: X, color: 'bg-red-100 text-red-600' },
        ].map((item, i) => (
          <Card key={item.label} className="animate-slide-up" style={{ animationDelay: `${0.1 * i}s` }}>
            <div className="flex items-center gap-3">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', item.color)}>
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-bold text-warmGray-800">{item.value}</div>
                <div className="text-sm text-warmGray-500">{item.label}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          <Input
            placeholder="搜索姓名或电话..."
            leftIcon={<Search className="w-4 h-4" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="lg:max-w-xs"
          />
          <div className="flex flex-wrap gap-3">
            <Select
              placeholder="按关系分组"
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              options={groups.map(g => ({ value: g, label: g }))}
              className="w-40"
            />
            <Select
              placeholder="出席状态"
              value={filterRSVP}
              onChange={(e) => setFilterRSVP(e.target.value)}
              options={[
                { value: 'confirmed', label: '已确认' },
                { value: 'pending', label: '待确认' },
                { value: 'declined', label: '婉拒' },
                { value: 'maybe', label: '可能出席' },
              ]}
              className="w-36"
            />
            <Button variant="ghost" leftIcon={<Filter className="w-4 h-4" />}
              onClick={() => { setFilterGroup(''); setFilterRSVP(''); setSearchTerm(''); }}>
              重置筛选
            </Button>
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 p-3 bg-primary-50 rounded-xl mb-4 animate-slide-down">
            <span className="text-sm text-primary-700">已选择 {selectedIds.length} 人</span>
            <Select
              placeholder="批量设置出席状态"
              value={bulkAction === 'rsvp' ? bulkValue : ''}
              onChange={(e) => { setBulkAction('rsvp'); setBulkValue(e.target.value); }}
              options={[
                { value: 'confirmed', label: '已确认' },
                { value: 'pending', label: '待确认' },
                { value: 'declined', label: '婉拒' },
              ]}
              className="w-44"
            />
            <Select
              placeholder="批量分配桌位"
              value={bulkAction === 'table' ? bulkValue : ''}
              onChange={(e) => { setBulkAction('table'); setBulkValue(e.target.value); }}
              options={tables.map(t => ({ value: t.id, label: t.name }))}
              className="w-40"
            />
            <Button size="sm" onClick={handleBulkAction} disabled={!bulkAction || !bulkValue}>
              应用
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { setBulkAction(null); setBulkValue(''); setSelectedIds([]); }}>
              取消
            </Button>
          </div>
        )}

        <Table
          columns={columns}
          data={filteredGuests}
          rowKey="id"
          emptyText="暂无宾客数据"
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingGuest ? '编辑宾客' : '添加宾客'}
        description="填写宾客详细信息"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>取消</Button>
            <Button onClick={handleSubmit}>{editingGuest ? '保存修改' : '添加宾客'}</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="姓名" required value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            leftIcon={<UserPlus className="w-4 h-4" />} />
          <Input label="关系" required value={formData.relation}
            onChange={(e) => setFormData({ ...formData, relation: e.target.value })} />
          <Input label="电话" required value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            leftIcon={<Phone className="w-4 h-4" />} />
          <Input label="邮箱" value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            leftIcon={<Mail className="w-4 h-4" />} />
          <Input label="分组" value={formData.group}
            onChange={(e) => setFormData({ ...formData, group: e.target.value })}
            leftIcon={<Users2 className="w-4 h-4" />} />
          <Input label="饮食禁忌" value={formData.dietaryRestrictions}
            onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
            leftIcon={<Utensils className="w-4 h-4" />} />
          <div className="md:col-span-2 flex items-center gap-3 p-3 bg-warmGray-50 rounded-xl">
            <input type="checkbox" id="plusOne" checked={formData.plusOne}
              onChange={(e) => setFormData({ ...formData, plusOne: e.target.checked })}
              className="w-4 h-4 text-primary-500 rounded" />
            <label htmlFor="plusOne" className="text-sm font-medium text-warmGray-700">是否带家属</label>
          </div>
          {formData.plusOne && (
            <Input label="家属姓名" value={formData.plusOneName}
              onChange={(e) => setFormData({ ...formData, plusOneName: e.target.value })}
              className="md:col-span-2" />
          )}
          <Textarea label="备注" value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="md:col-span-2" rows={3} />
        </div>
      </Modal>
    </div>
  );
}
