import { Inbox } from 'lucide-react';

interface Props {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-20 h-20 rounded-full bg-primary-100/50 flex items-center justify-center mb-4">
        <Inbox className="w-10 h-10 text-ink-light" />
      </div>
      <h3 className="text-lg font-medium text-ink mb-2">{title}</h3>
      {description && (
        <p className="text-ink-light max-w-md mb-6">{description}</p>
      )}
      {action}
    </div>
  );
}
