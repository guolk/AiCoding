import { Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { checkPasswordStrength, type PasswordStrength } from '@/utils/password';

interface PasswordStrengthMeterProps {
  password: string;
  showFeedback?: boolean;
}

const strengthConfig: Record<
  PasswordStrength,
  { label: string; color: string; bgColor: string; percentage: number }
> = {
  weak: {
    label: '弱',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-500',
    percentage: 25,
  },
  fair: {
    label: '一般',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-500',
    percentage: 50,
  },
  good: {
    label: '良好',
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-500',
    percentage: 75,
  },
  strong: {
    label: '强',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-500',
    percentage: 100,
  },
};

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  password,
  showFeedback = true,
}) => {
  const result = checkPasswordStrength(password);
  const config = strengthConfig[result.strength];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          密码强度
        </span>
        <span className={cn('text-sm font-semibold', config.color)}>
          {config.label}
        </span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            config.bgColor
          )}
          style={{ width: password ? `${config.percentage}%` : '0%' }}
        />
      </div>
      {showFeedback && result.feedback.length > 0 && (
        <div className="space-y-2 pt-2">
          {result.feedback.map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
            >
              {result.strength === 'strong' && index === result.feedback.length - 1 ? (
                <Check className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 mt-0.5 text-orange-500 flex-shrink-0" />
              )}
              <span>{item}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthMeter;
