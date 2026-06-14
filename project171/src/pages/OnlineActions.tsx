import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Clock, Package, Globe } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Modal, DataTable } from '@/components/ui';
import { OnlineActionForm } from '@/components/forms';
import type { OnlineAction } from '../../shared/types';

function formatDate(dateStr: string): string {
  return dateStr.split('T')[0];
}

type TabType = 'volunteer' | 'items' | 'online';

export default function OnlineActions() {
  const navigate = useNavigate();
  const {
    onlineActions,
    loading,
    loadOnlineActions,
    addOnlineAction,
    updateOnlineAction,
    deleteOnlineAction,
    getInstitutionName,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<TabType>('online');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<OnlineAction | null>(null);

  useEffect(() => {
    loadOnlineActions();
  }, [loadOnlineActions]);

  const actionData = onlineActions
    .map(v => ({
      ...v,
      institution_name: v.institution_name || getInstitutionName(v.institution_id),
    }))
    .sort((a, b) => new Date(b.action_date).getTime() - new Date(a.action_date).getTime());

  const handleAdd = () => {
    setEditingRecord(null);
    setModalOpen(true);
  };

  const handleEdit = (record: OnlineAction) => {
    setEditingRecord(record);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('确定要删除这条线上行动记录吗？')) {
      await deleteOnlineAction(id);
    }
  };

  const handleSubmit = async (data: Partial<OnlineAction>) => {
    let success = false;
    if (editingRecord) {
      success = await updateOnlineAction(editingRecord.id, data);
    } else {
      success = await addOnlineAction(data);
    }
    if (success) {
      setModalOpen(false);
      setEditingRecord(null);
    }
  };

  const handleCancel = () => {
    setModalOpen(false);
    setEditingRecord(null);
  };

  const columns = [
    { key: 'action_date' as keyof OnlineAction, title: '日期', sortable: true, render: (v: OnlineAction[keyof OnlineAction]) => formatDate(v as string) },
    { key: 'action_type' as keyof OnlineAction, title: '行动类型' },
    { key: 'initiative_name' as keyof OnlineAction, title: '活动名称' },
    { key: 'institution_name' as keyof OnlineAction, title: '机构' },
    {
      key: 'id' as keyof OnlineAction,
      title: '操作',
      render: (_: OnlineAction[keyof OnlineAction], row: OnlineAction) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); handleEdit(row); }}
            className="p-2 text-forest-400 hover:text-terracotta-500 hover:bg-terracotta-50 rounded-lg transition-colors"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }}
            className="p-2 text-forest-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-terracotta-400 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex gap-2 bg-forest-50 p-1 rounded-xl">
            <button
              onClick={() => { setActiveTab('volunteer'); navigate('/participation/volunteer'); }}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'volunteer'
                  ? 'bg-white text-terracotta-500 shadow-soft'
                  : 'text-forest-400 hover:text-forest-500'
              }`}
            >
              <Clock size={18} />
              志愿服务
            </button>
            <button
              onClick={() => { setActiveTab('items'); navigate('/participation/items'); }}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'items'
                  ? 'bg-white text-terracotta-500 shadow-soft'
                  : 'text-forest-400 hover:text-forest-500'
              }`}
            >
              <Package size={18} />
              捐物记录
            </button>
            <button
              onClick={() => { setActiveTab('online'); navigate('/participation/online'); }}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'online'
                  ? 'bg-white text-terracotta-500 shadow-soft'
                  : 'text-forest-400 hover:text-forest-500'
              }`}
            >
              <Globe size={18} />
              线上行动
            </button>
          </div>
          <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            添加记录
          </button>
        </div>

        <DataTable<OnlineAction>
          columns={columns}
          data={actionData}
        />
      </div>

      <Modal
        isOpen={modalOpen}
        title={editingRecord ? '编辑线上行动' : '添加线上行动'}
        onClose={handleCancel}
      >
        <OnlineActionForm
          initialData={editingRecord || undefined}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </Modal>
    </>
  );
}
