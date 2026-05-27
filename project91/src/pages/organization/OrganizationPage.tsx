import { useState } from 'react';
import {
  Building2,
  Users,
  Bell,
  DollarSign,
  Plus,
  Trash2,
  Phone,
  User,
  Megaphone,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import Modal from '@/components/Modal';
import StatusBadge from '@/components/StatusBadge';
import { format } from 'date-fns';

export default function OrganizationPage() {
  const { organization, addGroup, updateGroup, deleteGroup, addAnnouncement, deleteAnnouncement, addFinanceRecord } = useStore();
  const [activeTab, setActiveTab] = useState<'groups' | 'announcements' | 'finances'>('groups');
  
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showFinanceModal, setShowFinanceModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any>(null);

  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    leader: '',
    leaderContact: '',
    responsibilities: '',
  });

  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    author: '',
    priority: 'normal' as const,
  });

  const [financeForm, setFinanceForm] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    category: '',
    description: '',
    operator: '',
  });

  const handleSaveGroup = () => {
    if (groupForm.name) {
      const responsibilities = groupForm.responsibilities.split(',').map(s => s.trim()).filter(Boolean);
      if (editingGroup) {
        updateGroup(editingGroup.id, { ...groupForm, responsibilities });
      } else {
        addGroup({ ...groupForm, responsibilities, members: [] });
      }
      setGroupForm({ name: '', description: '', leader: '', leaderContact: '', responsibilities: '' });
      setEditingGroup(null);
      setShowGroupModal(false);
    }
  };

  const handleSaveAnnouncement = () => {
    if (announcementForm.title && announcementForm.content) {
      addAnnouncement({
        ...announcementForm,
        createdAt: new Date().toISOString(),
      });
      setAnnouncementForm({ title: '', content: '', author: '', priority: 'normal' });
      setShowAnnouncementModal(false);
    }
  };

  const handleSaveFinance = () => {
    if (financeForm.amount && financeForm.category) {
      addFinanceRecord({
        ...financeForm,
        amount: Number(financeForm.amount),
        date: new Date().toISOString().split('T')[0],
      });
      setFinanceForm({ type: 'expense', amount: '', category: '', description: '', operator: '' });
      setShowFinanceModal(false);
    }
  };

  const totalIncome = organization.finances
    .filter((f) => f.type === 'income')
    .reduce((sum, f) => sum + f.amount, 0);
  const totalExpense = organization.finances
    .filter((f) => f.type === 'expense')
    .reduce((sum, f) => sum + f.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">组织管理</h1>
        <p className="text-gray-500 mt-1">{organization.name} - {organization.description}</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { key: 'groups', label: '组织架构', icon: Users },
            { key: 'announcements', label: '公告通知', icon: Megaphone },
            { key: 'finances', label: '资金记录', icon: DollarSign },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === tab.key
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Groups Tab */}
      {activeTab === 'groups' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => {
                setEditingGroup(null);
                setGroupForm({ name: '', description: '', leader: '', leaderContact: '', responsibilities: '' });
                setShowGroupModal(true);
              }}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4" />
              添加小组
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {organization.groups.map((group) => (
              <div key={group.id} className="card p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{group.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{group.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingGroup(group);
                        setGroupForm({
                          name: group.name,
                          description: group.description,
                          leader: group.leader,
                          leaderContact: group.leaderContact,
                          responsibilities: group.responsibilities.join(', '),
                        });
                        setShowGroupModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => deleteGroup(group.id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      删除
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>组长：{group.leader}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>联系电话：{group.leaderContact}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>成员数：{group.members.length} 人</span>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-2">主要职责</p>
                  <div className="flex flex-wrap gap-1">
                    {group.responsibilities.map((resp) => (
                      <span
                        key={resp}
                        className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        {resp}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Announcements Tab */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowAnnouncementModal(true)}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4" />
              发布公告
            </button>
          </div>

          <div className="space-y-4">
            {organization.announcements.map((announcement) => (
              <div key={announcement.id} className="card p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{announcement.title}</h3>
                      <StatusBadge status={announcement.priority} type="priority" />
                    </div>
                    <p className="text-gray-600 whitespace-pre-wrap">{announcement.content}</p>
                    <p className="text-sm text-gray-400 mt-3">
                      {announcement.author} · {format(new Date(announcement.createdAt), 'yyyy-MM-dd HH:mm')}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteAnnouncement(announcement.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Finances Tab */}
      {activeTab === 'finances' && (
        <div className="space-y-4">
          {/* Finance Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">总收入</p>
                  <p className="text-2xl font-bold text-green-600">¥{totalIncome.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">总支出</p>
                  <p className="text-2xl font-bold text-red-600">¥{totalExpense.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">当前余额</p>
                  <p className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    ¥{balance.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setShowFinanceModal(true)}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4" />
              添加记录
            </button>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">日期</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">类型</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">类别</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">描述</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">金额</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">经办人</th>
                  </tr>
                </thead>
                <tbody>
                  {organization.finances.map((record) => (
                    <tr key={record.id} className="border-t border-gray-100">
                      <td className="py-3 px-4 text-gray-600">{record.date}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-sm ${
                            record.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {record.type === 'income' ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          {record.type === 'income' ? '收入' : '支出'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{record.category}</td>
                      <td className="py-3 px-4 text-gray-600">{record.description}</td>
                      <td className={`py-3 px-4 font-medium ${record.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {record.type === 'income' ? '+' : '-'}¥{record.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{record.operator}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Group Modal */}
      <Modal
        isOpen={showGroupModal}
        onClose={() => setShowGroupModal(false)}
        title={editingGroup ? '编辑小组' : '添加小组'}
      >
        <div className="space-y-4">
          <div>
            <label className="label">小组名称 *</label>
            <input
              type="text"
              className="input"
              value={groupForm.name}
              onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
              placeholder="请输入小组名称"
            />
          </div>
          <div>
            <label className="label">小组描述</label>
            <textarea
              className="input"
              value={groupForm.description}
              onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
              placeholder="请输入小组描述"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">组长姓名</label>
              <input
                type="text"
                className="input"
                value={groupForm.leader}
                onChange={(e) => setGroupForm({ ...groupForm, leader: e.target.value })}
                placeholder="组长姓名"
              />
            </div>
            <div>
              <label className="label">联系电话</label>
              <input
                type="text"
                className="input"
                value={groupForm.leaderContact}
                onChange={(e) => setGroupForm({ ...groupForm, leaderContact: e.target.value })}
                placeholder="联系电话"
              />
            </div>
          </div>
          <div>
            <label className="label">主要职责（逗号分隔）</label>
            <input
              type="text"
              className="input"
              value={groupForm.responsibilities}
              onChange={(e) => setGroupForm({ ...groupForm, responsibilities: e.target.value })}
              placeholder="如：活动策划, 场地协调, 流程把控"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowGroupModal(false)}
              className="btn btn-secondary"
            >
              取消
            </button>
            <button onClick={handleSaveGroup} className="btn btn-primary">
              {editingGroup ? '保存修改' : '添加'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Announcement Modal */}
      <Modal
        isOpen={showAnnouncementModal}
        onClose={() => setShowAnnouncementModal(false)}
        title="发布公告"
      >
        <div className="space-y-4">
          <div>
            <label className="label">标题 *</label>
            <input
              type="text"
              className="input"
              value={announcementForm.title}
              onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
              placeholder="请输入公告标题"
            />
          </div>
          <div>
            <label className="label">内容 *</label>
            <textarea
              className="input min-h-[150px]"
              value={announcementForm.content}
              onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
              placeholder="请输入公告内容"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">发布人</label>
              <input
                type="text"
                className="input"
                value={announcementForm.author}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, author: e.target.value })}
                placeholder="发布人姓名"
              />
            </div>
            <div>
              <label className="label">优先级</label>
              <select
                className="input"
                value={announcementForm.priority}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, priority: e.target.value as any })}
              >
                <option value="normal">普通</option>
                <option value="important">重要</option>
                <option value="urgent">紧急</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowAnnouncementModal(false)}
              className="btn btn-secondary"
            >
              取消
            </button>
            <button onClick={handleSaveAnnouncement} className="btn btn-primary">
              发布
            </button>
          </div>
        </div>
      </Modal>

      {/* Finance Modal */}
      <Modal
        isOpen={showFinanceModal}
        onClose={() => setShowFinanceModal(false)}
        title="添加资金记录"
      >
        <div className="space-y-4">
          <div>
            <label className="label">类型</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="type"
                  value="income"
                  checked={financeForm.type === 'income'}
                  onChange={(e) => setFinanceForm({ ...financeForm, type: 'income' })}
                />
                <span>收入</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="type"
                  value="expense"
                  checked={financeForm.type === 'expense'}
                  onChange={(e) => setFinanceForm({ ...financeForm, type: 'expense' })}
                />
                <span>支出</span>
              </label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">金额 *</label>
              <input
                type="number"
                className="input"
                value={financeForm.amount}
                onChange={(e) => setFinanceForm({ ...financeForm, amount: e.target.value })}
                placeholder="请输入金额"
              />
            </div>
            <div>
              <label className="label">类别 *</label>
              <input
                type="text"
                className="input"
                value={financeForm.category}
                onChange={(e) => setFinanceForm({ ...financeForm, category: e.target.value })}
                placeholder="如：活动物资、宣传费用"
              />
            </div>
          </div>
          <div>
            <label className="label">描述</label>
            <input
              type="text"
              className="input"
              value={financeForm.description}
              onChange={(e) => setFinanceForm({ ...financeForm, description: e.target.value })}
              placeholder="请输入描述"
            />
          </div>
          <div>
            <label className="label">经办人</label>
            <input
              type="text"
              className="input"
              value={financeForm.operator}
              onChange={(e) => setFinanceForm({ ...financeForm, operator: e.target.value })}
              placeholder="经办人姓名"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowFinanceModal(false)}
              className="btn btn-secondary"
            >
              取消
            </button>
            <button onClick={handleSaveFinance} className="btn btn-primary">
              添加
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
