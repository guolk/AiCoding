import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, FileText, ShieldCheck, Heart } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { RatingStars, DataTable } from '@/components/ui';
import type { Donation } from '../../shared/types';

function formatAmount(amount: number): string {
  return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string): string {
  return dateStr.split('T')[0];
}

export default function InstitutionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    institutions,
    donations,
    statistics,
    loading,
    loadAllData,
    getInstitutionName,
  } = useAppStore();

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const institutionId = Number(id);
  const institution = institutions.find(i => i.id === institutionId);
  const institutionDonations = donations
    .filter(d => d.institution_id === institutionId)
    .map(d => ({
      ...d,
      institution_name: d.institution_name || getInstitutionName(d.institution_id),
    }))
    .sort((a, b) => new Date(b.donation_date).getTime() - new Date(a.donation_date).getTime());

  const stat = statistics.find(s => s.institution_id === institutionId);
  const totalDonations = stat?.total_amount || 0;
  const donationCount = stat?.donation_count || 0;

  const mockAnnualReports = [
    { id: 1, year: 2024, summary: '本年度共筹集善款500万元，帮助了1000名贫困学生完成学业。' },
    { id: 2, year: 2023, summary: '机构完成了组织架构优化，透明度评级提升至4.5星。' },
  ];

  const mockAssessments = [
    { id: 1, date: '2024-06-01', hasPublicFinance: true, hasThirdPartyAudit: true, notes: '财务公开透明，第三方审计报告完整。' },
    { id: 2, date: '2024-01-15', hasPublicFinance: true, hasThirdPartyAudit: true, notes: '年度评估结果优秀。' },
  ];

  const donationColumns = [
    { key: 'donation_date' as keyof Donation, title: '日期', sortable: true, render: (v: Donation[keyof Donation]) => formatDate(v as string) },
    { key: 'amount' as keyof Donation, title: '金额', sortable: true, render: (v: Donation[keyof Donation]) => formatAmount(v as number) },
    { key: 'payment_method' as keyof Donation, title: '付款方式' },
    { key: 'purpose' as keyof Donation, title: '用途' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-terracotta-400 border-t-transparent"></div>
      </div>
    );
  }

  if (!institution) {
    return (
      <div className="card text-center py-12">
        <Building2 className="mx-auto text-forest-200" size={48} />
        <p className="text-forest-400 mt-4">机构不存在</p>
        <button onClick={() => navigate('/institutions')} className="btn-primary mt-4">
          返回机构列表
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
        <button
          onClick={() => navigate('/institutions')}
          className="flex items-center gap-2 text-forest-400 hover:text-terracotta-500 transition-colors"
        >
          <ArrowLeft size={20} />
          返回机构列表
        </button>

        <div className="card">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-forest-400 to-forest-600 flex items-center justify-center flex-shrink-0">
              <Building2 className="text-white" size={40} />
            </div>
            <div className="flex-1">
              <h1 className="font-display text-3xl font-bold text-forest-500">
                {institution.name}
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-forest-500 font-medium">透明度评分：</span>
                  <RatingStars rating={institution.transparency_rating} size="lg" />
                  <span className="text-lg font-bold text-terracotta-500">{institution.transparency_rating}.0</span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-forest-50 rounded-xl p-4">
                  <p className="text-sm text-forest-400">累计捐款</p>
                  <p className="text-2xl font-bold text-terracotta-500 font-display">{formatAmount(totalDonations)}</p>
                </div>
                <div className="bg-forest-50 rounded-xl p-4">
                  <p className="text-sm text-forest-400">捐款次数</p>
                  <p className="text-2xl font-bold text-forest-500 font-display">{donationCount} 次</p>
                </div>
                <div className="bg-forest-50 rounded-xl p-4">
                  <p className="text-sm text-forest-400">运作方式</p>
                  <p className="text-lg font-bold text-forest-500">{institution.operation_mode}</p>
                </div>
                <div className="bg-forest-50 rounded-xl p-4">
                  <p className="text-sm text-forest-400">关注时间</p>
                  <p className="text-lg font-bold text-forest-500">{formatDate(institution.created_at)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="font-display text-xl font-bold text-forest-500 mb-4">机构使命</h2>
          <p className="text-forest-500 leading-relaxed">{institution.mission}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="text-terracotta-500" size={24} />
              <h2 className="font-display text-xl font-bold text-forest-500">年度报告摘录</h2>
            </div>
            <div className="space-y-4">
              {mockAnnualReports.map((report) => (
                <div key={report.id} className="bg-forest-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-forest-500">{report.year} 年度报告</span>
                    <span className="badge bg-forest-100 text-forest-500">已公开</span>
                  </div>
                  <p className="text-sm text-forest-400">{report.summary}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="text-forest-500" size={24} />
              <h2 className="font-display text-xl font-bold text-forest-500">可信度评估记录</h2>
            </div>
            <div className="space-y-4">
              {mockAssessments.map((assessment) => (
                <div key={assessment.id} className="bg-forest-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-forest-400">{assessment.date}</span>
                    <div className="flex gap-2">
                      {assessment.hasPublicFinance && (
                        <span className="badge bg-green-100 text-green-600">财务公开</span>
                      )}
                      {assessment.hasThirdPartyAudit && (
                        <span className="badge bg-blue-100 text-blue-600">第三方审计</span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-forest-500">{assessment.notes}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="text-terracotta-500" size={24} />
            <h2 className="font-display text-xl font-bold text-forest-500">该机构捐款记录</h2>
          </div>
          <DataTable<Donation>
            columns={donationColumns}
            data={institutionDonations}
          />
        </div>
      </div>
  );
}
