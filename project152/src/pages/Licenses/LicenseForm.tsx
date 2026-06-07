import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, Upload, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/store';
import { LicenseAgreement } from '@/types';
import { formatDate } from '@/utils/dateUtils';
import { generateId } from '@/utils/formatters';

const LICENSE_TYPE_OPTIONS = [
  { value: 'EXCLUSIVE', label: '独占许可' },
  { value: 'NON_EXCLUSIVE', label: '非独占许可' },
  { value: 'SOLE', label: '排他许可' },
];

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: '有效' },
  { value: 'EXPIRED', label: '已过期' },
  { value: 'TERMINATED', label: '已终止' },
];

const TERRITORY_OPTIONS = ['中国大陆', '中国香港', '中国澳门', '中国台湾', '美国', '欧盟', '日本', '韩国', '英国', '德国', '法国', '加拿大', '澳大利亚', '新加坡', '印度', '巴西', '俄罗斯'];

interface FormData {
  agreementNumber: string;
  patentIds: string[];
  licensee: string;
  licenseScope: string;
  licenseType: LicenseAgreement['licenseType'];
  territory: string[];
  effectiveDate: string;
  expirationDate: string;
  licenseFee: string;
  paymentTerms: string;
  status: LicenseAgreement['status'];
  contractFile?: string;
  notes: string;
}

interface FormErrors {
  agreementNumber?: string;
  patentIds?: string;
  licensee?: string;
  licenseScope?: string;
  licenseType?: string;
  effectiveDate?: string;
  expirationDate?: string;
  licenseFee?: string;
}

const initialFormData: FormData = {
  agreementNumber: '',
  patentIds: [],
  licensee: '',
  licenseScope: '',
  licenseType: 'NON_EXCLUSIVE',
  territory: [],
  effectiveDate: '',
  expirationDate: '',
  licenseFee: '',
  paymentTerms: '',
  status: 'ACTIVE',
  contractFile: undefined,
  notes: '',
};

export default function LicenseForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { licenseAgreements, patents, addLicenseAgreement, updateLicenseAgreement } = useAppStore();

  const isEditMode = useMemo(() => location.pathname.includes('/edit/'), [location.pathname]);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [patentInput, setPatentInput] = useState('');
  const [newTerritory, setNewTerritory] = useState('');
  const [uploadedFile, setUploadedFile] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (isEditMode && id) {
      const agreement = licenseAgreements.find((l) => l.id === id);
      if (agreement) {
        setFormData({
          agreementNumber: agreement.agreementNumber,
          patentIds: agreement.patentIds,
          licensee: agreement.licensee,
          licenseScope: agreement.licenseScope,
          licenseType: agreement.licenseType,
          territory: agreement.territory,
          effectiveDate: formatDate(agreement.effectiveDate),
          expirationDate: formatDate(agreement.expirationDate),
          licenseFee: agreement.licenseFee.toString(),
          paymentTerms: agreement.paymentTerms,
          status: agreement.status,
          contractFile: agreement.contractFile,
          notes: agreement.notes || '',
        });
        setUploadedFile(agreement.contractFile);
      }
    }
  }, [isEditMode, id, licenseAgreements]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.agreementNumber.trim()) newErrors.agreementNumber = '请输入协议编号';
    if (formData.patentIds.length === 0) newErrors.patentIds = '请选择至少一项专利';
    if (!formData.licensee.trim()) newErrors.licensee = '请输入被许可方';
    if (!formData.licenseScope.trim()) newErrors.licenseScope = '请输入许可范围';
    if (!formData.licenseType) newErrors.licenseType = '请选择许可类型';
    if (!formData.effectiveDate) newErrors.effectiveDate = '请选择生效日期';
    if (!formData.expirationDate) newErrors.expirationDate = '请选择到期日期';
    if (formData.effectiveDate && formData.expirationDate && formData.effectiveDate > formData.expirationDate) {
      newErrors.expirationDate = '到期日期不能早于生效日期';
    }
    if (!formData.licenseFee || parseFloat(formData.licenseFee) <= 0) newErrors.licenseFee = '请输入有效的许可费用';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof FormData, value: string | string[] | LicenseAgreement['licenseType'] | LicenseAgreement['status'] | undefined) => {
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

  const handleTerritoryToggle = (territory: string) => {
    const current = [...formData.territory];
    const index = current.indexOf(territory);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(territory);
    }
    handleChange('territory', current);
  };

  const handleAddCustomTerritory = () => {
    if (newTerritory.trim() && !formData.territory.includes(newTerritory.trim())) {
      handleChange('territory', [...formData.territory, newTerritory.trim()]);
    }
    setNewTerritory('');
  };

  const handleFileUpload = () => {
    const fileName = `合同文件_${Date.now()}.pdf`;
    setUploadedFile(fileName);
    handleChange('contractFile', fileName);
  };

  const handleRemoveFile = () => {
    setUploadedFile(undefined);
    handleChange('contractFile', undefined);
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const agreementData = {
      agreementNumber: formData.agreementNumber.trim(),
      patentIds: formData.patentIds,
      licensee: formData.licensee.trim(),
      licenseScope: formData.licenseScope.trim(),
      licenseType: formData.licenseType,
      territory: formData.territory,
      effectiveDate: new Date(formData.effectiveDate).toISOString(),
      expirationDate: new Date(formData.expirationDate).toISOString(),
      licenseFee: parseFloat(formData.licenseFee),
      paymentTerms: formData.paymentTerms.trim(),
      paymentRecords: [],
      status: formData.status,
      contractFile: formData.contractFile,
      notes: formData.notes.trim(),
    };

    if (isEditMode && id) {
      const existing = licenseAgreements.find((l) => l.id === id);
      if (existing) {
        updateLicenseAgreement(id, {
          ...agreementData,
          paymentRecords: existing.paymentRecords,
        });
      }
    } else {
      addLicenseAgreement(agreementData);
    }

    navigate('/licenses');
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
            {isEditMode ? '编辑许可协议' : '新增许可协议'}
          </h1>
          <p className="text-slate-500">
            {isEditMode ? '修改许可协议信息' : '填写许可协议基本信息'}
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
              label="协议编号"
              value={formData.agreementNumber}
              onChange={(e) => handleChange('agreementNumber', e.target.value)}
              error={errors.agreementNumber}
              placeholder="请输入协议编号"
            />
            <Input
              label="被许可方"
              value={formData.licensee}
              onChange={(e) => handleChange('licensee', e.target.value)}
              error={errors.licensee}
              placeholder="请输入被许可方名称"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>许可专利</CardTitle>
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
          <CardTitle>许可详情</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="许可类型"
              value={formData.licenseType}
              onChange={(e) => handleChange('licenseType', e.target.value as LicenseAgreement['licenseType'])}
              error={errors.licenseType}
              options={LICENSE_TYPE_OPTIONS}
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                许可地区
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {TERRITORY_OPTIONS.map((territory) => {
                  const selected = formData.territory.includes(territory);
                  return (
                    <Badge
                      key={territory}
                      variant={selected ? 'active' : 'default'}
                      className="cursor-pointer"
                      onClick={() => handleTerritoryToggle(territory)}
                    >
                      {territory}
                    </Badge>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="输入自定义地区"
                  value={newTerritory}
                  onChange={(e) => setNewTerritory(e.target.value)}
                  className="flex-1"
                />
                <Button variant="secondary" onClick={handleAddCustomTerritory} disabled={!newTerritory.trim()}>
                  <Plus className="h-4 w-4" />
                  添加
                </Button>
              </div>
            </div>
          </div>

          <Input
            type="textarea"
            label="许可范围"
            value={formData.licenseScope}
            onChange={(e) => handleChange('licenseScope', e.target.value)}
            error={errors.licenseScope}
            placeholder="请详细描述许可范围"
            autoResize
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="生效日期"
              type="date"
              value={formData.effectiveDate}
              onChange={(e) => handleChange('effectiveDate', e.target.value)}
              error={errors.effectiveDate}
            />
            <Input
              label="到期日期"
              type="date"
              value={formData.expirationDate}
              onChange={(e) => handleChange('expirationDate', e.target.value)}
              error={errors.expirationDate}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="许可费用（元）"
              type="number"
              value={formData.licenseFee}
              onChange={(e) => handleChange('licenseFee', e.target.value)}
              error={errors.licenseFee}
              placeholder="请输入许可费用"
            />
            <Select
              label="协议状态"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value as LicenseAgreement['status'])}
              options={STATUS_OPTIONS}
            />
          </div>

          <Input
            type="textarea"
            label="付款条款"
            value={formData.paymentTerms}
            onChange={(e) => handleChange('paymentTerms', e.target.value)}
            placeholder="请描述付款方式、付款周期等条款"
            autoResize
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>合同文件</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!uploadedFile ? (
            <div
              className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors cursor-pointer bg-slate-50"
              onClick={handleFileUpload}
            >
              <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-600">点击上传合同文件</p>
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
