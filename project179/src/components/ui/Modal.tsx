import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div
        className={cn(
          'relative w-full max-w-lg bg-white rounded-2xl shadow-2xl',
          'flex flex-col max-h-[90vh] animate-slide-up'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-forest-100">
          <h2 className="text-lg font-bold text-forest-800">{title}</h2>
          <button
            onClick={onClose}
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center',
              'text-forest-500 hover:bg-forest-50 hover:text-forest-700',
              'transition-colors duration-200'
            )}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 text-forest-700">
          {children}
        </div>

        {footer && (
          <div className="px-6 py-4 border-t border-forest-100 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
