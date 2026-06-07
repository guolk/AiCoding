import { useState, useMemo } from 'react';
import { Plus, Eye, Edit, Trash2, AlertTriangle, AlertCircle, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { StatCard } from '@/components/ui/StatCard';
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from '@/components/ui/Table';
import { Modal, ModalTrigger, ModalContent, ModalHeader, ModalTitle, ModalBody, ModalFooter, ModalClose } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import PieChart from '@/components/charts/PieChart';
import { useAppStore } from '@/store';
import { InfringementAssessment as IAssessment, RiskLevel } from '@/types/competitor';
import { truncateText } from '@/utils/formatters';
import { formatDate } from '@/utils/dateUtils';

const RISK_LEVEL_OPTIONS = [
  { value: '', label: '全部风险等级' },
  { value: 'LOW', label: '低风险' },
  { value: 'MEDIUM', label: '中风险' },
  { value: 'HIGH', label: '高风险' },
  { value: 'CRITICAL', label: '极高风险' },
];

const RISK_BADGE_MAP: Record<RiskLevel, { variant: string; label: string }> = {
  LOW: { variant: 'risk-low', label: '低风险' },
  MEDIUM: { variant: 'risk-medium', label: '中风险' },
  HIGH: { variant: 'risk-high', label: '高风险' },
  CRITICAL: { variant: 'risk-critical', label: '极高风险' },
};

const RECOMMENDED_ACTIONS = [
  { value: 'MONITOR', label: '持续监控' },
  { value: 'LICENSE', label: '寻求许可' },
  { value: 'INVALIDATE', label: '提出无效' },
  { value: 'DESIGN_AROUND', label: '规避设计' },
  { value: 'LITIGATION', label: '提起诉讼' },
  { value: 'SETTLEMENT', label: '和解谈判' },
];

interface AssessmentFormData {
  competitorPatentId: string;
  ourPatentId: string;
  riskLevel: RiskLevel;
  similarityAnalysis: string;
  claimComparison: string;
  legalAdvice: string;
  recommendedActions: string[];
  assessor: string;
}

export default function InfringementAssessment() {
  const { infringementAssessments, competitorPatents, patents, addInfringementAssessment, deleteInfringementAssessment } = useAppStore();
  const [riskFilter, setRiskFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [ourPatentFilter, setOurPatentFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [assessmentToDelete, setAssessmentToDelete] = useState<IAssessment | null>(null);
  const [formData, setFormData] = useState<AssessmentFormData>({
    competitorPatentId: '',
    ourPatentId: '',
    riskLevel: 'LOW',
    similarityAnalysis: '',
    claimComparison: '',
    legalAdvice: '',
    recommendedActions: [],
    assessor: '',
  });

  const stats = useMemo(() => ({
    total: infringementAssessments.length,
    high: infringementAssessments.filter((a) => a.riskLevel === 'HIGH' || a.riskLevel === 'CRITICAL').length,
    medium: infringementAssessments.filter((a) => a.riskLevel === 'MEDIUM').length,
    low: infringementAssessments.filter((a) => a.riskLevel === 'LOW').length,
  }), [infringementAssessments]);

  const pieData = useMemo(() => [
    { name: '低风险', value: stats.low, color: '#22c55e' },
    { name: '中风险', value: stats.medium, color: '#eab308' },
    { name: '高风险', value: stats.high, color: '#ef4444' },
  ], [stats]);

  const ourPatentOptions = useMemo(() => {
    const unique = [...new Set(infringementAssessments.map((a) => a.ourPatent?.name).filter(Boolean))];
    return [{ value: '', label: '全部我方专利' }, ...unique.map((p) => ({ value: p!, label: p! }))];
  }, [infringementAssessments]);

  const competitorPatentOptions = useMemo(() =>
    competitorPatents.map((p) => ({ value: p.id, label: p.patentName })),
  [competitorPatents]);

  const ourPatentSelectOptions = useMemo(() =>
    patents.map((p) => ({ value: p.id, label: p.name })),
  [patents]);

  const filteredAssessments = useMemo(() => {
    return infringementAssessments.filter((assessment) => {
      const matchesRisk = riskFilter === '' || assessment.riskLevel === riskFilter;
      const matchesOurPatent = ourPatentFilter === '' || assessment.ourPatent?.name === ourPatentFilter;

      const assessDate = new Date(assessment.assessmentDate);
      const matchesStart = startDate === '' || assessDate >= new Date(startDate);
      const matchesEnd = endDate === '' || assessDate <= new Date(endDate);

      return matchesRisk && matchesOurPatent && matchesStart && matchesEnd;
    });
  }, [infringementAssessments, riskFilter, ourPatentFilter, startDate, endDate]);

  const handleSubmit = () => {
    addInfringementAssessment({
      ...formData,
      assessmentDate: new Date().toISOString(),
    });
    setModalOpen(false);
    setFormData({
      competitorPatentId: '',
      ourPatentId: '',
      riskLevel: 'LOW',
      similarityAnalysis: '',
      claimComparison: '',
      legalAdvice: '',
      recommendedActions: [],
      assessor: '',
    });
  };

  const handleDeleteClick = (assessment: IAssessment) => {
    setAssessmentToDelete(assessment);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (assessmentToDelete) {
      deleteInfringementAssessment(assessmentToDelete.id);
      setDeleteModalOpen(false);
      setAssessmentToDelete(null);
    }
  };

  const handleActionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, (option) => option.value);
    setFormData({ ...formData, recommendedActions: selected });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">侵权风险评估</h1>
        <Modal open={modalOpen} onOpenChange={setModalOpen}>
          <ModalTrigger asChild>
            <Button leftIcon={<Plus className="h-4 w-4" />}>新增评估</Button>
          </ModalTrigger>
          <ModalContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <ModalHeader><ModalTitle>新增侵权风险评估</ModalTitle></ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Select label="竞品专利" placeholder="请选择竞品专利" value={formData.competitorPatentId} onChange={(e) => setFormData({ ...formData, competitorPatentId: e.target.value })} options={competitorPatentOptions} />
                <Select label="我方专利" placeholder="请选择我方专利" value={formData.ourPatentId} onChange={(e) => setFormData({ ...formData, ourPatentId: e.target.value })} options={ourPatentSelectOptions} />
                <Select label="风险等级" value={formData.riskLevel} onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value as RiskLevel })} options={RISK_LEVEL_OPTIONS.filter(o => o.value !== '')} />
                <Input label="相似度分析" type="textarea" value={formData.similarityAnalysis} onChange={(e) => setFormData({ ...formData, similarityAnalysis: e.target.value })} placeholder="请输入相似度分析" autoResize />
                <Input label="权利要求比对" type="textarea" value={formData.claimComparison} onChange={(e) => setFormData({ ...formData, claimComparison: e.target.value })} placeholder="请输入权利要求比对" autoResize />
                <Input label="法律建议" type="textarea" value={formData.legalAdvice} onChange={(e) => setFormData({ ...formData, legalAdvice: e.target.value })} placeholder="请输入法律建议" autoResize />
                <Select label="建议措施" multiple value={formData.recommendedActions as any} onChange={handleActionChange} options={RECOMMENDED_ACTIONS} />
                <Input label="评估人" value={formData.assessor} onChange={(e) => setFormData({ ...formData, assessor: e.target.value })} placeholder="请输入评估人姓名" />
              </div>
            </ModalBody>
            <ModalFooter>
              <ModalClose>取消</ModalClose>
              <Button onClick={handleSubmit}>提交评估</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="总评估数" value={stats.total} variant="primary" icon={<ShieldCheck className="h-5 w-5" />} />
        <StatCard title="高风险" value={stats.high} variant="danger" icon={<ShieldAlert className="h-5 w-5" />} />
        <StatCard title="中风险" value={stats.medium} variant="accent" icon={<AlertTriangle className="h-5 w-5" />} />
        <StatCard title="低风险" value={stats.low} variant="success" icon={<AlertCircle className="h-5 w-5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle>风险等级分布</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <PieChart data={pieData} showLabel={false} />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>筛选条件</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Select placeholder="风险等级" value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} options={RISK_LEVEL_OPTIONS} />
              <Select placeholder="我方专利" value={ourPatentFilter} onChange={(e) => setOurPatentFilter(e.target.value)} options={ourPatentOptions} />
              <Input type="date" placeholder="开始日期" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <Input type="date" placeholder="结束日期" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>竞品专利名称</TableHead>
                <TableHead>我方专利名称</TableHead>
                <TableHead>评估日期</TableHead>
                <TableHead>风险等级</TableHead>
                <TableHead>关联度</TableHead>
                <TableHead>评估人</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssessments.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-slate-500">暂无数据</TableCell></TableRow>
              ) : (
                filteredAssessments.map((assessment) => {
                  const badge = RISK_BADGE_MAP[assessment.riskLevel];
                  const competitorPatent = competitorPatents.find((p) => p.id === assessment.competitorPatentId);
                  const ourPatent = patents.find((p) => p.id === assessment.ourPatentId);
                  return (
                    <TableRow key={assessment.id}>
                      <TableCell className="font-medium">{truncateText(competitorPatent?.patentName || '-', 25)}</TableCell>
                      <TableCell>{truncateText(ourPatent?.name || '-', 25)}</TableCell>
                      <TableCell>{formatDate(assessment.assessmentDate)}</TableCell>
                      <TableCell><Badge variant={badge.variant as any} dot>{badge.label}</Badge></TableCell>
                      <TableCell>{competitorPatent?.relevanceScore || '-'}%</TableCell>
                      <TableCell>{assessment.assessor}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(assessment)}><Trash2 className="h-4 w-4 text-danger-500" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <ModalContent>
          <ModalHeader><ModalTitle>确认删除</ModalTitle></ModalHeader>
          <ModalBody>
            <p className="text-slate-600">确定要删除该侵权评估记录吗？此操作不可撤销。</p>
          </ModalBody>
          <ModalFooter>
            <ModalClose>取消</ModalClose>
            <Button variant="danger" onClick={confirmDelete}>确认删除</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
