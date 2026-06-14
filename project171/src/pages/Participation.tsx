import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Clock, Package, Globe } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Modal, DataTable } from '@/components/ui';
import { VolunteerForm, ItemDonationForm, OnlineActionForm } from '@/components/forms';
import type { VolunteerRecord, ItemDonation, OnlineAction } from '../../shared/types';

type TabType = 'volunteer' | 'items' | 'online';

function formatDate(dateStr: string): string {
  return dateStr.split('T')[0];
}

export default function Participation() {
  const {
    volunteerRecords,
    itemDonations,
    onlineActions,
    loading,
    loadVolunteerRecords,
    loadItemDonations,
    loadOnlineActions,
    addVolunteerRecord,
    updateVolunteerRecord,
    deleteVolunteerRecord,
    addItemDonation,
    updateItemDonation,
    deleteItemDonation,
    addOnlineAction,
    updateOnlineAction,
    deleteOnlineAction,
    getInstitutionName,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<TabType>('volunteer');
  const [modalType, setModalType] = useState<'volunteer' | 'items' | 'online' | null>(null);
  const [editingVolunteer, setEditingVolunteer] = useState<VolunteerRecord | null>(null);
  const [editingItem, setEditingItem] = useState<ItemDonation | null>(null);
  const [editingAction, setEditingAction] = useState<OnlineAction | null>(null);

  useEffect(() => {
    loadVolunteerRecords();
    loadItemDonations();
    loadOnlineActions();
  }, [loadVolunteerRecords, loadItemDonations, loadOnlineActions]);

  const volunteerData = volunteerRecords
    .map(v => ({
      ...v,
      institution_name: v.institution_name || getInstitutionName(v.institution_id),
    }))
    .sort((a, b) => new Date(b.service_date).getTime() - new Date(a.service_date).getTime());

  const itemData = itemDonations
    .map(v => ({
      ...v,
      institution_name: v.institution_name || getInstitutionName(v.institution_id),
    }))
    .sort((a, b) => new Date(b.donation_date).getTime() - new Date(a.donation_date).getTime());

  const actionData = onlineActions
    .map(v => ({
      ...v,
      institution_name: v.institution_name || getInstitutionName(v.institution_id),
    }))
    .sort((a, b) => new Date(b.action_date).getTime() - new Date(a.action_date).getTime());

  const handleAdd = () => {
    setEditingVolunteer(null);
    setEditingItem(null);
    setEditingAction(null);
    setModalType(activeTab);
  };

  const handleEditVolunteer = (record: VolunteerRecord) => {
    setEditingVolunteer(record);
    setModalType('volunteer');
  };

  const handleEditItem = (record: ItemDonation) => {
    setEditingItem(record);
    setModalType('items');
  };

  const handleEditAction = (record: OnlineAction) => {
    setEditingAction(record);
    setModalType('online');
  };

  const handleDeleteVolunteer = async (id: number) => {
    if (confirm('确定要删除这条志愿服务记录吗？')) {
      await deleteVolunteerRecord(id);
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (confirm('确定要删除这条捐物记录吗？')) {
      await deleteItemDonation(id);
    }
  };

  const handleDeleteAction = async (id: number) => {
    if (confirm('确定要删除这条线上行动记录吗？')) {
      await deleteOnlineAction(id);
    }
  };

  const handleVolunteerSubmit = async (data: Partial<VolunteerRecord>) => {
    let success = false;
    if (editingVolunteer) {
      success = await updateVolunteerRecord(editingVolunteer.id, data);
    } else {
      success = await addVolunteerRecord(data);
    }
    if (success) {
      setModalType(null);
      setEditingVolunteer(null);
    }
  };

  const handleItemSubmit = async (data: Partial<ItemDonation>) => {
    let success = false;
    if (editingItem) {
      success = await updateItemDonation(editingItem.id, data);
    } else {
      success = await addItemDonation(data);
    }
    if (success) {
      setModalType(null);
      setEditingItem(null);
    }
  };

  const handleActionSubmit = async (data: Partial<OnlineAction>) => {
    let success = false;
    if (editingAction) {
      success = await updateOnlineAction(editingAction.id, data);
    } else {
      success = await addOnlineAction(data);
    }
    if (success) {
      setModalType(null);
      setEditingAction(null);
    }
  };

  const handleCancel = () => {
    setModalType(null);
    setEditingVolunteer(null);
    setEditingItem(null);
    setEditingAction(null);
  };

  const volunteerColumns = [
    { key: 'service_date' as keyof VolunteerRecord, title: '日期', sortable: true, render: (v: VolunteerRecord[keyof VolunteerRecord]) => formatDate(v as string) },
    { key: 'hours' as keyof VolunteerRecord, title: '时长(小时)', sortable: true },
    { key: 'service_type' as keyof VolunteerRecord, title: '服务类型' },
    { key: 'beneficiary_group' as keyof VolunteerRecord, title: '受益群体' },
    { key: 'institution_name' as keyof VolunteerRecord, title: '机构' },
    {
      key: 'id' as keyof VolunteerRecord,
      title: '操作',
      render: (_: VolunteerRecord[keyof VolunteerRecord], row: VolunteerRecord) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); handleEditVolunteer(row); }}
            className="p-2 text-forest-400 hover:text-terracotta-500 hover:bg-terracotta-50 rounded-lg transition-colors"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDeleteVolunteer(row.id); }}
            className="p-2 text-forest-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const itemColumns = [
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
            onClick={(e) => { e.stopPropagation(); handleEditItem(row); }}
            className="p-2 text-forest-400 hover:text-terracotta-500 hover:bg-terracotta-50 rounded-lg transition-colors"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDeleteItem(row.id); }}
            className="p-2 text-forest-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const actionColumns = [
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
            onClick={(e) => { e.stopPropagation(); handleEditAction(row); }}
            className="p-2 text-forest-400 hover:text-terracotta-500 hover:bg-terracotta-50 rounded-lg transition-colors"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDeleteAction(row.id); }}
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

  const getModalTitle = () => {
    if (modalType === 'volunteer') return editingVolunteer ? '编辑志愿服务' : '添加志愿服务';
    if (modalType === 'items') return editingItem ? '编辑捐物记录' : '添加捐物记录';
    if (modalType === 'online') return editingAction ? '编辑线上行动' : '添加线上行动';
    return '';
  };

  const getAddButtonText = () => {
    if (activeTab === 'volunteer') return '添加志愿服务';
    if (activeTab === 'items') return '添加捐物记录';
    if (activeTab === 'online') return '添加线上行动';
    return '添加记录';
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex gap-2 bg-forest-50 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('volunteer')}
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
              onClick={() => setActiveTab('items')}
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
              onClick={() => setActiveTab('online')}
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
            {getAddButtonText()}
          </button>
        </div>

        {activeTab === 'volunteer' && (
          <div className="animate-fade-in">
            <DataTable<VolunteerRecord>
              columns={volunteerColumns}
              data={volunteerData}
            />
          </div>
        )}

        {activeTab === 'items' && (
          <div className="animate-fade-in">
            <DataTable<ItemDonation>
              columns={itemColumns}
              data={itemData}
            />
          </div>
        )}

        {activeTab === 'online' && (
          <div className="animate-fade-in">
            <DataTable<OnlineAction>
              columns={actionColumns}
              data={actionData}
            />
          </div>
        )}
      </div>

      <Modal
        isOpen={modalType !== null}
        title={getModalTitle()}
        onClose={handleCancel}
      >
        {modalType === 'volunteer' && (
          <VolunteerForm
            initialData={editingVolunteer || undefined}
            onSubmit={handleVolunteerSubmit}
            onCancel={handleCancel}
          />
        )}
        {modalType === 'items' && (
          <ItemDonationForm
            initialData={editingItem || undefined}
            onSubmit={handleItemSubmit}
            onCancel={handleCancel}
          />
        )}
        {modalType === 'online' && (
          <OnlineActionForm
            initialData={editingAction || undefined}
            onSubmit={handleActionSubmit}
            onCancel={handleCancel}
          />
        )}
      </Modal>
    </>
  );
}
