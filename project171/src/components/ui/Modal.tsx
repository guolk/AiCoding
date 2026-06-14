import { useEffect, ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  className?: string;
}

export default function Modal({
  isOpen,
  title,
  children,
  onClose,
  className,
}: ModalProps) {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-forest-500/30 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative bg-white rounded-2xl shadow-card w-full max-w-lg mx-4 animate-slide-up',
          className
        )}
      >
        <div className="flex items-center justify-between p-6 border-b border-forest-100">
          <h2 className="font-display text-xl font-bold text-forest-500">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-forest-400 hover:bg-forest-50 hover:text-forest-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
