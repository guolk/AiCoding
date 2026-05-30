
import { useState } from 'react';
import {
  ArrowLeft,
  Heart,
  ThumbsDown,
  AlertTriangle,
  Utensils,
  Ruler,
  Gift,
  Calendar,
  Plus,
  X,
  MessageCircle,
  MapPin,
  Edit2,
  Trash2,
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { formatDate, getDaysUntil, getNextAnniversary } from '../utils/date';

export default function ContactDetail() {
  const {
    contacts,
    anniversaries,
    giftHistory,
    selectedContactId,
    setCurrentPage,
    addAnniversary,
    addGiftHistory,
    updateContact,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'preferences' | 'history' | 'anniversaries'>('preferences');
  const [showAddAnniversary, setShowAddAnniversary] = useState(false);
  const [showAddGiftHistory, setShowAddGiftHistory] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const contact = contacts.find((c) => c.id === selectedContactId);

  if (!contact) {
    return (
      <div className="text-center py-12">
        <p className="text-ink-500">未找到联系人</p>
        <button
          onClick={() => setCurrentPage('contacts')}
          className="btn-primary mt-4"
        >
          返回联系人列表
        </button>
      </div>
    );
  }

  const contactAnniversaries = anniversaries.filter(
    (a) => a.contactId === contact.id
  );
  const contactHistory = giftHistory.filter(
    (gh) => gh.contactId === contact.id
  );
  const totalSpent = contactHistory.reduce((sum, gh) => sum + gh.price, 0);

  const anniversaryIcon = (type: string) => {
    switch (type) {
      case 'birthday':
        return '🎂';
      case 'anniversary':
        return '💑';
      case 'holiday':
        return '🎉';
      default:
        return '📅';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setCurrentPage('contacts')}
          className="w-10 h-10 rounded-xl hover:bg-ink-100 flex items-center justify-center"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-display font-bold text-ink-900">
            {contact.name}的档案
          </h1>
          <p className="text-ink-500">{contact.relation}</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="btn-secondary flex items-center gap-2"
        >
          <Edit2 size={16} />
          编辑资料
        </button>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <div className="col-span-1">
          <div className="card">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-200 to-secondary-200 flex items-center justify-center overflow-hidden">
                {contact.avatar ? (
                  <img
                    src={contact.avatar}
                    alt={contact.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold text-ink-600">
                    {contact.name.charAt(0)}
                  </span>
                )}
              </div>
              <h2 className="mt-4 font-display font-semibold text-xl text-ink-900">
                {contact.name}
              </h2>
              <p className="text-ink-500">{contact.relation}</p>

              {contact.phone && (
                <p className="text-sm text-ink-600 mt-2">{contact.phone}</p>
              )}
              {contact.email && (
                <p className="text-sm text-ink-600">{contact.email}</p>
              )}
            </div>

            <div className="divider" />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-500">送礼次数</span>
                <span className="font-semibold text-ink-800">
                  {contactHistory.length}次
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-500">总花费</span>
                <span className="font-semibold text-primary-600">
                  ¥{totalSpent.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-500">纪念日</span>
                <span className="font-semibold text-ink-800">
                  {contactAnniversaries.length}个
                </span>
              </div>
            </div>

            {contact.notes && (
              <>
                <div className="divider" />
                <p className="text-sm text-ink-600 bg-ink-50 rounded-xl p-3">
                  {contact.notes}
                </p>
              </>
            )}
          </div>
        </div>

        <div className="col-span-3">
          <div className="card">
            <div className="flex items-center gap-1 border-b border-ink-100 pb-4 mb-6">
              {[
                { id: 'preferences', label: '偏好设置', icon: <Heart size={18} /> },
                { id: 'history', label: '送礼历史', icon: <Gift size={18} /> },
                { id: 'anniversaries', label: '纪念日', icon: <Calendar size={18} /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() =>
                    setActiveTab(
                      tab.id as 'preferences' | 'history' | 'anniversaries'
                    )
                  }
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-600 font-medium'
                      : 'text-ink-500 hover:bg-ink-50'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-ink-800 mb-3 flex items-center gap-2">
                    <Heart className="text-primary-500" size={20} />
                    喜欢的东西
                  </h3>
                  {contact.likes.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {contact.likes.map((like, i) => (
                        <span key={i} className="tag">
                          {like}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-ink-400">暂无记录</p>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-ink-800 mb-3 flex items-center gap-2">
                    <ThumbsDown className="text-ink-500" size={20} />
                    不喜欢的东西
                  </h3>
                  {contact.dislikes.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {contact.dislikes.map((dislike, i) => (
                        <span key={i} className="tag bg-ink-100 text-ink-600">
                          {dislike}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-ink-400">暂无记录</p>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-ink-800 mb-3 flex items-center gap-2">
                    <AlertTriangle className="text-accent-500" size={20} />
                    过敏信息
                  </h3>
                  {contact.allergies.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {contact.allergies.map((allergy, i) => (
                        <span key={i} className="tag tag-accent">
                          {allergy}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-ink-400">无过敏记录</p>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-ink-800 mb-3 flex items-center gap-2">
                    <Utensils className="text-secondary-500" size={20} />
                    饮食禁忌
                  </h3>
                  {contact.dietaryRestrictions.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {contact.dietaryRestrictions.map((restriction, i) => (
                        <span key={i} className="tag tag-secondary">
                          {restriction}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-ink-400">无特殊要求</p>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-ink-800 mb-3 flex items-center gap-2">
                    <Ruler className="text-ink-500" size={20} />
                    尺码信息
                  </h3>
                  {contact.sizes.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                      {contact.sizes.map((size, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl bg-ink-50 border border-ink-100"
                        >
                          <p className="text-xs text-ink-500">{size.type}</p>
                          <p className="font-medium text-ink-800">{size.value}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-ink-400">暂无尺码记录</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-ink-500">
                    共 {contactHistory.length} 次送礼记录，总花费{' '}
                    <span className="text-primary-600 font-semibold">
                      ¥{totalSpent.toLocaleString()}
                    </span>
                  </p>
                  <button
                    onClick={() => setShowAddGiftHistory(true)}
                    className="btn-secondary text-sm py-1.5 px-3 flex items-center gap-1"
                  >
                    <Plus size={16} />
                    添加记录
                  </button>
                </div>

                {contactHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <Gift className="w-12 h-12 text-ink-300 mx-auto mb-3" />
                    <p className="text-ink-500">还没有送礼记录</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {contactHistory.map((gh) => (
                      <div
                        key={gh.id}
                        className="p-4 rounded-xl bg-gradient-to-br from-ink-50 to-warm-50 border border-ink-100"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h4 className="font-medium text-ink-800">
                                {gh.giftName}
                              </h4>
                              <span className="text-primary-600 font-semibold">
                                ¥{gh.price}
                              </span>
                            </div>
                            <p className="text-sm text-ink-500 mt-1">
                              {gh.occasion} · {formatDate(gh.date)}
                            </p>
                            {gh.notes && (
                              <p className="text-sm text-ink-600 mt-2 bg-white/60 rounded-lg p-2">
                                📝 {gh.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="mt-3 flex items-start gap-2 p-3 bg-secondary-50 rounded-lg">
                          <MessageCircle className="text-secondary-500 flex-shrink-0 mt-0.5" size={16} />
                          <div>
                            <p className="text-xs text-ink-500 mb-1">对方反应</p>
                            <p className="text-sm text-ink-700">{gh.reaction}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'anniversaries' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-ink-500">
                    共 {contactAnniversaries.length} 个重要纪念日
                  </p>
                  <button
                    onClick={() => setShowAddAnniversary(true)}
                    className="btn-secondary text-sm py-1.5 px-3 flex items-center gap-1"
                  >
                    <Plus size={16} />
                    添加纪念日
                  </button>
                </div>

                {contactAnniversaries.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-ink-300 mx-auto mb-3" />
                    <p className="text-ink-500">还没有添加纪念日</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {contactAnniversaries.map((a) => {
                      const nextDate = getNextAnniversary(a.date, a.recurring);
                      const daysUntil = getDaysUntil(nextDate);
                      return (
                        <div
                          key={a.id}
                          className={`p-5 rounded-2xl border ${
                            daysUntil <= 7
                              ? 'bg-accent-50 border-accent-200'
                              : daysUntil <= 30
                              ? 'bg-primary-50 border-primary-100'
                              : 'bg-ink-50 border-ink-100'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-3xl">{anniversaryIcon(a.type)}</span>
                            <div className="flex-1">
                              <h4 className="font-semibold text-ink-800">
                                {a.name}
                              </h4>
                              <p className="text-sm text-ink-500 mt-1">
                                {formatDate(nextDate)}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                {daysUntil <= 0 ? (
                                  <span className="px-2 py-1 bg-primary-500 text-white text-xs font-medium rounded-full">
                                    就是今天！
                                  </span>
                                ) : daysUntil <= 7 ? (
                                  <span className="px-2 py-1 bg-accent-400 text-accent-900 text-xs font-medium rounded-full">
                                    只剩 {daysUntil} 天！
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 bg-ink-200 text-ink-700 text-xs font-medium rounded-full">
                                    {daysUntil} 天后
                                  </span>
                                )}
                                {a.recurring && (
                                  <span className="text-xs text-ink-500">
                                    每年重复
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddAnniversary && (
        <AddAnniversaryModal
          contactId={contact.id}
          onClose={() => setShowAddAnniversary(false)}
          onAdd={(anniversary) => {
            addAnniversary({ ...anniversary, contactId: contact.id });
            setShowAddAnniversary(false);
          }}
        />
      )}

      {showAddGiftHistory && (
        <AddGiftHistoryModal
          contactId={contact.id}
          onClose={() => setShowAddGiftHistory(false)}
          onAdd={(history) => {
            addGiftHistory({ ...history, contactId: contact.id });
            setShowAddGiftHistory(false);
          }}
        />
      )}
    </div>
  );
}

function AddAnniversaryModal({
  contactId,
  onClose,
  onAdd,
}: {
  contactId: string;
  onClose: () => void;
  onAdd: (
    anniversary: Omit<import('../types').Anniversary, 'id' | 'contactId'>
  ) => void;
}) {
  const [formData, setFormData] = useState({
    type: 'birthday' as const,
    name: '生日',
    date: '',
    reminderDays: 14,
    recurring: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date || !formData.name) return;
    onAdd(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md animate-scale-in">
        <div className="p-6 border-b border-ink-100 flex items-center justify-between">
          <h2 className="font-display font-bold text-xl text-ink-900">
            添加纪念日
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-ink-100 flex items-center justify-center"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">
              类型
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  type: e.target.value as any,
                  name:
                    e.target.value === 'birthday'
                      ? '生日'
                      : e.target.value === 'anniversary'
                      ? '纪念日'
                      : e.target.value === 'holiday'
                      ? '节日'
                      : '',
                }))
              }
              className="input-field"
            >
              <option value="birthday">🎂 生日</option>
              <option value="anniversary">💑 纪念日</option>
              <option value="holiday">🎉 节日</option>
              <option value="custom">📅 自定义</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">
              名称
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="input-field"
              placeholder="如：结婚纪念日"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">
              日期
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, date: e.target.value }))
              }
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">
              提前提醒（天）
            </label>
            <input
              type="number"
              value={formData.reminderDays}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  reminderDays: parseInt(e.target.value),
                }))
              }
              className="input-field"
              min={1}
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.recurring}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, recurring: e.target.checked }))
              }
              className="w-4 h-4 rounded"
            />
            <span className="text-sm text-ink-700">每年重复</span>
          </label>

          <div className="flex gap-3 pt-4 border-t border-ink-100">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">
              取消
            </button>
            <button type="submit" className="btn-primary flex-1">
              添加
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddGiftHistoryModal({
  contactId,
  onClose,
  onAdd,
}: {
  contactId: string;
  onClose: () => void;
  onAdd: (history: Omit<import('../types').GiftHistory, 'id' | 'contactId'>) => void;
}) {
  const [formData, setFormData] = useState({
    giftName: '',
    occasion: '',
    date: new Date().toISOString().split('T')[0],
    price: 0,
    reaction: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.giftName || !formData.reaction) return;
    onAdd(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="sticky top-0 bg-white border-b border-ink-100 p-6 flex items-center justify-between">
          <h2 className="font-display font-bold text-xl text-ink-900">
            添加送礼记录
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-ink-100 flex items-center justify-center"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">
              礼物名称 *
            </label>
            <input
              type="text"
              value={formData.giftName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, giftName: e.target.value }))
              }
              className="input-field"
              placeholder="如：茶叶礼盒"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">
              场合
            </label>
            <input
              type="text"
              value={formData.occasion}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, occasion: e.target.value }))
              }
              className="input-field"
              placeholder="如：2026年春节"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">
                送出日期
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, date: e.target.value }))
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">
                价格
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    price: parseFloat(e.target.value),
                  }))
                }
                className="input-field"
                min={0}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">
              对方反应 *
            </label>
            <textarea
              value={formData.reaction}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, reaction: e.target.value }))
              }
              className="input-field h-20 resize-none"
              placeholder="对方收到礼物后的反应..."
              required
            />
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
              className="input-field h-16 resize-none"
              placeholder="其他需要记录的信息..."
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-ink-100">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">
              取消
            </button>
            <button type="submit" className="btn-primary flex-1">
              保存记录
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
