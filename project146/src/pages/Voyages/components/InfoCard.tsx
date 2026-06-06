import type { LucideIcon } from 'lucide-react';

interface InfoCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  color?: string;
}

export default function InfoCard({ icon: Icon, label, value, color = 'ocean' }: InfoCardProps) {
  const colorClasses: Record<string, string> = {
    ocean: 'bg-ocean-100 text-ocean-600',
    nautical: 'bg-nautical-100 text-nautical-600',
    green: 'bg-green-100 text-green-600',
    gray: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="card p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
          <p className="font-semibold text-ocean-800">{value}</p>
        </div>
      </div>
    </div>
  );
}
