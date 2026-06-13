import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
  RadialLinearScale,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
  RadialLinearScale
);

export const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top' as const,
      labels: {
        usePointStyle: true,
        padding: 15,
        font: {
          family: '"Noto Sans SC", sans-serif',
          size: 12,
        },
      },
    },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      titleFont: {
        family: '"Noto Sans SC", sans-serif',
        size: 13,
      },
      bodyFont: {
        family: '"Noto Sans SC", sans-serif',
        size: 12,
      },
      padding: 12,
      cornerRadius: 8,
    },
  },
  scales: {
    x: {
      grid: {
        color: 'rgba(148, 163, 184, 0.1)',
      },
      ticks: {
        font: {
          family: '"Noto Sans SC", sans-serif',
          size: 11,
        },
      },
    },
    y: {
      grid: {
        color: 'rgba(148, 163, 184, 0.1)',
      },
      ticks: {
        font: {
          family: '"Noto Sans SC", sans-serif',
          size: 11,
        },
      },
    },
  },
  interaction: {
    intersect: false,
    mode: 'index' as const,
  },
};

export const chartColors = {
  temperature: {
    border: '#f97316',
    background: 'rgba(249, 115, 22, 0.1)',
  },
  humidity: {
    border: '#06b6d4',
    background: 'rgba(6, 182, 212, 0.1)',
  },
  pressure: {
    border: '#8b5cf6',
    background: 'rgba(139, 92, 246, 0.1)',
  },
  windSpeed: {
    border: '#10b981',
    background: 'rgba(16, 185, 129, 0.1)',
  },
  precipitation: {
    border: '#3b82f6',
    background: 'rgba(59, 130, 246, 0.5)',
  },
  visibility: {
    border: '#f59e0b',
    background: 'rgba(245, 158, 11, 0.1)',
  },
  maxTemp: {
    border: '#ef4444',
    background: 'rgba(239, 68, 68, 0.1)',
  },
  minTemp: {
    border: '#3b82f6',
    background: 'rgba(59, 130, 246, 0.1)',
  },
  avgTemp: {
    border: '#f97316',
    background: 'rgba(249, 115, 22, 0.1)',
  },
};

export const windDirectionColors = [
  'rgba(59, 130, 246, 0.8)',
  'rgba(16, 185, 129, 0.8)',
  'rgba(245, 158, 11, 0.8)',
  'rgba(239, 68, 68, 0.8)',
  'rgba(139, 92, 246, 0.8)',
];
