import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { CATEGORIES, AppCategory } from '../../types';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryPieChartProps {
  data: Record<AppCategory, number>;
  height?: number;
}

const categoryColors: Record<AppCategory, string> = {
  social: '#ec4899',
  entertainment: '#f59e0b',
  work: '#3b82f6',
  study: '#8b5cf6',
  communication: '#06b6d4',
};

export function CategoryPieChart({ data, height = 200 }: CategoryPieChartProps) {
  const chartData = {
    labels: CATEGORIES.map((c) => c.label),
    datasets: [
      {
        data: CATEGORIES.map((c) => data[c.key] || 0),
        backgroundColor: CATEGORIES.map((c) => categoryColors[c.key]),
        borderColor: '#ffffff',
        borderWidth: 3,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 16,
          usePointStyle: true,
          pointStyle: 'circle',
          font: { size: 12 },
          color: '#475569',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 13 },
        bodyFont: { size: 12 },
        cornerRadius: 8,
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            const hours = Math.floor(value / 60);
            const mins = value % 60;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            if (hours > 0) {
              return `${hours}小时${mins}分钟 (${percentage}%)`;
            }
            return `${mins}分钟 (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div style={{ height }}>
      <Doughnut data={chartData} options={options} />
    </div>
  );
}
