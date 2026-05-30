import { useEffect, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import {
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  X,
} from 'lucide-react';

type VariantType = 'default' | 'danger' | 'warning' | 'success';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: VariantType;
  icon?: ReactNode;
  isLoading?: boolean;
  className?: string;
}

const variantStyles: Record<VariantType, { iconBg: string; iconColor: string; confirmBtn: string }> = {
  default: {
    iconBg: 'bg-primary-100',
    iconColor: 'text-primary-600',
    confirmBtn: 'bg-primary-600 hover:bg-primary-700',
  },
  danger: {
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    confirmBtn: 'bg-red-600 hover:bg-red-700',
  },
  warning: {
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    confirmBtn: 'bg-yellow-600 hover:bg-yellow-700',
  },
  success: {
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    confirmBtn: 'bg-green-600 hover:bg-green-700',
  },
};

const defaultIcons: Record<VariantType, ReactNode> = {
  default: <AlertCircle className='w-6 h-6' />,
  danger: <AlertCircle className='w-6 h-6' />,
  warning: <AlertTriangle className='w-6 h-6' />,
  success: <CheckCircle className='w-6 h-6' />,
};

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = '确认',
  cancelText = '取消',
  variant = 'default',
  icon,
  isLoading = false,
  className,
}: ConfirmModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const styles = variantStyles[variant];
  const displayIcon = icon || defaultIcons[variant];

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      <div
        className='absolute inset-0 bg-black/50 backdrop-blur-sm'
        onClick={onClose}
      />

      <div
        className={cn(
          'relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 transform transition-all',
          className
        )}
      >
        <button
          onClick={onClose}
          className='absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 transition-colors'
          aria-label='关闭'
        >
          <X className='w-5 h-5 text-gray-500' />
        </button>

        <div className='flex items-center gap-4 mb-4'>
          <div
            className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0',
              styles.iconBg
            )}
          >
            <div className={styles.iconColor}>{displayIcon}</div>
          </div>
          <div className='flex-1'>
            <h3 className='text-lg font-semibold text-gray-900'>{title}</h3>
          </div>
        </div>

        {description && (
          <p className='text-gray-600 mb-6 ml-16'>{description}</p>
        )}

        <div className='flex items-center justify-end gap-3'>
          <button
            onClick={onClose}
            disabled={isLoading}
            className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              'px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2',
              styles.confirmBtn
            )}
          >
            {isLoading && (
              <svg className='animate-spin h-4 w-4' viewBox='0 0 24 24'>
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                  fill='none'
                />
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                />
              </svg>
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
