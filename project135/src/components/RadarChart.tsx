import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import type { ConstitutionScores } from '../types';
import { getConstitutionName, getConstitutionColor } from '../utils/constitution';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface RadarChartProps {
  scores: ConstitutionScores;
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

export default function RadarChart({ scores }: RadarChartProps) {
  const labels = CONSTITUTION_KEYS.map((key) => getConstitutionName(key));
  const dataValues = CONSTITUTION_KEYS.map((key) => scores[key]);
  const backgroundColors = CONSTITUTION_KEYS.map(
    (key) => `${getConstitutionColor(key)}40`
  );
  const borderColors = CONSTITUTION_KEYS.map((key) => getConstitutionColor(key));

  const data = {
    labels,
    datasets: [
      {
        label: '体质得分',
        data: dataValues,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 2,
        pointBackgroundColor: borderColors,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: borderColors,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        min: 0,
        ticks: {
          stepSize: 20,
          font: {
            size: 11,
          },
          color: '#6B7280',
        },
        pointLabels: {
          font: {
            size: 13,
            family: '"Noto Sans SC", "PingFang SC", sans-serif',
          },
          color: '#374151',
        },
        grid: {
          color: '#E5E7EB',
        },
        angleLines: {
          color: '#E5E7EB',
        },
      },
    },
    plugins: {
      legend: {
        display: false,
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
          label: (context: { parsed: { r: number } }) => {
            return `得分: ${context.parsed.r.toFixed(1)}`;
          },
        },
      },
    },
  };

  return (
    <div className="w-full">
      <Radar data={data} options={options} />
    </div>
  );
}
