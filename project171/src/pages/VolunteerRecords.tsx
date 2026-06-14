import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Edit2, Trash2, Clock, Package, Globe } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Modal, DataTable } from '@/components/ui';
import { VolunteerForm } from '@/components/forms';
import type { VolunteerRecord } from '../../shared/types';

function formatDate(dateStr: string): string {
  return dateStr.split('T')[0];
}

type TabType = 'volunteer' | 'items' | 'online';

export default function VolunteerRecords() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    volunteerRecords,
    loading,
    loadVolunteerRecords,
    addVolunteerRecord,
    updateVolunteerRecord,
    deleteVolunteerRecord,
    getInstitutionName,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<TabType>('volunteer');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<VolunteerRecord | null>(null);

  useEffect(() => {
    if (location.pathname.includes('/items')) {
      navigate('/participation/items');
    } else if (location.pathname.includes('/online')) {
      navigate('/participation/online');
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    loadVolunteerRecords();
  }, [loadVolunteerRecords]);

  const volunteerData = volunteerRecords
    .map(v => ({
      ...v,
      institution_name: v.institution_name || getInstitutionName(v.institution_id),
    }))
    .sort((a, b) => new Date(b.service_date).getTime() - new Date(a.service_date).getTime());

  const handleAdd = () => {
    setEditingRecord(null);
    setModalOpen(true);
  };

  const handleEdit = (record: VolunteerRecord) => {
    setEditingRecord(record);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('确定要删除这条志愿服务记录吗？')) {
      await deleteVolunteerRecord(id);
    }
  };

  const handleSubmit = async (data: Partial<VolunteerRecord>) => {
    let success = false;
    if (editingRecord) {
      success = await updateVolunteerRecord(editingRecord.id, data);
    } else {
      success = await addVolunteerRecord(data);
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

        <DataTable<VolunteerRecord>
          columns={columns}
          data={volunteerData}
        />
      </div>

      <Modal
        isOpen={modalOpen}
        title={editingRecord ? '编辑志愿服务' : '添加志愿服务'}
        onClose={handleCancel}
      >
        <VolunteerForm
          initialData={editingRecord || undefined}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </Modal>
    </>
  );
}
