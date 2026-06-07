import { AlertTriangle, AlertCircle, Info, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { AlertItem } from '@/../shared/types';
import { cn } from '@/lib/utils';

const alertIcons = {
  danger: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const alertColors = {
  danger: 'border-danger-500/30 bg-danger-500/10 text-danger-500',
  warning: 'border-warning-500/30 bg-warning-500/10 text-warning-500',
  info: 'border-primary-500/30 bg-primary-500/10 text-primary-400',
};

interface AlertListProps {
  alerts: AlertItem[];
}

export function AlertList({ alerts }: AlertListProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-3">
      {alerts.map((alert, index) => {
        const Icon = alertIcons[alert.type];
        return (
          <div
            key={alert.id}
            className={cn(
              'flex items-start gap-3 p-3 rounded-lg border transition-all hover:scale-[1.01] cursor-pointer',
              alertColors[alert.type]
            )}
            style={{
              animationDelay: `${index * 50}ms`,
              opacity: 0,
              animation: `fadeInUp 0.4s ease-out ${100 + index * 50}ms forwards`,
            }}
            onClick={() => alert.link && navigate(alert.link)}
          >
            <Icon size={20} className="flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm">{alert.message}</p>
              <p className="text-xs text-gray-500 mt-1">{alert.createdAt}</p>
            </div>
            {alert.link && (
              <ArrowRight size={16} className="flex-shrink-0 opacity-60" />
            )}
          </div>
        );
      })}
    </div>
  );
}
