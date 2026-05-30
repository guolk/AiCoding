
import {
  Gift,
  Calendar,
  Users,
  TrendingUp,
  Clock,
  ChevronRight,
  Plus,
  Heart,
  ShoppingBag,
  Lightbulb,
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { formatDateShort, getDaysUntil, getNextAnniversary } from '../utils/date';

export default function Dashboard() {
  const {
    contacts,
    anniversaries,
    giftHistory,
    giftIdeas,
    purchasePlans,
    holidays,
    setCurrentPage,
    planItems,
  } = useAppStore();

  const totalContacts = contacts.length;
  const totalIdeas = giftIdeas.length;
  const activePlans = purchasePlans.filter((p) => p.status !== 'completed').length;
  const totalSpentThisYear = giftHistory
    .filter((gh) => new Date(gh.date).getFullYear() === new Date().getFullYear())
    .reduce((sum, gh) => sum + gh.price, 0);

  const upcomingEvents = [
    ...anniversaries.map((a) => ({
      id: a.id,
      name: a.name,
      date: getNextAnniversary(a.date, a.recurring),
      type: 'anniversary' as const,
      contact: contacts.find((c) => c.id === a.contactId)?.name || '',
      contactId: a.contactId,
    })),
    ...holidays.map((h) => ({
      id: h.id,
      name: h.name,
      date: h.date,
      type: 'holiday' as const,
      contact: '',
      contactId: '',
    })),
  ]
    .map((e) => ({
      ...e,
      daysUntil: getDaysUntil(e.date),
    }))
    .filter((e) => e.daysUntil >= 0)
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 5);

  const recentGifts = [...giftHistory]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  const pendingItems = planItems.filter((pi) => pi.status === 'pending').length;

  const savedIdeas = giftIdeas.filter((gi) => gi.status === 'saved').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink-900">
            欢迎回来！🎁
          </h1>
          <p className="text-ink-500 mt-1">
            让我们看看今天有什么送礼计划
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setCurrentPage('contacts')}
            className="btn-secondary flex items-center gap-2"
          >
            <Plus size={18} />
            添加联系人
          </button>
          <button
            onClick={() => setCurrentPage('gift-ideas')}
            className="btn-primary flex items-center gap-2"
          >
            <Lightbulb size={18} />
            记录灵感
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <div className="stat-card bg-gradient-to-br from-primary-500 to-primary-600">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-primary-100 text-sm">联系人总数</p>
              <p className="text-3xl font-bold mt-2">{totalContacts}</p>
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Users size={20} />
            </div>
          </div>
          <p className="text-primary-100 text-xs mt-3">
            共 {anniversaries.length} 个纪念日
          </p>
        </div>

        <div className="stat-card bg-gradient-to-br from-secondary-500 to-secondary-600">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-secondary-100 text-sm">礼物灵感</p>
              <p className="text-3xl font-bold mt-2">{totalIdeas}</p>
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Lightbulb size={18} />
            </div>
          </div>
          <p className="text-secondary-100 text-xs mt-3">
            已收藏 {savedIdeas} 个
          </p>
        </div>

        <div className="stat-card bg-gradient-to-br from-accent-500 to-accent-600">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-accent-800 text-sm">进行中的计划</p>
              <p className="text-3xl font-bold mt-2 text-accent-900">{activePlans}</p>
            </div>
            <div className="w-10 h-10 bg-white/40 rounded-xl flex items-center justify-center">
              <Calendar size={20} className="text-accent-800" />
            </div>
          </div>
          <p className="text-accent-700 text-xs mt-3">
            待采购 {pendingItems} 件
          </p>
        </div>

        <div className="stat-card bg-gradient-to-br from-ink-700 to-ink-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-ink-300 text-sm">年度花费</p>
              <p className="text-3xl font-bold mt-2">¥{totalSpentThisYear.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
          </div>
          <p className="text-ink-400 text-xs mt-3">
            {new Date().getFullYear()}年送礼支出
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-lg text-ink-900 flex items-center gap-2">
              <Clock className="text-primary-500" size={20} />
              即将到来的日子
            </h2>
            <button
              onClick={() => setCurrentPage('contacts')}
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              查看全部 <ChevronRight size={16} />
            </button>
          </div>
          <div className="space-y-3">
            {upcomingEvents.length === 0 ? (
              <p className="text-ink-400 text-center py-8">
                暂无即将到来的纪念日或节日
              </p>
            ) : (
              upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-ink-50 hover:bg-ink-100 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        event.type === 'holiday'
                          ? 'bg-accent-100 text-accent-700'
                          : 'bg-primary-100 text-primary-600'
                      }`}
                    >
                      {event.type === 'holiday' ? (
                        <Gift size={22} />
                      ) : (
                        <Heart size={22} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-ink-800">{event.name}</p>
                      <p className="text-sm text-ink-500">
                        {event.contact && `给 ${event.contact} · `}
                        {formatDateShort(event.date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {event.daysUntil === 0 ? (
                      <span className="px-3 py-1 bg-primary-500 text-white text-xs font-medium rounded-full">
                        就是今天！
                      </span>
                    ) : event.daysUntil <= 7 ? (
                      <span className="px-3 py-1 bg-accent-100 text-accent-700 text-xs font-medium rounded-full">
                        {event.daysUntil} 天后
                      </span>
                    ) : (
                      <span className="text-ink-500 text-sm">
                        {event.daysUntil} 天后
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="font-display font-semibold text-lg text-ink-900 flex items-center gap-2 mb-4">
            <ShoppingBag className="text-secondary-500" size={20} />
            快速操作
          </h2>
          <div className="space-y-3">
            <button
              onClick={() => setCurrentPage('contacts')}
              className="w-full p-4 rounded-xl border-2 border-dashed border-ink-200 hover:border-primary-400 hover:bg-primary-50 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-ink-100 group-hover:bg-primary-100 flex items-center justify-center transition-colors">
                  <Users size={20} className="text-ink-600 group-hover:text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-ink-800 group-hover:text-primary-700">
                    添加新联系人
                  </p>
                  <p className="text-xs text-ink-500">管理您的送礼对象</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setCurrentPage('gift-ideas')}
              className="w-full p-4 rounded-xl border-2 border-dashed border-ink-200 hover:border-secondary-400 hover:bg-secondary-50 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-ink-100 group-hover:bg-secondary-100 flex items-center justify-center transition-colors">
                  <Lightbulb size={20} className="text-ink-600 group-hover:text-secondary-600" />
                </div>
                <div>
                  <p className="font-medium text-ink-800 group-hover:text-secondary-700">
                    记录新创意
                  </p>
                  <p className="text-xs text-ink-500">保存送礼灵感</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setCurrentPage('purchase-plans')}
              className="w-full p-4 rounded-xl border-2 border-dashed border-ink-200 hover:border-accent-400 hover:bg-accent-50 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-ink-100 group-hover:bg-accent-100 flex items-center justify-center transition-colors">
                  <Calendar size={20} className="text-ink-600 group-hover:text-accent-700" />
                </div>
                <div>
                  <p className="font-medium text-ink-800 group-hover:text-accent-800">
                    创建购买计划
                  </p>
                  <p className="text-xs text-ink-500">规划节日礼物采购</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setCurrentPage('budget-analysis')}
              className="w-full p-4 rounded-xl border-2 border-dashed border-ink-200 hover:border-ink-400 hover:bg-ink-50 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-ink-100 group-hover:bg-ink-200 flex items-center justify-center transition-colors">
                  <TrendingUp size={20} className="text-ink-600" />
                </div>
                <div>
                  <p className="font-medium text-ink-800">查看预算分析</p>
                  <p className="text-xs text-ink-500">了解送礼支出趋势</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-lg text-ink-900">
            最近送过的礼物
          </h2>
          <button
            onClick={() => setCurrentPage('gift-tracking')}
            className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            查看记录 <ChevronRight size={16} />
          </button>
        </div>
        {recentGifts.length === 0 ? (
          <p className="text-ink-400 text-center py-8">
            还没有送礼记录，开始记录您的第一次送礼吧！
          </p>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {recentGifts.map((gift) => {
              const contact = contacts.find((c) => c.id === gift.contactId);
              return (
                <div
                  key={gift.id}
                  className="p-4 rounded-xl bg-gradient-to-br from-ink-50 to-warm-50 border border-ink-100 hover:shadow-soft transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-200 to-secondary-200 flex items-center justify-center overflow-hidden">
                      {contact?.avatar ? (
                        <img
                          src={contact.avatar}
                          alt={contact.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium text-ink-600">
                          {contact?.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-ink-800 text-sm truncate">
                        {gift.giftName}
                      </p>
                      <p className="text-xs text-ink-500">
                        送给 {contact?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-ink-400">
                      {formatDateShort(gift.date)}
                    </span>
                    <span className="text-sm font-semibold text-primary-600">
                      ¥{gift.price}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
