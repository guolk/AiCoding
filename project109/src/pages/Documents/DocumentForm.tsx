import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  X,
  User,
  Globe,
  Car,
  Shield,
  CreditCard,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { useStore } from '@/store/useStore';
import { DocumentType } from '@/utils/mockData';
import { formatDate } from '@/utils/dateUtils';

const documentTypeOptions: { value: DocumentType; label: string; icon: typeof User }[] = [
  { value: 'id_card', label: '身份证', icon: User },
  { value: 'passport', label: '护照', icon: Globe },
  { value: 'driver_license', label: '驾照', icon: Car },
  { value: 'social_security', label: '社保卡', icon: Shield },
  { value: 'bank_card', label: '银行卡', icon: CreditCard },
  { value: 'other', label: '其他', icon: FileText },
];

const defaultReminderOptions = [
  { value: 30, label: '30天前' },
  { value: 60, label: '60天前' },
  { value: 90, label: '90天前' },
  { value: 180, label: '180天前' },
  { value: 365, label: '1年前' },
];

interface FormState {
  type: DocumentType;
  name: string;
  number: string;
  issueDate: string;
  expiryDate: string;
  issuingAuthority: string;
  photoUrl: string;
  notes: string;
  reminderDays: number;
}

const initialFormState: FormState = {
  type: 'id_card',
  name: '',
  number: '',
  issueDate: '',
  expiryDate: '',
  issuingAuthority: '',
  photoUrl: '',
  notes: '',
  reminderDays: 90,
};

export default function DocumentForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { documents, addDocument, updateDocument } = useStore();
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = id !== 'new' && id !== undefined;

  useEffect(() => {
    if (isEditMode) {
      const document = documents.find((doc) => doc.id === id);
      if (document) {
        setFormState({
          type: document.type,
          name: document.name,
          number: document.number,
          issueDate: formatDate(document.issueDate),
          expiryDate: formatDate(document.expiryDate),
          issuingAuthority: document.issuingAuthority,
          photoUrl: document.photoUrl || '',
          notes: document.notes || '',
          reminderDays: document.reminderDays,
        });
        setPreviewUrl(document.photoUrl || '');
      }
    }
  }, [id, isEditMode, documents]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewUrl(result);
        setFormState((prev) => ({ ...prev, photoUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormState, string>> = {};

    if (!formState.name.trim()) {
      newErrors.name = '请输入证件名称';
    }
    if (!formState.number.trim()) {
      newErrors.number = '请输入证件号码';
    }
    if (!formState.issueDate) {
      newErrors.issueDate = '请选择签发日期';
    }
    if (!formState.expiryDate) {
      newErrors.expiryDate = '请选择有效期';
    }
    if (formState.issueDate && formState.expiryDate && formState.issueDate >= formState.expiryDate) {
      newErrors.expiryDate = '有效期必须晚于签发日期';
    }
    if (!formState.issuingAuthority.trim()) {
      newErrors.issuingAuthority = '请输入签发机构';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (isEditMode && id) {
      updateDocument(id, {
        type: formState.type,
        name: formState.name,
        number: formState.number,
        issueDate: formState.issueDate,
        expiryDate: formState.expiryDate,
        issuingAuthority: formState.issuingAuthority,
        photoUrl: formState.photoUrl || undefined,
        notes: formState.notes || undefined,
        reminderDays: formState.reminderDays,
      });
    } else {
      addDocument({
        type: formState.type,
        name: formState.name,
        number: formState.number,
        issueDate: formState.issueDate,
        expiryDate: formState.expiryDate,
        issuingAuthority: formState.issuingAuthority,
        photoUrl: formState.photoUrl || undefined,
        notes: formState.notes || undefined,
        reminderDays: formState.reminderDays,
      });
    }

    navigate('/documents');
  };

  const handleChange = <K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleRemovePhoto = () => {
    setPreviewUrl('');
    setFormState((prev) => ({ ...prev, photoUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate('/documents')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            返回证件列表
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800">
              {isEditMode ? '编辑证件' : '添加证件'}
            </h1>
            <p className="text-gray-500 mt-1">
              {isEditMode
                ? '修改证件信息，保存后将更新到您的档案中'
                : '填写以下信息，将新证件添加到您的档案中'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  证件类型 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {documentTypeOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = formState.type === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleChange('type', option.value)}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                      >
                        <Icon className="w-6 h-6 mb-1" />
                        <span className="text-sm font-medium">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  证件名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formState.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="例如：张三身份证"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all ${
                    errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  证件号码 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formState.number}
                  onChange={(e) => handleChange('number', e.target.value)}
                  placeholder="请输入证件号码"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all font-mono ${
                    errors.number ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.number && (
                  <p className="mt-1 text-sm text-red-600">{errors.number}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    签发日期 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formState.issueDate}
                    onChange={(e) => handleChange('issueDate', e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all ${
                      errors.issueDate ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.issueDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.issueDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    有效期 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formState.expiryDate}
                    onChange={(e) => handleChange('expiryDate', e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all ${
                      errors.expiryDate ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.expiryDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  签发机构 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formState.issuingAuthority}
                  onChange={(e) => handleChange('issuingAuthority', e.target.value)}
                  placeholder="例如：北京市公安局"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all ${
                    errors.issuingAuthority ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.issuingAuthority && (
                  <p className="mt-1 text-sm text-red-600">{errors.issuingAuthority}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  提前提醒天数
                </label>
                <select
                  value={formState.reminderDays}
                  onChange={(e) => handleChange('reminderDays', Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white"
                >
                  {defaultReminderOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  我们会在证件到期前发送提醒通知
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  证件照片（可选）
                </label>
                {previewUrl ? (
                  <div className="relative inline-block">
                    <img
                      src={previewUrl}
                      alt="证件照片预览"
                      className="max-h-48 rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-all"
                  >
                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">点击上传证件照片</p>
                    <p className="text-sm text-gray-400 mt-1">支持 JPG、PNG 格式</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  备注（可选）
                </label>
                <textarea
                  value={formState.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="添加备注信息..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/documents')}
                className="px-5 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors shadow-sm"
              >
                <Save className="w-5 h-5" />
                {isEditMode ? '保存修改' : '保存证件'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
