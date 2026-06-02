import { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { ConstitutionResult, ConstitutionScores } from '../types';
import {
  getConstitutionName,
  getConstitutionColor,
} from '../utils/constitution';
import { cn } from '../lib/utils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface LineChartProps {
  results: ConstitutionResult[];
}

const CONSTITUTION_KEYS: (keyof ConstitutionScores)[] = [
  'pinghe',
  'qixu',
  'yangxu',
  'yinxu',
  'tanshi',
  'shire',
  'xueyu',
  'qiyu',
  'tebing',
];

export default function LineChart({ results }: LineChartProps) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['pinghe']);

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : prev.length < 5
          ? [...prev, type]
          : prev
    );
  };

  const labels = results.map((r) => r.date);

  const datasets = selectedTypes.map((type) => {
    const color = getConstitutionColor(type);
    return {
      label: getConstitutionName(type),
      data: results.map((r) => r.scores[type as keyof ConstitutionScores]),
      borderColor: color,
      backgroundColor: `${color}20`,
      borderWidth: 2,
      pointBackgroundColor: color,
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: color,
      pointRadius: 4,
      pointHoverRadius: 6,
      tension: 0.3,
      fill: false,
    };
  });

  const data = {
    labels,
    datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          color: '#6B7280',
        },
      },
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: '#E5E7EB',
        },
        ticks: {
          stepSize: 20,
          font: {
            size: 11,
          },
          color: '#6B7280',
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          font: {
            size: 12,
            family: '"Noto Sans SC", "PingFang SC", sans-serif',
          },
          padding: 15,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(44, 95, 45, 0.9)',
        titleFont: {
          size: 14,
          family: '"Noto Sans SC", "PingFang SC", sans-serif',
        },
        bodyFont: {
          size: 13,
        },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context: { dataset: { label?: string }; parsed: { y: number } }) => {
            return `${context.dataset.label || ''}: ${context.parsed.y.toFixed(1)}`;
          },
        },
      },
    },
  };

  if (results.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        暂无测评数据
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-wrap gap-2">
        {CONSTITUTION_KEYS.map((type) => (
          <button
            key={type}
            onClick={() => toggleType(type)}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium transition-all',
              selectedTypes.includes(type)
                ? 'text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
            style={
              selectedTypes.includes(type)
                ? { backgroundColor: getConstitutionColor(type) }
                : {}
            }
          >
            {getConstitutionName(type)}
          </button>
        ))}
      </div>
      <div className="text-xs text-gray-500 mb-3">
        提示：最多可同时选择5种体质类型进行对比
      </div>
      <Line data={data} options={options} />
    </div>
  );
}
