import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Heart } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Modal, DataTable } from '@/components/ui';
import { DonationForm } from '@/components/forms';
import type { Donation } from '../../shared/types';

function formatAmount(amount: number): string {
  return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string): string {
  return dateStr.split('T')[0];
}

type TabType = 'list' | 'stats';

export default function Donations() {
  const {
    donations,
    statistics,
    loading,
    loadDonations,
    loadStatistics,
    addDonation,
    updateDonation,
    deleteDonation,
    getInstitutionName,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<TabType>('list');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDonation, setEditingDonation] = useState<Donation | null>(null);

  useEffect(() => {
    loadDonations();
    loadStatistics();
  }, [loadDonations, loadStatistics]);

  const donationData = donations.map(d => ({
    ...d,
    institution_name: d.institution_name || getInstitutionName(d.institution_id),
  }));

  const handleAdd = () => {
    setEditingDonation(null);
    setModalOpen(true);
  };

  const handleEdit = (donation: Donation) => {
    setEditingDonation(donation);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('确定要删除这条捐款记录吗？')) {
      await deleteDonation(id);
    }
  };

  const handleSubmit = async (data: Partial<Donation>) => {
    let success = false;
    if (editingDonation) {
      success = await updateDonation(editingDonation.id, data);
    } else {
      success = await addDonation(data);
    }
    if (success) {
      setModalOpen(false);
      setEditingDonation(null);
    }
  };

  const handleCancel = () => {
    setModalOpen(false);
    setEditingDonation(null);
  };

  const columns = [
    { key: 'donation_date' as keyof Donation, title: '日期', sortable: true, render: (v: Donation[keyof Donation]) => formatDate(v as string) },
    { key: 'institution_name' as keyof Donation, title: '机构' },
    { key: 'amount' as keyof Donation, title: '金额', sortable: true, render: (v: Donation[keyof Donation]) => formatAmount(v as number) },
    { key: 'payment_method' as keyof Donation, title: '付款方式' },
    { key: 'purpose' as keyof Donation, title: '用途' },
    {
      key: 'id' as keyof Donation,
      title: '操作',
      render: (_: Donation[keyof Donation], row: Donation) => (
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
              onClick={() => setActiveTab('list')}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                activeTab === 'list'
                  ? 'bg-white text-terracotta-500 shadow-soft'
                  : 'text-forest-400 hover:text-forest-500'
              }`}
            >
              捐款列表
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                activeTab === 'stats'
                  ? 'bg-white text-terracotta-500 shadow-soft'
                  : 'text-forest-400 hover:text-forest-500'
              }`}
            >
              机构统计
            </button>
          </div>
          <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            添加捐款
          </button>
        </div>

        {activeTab === 'list' && (
          <DataTable<Donation>
            columns={columns}
            data={donationData}
          />
        )}

        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statistics.map((stat) => (
              <div
                key={stat.institution_id}
                className="card hover:shadow-hover transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display font-bold text-lg text-forest-500">
                      {stat.institution_name}
                    </h3>
                    <p className="text-sm text-forest-400 mt-1">
                      累计捐款 {stat.donation_count} 次
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-terracotta-50 flex items-center justify-center">
                    <Heart className="text-terracotta-500" size={24} />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-forest-100">
                  <p className="text-3xl font-bold text-terracotta-500 font-display">
                    {formatAmount(stat.total_amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        title={editingDonation ? '编辑捐款' : '添加捐款'}
        onClose={handleCancel}
      >
        <DonationForm
          initialData={editingDonation || undefined}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </Modal>
    </>
  );
}
