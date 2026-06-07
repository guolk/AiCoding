import * as React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

type StatCardVariant = "primary" | "accent" | "danger" | "success";

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  trend?: number;
  variant?: StatCardVariant;
  icon?: React.ReactNode;
  prefix?: string;
  suffix?: string;
}

function StatCard({
  title,
  value,
  trend,
  variant = "primary",
  icon,
  prefix,
  suffix,
  className,
  ...props
}: StatCardProps) {
  const [displayValue, setDisplayValue] = React.useState(0);
  const numericValue = typeof value === "string" ? parseFloat(value) || 0 : value;

  React.useEffect(() => {
    const duration = 1000;
    const start = 0;
    const end = numericValue;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(start + (end - start) * easeOut);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [numericValue]);

  const formatDisplayValue = (val: number) => {
    if (typeof value === "string") {
      return value;
    }
    if (val >= 1000000) {
      return (val / 1000000).toFixed(1) + "M";
    }
    if (val >= 1000) {
      return (val / 1000).toFixed(1) + "K";
    }
    return Math.round(val).toLocaleString();
  };

  const variantStyles = {
    primary: {
      text: "text-primary-700",
      bg: "bg-primary-100",
      border: "border-primary-200",
    },
    accent: {
      text: "text-accent-600",
      bg: "bg-accent-100",
      border: "border-accent-200",
    },
    danger: {
      text: "text-danger-600",
      bg: "bg-danger-100",
      border: "border-danger-200",
    },
    success: {
      text: "text-success-600",
      bg: "bg-success-100",
      border: "border-success-200",
    },
  };

  const styles = variantStyles[variant];
  const isPositive = trend !== undefined && trend >= 0;

  return (
    <div
      className={cn("stat-card", variant, "animate-scale-in", className)}
      {...props}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-bold text-slate-900">
            {prefix}
            {formatDisplayValue(displayValue)}
            {suffix}
          </p>
          {trend !== undefined && (
            <div className={cn(
              "flex items-center gap-1 text-sm font-medium",
              isPositive ? "text-success-600" : "text-danger-600"
            )}>
              {isPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span>{Math.abs(trend)}%</span>
              <span className="text-slate-500 font-normal">较上期</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={cn(
            "p-3 rounded-xl",
            styles.bg,
            styles.text,
            "transition-transform duration-300 hover:scale-110"
          )}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

export { StatCard };
