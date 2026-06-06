import { useState, useMemo } from 'react';
import {
  Calculator,
  FileText,
  Download,
  TrendingUp,
  Users,
  Calendar,
  ChefHat,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { useMenuStore } from '../../store/menuStore';
import { useCustomerStore } from '../../store/customerStore';
import { getPricingBreakdown, calculateServiceFee } from '../../utils/pricing';
import type { Dish } from '../../types';

const SERVICE_FEE_OPTIONS = [
  { value: 0.2, label: '20% - 基础服务' },
  { value: 0.3, label: '30% - 标准服务' },
  { value: 0.4, label: '40% - 高端服务' },
  { value: 0.5, label: '50% - VIP服务' },
];

const OCCASION_MULTIPLIERS: Record<string, { multiplier: number; label: string }> = {
  '日常烹饪': { multiplier: 1.0, label: '无加价' },
  '家庭聚餐': { multiplier: 1.2, label: '+20%' },
  '生日派对': { multiplier: 1.3, label: '+30%' },
  '商务宴请': { multiplier: 1.5, label: '+50%' },
  '婚礼宴席': { multiplier: 1.8, label: '+80%' },
  '节日庆典': { multiplier: 1.4, label: '+40%' },
  '浪漫约会': { multiplier: 1.3, label: '+30%' },
  '朋友聚会': { multiplier: 1.2, label: '+20%' },
};

export default function PricingCalculator() {
  const { currentMenu, guestCount, updateGuestCount, saveMenu } = useMenuStore();
  const { selectedCustomer } = useCustomerStore();
  const [serviceFeeRate, setServiceFeeRate] = useState(0.3);

  const pricingData = useMemo(() => {
    if (!currentMenu || currentMenu.dishes.length === 0) return null;

    const dishes = currentMenu.dishes.map((md) => md.dish!);
    const portions = currentMenu.dishes.map((md) => md.portion);
    
    const customServiceFee = (() => {
      const subtotal = dishes.reduce((sum, dish, index) => {
        const portion = portions[index] || 1;
        const servingSize = 1;
        const multiplier = (portion * guestCount) / servingSize;
        const dishCost = dish.ingredients.reduce((s: number, ing: { name: string; amount: number; unit: string }) => s + (dish.cost || 0) * multiplier, 0);
        return sum + dishCost;
      }, 0);
      return Math.round(subtotal * serviceFeeRate * 100) / 100;
    })();

    const breakdown = getPricingBreakdown(
      dishes,
      portions,
      guestCount,
      currentMenu.occasionType
    );

    const occasionConfig = OCCASION_MULTIPLIERS[currentMenu.occasionType] || OCCASION_MULTIPLIERS['日常烹饪'];
    const occasionSurcharge = Math.round(breakdown.subtotal * (occasionConfig.multiplier - 1) * 100) / 100;
    const totalPrice = Math.round((breakdown.subtotal + customServiceFee + occasionSurcharge) * 100) / 100;

    return {
      ...breakdown,
      serviceFee: customServiceFee,
      occasionSurcharge,
      total: totalPrice,
      occasionConfig,
    };
  }, [currentMenu, guestCount, serviceFeeRate]);

  const handleExportQuote = () => {
    if (!currentMenu || !pricingData) return;

    const quoteContent = `
私人厨师服务报价单
==================
生成日期：${new Date().toLocaleDateString('zh-CN')}

客户信息
--------
客户姓名：${selectedCustomer?.name || '未选择'}
用餐人数：${guestCount}人
场合类型：${currentMenu.occasionType}
菜单名称：${currentMenu.name}

菜单明细
--------
${pricingData.ingredientCosts.map((item, index) => `${index + 1}. ${item.dishName} × ${item.quantity}份 - ¥${item.cost.toFixed(2)}`).join('\n')}

费用明细
--------
食材成本：¥${pricingData.subtotal.toFixed(2)}
服务费（${Math.round(serviceFeeRate * 100)}%）：¥${pricingData.serviceFee.toFixed(2)}
场合加价（${pricingData.occasionConfig.label}）：¥${pricingData.occasionSurcharge.toFixed(2)}

==================
总计：¥${pricingData.total.toFixed(2)}
人均：¥${(pricingData.total / guestCount).toFixed(2)}

本报价有效期为7天，如有疑问请联系厨师。
    `.trim();

    const blob = new Blob([quoteContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `报价单_${currentMenu.name}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    saveMenu();
  };

  if (!currentMenu || currentMenu.dishes.length === 0 || !pricingData) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">报价计算</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calculator className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">添加菜品后查看报价</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">报价计算</CardTitle>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportQuote}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            导出报价单
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">服务费配置</h4>
          <div className="space-y-3">
            <Select
              label="服务费率"
              value={serviceFeeRate}
              onChange={(val) => setServiceFeeRate(val as number)}
              options={SERVICE_FEE_OPTIONS}
            />
            <div className="flex items-center gap-3 p-3 bg-gold-50 rounded-lg border border-gold-100">
              <Calendar className="w-5 h-5 text-gold-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gold-800">
                  {currentMenu.occasionType}
                </p>
                <p className="text-xs text-gold-600">
                  场合加价：{pricingData.occasionConfig.label}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">食材成本明细</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-hide">
            {pricingData.ingredientCosts.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" size="sm">
                    {item.quantity}份
                  </Badge>
                  <span className="text-sm text-gray-700">{item.dishName}</span>
                </div>
                <span className="text-sm font-medium text-charcoal">
                  ¥{item.cost.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">食材成本</span>
            <span className="text-gray-700">¥{pricingData.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">
              服务费 ({Math.round(serviceFeeRate * 100)}%)
            </span>
            <span className="text-gray-700">¥{pricingData.serviceFee.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">场合加价</span>
            <span className="text-gray-700">¥{pricingData.occasionSurcharge.toFixed(2)}</span>
          </div>
        </div>

        <div className="p-6 bg-gradient-to-br from-primary-50 to-gold-50 rounded-xl border border-primary-100">
          <div className="text-center">
            <p className="text-sm text-primary-600 mb-2">总报价</p>
            <p className="text-5xl font-bold text-primary-700 mb-2">
              ¥{pricingData.total.toFixed(2)}
            </p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-gray-500">
                <Users className="w-4 h-4" />
                <span>人均 ¥{(pricingData.total / guestCount).toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <ChefHat className="w-4 h-4" />
                <span>{currentMenu.dishes.length}道菜</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-white rounded-xl border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-primary-500" />
              <span className="text-xs text-gray-500">食材占比</span>
            </div>
            <p className="text-xl font-bold text-charcoal">
              {Math.round((pricingData.subtotal / pricingData.total) * 100)}%
            </p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-gold-500" />
              <span className="text-xs text-gray-500">服务占比</span>
            </div>
            <p className="text-xl font-bold text-charcoal">
              {Math.round(((pricingData.serviceFee + pricingData.occasionSurcharge) / pricingData.total) * 100)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
