import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from './Button';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: ReactNode;
  footer?: ReactNode;
  width?: string | number;
  maskClosable?: boolean;
  className?: string;
}

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  width = 520,
  maskClosable = true,
  className,
}: ModalProps) {
  // 阻止 body 滚动 + ESC 键关闭
  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  // 默认底部操作区
  const defaultFooter = (
    <div className="flex justify-end gap-3">
      <Button variant="secondary" onClick={onClose}>
        取消
      </Button>
      <Button onClick={onClose}>确定</Button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 遮罩层 */}
      <div
        className={cn(
          'absolute inset-0 bg-black/50 transition-opacity',
        )}
        onClick={() => maskClosable && onClose()}
      />

      {/* 模态框内容 */}
      <div
        className={cn(
          'relative z-10 flex flex-col rounded-xl bg-white shadow-2xl',
          'animate-[fadeIn_0.2s_ease-out]',
          className,
        )}
        style={{ width: typeof width === 'number' ? `${width}px` : width }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题栏 */}
        {(title || true) && (
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h3 className="text-[16px] font-semibold text-gray-900">
              {title || '提示'}
            </h3>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* 内容区 */}
        <div className="flex-1 px-6 py-5 max-h-[70vh] overflow-y-auto">
          {children || <p className="text-gray-600">确认执行此操作？</p>}
        </div>

        {/* 底部操作区 */}
        {(footer !== null) && (
          <div className="border-t border-gray-100 px-6 py-4">
            {footer || defaultFooter}
          </div>
        )}
      </div>
    </div>
  );
}
