import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Clock, TrendingUp, Users, Heart, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Modal } from '@/components/ui';
import { ProgressForm } from '@/components/forms';
import type { ProjectProgress } from '../../shared/types';

function formatDate(dateStr: string): string {
  return dateStr.split('T')[0];
}

function formatAmount(amount: number): string {
  return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

type TabType = 'progress' | 'impact';

const statusColors: Record<string, string> = {
  '进行中': 'bg-blue-100 text-blue-600',
  '已完成': 'bg-green-100 text-green-600',
  '已取消': 'bg-red-100 text-red-600',
  '待跟进': 'bg-amber-100 text-amber-600',
};

const statusIcons: Record<string, React.ElementType> = {
  '进行中': Loader2,
  '已完成': CheckCircle2,
  '已取消': AlertCircle,
  '待跟进': Clock,
};

export default function ProjectProgress() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    progress,
    donations,
    loading,
    loadProgress,
    loadDonations,
    addProgress,
    getInstitutionName,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<TabType>('progress');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (location.pathname.includes('/impact')) {
      navigate('/tracking/impact');
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    loadProgress();
    loadDonations();
  }, [loadProgress, loadDonations]);

  const getDonationInfo = (donationId: number) => {
    const donation = donations.find(d => d.id === donationId);
    if (!donation) return { amount: 0, institution: '未知机构', purpose: '' };
    return {
      amount: donation.amount,
      institution: donation.institution_name || getInstitutionName(donation.institution_id),
      purpose: donation.purpose,
    };
  };

  const progressByDonation = progress.reduce((acc, p) => {
    if (!acc[p.donation_id]) {
      acc[p.donation_id] = [];
    }
    acc[p.donation_id].push(p);
    return acc;
  }, {} as Record<number, ProjectProgress[]>);

  const handleAdd = () => {
    setModalOpen(true);
  };

  const handleSubmit = async (data: Partial<ProjectProgress>) => {
    const success = await addProgress(data);
    if (success) {
      setModalOpen(false);
    }
  };

  const handleCancel = () => {
    setModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-terracotta-400 border-t-transparent"></div>
      </div>
    );
  }

  const donationIds = Object.keys(progressByDonation).map(Number);

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex gap-2 bg-forest-50 p-1 rounded-xl">
            <button
              onClick={() => { setActiveTab('progress'); navigate('/tracking/progress'); }}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'progress'
                  ? 'bg-white text-terracotta-500 shadow-soft'
                  : 'text-forest-400 hover:text-forest-500'
              }`}
            >
              <TrendingUp size={18} />
              项目进展
            </button>
            <button
              onClick={() => { setActiveTab('impact'); navigate('/tracking/impact'); }}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'impact'
                  ? 'bg-white text-terracotta-500 shadow-soft'
                  : 'text-forest-400 hover:text-forest-500'
              }`}
            >
              <Users size={18} />
              影响力估算
            </button>
          </div>
          <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            添加进展
          </button>
        </div>

        {donationIds.length === 0 ? (
          <div className="card text-center py-12">
            <Heart className="mx-auto text-forest-200" size={48} />
            <p className="text-forest-400 mt-4">暂无项目进展数据，点击右上角添加</p>
          </div>
        ) : (
          <div className="space-y-8">
            {donationIds.map((donationId) => {
              const donationInfo = getDonationInfo(donationId);
              const progresses = progressByDonation[donationId]
                .sort((a, b) => new Date(b.update_date).getTime() - new Date(a.update_date).getTime());

              return (
                <div key={donationId} className="card">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-display text-xl font-bold text-forest-500">
                          {donationInfo.institution}
                        </h3>
                        <span className="text-2xl font-bold text-terracotta-500 font-display">
                          {formatAmount(donationInfo.amount)}
                        </span>
                      </div>
                      {donationInfo.purpose && (
                        <p className="text-sm text-forest-400 mt-1">用途：{donationInfo.purpose}</p>
                      )}
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-terracotta-50 flex items-center justify-center">
                      <Heart className="text-terracotta-500" size={24} />
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-forest-100" />
                    <div className="space-y-6">
                      {progresses.map((p) => {
                        const StatusIcon = statusIcons[p.status] || Clock;
                        return (
                          <div key={p.id} className="relative flex gap-6 pl-14">
                            <div className="absolute left-4 w-4 h-4 rounded-full bg-terracotta-500 border-4 border-white shadow-soft transform -translate-x-1/2" />
                            <div className="flex-1 bg-forest-50 rounded-xl p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-forest-400">{formatDate(p.update_date)}</span>
                                <span className={`badge ${statusColors[p.status] || 'bg-forest-100 text-forest-500'} flex items-center gap-1`}>
                                  <StatusIcon size={12} />
                                  {p.status}
                                </span>
                              </div>
                              <p className="text-forest-500">{p.progress_description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        title="添加项目进展"
        onClose={handleCancel}
      >
        <ProgressForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </Modal>
    </>
  );
}
