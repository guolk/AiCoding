import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Clock, Package, Globe } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Modal, DataTable } from '@/components/ui';
import { ItemDonationForm } from '@/components/forms';
import type { ItemDonation } from '../../shared/types';

function formatDate(dateStr: string): string {
  return dateStr.split('T')[0];
}

type TabType = 'volunteer' | 'items' | 'online';

export default function ItemDonations() {
  const navigate = useNavigate();
  const {
    itemDonations,
    loading,
    loadItemDonations,
    addItemDonation,
    updateItemDonation,
    deleteItemDonation,
    getInstitutionName,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<TabType>('items');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ItemDonation | null>(null);

  useEffect(() => {
    loadItemDonations();
  }, [loadItemDonations]);

  const itemData = itemDonations
    .map(v => ({
      ...v,
      institution_name: v.institution_name || getInstitutionName(v.institution_id),
    }))
    .sort((a, b) => new Date(b.donation_date).getTime() - new Date(a.donation_date).getTime());

  const handleAdd = () => {
    setEditingRecord(null);
    setModalOpen(true);
  };

  const handleEdit = (record: ItemDonation) => {
    setEditingRecord(record);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('确定要删除这条捐物记录吗？')) {
      await deleteItemDonation(id);
    }
  };

  const handleSubmit = async (data: Partial<ItemDonation>) => {
    let success = false;
    if (editingRecord) {
      success = await updateItemDonation(editingRecord.id, data);
    } else {
      success = await addItemDonation(data);
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
    { key: 'donation_date' as keyof ItemDonation, title: '日期', sortable: true, render: (v: ItemDonation[keyof ItemDonation]) => formatDate(v as string) },
    { key: 'item_name' as keyof ItemDonation, title: '物品名称' },
    { key: 'quantity' as keyof ItemDonation, title: '数量', sortable: true },
    { key: 'condition' as keyof ItemDonation, title: '状态' },
    { key: 'institution_name' as keyof ItemDonation, title: '机构' },
    {
      key: 'id' as keyof ItemDonation,
      title: '操作',
      render: (_: ItemDonation[keyof ItemDonation], row: ItemDonation) => (
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

        <DataTable<ItemDonation>
          columns={columns}
          data={itemData}
        />
      </div>

      <Modal
        isOpen={modalOpen}
        title={editingRecord ? '编辑捐物记录' : '添加捐物记录'}
        onClose={handleCancel}
      >
        <ItemDonationForm
          initialData={editingRecord || undefined}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </Modal>
    </>
  );
}
