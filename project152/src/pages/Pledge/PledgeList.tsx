import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Eye, Edit, Trash2, ChevronLeft, ChevronRight, FileText, CheckCircle, Clock, AlertTriangle, DollarSign, PiggyBank, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from '@/components/ui/Table';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
  ModalClose,
} from '@/components/ui/Modal';
import { useAppStore } from '@/store';
import { PledgeFinancing } from '@/types';
import { formatCurrency, formatPercent, truncateText } from '@/utils/formatters';
import { formatDate, isExpired } from '@/utils/dateUtils';

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { value: '', label: '全部状态' },
  { value: 'ACTIVE', label: '进行中' },
  { value: 'MATURED', label: '已到期' },
  { value: 'REDEEMED', label: '已赎回' },
];

const STATUS_LABELS: Record<PledgeFinancing['status'], string> = {
  ACTIVE: '进行中',
  MATURED: '已到期',
  REDEEMED: '已赎回',
};

const STATUS_VARIANTS: Record<PledgeFinancing['status'], 'success' | 'danger' | 'warning'> = {
  ACTIVE: 'success',
  MATURED: 'danger',
  REDEEMED: 'warning',
};

export default function PledgeList() {
  const navigate = useNavigate();
  const { pledgeFinancings, patents, deletePledgeFinancing } = useAppStore();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [pledgeToDelete, setPledgeToDelete] = useState<PledgeFinancing | null>(null);

  const getPatentNames = (patentIds: string[]) => {
    return patentIds
      .map((id) => patents.find((p) => p.id === id)?.name)
      .filter(Boolean) as string[];
  };

  const stats = useMemo(() => {
    const total = pledgeFinancings.length;
    const active = pledgeFinancings.filter((p) => p.status === 'ACTIVE').length;
    const matured = pledgeFinancings.filter((p) => p.status === 'MATURED').length;
    const redeemed = pledgeFinancings.filter((p) => p.status === 'REDEEMED').length;
    const totalAmount = pledgeFinancings.reduce((sum, p) => sum + p.financingAmount, 0);
    return { total, active, matured, redeemed, totalAmount };
  }, [pledgeFinancings]);

  const filteredPledges = useMemo(() => {
    return pledgeFinancings.filter((pledge) => {
      const patentNames = getPatentNames(pledge.patentIds).join(' ').toLowerCase();
      const matchesSearch =
        searchText === '' ||
        pledge.financingNumber.toLowerCase().includes(searchText.toLowerCase()) ||
        pledge.pledgee.toLowerCase().includes(searchText.toLowerCase()) ||
        patentNames.includes(searchText.toLowerCase());

      const matchesStatus = statusFilter === '' || pledge.status === statusFilter;

      const startDateObj = new Date(pledge.startDate);
      const maturityDateObj = new Date(pledge.maturityDate);
      const matchesStartDate =
        startDate === '' || startDateObj >= new Date(startDate);
      const matchesEndDate =
        endDate === '' || maturityDateObj <= new Date(endDate);

      return matchesSearch && matchesStatus && matchesStartDate && matchesEndDate;
    });
  }, [pledgeFinancings, searchText, statusFilter, startDate, endDate, patents]);

  const totalPages = Math.ceil(filteredPledges.length / PAGE_SIZE);
  const paginatedPledges = filteredPledges.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleDeleteClick = (pledge: PledgeFinancing) => {
    setPledgeToDelete(pledge);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (pledgeToDelete) {
      deletePledgeFinancing(pledgeToDelete.id);
      setDeleteModalOpen(false);
      setPledgeToDelete(null);
      if (paginatedPledges.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    }
  };

  const resetFilters = () => {
    setSearchText('');
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">质押融资管理</h1>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/pledges/new')}>
          新增质押融资
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="融资总数"
          value={stats.total}
          variant="primary"
          icon={<PiggyBank className="h-6 w-6" />}
        />
        <StatCard
          title="进行中"
          value={stats.active}
          variant="success"
          icon={<Clock className="h-6 w-6" />}
        />
        <StatCard
          title="已到期"
          value={stats.matured}
          variant="danger"
          icon={<AlertTriangle className="h-6 w-6" />}
        />
        <StatCard
          title="已赎回"
          value={stats.redeemed}
          variant="accent"
          icon={<Wallet className="h-6 w-6" />}
        />
        <StatCard
          title="总融资金额"
          value={stats.totalAmount}
          variant="primary"
          icon={<DollarSign className="h-6 w-6" />}
          prefix="¥"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>筛选条件</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <Input
              placeholder="搜索融资编号、质权人"
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setCurrentPage(1);
              }}
              leftIcon={<Search className="h-4 w-4" />}
            />
            <Select
              placeholder="融资状态"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={STATUS_OPTIONS}
            />
            <div />
            <Input
              type="date"
              label="开始日期开始"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
            />
            <div className="flex gap-2">
              <Input
                type="date"
                label="到期日期结束"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <Button variant="ghost" onClick={resetFilters} className="self-end">
                重置
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>融资编号</TableHead>
                <TableHead>质押专利</TableHead>
                <TableHead>质权人</TableHead>
                <TableHead>融资金额</TableHead>
                <TableHead>利率</TableHead>
                <TableHead>期限（月）</TableHead>
                <TableHead>开始日期</TableHead>
                <TableHead>到期日期</TableHead>
                <TableHead>登记日期</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPledges.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8 text-slate-500">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                paginatedPledges.map((pledge) => {
                  const patentNames = getPatentNames(pledge.patentIds);
                  return (
                    <TableRow key={pledge.id}>
                      <TableCell className="font-mono text-sm">{pledge.financingNumber}</TableCell>
                      <TableCell>
                        <div className="group relative">
                          <Badge variant="active">
                            {patentNames.length} 项专利
                          </Badge>
                          <div className="absolute left-0 top-full mt-1 hidden group-hover:block z-20 bg-white border border-slate-200 rounded-lg shadow-lg p-2 min-w-48">
                            {patentNames.map((name, idx) => (
                              <div key={idx} className="text-sm text-slate-600 py-1">
                                {name}
                              </div>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {truncateText(pledge.pledgee, 15)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(pledge.financingAmount)}
                      </TableCell>
                      <TableCell>{formatPercent(pledge.interestRate)}</TableCell>
                      <TableCell>{pledge.termMonths} 个月</TableCell>
                      <TableCell>{formatDate(pledge.startDate)}</TableCell>
                      <TableCell>
                        <span className={isExpired(pledge.maturityDate) ? 'text-slate-400 line-through' : ''}>
                          {formatDate(pledge.maturityDate)}
                        </span>
                      </TableCell>
                      <TableCell>{pledge.registrationDate ? formatDate(pledge.registrationDate) : '-'}</TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANTS[pledge.status]}>
                          {STATUS_LABELS[pledge.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/pledges/${pledge.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/pledges/edit/${pledge.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(pledge)}
                          >
                            <Trash2 className="h-4 w-4 text-danger-500" />
                          </Button>
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
            <div className="text-sm text-slate-500">
              共 {filteredPledges.length} 条记录，第 {currentPage} / {totalPages} 页
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Modal open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>确认删除</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <p className="text-slate-600">
              确定要删除质押融资记录 <span className="font-semibold">{pledgeToDelete?.financingNumber}</span> 吗？
              此操作不可撤销。
            </p>
          </ModalBody>
          <ModalFooter>
            <ModalClose>取消</ModalClose>
            <Button variant="danger" onClick={confirmDelete}>
              确认删除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
