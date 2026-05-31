
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';
import { Jewelry } from '../../types';
import { getJewelryTypeLabel } from '../../utils/format';

interface CategoryChartProps {
  jewelries: Jewelry[];
}

const COLORS = ['#B8860B', '#D4AF37', '#B76E79', '#50C878', '#0F52BA', '#E0115F', '#A0A0A0'];

const CategoryChart = ({ jewelries }: CategoryChartProps) => {
  const categoryData = jewelries.reduce((acc, jewelry) => {
    const existing = acc.find((item) => item.name === jewelry.type);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: jewelry.type, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-card border border-gold-100 h-full">
      <div className="flex items-center gap-2 mb-6">
        <PieChartIcon className="w-5 h-5 text-gold-500" />
        <h2 className="font-display text-xl font-bold text-ink-600">藏品分类</h2>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {categoryData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [
                `${value} 件`,
                getJewelryTypeLabel(name),
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4">
        {categoryData.map((item, index) => (
          <div key={item.name} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-sm text-ink-500">
              {getJewelryTypeLabel(item.name)}: {item.value}件
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryChart;
