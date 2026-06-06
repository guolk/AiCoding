import * as Dialog from '@radix-ui/react-dialog';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  variant?: 'danger' | 'default';
}

export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = '确认',
  cancelLabel = '取消',
  onConfirm,
  variant = 'danger',
}: ConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-fade-in z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-6 mx-4 animate-scale-in">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    variant === 'danger' ? 'bg-red-100' : 'bg-slate-100'
                  }`}
                >
                  <AlertTriangle
                    className={`w-6 h-6 ${variant === 'danger' ? 'text-red-600' : 'text-slate-600'}`}
                  />
                </div>
                <Dialog.Title className="font-display text-lg font-semibold text-slate-800">
                  {title}
                </Dialog.Title>
              </div>
              <Dialog.Close asChild>
                <button className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>
            <Dialog.Description className="text-slate-500 font-sans mb-6">
              {description}
            </Dialog.Description>
            <div className="flex justify-end gap-3">
              <Dialog.Close asChild>
                <button className="btn-outline text-sm py-2">{cancelLabel}</button>
              </Dialog.Close>
              <button
                onClick={() => {
                  onConfirm();
                  onOpenChange(false);
                }}
                className={`text-sm py-2 ${variant === 'danger' ? 'bg-red-600 hover:bg-red-700 text-white' : 'btn-primary'} inline-flex items-center justify-center gap-2 px-5 rounded-lg font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200`}
              >
                {confirmLabel}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
