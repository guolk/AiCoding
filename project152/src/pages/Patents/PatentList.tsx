import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Eye, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
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
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
  ModalClose,
} from '@/components/ui/Modal';
import StatusBadge from '@/components/charts/StatusBadge';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/store';
import { Patent, PatentType, PatentStatus } from '@/types/patent';
import { truncateText } from '@/utils/formatters';
import { formatDate, getCurrentYear } from '@/utils/dateUtils';

const PAGE_SIZE = 10;

const PATENT_TYPE_OPTIONS = [
  { value: 'INVENTION', label: '发明' },
  { value: 'UTILITY_MODEL', label: '实用新型' },
  { value: 'DESIGN', label: '外观设计' },
];

const PATENT_STATUS_OPTIONS = [
  { value: 'APPLICATION', label: '申请中' },
  { value: 'SUBSTANTIVE_EXAMINATION', label: '实质审查' },
  { value: 'AUTHORIZED', label: '已授权' },
  { value: 'MAINTENANCE', label: '维持中' },
  { value: 'ENFORCEMENT', label: '维权中' },
  { value: 'EXPIRED', label: '已过期' },
];

const PATENT_TYPE_LABELS: Record<PatentType, string> = {
  INVENTION: '发明',
  UTILITY_MODEL: '实用新型',
  DESIGN: '外观设计',
};

export default function PatentList() {
  const navigate = useNavigate();
  const { patents, deletePatent } = useAppStore();
  const [searchText, setSearchText] = useState('');
  const [patentType, setPatentType] = useState('');
  const [patentStatus, setPatentStatus] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [patentToDelete, setPatentToDelete] = useState<Patent | null>(null);

  const currentYear = getCurrentYear();
  const yearOptions = Array.from({ length: 20 }, (_, i) => ({
    value: String(currentYear - i),
    label: String(currentYear - i),
  }));

  const filteredPatents = useMemo(() => {
    return patents.filter((patent) => {
      const matchesSearch =
        searchText === '' ||
        patent.name.toLowerCase().includes(searchText.toLowerCase()) ||
        patent.applicationNumber.toLowerCase().includes(searchText.toLowerCase()) ||
        patent.inventors.some((inv) => inv.toLowerCase().includes(searchText.toLowerCase()));

      const matchesType = patentType === '' || patent.patentType === patentType;
      const matchesStatus = patentStatus === '' || patent.status === patentStatus;

      const appYear = new Date(patent.applicationDate).getFullYear();
      const matchesStartYear = startYear === '' || appYear >= parseInt(startYear);
      const matchesEndYear = endYear === '' || appYear <= parseInt(endYear);

      return matchesSearch && matchesType && matchesStatus && matchesStartYear && matchesEndYear;
    });
  }, [patents, searchText, patentType, patentStatus, startYear, endYear]);

  const totalPages = Math.ceil(filteredPatents.length / PAGE_SIZE);
  const paginatedPatents = filteredPatents.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleDeleteClick = (patent: Patent) => {
    setPatentToDelete(patent);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (patentToDelete) {
      deletePatent(patentToDelete.id);
      setDeleteModalOpen(false);
      setPatentToDelete(null);
      if (paginatedPatents.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    }
  };

  const resetFilters = () => {
    setSearchText('');
    setPatentType('');
    setPatentStatus('');
    setStartYear('');
    setEndYear('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">专利管理</h1>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/patents/new')}>
          新增专利
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>筛选条件</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <Input
              placeholder="搜索专利名称、申请号、发明人"
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setCurrentPage(1);
              }}
              leftIcon={<Search className="h-4 w-4" />}
            />
            <Select
              placeholder="专利类型"
              value={patentType}
              onChange={(e) => {
                setPatentType(e.target.value);
                setCurrentPage(1);
              }}
              options={PATENT_TYPE_OPTIONS}
            />
            <Select
              placeholder="专利状态"
              value={patentStatus}
              onChange={(e) => {
                setPatentStatus(e.target.value);
                setCurrentPage(1);
              }}
              options={PATENT_STATUS_OPTIONS}
            />
            <Select
              placeholder="开始年份"
              value={startYear}
              onChange={(e) => {
                setStartYear(e.target.value);
                setCurrentPage(1);
              }}
              options={[{ value: '', label: '开始年份' }, ...yearOptions]}
            />
            <div className="flex gap-2">
              <Select
                placeholder="结束年份"
                value={endYear}
                onChange={(e) => {
                  setEndYear(e.target.value);
                  setCurrentPage(1);
                }}
                options={[{ value: '', label: '结束年份' }, ...yearOptions]}
              />
              <Button variant="ghost" onClick={resetFilters}>
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
                <TableHead>专利名称</TableHead>
                <TableHead>申请号</TableHead>
                <TableHead>专利类型</TableHead>
                <TableHead>发明人</TableHead>
                <TableHead>申请日</TableHead>
                <TableHead>授权日</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPatents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                paginatedPatents.map((patent) => (
                  <TableRow key={patent.id}>
                    <TableCell className="font-medium">
                      {truncateText(patent.name, 30)}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{patent.applicationNumber}</TableCell>
                    <TableCell>
                      <Badge variant="active">{PATENT_TYPE_LABELS[patent.patentType]}</Badge>
                    </TableCell>
                    <TableCell>{truncateText(patent.inventors.join(', '), 20)}</TableCell>
                    <TableCell>{formatDate(patent.applicationDate)}</TableCell>
                    <TableCell>
                      {patent.authorizationDate ? formatDate(patent.authorizationDate) : '-'}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={patent.status as PatentStatus} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/patents/${patent.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/patents/edit/${patent.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(patent)}
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
              共 {filteredPatents.length} 条记录，第 {currentPage} / {totalPages} 页
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
              确定要删除专利 <span className="font-semibold">{patentToDelete?.name}</span> 吗？
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
