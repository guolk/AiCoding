import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Clock, Phone, User } from 'lucide-react';
import { useCardStore } from '@/stores/useCardStore';
import { useMemberStore } from '@/stores/useMemberStore';
import { getToday, getDaysBetween } from '@/utils/date';

export const CheckinWarning = () => {
  const { memberCards, cardTypes } = useCardStore();
  const { members } = useMemberStore();

  const warningMembers = useMemo(() => {
    const warnings: Array<{
      memberId: string;
      memberName: string;
      memberPhoto: string;
      memberPhone: string;
      memberCardId: string;
      cardName: string;
      cardNumber: string;
      warningType: 'expiring' | 'expired';
      daysLeft: number;
      endDate: string;
    }> = [];
    const today = getToday();
    
    memberCards.forEach((card) => {
      if (card.status === 'refunded' || card.status === 'used_up') return;
      
      const daysLeft = getDaysBetween(today, card.endDate);
      const member = members.find((m) => m.id === card.memberId);
      const cardType = cardTypes.find((ct) => ct.id === card.cardTypeId);
      
      if (daysLeft < 0) {
        warnings.push({
          memberId: card.memberId,
          memberName: member?.name || '未知',
          memberPhoto: member?.photo || '',
          memberPhone: member?.phone || '',
          memberCardId: card.id,
          cardName: cardType?.name || '会员卡',
          cardNumber: card.cardNumber,
          warningType: 'expired',
          daysLeft,
          endDate: card.endDate,
        });
      } else if (daysLeft <= 7) {
        warnings.push({
          memberId: card.memberId,
          memberName: member?.name || '未知',
          memberPhoto: member?.photo || '',
          memberPhone: member?.phone || '',
          memberCardId: card.id,
          cardName: cardType?.name || '会员卡',
          cardNumber: card.cardNumber,
          warningType: 'expiring',
          daysLeft,
          endDate: card.endDate,
        });
      }
    });
    
    return warnings.sort((a, b) => a.daysLeft - b.daysLeft);
  }, [memberCards, members, cardTypes]);

  const expiringCount = warningMembers.filter((w) => w.warningType === 'expiring').length;
  const expiredCount = warningMembers.filter((w) => w.warningType === 'expired').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/checkin"
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">到期预警</h1>
          <p className="text-slate-500 mt-1">即将到期和已过期的会员卡预警名单</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100 bg-gradient-to-br from-orange-50/50 to-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-500">即将到期</p>
              <p className="text-3xl font-bold text-orange-600">{expiringCount}</p>
            </div>
          </div>
          <p className="text-sm text-slate-500">有效期剩余 7 天以内</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-rose-100 bg-gradient-to-br from-rose-50/50 to-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-red-600 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-500">已过期</p>
              <p className="text-3xl font-bold text-rose-600">{expiredCount}</p>
            </div>
          </div>
          <p className="text-sm text-slate-500">需要及时跟进续费</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">预警名单</h3>
        
        <div className="space-y-4">
          {warningMembers.map((warning, index) => (
            <div
              key={warning.memberCardId}
              className={`p-5 rounded-2xl border transition-all hover:shadow-md ${
                warning.warningType === 'expired'
                  ? 'bg-rose-50 border-rose-100'
                  : 'bg-orange-50 border-orange-100'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <img
                    src={warning.memberPhoto}
                    alt={warning.memberName}
                    className="w-14 h-14 rounded-xl object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://img.icons8.com/color/96/user-male-circle--v1.png';
                    }}
                  />
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-slate-800">{warning.memberName}</h4>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        warning.warningType === 'expired'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {warning.warningType === 'expired' ? '已过期' : '即将到期'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {warning.memberPhone}
                      </span>
                      <span>{warning.cardName}</span>
                      <span className="text-slate-400">{warning.cardNumber}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="text-slate-500">
                        到期日期: <span className="font-medium text-slate-700">{warning.endDate}</span>
                      </span>
                      {warning.warningType === 'expired' ? (
                        <span className="text-rose-600 font-medium">
                          已过期 {Math.abs(warning.daysLeft)} 天
                        </span>
                      ) : (
                        <span className="text-orange-600 font-medium">
                          剩余 {warning.daysLeft} 天
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/members/${warning.memberId}`}
                    className="flex items-center gap-1 px-3 py-2 bg-white text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm"
                  >
                    <User className="w-4 h-4" />
                    查看
                  </Link>
                </div>
              </div>
            </div>
          ))}
          
          {warningMembers.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>暂无到期预警</p>
              <p className="text-sm mt-1">所有会员的会员卡状态正常</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
