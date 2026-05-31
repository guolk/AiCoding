import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Camera, User, Phone, Calendar, AlertCircle, FileText, Plus, Edit2 } from 'lucide-react';
import { useMemberStore } from '@/stores/useMemberStore';
import { useCardStore } from '@/stores/useCardStore';
import { useCheckinStore } from '@/stores/useCheckinStore';
import { formatDateTime, getToday } from '@/utils/date';
import type { MemberFormData } from '@/types/member';

export const MemberForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addMember, updateMember, getMemberById } = useMemberStore();
  const { getMemberCardsByMemberId, cardTypes, createMemberCard } = useCardStore();
  const { getCheckinsByMemberId } = useCheckinStore();

  const isEdit = !!id && id !== 'new';
  const existingMember = isEdit ? getMemberById(id!) : null;

  const [formData, setFormData] = useState<MemberFormData>({
    name: '',
    phone: '',
    emergencyContact: '',
    emergencyPhone: '',
    joinDate: getToday(),
    recommender: '',
    photo: '',
    medicalNotes: '',
    preferences: '',
    notes: '',
    birthday: '',
  });

  const [selectedCardType, setSelectedCardType] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'info' | 'cards' | 'checkins' | 'notes'>('info');

  useEffect(() => {
    if (existingMember) {
      setFormData({
        name: existingMember.name,
        phone: existingMember.phone,
        emergencyContact: existingMember.emergencyContact,
        emergencyPhone: existingMember.emergencyPhone,
        joinDate: existingMember.joinDate,
        recommender: existingMember.recommender,
        photo: existingMember.photo,
        medicalNotes: existingMember.medicalNotes,
        preferences: existingMember.preferences,
        notes: existingMember.notes,
        birthday: existingMember.birthday || '',
      });
    }
  }, [existingMember]);

  const memberCards = id ? getMemberCardsByMemberId(id) : [];
  const checkins = id ? getCheckinsByMemberId(id) : [];

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('请填写必填项：姓名和手机号');
      return;
    }

    setSubmitting(true);

    try {
      if (isEdit && id) {
        updateMember(id, formData);
        alert('会员信息更新成功！');
      } else {
        const newMember = addMember(formData);
        if (selectedCardType) {
          createMemberCard(newMember.id, selectedCardType);
        }
        alert('会员创建成功！');
      }
      
      navigate('/members');
    } catch (err) {
      alert('操作失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateCard = () => {
    if (!id || !selectedCardType) return;
    createMemberCard(id, selectedCardType);
    setSelectedCardType('');
    alert('会员卡创建成功！');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/members')}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {isEdit ? '编辑会员' : '新增会员'}
          </h1>
          <p className="text-slate-500 mt-1">
            {isEdit ? '编辑会员档案信息' : '录入新会员基本信息'}
          </p>
        </div>
      </div>

      {isEdit ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 sticky top-6">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <img
                    src={formData.photo || 'https://img.icons8.com/color/96/user-male-circle--v1.png'}
                    alt={formData.name}
                    className="w-24 h-24 rounded-2xl object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://img.icons8.com/color/96/user-male-circle--v1.png';
                    }}
                  />
                  <label className="absolute bottom-0 right-0 p-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg cursor-pointer hover:shadow-lg transition-all">
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                  </label>
                </div>
                <h2 className="mt-4 text-xl font-bold text-slate-800">{formData.name}</h2>
                <p className="text-slate-500">{formData.phone}</p>
              </div>

              <div className="mt-6 space-y-2">
                {[
                  { key: 'info', label: '基本信息', icon: User },
                  { key: 'cards', label: '会员卡', icon: Edit2 },
                  { key: 'checkins', label: '签到记录', icon: Calendar },
                  { key: 'notes', label: '备注信息', icon: FileText },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeTab === key
                        ? 'bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-600 font-medium'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            {activeTab === 'info' && (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-semibold text-slate-800 mb-6">基本信息</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      姓名 <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all"
                      placeholder="请输入姓名"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      手机号 <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all"
                      placeholder="请输入手机号"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">生日</label>
                    <input
                      type="date"
                      value={formData.birthday}
                      onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">加入时间</label>
                    <input
                      type="date"
                      value={formData.joinDate}
                      onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">紧急联系人</label>
                    <input
                      type="text"
                      value={formData.emergencyContact}
                      onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all"
                      placeholder="请输入紧急联系人"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">紧急联系电话</label>
                    <input
                      type="tel"
                      value={formData.emergencyPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all"
                      placeholder="请输入紧急联系电话"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">推荐人</label>
                    <input
                      type="text"
                      value={formData.recommender}
                      onChange={(e) => setFormData({ ...formData, recommender: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all"
                      placeholder="请输入推荐人"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <span className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-500" />
                      医疗禁忌
                    </span>
                  </label>
                  <textarea
                    value={formData.medicalNotes}
                    onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all"
                    placeholder="如：高血压、心脏病、过敏史等..."
                  />
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">偏好</label>
                  <textarea
                    value={formData.preferences}
                    onChange={(e) => setFormData({ ...formData, preferences: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all"
                    placeholder="如：偏好私教课、周末有空等..."
                  />
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">备注</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all"
                    placeholder="其他备注信息..."
                  />
                </div>

                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => navigate('/members')}
                    className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    {submitting ? '保存中...' : '保存'}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'cards' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-slate-800">会员卡</h3>
                  <div className="flex gap-2">
                    <select
                      value={selectedCardType}
                      onChange={(e) => setSelectedCardType(e.target.value)}
                      className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                    >
                      <option value="">选择卡型</option>
                      {cardTypes.filter((ct) => ct.isActive).map((ct) => (
                        <option key={ct.id} value={ct.id}>{ct.name} - ¥{ct.price}</option>
                      ))}
                    </select>
                    <button
                      onClick={handleCreateCard}
                      disabled={!selectedCardType}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      办卡
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {memberCards.map((card) => {
                    const cardType = cardTypes.find((ct) => ct.id === card.cardTypeId);
                    return (
                      <Link
                        key={card.id}
                        to={`/cards`}
                        className="block p-5 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-slate-800">{cardType?.name}</h4>
                            <p className="text-sm text-slate-500 mt-1">{card.cardNumber}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                            card.status === 'active' ? 'bg-emerald-100 text-emerald-600' :
                            card.status === 'paused' ? 'bg-yellow-100 text-yellow-600' :
                            card.status === 'expired' ? 'bg-rose-100 text-rose-600' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {card.status === 'active' ? '正常' :
                             card.status === 'paused' ? '已暂停' :
                             card.status === 'expired' ? '已过期' :
                             card.status === 'used_up' ? '已用完' : '已退卡'}
                          </span>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-slate-500">有效期</p>
                            <p className="font-medium text-slate-700">{card.startDate} ~ {card.endDate}</p>
                          </div>
                          {card.remainingCount !== undefined && (
                            <div>
                              <p className="text-slate-500">剩余次数</p>
                              <p className="font-medium text-slate-700">{card.remainingCount} 次</p>
                            </div>
                          )}
                          {card.totalAmount !== undefined && (
                            <div>
                              <p className="text-slate-500">余额</p>
                              <p className="font-medium text-slate-700">¥{(card.totalAmount - (card.usedAmount || 0)).toFixed(2)}</p>
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                  {memberCards.length === 0 && (
                    <div className="col-span-2 text-center py-12 text-slate-400">
                      <Edit2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>暂无会员卡</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'checkins' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-semibold text-slate-800 mb-6">签到记录</h3>
                <div className="space-y-3">
                  {checkins.slice(0, 20).map((checkin) => (
                    <div key={checkin.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-xl flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-cyan-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">
                            {checkin.checkinMethod === 'manual' ? '手动签到' :
                             checkin.checkinMethod === 'qr' ? '扫码签到' : '人脸识别'}
                          </p>
                          <p className="text-sm text-slate-500">
                            消耗 {checkin.consumedCount} 次
                          </p>
                        </div>
                      </div>
                      <span className="text-sm text-slate-500">{formatDateTime(checkin.checkinTime)}</span>
                    </div>
                  ))}
                  {checkins.length === 0 && (
                    <div className="text-center py-12 text-slate-400">
                      <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>暂无签到记录</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-semibold text-slate-800 mb-6">备注信息</h3>
                
                {formData.medicalNotes && (
                  <div className="mb-6 p-4 bg-rose-50 rounded-xl border border-rose-100">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-rose-500" />
                      <span className="font-medium text-rose-800">医疗禁忌</span>
                    </div>
                    <p className="text-rose-700">{formData.medicalNotes}</p>
                  </div>
                )}

                {formData.preferences && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-5 h-5 text-blue-500" />
                      <span className="font-medium text-blue-800">偏好</span>
                    </div>
                    <p className="text-blue-700">{formData.preferences}</p>
                  </div>
                )}

                {formData.notes && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-slate-500" />
                      <span className="font-medium text-slate-800">备注</span>
                    </div>
                    <p className="text-slate-700">{formData.notes}</p>
                  </div>
                )}

                {!formData.medicalNotes && !formData.preferences && !formData.notes && (
                  <div className="text-center py-12 text-slate-400">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>暂无备注信息</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">基本信息</h3>
          
          <div className="flex items-start gap-8 mb-8">
            <div className="relative">
              <img
                src={formData.photo || 'https://img.icons8.com/color/96/user-male-circle--v1.png'}
                alt="会员照片"
                className="w-32 h-32 rounded-2xl object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://img.icons8.com/color/96/user-male-circle--v1.png';
                }}
              />
              <label className="absolute bottom-0 right-0 p-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl cursor-pointer hover:shadow-lg transition-all">
                <Camera className="w-5 h-5" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </label>
            </div>
            <div className="flex-1 pt-2">
              <p className="text-sm text-slate-500">上传会员照片，便于前台快速识别</p>
              <p className="text-xs text-slate-400 mt-1">支持 JPG、PNG 格式</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                姓名 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all"
                placeholder="请输入姓名"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                手机号 <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all"
                placeholder="请输入手机号"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">生日</label>
              <input
                type="date"
                value={formData.birthday}
                onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">加入时间</label>
              <input
                type="date"
                value={formData.joinDate}
                onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">紧急联系人</label>
              <input
                type="text"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all"
                placeholder="请输入紧急联系人"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">紧急联系电话</label>
              <input
                type="tel"
                value={formData.emergencyPhone}
                onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all"
                placeholder="请输入紧急联系电话"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">推荐人</label>
              <input
                type="text"
                value={formData.recommender}
                onChange={(e) => setFormData({ ...formData, recommender: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all"
                placeholder="请输入推荐人"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">会员卡（可选）</label>
              <select
                value={selectedCardType}
                onChange={(e) => setSelectedCardType(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all"
              >
                <option value="">暂不办卡</option>
                {cardTypes.filter((ct) => ct.isActive).map((ct) => (
                  <option key={ct.id} value={ct.id}>{ct.name} - ¥{ct.price}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <span className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500" />
                医疗禁忌
              </span>
            </label>
            <textarea
              value={formData.medicalNotes}
              onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
              rows={2}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all"
              placeholder="如：高血压、心脏病、过敏史等..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">偏好</label>
              <textarea
                value={formData.preferences}
                onChange={(e) => setFormData({ ...formData, preferences: e.target.value })}
                rows={2}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all"
                placeholder="如：偏好私教课、周末有空等..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">备注</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all"
                placeholder="其他备注信息..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/members')}
              className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {submitting ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
