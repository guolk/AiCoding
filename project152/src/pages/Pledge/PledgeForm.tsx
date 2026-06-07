import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/store';
import { PledgeFinancing } from '@/types';
import { formatDate, addYears } from '@/utils/dateUtils';

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: '进行中' },
  { value: 'MATURED', label: '已到期' },
  { value: 'REDEEMED', label: '已赎回' },
];

interface FormData {
  financingNumber: string;
  patentIds: string[];
  pledgee: string;
  financingAmount: string;
  interestRate: string;
  termMonths: string;
  startDate: string;
  maturityDate: string;
  registrationDate: string;
  status: PledgeFinancing['status'];
  notes: string;
}

interface FormErrors {
  financingNumber?: string;
  patentIds?: string;
  pledgee?: string;
  financingAmount?: string;
  interestRate?: string;
  termMonths?: string;
  startDate?: string;
  maturityDate?: string;
}

const initialFormData: FormData = {
  financingNumber: '',
  patentIds: [],
  pledgee: '',
  financingAmount: '',
  interestRate: '',
  termMonths: '',
  startDate: '',
  maturityDate: '',
  registrationDate: '',
  status: 'ACTIVE',
  notes: '',
};

export default function PledgeForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { pledgeFinancings, patents, addPledgeFinancing, updatePledgeFinancing } = useAppStore();

  const isEditMode = useMemo(() => location.pathname.includes('/edit/'), [location.pathname]);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [patentInput, setPatentInput] = useState('');

  useEffect(() => {
    if (isEditMode && id) {
      const financing = pledgeFinancings.find((p) => p.id === id);
      if (financing) {
        setFormData({
          financingNumber: financing.financingNumber,
          patentIds: financing.patentIds,
          pledgee: financing.pledgee,
          financingAmount: financing.financingAmount.toString(),
          interestRate: (financing.interestRate * 100).toString(),
          termMonths: financing.termMonths.toString(),
          startDate: formatDate(financing.startDate),
          maturityDate: formatDate(financing.maturityDate),
          registrationDate: financing.registrationDate ? formatDate(financing.registrationDate) : '',
          status: financing.status,
          notes: financing.notes || '',
        });
      }
    }
  }, [isEditMode, id, pledgeFinancings]);

  useEffect(() => {
    if (formData.startDate && formData.termMonths && !isEditMode) {
      const start = new Date(formData.startDate);
      const months = parseInt(formData.termMonths);
      if (!isNaN(months) && months > 0) {
        const maturity = new Date(start);
        maturity.setMonth(maturity.getMonth() + months);
        const maturityStr = formatDate(maturity.toISOString());
        setFormData((prev) => ({ ...prev, maturityDate: maturityStr }));
      }
    }
  }, [formData.startDate, formData.termMonths, isEditMode]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.financingNumber.trim()) newErrors.financingNumber = '请输入融资编号';
    if (formData.patentIds.length === 0) newErrors.patentIds = '请选择至少一项专利';
    if (!formData.pledgee.trim()) newErrors.pledgee = '请输入质权人';
    if (!formData.financingAmount || parseFloat(formData.financingAmount) <= 0) newErrors.financingAmount = '请输入有效的融资金额';
    if (!formData.interestRate || parseFloat(formData.interestRate) <= 0) newErrors.interestRate = '请输入有效的利率';
    if (!formData.termMonths || parseInt(formData.termMonths) <= 0) newErrors.termMonths = '请输入有效的期限';
    if (!formData.startDate) newErrors.startDate = '请选择开始日期';
    if (!formData.maturityDate) newErrors.maturityDate = '请选择到期日期';
    if (formData.startDate && formData.maturityDate && formData.startDate > formData.maturityDate) {
      newErrors.maturityDate = '到期日期不能早于开始日期';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof FormData, value: string | string[] | PledgeFinancing['status']) => {
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

  const handleCalculateMaturity = () => {
    if (formData.startDate && formData.termMonths) {
      const start = new Date(formData.startDate);
      const months = parseInt(formData.termMonths);
      if (!isNaN(months) && months > 0) {
        const maturity = new Date(start);
        maturity.setMonth(maturity.getMonth() + months);
        const maturityStr = formatDate(maturity.toISOString());
        handleChange('maturityDate', maturityStr);
      }
    }
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const financingData = {
      financingNumber: formData.financingNumber.trim(),
      patentIds: formData.patentIds,
      pledgee: formData.pledgee.trim(),
      financingAmount: parseFloat(formData.financingAmount),
      interestRate: parseFloat(formData.interestRate) / 100,
      termMonths: parseInt(formData.termMonths),
      startDate: new Date(formData.startDate).toISOString(),
      maturityDate: new Date(formData.maturityDate).toISOString(),
      registrationDate: formData.registrationDate ? new Date(formData.registrationDate).toISOString() : undefined,
      status: formData.status,
      notes: formData.notes.trim(),
    };

    if (isEditMode && id) {
      updatePledgeFinancing(id, financingData);
    } else {
      addPledgeFinancing(financingData);
    }

    navigate('/pledges');
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
            {isEditMode ? '编辑质押融资' : '新增质押融资'}
          </h1>
          <p className="text-slate-500">
            {isEditMode ? '修改质押融资信息' : '填写质押融资基本信息'}
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
              label="融资编号"
              value={formData.financingNumber}
              onChange={(e) => handleChange('financingNumber', e.target.value)}
              error={errors.financingNumber}
              placeholder="请输入融资编号"
            />
            <Input
              label="质权人"
              value={formData.pledgee}
              onChange={(e) => handleChange('pledgee', e.target.value)}
              error={errors.pledgee}
              placeholder="请输入质权人名称"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <Input
              label="融资金额（元）"
              type="number"
              value={formData.financingAmount}
              onChange={(e) => handleChange('financingAmount', e.target.value)}
              error={errors.financingAmount}
              placeholder="请输入融资金额"
            />
            <Input
              label="利率（%）"
              type="number"
              step="0.01"
              value={formData.interestRate}
              onChange={(e) => handleChange('interestRate', e.target.value)}
              error={errors.interestRate}
              placeholder="请输入利率"
              helperText="例如：输入 5.5 表示 5.5%"
            />
            <Input
              label="期限（月）"
              type="number"
              value={formData.termMonths}
              onChange={(e) => handleChange('termMonths', e.target.value)}
              error={errors.termMonths}
              placeholder="请输入期限"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <Input
              label="开始日期"
              type="date"
              value={formData.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              error={errors.startDate}
            />
            <div>
              <Input
                label="到期日期"
                type="date"
                value={formData.maturityDate}
                onChange={(e) => handleChange('maturityDate', e.target.value)}
                error={errors.maturityDate}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCalculateMaturity}
                className="mt-1"
                leftIcon={<Calculator className="h-3 w-3" />}
              >
                自动计算
              </Button>
            </div>
            <Input
              label="登记日期"
              type="date"
              value={formData.registrationDate}
              onChange={(e) => handleChange('registrationDate', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Select
              label="状态"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value as PledgeFinancing['status'])}
              options={STATUS_OPTIONS}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>质押专利</CardTitle>
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
