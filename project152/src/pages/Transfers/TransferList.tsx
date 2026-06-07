import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Eye, Edit, Trash2, ChevronLeft, ChevronRight, FileText, Clock, CheckCircle, AlertTriangle, DollarSign, ArrowRightLeft } from 'lucide-react';
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
import { TechnologyTransfer } from '@/types';
import { formatCurrency, truncateText } from '@/utils/formatters';
import { formatDate } from '@/utils/dateUtils';

const PAGE_SIZE = 10;

const TRANSFER_TYPE_OPTIONS = [
  { value: '', label: '全部类型' },
  { value: 'ASSIGNMENT', label: '转让' },
  { value: 'MERGER', label: '合并' },
  { value: 'SPIN_OFF', label: '分拆' },
];

const STATUS_OPTIONS = [
  { value: '', label: '全部状态' },
  { value: 'PENDING', label: '待完成' },
  { value: 'COMPLETED', label: '已完成' },
  { value: 'CANCELLED', label: '已取消' },
];

const TRANSFER_TYPE_LABELS: Record<TechnologyTransfer['transferType'], string> = {
  ASSIGNMENT: '转让',
  MERGER: '合并',
  SPIN_OFF: '分拆',
};

const STATUS_LABELS: Record<TechnologyTransfer['status'], string> = {
  PENDING: '待完成',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
};

const STATUS_VARIANTS: Record<TechnologyTransfer['status'], 'pending' | 'success' | 'danger'> = {
  PENDING: 'pending',
  COMPLETED: 'success',
  CANCELLED: 'danger',
};

const TRANSFER_TYPE_VARIANTS: Record<TechnologyTransfer['transferType'], 'active' | 'warning' | 'pending'> = {
  ASSIGNMENT: 'active',
  MERGER: 'warning',
  SPIN_OFF: 'pending',
};

export default function TransferList() {
  const navigate = useNavigate();
  const { technologyTransfers, patents, deleteTechnologyTransfer } = useAppStore();
  const [searchText, setSearchText] = useState('');
  const [transferTypeFilter, setTransferTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [transferToDelete, setTransferToDelete] = useState<TechnologyTransfer | null>(null);

  const getPatentNames = (patentIds: string[]) => {
    return patentIds
      .map((id) => patents.find((p) => p.id === id)?.name)
      .filter(Boolean) as string[];
  };

  const stats = useMemo(() => {
    const total = technologyTransfers.length;
    const pending = technologyTransfers.filter((t) => t.status === 'PENDING').length;
    const completed = technologyTransfers.filter((t) => t.status === 'COMPLETED').length;
    const totalAmount = technologyTransfers.reduce((sum, t) => sum + t.consideration, 0);
    return { total, pending, completed, totalAmount };
  }, [technologyTransfers]);

  const filteredTransfers = useMemo(() => {
    return technologyTransfers.filter((transfer) => {
      const patentNames = getPatentNames(transfer.patentIds).join(' ').toLowerCase();
      const matchesSearch =
        searchText === '' ||
        transfer.transferNumber.toLowerCase().includes(searchText.toLowerCase()) ||
        transfer.transferor.toLowerCase().includes(searchText.toLowerCase()) ||
        transfer.transferee.toLowerCase().includes(searchText.toLowerCase()) ||
        patentNames.includes(searchText.toLowerCase());

      const matchesType = transferTypeFilter === '' || transfer.transferType === transferTypeFilter;
      const matchesStatus = statusFilter === '' || transfer.status === statusFilter;

      const transferDate = new Date(transfer.transferDate);
      const matchesStartDate =
        startDate === '' || transferDate >= new Date(startDate);
      const matchesEndDate =
        endDate === '' || transferDate <= new Date(endDate);

      return matchesSearch && matchesType && matchesStatus && matchesStartDate && matchesEndDate;
    });
  }, [technologyTransfers, searchText, transferTypeFilter, statusFilter, startDate, endDate, patents]);

  const totalPages = Math.ceil(filteredTransfers.length / PAGE_SIZE);
  const paginatedTransfers = filteredTransfers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleDeleteClick = (transfer: TechnologyTransfer) => {
    setTransferToDelete(transfer);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (transferToDelete) {
      deleteTechnologyTransfer(transferToDelete.id);
      setDeleteModalOpen(false);
      setTransferToDelete(null);
      if (paginatedTransfers.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    }
  };

  const resetFilters = () => {
    setSearchText('');
    setTransferTypeFilter('');
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">转让记录管理</h1>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/transfers/new')}>
          新增转让记录
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="转让总数"
          value={stats.total}
          variant="primary"
          icon={<ArrowRightLeft className="h-6 w-6" />}
        />
        <StatCard
          title="待完成"
          value={stats.pending}
          variant="accent"
          icon={<Clock className="h-6 w-6" />}
        />
        <StatCard
          title="已完成"
          value={stats.completed}
          variant="success"
          icon={<CheckCircle className="h-6 w-6" />}
        />
        <StatCard
          title="总转让金额"
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
              placeholder="搜索转让编号、转让方、受让方"
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setCurrentPage(1);
              }}
              leftIcon={<Search className="h-4 w-4" />}
            />
            <Select
              placeholder="转让类型"
              value={transferTypeFilter}
              onChange={(e) => {
                setTransferTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={TRANSFER_TYPE_OPTIONS}
            />
            <Select
              placeholder="转让状态"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={STATUS_OPTIONS}
            />
            <Input
              type="date"
              label="转让日期开始"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
            />
            <div className="flex gap-2">
              <Input
                type="date"
                label="转让日期结束"
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
                <TableHead>转让编号</TableHead>
                <TableHead>转让专利</TableHead>
                <TableHead>转让方</TableHead>
                <TableHead>受让方</TableHead>
                <TableHead>转让类型</TableHead>
                <TableHead>转让日期</TableHead>
                <TableHead>转让对价</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTransfers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTransfers.map((transfer) => {
                  const patentNames = getPatentNames(transfer.patentIds);
                  return (
                    <TableRow key={transfer.id}>
                      <TableCell className="font-mono text-sm">{transfer.transferNumber}</TableCell>
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
                        {truncateText(transfer.transferor, 15)}
                      </TableCell>
                      <TableCell>
                        {truncateText(transfer.transferee, 15)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={TRANSFER_TYPE_VARIANTS[transfer.transferType]}>
                          {TRANSFER_TYPE_LABELS[transfer.transferType]}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(transfer.transferDate)}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(transfer.consideration)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANTS[transfer.status]}>
                          {STATUS_LABELS[transfer.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/transfers/${transfer.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/transfers/edit/${transfer.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(transfer)}
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
              共 {filteredTransfers.length} 条记录，第 {currentPage} / {totalPages} 页
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
              确定要删除转让记录 <span className="font-semibold">{transferToDelete?.transferNumber}</span> 吗？
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
