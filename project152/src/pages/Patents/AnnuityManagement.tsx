import { useState, useMemo } from 'react';
import { Search, Download, CheckCircle, AlertTriangle, Clock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
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
import { Patent, AnnuityRecord, PatentType } from '@/types/patent';
import { formatDate, isExpired, isExpiringSoon, getCurrentYear } from '@/utils/dateUtils';
import { formatCurrency } from '@/utils/formatters';
import { cn } from '@/lib/utils';

const PATENT_TYPE_OPTIONS = [
  { value: 'INVENTION', label: '发明' },
  { value: 'UTILITY_MODEL', label: '实用新型' },
  { value: 'DESIGN', label: '外观设计' },
];

const STATUS_OPTIONS = [
  { value: 'PENDING', label: '待缴' },
  { value: 'PAID', label: '已缴' },
  { value: 'OVERDUE', label: '逾期' },
  { value: 'EXEMPTED', label: '豁免' },
];

const ANNUNITY_STATUS_BADGE: Record<AnnuityRecord['status'], 'pending' | 'paid' | 'overdue' | 'active'> = {
  PENDING: 'pending',
  PAID: 'paid',
  OVERDUE: 'overdue',
  EXEMPTED: 'active',
};

interface ExtendedAnnuityRecord extends AnnuityRecord {
  patentId: string;
  patentName: string;
  applicationNumber: string;
  patentType: PatentType;
}

export default function AnnuityManagement() {
  const { patents, updateAnnuityRecord } = useAppStore();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [patentType, setPatentType] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ExtendedAnnuityRecord | null>(null);
  const [paidAmount, setPaidAmount] = useState('');
  const [paidDate, setPaidDate] = useState('');
  const [note, setNote] = useState('');

  const currentYear = getCurrentYear();
  const yearOptions = Array.from({ length: 20 }, (_, i) => ({
    value: String(currentYear - 5 + i),
    label: String(currentYear - 5 + i),
  }));

  const allAnnuityRecords = useMemo((): ExtendedAnnuityRecord[] => {
    const records: ExtendedAnnuityRecord[] = [];
    patents.forEach((patent) => {
      patent.annuityRecords.forEach((record) => {
        records.push({
          ...record,
          patentId: patent.id,
          patentName: patent.name,
          applicationNumber: patent.applicationNumber,
          patentType: patent.patentType,
        });
      });
    });
    return records.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [patents]);

  const stats = useMemo(() => {
    const pending = allAnnuityRecords.filter((r) => r.status === 'PENDING').length;
    const paid = allAnnuityRecords.filter((r) => r.status === 'PAID').length;
    const overdue = allAnnuityRecords.filter((r) => r.status === 'OVERDUE').length;
    const thisYearExpense = allAnnuityRecords
      .filter((r) => r.year === currentYear && r.status !== 'EXEMPTED')
      .reduce((sum, r) => sum + r.amount, 0);
    return { pending, paid, overdue, thisYearExpense };
  }, [allAnnuityRecords, currentYear]);

  const filteredRecords = useMemo(() => {
    return allAnnuityRecords.filter((record) => {
      const matchesSearch =
        searchText === '' ||
        record.patentName.toLowerCase().includes(searchText.toLowerCase()) ||
        record.applicationNumber.toLowerCase().includes(searchText.toLowerCase());

      const matchesStatus = statusFilter === '' || record.status === statusFilter;
      const matchesType = patentType === '' || record.patentType === patentType;
      const matchesStartYear = startYear === '' || record.year >= parseInt(startYear);
      const matchesEndYear = endYear === '' || record.year <= parseInt(endYear);

      return matchesSearch && matchesStatus && matchesType && matchesStartYear && matchesEndYear;
    });
  }, [allAnnuityRecords, searchText, statusFilter, patentType, startYear, endYear]);

  const handleMarkPaid = (record: ExtendedAnnuityRecord) => {
    setSelectedRecord(record);
    setPaidAmount(String(record.amount));
    setPaidDate(formatDate(new Date().toISOString()));
    setNote('');
    setModalOpen(true);
  };

  const confirmPayment = () => {
    if (selectedRecord) {
      updateAnnuityRecord(selectedRecord.patentId, selectedRecord.id, {
        status: 'PAID',
        paidAmount: parseFloat(paidAmount),
        paidDate: new Date(paidDate).toISOString(),
        note,
      });
      setModalOpen(false);
      setSelectedRecord(null);
    }
  };

  const getRowClassName = (record: ExtendedAnnuityRecord) => {
    if (record.status === 'OVERDUE' || (record.status === 'PENDING' && isExpired(record.dueDate))) {
      return 'bg-red-50 hover:bg-red-100';
    }
    if (record.status === 'PENDING' && isExpiringSoon(record.dueDate, 30)) {
      return 'bg-yellow-50 hover:bg-yellow-100';
    }
    return '';
  };

  const handleExport = () => {
    alert('导出功能（模拟）：已导出 ' + filteredRecords.length + ' 条年费记录');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">年费管理</h1>
        <Button variant="secondary" leftIcon={<Download className="h-4 w-4" />} onClick={handleExport}>
          批量导出
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="待缴年费" value={stats.pending} icon={<Clock className="h-6 w-6" />} variant="accent" />
        <StatCard title="已缴年费" value={stats.paid} icon={<CheckCircle className="h-6 w-6" />} variant="success" />
        <StatCard title="逾期年费" value={stats.overdue} icon={<AlertTriangle className="h-6 w-6" />} variant="danger" />
        <StatCard title="本年预计支出" value={formatCurrency(stats.thisYearExpense)} icon={<DollarSign className="h-6 w-6" />} variant="primary" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>筛选条件</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <Input
              placeholder="搜索专利名称、申请号"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
            <Select
              placeholder="缴费状态"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={STATUS_OPTIONS}
            />
            <Select
              placeholder="专利类型"
              value={patentType}
              onChange={(e) => setPatentType(e.target.value)}
              options={PATENT_TYPE_OPTIONS}
            />
            <Select
              placeholder="开始年份"
              value={startYear}
              onChange={(e) => setStartYear(e.target.value)}
              options={yearOptions}
            />
            <Select
              placeholder="结束年份"
              value={endYear}
              onChange={(e) => setEndYear(e.target.value)}
              options={yearOptions}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>专利名称</TableHead>
                <TableHead>年份</TableHead>
                <TableHead>到期日</TableHead>
                <TableHead>应缴金额</TableHead>
                <TableHead>已缴金额</TableHead>
                <TableHead>缴费日期</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((record) => (
                  <TableRow key={record.id} className={cn(getRowClassName(record))}>
                    <TableCell className="font-medium">{record.patentName}</TableCell>
                    <TableCell>第 {record.year} 年</TableCell>
                    <TableCell>{formatDate(record.dueDate)}</TableCell>
                    <TableCell>{formatCurrency(record.amount)}</TableCell>
                    <TableCell>{record.paidAmount ? formatCurrency(record.paidAmount) : '-'}</TableCell>
                    <TableCell>{record.paidDate ? formatDate(record.paidDate) : '-'}</TableCell>
                    <TableCell>
                      <Badge variant={ANNUNITY_STATUS_BADGE[record.status]} dot>
                        {record.status === 'PENDING' && isExpired(record.dueDate) ? '逾期' : record.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {record.status === 'PENDING' && (
                        <Button
                          size="sm"
                          variant="success"
                          leftIcon={<CheckCircle className="h-4 w-4" />}
                          onClick={() => handleMarkPaid(record)}
                        >
                          标记缴费
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal open={modalOpen} onOpenChange={setModalOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>标记缴费</ModalTitle>
          </ModalHeader>
          <ModalBody className="space-y-4">
            {selectedRecord && (
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="font-medium">{selectedRecord.patentName}</p>
                <p className="text-sm text-slate-500">第 {selectedRecord.year} 年 · 应缴 {formatCurrency(selectedRecord.amount)}</p>
              </div>
            )}
            <Input label="缴费金额" type="number" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} />
            <Input label="缴费日期" type="date" value={paidDate} onChange={(e) => setPaidDate(e.target.value)} />
            <Input label="备注" type="textarea" value={note} onChange={(e) => setNote(e.target.value)} placeholder="请输入备注信息" />
          </ModalBody>
          <ModalFooter>
            <ModalClose>取消</ModalClose>
            <Button onClick={confirmPayment}>确认缴费</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
