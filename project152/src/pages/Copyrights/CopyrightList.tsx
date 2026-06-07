import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Eye, Edit, Trash2, ChevronLeft, ChevronRight, Copyright, CheckCircle, Clock } from 'lucide-react';
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
import { Copyright as CopyrightType } from '@/types';
import { truncateText } from '@/utils/formatters';
import { formatDate, getCurrentYear } from '@/utils/dateUtils';

const PAGE_SIZE = 10;

const WORK_TYPE_OPTIONS = [
  { value: '', label: '全部类型' },
  { value: '计算机软件', label: '计算机软件' },
  { value: '美术作品', label: '美术作品' },
  { value: '文字作品', label: '文字作品' },
  { value: '音乐作品', label: '音乐作品' },
  { value: '影视作品', label: '影视作品' },
  { value: '工程设计图', label: '工程设计图' },
  { value: '产品设计图', label: '产品设计图' },
];

const WORK_TYPE_VARIANTS: Record<string, 'active' | 'success' | 'warning' | 'default' | 'pending'> = {
  '计算机软件': 'active',
  '美术作品': 'success',
  '文字作品': 'default',
  '音乐作品': 'warning',
  '影视作品': 'pending',
  '工程设计图': 'active',
  '产品设计图': 'success',
};

export default function CopyrightList() {
  const navigate = useNavigate();
  const { copyrights, deleteCopyright } = useAppStore();
  const [searchText, setSearchText] = useState('');
  const [workType, setWorkType] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [copyrightToDelete, setCopyrightToDelete] = useState<CopyrightType | null>(null);

  const currentYear = getCurrentYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => ({
    value: String(currentYear - i),
    label: `${currentYear - i}年`,
  }));

  const stats = useMemo(() => {
    const total = copyrights.length;
    const registered = copyrights.filter((c) => c.registrationNumber && c.registrationDate).length;
    const pending = total - registered;
    return { total, registered, pending };
  }, [copyrights]);

  const filteredCopyrights = useMemo(() => {
    return copyrights.filter((copyright) => {
      const matchesSearch =
        searchText === '' ||
        copyright.workName.toLowerCase().includes(searchText.toLowerCase()) ||
        copyright.authors.some((author) =>
          author.toLowerCase().includes(searchText.toLowerCase())
        );

      const matchesType = workType === '' || copyright.workType === workType;

      const completionYear = new Date(copyright.completionDate).getFullYear();
      const matchesYear = yearFilter === '' || String(completionYear) === yearFilter;

      return matchesSearch && matchesType && matchesYear;
    });
  }, [copyrights, searchText, workType, yearFilter]);

  const totalPages = Math.ceil(filteredCopyrights.length / PAGE_SIZE);
  const paginatedCopyrights = filteredCopyrights.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleDeleteClick = (copyright: CopyrightType) => {
    setCopyrightToDelete(copyright);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (copyrightToDelete) {
      deleteCopyright(copyrightToDelete.id);
      setDeleteModalOpen(false);
      setCopyrightToDelete(null);
      if (paginatedCopyrights.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    }
  };

  const resetFilters = () => {
    setSearchText('');
    setWorkType('');
    setYearFilter('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">版权管理</h1>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/copyrights/new')}>
          新增版权
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="版权总数"
          value={stats.total}
          variant="primary"
          icon={<Copyright className="h-6 w-6" />}
        />
        <StatCard
          title="已登记"
          value={stats.registered}
          variant="success"
          icon={<CheckCircle className="h-6 w-6" />}
        />
        <StatCard
          title="待登记"
          value={stats.pending}
          variant="accent"
          icon={<Clock className="h-6 w-6" />}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>筛选条件</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              placeholder="搜索作品名称、作者"
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setCurrentPage(1);
              }}
              leftIcon={<Search className="h-4 w-4" />}
            />
            <Select
              placeholder="作品类型"
              value={workType}
              onChange={(e) => {
                setWorkType(e.target.value);
                setCurrentPage(1);
              }}
              options={WORK_TYPE_OPTIONS}
            />
            <Select
              placeholder="完成年份"
              value={yearFilter}
              onChange={(e) => {
                setYearFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={[{ value: '', label: '全部年份' }, ...yearOptions]}
            />
            <Button variant="ghost" onClick={resetFilters} className="self-end">
              重置筛选
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>作品名称</TableHead>
                <TableHead>作品类型</TableHead>
                <TableHead>作者</TableHead>
                <TableHead>完成日期</TableHead>
                <TableHead>登记日期</TableHead>
                <TableHead>登记号</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCopyrights.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCopyrights.map((copyright) => (
                  <TableRow key={copyright.id}>
                    <TableCell className="font-medium">
                      {truncateText(copyright.workName, 30)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={WORK_TYPE_VARIANTS[copyright.workType] || 'default'}>
                        {copyright.workType}
                      </Badge>
                    </TableCell>
                    <TableCell>{truncateText(copyright.authors.join(', '), 20)}</TableCell>
                    <TableCell>{formatDate(copyright.completionDate)}</TableCell>
                    <TableCell>
                      {copyright.registrationDate ? formatDate(copyright.registrationDate) : '-'}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {copyright.registrationNumber || <span className="text-slate-400">未登记</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/copyrights/${copyright.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/copyrights/edit/${copyright.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(copyright)}
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
              共 {filteredCopyrights.length} 条记录，第 {currentPage} / {totalPages} 页
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
              确定要删除版权 <span className="font-semibold">{copyrightToDelete?.workName}</span> 吗？
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
