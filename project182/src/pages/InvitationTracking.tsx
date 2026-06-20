import { useState, useMemo } from 'react';
import {
  Send, Mail, MessageCircle, Phone, FileText, MoreHorizontal,
  Check, CheckCheck, Eye, MessageSquare, Calendar,
  SendHorizonal, CheckSquare, Square, Filter, Edit2
} from 'lucide-react';
import { useAppStore } from '@/store';
import { getInvitationStatusColor, getInvitationStatusText, formatDateTime } from '@/utils/formatters';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Textarea } from '@/components/ui/Textarea';
import type { Invitation, InvitationStatus } from '@/types';
import { cn } from '@/lib/utils';

const methodIcons: Record<string, React.ReactNode> = {
  wechat: <MessageCircle className="w-4 h-4" />,
  email: <Mail className="w-4 h-4" />,
  paper: <FileText className="w-4 h-4" />,
  phone: <Phone className="w-4 h-4" />,
  other: <MoreHorizontal className="w-4 h-4" />,
};

const methodLabels: Record<string, string> = {
  wechat: '微信', email: '邮件', paper: '纸质', phone: '电话', other: '其他'
};

export default function InvitationTracking() {
  const {
    invitations, guests,
    updateInvitation, bulkSendInvitations
  } = useAppStore();

  const [filterStatus, setFilterStatus] = useState('');
  const [filterMethod, setFilterMethod] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null);
  const [responseNotes, setResponseNotes] = useState('');
  const [statusUpdate, setStatusUpdate] = useState<InvitationStatus>('draft');

  const stats = useMemo(() => {
    const sent = invitations.filter(i => i.status !== 'draft').length;
    const responded = invitations.filter(i => i.status === 'responded').length;
    return {
      total: invitations.length,
      sent,
      responded,
      rate: sent > 0 ? Math.round((responded / sent) * 100) : 0
    };
  }, [invitations]);

  const filteredInvitations = useMemo(() => {
    return invitations.filter(i => {
      const matchStatus = !filterStatus || i.status === filterStatus;
      const matchMethod = !filterMethod || i.method === filterMethod;
      return matchStatus && matchMethod;
    });
  }, [invitations, filterStatus, filterMethod]);

  const getGuestName = (guestId: string) => guests.find(g => g.id === guestId)?.name || '-';

  const toggleSelectAll = () => {
    setSelectedIds(selectedIds.length === filteredInvitations.length ? [] : filteredInvitations.map(i => i.id));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkSend = () => {
    if (selectedIds.length === 0) return;
    bulkSendInvitations(selectedIds);
    setSelectedIds([]);
  };

  const openDetailModal = (invitation: Invitation) => {
    setSelectedInvitation(invitation);
    setResponseNotes(invitation.responseNotes);
    setStatusUpdate(invitation.status);
    setIsDetailModalOpen(true);
  };

  const handleStatusUpdate = () => {
    if (!selectedInvitation) return;
    const updates: Partial<Invitation> = { status: statusUpdate, responseNotes };
    if (statusUpdate === 'sent' && !selectedInvitation.sentAt) {
      updates.sentAt = new Date().toISOString();
    }
    if (statusUpdate === 'responded' && !selectedInvitation.respondedAt) {
      updates.respondedAt = new Date().toISOString();
    }
    updateInvitation(selectedInvitation.id, updates);
    setIsDetailModalOpen(false);
  };

  const handleSendAll = () => {
    const draftIds = invitations.filter(i => i.status === 'draft').map(i => i.id);
    if (draftIds.length === 0) return;
    bulkSendInvitations(draftIds);
  };

  const columns = [
    {
      key: 'select',
      header: (
        <button onClick={toggleSelectAll} className="p-1 hover:bg-warmGray-100 rounded">
          {selectedIds.length === filteredInvitations.length && filteredInvitations.length > 0
            ? <CheckSquare className="w-4 h-4 text-primary-500" />
            : <Square className="w-4 h-4 text-warmGray-400" />}
        </button>
      ),
      accessor: (row: Invitation) => (
        <button onClick={() => toggleSelect(row.id)} className="p-1 hover:bg-warmGray-100 rounded">
          {selectedIds.includes(row.id)
            ? <CheckSquare className="w-4 h-4 text-primary-500" />
            : <Square className="w-4 h-4 text-warmGray-400" />}
        </button>
      ),
      width: '40px',
    },
    { key: 'guest', header: '宾客', accessor: (i: Invitation) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-accent-100 flex items-center justify-center">
          <span className="text-sm font-medium text-accent-600">{getGuestName(i.guestId)[0]}</span>
        </div>
        <span className="font-medium">{getGuestName(i.guestId)}</span>
      </div>
    )},
    { key: 'method', header: '发送方式', accessor: (i: Invitation) => (
      <Badge variant="secondary" dot className="flex items-center gap-1.5">
        {methodIcons[i.method]}
        {methodLabels[i.method]}
      </Badge>
    )},
    { key: 'status', header: '发送状态', accessor: (i: Invitation) => (
      <span className={cn('px-2 py-1 rounded-full text-xs font-medium', getInvitationStatusColor(i.status))}>
        {getInvitationStatusText(i.status)}
      </span>
    )},
    { key: 'sentAt', header: '发送时间', accessor: (i: Invitation) => (
      <div className="text-sm">
        {i.sentAt ? (
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-warmGray-400" />
            {formatDateTime(i.sentAt)}
          </div>
        ) : <span className="text-warmGray-400">-</span>}
      </div>
    )},
    { key: 'respondedAt', header: '回复时间', accessor: (i: Invitation) => (
      <div className="text-sm">
        {i.respondedAt ? (
          <div className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3 text-green-500" />
            {formatDateTime(i.respondedAt)}
          </div>
        ) : <span className="text-warmGray-400">-</span>}
      </div>
    )},
    { key: 'actions', header: '操作', accessor: (i: Invitation) => (
      <Button variant="ghost" size="sm" leftIcon={<Edit2 className="w-3.5 h-3.5" />}
        onClick={() => openDetailModal(i)}>
        管理
      </Button>
    ), align: 'right' as const},
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold text-accent-500">请柬追踪</h1>
          <p className="text-warmGray-500 mt-1">管理请柬发送和宾客回复状态</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleSendAll}
            disabled={!invitations.some(i => i.status === 'draft')}>
            一键发送全部
          </Button>
          <Button leftIcon={<SendHorizonal className="w-4 h-4" />} onClick={handleBulkSend}
            disabled={selectedIds.length === 0}>
            批量发送 ({selectedIds.length})
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: '总请柬数', value: stats.total, icon: FileText, color: 'bg-primary-100 text-primary-600' },
          { label: '已发送', value: stats.sent, icon: Send, color: 'bg-blue-100 text-blue-600' },
          { label: '已回复', value: stats.responded, icon: CheckCheck, color: 'bg-green-100 text-green-600' },
          { label: '回复率', value: `${stats.rate}%`, icon: Eye, color: 'bg-champagne-100 text-champagne-600' },
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
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Select
            placeholder="发送状态"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={[
              { value: 'draft', label: '草稿' },
              { value: 'sent', label: '已发送' },
              { value: 'delivered', label: '已送达' },
              { value: 'opened', label: '已打开' },
              { value: 'responded', label: '已回复' },
            ]}
            className="w-36"
          />
          <Select
            placeholder="发送方式"
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            options={[
              { value: 'wechat', label: '微信' },
              { value: 'email', label: '邮件' },
              { value: 'paper', label: '纸质' },
              { value: 'phone', label: '电话' },
              { value: 'other', label: '其他' },
            ]}
            className="w-36"
          />
          <Button variant="ghost" leftIcon={<Filter className="w-4 h-4" />}
            onClick={() => { setFilterStatus(''); setFilterMethod(''); setSelectedIds([]); }}>
            重置筛选
          </Button>
        </div>

        <Table
          columns={columns}
          data={filteredInvitations}
          rowKey="id"
          emptyText="暂无请柬数据"
        />
      </Card>

      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="请柬详情"
        description={`宾客: ${selectedInvitation ? getGuestName(selectedInvitation.guestId) : ''}`}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsDetailModalOpen(false)}>取消</Button>
            <Button onClick={handleStatusUpdate}>保存状态</Button>
          </>
        }
      >
        {selectedInvitation && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-warmGray-50 rounded-xl">
                <div className="text-sm text-warmGray-500 mb-1">发送方式</div>
                <div className="flex items-center gap-2 font-medium text-warmGray-800">
                  {methodIcons[selectedInvitation.method]}
                  {methodLabels[selectedInvitation.method]}
                </div>
              </div>
              <div className="p-4 bg-warmGray-50 rounded-xl">
                <div className="text-sm text-warmGray-500 mb-1">模板</div>
                <div className="font-medium text-warmGray-800">{selectedInvitation.template}</div>
              </div>
              <div className="p-4 bg-warmGray-50 rounded-xl">
                <div className="text-sm text-warmGray-500 mb-1">发送时间</div>
                <div className="font-medium text-warmGray-800">
                  {selectedInvitation.sentAt ? formatDateTime(selectedInvitation.sentAt) : '未发送'}
                </div>
              </div>
              <div className="p-4 bg-warmGray-50 rounded-xl">
                <div className="text-sm text-warmGray-500 mb-1">回复时间</div>
                <div className="font-medium text-warmGray-800">
                  {selectedInvitation.respondedAt ? formatDateTime(selectedInvitation.respondedAt) : '未回复'}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-warmGray-700 mb-2">更新状态</label>
              <div className="grid grid-cols-5 gap-2">
                {(['draft', 'sent', 'delivered', 'opened', 'responded'] as InvitationStatus[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusUpdate(status)}
                    className={cn(
                      'p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1',
                      statusUpdate === status
                        ? 'border-primary-400 bg-primary-50'
                        : 'border-warmGray-200 hover:border-warmGray-300'
                    )}
                  >
                    {status === 'draft' && <FileText className={cn('w-5 h-5', statusUpdate === status ? 'text-primary-500' : 'text-warmGray-400')} />}
                    {status === 'sent' && <Send className={cn('w-5 h-5', statusUpdate === status ? 'text-primary-500' : 'text-warmGray-400')} />}
                    {status === 'delivered' && <Check className={cn('w-5 h-5', statusUpdate === status ? 'text-primary-500' : 'text-warmGray-400')} />}
                    {status === 'opened' && <Eye className={cn('w-5 h-5', statusUpdate === status ? 'text-primary-500' : 'text-warmGray-400')} />}
                    {status === 'responded' && <CheckCheck className={cn('w-5 h-5', statusUpdate === status ? 'text-primary-500' : 'text-warmGray-400')} />}
                    <span className="text-xs font-medium text-warmGray-700">{getInvitationStatusText(status)}</span>
                  </button>
                ))}
              </div>
            </div>

            <Textarea
              label="回复备注"
              value={responseNotes}
              onChange={(e) => setResponseNotes(e.target.value)}
              placeholder="记录宾客回复的特殊要求或备注信息..."
              rows={4}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
