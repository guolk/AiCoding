import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/store';
import { PatentType, PatentStatus } from '@/types/patent';
import { formatDate } from '@/utils/dateUtils';

const PATENT_TYPE_OPTIONS = [
  { value: 'INVENTION', label: '发明' },
  { value: 'UTILITY_MODEL', label: '实用新型' },
  { value: 'DESIGN', label: '外观设计' },
];

const STATUS_OPTIONS = [
  { value: 'APPLICATION', label: '申请中' },
  { value: 'SUBSTANTIVE_EXAMINATION', label: '实质审查' },
  { value: 'AUTHORIZED', label: '已授权' },
  { value: 'MAINTENANCE', label: '维持中' },
  { value: 'ENFORCEMENT', label: '维权中' },
  { value: 'EXPIRED', label: '已过期' },
];

const REGION_OPTIONS = ['中国', '美国', '欧盟', '日本', '韩国', '英国', '德国', '法国', '加拿大', '澳大利亚'];

interface FormData {
  name: string;
  applicationNumber: string;
  patentType: PatentType;
  inventors: string;
  applicationDate: string;
  authorizationDate: string;
  technicalField: string;
  ipcClassification: string;
  patentScope: string;
  abstract: string;
  claims: string;
  description: string;
  regions: string;
  status: PatentStatus;
  statusNote: string;
}

interface FormErrors {
  name?: string;
  applicationNumber?: string;
  patentType?: string;
  inventors?: string;
  applicationDate?: string;
}

const initialFormData: FormData = {
  name: '',
  applicationNumber: '',
  patentType: 'INVENTION',
  inventors: '',
  applicationDate: '',
  authorizationDate: '',
  technicalField: '',
  ipcClassification: '',
  patentScope: '',
  abstract: '',
  claims: '',
  description: '',
  regions: '',
  status: 'APPLICATION',
  statusNote: '',
};

export default function PatentForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { getPatentById, addPatent, updatePatent } = useAppStore();

  const isEditMode = useMemo(() => location.pathname.includes('/edit/'), [location.pathname]);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (isEditMode && id) {
      const patent = getPatentById(id);
      if (patent) {
        setFormData({
          name: patent.name,
          applicationNumber: patent.applicationNumber,
          patentType: patent.patentType,
          inventors: patent.inventors.join(', '),
          applicationDate: formatDate(patent.applicationDate),
          authorizationDate: patent.authorizationDate ? formatDate(patent.authorizationDate) : '',
          technicalField: patent.technicalField,
          ipcClassification: patent.ipcClassification,
          patentScope: patent.patentScope,
          abstract: patent.abstract,
          claims: patent.claims || '',
          description: patent.description || '',
          regions: patent.regions.join(', '),
          status: patent.status,
          statusNote: '',
        });
      }
    }
  }, [isEditMode, id, getPatentById]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = '请输入专利名称';
    if (!formData.applicationNumber.trim()) newErrors.applicationNumber = '请输入申请号';
    if (!formData.patentType) newErrors.patentType = '请选择专利类型';
    if (!formData.inventors.trim()) newErrors.inventors = '请输入发明人';
    if (!formData.applicationDate) newErrors.applicationDate = '请选择申请日';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const patentData = {
      name: formData.name.trim(),
      applicationNumber: formData.applicationNumber.trim(),
      patentType: formData.patentType,
      inventors: formData.inventors.split(',').map((s) => s.trim()).filter(Boolean),
      applicationDate: new Date(formData.applicationDate).toISOString(),
      authorizationDate: formData.authorizationDate ? new Date(formData.authorizationDate).toISOString() : undefined,
      technicalField: formData.technicalField.trim(),
      ipcClassification: formData.ipcClassification.trim(),
      patentScope: formData.patentScope.trim(),
      abstract: formData.abstract.trim(),
      claims: formData.claims.trim() || undefined,
      description: formData.description.trim() || undefined,
      regions: formData.regions.split(',').map((s) => s.trim()).filter(Boolean),
      status: formData.status,
      statusHistory: [{
        id: '',
        status: formData.status,
        date: new Date().toISOString(),
        note: formData.statusNote.trim() || undefined,
      }],
      files: [],
    };

    if (isEditMode && id) {
      const existing = getPatentById(id);
      if (existing) {
        const updatedData = {
          ...patentData,
          statusHistory: existing.statusHistory,
          files: existing.files,
          annuityRecords: existing.annuityRecords,
        };
        if (formData.status !== existing.status && formData.statusNote.trim()) {
          updatedData.statusHistory = [
            ...existing.statusHistory,
            {
              id: '',
              status: formData.status,
              date: new Date().toISOString(),
              note: formData.statusNote.trim(),
            },
          ];
        }
        updatePatent(id, updatedData);
      }
    } else {
      addPatent(patentData);
    }

    navigate('/patents');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isEditMode ? '编辑专利' : '新增专利'}
          </h1>
          <p className="text-slate-500">
            {isEditMode ? '修改专利信息' : '填写专利基本信息'}
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
              label="专利名称"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              error={errors.name}
              placeholder="请输入专利名称"
            />
            <Input
              label="申请号"
              value={formData.applicationNumber}
              onChange={(e) => handleChange('applicationNumber', e.target.value)}
              error={errors.applicationNumber}
              placeholder="请输入申请号"
            />
            <Select
              label="专利类型"
              value={formData.patentType}
              onChange={(e) => handleChange('patentType', e.target.value as PatentType)}
              error={errors.patentType}
              options={PATENT_TYPE_OPTIONS}
            />
            <Input
              label="发明人"
              value={formData.inventors}
              onChange={(e) => handleChange('inventors', e.target.value)}
              error={errors.inventors}
              placeholder="多个发明人用逗号分隔"
              helperText="多个发明人用逗号分隔"
            />
            <Input
              label="申请日"
              type="date"
              value={formData.applicationDate}
              onChange={(e) => handleChange('applicationDate', e.target.value)}
              error={errors.applicationDate}
            />
            <Input
              label="授权日"
              type="date"
              value={formData.authorizationDate}
              onChange={(e) => handleChange('authorizationDate', e.target.value)}
            />
            <Input
              label="技术领域"
              value={formData.technicalField}
              onChange={(e) => handleChange('technicalField', e.target.value)}
              placeholder="请输入技术领域"
            />
            <Input
              label="IPC 分类号"
              value={formData.ipcClassification}
              onChange={(e) => handleChange('ipcClassification', e.target.value)}
              placeholder="请输入IPC分类号"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>专利内容</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="专利范围"
            type="textarea"
            value={formData.patentScope}
            onChange={(e) => handleChange('patentScope', e.target.value)}
            placeholder="请输入专利范围"
          />
          <Input
            label="摘要"
            type="textarea"
            value={formData.abstract}
            onChange={(e) => handleChange('abstract', e.target.value)}
            placeholder="请输入摘要"
          />
          <Input
            label="权利要求书"
            type="textarea"
            value={formData.claims}
            onChange={(e) => handleChange('claims', e.target.value)}
            placeholder="请输入权利要求书"
          />
          <Input
            label="说明书"
            type="textarea"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="请输入说明书"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>其他信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">保护地区/国家</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {REGION_OPTIONS.map((region) => {
                const selected = formData.regions.split(',').map((s) => s.trim()).includes(region);
                return (
                  <Badge
                    key={region}
                    variant={selected ? 'active' : 'default'}
                    className="cursor-pointer"
                    onClick={() => {
                      const current = formData.regions.split(',').map((s) => s.trim()).filter(Boolean);
                      if (selected) {
                        handleChange('regions', current.filter((r) => r !== region).join(', '));
                      } else {
                        handleChange('regions', [...current, region].join(', '));
                      }
                    }}
                  >
                    {region}
                  </Badge>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="当前状态"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value as PatentStatus)}
              options={STATUS_OPTIONS}
            />
            <Input
              label="状态备注"
              value={formData.statusNote}
              onChange={(e) => handleChange('statusNote', e.target.value)}
              placeholder="请输入状态备注"
            />
          </div>
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
