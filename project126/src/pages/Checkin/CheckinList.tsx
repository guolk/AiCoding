import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, BarChart3, AlertTriangle, ScanLine, User } from 'lucide-react';
import { useCheckinStore } from '@/stores/useCheckinStore';
import { useMemberStore } from '@/stores/useMemberStore';
import { useCardStore } from '@/stores/useCardStore';
import { formatDateTime, getToday, getDaysBetween } from '@/utils/date';
import { Modal } from '@/components/Modal/Modal';
import type { CheckinMethod } from '@/types/checkin';

export const CheckinList = () => {
  const { checkins, addCheckin, getTodayCheckins } = useCheckinStore();
  const { members } = useMemberStore();
  const { memberCards, cardTypes } = useCardStore();
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [checkinMethod, setCheckinMethod] = useState<CheckinMethod>('manual');
  const [searchKeyword, setSearchKeyword] = useState('');

  const filteredCheckins = checkins.filter((checkin) => {
    if (!searchKeyword) return true;
    const member = members.find((m) => m.id === checkin.memberId);
    return member?.name.includes(searchKeyword) || member?.phone.includes(searchKeyword);
  });

  const todayCheckins = getTodayCheckins();

  const activeMemberCards = selectedMember
    ? memberCards.filter((mc) => mc.memberId === selectedMember && mc.status === 'active')
    : [];

  const handleCheckin = () => {
    if (!selectedMember || activeMemberCards.length === 0) {
      alert('请选择会员和有效的会员卡');
      return;
    }

    const activeCard = activeMemberCards[0];
    
    addCheckin({
      memberId: selectedMember,
      memberCardId: activeCard.id,
      checkinMethod,
      notes: '',
    });

    setShowCheckinModal(false);
    setSelectedMember('');
    setCheckinMethod('manual');
    alert('签到成功！');
  };

  const getMemberInfo = (memberId: string) => {
    return members.find((m) => m.id === memberId);
  };

  const getCardInfo = (cardId: string) => {
    const card = memberCards.find((mc) => mc.id === cardId);
    if (!card) return null;
    const cardType = cardTypes.find((ct) => ct.id === card.cardTypeId);
    return { card, cardType };
  };

  const getMethodLabel = (method: CheckinMethod) => {
    switch (method) {
      case 'manual': return '手动签到';
      case 'qr': return '扫码签到';
      case 'face': return '人脸识别';
      default: return method;
    }
  };

  const stats = {
    today: todayCheckins.length,
    thisWeek: checkins.filter((c) => {
      const checkinDate = new Date(c.checkinTime);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return checkinDate >= weekAgo;
    }).length,
    thisMonth: checkins.filter((c) => {
      const checkinDate = new Date(c.checkinTime);
      const now = new Date();
      return checkinDate.getMonth() === now.getMonth() && checkinDate.getFullYear() === now.getFullYear();
    }).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">签到管理</h1>
          <p className="text-slate-500 mt-1">管理会员签到记录和活跃情况</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/checkin/analysis"
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            活跃度分析
          </Link>
          <Link
            to="/checkin/warning"
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-100 transition-colors"
          >
            <AlertTriangle className="w-4 h-4" />
            到期预警
          </Link>
          <button
            onClick={() => setShowCheckinModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
          >
            <ScanLine className="w-4 h-4" />
            快速签到
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500">今日签到</p>
          <p className="text-3xl font-bold text-slate-800 mt-2">{stats.today}</p>
          <p className="text-sm text-slate-400 mt-1">人次</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500">本周签到</p>
          <p className="text-3xl font-bold text-slate-800 mt-2">{stats.thisWeek}</p>
          <p className="text-sm text-slate-400 mt-1">人次</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500">本月签到</p>
          <p className="text-3xl font-bold text-slate-800 mt-2">{stats.thisMonth}</p>
          <p className="text-sm text-slate-400 mt-1">人次</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="搜索会员姓名或手机号..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">会员</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">签到时间</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">签到方式</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">消耗</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">会员卡</th>
              </tr>
            </thead>
            <tbody>
              {filteredCheckins.slice(0, 50).map((checkin) => {
                const member = getMemberInfo(checkin.memberId);
                const cardInfo = getCardInfo(checkin.memberCardId);
                return (
                  <tr key={checkin.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={member?.photo}
                          alt={member?.name}
                          className="w-10 h-10 rounded-xl object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://img.icons8.com/color/96/user-male-circle--v1.png';
                          }}
                        />
                        <div>
                          <p className="font-medium text-slate-800">{member?.name || '未知'}</p>
                          <p className="text-sm text-slate-500">{member?.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-600">
                      {formatDateTime(checkin.checkinTime)}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        checkin.checkinMethod === 'face' ? 'bg-emerald-100 text-emerald-600' :
                        checkin.checkinMethod === 'qr' ? 'bg-blue-100 text-blue-600' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {getMethodLabel(checkin.checkinMethod)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-600">
                      {checkin.consumedCount} 次
                    </td>
                    <td className="py-4 px-4 text-slate-600">
                      {cardInfo?.cardType?.name || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredCheckins.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>暂无签到记录</p>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showCheckinModal}
        onClose={() => {
          setShowCheckinModal(false);
          setSelectedMember('');
        }}
        title="快速签到"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              选择会员 <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all"
            >
              <option value="">请选择会员</option>
              {members
                .filter((m) => memberCards.some((mc) => mc.memberId === m.id && mc.status === 'active'))
                .map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} - {member.phone}
                  </option>
                ))}
            </select>
          </div>

          {selectedMember && (
            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-4">
                <img
                  src={members.find((m) => m.id === selectedMember)?.photo}
                  alt="会员照片"
                  className="w-16 h-16 rounded-xl object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://img.icons8.com/color/96/user-male-circle--v1.png';
                  }}
                />
                <div>
                  <p className="font-medium text-slate-800">
                    {members.find((m) => m.id === selectedMember)?.name}
                  </p>
                  <p className="text-sm text-slate-500">
                    有效会员卡: {activeMemberCards.length} 张
                  </p>
                </div>
              </div>
              {activeMemberCards.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-sm text-slate-600">
                    会员卡: {cardTypes.find((ct) => ct.id === activeMemberCards[0].cardTypeId)?.name}
                  </p>
                  <p className="text-sm text-slate-500">
                    有效期: {activeMemberCards[0].startDate} ~ {activeMemberCards[0].endDate}
                  </p>
                  {activeMemberCards[0].remainingCount !== undefined && (
                    <p className="text-sm text-slate-500">
                      剩余次数: {activeMemberCards[0].remainingCount} 次
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">签到方式</label>
            <div className="flex gap-3">
              {[
                { value: 'manual' as CheckinMethod, label: '手动签到' },
                { value: 'qr' as CheckinMethod, label: '扫码签到' },
                { value: 'face' as CheckinMethod, label: '人脸识别' },
              ].map((method) => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => setCheckinMethod(method.value)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    checkinMethod === method.value
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {method.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setShowCheckinModal(false);
                setSelectedMember('');
              }}
              className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleCheckin}
              disabled={!selectedMember || activeMemberCards.length === 0}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              确认签到
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
