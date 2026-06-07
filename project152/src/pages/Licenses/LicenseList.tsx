import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Eye, Edit, Trash2, ChevronLeft, ChevronRight, FileText, CheckCircle, Clock, AlertTriangle, DollarSign, CreditCard } from 'lucide-react';
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
import { LicenseAgreement } from '@/types';
import { formatCurrency, truncateText } from '@/utils/formatters';
import { formatDate, isExpired, isExpiringSoon } from '@/utils/dateUtils';

const PAGE_SIZE = 10;

const LICENSE_TYPE_OPTIONS = [
  { value: '', label: '全部类型' },
  { value: 'EXCLUSIVE', label: '独占许可' },
  { value: 'NON_EXCLUSIVE', label: '非独占许可' },
  { value: 'SOLE', label: '排他许可' },
];

const STATUS_OPTIONS = [
  { value: '', label: '全部状态' },
  { value: 'ACTIVE', label: '有效' },
  { value: 'EXPIRED', label: '已过期' },
  { value: 'TERMINATED', label: '已终止' },
];

const LICENSE_TYPE_LABELS: Record<LicenseAgreement['licenseType'], string> = {
  EXCLUSIVE: '独占许可',
  NON_EXCLUSIVE: '非独占许可',
  SOLE: '排他许可',
};

const STATUS_LABELS: Record<LicenseAgreement['status'], string> = {
  ACTIVE: '有效',
  EXPIRED: '已过期',
  TERMINATED: '已终止',
};

const STATUS_VARIANTS: Record<LicenseAgreement['status'], 'success' | 'expired' | 'danger'> = {
  ACTIVE: 'success',
  EXPIRED: 'expired',
  TERMINATED: 'danger',
};

const LICENSE_TYPE_VARIANTS: Record<LicenseAgreement['licenseType'], 'active' | 'pending' | 'warning'> = {
  EXCLUSIVE: 'active',
  NON_EXCLUSIVE: 'pending',
  SOLE: 'warning',
};

export default function LicenseList() {
  const navigate = useNavigate();
  const { licenseAgreements, patents, deleteLicenseAgreement } = useAppStore();
  const [searchText, setSearchText] = useState('');
  const [licenseTypeFilter, setLicenseTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [licenseToDelete, setLicenseToDelete] = useState<LicenseAgreement | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<LicenseAgreement | null>(null);

  const getPatentNames = (patentIds: string[]) => {
    return patentIds
      .map((id) => patents.find((p) => p.id === id)?.name)
      .filter(Boolean) as string[];
  };

  const stats = useMemo(() => {
    const total = licenseAgreements.length;
    const active = licenseAgreements.filter((l) => l.status === 'ACTIVE').length;
    const expiringSoon = licenseAgreements.filter((l) => isExpiringSoon(l.expirationDate, 90) && l.status === 'ACTIVE').length;
    const expired = licenseAgreements.filter((l) => l.status === 'EXPIRED' || isExpired(l.expirationDate)).length;
    const totalFee = licenseAgreements.reduce((sum, l) => sum + l.licenseFee, 0);
    return { total, active, expiringSoon, expired, totalFee };
  }, [licenseAgreements]);

  const filteredLicenses = useMemo(() => {
    return licenseAgreements.filter((license) => {
      const patentNames = getPatentNames(license.patentIds).join(' ').toLowerCase();
      const matchesSearch =
        searchText === '' ||
        license.agreementNumber.toLowerCase().includes(searchText.toLowerCase()) ||
        license.licensee.toLowerCase().includes(searchText.toLowerCase()) ||
        patentNames.includes(searchText.toLowerCase());

      const matchesType = licenseTypeFilter === '' || license.licenseType === licenseTypeFilter;
      const matchesStatus = statusFilter === '' || license.status === statusFilter;

      const effectiveDate = new Date(license.effectiveDate);
      const expirationDate = new Date(license.expirationDate);
      const matchesStartDate =
        startDate === '' || effectiveDate >= new Date(startDate);
      const matchesEndDate =
        endDate === '' || expirationDate <= new Date(endDate);

      return matchesSearch && matchesType && matchesStatus && matchesStartDate && matchesEndDate;
    });
  }, [licenseAgreements, searchText, licenseTypeFilter, statusFilter, startDate, endDate, patents]);

  const totalPages = Math.ceil(filteredLicenses.length / PAGE_SIZE);
  const paginatedLicenses = filteredLicenses.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleDeleteClick = (license: LicenseAgreement) => {
    setLicenseToDelete(license);
    setDeleteModalOpen(true);
  };

  const handlePaymentClick = (license: LicenseAgreement) => {
    setSelectedLicense(license);
    setPaymentModalOpen(true);
  };

  const confirmDelete = () => {
    if (licenseToDelete) {
      deleteLicenseAgreement(licenseToDelete.id);
      setDeleteModalOpen(false);
      setLicenseToDelete(null);
      if (paginatedLicenses.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    }
  };

  const resetFilters = () => {
    setSearchText('');
    setLicenseTypeFilter('');
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const isRowHighlighted = (license: LicenseAgreement) => {
    return isExpiringSoon(license.expirationDate, 90) && license.status === 'ACTIVE';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">许可协议管理</h1>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/licenses/new')}>
          新增许可协议
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="协议总数"
          value={stats.total}
          variant="primary"
          icon={<FileText className="h-6 w-6" />}
        />
        <StatCard
          title="有效协议"
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
        <StatCard
          title="总许可费用"
          value={stats.totalFee}
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
              placeholder="搜索协议编号、被许可方、专利名称"
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setCurrentPage(1);
              }}
              leftIcon={<Search className="h-4 w-4" />}
            />
            <Select
              placeholder="许可类型"
              value={licenseTypeFilter}
              onChange={(e) => {
                setLicenseTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={LICENSE_TYPE_OPTIONS}
            />
            <Select
              placeholder="协议状态"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={STATUS_OPTIONS}
            />
            <Input
              type="date"
              label="生效日期开始"
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
                <TableHead>协议编号</TableHead>
                <TableHead>被许可方</TableHead>
                <TableHead>许可专利</TableHead>
                <TableHead>许可类型</TableHead>
                <TableHead>许可范围</TableHead>
                <TableHead>生效日期</TableHead>
                <TableHead>到期日期</TableHead>
                <TableHead>协议状态</TableHead>
                <TableHead>许可费</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLicenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-slate-500">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                paginatedLicenses.map((license) => {
                  const patentNames = getPatentNames(license.patentIds);
                  return (
                    <TableRow
                      key={license.id}
                      className={isRowHighlighted(license) ? 'bg-amber-50/50 hover:bg-amber-50' : ''}
                    >
                      <TableCell className="font-mono text-sm">{license.agreementNumber}</TableCell>
                      <TableCell className="font-medium">
                        {truncateText(license.licensee, 15)}
                        {isRowHighlighted(license) && (
                          <Badge variant="warning" dot className="ml-2">
                            即将到期
                          </Badge>
                        )}
                      </TableCell>
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
                      <TableCell>
                        <Badge variant={LICENSE_TYPE_VARIANTS[license.licenseType]}>
                          {LICENSE_TYPE_LABELS[license.licenseType]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {truncateText(license.licenseScope, 20)}
                      </TableCell>
                      <TableCell>{formatDate(license.effectiveDate)}</TableCell>
                      <TableCell>
                        <span className={isExpired(license.expirationDate) ? 'text-slate-400 line-through' : ''}>
                          {formatDate(license.expirationDate)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANTS[license.status]}>
                          {STATUS_LABELS[license.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(license.licenseFee)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/licenses/${license.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/licenses/edit/${license.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePaymentClick(license)}
                          >
                            <CreditCard className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(license)}
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
              共 {filteredLicenses.length} 条记录，第 {currentPage} / {totalPages} 页
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
              确定要删除许可协议 <span className="font-semibold">{licenseToDelete?.agreementNumber}</span> 吗？
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

      <Modal open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <ModalContent className="max-w-2xl">
          <ModalHeader>
            <ModalTitle>付款记录 - {selectedLicense?.agreementNumber}</ModalTitle>
          </ModalHeader>
          <ModalBody>
            {selectedLicense?.paymentRecords && selectedLicense.paymentRecords.length > 0 ? (
              <div className="space-y-3">
                {selectedLicense.paymentRecords.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-800">
                        应付款日期: {formatDate(record.dueDate)}
                      </p>
                      {record.paidDate && (
                        <p className="text-sm text-slate-500">
                          实际付款日期: {formatDate(record.paidDate)}
                        </p>
                      )}
                      {record.reference && (
                        <p className="text-sm text-slate-500">
                          付款凭证: {record.reference}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{formatCurrency(record.amount)}</p>
                      <Badge variant={record.status === 'PAID' ? 'success' : record.status === 'OVERDUE' ? 'danger' : 'pending'}>
                        {record.status === 'PAID' ? '已支付' : record.status === 'OVERDUE' ? '已逾期' : '待支付'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-slate-500 py-8">暂无付款记录</p>
            )}
          </ModalBody>
          <ModalFooter>
            <ModalClose>关闭</ModalClose>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
