import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, Upload, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/store';
import { TechnologyTransfer } from '@/types';
import { formatDate } from '@/utils/dateUtils';

const TRANSFER_TYPE_OPTIONS = [
  { value: 'ASSIGNMENT', label: '转让' },
  { value: 'MERGER', label: '合并' },
  { value: 'SPIN_OFF', label: '分拆' },
];

const STATUS_OPTIONS = [
  { value: 'PENDING', label: '待完成' },
  { value: 'COMPLETED', label: '已完成' },
  { value: 'CANCELLED', label: '已取消' },
];

interface FormData {
  transferNumber: string;
  patentIds: string[];
  transferor: string;
  transferee: string;
  transferType: TechnologyTransfer['transferType'];
  transferDate: string;
  consideration: string;
  status: TechnologyTransfer['status'];
  agreementFile?: string;
  notes: string;
}

interface FormErrors {
  transferNumber?: string;
  patentIds?: string;
  transferor?: string;
  transferee?: string;
  transferType?: string;
  transferDate?: string;
  consideration?: string;
}

const initialFormData: FormData = {
  transferNumber: '',
  patentIds: [],
  transferor: '',
  transferee: '',
  transferType: 'ASSIGNMENT',
  transferDate: '',
  consideration: '',
  status: 'PENDING',
  agreementFile: undefined,
  notes: '',
};

export default function TransferForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { technologyTransfers, patents, addTechnologyTransfer, updateTechnologyTransfer } = useAppStore();

  const isEditMode = useMemo(() => location.pathname.includes('/edit/'), [location.pathname]);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [patentInput, setPatentInput] = useState('');
  const [uploadedFile, setUploadedFile] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (isEditMode && id) {
      const transfer = technologyTransfers.find((t) => t.id === id);
      if (transfer) {
        setFormData({
          transferNumber: transfer.transferNumber,
          patentIds: transfer.patentIds,
          transferor: transfer.transferor,
          transferee: transfer.transferee,
          transferType: transfer.transferType,
          transferDate: formatDate(transfer.transferDate),
          consideration: transfer.consideration.toString(),
          status: transfer.status,
          agreementFile: transfer.agreementFile,
          notes: transfer.notes || '',
        });
        setUploadedFile(transfer.agreementFile);
      }
    }
  }, [isEditMode, id, technologyTransfers]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.transferNumber.trim()) newErrors.transferNumber = '请输入转让编号';
    if (formData.patentIds.length === 0) newErrors.patentIds = '请选择至少一项专利';
    if (!formData.transferor.trim()) newErrors.transferor = '请输入转让方';
    if (!formData.transferee.trim()) newErrors.transferee = '请输入受让方';
    if (!formData.transferType) newErrors.transferType = '请选择转让类型';
    if (!formData.transferDate) newErrors.transferDate = '请选择转让日期';
    if (!formData.consideration || parseFloat(formData.consideration) <= 0) newErrors.consideration = '请输入有效的转让对价';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof FormData, value: string | string[] | TechnologyTransfer['transferType'] | TechnologyTransfer['status'] | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePatentToggle = (patentId: string) => {
    const current = [...formData.patentIds];
    const index = current.indexOf(patentId);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(patentId);
    }
    handleChange('patentIds', current);
  };

  const handleAddPatent = () => {
    if (patentInput.trim() && !formData.patentIds.includes(patentInput.trim())) {
      handleChange('patentIds', [...formData.patentIds, patentInput.trim()]);
      setPatentInput('');
    }
  };

  const handleFileUpload = () => {
    const fileName = `转让协议_${Date.now()}.pdf`;
    setUploadedFile(fileName);
    handleChange('agreementFile', fileName);
  };

  const handleRemoveFile = () => {
    setUploadedFile(undefined);
    handleChange('agreementFile', undefined);
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const transferData = {
      transferNumber: formData.transferNumber.trim(),
      patentIds: formData.patentIds,
      transferor: formData.transferor.trim(),
      transferee: formData.transferee.trim(),
      transferType: formData.transferType,
      transferDate: new Date(formData.transferDate).toISOString(),
      consideration: parseFloat(formData.consideration),
      status: formData.status,
      agreementFile: formData.agreementFile,
      notes: formData.notes.trim(),
    };

    if (isEditMode && id) {
      updateTechnologyTransfer(id, transferData);
    } else {
      addTechnologyTransfer(transferData);
    }

    navigate('/transfers');
  };

  const getPatentName = (patentId: string) => {
    return patents.find((p) => p.id === patentId)?.name || patentId;
  };

  const availablePatents = patents.filter((p) => !formData.patentIds.includes(p.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isEditMode ? '编辑转让记录' : '新增转让记录'}
          </h1>
          <p className="text-slate-500">
            {isEditMode ? '修改转让记录信息' : '填写转让记录基本信息'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>基本信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="转让编号"
              value={formData.transferNumber}
              onChange={(e) => handleChange('transferNumber', e.target.value)}
              error={errors.transferNumber}
              placeholder="请输入转让编号"
            />
            <div />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Input
              label="转让方"
              value={formData.transferor}
              onChange={(e) => handleChange('transferor', e.target.value)}
              error={errors.transferor}
              placeholder="请输入转让方名称"
            />
            <Input
              label="受让方"
              value={formData.transferee}
              onChange={(e) => handleChange('transferee', e.target.value)}
              error={errors.transferee}
              placeholder="请输入受让方名称"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Select
              label="转让类型"
              value={formData.transferType}
              onChange={(e) => handleChange('transferType', e.target.value as TechnologyTransfer['transferType'])}
              error={errors.transferType}
              options={TRANSFER_TYPE_OPTIONS}
            />
            <Select
              label="状态"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value as TechnologyTransfer['status'])}
              options={STATUS_OPTIONS}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Input
              label="转让日期"
              type="date"
              value={formData.transferDate}
              onChange={(e) => handleChange('transferDate', e.target.value)}
              error={errors.transferDate}
            />
            <Input
              label="转让对价（元）"
              type="number"
              value={formData.consideration}
              onChange={(e) => handleChange('consideration', e.target.value)}
              error={errors.consideration}
              placeholder="请输入转让对价"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>转让专利</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Select
              placeholder="选择专利"
              value={patentInput}
              onChange={(e) => setPatentInput(e.target.value)}
              className="flex-1"
              options={availablePatents.map((p) => ({ value: p.id, label: `${p.applicationNumber} - ${p.name}` }))}
            />
            <Button variant="secondary" onClick={handleAddPatent} disabled={!patentInput}>
              <Plus className="h-4 w-4" />
              添加
            </Button>
          </div>
          {errors.patentIds && (
            <p className="text-sm text-danger-600">{errors.patentIds}</p>
          )}
          <div className="flex flex-wrap gap-2">
            {formData.patentIds.map((patentId, idx) => (
              <Badge
                key={idx}
                variant="active"
                className="cursor-pointer flex items-center gap-1"
                onClick={() => handlePatentToggle(patentId)}
              >
                {getPatentName(patentId)}
                <span className="ml-1">×</span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>协议文件</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!uploadedFile ? (
            <div
              className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors cursor-pointer bg-slate-50"
              onClick={handleFileUpload}
            >
              <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-600">点击上传协议文件</p>
              <p className="text-xs text-slate-400 mt-1">支持 PDF、DOC、DOCX 格式</p>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-700">{uploadedFile}</span>
              <Button variant="ghost" size="sm" onClick={handleRemoveFile}>
                <Trash2 className="h-4 w-4 text-danger-500" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>备注</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="textarea"
            placeholder="请输入备注信息"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            autoResize
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={() => navigate(-1)}>
          取消
        </Button>
        <Button onClick={handleSubmit} leftIcon={<Save className="h-4 w-4" />}>
          {isEditMode ? '保存修改' : '提交'}
        </Button>
      </div>
    </div>
  );
}
