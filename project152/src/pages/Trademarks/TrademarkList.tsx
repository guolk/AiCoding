import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Eye, Edit, Trash2, ChevronLeft, ChevronRight, Award, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
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
import { Trademark as TrademarkType } from '@/types';
import { truncateText } from '@/utils/formatters';
import { formatDate, isExpired, isExpiringSoon } from '@/utils/dateUtils';

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { value: '', label: '全部状态' },
  { value: 'APPLIED', label: '申请中' },
  { value: 'REGISTERED', label: '已注册' },
  { value: 'RENEWED', label: '已续展' },
  { value: 'EXPIRED', label: '已过期' },
  { value: 'OPPOSED', label: '异议中' },
];

const CATEGORY_OPTIONS = [
  { value: '', label: '全部类别' },
  { value: '第9类-科学仪器', label: '第9类-科学仪器' },
  { value: '第35类-广告销售', label: '第35类-广告销售' },
  { value: '第38类-通讯服务', label: '第38类-通讯服务' },
  { value: '第42类-设计研究', label: '第42类-设计研究' },
];

const STATUS_LABELS: Record<TrademarkType['status'], string> = {
  APPLIED: '申请中',
  REGISTERED: '已注册',
  RENEWED: '已续展',
  EXPIRED: '已过期',
  OPPOSED: '异议中',
};

const STATUS_VARIANTS: Record<TrademarkType['status'], 'default' | 'success' | 'warning' | 'danger' | 'pending' | 'expired'> = {
  APPLIED: 'pending',
  REGISTERED: 'success',
  RENEWED: 'success',
  EXPIRED: 'expired',
  OPPOSED: 'warning',
};

const TRADEMARK_COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-red-500',
];

export default function TrademarkList() {
  const navigate = useNavigate();
  const { trademarks, deleteTrademark } = useAppStore();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [trademarkToDelete, setTrademarkToDelete] = useState<TrademarkType | null>(null);

  const stats = useMemo(() => {
    const total = trademarks.length;
    const active = trademarks.filter((t) => t.status === 'REGISTERED' || t.status === 'RENEWED').length;
    const expiringSoon = trademarks.filter((t) => isExpiringSoon(t.validTo, 180) && !isExpired(t.validTo)).length;
    const expired = trademarks.filter((t) => isExpired(t.validTo)).length;
    return { total, active, expiringSoon, expired };
  }, [trademarks]);

  const filteredTrademarks = useMemo(() => {
    return trademarks.filter((trademark) => {
      const matchesSearch =
        searchText === '' ||
        trademark.name.toLowerCase().includes(searchText.toLowerCase()) ||
        trademark.registrationNumber.toLowerCase().includes(searchText.toLowerCase());

      const matchesStatus = statusFilter === '' || trademark.status === statusFilter;
      const matchesCategory =
        categoryFilter === '' || trademark.categories.includes(categoryFilter);

      const validToDate = new Date(trademark.validTo);
      const matchesStartDate =
        startDate === '' || validToDate >= new Date(startDate);
      const matchesEndDate =
        endDate === '' || validToDate <= new Date(endDate);

      return (
        matchesSearch && matchesStatus && matchesCategory && matchesStartDate && matchesEndDate
      );
    });
  }, [trademarks, searchText, statusFilter, categoryFilter, startDate, endDate]);

  const totalPages = Math.ceil(filteredTrademarks.length / PAGE_SIZE);
  const paginatedTrademarks = filteredTrademarks.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleDeleteClick = (trademark: TrademarkType) => {
    setTrademarkToDelete(trademark);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (trademarkToDelete) {
      deleteTrademark(trademarkToDelete.id);
      setDeleteModalOpen(false);
      setTrademarkToDelete(null);
      if (paginatedTrademarks.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    }
  };

  const resetFilters = () => {
    setSearchText('');
    setStatusFilter('');
    setCategoryFilter('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const getTrademarkColor = (name: string) => {
    const index = name.charCodeAt(0) % TRADEMARK_COLORS.length;
    return TRADEMARK_COLORS[index];
  };

  const isRowHighlighted = (trademark: TrademarkType) => {
    return isExpiringSoon(trademark.validTo, 180) && !isExpired(trademark.validTo);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">商标管理</h1>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/trademarks/new')}>
          新增商标
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="商标总数"
          value={stats.total}
          variant="primary"
          icon={<Award className="h-6 w-6" />}
        />
        <StatCard
          title="有效商标"
          value={stats.active}
          variant="success"
          icon={<CheckCircle className="h-6 w-6" />}
        />
        <StatCard
          title="即将到期"
          value={stats.expiringSoon}
          variant="accent"
          icon={<Clock className="h-6 w-6" />}
        />
        <StatCard
          title="已过期"
          value={stats.expired}
          variant="danger"
          icon={<AlertTriangle className="h-6 w-6" />}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>筛选条件</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <Input
              placeholder="搜索商标名称、注册号"
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setCurrentPage(1);
              }}
              leftIcon={<Search className="h-4 w-4" />}
            />
            <Select
              placeholder="商标状态"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={STATUS_OPTIONS}
            />
            <Select
              placeholder="注册类别"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={CATEGORY_OPTIONS}
            />
            <Input
              type="date"
              label="有效期开始"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
            />
            <div className="flex gap-2">
              <Input
                type="date"
                label="有效期结束"
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
                <TableHead>商标图样</TableHead>
                <TableHead>商标名称</TableHead>
                <TableHead>注册号</TableHead>
                <TableHead>注册类别</TableHead>
                <TableHead>申请日期</TableHead>
                <TableHead>有效期至</TableHead>
                <TableHead>当前状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTrademarks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTrademarks.map((trademark) => (
                  <TableRow
                    key={trademark.id}
                    className={isRowHighlighted(trademark) ? 'bg-amber-50/50 hover:bg-amber-50' : ''}
                  >
                    <TableCell>
                      <div
                        className={`w-12 h-12 rounded-lg ${getTrademarkColor(trademark.name)} flex items-center justify-center text-white font-bold text-lg shadow-md`}
                      >
                        {trademark.name.charAt(0)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {truncateText(trademark.name, 20)}
                      {isRowHighlighted(trademark) && (
                        <Badge variant="warning" dot className="ml-2">
                          即将到期
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{trademark.registrationNumber}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {trademark.categories.map((cat, idx) => (
                          <Badge key={idx} variant="active" className="text-xs">
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(trademark.applicationDate)}</TableCell>
                    <TableCell>
                      <span className={isExpired(trademark.validTo) ? 'text-slate-400 line-through' : ''}>
                        {formatDate(trademark.validTo)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANTS[trademark.status]}>
                        {STATUS_LABELS[trademark.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/trademarks/${trademark.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/trademarks/edit/${trademark.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(trademark)}
                        >
                          <Trash2 className="h-4 w-4 text-danger-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
            <div className="text-sm text-slate-500">
              共 {filteredTrademarks.length} 条记录，第 {currentPage} / {totalPages} 页
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
              确定要删除商标 <span className="font-semibold">{trademarkToDelete?.name}</span> 吗？
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
