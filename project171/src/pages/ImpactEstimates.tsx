import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, TrendingUp, Users, Heart, UserCheck } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Modal } from '@/components/ui';
import { ImpactForm } from '@/components/forms';
import type { ImpactEstimate } from '../../shared/types';

function formatAmount(amount: number): string {
  return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

type TabType = 'progress' | 'impact';

export default function ImpactEstimates() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    impactEstimates,
    donations,
    loading,
    loadImpactEstimates,
    loadDonations,
    addImpactEstimate,
    getTotalPeopleHelped,
    getInstitutionName,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<TabType>('impact');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (location.pathname.includes('/progress')) {
      navigate('/tracking/progress');
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    loadImpactEstimates();
    loadDonations();
  }, [loadImpactEstimates, loadDonations]);

  const getDonationInfo = (donationId: number) => {
    const donation = donations.find(d => d.id === donationId);
    if (!donation) return { amount: 0, institution: '未知机构' };
    return {
      amount: donation.amount,
      institution: donation.institution_name || getInstitutionName(donation.institution_id),
    };
  };

  const handleAdd = () => {
    setModalOpen(true);
  };

  const handleSubmit = async (data: Partial<ImpactEstimate>) => {
    const success = await addImpactEstimate(data);
    if (success) {
      setModalOpen(false);
    }
  };

  const handleCancel = () => {
    setModalOpen(false);
  };

  const totalPeople = getTotalPeopleHelped();

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
            添加估算
          </button>
        </div>

        <div className="bg-gradient-to-r from-terracotta-500 to-terracotta-600 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                <UserCheck size={32} />
              </div>
              <div>
                <p className="text-white/80 font-medium">总帮助人数</p>
                <p className="text-5xl font-bold font-display">{totalPeople.toLocaleString('zh-CN')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {impactEstimates.map((estimate) => {
            const donationInfo = getDonationInfo(estimate.donation_id);
            return (
              <div
                key={estimate.id}
                className="card hover:shadow-hover transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-forest-400 to-forest-600 flex items-center justify-center">
                    <Heart className="text-white" size={24} />
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-forest-400">捐款金额</p>
                    <p className="text-lg font-bold text-terracotta-500">{formatAmount(donationInfo.amount)}</p>
                  </div>
                </div>

                <h3 className="font-display font-bold text-lg text-forest-500 mb-1">
                  {donationInfo.institution}
                </h3>

                <div className="flex items-center gap-2 mt-4">
                  <Users className="text-terracotta-500" size={20} />
                  <span className="text-3xl font-bold text-forest-500 font-display">
                    {estimate.people_helped.toLocaleString('zh-CN')}
                  </span>
                  <span className="text-forest-400">人受益</span>
                </div>

                <p className="text-sm text-forest-400 mt-4 line-clamp-2">
                  {estimate.description}
                </p>

                <div className="mt-4 pt-4 border-t border-forest-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-forest-400">人均成本</span>
                    <span className="font-semibold text-forest-500">
                      {estimate.people_helped > 0
                        ? formatAmount(donationInfo.amount / estimate.people_helped)
                        : '—'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {impactEstimates.length === 0 && (
          <div className="card text-center py-12">
            <Users className="mx-auto text-forest-200" size={48} />
            <p className="text-forest-400 mt-4">暂无影响力估算数据，点击右上角添加</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        title="添加影响力估算"
        onClose={handleCancel}
      >
        <ImpactForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </Modal>
    </>
  );
}
