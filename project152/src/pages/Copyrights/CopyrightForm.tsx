import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, Upload, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/store';
import { Copyright } from '@/types';
import { formatDate } from '@/utils/dateUtils';
import { generateId } from '@/utils/formatters';

const WORK_TYPE_OPTIONS = [
  { value: '计算机软件', label: '计算机软件' },
  { value: '美术作品', label: '美术作品' },
  { value: '文字作品', label: '文字作品' },
  { value: '音乐作品', label: '音乐作品' },
  { value: '影视作品', label: '影视作品' },
  { value: '工程设计图', label: '工程设计图' },
  { value: '产品设计图', label: '产品设计图' },
];

const REGION_OPTIONS = ['中国', '美国', '欧盟', '日本', '韩国', '英国', '德国', '法国', '加拿大', '澳大利亚', '新加坡', '中国香港', '中国台湾'];

interface FormData {
  workName: string;
  workType: string;
  authors: string;
  completionDate: string;
  registrationDate: string;
  registrationNumber: string;
  certificateImage: string;
  owner: string;
  description: string;
  regions: string;
  files: { name: string }[];
}

interface FormErrors {
  workName?: string;
  workType?: string;
  authors?: string;
  completionDate?: string;
}

const initialFormData: FormData = {
  workName: '',
  workType: '计算机软件',
  authors: '',
  completionDate: '',
  registrationDate: '',
  registrationNumber: '',
  certificateImage: '',
  owner: '本公司',
  description: '',
  regions: '',
  files: [],
};

export default function CopyrightForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { copyrights, addCopyright, updateCopyright } = useAppStore();

  const isEditMode = useMemo(() => location.pathname.includes('/edit/'), [location.pathname]);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [newRegion, setNewRegion] = useState('');

  useEffect(() => {
    if (isEditMode && id) {
      const copyright = copyrights.find((c) => c.id === id);
      if (copyright) {
        setFormData({
          workName: copyright.workName,
          workType: copyright.workType,
          authors: copyright.authors.join(', '),
          completionDate: formatDate(copyright.completionDate),
          registrationDate: copyright.registrationDate ? formatDate(copyright.registrationDate) : '',
          registrationNumber: copyright.registrationNumber || '',
          certificateImage: copyright.certificateImage || '',
          owner: copyright.owner,
          description: copyright.description,
          regions: copyright.regions.join(', '),
          files: copyright.files.map((f) => ({ name: f.name })),
        });
      }
    }
  }, [isEditMode, id, copyrights]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.workName.trim()) newErrors.workName = '请输入作品名称';
    if (!formData.workType) newErrors.workType = '请选择作品类型';
    if (!formData.authors.trim()) newErrors.authors = '请输入作者';
    if (!formData.completionDate) newErrors.completionDate = '请选择完成日期';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof FormData, value: string | { name: string }[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleRegionToggle = (region: string) => {
    const current = formData.regions.split(',').map((s) => s.trim()).filter(Boolean);
    const index = current.indexOf(region);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(region);
    }
    handleChange('regions', current.join(', '));
  };

  const handleAddCustomRegion = () => {
    if (newRegion.trim()) {
      const current = formData.regions.split(',').map((s) => s.trim()).filter(Boolean);
      if (!current.includes(newRegion.trim())) {
        handleChange('regions', [...current, newRegion.trim()].join(', '));
      }
      setNewRegion('');
    }
  };

  const handleAddFile = () => {
    handleChange('files', [...formData.files, { name: `上传文件_${Date.now()}.pdf` }]);
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = [...formData.files];
    newFiles.splice(index, 1);
    handleChange('files', newFiles);
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const copyrightData = {
      workName: formData.workName.trim(),
      workType: formData.workType,
      completionDate: new Date(formData.completionDate).toISOString(),
      registrationDate: formData.registrationDate ? new Date(formData.registrationDate).toISOString() : undefined,
      registrationNumber: formData.registrationNumber.trim() || undefined,
      certificateImage: formData.certificateImage.trim() || undefined,
      authors: formData.authors.split(',').map((s) => s.trim()).filter(Boolean),
      owner: formData.owner.trim(),
      description: formData.description.trim(),
      regions: formData.regions.split(',').map((s) => s.trim()).filter(Boolean),
      files: formData.files.map((f) => ({
        id: generateId(),
        name: f.name,
        type: 'application/pdf',
        size: 0,
        uploadDate: new Date().toISOString(),
        url: `/files/${generateId()}/${f.name}`,
      })),
    };

    if (isEditMode && id) {
      const existing = copyrights.find((c) => c.id === id);
      if (existing) {
        updateCopyright(id, {
          ...copyrightData,
          files: copyrightData.files.length > 0 ? copyrightData.files : existing.files,
        });
      }
    } else {
      addCopyright(copyrightData);
    }

    navigate('/copyrights');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isEditMode ? '编辑版权' : '新增版权'}
          </h1>
          <p className="text-slate-500">
            {isEditMode ? '修改版权信息' : '填写版权基本信息'}
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
              label="作品名称"
              value={formData.workName}
              onChange={(e) => handleChange('workName', e.target.value)}
              error={errors.workName}
              placeholder="请输入作品名称"
            />
            <Select
              label="作品类型"
              value={formData.workType}
              onChange={(e) => handleChange('workType', e.target.value)}
              error={errors.workType}
              options={WORK_TYPE_OPTIONS}
            />
            <Input
              label="作者"
              value={formData.authors}
              onChange={(e) => handleChange('authors', e.target.value)}
              error={errors.authors}
              placeholder="多个作者用逗号分隔"
              helperText="多个作者用逗号分隔"
            />
            <Input
              label="版权所有人"
              value={formData.owner}
              onChange={(e) => handleChange('owner', e.target.value)}
              placeholder="请输入版权所有人"
            />
            <Input
              label="完成日期"
              type="date"
              value={formData.completionDate}
              onChange={(e) => handleChange('completionDate', e.target.value)}
              error={errors.completionDate}
            />
            <Input
              label="登记日期"
              type="date"
              value={formData.registrationDate}
              onChange={(e) => handleChange('registrationDate', e.target.value)}
            />
            <Input
              label="登记号"
              value={formData.registrationNumber}
              onChange={(e) => handleChange('registrationNumber', e.target.value)}
              placeholder="请输入登记号"
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                登记证书
              </label>
              <div
                className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-primary-500 transition-colors cursor-pointer bg-slate-50"
                onClick={() => handleChange('certificateImage', `certificate_${Date.now()}.pdf`)}
              >
                <Upload className="h-6 w-6 text-slate-400 mx-auto mb-1" />
                <p className="text-xs text-slate-600">点击上传登记证书</p>
                {formData.certificateImage && (
                  <div className="mt-1 text-xs text-primary-600">
                    已上传: {formData.certificateImage}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>作品描述</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="textarea"
            placeholder="请输入作品详细描述"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            autoResize
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>保护地区</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2 mb-3">
            {REGION_OPTIONS.map((region) => {
              const selected = formData.regions.split(',').map((s) => s.trim()).includes(region);
              return (
                <Badge
                  key={region}
                  variant={selected ? 'active' : 'default'}
                  className="cursor-pointer"
                  onClick={() => handleRegionToggle(region)}
                >
                  {region}
                </Badge>
              );
            })}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="输入自定义地区"
              value={newRegion}
              onChange={(e) => setNewRegion(e.target.value)}
              className="flex-1"
            />
            <Button variant="secondary" onClick={handleAddCustomRegion} disabled={!newRegion.trim()}>
              <Plus className="h-4 w-4" />
              添加
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>相关文件</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors cursor-pointer bg-slate-50"
            onClick={handleAddFile}
          >
            <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-600">点击上传相关文件</p>
            <p className="text-xs text-slate-400 mt-1">支持 PDF、DOC、ZIP 格式</p>
          </div>
          {formData.files.length > 0 && (
            <div className="space-y-2">
              {formData.files.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-700">{file.name}</span>
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveFile(idx)}>
                    <Trash2 className="h-4 w-4 text-danger-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
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
