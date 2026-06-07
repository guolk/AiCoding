import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, Upload, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/store';
import { Trademark } from '@/types';
import { formatDate } from '@/utils/dateUtils';
import { generateId } from '@/utils/formatters';

const NICE_CATEGORIES = [
  { value: '第1类-化学原料', label: '第1类-化学原料' },
  { value: '第2类-颜料油漆', label: '第2类-颜料油漆' },
  { value: '第3类-日化用品', label: '第3类-日化用品' },
  { value: '第4类-燃料油脂', label: '第4类-燃料油脂' },
  { value: '第5类-医药', label: '第5类-医药' },
  { value: '第6类-金属材料', label: '第6类-金属材料' },
  { value: '第7类-机械设备', label: '第7类-机械设备' },
  { value: '第8类-手工器械', label: '第8类-手工器械' },
  { value: '第9类-科学仪器', label: '第9类-科学仪器' },
  { value: '第10类-医疗器械', label: '第10类-医疗器械' },
  { value: '第11类-灯具空调', label: '第11类-灯具空调' },
  { value: '第12类-运输工具', label: '第12类-运输工具' },
  { value: '第13类-军火烟火', label: '第13类-军火烟火' },
  { value: '第14类-珠宝钟表', label: '第14类-珠宝钟表' },
  { value: '第15类-乐器', label: '第15类-乐器' },
  { value: '第16类-办公用品', label: '第16类-办公用品' },
  { value: '第17类-橡胶制品', label: '第17类-橡胶制品' },
  { value: '第18类-皮革皮具', label: '第18类-皮革皮具' },
  { value: '第19类-建筑材料', label: '第19类-建筑材料' },
  { value: '第20类-家具', label: '第20类-家具' },
  { value: '第21类-厨房洁具', label: '第21类-厨房洁具' },
  { value: '第22类-绳网袋篷', label: '第22类-绳网袋篷' },
  { value: '第23类-纱线丝', label: '第23类-纱线丝' },
  { value: '第24类-布料床单', label: '第24类-布料床单' },
  { value: '第25类-服装鞋帽', label: '第25类-服装鞋帽' },
  { value: '第26类-纽扣拉链', label: '第26类-纽扣拉链' },
  { value: '第27类-地毯席垫', label: '第27类-地毯席垫' },
  { value: '第28类-健身器材', label: '第28类-健身器材' },
  { value: '第29类-食品', label: '第29类-食品' },
  { value: '第30类-方便食品', label: '第30类-方便食品' },
  { value: '第31类-饲料种籽', label: '第31类-饲料种籽' },
  { value: '第32类-啤酒饮料', label: '第32类-啤酒饮料' },
  { value: '第33类-酒', label: '第33类-酒' },
  { value: '第34类-烟草烟具', label: '第34类-烟草烟具' },
  { value: '第35类-广告销售', label: '第35类-广告销售' },
  { value: '第36类-金融物管', label: '第36类-金融物管' },
  { value: '第37类-建筑修理', label: '第37类-建筑修理' },
  { value: '第38类-通讯服务', label: '第38类-通讯服务' },
  { value: '第39类-运输贮藏', label: '第39类-运输贮藏' },
  { value: '第40类-材料加工', label: '第40类-材料加工' },
  { value: '第41类-教育娱乐', label: '第41类-教育娱乐' },
  { value: '第42类-设计研究', label: '第42类-设计研究' },
  { value: '第43类-餐饮住宿', label: '第43类-餐饮住宿' },
  { value: '第44类-医疗园艺', label: '第44类-医疗园艺' },
  { value: '第45类-社会服务', label: '第45类-社会服务' },
];

const STATUS_OPTIONS = [
  { value: 'APPLIED', label: '申请中' },
  { value: 'REGISTERED', label: '已注册' },
  { value: 'RENEWED', label: '已续展' },
  { value: 'EXPIRED', label: '已过期' },
  { value: 'OPPOSED', label: '异议中' },
];

const REGION_OPTIONS = ['中国', '美国', '欧盟', '日本', '韩国', '英国', '德国', '法国', '加拿大', '澳大利亚', '新加坡', '中国香港', '中国台湾'];

interface FormData {
  name: string;
  registrationNumber: string;
  logoImage: string;
  categories: string[];
  applicationDate: string;
  registrationDate: string;
  validFrom: string;
  validTo: string;
  regions: string;
  owner: string;
  status: Trademark['status'];
  files: { name: string }[];
  description: string;
}

interface FormErrors {
  name?: string;
  registrationNumber?: string;
  categories?: string;
  applicationDate?: string;
  validFrom?: string;
  validTo?: string;
}

const initialFormData: FormData = {
  name: '',
  registrationNumber: '',
  logoImage: '',
  categories: [],
  applicationDate: '',
  registrationDate: '',
  validFrom: '',
  validTo: '',
  regions: '',
  owner: '本公司',
  status: 'APPLIED',
  files: [],
  description: '',
};

export default function TrademarkForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { trademarks, addTrademark, updateTrademark } = useAppStore();

  const isEditMode = useMemo(() => location.pathname.includes('/edit/'), [location.pathname]);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [categoryInput, setCategoryInput] = useState('');
  const [newRegion, setNewRegion] = useState('');

  useEffect(() => {
    if (isEditMode && id) {
      const trademark = trademarks.find((t) => t.id === id);
      if (trademark) {
        setFormData({
          name: trademark.name,
          registrationNumber: trademark.registrationNumber,
          logoImage: trademark.logoImage || '',
          categories: trademark.categories,
          applicationDate: formatDate(trademark.applicationDate),
          registrationDate: trademark.registrationDate ? formatDate(trademark.registrationDate) : '',
          validFrom: formatDate(trademark.validFrom),
          validTo: formatDate(trademark.validTo),
          regions: trademark.regions.join(', '),
          owner: trademark.owner,
          status: trademark.status,
          files: trademark.files.map((f) => ({ name: f.name })),
          description: '',
        });
      }
    }
  }, [isEditMode, id, trademarks]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = '请输入商标名称';
    if (!formData.registrationNumber.trim()) newErrors.registrationNumber = '请输入注册号';
    if (formData.categories.length === 0) newErrors.categories = '请选择至少一个注册类别';
    if (!formData.applicationDate) newErrors.applicationDate = '请选择申请日期';
    if (!formData.validFrom) newErrors.validFrom = '请选择有效期自';
    if (!formData.validTo) newErrors.validTo = '请选择有效期至';
    if (formData.validFrom && formData.validTo && formData.validFrom > formData.validTo) {
      newErrors.validTo = '有效期至不能早于有效期自';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof FormData, value: string | string[] | Trademark['status'] | { name: string }[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCategoryToggle = (category: string) => {
    const current = [...formData.categories];
    const index = current.indexOf(category);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(category);
    }
    handleChange('categories', current);
  };

  const handleAddCategory = () => {
    if (categoryInput.trim() && !formData.categories.includes(categoryInput.trim())) {
      handleChange('categories', [...formData.categories, categoryInput.trim()]);
      setCategoryInput('');
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

    const trademarkData = {
      name: formData.name.trim(),
      registrationNumber: formData.registrationNumber.trim(),
      logoImage: formData.logoImage.trim() || undefined,
      categories: formData.categories,
      applicationDate: new Date(formData.applicationDate).toISOString(),
      registrationDate: formData.registrationDate ? new Date(formData.registrationDate).toISOString() : undefined,
      validFrom: new Date(formData.validFrom).toISOString(),
      validTo: new Date(formData.validTo).toISOString(),
      regions: formData.regions.split(',').map((s) => s.trim()).filter(Boolean),
      owner: formData.owner.trim(),
      status: formData.status,
      files: formData.files.map((f) => ({
        id: generateId(),
        name: f.name,
        type: 'application/pdf',
        size: 0,
        uploadDate: new Date().toISOString(),
        url: `/files/${generateId()}/${f.name}`,
      })),
      description: formData.description.trim(),
    };

    if (isEditMode && id) {
      const existing = trademarks.find((t) => t.id === id);
      if (existing) {
        updateTrademark(id, {
          ...trademarkData,
          files: trademarkData.files.length > 0 ? trademarkData.files : existing.files,
        });
      }
    } else {
      addTrademark(trademarkData);
    }

    navigate('/trademarks');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isEditMode ? '编辑商标' : '新增商标'}
          </h1>
          <p className="text-slate-500">
            {isEditMode ? '修改商标信息' : '填写商标基本信息'}
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
              label="商标名称"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              error={errors.name}
              placeholder="请输入商标名称"
            />
            <Input
              label="注册号"
              value={formData.registrationNumber}
              onChange={(e) => handleChange('registrationNumber', e.target.value)}
              error={errors.registrationNumber}
              placeholder="请输入注册号"
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                商标图样
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors cursor-pointer bg-slate-50">
                <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600">点击上传商标图样</p>
                <p className="text-xs text-slate-400 mt-1">支持 JPG、PNG、SVG 格式</p>
                {formData.logoImage && (
                  <div className="mt-2 text-sm text-primary-600">
                    已上传: {formData.logoImage}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                商标预览
              </label>
              <div className="w-full h-32 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                {formData.name.charAt(0) || '?'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>注册类别（尼斯分类）</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Select
              placeholder="选择类别"
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
              className="flex-1"
              options={NICE_CATEGORIES.filter((c) => !formData.categories.includes(c.value))}
            />
            <Button variant="secondary" onClick={handleAddCategory} disabled={!categoryInput}>
              <Plus className="h-4 w-4" />
              添加
            </Button>
          </div>
          {errors.categories && (
            <p className="text-sm text-danger-600">{errors.categories}</p>
          )}
          <div className="flex flex-wrap gap-2">
            {formData.categories.map((cat, idx) => (
              <Badge
                key={idx}
                variant="active"
                className="cursor-pointer flex items-center gap-1"
                onClick={() => handleCategoryToggle(cat)}
              >
                {cat}
                <span className="ml-1">×</span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>日期信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="申请日期"
              type="date"
              value={formData.applicationDate}
              onChange={(e) => handleChange('applicationDate', e.target.value)}
              error={errors.applicationDate}
            />
            <Input
              label="注册日期"
              type="date"
              value={formData.registrationDate}
              onChange={(e) => handleChange('registrationDate', e.target.value)}
            />
            <Input
              label="有效期自"
              type="date"
              value={formData.validFrom}
              onChange={(e) => handleChange('validFrom', e.target.value)}
              error={errors.validFrom}
            />
            <Input
              label="有效期至"
              type="date"
              value={formData.validTo}
              onChange={(e) => handleChange('validTo', e.target.value)}
              error={errors.validTo}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>其他信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              注册地区/国家
            </label>
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="商标所有人"
              value={formData.owner}
              onChange={(e) => handleChange('owner', e.target.value)}
              placeholder="请输入商标所有人"
            />
            <Select
              label="当前状态"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value as Trademark['status'])}
              options={STATUS_OPTIONS}
            />
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

      <Card>
        <CardHeader>
          <CardTitle>备注</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="textarea"
            placeholder="请输入备注信息"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
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
