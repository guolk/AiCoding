import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Gift, Bell, Megaphone, Send, Check, User, Phone, Calendar, Plus, X, Trash2 } from 'lucide-react';
import { useMarketingStore } from '@/stores/useMarketingStore';
import { useMemberStore } from '@/stores/useMemberStore';
import { useCardStore } from '@/stores/useCardStore';
import { getToday, getDaysBetween } from '@/utils/date';
import { Modal } from '@/components/Modal/Modal';
import type { MarketingType } from '@/types/marketing';

export const Marketing = () => {
  const { marketings, addMarketing, sendMarketing, cancelMarketing } = useMarketingStore();
  const { members } = useMemberStore();
  const { memberCards, cardTypes } = useCardStore();
  const [activeTab, setActiveTab] = useState<'birthday' | 'renewal' | 'activity'>('birthday');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMarketing, setNewMarketing] = useState({
    memberId: '',
    type: 'activity' as MarketingType,
    content: '',
    scheduledDate: getToday(),
  });

  const todayBirthdays = useMemo(() => {
    const today = getToday();
    const todayMonthDay = today.slice(5);
    return members.filter((m) => {
      if (!m.birthday) return false;
      return m.birthday.slice(5) === todayMonthDay;
    });
  }, [members]);

  const expiringMembers = useMemo(() => {
    const today = getToday();
    const expiring: Array<{
      memberId: string;
      memberName: string;
      memberPhone: string;
      memberPhoto: string;
      memberCardId: string;
      cardName: string;
      daysLeft: number;
      endDate: string;
    }> = [];
    
    memberCards.forEach((card) => {
      if (card.status === 'refunded' || card.status === 'expired' || card.status === 'used_up') return;
      
      const daysLeft = getDaysBetween(today, card.endDate);
      
      if (daysLeft >= 0 && daysLeft <= 14) {
        const member = members.find((m) => m.id === card.memberId);
        const cardType = cardTypes.find((ct) => ct.id === card.cardTypeId);
        expiring.push({
          memberId: card.memberId,
          memberName: member?.name || '未知',
          memberPhone: member?.phone || '',
          memberPhoto: member?.photo || '',
          memberCardId: card.id,
          cardName: cardType?.name || '会员卡',
          daysLeft,
          endDate: card.endDate,
        });
      }
    });
    
    return expiring.sort((a, b) => a.daysLeft - b.daysLeft);
  }, [memberCards, members, cardTypes]);

  const activityNotifications = useMemo(() => {
    return marketings
      .filter((m) => m.type === 'activity')
      .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());
  }, [marketings]);

  const getMemberInfo = (memberId: string) => {
    return members.find((m) => m.id === memberId);
  };

  const handleSendBirthday = (member: typeof members[0]) => {
    if (window.confirm(`确定要给「${member.name}」发送生日祝福吗？`)) {
      addMarketing({
        memberId: member.id,
        type: 'birthday',
        content: `亲爱的${member.name}，祝您生日快乐！身体健康，生活愉快！`,
        scheduledDate: getToday(),
        sentDate: getToday(),
        status: 'sent',
      });
      alert('生日祝福已发送！');
    }
  };

  const handleSendRenewal = (memberId: string, memberName: string) => {
    if (window.confirm(`确定要给「${memberName}」发送续费提醒吗？`)) {
      addMarketing({
        memberId,
        type: 'renewal',
        content: `尊敬的${memberName}，您的会员卡即将到期，欢迎及时续费！`,
        scheduledDate: getToday(),
        sentDate: getToday(),
        status: 'sent',
      });
      alert('续费提醒已发送！');
    }
  };

  const handleAddActivity = () => {
    if (!newMarketing.memberId || !newMarketing.content) {
      alert('请选择会员并填写通知内容');
      return;
    }
    addMarketing({
      ...newMarketing,
      status: 'pending',
    });
    setShowAddModal(false);
    setNewMarketing({
      memberId: '',
      type: 'activity',
      content: '',
      scheduledDate: getToday(),
    });
    alert('活动通知已创建！');
  };

  const handleSendActivity = (id: string) => {
    sendMarketing(id);
    alert('通知已发送！');
  };

  const handleCancelActivity = (id: string) => {
    if (window.confirm('确定要取消这条通知吗？')) {
      cancelMarketing(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">营销管理</h1>
          <p className="text-slate-500 mt-1">生日祝福、续费提醒和活动通知管理</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          新建通知
        </button>
      </div>

      <div className="bg-white rounded-2xl p-1 shadow-sm border border-slate-100 inline-flex">
        {[
          { key: 'birthday' as const, label: '生日祝福', icon: Gift, count: todayBirthdays.length },
          { key: 'renewal' as const, label: '续费提醒', icon: Bell, count: expiringMembers.length },
          { key: 'activity' as const, label: '活动通知', icon: Megaphone, count: activityNotifications.length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.count > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.key ? 'bg-white/20' : 'bg-slate-100'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'birthday' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800">今日生日</h3>
            <span className="text-sm text-slate-500">{getToday()}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todayBirthdays.map((member) => (
              <div
                key={member.id}
                className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-16 h-16 rounded-xl object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://img.icons8.com/color/96/user-male-circle--v1.png';
                      }}
                    />
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Gift className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">{member.name}</h4>
                    <p className="text-sm text-slate-500">{member.phone}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleSendBirthday(member)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  <Send className="w-4 h-4" />
                  发送生日祝福
                </button>
              </div>
            ))}
            {todayBirthdays.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-400">
                <Gift className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>今天没有会员生日</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'renewal' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">即将到期会员（14天内）</h3>
          
          <div className="space-y-4">
            {expiringMembers.map((item) => (
              <div
                key={item.memberCardId}
                className={`p-5 rounded-2xl border transition-all hover:shadow-md ${
                  item.daysLeft <= 3
                    ? 'bg-rose-50 border-rose-100'
                    : item.daysLeft <= 7
                    ? 'bg-orange-50 border-orange-100'
                    : 'bg-blue-50 border-blue-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img
                      src={item.memberPhoto}
                      alt={item.memberName}
                      className="w-14 h-14 rounded-xl object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://img.icons8.com/color/96/user-male-circle--v1.png';
                      }}
                    />
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-slate-800">{item.memberName}</h4>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          item.daysLeft <= 3
                            ? 'bg-rose-100 text-rose-700'
                            : item.daysLeft <= 7
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          剩{item.daysLeft}天
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {item.memberPhone}
                        </span>
                        <span>{item.cardName}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          到期: {item.endDate}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/members/${item.memberId}`}
                      className="flex items-center gap-1 px-4 py-2 bg-white text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm"
                    >
                      <User className="w-4 h-4" />
                      查看
                    </Link>
                    <button
                      onClick={() => handleSendRenewal(item.memberId, item.memberName)}
                      className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all text-sm"
                    >
                      <Send className="w-4 h-4" />
                      发送提醒
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {expiringMembers.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>暂无即将到期的会员</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">活动通知</h3>
          
          <div className="space-y-4">
            {activityNotifications.map((marketing) => {
              const member = getMemberInfo(marketing.memberId);
              return (
                <div
                  key={marketing.id}
                  className="p-5 bg-slate-50 rounded-2xl border border-slate-100"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <img
                        src={member?.photo}
                        alt={member?.name}
                        className="w-12 h-12 rounded-xl object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://img.icons8.com/color/96/user-male-circle--v1.png';
                        }}
                      />
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-slate-800">{member?.name || '未知'}</h4>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            marketing.status === 'sent'
                              ? 'bg-emerald-100 text-emerald-700'
                              : marketing.status === 'cancelled'
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-cyan-100 text-cyan-700'
                          }`}>
                            {marketing.status === 'sent' ? '已发送' : marketing.status === 'cancelled' ? '已取消' : '待发送'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mt-2">{marketing.content}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          计划发送: {marketing.scheduledDate}
                          {marketing.sentDate && ` · 已发送: ${marketing.sentDate}`}
                        </p>
                      </div>
                    </div>
                    {marketing.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSendActivity(marketing.id)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleCancelActivity(marketing.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {activityNotifications.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <Megaphone className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>暂无活动通知</p>
                <p className="text-sm mt-1">点击右上角按钮创建新通知</p>
              </div>
            )}
          </div>
        </div>
      )}

      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setNewMarketing({
            memberId: '',
            type: 'activity',
            content: '',
            scheduledDate: getToday(),
          });
        }}
        title="新建通知"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              选择会员 <span className="text-rose-500">*</span>
            </label>
            <select
              value={newMarketing.memberId}
              onChange={(e) => setNewMarketing({ ...newMarketing, memberId: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all"
            >
              <option value="">请选择会员</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} - {member.phone}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              通知类型 <span className="text-rose-500">*</span>
            </label>
            <select
              value={newMarketing.type}
              onChange={(e) => setNewMarketing({ ...newMarketing, type: e.target.value as MarketingType })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all"
            >
              <option value="activity">活动通知</option>
              <option value="birthday">生日祝福</option>
              <option value="renewal">续费提醒</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              计划发送日期 <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={newMarketing.scheduledDate}
              onChange={(e) => setNewMarketing({ ...newMarketing, scheduledDate: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              通知内容 <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={newMarketing.content}
              onChange={(e) => setNewMarketing({ ...newMarketing, content: e.target.value })}
              rows={4}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all"
              placeholder="请输入通知内容..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setShowAddModal(false);
                setNewMarketing({
                  memberId: '',
                  type: 'activity',
                  content: '',
                  scheduledDate: getToday(),
                });
              }}
              className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleAddActivity}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all"
            >
              创建
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
