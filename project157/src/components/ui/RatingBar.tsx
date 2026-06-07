interface RatingBarProps {
  label: string;
  value: number;
  max?: number;
  color: 'primary' | 'secondary' | 'pink' | 'green' | 'purple';
  showValue?: boolean;
}

const colorClasses = {
  primary: 'bg-primary-400',
  secondary: 'bg-secondary-400',
  pink: 'bg-accent-pink',
  green: 'bg-accent-green',
  purple: 'bg-accent-purple',
};

export default function RatingBar({ label, value, max = 10, color, showValue = true }: RatingBarProps) {
  const percentage = (value / max) * 100;

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-600">{label}</span>
        {showValue && (
          <span className="text-sm font-medium text-gray-800">{value}/{max}</span>
        )}
      </div>
      <div className="progress-bar">
        <div
          className={`progress-fill ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
