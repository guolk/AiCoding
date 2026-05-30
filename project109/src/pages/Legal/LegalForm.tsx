import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Scale,
  Save,
  X,
  Plus,
  Trash2,
  Upload,
  Star,
  StarOff,
} from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/common/PageHeader';
import { useStore } from '@/store/useStore';
import type { LegalType, KeyClause } from '@/utils/mockData';
import { generateId } from '@/utils/dateUtils';

const typeOptions: { value: LegalType; label: string }[] = [
  { value: 'property_contract', label: '房产合同' },
  { value: 'labor_contract', label: '劳动合同' },
  { value: 'insurance_contract', label: '保险合同' },
  { value: 'other', label: '其他' },
];

interface FormData {
  type: LegalType;
  title: string;
  partyA: string;
  partyB: string;
  signDate: string;
  effectiveDate: string;
  expiryDate: string;
  contractAmount: string;
  reminderDays: number;
  notes: string;
  keyClauses: KeyClause[];
  scanFileUrl?: string;
}

const initialFormData: FormData = {
  type: 'property_contract',
  title: '',
  partyA: '',
  partyB: '',
  signDate: '',
  effectiveDate: '',
  expiryDate: '',
  contractAmount: '',
  reminderDays: 90,
  notes: '',
  keyClauses: [],
  scanFileUrl: undefined,
};

export default function LegalForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id && id !== 'new';
  const { legalDocuments, addLegalDocument, updateLegalDocument } = useStore();

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newClause, setNewClause] = useState({ title: '', content: '', highlighted: false });

  useEffect(() => {
    if (isEditMode) {
      const doc = legalDocuments.find((d) => d.id === id);
      if (doc) {
        setFormData({
          type: doc.type,
          title: doc.title,
          partyA: doc.partyA,
          partyB: doc.partyB,
          signDate: doc.signDate,
          effectiveDate: doc.effectiveDate,
          expiryDate: doc.expiryDate,
          contractAmount: doc.contractAmount,
          reminderDays: doc.reminderDays,
          notes: doc.notes || '',
          keyClauses: [...doc.keyClauses],
          scanFileUrl: doc.scanFileUrl,
        });
      }
    }
  }, [id, isEditMode, legalDocuments]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '请输入文件标题';
    }
    if (!formData.partyA.trim()) {
      newErrors.partyA = '请输入甲方信息';
    }
    if (!formData.partyB.trim()) {
      newErrors.partyB = '请输入乙方信息';
    }
    if (!formData.signDate) {
      newErrors.signDate = '请选择签订日期';
    }
    if (!formData.effectiveDate) {
      newErrors.effectiveDate = '请选择生效日期';
    }
    if (!formData.expiryDate) {
      newErrors.expiryDate = '请选择到期日期';
    }
    if (formData.effectiveDate && formData.expiryDate && formData.effectiveDate > formData.expiryDate) {
      newErrors.expiryDate = '到期日期不能早于生效日期';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const dataToSubmit = {
      ...formData,
      type: formData.type,
      reminderDays: Number(formData.reminderDays),
    };

    if (isEditMode) {
      updateLegalDocument(id!, dataToSubmit);
    } else {
      addLegalDocument(dataToSubmit);
    }

    navigate('/legal');
  };

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const addClause = () => {
    if (!newClause.title.trim() || !newClause.content.trim()) return;

    const clause: KeyClause = {
      id: generateId(),
      title: newClause.title,
      content: newClause.content,
      highlighted: newClause.highlighted,
    };

    setFormData((prev) => ({
      ...prev,
      keyClauses: [...prev.keyClauses, clause],
    }));

    setNewClause({ title: '', content: '', highlighted: false });
  };

  const removeClause = (clauseId: string) => {
    setFormData((prev) => ({
      ...prev,
      keyClauses: prev.keyClauses.filter((c) => c.id !== clauseId),
    }));
  };

  const toggleClauseHighlight = (clauseId: string) => {
    setFormData((prev) => ({
      ...prev,
      keyClauses: prev.keyClauses.map((c) =>
        c.id === clauseId ? { ...c, highlighted: !c.highlighted } : c
      ),
    }));
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader
          title={isEditMode ? '编辑法律文件' : '添加法律文件'}
          subtitle={isEditMode ? '修改法律文件信息' : '填写法律文件基本信息和关键条款'}
          icon={<Scale className="w-6 h-6" />}
          breadcrumbs={[
            { label: '法律文件', path: '/legal' },
            { label: isEditMode ? '编辑文件' : '添加文件' },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">基本信息</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    文件类型 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value as LegalType)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {typeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    文件标题 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="例如：房屋买卖合同"
                    className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.title ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  {errors.title && (
                    <p className="text-xs text-red-500 mt-1">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    甲方 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.partyA}
                    onChange={(e) => handleInputChange('partyA', e.target.value)}
                    placeholder="例如：张三"
                    className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.partyA ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  {errors.partyA && (
                    <p className="text-xs text-red-500 mt-1">{errors.partyA}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    乙方 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.partyB}
                    onChange={(e) => handleInputChange('partyB', e.target.value)}
                    placeholder="例如：北京房地产开发有限公司"
                    className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.partyB ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  {errors.partyB && (
                    <p className="text-xs text-red-500 mt-1">{errors.partyB}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    签订日期 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.signDate}
                    onChange={(e) => handleInputChange('signDate', e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.signDate ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  {errors.signDate && (
                    <p className="text-xs text-red-500 mt-1">{errors.signDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    生效日期 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.effectiveDate}
                    onChange={(e) => handleInputChange('effectiveDate', e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.effectiveDate ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  {errors.effectiveDate && (
                    <p className="text-xs text-red-500 mt-1">{errors.effectiveDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    到期日期 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.expiryDate ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  {errors.expiryDate && (
                    <p className="text-xs text-red-500 mt-1">{errors.expiryDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    合同金额
                  </label>
                  <input
                    type="text"
                    value={formData.contractAmount}
                    onChange={(e) => handleInputChange('contractAmount', e.target.value)}
                    placeholder="例如：3,500,000 或 25,000/月"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    提醒天数
                  </label>
                  <input
                    type="number"
                    value={formData.reminderDays}
                    onChange={(e) => handleInputChange('reminderDays', parseInt(e.target.value) || 0)}
                    placeholder="提前多少天提醒"
                    min="0"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  备注
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="补充说明"
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">关键条款</h3>

              {formData.keyClauses.length > 0 && (
                <div className="space-y-4 mb-4">
                  {formData.keyClauses.map((clause) => (
                    <div
                      key={clause.id}
                      className={`border rounded-lg p-4 ${
                        clause.highlighted
                          ? 'border-yellow-200 bg-yellow-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900">{clause.title}</h4>
                          {clause.highlighted && (
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => toggleClauseHighlight(clause.id)}
                            className="p-1 text-gray-400 hover:text-yellow-500 transition-colors"
                            title={clause.highlighted ? '取消高亮' : '标记高亮'}
                          >
                            {clause.highlighted ? (
                              <StarOff className="w-4 h-4" />
                            ) : (
                              <Star className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => removeClause(clause.id)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{clause.content}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={newClause.title}
                      onChange={(e) => setNewClause((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="条款标题"
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newClause.highlighted}
                        onChange={(e) => setNewClause((prev) => ({ ...prev, highlighted: e.target.checked }))}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-600">高亮标记</span>
                    </label>
                  </div>
                  <textarea
                    value={newClause.content}
                    onChange={(e) => setNewClause((prev) => ({ ...prev, content: e.target.value }))}
                    placeholder="条款内容"
                    rows={2}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                  <button
                    onClick={addClause}
                    disabled={!newClause.title.trim() || !newClause.content.trim()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                    添加条款
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">上传扫描件（可选）</h3>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-primary-300 transition-colors cursor-pointer">
                <Upload className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">点击或拖拽文件到此处上传</p>
                <p className="text-xs text-gray-400 mt-1">支持 PDF、JPG、PNG 格式，单个文件不超过 10MB</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="sticky top-6">
              <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                <button
                  onClick={handleSubmit}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  {isEditMode ? '保存修改' : '保存文件'}
                </button>
                <button
                  onClick={() => navigate('/legal')}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  取消
                </button>
              </div>

              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h4 className="font-medium text-blue-800 mb-2">提示</h4>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>• 带 <span className="text-red-500">*</span> 标记的为必填项</li>
                  <li>• 关键条款可以添加多个，重要条款建议高亮标记</li>
                  <li>• 设置提醒天数后，系统会在到期前提醒您</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
