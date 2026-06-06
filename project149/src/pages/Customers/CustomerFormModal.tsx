import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { Modal, ModalFooter } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import type { Customer } from '../../types';

interface CustomerFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => void;
  customer?: Customer | null;
}

const dietaryOptions = ['素食', '纯素', '无麸质', '低盐', '低糖', '低脂', '清真', '糖尿病饮食', '有机', '生食'];
const allergyOptions = ['花生', '海鲜', '虾', '蟹', '小麦', '牛奶', '蛋类', '大豆', '坚果', '芒果'];
const cuisineOptions = ['粤菜', '川菜', '湘菜', '鲁菜', '东北菜', '新疆菜', '西北菜', '日式料理', '韩式料理', '东南亚菜', '墨西哥菜', '法式料理', '地中海菜', '素食料理', '清真料理'];

const tasteDimensions = [
  { key: 'spicy', label: '辣' },
  { key: 'salty', label: '咸' },
  { key: 'sweet', label: '甜' },
  { key: 'sour', label: '酸' },
  { key: 'bitter', label: '苦' },
];

export function CustomerFormModal({ open, onClose, onSubmit, customer }: CustomerFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    avatar: '',
    dietaryRestrictions: [] as string[],
    allergies: [] as string[],
    tastePreferences: {
      spicy: 5,
      salty: 5,
      sweet: 5,
      sour: 5,
      bitter: 5,
    },
    dislikedIngredients: [] as string[],
    favoriteCuisines: [] as string[],
    notes: '',
  });

  const [newDisliked, setNewDisliked] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        avatar: customer.avatar,
        dietaryRestrictions: [...customer.dietaryRestrictions],
        allergies: [...customer.allergies],
        tastePreferences: { ...customer.tastePreferences },
        dislikedIngredients: [...customer.dislikedIngredients],
        favoriteCuisines: [...customer.favoriteCuisines],
        notes: customer.notes,
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        avatar: '',
        dietaryRestrictions: [],
        allergies: [],
        tastePreferences: {
          spicy: 5,
          salty: 5,
          sweet: 5,
          sour: 5,
          bitter: 5,
        },
        dislikedIngredients: [],
        favoriteCuisines: [],
        notes: '',
      });
    }
    setErrors({});
  }, [customer, open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = '请输入客户姓名';
    if (!formData.phone.trim()) newErrors.phone = '请输入联系电话';
    if (!/^1[3-9]\d{9}$/.test(formData.phone)) newErrors.phone = '请输入有效的手机号码';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const avatar = formData.avatar.trim() || 
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(formData.name)}`;

    onSubmit({
      ...formData,
      avatar,
    });
    onClose();
  };

  const toggleArrayItem = (field: 'dietaryRestrictions' | 'allergies' | 'favoriteCuisines', item: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item],
    }));
  };

  const handleTasteChange = (key: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      tastePreferences: {
        ...prev.tastePreferences,
        [key]: value,
      },
    }));
  };

  const addDislikedIngredient = () => {
    const trimmed = newDisliked.trim();
    if (trimmed && !formData.dislikedIngredients.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        dislikedIngredients: [...prev.dislikedIngredients, trimmed],
      }));
      setNewDisliked('');
    }
  };

  const removeDislikedIngredient = (item: string) => {
    setFormData(prev => ({
      ...prev,
      dislikedIngredients: prev.dislikedIngredients.filter(i => i !== item),
    }));
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={customer ? '编辑客户' : '新增客户'}
      description={customer ? '修改客户的基本信息和饮食偏好' : '添加新的客户档案'}
      size="xl"
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="客户姓名"
            placeholder="请输入客户姓名"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            error={errors.name}
          />
          <Input
            label="联系电话"
            placeholder="请输入手机号码"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            error={errors.phone}
          />
          <Input
            label="邮箱地址"
            placeholder="请输入邮箱（选填）"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            error={errors.email}
          />
          <Input
            label="头像链接"
            placeholder="请输入头像URL（选填）"
            value={formData.avatar}
            onChange={(e) => setFormData(prev => ({ ...prev, avatar: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-700 mb-2">饮食禁忌</label>
          <div className="flex flex-wrap gap-2">
            {dietaryOptions.map(option => (
              <Badge
                key={option}
                variant={formData.dietaryRestrictions.includes(option) ? 'primary' : 'outline'}
                className="cursor-pointer transition-all hover:scale-105"
                onClick={() => toggleArrayItem('dietaryRestrictions', option)}
              >
                {option}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-700 mb-2">过敏史</label>
          <div className="flex flex-wrap gap-2">
            {allergyOptions.map(option => (
              <Badge
                key={option}
                variant={formData.allergies.includes(option) ? 'danger' : 'outline'}
                className="cursor-pointer transition-all hover:scale-105"
                onClick={() => toggleArrayItem('allergies', option)}
              >
                {option}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-700 mb-3">口味偏好</label>
          <div className="space-y-4">
            {tasteDimensions.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-4">
                <span className="w-12 text-sm text-gray-600">{label}</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.tastePreferences[key as keyof typeof formData.tastePreferences]}
                  onChange={(e) => handleTasteChange(key, parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
                <span className="w-8 text-center text-sm font-medium text-primary-600">
                  {formData.tastePreferences[key as keyof typeof formData.tastePreferences]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-700 mb-2">不喜欢的食材</label>
          <div className="flex gap-2 mb-3">
            <Input
              placeholder="输入食材名称"
              value={newDisliked}
              onChange={(e) => setNewDisliked(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDislikedIngredient())}
              className="flex-1"
            />
            <Button type="button" onClick={addDislikedIngredient} variant="secondary">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.dislikedIngredients.map(item => (
              <Badge
                key={item}
                variant="secondary"
                className="cursor-pointer group"
                onClick={() => removeDislikedIngredient(item)}
              >
                {item}
                <X className="w-3 h-3 ml-1 group-hover:text-coral-500" />
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-700 mb-2">喜欢的菜系</label>
          <div className="flex flex-wrap gap-2">
            {cuisineOptions.map(option => (
              <Badge
                key={option}
                variant={formData.favoriteCuisines.includes(option) ? 'gold' : 'outline'}
                className="cursor-pointer transition-all hover:scale-105"
                onClick={() => toggleArrayItem('favoriteCuisines', option)}
              >
                {option}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-700 mb-2">备注</label>
          <textarea
            placeholder="记录客户的特殊需求、注意事项等..."
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 hover:border-primary-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all resize-none"
            rows={3}
          />
        </div>
      </div>

      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>
          取消
        </Button>
        <Button onClick={handleSubmit}>
          {customer ? '保存修改' : '创建客户'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
