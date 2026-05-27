import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {children}
        </div>
        {footer && (
          <div className="px-6 py-4 border-t border-neutral-100 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
