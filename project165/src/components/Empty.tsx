import { Inbox } from 'lucide-react';

interface EmptyProps {
  message?: string;
}

export default function Empty({ message = '暂无数据' }: EmptyProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center py-12">
      <Inbox className="h-12 w-12 text-navy-300" />
      <p className="mt-3 text-sm text-navy-300">{message}</p>
    </div>
  );
}
