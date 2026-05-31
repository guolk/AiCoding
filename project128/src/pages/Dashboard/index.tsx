
import { Gem, TrendingUp, Calendar, Sparkles } from 'lucide-react';
import useJewelryStore from '../../store/jewelryStore';
import { formatPrice } from '../../utils/format';
import StatCard from './StatCard';
import ReminderList from './ReminderList';
import CategoryChart from './CategoryChart';
import RecentJewelry from './RecentJewelry';

const Dashboard = () => {
  const { jewelries, getTotalValue, getReminders, maintenances } = useJewelryStore();
  const totalValue = getTotalValue();
  const reminders = getReminders();
  const totalPurchaseValue = jewelries.reduce((sum, j) => sum + j.purchasePrice, 0);
  const valueChange = totalValue - totalPurchaseValue;
  const valueChangePercent = totalPurchaseValue > 0 ? ((valueChange / totalPurchaseValue) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6 animate-fadeInUp">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink-600">欢迎回来</h1>
          <p className="text-ink-400 mt-1">管理您珍贵的珠宝收藏</p>
        </div>
        <div className="text-right">
          <p className="text-ink-400 text-sm">最后更新</p>
          <p className="font-medium text-ink-600">{new Date().toLocaleDateString('zh-CN')}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <StatCard
          title="藏品总数"
          value={jewelries.length}
          icon={Gem}
          color="gold-gradient"
          trend="+2 本月新增"
          trendUp={true}
        />
        <StatCard
          title="收藏总价值"
          value={formatPrice(totalValue)}
          icon={TrendingUp}
          color="bg-emerald-500"
          trend={`${valueChangePercent}% 增值`}
          trendUp={valueChange >= 0}
        />
        <StatCard
          title="保养记录"
          value={maintenances.length}
          icon={Calendar}
          color="bg-sapphire-500"
        />
        <StatCard
          title="待办事项"
          value={reminders.length}
          icon={Sparkles}
          color="bg-ruby-500"
          trend={reminders.filter((r) => r.priority === 'high').length > 0 ? `${reminders.filter((r) => r.priority === 'high').length} 项高优先级` : '全部已处理'}
          trendUp={false}
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="grid grid-cols-2 gap-6">
            <RecentJewelry jewelries={jewelries} />
            <CategoryChart jewelries={jewelries} />
          </div>
        </div>
        <div className="col-span-1">
          <ReminderList reminders={reminders} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
