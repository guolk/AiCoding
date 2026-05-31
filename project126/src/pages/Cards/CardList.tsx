import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings, Search, Calendar, Pause, Play, ArrowUp, CreditCard as CardIcon, History, DollarSign } from 'lucide-react';
import { useCardStore } from '@/stores/useCardStore';
import { useMemberStore } from '@/stores/useMemberStore';
import { getDaysBetween, getToday } from '@/utils/date';
import { Modal } from '@/components/Modal/Modal';

export const CardList = () => {
  const { memberCards, cardTypes, operations, pauseCard, resumeCard, extendCard, refundCard, getOperationsByCardId } = useCardStore();
  const { members } = useMemberStore();
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showOperationsModal, setShowOperationsModal] = useState<string | null>(null);
  const [showPauseModal, setShowPauseModal] = useState<string | null>(null);
  const [showExtendModal, setShowExtendModal] = useState<string | null>(null);
  const [showRefundModal, setShowRefundModal] = useState<string | null>(null);
  const [pauseReason, setPauseReason] = useState('');
  const [extendDays, setExtendDays] = useState(0);
  const [extendReason, setExtendReason] = useState('');
  const [refundReason, setRefundReason] = useState('');

  const filteredCards = memberCards.filter((card) => {
    const member = members.find((m) => m.id === card.memberId);
    const matchesKeyword = !keyword ||
      member?.name.includes(keyword) ||
      member?.phone.includes(keyword) ||
      card.cardNumber.includes(keyword);
    const matchesStatus = statusFilter === 'all' || card.status === statusFilter;
    return matchesKeyword && matchesStatus;
  });

  const getMemberInfo = (memberId: string) => {
    return members.find((m) => m.id === memberId);
  };

  const getCardTypeInfo = (cardTypeId: string) => {
    return cardTypes.find((ct) => ct.id === cardTypeId);
  };

  const getStatusInfo = (status: string, card: typeof memberCards[0]) => {
    if (status === 'active') {
      const daysLeft = getDaysBetween(getToday(), card.endDate);
      if (daysLeft < 0) {
        return { label: '已过期', color: 'text-rose-600 bg-rose-100' };
      } else if (daysLeft <= 7) {
        return { label: `剩${daysLeft}天`, color: 'text-orange-600 bg-orange-100' };
      }
      return { label: '正常', color: 'text-emerald-600 bg-emerald-100' };
    }
    switch (status) {
      case 'paused': return { label: '已暂停', color: 'text-yellow-600 bg-yellow-100' };
      case 'expired': return { label: '已过期', color: 'text-rose-600 bg-rose-100' };
      case 'used_up': return { label: '已用完', color: 'text-slate-600 bg-slate-100' };
      case 'refunded': return { label: '已退卡', color: 'text-slate-500 bg-slate-100' };
      default: return { label: status, color: 'text-slate-500 bg-slate-100' };
    }
  };

  const handlePause = () => {
    if (!showPauseModal) return;
    pauseCard(showPauseModal, pauseReason || '暂停使用');
    setShowPauseModal(null);
    setPauseReason('');
  };

  const handleExtend = () => {
    if (!showExtendModal || extendDays <= 0) return;
    extendCard(showExtendModal, extendDays, extendReason || '延期');
    setShowExtendModal(null);
    setExtendDays(0);
    setExtendReason('');
  };

  const handleRefund = () => {
    if (!showRefundModal) return;
    refundCard(showRefundModal, refundReason || '退卡');
    setShowRefundModal(null);
    setRefundReason('');
  };

  const cardOperations = showOperationsModal ? getOperationsByCardId(showOperationsModal) : [];

  const getOperationLabel = (type: string) => {
    switch (type) {
      case 'create': return '开卡';
      case 'pause': return '暂停';
      case 'resume': return '恢复';
      case 'extend': return '延期';
      case 'upgrade': return '升级';
      case 'refund': return '退卡';
      case 'recharge': return '充值';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">会员卡管理</h1>
          <p className="text-slate-500 mt-1">管理所有会员卡信息</p>
        </div>
        <Link
          to="/cards/config"
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
        >
          <Settings className="w-4 h-4" />
          卡型配置
        </Link>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="搜索会员姓名、手机号或卡号..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all"
          >
            <option value="all">全部状态</option>
            <option value="active">正常</option>
            <option value="paused">已暂停</option>
            <option value="expired">已过期</option>
            <option value="used_up">已用完</option>
            <option value="refunded">已退卡</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCards.map((card) => {
            const member = getMemberInfo(card.memberId);
            const cardType = getCardTypeInfo(card.cardTypeId);
            const statusInfo = getStatusInfo(card.status, card);
            const daysLeft = getDaysBetween(getToday(), card.endDate);

            return (
              <div
                key={card.id}
                className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-5 border border-slate-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={member?.photo}
                      alt={member?.name}
                      className="w-12 h-12 rounded-xl object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://img.icons8.com/color/96/user-male-circle--v1.png';
                      }}
                    />
                    <div>
                      <h4 className="font-semibold text-slate-800">{member?.name || '未知会员'}</h4>
                      <p className="text-sm text-slate-500">{card.cardNumber}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-medium ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">卡型</span>
                    <span className="font-medium text-slate-700">{cardType?.name || '未知'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">有效期</span>
                    <span className={`font-medium ${daysLeft < 0 ? 'text-rose-600' : daysLeft <= 7 ? 'text-orange-600' : 'text-slate-700'}`}>
                      {card.startDate} ~ {card.endDate}
                    </span>
                  </div>
                  {card.remainingCount !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">剩余次数</span>
                      <span className="font-medium text-slate-700">{card.remainingCount} 次</span>
                    </div>
                  )}
                  {card.totalAmount !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">余额</span>
                      <span className="font-medium text-emerald-600">
                        ¥{(card.totalAmount - (card.usedAmount || 0)).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200">
                  {card.status === 'active' && (
                    <>
                      <button
                        onClick={() => setShowPauseModal(card.id)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 text-sm text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                      >
                        <Pause className="w-4 h-4" />
                        暂停
                      </button>
                      <button
                        onClick={() => setShowExtendModal(card.id)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 text-sm text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                      >
                        <Calendar className="w-4 h-4" />
                        延期
                      </button>
                      <button
                        onClick={() => setShowRefundModal(card.id)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <DollarSign className="w-4 h-4" />
                        退卡
                      </button>
                    </>
                  )}
                  {card.status === 'paused' && (
                    <button
                      onClick={() => resumeCard(card.id)}
                      className="flex-1 flex items-center justify-center gap-1 py-2 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      恢复
                    </button>
                  )}
                  <button
                    onClick={() => setShowOperationsModal(card.id)}
                    className={`${card.status !== 'active' && card.status !== 'paused' ? 'flex-1' : ''} flex items-center justify-center gap-1 py-2 px-3 text-sm text-slate-600 hover:bg-slate-200 rounded-lg transition-colors`}
                  >
                    <History className="w-4 h-4" />
                    记录
                  </button>
                </div>
              </div>
            );
          })}
          {filteredCards.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-400">
              <CardIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>暂无会员卡数据</p>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={!!showPauseModal}
        onClose={() => {
          setShowPauseModal(null);
          setPauseReason('');
        }}
        title="暂停会员卡"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">确定要暂停此会员卡吗？暂停期间有效期将停止计算。</p>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">暂停原因</label>
            <textarea
              value={pauseReason}
              onChange={(e) => setPauseReason(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all"
              placeholder="请输入暂停原因（可选）"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setShowPauseModal(null);
                setPauseReason('');
              }}
              className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              取消
            </button>
            <button
              onClick={handlePause}
              className="px-6 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all"
            >
              确认暂停
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!showExtendModal}
        onClose={() => {
          setShowExtendModal(null);
          setExtendDays(0);
          setExtendReason('');
        }}
        title="延期会员卡"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              延期天数 <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              value={extendDays || ''}
              onChange={(e) => setExtendDays(Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all"
              placeholder="请输入延期天数"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">延期原因</label>
            <textarea
              value={extendReason}
              onChange={(e) => setExtendReason(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all"
              placeholder="请输入延期原因（可选）"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setShowExtendModal(null);
                setExtendDays(0);
                setExtendReason('');
              }}
              className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleExtend}
              disabled={extendDays <= 0}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              确认延期
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!showRefundModal}
        onClose={() => {
          setShowRefundModal(null);
          setRefundReason('');
        }}
        title="退卡确认"
      >
        <div className="space-y-4">
          <p className="text-sm text-rose-600 font-medium">
            ⚠️ 退卡后会员卡将无法恢复，此操作不可逆！
          </p>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">退卡原因</label>
            <textarea
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all"
              placeholder="请输入退卡原因（可选）"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setShowRefundModal(null);
                setRefundReason('');
              }}
              className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleRefund}
              className="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-xl hover:shadow-lg transition-all"
            >
              确认退卡
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!showOperationsModal}
        onClose={() => setShowOperationsModal(null)}
        title="操作记录"
      >
        <div className="space-y-3">
          {cardOperations.length > 0 ? (
            cardOperations.map((op) => (
              <div key={op.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    op.operationType === 'create' ? 'bg-emerald-100 text-emerald-700' :
                    op.operationType === 'pause' ? 'bg-yellow-100 text-yellow-700' :
                    op.operationType === 'resume' ? 'bg-blue-100 text-blue-700' :
                    op.operationType === 'extend' ? 'bg-cyan-100 text-cyan-700' :
                    op.operationType === 'refund' ? 'bg-rose-100 text-rose-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {getOperationLabel(op.operationType)}
                  </span>
                  <span className="text-xs text-slate-400">{op.createdAt}</span>
                </div>
                <p className="text-sm text-slate-600">操作人: {op.operator}</p>
                {op.reason && <p className="text-sm text-slate-500 mt-1">原因: {op.reason}</p>}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-400">
              <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>暂无操作记录</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
