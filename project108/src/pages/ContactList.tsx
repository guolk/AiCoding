

import { useState } from 'react';
import {
  Plus,
  Search,
  Phone,
  Mail,
  Gift,
  Calendar,
  Heart,
  X,
  User,
  AlertTriangle,
  Edit2,
  Trash2,
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import type { Contact } from '../types';
import { formatDateShort, getDaysUntil, getNextAnniversary } from '../utils/date';

export default function ContactList() {
  const {
    contacts,
    anniversaries,
    setSelectedContactId,
    setCurrentPage,
    addContact,
    updateContact,
    deleteContact,
  } = useAppStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.relation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact);
  };

  const handleViewDetails = (contact: Contact) => {
    setSelectedContactId(contact.id);
    setCurrentPage('contact-detail');
  };

  const handleEdit = (contact: Contact, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingContact(contact);
    setShowModal(true);
    setSelectedContact(null);
  };

  const handleDeleteClick = (contact: Contact, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setContactToDelete(contact);
    setShowDeleteConfirm(true);
    setSelectedContact(null);
  };

  const confirmDelete = () => {
    if (contactToDelete) {
      deleteContact(contactToDelete.id);
      setShowDeleteConfirm(false);
      setContactToDelete(null);
    }
  };

  const getNextBirthday = (contactId: string) => {
    const birthday = anniversaries.find(
      (a) => a.contactId === contactId && a.type === 'birthday'
    );
    if (!birthday) return null;
    const nextDate = getNextAnniversary(birthday.date, birthday.recurring);
    return {
      date: nextDate,
      daysUntil: getDaysUntil(nextDate),
    };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink-900">
            联系人管理
          </h1>
          <p className="text-ink-500 mt-1">
            共 {contacts.length} 位联系人 · {anniversaries.length} 个纪念日
          </p>
        </div>
        <button
          onClick={() => {
            setEditingContact(null);
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          添加联系人
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" size={20} />
        <input
          type="text"
          placeholder="搜索联系人姓名或关系..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-12"
        />
      </div>

      {filteredContacts.length === 0 ? (
        <div className="card text-center py-12">
          <User className="w-16 h-16 text-ink-300 mx-auto mb-4" />
          <p className="text-ink-500">
            {searchTerm ? '没有找到匹配的联系人' : '还没有添加联系人'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => {
                setEditingContact(null);
                setShowModal(true);
              }}
              className="btn-primary mt-4"
            >
              添加第一个联系人
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5">
          {filteredContacts.map((contact) => {
            const birthday = getNextBirthday(contact.id);
            const contactAnniversaries = anniversaries.filter(
              (a) => a.contactId === contact.id
            );

            return (
              <div
                key={contact.id}
                onClick={() => handleContactClick(contact)}
                className="card card-hover cursor-pointer group relative"
              >
                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    onClick={(e) => handleEdit(contact, e)}
                    className="w-8 h-8 rounded-lg bg-white hover:bg-primary-50 border border-ink-200 hover:border-primary-300 flex items-center justify-center shadow-sm transition-all"
                    title="编辑"
                  >
                    <Edit2 size={14} className="text-ink-500 hover:text-primary-600" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteClick(contact, e)}
                    className="w-8 h-8 rounded-lg bg-white hover:bg-red-50 border border-ink-200 hover:border-red-300 flex items-center justify-center shadow-sm transition-all"
                    title="删除"
                  >
                    <Trash2 size={14} className="text-ink-500 hover:text-red-500" />
                  </button>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-200 to-secondary-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {contact.avatar ? (
                      <img
                        src={contact.avatar}
                        alt={contact.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-ink-600">
                        {contact.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pr-16">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg text-ink-900 group-hover:text-primary-600 transition-colors">
                          {contact.name}
                        </h3>
                        <p className="text-sm text-ink-500">{contact.relation}</p>
                      </div>
                      {birthday && birthday.daysUntil <= 14 && (
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            birthday.daysUntil <= 7
                              ? 'bg-accent-100 text-accent-700'
                              : 'bg-secondary-100 text-secondary-700'
                          }`}
                        >
                          {birthday.daysUntil === 0
                            ? '今天生日！'
                            : `${birthday.daysUntil}天后生日`}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-sm text-ink-500">
                      {contact.phone && (
                        <span className="flex items-center gap-1">
                          <Phone size={14} />
                          {contact.phone}
                        </span>
                      )}
                      {contact.email && (
                        <span className="flex items-center gap-1">
                          <Mail size={14} />
                          {contact.email}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-3">
                      {contact.likes.length > 0 && (
                        <span className="flex items-center gap-1 text-xs text-ink-500">
                          <Heart size={14} className="text-primary-500" />
                          {contact.likes.slice(0, 3).join('、')}
                          {contact.likes.length > 3 && '...'}
                        </span>
                      )}
                      {contact.allergies.length > 0 && (
                        <span className="flex items-center gap-1 text-xs text-ink-500">
                          <AlertTriangle size={14} className="text-accent-500" />
                          过敏: {contact.allergies.join('、')}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <span className="flex items-center gap-1 text-xs text-ink-400">
                        <Calendar size={12} />
                        {contactAnniversaries.length} 个纪念日
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(contact);
                        }}
                        className="ml-auto text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        查看详情 →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <ContactFormModal
          contact={editingContact}
          onClose={() => {
            setShowModal(false);
            setEditingContact(null);
          }}
          onSave={(contactData) => {
            if (editingContact) {
              updateContact(editingContact.id, contactData);
            } else {
              addContact(contactData);
            }
            setShowModal(false);
            setEditingContact(null);
          }}
        />
      )}

      {showDeleteConfirm && contactToDelete && (
        <DeleteConfirmModal
          contact={contactToDelete}
          onClose={() => {
            setShowDeleteConfirm(false);
            setContactToDelete(null);
          }}
          onConfirm={confirmDelete}
        />
      )}

      {selectedContact && (
        <ContactDetailModal
          contact={selectedContact}
          onClose={() => setSelectedContact(null)}
          onEdit={() => handleEdit(selectedContact)}
          onDelete={() => handleDeleteClick(selectedContact)}
          onViewDetails={() => handleViewDetails(selectedContact)}
        />
      )}
    </div>
  );
}

function ContactFormModal({
  contact,
  onClose,
  onSave,
}: {
  contact: Contact | null;
  onClose: () => void;
  onSave: (
    contact: Omit<Contact, 'id' | 'userId' | 'createdAt'>
  ) => void;
}) {
  const [formData, setFormData] = useState({
    name: contact?.name || '',
    relation: contact?.relation || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    notes: contact?.notes || '',
    likes: contact?.likes || [],
    dislikes: contact?.dislikes || [],
    allergies: contact?.allergies || [],
    dietaryRestrictions: contact?.dietaryRestrictions || [],
    sizes: contact?.sizes || [],
  });

  const [likeInput, setLikeInput] = useState('');
  const [dislikeInput, setDislikeInput] = useState('');
  const [allergyInput, setAllergyInput] = useState('');
  const [dietInput, setDietInput] = useState('');
  const [sizeType, setSizeType] = useState('');
  const [sizeValue, setSizeValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.relation) return;
    onSave(formData);
  };

  const addTag = (list: 'likes' | 'dislikes' | 'allergies' | 'dietaryRestrictions', value: string) => {
    if (!value.trim()) return;
    setFormData((prev) => ({
      ...prev,
      [list]: [...prev[list], value.trim()],
    }));
  };

  const removeTag = (list: 'likes' | 'dislikes' | 'allergies' | 'dietaryRestrictions', index: number) => {
    setFormData((prev) => ({
      ...prev,
      [list]: prev[list].filter((_, i) => i !== index),
    }));
  };

  const addSize = () => {
    if (!sizeType.trim() || !sizeValue.trim()) return;
    setFormData((prev) => ({
      ...prev,
      sizes: [...prev.sizes, { type: sizeType.trim(), value: sizeValue.trim() }],
    }));
    setSizeType('');
    setSizeValue('');
  };

  const removeSize = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index),
    }));
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-ink-100 p-6 flex items-center justify-between">
          <h2 className="font-display font-bold text-xl text-ink-900">
            {contact ? '编辑联系人' : '添加新联系人'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-ink-100 flex items-center justify-center"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">
                姓名 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="input-field"
                placeholder="请输入姓名"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">
                关系 *
              </label>
              <input
                type="text"
                value={formData.relation}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, relation: e.target.value }))
                }
                className="input-field"
                placeholder="如：父亲、母亲、朋友"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">
                手机号
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                className="input-field"
                placeholder="请输入手机号"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">
                邮箱
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                className="input-field"
                placeholder="请输入邮箱"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">
              备注
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              className="input-field h-20 resize-none"
              placeholder="其他需要记住的信息..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">
              喜欢的东西 <span className="text-primary-500">❤️</span>
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={likeInput}
                onChange={(e) => setLikeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag('likes', likeInput);
                    setLikeInput('');
                  }
                }}
                className="input-field"
                placeholder="输入后按回车添加"
              />
              <button
                type="button"
                onClick={() => {
                  addTag('likes', likeInput);
                  setLikeInput('');
                }}
                className="btn-secondary"
              >
                添加
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.likes.map((like, i) => (
                <span key={i} className="tag">
                  {like}
                  <button
                    type="button"
                    onClick={() => removeTag('likes', i)}
                    className="ml-1 hover:text-primary-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">
              不喜欢的东西
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={dislikeInput}
                onChange={(e) => setDislikeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag('dislikes', dislikeInput);
                    setDislikeInput('');
                  }
                }}
                className="input-field"
                placeholder="输入后按回车添加"
              />
              <button
                type="button"
                onClick={() => {
                  addTag('dislikes', dislikeInput);
                  setDislikeInput('');
                }}
                className="btn-secondary"
              >
                添加
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.dislikes.map((dislike, i) => (
                <span key={i} className="tag bg-ink-100 text-ink-600">
                  {dislike}
                  <button
                    type="button"
                    onClick={() => removeTag('dislikes', i)}
                    className="ml-1 hover:text-ink-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">
              过敏信息 <span className="text-accent-600">⚠️</span>
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={allergyInput}
                onChange={(e) => setAllergyInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag('allergies', allergyInput);
                    setAllergyInput('');
                  }
                }}
                className="input-field"
                placeholder="输入后按回车添加"
              />
              <button
                type="button"
                onClick={() => {
                  addTag('allergies', allergyInput);
                  setAllergyInput('');
                }}
                className="btn-secondary"
              >
                添加
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.allergies.map((allergy, i) => (
                <span key={i} className="tag tag-accent">
                  {allergy}
                  <button
                    type="button"
                    onClick={() => removeTag('allergies', i)}
                    className="ml-1 hover:text-accent-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">
              饮食禁忌
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={dietInput}
                onChange={(e) => setDietInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag('dietaryRestrictions', dietInput);
                    setDietInput('');
                  }
                }}
                className="input-field"
                placeholder="输入后按回车添加"
              />
              <button
                type="button"
                onClick={() => {
                  addTag('dietaryRestrictions', dietInput);
                  setDietInput('');
                }}
                className="btn-secondary"
              >
                添加
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.dietaryRestrictions.map((diet, i) => (
                <span key={i} className="tag tag-secondary">
                  {diet}
                  <button
                    type="button"
                    onClick={() => removeTag('dietaryRestrictions', i)}
                    className="ml-1 hover:text-secondary-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">
              尺码信息
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={sizeType}
                onChange={(e) => setSizeType(e.target.value)}
                className="input-field flex-1"
                placeholder="类型：如上衣"
              />
              <input
                type="text"
                value={sizeValue}
                onChange={(e) => setSizeValue(e.target.value)}
                className="input-field flex-1"
                placeholder="尺码：如XL"
              />
              <button
                type="button"
                onClick={addSize}
                className="btn-secondary"
              >
                添加
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {formData.sizes.map((size, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 bg-ink-50 rounded-lg"
                >
                  <div>
                    <p className="text-xs text-ink-500">{size.type}</p>
                    <p className="text-sm font-medium text-ink-800">{size.value}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSize(i)}
                    className="text-ink-400 hover:text-red-500"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-ink-100">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">
              取消
            </button>
            <button type="submit" className="btn-primary flex-1">
              {contact ? '保存修改' : '保存联系人'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirmModal({
  contact,
  onClose,
  onConfirm,
}: {
  contact: Contact;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md animate-scale-in">
        <div className="p-6 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4">
            <Trash2 size={32} className="text-red-500" />
          </div>
          <h3 className="font-display font-bold text-xl text-ink-900 mb-2">
            确认删除联系人
          </h3>
          <p className="text-ink-600 mb-2">
            确定要删除 <span className="font-semibold text-primary-600">{contact.name}</span> 吗？
          </p>
          <p className="text-sm text-ink-400 mb-6">
            此操作将同时删除该联系人的所有纪念日和送礼记录，且无法恢复。
          </p>
          <div className="flex gap-3">
            <button onClick={onClose} className="btn-ghost flex-1">
              取消
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 px-5 rounded-xl transition-colors"
            >
              确认删除
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactDetailModal({
  contact,
  onClose,
  onEdit,
  onDelete,
  onViewDetails,
}: {
  contact: Contact;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onViewDetails: () => void;
}) {
  const { anniversaries, giftHistory } = useAppStore();

  const contactAnniversaries = anniversaries.filter(
    (a) => a.contactId === contact.id
  );
  const contactHistory = giftHistory.filter(
    (gh) => gh.contactId === contact.id
  );

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-ink-100 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-200 to-secondary-200 flex items-center justify-center overflow-hidden">
              {contact.avatar ? (
                <img
                  src={contact.avatar}
                  alt={contact.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-ink-600">
                  {contact.name.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-ink-900">
                {contact.name}
              </h2>
              <p className="text-ink-500">{contact.relation}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="w-10 h-10 rounded-xl hover:bg-primary-50 flex items-center justify-center transition-colors"
              title="编辑"
            >
              <Edit2 size={20} className="text-ink-500" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="w-10 h-10 rounded-xl hover:bg-red-50 flex items-center justify-center transition-colors"
              title="删除"
            >
              <Trash2 size={20} className="text-ink-500" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-xl hover:bg-ink-100 flex items-center justify-center transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {contactAnniversaries.length > 0 && (
            <div>
              <h3 className="font-semibold text-ink-800 mb-3 flex items-center gap-2">
                <Calendar size={18} className="text-primary-500" />
                重要纪念日
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {contactAnniversaries.map((a) => {
                  const nextDate = getNextAnniversary(a.date, a.recurring);
                  const daysUntil = getDaysUntil(nextDate);
                  return (
                    <div
                      key={a.id}
                      className="p-3 rounded-xl bg-primary-50 border border-primary-100"
                    >
                      <p className="font-medium text-ink-800">{a.name}</p>
                      <p className="text-sm text-ink-500">
                        {formatDateShort(nextDate)}
                      </p>
                      <span className="text-xs text-primary-600 font-medium">
                        {daysUntil === 0 ? '就是今天！' : `${daysUntil}天后`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {contact.likes.length > 0 && (
            <div>
              <h3 className="font-semibold text-ink-800 mb-3 flex items-center gap-2">
                <Heart size={18} className="text-primary-500" />
                喜欢的东西
              </h3>
              <div className="flex flex-wrap gap-2">
                {contact.likes.map((like, i) => (
                  <span key={i} className="tag">
                    {like}
                  </span>
                ))}
              </div>
            </div>
          )}

          {contact.allergies.length > 0 && (
            <div>
              <h3 className="font-semibold text-ink-800 mb-3 flex items-center gap-2">
                <AlertTriangle size={18} className="text-accent-500" />
                过敏信息
              </h3>
              <div className="flex flex-wrap gap-2">
                {contact.allergies.map((allergy, i) => (
                  <span key={i} className="tag tag-accent">
                    {allergy}
                  </span>
                ))}
              </div>
            </div>
          )}

          {contactHistory.length > 0 && (
            <div>
              <h3 className="font-semibold text-ink-800 mb-3 flex items-center gap-2">
                <Gift size={18} className="text-secondary-500" />
                最近送礼记录 ({contactHistory.length}次)
              </h3>
              <div className="space-y-2">
                {contactHistory.slice(0, 3).map((gh) => (
                  <div
                    key={gh.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-ink-50"
                  >
                    <div>
                      <p className="font-medium text-ink-800">{gh.giftName}</p>
                      <p className="text-xs text-ink-500">{gh.occasion}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-primary-600">
                        ¥{gh.price}
                      </p>
                      <p className="text-xs text-ink-400">
                        {formatDateShort(gh.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-ink-100">
            <button
              type="button"
              onClick={onDelete}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              删除联系人
            </button>
            <button type="button" onClick={onClose} className="btn-ghost flex-1">
              关闭
            </button>
            <button type="button" onClick={onEdit} className="btn-secondary flex-1">
              编辑资料
            </button>
            <button type="button" onClick={onViewDetails} className="btn-primary flex-1">
              查看完整档案
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
