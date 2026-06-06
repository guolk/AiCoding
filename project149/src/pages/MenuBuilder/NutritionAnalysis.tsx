import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { Flame, Beef, Wheat, Droplets, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { useMenuStore } from '../../store/menuStore';
import { useMenuStore as dishMenuStore } from '../../store/menuStore';
import { analyzeNutritionBalance, NutritionAdvice, calculateTotalNutrition } from '../../utils/nutrition';
import type { NutritionAnalysis } from '../../utils/nutrition';

const COLORS = ['#2D4A3E', '#D4A574', '#E07A5F', '#81B29A'];

const NUTRIENT_TARGETS = {
  protein: 60,
  carbs: 300,
  fat: 65,
};

interface NutrientCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  unit: string;
  color: string;
  perPerson?: number;
}

function NutrientCard({ icon, label, value, unit, color, perPerson }: NutrientCardProps) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-xl font-bold text-charcoal">
            {Math.round(value)}
            <span className="text-sm font-normal text-gray-400 ml-1">{unit}</span>
          </p>
        </div>
      </div>
      {perPerson !== undefined && (
        <p className="text-xs text-gray-400">
          人均 {Math.round(perPerson)}{unit}
        </p>
      )}
    </div>
  );
}

function NutritionProgressItem({
  label,
  value,
  target,
  unit,
}: {
  label: string;
  value: number;
  target: number;
  unit: string;
}) {
  const percentage = Math.min((value / target) * 100, 100);
  const isOptimal = percentage >= 70 && percentage <= 110;
  const isHigh = percentage > 110;

  let variant: 'success' | 'warning' | 'danger' | 'primary' = 'primary';
  if (isOptimal) variant = 'success';
  else if (isHigh) variant = 'danger';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-charcoal">
          {Math.round(value)}/{target}{unit}
        </span>
      </div>
      <ProgressBar
        value={percentage}
        variant={variant}
        size="md"
        showLabel={false}
      />
    </div>
  );
}

function AdviceItem({ advice }: { advice: NutritionAdvice }) {
  const statusConfig = {
    excellent: {
      icon: <CheckCircle className="w-4 h-4" />,
      color: 'text-green-600 bg-green-50 border-green-100',
      label: '理想',
    },
    good: {
      icon: <CheckCircle className="w-4 h-4" />,
      color: 'text-primary-600 bg-primary-50 border-primary-100',
      label: '适中',
    },
    moderate: {
      icon: <Info className="w-4 h-4" />,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
      label: '偏低',
    },
    low: {
      icon: <Info className="w-4 h-4" />,
      color: 'text-blue-600 bg-blue-50 border-blue-100',
      label: '偏低',
    },
    high: {
      icon: <AlertCircle className="w-4 h-4" />,
      color: 'text-coral-600 bg-coral-50 border-coral-100',
      label: '偏高',
    },
  };

  const config = statusConfig[advice.status];

  return (
    <div className={`p-3 rounded-lg border ${config.color}`}>
      <div className="flex items-start gap-2">
        <div className="mt-0.5">{config.icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">
              {advice.category === 'calories' && '热量'}
              {advice.category === 'protein' && '蛋白质'}
              {advice.category === 'fat' && '脂肪'}
              {advice.category === 'carbs' && '碳水化合物'}
            </span>
            <Badge variant="outline" size="sm" className="text-xs">
              {config.label}
            </Badge>
          </div>
          <p className="text-sm">{advice.message}</p>
          <p className="text-xs mt-1 opacity-80">{advice.suggestion}</p>
        </div>
      </div>
    </div>
  );
}

export default function NutritionAnalysis() {
  const { currentMenu, guestCount } = useMenuStore();

  const nutrition = currentMenu?.nutritionSummary;
  const dishes = currentMenu?.dishes.map((md) => md.dish!) || [];

  const pieData = useMemo(() => {
    if (!nutrition) return [];
    return [
      { name: '蛋白质', value: nutrition.totalProtein * 4, color: COLORS[0] },
      { name: '碳水化合物', value: nutrition.totalCarbs * 4, color: COLORS[1] },
      { name: '脂肪', value: nutrition.totalFat * 9, color: COLORS[2] },
    ];
  }, [nutrition]);

  const nutritionAnalysis = useMemo(() => {
    if (!currentMenu || currentMenu.dishes.length === 0) return null;
    const dishes = currentMenu.dishes.map((md) => md.dish!);
    const portions = currentMenu.dishes.map((md) => md.portion);
    return calculateTotalNutrition(dishes, portions, guestCount);
  }, [currentMenu, guestCount]);

  const nutritionAdvice = useMemo(() => {
    if (!nutritionAnalysis) return [];
    return analyzeNutritionBalance(nutritionAnalysis);
  }, [nutritionAnalysis]);

  if (!currentMenu || currentMenu.dishes.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">营养分析</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Flame className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">添加菜品后查看营养分析</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">营养分析</CardTitle>
        <p className="text-sm text-gray-500 mt-1">
          基于 {guestCount} 人份计算
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <NutrientCard
            icon={<Flame className="w-5 h-5 text-gold-500" />}
            label="总热量"
            value={nutrition?.totalCalories || 0}
            unit="kcal"
            color="bg-gold-50"
            perPerson={nutritionAnalysis?.perPersonCalories}
          />
          <NutrientCard
            icon={<Beef className="w-5 h-5 text-primary-500" />}
            label="蛋白质"
            value={nutrition?.totalProtein || 0}
            unit="g"
            color="bg-primary-50"
            perPerson={nutritionAnalysis?.perPersonProtein}
          />
          <NutrientCard
            icon={<Wheat className="w-5 h-5 text-amber-500" />}
            label="碳水化合物"
            value={nutrition?.totalCarbs || 0}
            unit="g"
            color="bg-amber-50"
            perPerson={nutritionAnalysis?.perPersonCarbs}
          />
          <NutrientCard
            icon={<Droplets className="w-5 h-5 text-coral-500" />}
            label="脂肪"
            value={nutrition?.totalFat || 0}
            unit="g"
            color="bg-coral-50"
            perPerson={nutritionAnalysis?.perPersonFat}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              宏量营养素分布
            </h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${Math.round(value)} kcal`,
                      name,
                    ]}
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(value) => (
                      <span className="text-sm text-gray-600">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              营养均衡度（人均）
            </h4>
            <div className="space-y-4">
              <NutritionProgressItem
                label="蛋白质"
                value={nutritionAnalysis?.perPersonProtein || 0}
                target={NUTRIENT_TARGETS.protein}
                unit="g"
              />
              <NutritionProgressItem
                label="碳水化合物"
                value={nutritionAnalysis?.perPersonCarbs || 0}
                target={NUTRIENT_TARGETS.carbs}
                unit="g"
              />
              <NutritionProgressItem
                label="脂肪"
                value={nutritionAnalysis?.perPersonFat || 0}
                target={NUTRIENT_TARGETS.fat}
                unit="g"
              />
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">营养建议</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2 scrollbar-hide">
            {nutritionAdvice.map((advice) => (
              <AdviceItem key={advice.category} advice={advice} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
