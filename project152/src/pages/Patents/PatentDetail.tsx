import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, CheckCircle, FileText, FileCode, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Timeline, TimelineItem, TimelineDot, TimelineDate, TimelineContent } from '@/components/ui/Timeline';
import StatusBadge from '@/components/charts/StatusBadge';
import { useAppStore } from '@/store';
import { PatentStatus, PatentType, AnnuityRecord } from '@/types/patent';
import { formatDate } from '@/utils/dateUtils';
import { formatCurrency } from '@/utils/formatters';

const PATENT_TYPE_LABELS: Record<PatentType, string> = {
  INVENTION: '发明',
  UTILITY_MODEL: '实用新型',
  DESIGN: '外观设计',
};

const STATUS_OPTIONS = [
  { value: 'APPLICATION', label: '申请中' },
  { value: 'SUBSTANTIVE_EXAMINATION', label: '实质审查' },
  { value: 'AUTHORIZED', label: '已授权' },
  { value: 'MAINTENANCE', label: '维持中' },
  { value: 'ENFORCEMENT', label: '维权中' },
  { value: 'EXPIRED', label: '已过期' },
];

const ANNUNITY_STATUS_BADGE: Record<AnnuityRecord['status'], 'pending' | 'paid' | 'overdue' | 'active'> = {
  PENDING: 'pending',
  PAID: 'paid',
  OVERDUE: 'overdue',
  EXEMPTED: 'active',
};

const InfoItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <p className="text-sm text-slate-500">{label}</p>
    <p className="font-medium">{value}</p>
  </div>
);

const StatusChangeModal = ({
  open,
  onOpenChange,
  currentStatus,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStatus: PatentStatus;
  onConfirm: (status: PatentStatus, note: string) => void;
}) => {
  const [newStatus, setNewStatus] = useState<PatentStatus>(currentStatus);
  const [note, setNote] = useState('');

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader><ModalTitle>状态变更</ModalTitle></ModalHeader>
        <ModalBody className="space-y-4">
          <Select label="新状态" value={newStatus} onChange={(e) => setNewStatus(e.target.value as PatentStatus)} options={STATUS_OPTIONS} />
          <Input label="备注" type="textarea" value={note} onChange={(e) => setNote(e.target.value)} placeholder="请输入状态变更备注" />
        </ModalBody>
        <ModalFooter>
          <ModalClose>取消</ModalClose>
          <Button onClick={() => onConfirm(newStatus, note)}>确认变更</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const AnnuityPaymentModal = ({
  open,
  onOpenChange,
  record,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: AnnuityRecord | null;
  onConfirm: (paidAmount: number, paidDate: string, note: string) => void;
}) => {
  const [paidAmount, setPaidAmount] = useState(record ? String(record.amount) : '');
  const [paidDate, setPaidDate] = useState(formatDate(new Date().toISOString()));
  const [note, setNote] = useState('');

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader><ModalTitle>标记缴费</ModalTitle></ModalHeader>
        <ModalBody className="space-y-4">
          <Input label="缴费金额" type="number" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} />
          <Input label="缴费日期" type="date" value={paidDate} onChange={(e) => setPaidDate(e.target.value)} />
          <Input label="备注" type="textarea" value={note} onChange={(e) => setNote(e.target.value)} placeholder="请输入备注信息" />
        </ModalBody>
        <ModalFooter>
          <ModalClose>取消</ModalClose>
          <Button onClick={() => onConfirm(parseFloat(paidAmount), paidDate, note)}>确认缴费</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default function PatentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPatentById, updatePatentStatus, updateAnnuityRecord } = useAppStore();
  const [activeTab, setActiveTab] = useState('basic');
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [annuityModalOpen, setAnnuityModalOpen] = useState(false);
  const [selectedAnnuity, setSelectedAnnuity] = useState<AnnuityRecord | null>(null);

  const patent = useMemo(() => (id ? getPatentById(id) : undefined), [id, getPatentById]);

  const handleStatusChange = (status: PatentStatus, note: string) => {
    if (patent) {
      updatePatentStatus(patent.id, status, note);
      setStatusModalOpen(false);
    }
  };

  const handleMarkPaid = (record: AnnuityRecord) => {
    setSelectedAnnuity(record);
    setAnnuityModalOpen(true);
  };

  const confirmAnnuityPayment = (paidAmount: number, paidDate: string, note: string) => {
    if (patent && selectedAnnuity) {
      updateAnnuityRecord(patent.id, selectedAnnuity.id, {
        status: 'PAID',
        paidAmount,
        paidDate: new Date(paidDate).toISOString(),
        note,
      });
      setAnnuityModalOpen(false);
      setSelectedAnnuity(null);
    }
  };

  if (!patent) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 mb-4">专利不存在</p>
        <Button onClick={() => navigate('/patents')}>返回列表</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/patents')}><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{patent.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={patent.status as PatentStatus} />
              <Badge variant="active">{PATENT_TYPE_LABELS[patent.patentType]}</Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setStatusModalOpen(true)}>状态变更</Button>
          <Button onClick={() => navigate(`/patents/edit/${patent.id}`)} leftIcon={<Edit className="h-4 w-4" />}>编辑</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>基本信息</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <InfoItem label="申请号" value={<span className="font-mono">{patent.applicationNumber}</span>} />
                <InfoItem label="发明人" value={patent.inventors.join(', ')} />
                <InfoItem label="申请日" value={formatDate(patent.applicationDate)} />
                <InfoItem label="授权日" value={patent.authorizationDate ? formatDate(patent.authorizationDate) : '-'} />
                <InfoItem label="技术领域" value={patent.technicalField} />
                <InfoItem label="IPC 分类" value={patent.ipcClassification} />
                <div className="col-span-2">
                  <p className="text-sm text-slate-500">保护地区</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {patent.regions.map((region) => (<Badge key={region} variant="default">{region}</Badge>))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="basic"><FileText className="h-4 w-4 mr-1" />基本信息</TabsTrigger>
              <TabsTrigger value="claims"><FileCode className="h-4 w-4 mr-1" />权利要求书</TabsTrigger>
              <TabsTrigger value="description"><FileText className="h-4 w-4 mr-1" />说明书</TabsTrigger>
              <TabsTrigger value="files"><Paperclip className="h-4 w-4 mr-1" />相关文件</TabsTrigger>
            </TabsList>
            <TabsContent value="basic">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">专利范围</h4>
                    <p className="text-slate-600">{patent.patentScope}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">摘要</h4>
                    <p className="text-slate-600">{patent.abstract}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="claims">
              <Card>
                <CardContent className="pt-6">
                  <pre className="whitespace-pre-wrap text-slate-600 text-sm">{patent.claims || '暂无权利要求书'}</pre>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="description">
              <Card>
                <CardContent className="pt-6">
                  <pre className="whitespace-pre-wrap text-slate-600 text-sm">{patent.description || '暂无说明书'}</pre>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="files">
              <Card>
                <CardContent className="pt-6">
                  {patent.files.length === 0 ? (
                    <p className="text-slate-500 text-center py-4">暂无相关文件</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>文件名</TableHead>
                          <TableHead>类型</TableHead>
                          <TableHead>上传日期</TableHead>
                          <TableHead>操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {patent.files.map((file) => (
                          <TableRow key={file.id}>
                            <TableCell>{file.name}</TableCell>
                            <TableCell>{file.type}</TableCell>
                            <TableCell>{formatDate(file.uploadDate)}</TableCell>
                            <TableCell><Button variant="ghost" size="sm">下载</Button></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card>
            <CardHeader><CardTitle>年费记录</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
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
                  {patent.annuityRecords.slice(0, 5).map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>第 {record.year} 年</TableCell>
                      <TableCell>{formatDate(record.dueDate)}</TableCell>
                      <TableCell>{formatCurrency(record.amount)}</TableCell>
                      <TableCell>{record.paidAmount ? formatCurrency(record.paidAmount) : '-'}</TableCell>
                      <TableCell>{record.paidDate ? formatDate(record.paidDate) : '-'}</TableCell>
                      <TableCell><Badge variant={ANNUNITY_STATUS_BADGE[record.status]}>{record.status}</Badge></TableCell>
                      <TableCell className="text-right">
                        {record.status === 'PENDING' && (
                          <Button size="sm" variant="success" leftIcon={<CheckCircle className="h-4 w-4" />} onClick={() => handleMarkPaid(record)}>
                            标记缴费
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>状态历史</CardTitle></CardHeader>
          <CardContent>
            <Timeline>
              {[...patent.statusHistory].reverse().map((record) => (
                <TimelineItem key={record.id}>
                  <TimelineDot />
                  <TimelineDate>{formatDate(record.date)}</TimelineDate>
                  <TimelineContent>
                    <StatusBadge status={record.status as PatentStatus} />
                    {record.note && <p className="text-sm text-slate-500 mt-1">{record.note}</p>}
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </CardContent>
        </Card>
      </div>

      <StatusChangeModal
        open={statusModalOpen}
        onOpenChange={setStatusModalOpen}
        currentStatus={patent.status as PatentStatus}
        onConfirm={handleStatusChange}
      />
      <AnnuityPaymentModal
        open={annuityModalOpen}
        onOpenChange={setAnnuityModalOpen}
        record={selectedAnnuity}
        onConfirm={confirmAnnuityPayment}
      />
    </div>
  );
}
