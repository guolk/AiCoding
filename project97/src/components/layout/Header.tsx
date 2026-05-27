import { format } from 'date-fns';
import { Calendar } from 'lucide-react';

export function Header() {
  const today = format(new Date(), 'yyyy年MM月dd日');
  const dayOfWeek = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][new Date().getDay()];

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-background-hover">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-text-secondary">
            <Calendar className="w-5 h-5" />
            <span className="text-sm">{today}</span>
            <span className="text-sm text-primary font-medium">{dayOfWeek}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
              M
            </div>
            <span className="text-sm font-medium text-text-primary">数学竞赛选手</span>
          </div>
        </div>
      </div>
    </header>
  );
}
