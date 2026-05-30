import { Music, Plus } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  title,
  description,
  icon,
  action
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-20 h-20 bg-parchment-200 rounded-full flex items-center justify-center mb-6">
        {icon || <Music className="w-10 h-10 text-burgundy-400" />}
      </div>
      <h3 className="font-display text-xl font-medium text-gray-700 mb-2">
        {title}
      </h3>
      <p className="text-gray-500 max-w-sm mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 btn-primary"
        >
          <Plus className="w-4 h-4" />
          {action.label}
        </button>
      )}
    </div>
  );
}
