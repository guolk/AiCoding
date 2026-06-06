import { Plus, FileText } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className="w-20 h-20 rounded-full bg-cream-100 flex items-center justify-center mb-6">
        {icon || <FileText className="w-10 h-10 text-slate-400" />}
      </div>
      <h3 className="font-display text-xl font-semibold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-500 font-sans max-w-md mb-6">{description}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-secondary">
          <Plus className="w-5 h-5" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
