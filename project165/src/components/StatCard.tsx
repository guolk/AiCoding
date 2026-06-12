interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  color?: string;
}

export default function StatCard({ title, value, icon, trend, color }: StatCardProps) {
  return (
    <div className="card-glow rounded-xl bg-navy-700/50 p-5">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-500/20">
          <span className={color ?? 'text-accent-500'}>{icon}</span>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-sm text-navy-200">{title}</p>
        <p className="font-display text-3xl font-bold text-white">{value}</p>
        {trend && <p className="mt-1 text-xs text-navy-300">{trend}</p>}
      </div>
    </div>
  );
}
