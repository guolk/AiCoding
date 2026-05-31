import { useState } from 'react';
import {
  Users,
  Plus,
  ChevronRight,
  Phone,
  Mail,
  Star,
  X,
  Edit2,
  Trash2,
  Heart,
  Info,
} from 'lucide-react';
import { useSafetyStore } from '@/stores/useSafetyStore';
import { EmergencyContact } from '@/types';
import { useForm } from 'react-hook-form';

interface ContactFormData {
  name: string;
  relationship: string;
  phone: string;
  email: string;
  medicalInfo: string;
  isPrimary: boolean;
}

export default function EmergencyPage() {
  const { emergencyContacts, addEmergencyContact, updateEmergencyContact, deleteEmergencyContact } =
    useSafetyStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ContactFormData>({
    defaultValues: {
      name: '',
      relationship: '',
      phone: '',
      email: '',
      medicalInfo: '',
      isPrimary: false,
    },
  });

  const openEditForm = (contact: EmergencyContact) => {
    setEditingId(contact.id);
    setValue('name', contact.name);
    setValue('relationship', contact.relationship);
    setValue('phone', contact.phone);
    setValue('email', contact.email || '');
    setValue('medicalInfo', contact.medicalInfo);
    setValue('isPrimary', contact.isPrimary);
    setShowForm(true);
  };

  const openAddForm = () => {
    setEditingId(null);
    reset({
      name: '',
      relationship: '',
      phone: '',
      email: '',
      medicalInfo: '',
      isPrimary: emergencyContacts.length === 0,
    });
    setShowForm(true);
  };

  const onSubmit = (data: ContactFormData) => {
    const contactData = {
      name: data.name,
      relationship: data.relationship,
      phone: data.phone,
      email: data.email || undefined,
      medicalInfo: data.medicalInfo,
      isPrimary: data.isPrimary,
    };

    if (editingId) {
      updateEmergencyContact(editingId, contactData);
    } else {
      addEmergencyContact(contactData);
    }

    setShowForm(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除此联系人吗？')) {
      deleteEmergencyContact(id);
    }
  };

  const primaryContact = emergencyContacts.find((c) => c.isPrimary);
  const otherContacts = emergencyContacts.filter((c) => !c.isPrimary);

  const ContactCard = ({ contact }: { contact: EmergencyContact }) => (
    <div
      className={`bg-dark-700/50 rounded-xl p-5 hover:bg-dark-700 transition-colors ${
        contact.isPrimary ? 'border border-primary-500/30 bg-primary-500/5' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
              contact.isPrimary
                ? 'bg-primary-500/20 text-primary-400'
                : 'bg-dark-600 text-dark-300'
            }`}
          >
            {contact.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white">{contact.name}</h3>
              {contact.isPrimary && (
                <span className="flex items-center gap-1 text-xs text-primary-400">
                  <Star size={12} className="fill-primary-400" />
                  主要联系人
                </span>
              )}
            </div>
            <span className="text-sm text-dark-400">{contact.relationship}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => openEditForm(contact)}
            className="p-2 hover:bg-dark-600 rounded-lg transition-colors"
          >
            <Edit2 size={14} className="text-dark-400" />
          </button>
          <button
            onClick={() => handleDelete(contact.id)}
            className="p-2 hover:bg-dark-600 rounded-lg transition-colors"
          >
            <Trash2 size={14} className="text-danger-400" />
          </button>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <a
          href={`tel:${contact.phone}`}
          className="flex items-center gap-2 text-dark-300 hover:text-primary-400 transition-colors"
        >
          <Phone size={16} className="text-success-400" />
          <span>{contact.phone}</span>
        </a>
        {contact.email && (
          <a
            href={`mailto:${contact.email}`}
            className="flex items-center gap-2 text-dark-300 hover:text-secondary-400 transition-colors"
          >
            <Mail size={16} className="text-secondary-400" />
            <span>{contact.email}</span>
          </a>
        )}
      </div>

      {contact.medicalInfo && (
        <div className="bg-dark-600/50 rounded-lg p-3">
          <p className="text-xs text-dark-500 mb-1 flex items-center gap-1">
            <Info size={12} />
            医疗信息
          </p>
          <p className="text-sm text-dark-200">{contact.medicalInfo}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-dark-400 text-sm mb-2">
            <span className="text-success-400">风险管理</span>
            <ChevronRight size={14} />
            <span className="text-white">紧急联系人</span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="text-success-500" size={28} />
            紧急联系人
          </h1>
          <p className="text-dark-400 mt-1">设置紧急联系人，确保训练安全</p>
        </div>
        <button
          onClick={openAddForm}
          className="btn-primary flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={18} />
          添加联系人
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-success-500/20 rounded-xl flex items-center justify-center">
              <Users className="text-success-400" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{emergencyContacts.length}</p>
          <p className="text-sm text-dark-400">总联系人</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center">
              <Star className="text-primary-400" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{primaryContact ? 1 : 0}</p>
          <p className="text-sm text-dark-400">主要联系人</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-secondary-500/20 rounded-xl flex items-center justify-center">
              <Heart className="text-secondary-400" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">
            {emergencyContacts.filter((c) => c.medicalInfo).length}
          </p>
          <p className="text-sm text-dark-400">有医疗信息</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-skate-500/20 rounded-xl flex items-center justify-center">
              <Phone className="text-skate-400" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">
            {emergencyContacts.filter((c) => c.email).length}
          </p>
          <p className="text-sm text-dark-400">有邮箱</p>
        </div>
      </div>

      {primaryContact && (
        <div className="card border border-primary-500/30 bg-primary-500/5">
          <h2 className="text-lg font-semibold text-primary-400 mb-4 flex items-center gap-2">
            <Star size={20} className="fill-primary-400" />
            主要联系人
          </h2>
          <ContactCard contact={primaryContact} />
        </div>
      )}

      {otherContacts.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-6">其他联系人</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherContacts.map((contact) => (
              <ContactCard key={contact.id} contact={contact} />
            ))}
          </div>
        </div>
      )}

      {!primaryContact && (
        <div className="card border border-warning-500/30 bg-warning-500/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-warning-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Star className="text-warning-400" size={20} />
            </div>
            <div>
              <p className="text-warning-400 font-medium">建议设置主要联系人</p>
              <p className="text-sm text-dark-400">
                在紧急情况下，主要联系人将优先显示。请设置一位了解你情况的联系人。
              </p>
            </div>
          </div>
        </div>
      )}

      {emergencyContacts.length === 0 && (
        <div className="card text-center py-12">
          <Users className="mx-auto text-dark-600 mb-4" size={48} />
          <p className="text-dark-400 mb-2">还没有紧急联系人</p>
          <p className="text-dark-500 text-sm mb-4">
            设置紧急联系人，确保在训练受伤时能够及时获得帮助。
          </p>
          <button onClick={openAddForm} className="btn-primary">
            添加第一个联系人
          </button>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-dark-900 border-b border-dark-700 p-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                {editingId ? '编辑联系人' : '添加联系人'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-dark-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="label">姓名</label>
                <input
                  {...register('name', { required: '请输入姓名' })}
                  type="text"
                  className="input-field"
                  placeholder="例如：李明"
                />
                {errors.name && (
                  <p className="text-danger-400 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="label">关系</label>
                <input
                  {...register('relationship', { required: '请输入关系' })}
                  type="text"
                  className="input-field"
                  placeholder="例如：好友、家人、训练伙伴"
                />
                {errors.relationship && (
                  <p className="text-danger-400 text-sm mt-1">
                    {errors.relationship.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">电话</label>
                  <input
                    {...register('phone', { required: '请输入电话' })}
                    type="tel"
                    className="input-field"
                    placeholder="例如：138-0000-1234"
                  />
                  {errors.phone && (
                    <p className="text-danger-400 text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>
                <div>
                  <label className="label">邮箱 (可选)</label>
                  <input
                    {...register('email')}
                    type="email"
                    className="input-field"
                    placeholder="例如：example@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="label">医疗信息</label>
                <textarea
                  {...register('medicalInfo')}
                  className="input-field h-20 resize-none"
                  placeholder="例如：了解我的保险信息和过敏史、运动医学专科..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  {...register('isPrimary')}
                  type="checkbox"
                  id="isPrimary"
                  className="w-4 h-4 rounded bg-dark-700 border-dark-600"
                />
                <label htmlFor="isPrimary" className="text-dark-300 text-sm">
                  设为主要联系人
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className="btn-outline flex-1"
                >
                  取消
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingId ? '保存修改' : '添加联系人'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
