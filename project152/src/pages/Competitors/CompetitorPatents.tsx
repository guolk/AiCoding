import { useState, useMemo } from 'react';
import { Search, Plus, Eye, Flag, Trash2, ChevronLeft, ChevronRight, AlertTriangle, EyeOff, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { StatCard } from '@/components/ui/StatCard';
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from '@/components/ui/Table';
import { Modal, ModalTrigger, ModalContent, ModalHeader, ModalTitle, ModalBody, ModalFooter, ModalClose } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/store';
import { CompetitorPatent } from '@/types/competitor';
import { truncateText } from '@/utils/formatters';
import { formatDate } from '@/utils/dateUtils';

const PAGE_SIZE = 10;

const MONITORING_STATUS_OPTIONS = [
  { value: 'MONITORING', label: '监控中' },
  { value: 'TRACKING', label: '重点跟踪' },
  { value: 'DISMISSED', label: '已忽略' },
];

const STATUS_BADGE_MAP: Record<CompetitorPatent['monitoringStatus'], { variant: string; label: string }> = {
  MONITORING: { variant: 'active', label: '监控中' },
  TRACKING: { variant: 'warning', label: '重点跟踪' },
  DISMISSED: { variant: 'expired', label: '已忽略' },
};

function RelevanceScore({ score }: { score: number }) {
  const stars = Math.round(score / 20);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`h-4 w-4 ${i <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`} />
      ))}
      <span className="text-sm text-slate-500 ml-1">{score}%</span>
    </div>
  );
}

export default function CompetitorPatents() {
  const { competitorPatents, deleteCompetitorPatent, updateCompetitorPatent } = useAppStore();
  const [searchText, setSearchText] = useState('');
  const [competitorFilter, setCompetitorFilter] = useState('');
  const [technicalFieldFilter, setTechnicalFieldFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [patentToDelete, setPatentToDelete] = useState<CompetitorPatent | null>(null);

  const competitors = useMemo(() => {
    const unique = [...new Set(competitorPatents.map((p) => p.competitorName))];
    return unique.map((c) => ({ value: c, label: c }));
  }, [competitorPatents]);

  const technicalFields = useMemo(() => {
    const unique = [...new Set(competitorPatents.map((p) => p.technicalField))];
    return unique.map((f) => ({ value: f, label: f }));
  }, [competitorPatents]);

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    return {
      monitoring: competitorPatents.filter((p) => p.monitoringStatus === 'MONITORING').length,
      tracking: competitorPatents.filter((p) => p.monitoringStatus === 'TRACKING').length,
      dismissed: competitorPatents.filter((p) => p.monitoringStatus === 'DISMISSED').length,
      newThisMonth: competitorPatents.filter((p) => {
        const d = new Date(p.discoveryDate);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      }).length,
    };
  }, [competitorPatents]);

  const filteredPatents = useMemo(() => {
    return competitorPatents.filter((patent) => {
      const matchesSearch =
        searchText === '' ||
        patent.patentName.toLowerCase().includes(searchText.toLowerCase()) ||
        patent.applicationNumber.toLowerCase().includes(searchText.toLowerCase()) ||
        patent.applicant.toLowerCase().includes(searchText.toLowerCase());

      const matchesCompetitor = competitorFilter === '' || patent.competitorName === competitorFilter;
      const matchesField = technicalFieldFilter === '' || patent.technicalField === technicalFieldFilter;
      const matchesStatus = statusFilter === '' || patent.monitoringStatus === statusFilter;

      const discDate = new Date(patent.discoveryDate);
      const matchesStart = startDate === '' || discDate >= new Date(startDate);
      const matchesEnd = endDate === '' || discDate <= new Date(endDate);

      return matchesSearch && matchesCompetitor && matchesField && matchesStatus && matchesStart && matchesEnd;
    });
  }, [competitorPatents, searchText, competitorFilter, technicalFieldFilter, statusFilter, startDate, endDate]);

  const totalPages = Math.ceil(filteredPatents.length / PAGE_SIZE);
  const paginatedPatents = filteredPatents.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleDeleteClick = (patent: CompetitorPatent) => {
    setPatentToDelete(patent);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (patentToDelete) {
      deleteCompetitorPatent(patentToDelete.id);
      setDeleteModalOpen(false);
      setPatentToDelete(null);
      if (paginatedPatents.length === 1 && currentPage > 1) setCurrentPage(currentPage - 1);
    }
  };

  const handleStatusChange = (patent: CompetitorPatent, status: CompetitorPatent['monitoringStatus']) => {
    updateCompetitorPatent(patent.id, { monitoringStatus: status });
  };

  const resetFilters = () => {
    setSearchText('');
    setCompetitorFilter('');
    setTechnicalFieldFilter('');
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">竞品专利监控</h1>
        <Button leftIcon={<Plus className="h-4 w-4" />}>新增竞品专利</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="监控中专利" value={stats.monitoring} variant="primary" icon={<Eye className="h-5 w-5" />} />
        <StatCard title="重点跟踪" value={stats.tracking} variant="accent" icon={<Flag className="h-5 w-5" />} />
        <StatCard title="已忽略" value={stats.dismissed} variant="danger" icon={<EyeOff className="h-5 w-5" />} />
        <StatCard title="本月新增" value={stats.newThisMonth} variant="success" icon={<AlertTriangle className="h-5 w-5" />} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>筛选条件</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <Input
              placeholder="搜索专利名称、申请号、申请人"
              value={searchText}
              onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }}
              leftIcon={<Search className="h-4 w-4" />}
            />
            <Select placeholder="竞争对手" value={competitorFilter} onChange={(e) => { setCompetitorFilter(e.target.value); setCurrentPage(1); }} options={competitors} />
            <Select placeholder="技术领域" value={technicalFieldFilter} onChange={(e) => { setTechnicalFieldFilter(e.target.value); setCurrentPage(1); }} options={technicalFields} />
            <Select placeholder="监控状态" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} options={MONITORING_STATUS_OPTIONS} />
            <Input type="date" placeholder="开始日期" value={startDate} onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }} />
            <div className="flex gap-2">
              <Input type="date" placeholder="结束日期" value={endDate} onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }} />
              <Button variant="ghost" onClick={resetFilters}>重置</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>专利名称</TableHead>
                <TableHead>申请号</TableHead>
                <TableHead>申请人</TableHead>
                <TableHead>竞争对手</TableHead>
                <TableHead>技术领域</TableHead>
                <TableHead>发现日期</TableHead>
                <TableHead>关联度评分</TableHead>
                <TableHead>监控状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPatents.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-slate-500">暂无数据</TableCell></TableRow>
              ) : (
                paginatedPatents.map((patent) => {
                  const badge = STATUS_BADGE_MAP[patent.monitoringStatus];
                  return (
                    <TableRow key={patent.id}>
                      <TableCell className="font-medium">{truncateText(patent.patentName, 25)}</TableCell>
                      <TableCell className="font-mono text-sm">{patent.applicationNumber}</TableCell>
                      <TableCell>{truncateText(patent.applicant, 12)}</TableCell>
                      <TableCell>{patent.competitorName}</TableCell>
                      <TableCell>{truncateText(patent.technicalField, 12)}</TableCell>
                      <TableCell>{formatDate(patent.discoveryDate)}</TableCell>
                      <TableCell><RelevanceScore score={patent.relevanceScore} /></TableCell>
                      <TableCell><Badge variant={badge.variant as any} dot>{badge.label}</Badge></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                          <Select
                            className="w-28 h-8 text-xs"
                            value={patent.monitoringStatus}
                            onChange={(e) => handleStatusChange(patent, e.target.value as CompetitorPatent['monitoringStatus'])}
                            options={MONITORING_STATUS_OPTIONS.filter(o => o.value !== '')}
                          />
                          <Button variant="ghost" size="sm"><AlertTriangle className="h-4 w-4 text-orange-500" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(patent)}><Trash2 className="h-4 w-4 text-danger-500" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
            <div className="text-sm text-slate-500">共 {filteredPatents.length} 条记录，第 {currentPage} / {totalPages} 页</div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Modal open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <ModalContent>
          <ModalHeader><ModalTitle>确认删除</ModalTitle></ModalHeader>
          <ModalBody>
            <p className="text-slate-600">确定要删除竞品专利 <span className="font-semibold">{patentToDelete?.patentName}</span> 吗？此操作不可撤销。</p>
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
