import { useEffect, useState } from 'react';
import {
  Plus,
  Clock,
  TrendingUp,
  Users,
  Heart,
  CheckCircle2,
  AlertCircle,
  Loader2,
  UserCheck,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Modal } from '@/components/ui';
import { ProgressForm, ImpactForm } from '@/components/forms';
import type { ProjectProgress as ProjectProgressType, ImpactEstimate } from '../../shared/types';

type TabType = 'progress' | 'impact';

function formatDate(dateStr: string): string {
  return dateStr.split('T')[0];
}

function formatAmount(amount: number): string {
  return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

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

export default function Tracking() {
  const {
    progress,
    impactEstimates,
    donations,
    loading,
    loadProgress,
    loadImpactEstimates,
    loadDonations,
    addProgress,
    addImpactEstimate,
    getInstitutionName,
    getTotalPeopleHelped,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<TabType>('progress');
  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [impactModalOpen, setImpactModalOpen] = useState(false);

  useEffect(() => {
    loadProgress();
    loadImpactEstimates();
    loadDonations();
  }, [loadProgress, loadImpactEstimates, loadDonations]);

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
  }, {} as Record<number, ProjectProgressType[]>);

  const totalPeople = getTotalPeopleHelped();
  const donationIds = Object.keys(progressByDonation).map(Number);

  const handleProgressSubmit = async (data: Partial<ProjectProgressType>) => {
    const success = await addProgress(data);
    if (success) {
      setProgressModalOpen(false);
    }
  };

  const handleImpactSubmit = async (data: Partial<ImpactEstimate>) => {
    const success = await addImpactEstimate(data);
    if (success) {
      setImpactModalOpen(false);
    }
  };

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
              onClick={() => setActiveTab('progress')}
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
              onClick={() => setActiveTab('impact')}
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
          <button
            onClick={() => activeTab === 'progress' ? setProgressModalOpen(true) : setImpactModalOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            {activeTab === 'progress' ? '添加进展' : '添加估算'}
          </button>
        </div>

        {activeTab === 'progress' && (
          <div className="animate-fade-in">
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
        )}

        {activeTab === 'impact' && (
          <div className="animate-fade-in space-y-6">
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

            {impactEstimates.length === 0 ? (
              <div className="card text-center py-12">
                <Users className="mx-auto text-forest-200" size={48} />
                <p className="text-forest-400 mt-4">暂无影响力估算数据，点击右上角添加</p>
              </div>
            ) : (
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
            )}
          </div>
        )}
      </div>

      <Modal
        isOpen={progressModalOpen}
        title="添加项目进展"
        onClose={() => setProgressModalOpen(false)}
      >
        <ProgressForm
          onSubmit={handleProgressSubmit}
          onCancel={() => setProgressModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={impactModalOpen}
        title="添加影响力估算"
        onClose={() => setImpactModalOpen(false)}
      >
        <ImpactForm
          onSubmit={handleImpactSubmit}
          onCancel={() => setImpactModalOpen(false)}
        />
      </Modal>
    </>
  );
}
