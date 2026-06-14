import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  FlaskConical,
  Thermometer,
  ShieldAlert,
  Shield,
  ShieldCheck,
  Refrigerator,
  Beaker,
  Droplets,
  AlertCircle,
} from 'lucide-react';
import { useLabStore } from '@/store/useLabStore';
import AppLayout from '@/components/Layout/AppLayout';
import { Button, Badge } from '@/components/Common';
import type { BadgeType } from '@/components/Common';
import { cn } from '@/lib/utils';

// 分类地位层级选项
const taxonomyLevels = {
  kingdom: ['细菌界', '古菌界', '真菌界', '原生生物界'],
  phylum: ['变形菌门', '厚壁菌门', '放线菌门', '子囊菌门', '担子菌门', '其他'],
  class: ['γ-变形菌纲', '芽孢杆菌纲', '放线菌纲', '酵母纲', '散囊菌纲', '其他'],
  order: ['肠杆菌目', '芽孢杆菌目', '假单胞菌目', '葡萄球菌目', '酵母目', '散囊菌目', '其他'],
  family: ['肠杆菌科', '芽孢杆菌科', '假单胞菌科', '葡萄球菌科', '酵母科', '发菌科', '其他'],
  genus: ['埃希氏菌属', '芽孢杆菌属', '假单胞菌属', '葡萄球菌属', '酵母属', '曲霉属', '念珠菌属', '沙门氏菌属', '克雷伯菌属', '其他'],
  species: ['大肠杆菌', '枯草芽孢杆菌', '金黄色葡萄球菌', '铜绿假单胞菌', '酿酒酵母', '黑曲霉', '白色念珠菌', '鼠伤寒沙门氏菌', '肺炎克雷伯菌', '表皮葡萄球菌', '其他'],
};

// 安全等级选项配置
const safetyLevelOptions = [
  { value: 1, label: 'BSL-1', type: 'success' as BadgeType, desc: '低风险，普通微生物操作', icon: ShieldCheck },
  { value: 2, label: 'BSL-2', type: 'info' as BadgeType, desc: '中等风险，需个人防护装备', icon: Shield },
  { value: 3, label: 'BSL-3', type: 'danger' as BadgeType, desc: '高风险，需生物安全柜操作', icon: ShieldAlert },
];

// 需氧性选项
const aerationOptions = ['需氧', '兼性厌氧', '厌氧', '微需氧'];

// 表单数据类型
interface FormData {
  // 基本信息
  code: string;
  name: string;
  source: string;
  taxonomy: {
    kingdom: string;
    phylum: string;
    class: string;
    order: string;
    family: string;
    genus: string;
    species: string;
  };
  // 培养条件
  mediumPreference: string;
  temperature: string;
  pH: string;
  aeration: string;
  // 安全等级
  safetyLevel: number;
  // 冻存位置
  fridgeCode: string;
  boxCode: string;
  position: string;
}

const initialFormData: FormData = {
  code: '',
  name: '',
  source: '',
  taxonomy: {
    kingdom: '',
    phylum: '',
    class: '',
    order: '',
    family: '',
    genus: '',
    species: '',
  },
  mediumPreference: '',
  temperature: '37',
  pH: '7.2',
  aeration: '',
  safetyLevel: 1,
  fridgeCode: '',
  boxCode: '',
  position: '',
};

export default function StrainForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { strains, storages, addStrain, updateStrain, updateStorage, addPhenotype } = useLabStore();

  // 判断是否为编辑模式
  const isEditMode = Boolean(id);

  // 表单数据
  const [formData, setFormData] = useState<FormData>(initialFormData);
  // 表单错误
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 编辑模式下回填数据
  useEffect(() => {
    if (isEditMode && id) {
      const strain = strains.find((s) => s.id === id);
      if (strain) {
        // 解析分类地位（格式：门/纲/目/科/属/种，seed中用的是这个格式）
        const taxonomyParts = strain.taxonomy.split('/');
        const taxonomy = {
          kingdom: taxonomyParts[0] || '',
          phylum: taxonomyParts[0] || '',
          class: taxonomyParts[1] || '',
          order: taxonomyParts[2] || '',
          family: taxonomyParts[3] || '',
          genus: taxonomyParts[4] || '',
          species: taxonomyParts[5] || '',
        };

        // 解析培养条件（格式：温度℃，pH x.x，需氧性）
        const cultureMatch = strain.cultureConditions.match(/(\d+)℃[，,]\s*pH\s*([\d.]+)[，,]\s*(.+)/);
        let temperature = '37';
        let pH = '7.2';
        let aeration = '';
        if (cultureMatch) {
          temperature = cultureMatch[1];
          pH = cultureMatch[2];
          aeration = cultureMatch[3].trim();
        }

        // 获取菌株当前冻存位置
        const currentStorage = storages.find((s) => s.strainId === id);

        setFormData({
          code: strain.code,
          name: strain.name,
          source: strain.source,
          taxonomy,
          mediumPreference: '',
          temperature,
          pH,
          aeration,
          safetyLevel: strain.safetyLevel,
          fridgeCode: currentStorage?.fridgeCode || '',
          boxCode: currentStorage?.boxCode || '',
          position: currentStorage?.position || '',
        });
      }
    }
  }, [isEditMode, id, strains, storages]);

  // 可用冰箱号（未占用或当前菌株占用的）
  const availableFridges = useMemo(() => {
    const fridgeSet = new Set<string>();
    storages.forEach((s) => {
      if (s.strainId === null || s.strainId === id) {
        fridgeSet.add(s.fridgeCode);
      }
    });
    return Array.from(fridgeSet).sort();
  }, [storages, id]);

  // 可用盒号（基于选定冰箱）
  const availableBoxes = useMemo(() => {
    if (!formData.fridgeCode) return [];
    const boxSet = new Set<string>();
    storages.forEach((s) => {
      if (
        s.fridgeCode === formData.fridgeCode &&
        (s.strainId === null || s.strainId === id)
      ) {
        boxSet.add(s.boxCode);
      }
    });
    return Array.from(boxSet).sort();
  }, [storages, formData.fridgeCode, id]);

  // 可用位置号（基于选定冰箱和盒号）
  const availablePositions = useMemo(() => {
    if (!formData.fridgeCode || !formData.boxCode) return [];
    return storages
      .filter(
        (s) =>
          s.fridgeCode === formData.fridgeCode &&
          s.boxCode === formData.boxCode &&
          (s.strainId === null || s.strainId === id)
      )
      .map((s) => s.position)
      .sort();
  }, [storages, formData.fridgeCode, formData.boxCode, id]);

  // 更新表单字段
  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 清除对应错误
    if (errors[field as string]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field as string];
        return next;
      });
    }
  };

  // 更新分类地位字段
  const updateTaxonomy = (field: keyof FormData['taxonomy'], value: string) => {
    setFormData((prev) => ({
      ...prev,
      taxonomy: { ...prev.taxonomy, [field]: value },
    }));
  };

  // 表单校验
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = '请输入菌株编号';
    } else if (!isEditMode) {
      // 新增时检查编号是否重复
      if (strains.some((s) => s.code === formData.code.trim())) {
        newErrors.code = '该菌株编号已存在';
      }
    }

    if (!formData.name.trim()) {
      newErrors.name = '请输入菌株名称';
    }

    if (!formData.source.trim()) {
      newErrors.source = '请输入菌株来源';
    }

    if (!formData.aeration) {
      newErrors.aeration = '请选择需氧性';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 组装分类地位字符串
  const buildTaxonomyString = (): string => {
    const { taxonomy } = formData;
    const parts = [
      taxonomy.phylum,
      taxonomy.class,
      taxonomy.order,
      taxonomy.family,
      taxonomy.genus,
      taxonomy.species,
    ].filter(Boolean);
    return parts.join('/');
  };

  // 组装培养条件字符串
  const buildCultureConditions = (): string => {
    const parts: string[] = [];
    if (formData.temperature) parts.push(`${formData.temperature}℃`);
    if (formData.pH) parts.push(`pH ${formData.pH}`);
    if (formData.aeration) parts.push(formData.aeration);
    return parts.join('，');
  };

  // 提交表单
  const handleSubmit = () => {
    if (!validateForm()) return;

    const strainData = {
      code: formData.code.trim(),
      name: formData.name.trim(),
      source: formData.source.trim(),
      taxonomy: buildTaxonomyString(),
      cultureConditions: buildCultureConditions(),
      safetyLevel: formData.safetyLevel,
      createdAt: new Date().toISOString().split('T')[0],
      operator: '当前用户',
    };

    if (isEditMode && id) {
      // 编辑模式：更新菌株
      updateStrain(id, strainData);

      // 更新冻存位置（如果选择了）
      if (formData.fridgeCode && formData.boxCode && formData.position) {
        // 先清除旧的位置占用
        storages.forEach((s) => {
          if (s.strainId === id) {
            updateStorage(s.id, { strainId: null, status: '空' });
          }
        });
        // 设置新的位置
        const targetStorage = storages.find(
          (s) =>
            s.fridgeCode === formData.fridgeCode &&
            s.boxCode === formData.boxCode &&
            s.position === formData.position
        );
        if (targetStorage) {
          updateStorage(targetStorage.id, { strainId: id, status: '正常' });
        }
      }
    } else {
      // 新增模式：添加菌株
      const newStrain = addStrain(strainData);
      // 注意：zustand的addStrain不返回新对象，需要获取最新的
      // 这里我们简单处理：刚创建的是strains中最后一个匹配code的
      const createdStrainId = strains.find((s) => s.code === strainData.code)?.id;

      // 预留：创建空的表型特征
      if (createdStrainId) {
        // 更新冻存位置
        if (formData.fridgeCode && formData.boxCode && formData.position) {
          const targetStorage = storages.find(
            (s) =>
              s.fridgeCode === formData.fridgeCode &&
              s.boxCode === formData.boxCode &&
              s.position === formData.position
          );
          if (targetStorage) {
            updateStorage(targetStorage.id, { strainId: createdStrainId, status: '正常' });
          }
        }
      }
    }

    // 返回列表
    navigate('/strains');
  };

  return (
    <AppLayout
      breadcrumbItems={[
        { label: '首页', path: '/' },
        { label: '菌株档案', path: '/strains' },
        { label: isEditMode ? '编辑菌株' : '新增菌株' },
      ]}
    >
      <div className="min-h-full bg-[#F2F3F5] -m-6 p-6">
        <div className="max-w-[1200px] mx-auto">
          {/* 顶部栏 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/strains')}
                className="flex items-center justify-center h-10 w-10 rounded-lg bg-white border border-gray-200 text-gray-500 hover:border-[#165DFF] hover:text-[#165DFF] transition-colors shadow-sm"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-[22px] font-bold text-gray-900">
                  {isEditMode ? '编辑菌株' : '新增菌株'}
                </h1>
                <p className="text-[13px] text-gray-500 mt-1">
                  {isEditMode ? '修改已存在的菌株档案信息' : '填写菌株基础信息，创建新的菌株档案'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            {/* 1. 基本信息卡片 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-white px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#165DFF]/10">
                    <FlaskConical className="h-4 w-4 text-[#165DFF]" />
                  </div>
                  <h2 className="text-[16px] font-semibold text-gray-800">基本信息</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                  {/* 菌株编号 */}
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                      菌株编号 <span className="text-[#F53F3F]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="如：ESC-001"
                      value={formData.code}
                      onChange={(e) => updateField('code', e.target.value)}
                      disabled={isEditMode}
                      className={cn(
                        'w-full h-10 px-3.5 rounded-lg border transition-all',
                        'focus:outline-none focus:ring-2',
                        errors.code
                          ? 'border-[#F53F3F] focus:border-[#F53F3F] focus:ring-[#F53F3F]/20'
                          : 'border-gray-200 focus:border-[#165DFF] focus:ring-[#165DFF]/20',
                        'text-[14px] text-gray-700 placeholder-gray-400',
                        isEditMode && 'bg-gray-50 cursor-not-allowed opacity-70'
                      )}
                    />
                    {errors.code && (
                      <p className="mt-1 text-[12px] text-[#F53F3F] flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.code}
                      </p>
                    )}
                  </div>

                  {/* 菌株名称 */}
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                      菌株名称 <span className="text-[#F53F3F]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="如：大肠杆菌"
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      className={cn(
                        'w-full h-10 px-3.5 rounded-lg border transition-all',
                        'focus:outline-none focus:ring-2',
                        errors.name
                          ? 'border-[#F53F3F] focus:border-[#F53F3F] focus:ring-[#F53F3F]/20'
                          : 'border-gray-200 focus:border-[#165DFF] focus:ring-[#165DFF]/20',
                        'text-[14px] text-gray-700 placeholder-gray-400'
                      )}
                    />
                    {errors.name && (
                      <p className="mt-1 text-[12px] text-[#F53F3F] flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* 菌株来源 */}
                  <div className="md:col-span-2">
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                      菌株来源 <span className="text-[#F53F3F]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="如：ATCC 25922 标准株 / 临床分离 / 环境采样"
                      value={formData.source}
                      onChange={(e) => updateField('source', e.target.value)}
                      className={cn(
                        'w-full h-10 px-3.5 rounded-lg border transition-all',
                        'focus:outline-none focus:ring-2',
                        errors.source
                          ? 'border-[#F53F3F] focus:border-[#F53F3F] focus:ring-[#F53F3F]/20'
                          : 'border-gray-200 focus:border-[#165DFF] focus:ring-[#165DFF]/20',
                        'text-[14px] text-gray-700 placeholder-gray-400'
                      )}
                    />
                    {errors.source && (
                      <p className="mt-1 text-[12px] text-[#F53F3F] flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.source}
                      </p>
                    )}
                  </div>

                  {/* 分类地位 - 标题 */}
                  <div className="md:col-span-2 pt-2">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                      <span className="text-[13px] font-medium text-gray-600">分类地位（生物分类学）</span>
                    </div>
                  </div>

                  {/* 门 */}
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">门</label>
                    <select
                      value={formData.taxonomy.phylum}
                      onChange={(e) => updateTaxonomy('phylum', e.target.value)}
                      className={cn(
                        'w-full h-10 px-3 rounded-lg border border-gray-200',
                        'focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                        'text-[14px] text-gray-700 bg-white transition-all'
                      )}
                    >
                      <option value="">请选择</option>
                      {taxonomyLevels.phylum.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 纲 */}
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">纲</label>
                    <select
                      value={formData.taxonomy.class}
                      onChange={(e) => updateTaxonomy('class', e.target.value)}
                      className={cn(
                        'w-full h-10 px-3 rounded-lg border border-gray-200',
                        'focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                        'text-[14px] text-gray-700 bg-white transition-all'
                      )}
                    >
                      <option value="">请选择</option>
                      {taxonomyLevels.class.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 目 */}
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">目</label>
                    <select
                      value={formData.taxonomy.order}
                      onChange={(e) => updateTaxonomy('order', e.target.value)}
                      className={cn(
                        'w-full h-10 px-3 rounded-lg border border-gray-200',
                        'focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                        'text-[14px] text-gray-700 bg-white transition-all'
                      )}
                    >
                      <option value="">请选择</option>
                      {taxonomyLevels.order.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 科 */}
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">科</label>
                    <select
                      value={formData.taxonomy.family}
                      onChange={(e) => updateTaxonomy('family', e.target.value)}
                      className={cn(
                        'w-full h-10 px-3 rounded-lg border border-gray-200',
                        'focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                        'text-[14px] text-gray-700 bg-white transition-all'
                      )}
                    >
                      <option value="">请选择</option>
                      {taxonomyLevels.family.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 属 */}
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">属</label>
                    <select
                      value={formData.taxonomy.genus}
                      onChange={(e) => updateTaxonomy('genus', e.target.value)}
                      className={cn(
                        'w-full h-10 px-3 rounded-lg border border-gray-200',
                        'focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                        'text-[14px] text-gray-700 bg-white transition-all'
                      )}
                    >
                      <option value="">请选择</option>
                      {taxonomyLevels.genus.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 种 */}
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">种</label>
                    <select
                      value={formData.taxonomy.species}
                      onChange={(e) => updateTaxonomy('species', e.target.value)}
                      className={cn(
                        'w-full h-10 px-3 rounded-lg border border-gray-200',
                        'focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                        'text-[14px] text-gray-700 bg-white transition-all'
                      )}
                    >
                      <option value="">请选择</option>
                      {taxonomyLevels.species.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. 培养条件卡片 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-50 to-white px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10">
                    <Beaker className="h-4 w-4 text-cyan-600" />
                  </div>
                  <h2 className="text-[16px] font-semibold text-gray-800">培养条件</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                  {/* 培养基偏好 */}
                  <div className="md:col-span-2">
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                      培养基偏好
                    </label>
                    <input
                      type="text"
                      placeholder="如：LB培养基 / TSA培养基 / YPD培养基"
                      value={formData.mediumPreference}
                      onChange={(e) => updateField('mediumPreference', e.target.value)}
                      className={cn(
                        'w-full h-10 px-3.5 rounded-lg border border-gray-200',
                        'focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                        'text-[14px] text-gray-700 placeholder-gray-400 transition-all'
                      )}
                    />
                  </div>

                  {/* 培养温度 */}
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                      培养温度（℃）
                    </label>
                    <div className="relative">
                      <Thermometer className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        min={0}
                        max={80}
                        step={0.5}
                        placeholder="37"
                        value={formData.temperature}
                        onChange={(e) => updateField('temperature', e.target.value)}
                        className={cn(
                          'w-full h-10 pl-10 pr-10 rounded-lg border border-gray-200',
                          'focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                          'text-[14px] text-gray-700 placeholder-gray-400 transition-all'
                        )}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[13px]">
                        ℃
                      </span>
                    </div>
                  </div>

                  {/* pH值 */}
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                      pH值
                    </label>
                    <div className="relative">
                      <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        min={1}
                        max={14}
                        step={0.1}
                        placeholder="7.2"
                        value={formData.pH}
                        onChange={(e) => updateField('pH', e.target.value)}
                        className={cn(
                          'w-full h-10 pl-10 pr-3 rounded-lg border border-gray-200',
                          'focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                          'text-[14px] text-gray-700 placeholder-gray-400 transition-all'
                        )}
                      />
                    </div>
                  </div>

                  {/* 需氧性 */}
                  <div className="md:col-span-2">
                    <label className="block text-[13px] font-medium text-gray-700 mb-2">
                      需氧性 <span className="text-[#F53F3F]">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {aerationOptions.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => updateField('aeration', option)}
                          className={cn(
                            'px-4 py-2 rounded-lg text-[13px] font-medium transition-all border',
                            formData.aeration === option
                              ? 'bg-[#165DFF] text-white border-[#165DFF] shadow-sm'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-[#165DFF] hover:text-[#165DFF]'
                          )}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                    {errors.aeration && (
                      <p className="mt-1.5 text-[12px] text-[#F53F3F] flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.aeration}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. 安全等级卡片 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-50 to-white px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
                    <Shield className="h-4 w-4 text-green-600" />
                  </div>
                  <h2 className="text-[16px] font-semibold text-gray-800">生物安全等级</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {safetyLevelOptions.map((option) => {
                    const IconComp = option.icon;
                    const isSelected = formData.safetyLevel === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateField('safetyLevel', option.value)}
                        className={cn(
                          'relative p-5 rounded-xl border-2 transition-all text-left',
                          'hover:shadow-md',
                          isSelected
                            ? option.value === 1
                              ? 'border-[#00B42A] bg-gradient-to-br from-[#00B42A]/5 to-white shadow-sm'
                              : option.value === 2
                              ? 'border-[#165DFF] bg-gradient-to-br from-[#165DFF]/5 to-white shadow-sm'
                              : 'border-[#F53F3F] bg-gradient-to-br from-[#F53F3F]/5 to-white shadow-sm'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        )}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div
                            className={cn(
                              'flex h-11 w-11 items-center justify-center rounded-xl',
                              option.value === 1 && 'bg-[#00B42A]/10',
                              option.value === 2 && 'bg-[#165DFF]/10',
                              option.value === 3 && 'bg-[#F53F3F]/10'
                            )}
                          >
                            <IconComp
                              className={cn(
                                'h-6 w-6',
                                option.value === 1 && 'text-[#00B42A]',
                                option.value === 2 && 'text-[#165DFF]',
                                option.value === 3 && 'text-[#F53F3F]'
                              )}
                            />
                          </div>
                          <Badge type={option.type}>{option.label}</Badge>
                        </div>
                        <p className="text-[12px] text-gray-500 leading-relaxed">
                          {option.desc}
                        </p>
                        {isSelected && (
                          <div
                            className={cn(
                              'absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full',
                              option.value === 1 && 'bg-[#00B42A]',
                              option.value === 2 && 'bg-[#165DFF]',
                              option.value === 3 && 'bg-[#F53F3F]'
                            )}
                          >
                            <svg
                              className="h-3 w-3 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={3}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 4. 冻存位置卡片 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-violet-50 to-white px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
                      <Refrigerator className="h-4 w-4 text-violet-600" />
                    </div>
                    <h2 className="text-[16px] font-semibold text-gray-800">冻存位置</h2>
                  </div>
                  <span className="text-[12px] text-gray-400">
                    （选填，可后续在冻存管理模块分配）
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
                  {/* 冰箱号 */}
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                      冰箱号
                    </label>
                    <select
                      value={formData.fridgeCode}
                      onChange={(e) => {
                        updateField('fridgeCode', e.target.value);
                        updateField('boxCode', '');
                        updateField('position', '');
                      }}
                      className={cn(
                        'w-full h-10 px-3 rounded-lg border border-gray-200',
                        'focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                        'text-[14px] text-gray-700 bg-white transition-all'
                      )}
                    >
                      <option value="">请选择冰箱</option>
                      {availableFridges.map((fridge) => (
                        <option key={fridge} value={fridge}>
                          {fridge}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 盒号 */}
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                      冻存盒号
                    </label>
                    <select
                      value={formData.boxCode}
                      onChange={(e) => {
                        updateField('boxCode', e.target.value);
                        updateField('position', '');
                      }}
                      disabled={!formData.fridgeCode}
                      className={cn(
                        'w-full h-10 px-3 rounded-lg border transition-all',
                        'focus:outline-none focus:ring-2',
                        'text-[14px] text-gray-700 bg-white',
                        formData.fridgeCode
                          ? 'border-gray-200 focus:border-[#165DFF] focus:ring-[#165DFF]/20'
                          : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                      )}
                    >
                      <option value="">请选择冻存盒</option>
                      {availableBoxes.map((box) => (
                        <option key={box} value={box}>
                          {box}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 位置号 */}
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                      位置号
                    </label>
                    <select
                      value={formData.position}
                      onChange={(e) => updateField('position', e.target.value)}
                      disabled={!formData.boxCode}
                      className={cn(
                        'w-full h-10 px-3 rounded-lg border transition-all',
                        'focus:outline-none focus:ring-2',
                        'text-[14px] text-gray-700 bg-white',
                        formData.boxCode
                          ? 'border-gray-200 focus:border-[#165DFF] focus:ring-[#165DFF]/20'
                          : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                      )}
                    >
                      <option value="">请选择位置</option>
                      {availablePositions.map((pos) => (
                        <option key={pos} value={pos}>
                          {pos}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 位置预览 */}
                {formData.fridgeCode && formData.boxCode && formData.position && (
                  <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-violet-50 to-white border border-violet-100">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                        <Refrigerator className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-[12px] text-gray-500 mb-0.5">已选择冻存位置</div>
                        <div className="text-[15px] font-semibold text-gray-800">
                          {formData.fridgeCode} / {formData.boxCode} / 位置 {formData.position}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 底部操作栏 */}
            <div className="sticky bottom-0 -mx-6 px-6 py-4 bg-gradient-to-t from-white via-white/95 to-transparent backdrop-blur-sm border-t border-gray-100">
              <div className="flex items-center justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={() => navigate('/strains')}
                  leftIcon={<ArrowLeft className="h-4 w-4" />}
                >
                  取消
                </Button>
                <Button
                  leftIcon={<Save className="h-4 w-4" />}
                  onClick={handleSubmit}
                >
                  {isEditMode ? '保存修改' : '保存菌株'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
