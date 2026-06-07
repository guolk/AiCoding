import { useMemo } from 'react';
import { FileText, Copyright, AlertTriangle, ShieldAlert, Calendar, CheckCircle, FileCheck, Handshake, Globe, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Timeline, TimelineItem, TimelineDot, TimelineDate, TimelineContent } from '@/components/ui/Timeline';
import PieChart from '@/components/charts/PieChart';
import BarChart from '@/components/charts/BarChart';
import { useAppStore } from '@/store';
import { PatentStatus, PatentType } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { formatDate } from '@/utils/dateUtils';

interface TimelineEvent { id: string; type: string; date: string; title: string; description: string; icon: React.ReactNode; }
interface TodoItem { id: string; title: string; count: number; amount?: number; variant: string; }

const STATUS_LABELS: Record<PatentStatus, string> = { APPLICATION: '申请中', SUBSTANTIVE_EXAMINATION: '实质审查', AUTHORIZED: '已授权', MAINTENANCE: '维持中', ENFORCEMENT: '维权中', EXPIRED: '已过期' };
const PATENT_TYPE_LABELS: Record<PatentType, string> = { INVENTION: '发明专利', UTILITY_MODEL: '实用新型', DESIGN: '外观设计' };

export default function DashboardPage() {
  const { patents, trademarks, infringementAssessments, licenseAgreements } = useAppStore();

  const pendingAnnuities = useMemo(() => patents.flatMap(p => p.annuityRecords.filter(r => r.status === 'PENDING' || r.status === 'OVERDUE')).length, [patents]);
  const pendingAnnuityAmount = useMemo(() => patents.flatMap(p => p.annuityRecords.filter(r => r.status === 'PENDING' || r.status === 'OVERDUE')).reduce((sum, r) => sum + r.amount, 0), [patents]);
  const highRiskInfringements = useMemo(() => infringementAssessments.filter(a => a.riskLevel === 'HIGH' || a.riskLevel === 'CRITICAL').length, [infringementAssessments]);
  
  const expiringTrademarks = useMemo(() => {
    const sixMonthsLater = new Date(); sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
    return trademarks.filter(t => { const validTo = new Date(t.validTo); return validTo <= sixMonthsLater && validTo >= new Date(); }).length;
  }, [trademarks]);

  const expiringLicenses = useMemo(() => {
    const sixMonthsLater = new Date(); sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
    return licenseAgreements.filter(l => { const expirationDate = new Date(l.expirationDate); return expirationDate <= sixMonthsLater && expirationDate >= new Date() && l.status === 'ACTIVE'; }).length;
  }, [licenseAgreements]);

  const todoItems: TodoItem[] = useMemo(() => [
    { id: '1', title: '30天内到期年费', count: pendingAnnuities, amount: pendingAnnuityAmount, variant: 'danger' },
    { id: '2', title: '6个月内到期商标', count: expiringTrademarks, variant: 'warning' },
    { id: '3', title: '待处理侵权评估', count: highRiskInfringements, variant: 'danger' },
    { id: '4', title: '即将到期许可协议', count: expiringLicenses, variant: 'warning' },
  ], [pendingAnnuities, pendingAnnuityAmount, expiringTrademarks, highRiskInfringements, expiringLicenses]);

  const statusDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    patents.forEach(p => { counts[p.status] = (counts[p.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: STATUS_LABELS[name as PatentStatus] || name, value }));
  }, [patents]);

  const patentTypeDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    patents.forEach(p => { counts[p.patentType] = (counts[p.patentType] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: PATENT_TYPE_LABELS[name as PatentType] || name, value }));
  }, [patents]);

  const monthlyApplicationTrend = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 12 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
      const count = patents.filter(p => { const appDate = new Date(p.applicationDate); return appDate.getFullYear() === date.getFullYear() && appDate.getMonth() === date.getMonth(); }).length;
      return { name: `${date.getMonth() + 1}月`, value: count };
    });
  }, [patents]);

  const timelineEvents: TimelineEvent[] = useMemo(() => {
    const events: TimelineEvent[] = [];
    patents.forEach(p => {
      if (p.statusHistory.length > 0) {
        const latest = p.statusHistory[p.statusHistory.length - 1];
        events.push({ id: `status-${p.id}`, type: 'status', date: latest.date, title: `专利状态变更: ${p.name}`, description: `状态变更为 ${STATUS_LABELS[latest.status as PatentStatus]}`, icon: <CheckCircle className="h-4 w-4 text-primary-700" /> });
      }
      p.annuityRecords.filter(r => r.paidDate).forEach(r => {
        events.push({ id: `annuity-${p.id}-${r.id}`, type: 'annuity', date: r.paidDate!, title: `年费缴纳: ${p.name}`, description: `第${r.year}年年费已缴纳，金额 ${formatCurrency(r.amount)}`, icon: <FileCheck className="h-4 w-4 text-success-600" /> });
      });
    });
    licenseAgreements.forEach(l => {
      events.push({ id: `license-${l.id}`, type: 'license', date: l.effectiveDate, title: '许可协议签署', description: `${l.licensee} - 许可费 ${formatCurrency(l.licenseFee)}`, icon: <Handshake className="h-4 w-4 text-accent-600" /> });
    });
    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);
  }, [patents, licenseAgreements]);

  const regionStats = useMemo(() => {
    const regionCounts = new Map<string, number>();
    patents.forEach(p => p.regions.forEach(r => regionCounts.set(r, (regionCounts.get(r) || 0) + 1)));
    trademarks.forEach(t => t.regions.forEach(r => regionCounts.set(r, (regionCounts.get(r) || 0) + 1)));
    const sortedRegions = Array.from(regionCounts.entries()).sort((a, b) => b[1] - a[1]);
    return { totalCountries: regionCounts.size, topRegions: sortedRegions.slice(0, 5) };
  }, [patents, trademarks]);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">仪表盘</h1>
        <p className="page-subtitle">知识产权资产总览</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="专利总数" value={patents.length} trend={8.3} variant="primary" icon={<FileText className="h-6 w-6" />} className="animate-slide-up" style={{ animationDelay: '0.1s' }} />
        <StatCard title="商标总数" value={trademarks.length} variant="accent" icon={<Copyright className="h-6 w-6" />} className="animate-slide-up" style={{ animationDelay: '0.2s' }} />
        <StatCard title="待缴年费" value={pendingAnnuities} suffix=" 项" trend={5.2} variant="danger" icon={<AlertTriangle className="h-6 w-6" />} className="animate-slide-up" style={{ animationDelay: '0.3s' }} />
        <StatCard title="高风险侵权" value={highRiskInfringements} variant="danger" icon={<ShieldAlert className="h-6 w-6" />} className="animate-slide-up" style={{ animationDelay: '0.4s' }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <CardHeader><CardTitle>专利状态分布</CardTitle></CardHeader>
          <CardContent className="h-64">
            <PieChart data={statusDistribution} innerRadius={50} outerRadius={80} showLabel={false} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <CardHeader><CardTitle>近12个月专利申请趋势</CardTitle></CardHeader>
          <CardContent className="h-64">
            <BarChart data={monthlyApplicationTrend} barColor="#0F3460" showLegend={false} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="animate-slide-up" style={{ animationDelay: '0.7s' }}>
          <CardHeader><CardTitle>待办事项</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {todoItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={item.variant === 'danger' ? 'p-2 bg-danger-100 rounded-lg' : 'p-2 bg-warning-100 rounded-lg'}>
                    <Calendar className={`h-5 w-5 ${item.variant === 'danger' ? 'text-danger-600' : 'text-warning-600'}`} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{item.title}</p>
                    <p className="text-sm text-slate-500">{item.count} 项{item.amount && ` · ${formatCurrency(item.amount)}`}</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400" />
              </div>
            ))}
            <Button variant="ghost" fullWidth size="sm">查看全部待办</Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 animate-slide-up" style={{ animationDelay: '0.8s' }}>
          <CardHeader><CardTitle>近期事件</CardTitle></CardHeader>
          <CardContent className="max-h-96 overflow-y-auto">
            <Timeline position="left">
              {timelineEvents.map((event) => (
                <TimelineItem key={event.id}>
                  <TimelineDot icon={event.icon} />
                  <TimelineDate>{formatDate(event.date)}</TimelineDate>
                  <TimelineContent>
                    <p className="font-medium text-slate-800">{event.title}</p>
                    <p className="text-sm text-slate-500">{event.description}</p>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="animate-slide-up" style={{ animationDelay: '0.9s' }}>
          <CardHeader><CardTitle>专利类型分布</CardTitle></CardHeader>
          <CardContent className="h-64">
            <PieChart data={patentTypeDistribution} outerRadius={80} showLabel />
          </CardContent>
        </Card>

        <Card className="animate-slide-up" style={{ animationDelay: '1s' }}>
          <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" />地域覆盖统计</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg">
              <div>
                <p className="text-sm text-slate-500">覆盖国家/地区</p>
                <p className="text-3xl font-bold text-primary-700">{regionStats.totalCountries}</p>
              </div>
              <Globe className="h-10 w-10 text-primary-700 opacity-50" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">主要覆盖区域</p>
              {regionStats.topRegions.map(([region, count]) => (
                <div key={region} className="flex items-center justify-between">
                  <span className="text-slate-600">{region}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-700 rounded-full" style={{ width: `${(count / (regionStats.topRegions[0]?.[1] || 1)) * 100}%` }} />
                    </div>
                    <Badge variant="default">{count}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
