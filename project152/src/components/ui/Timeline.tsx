import * as React from "react";
import { cn } from "@/lib/utils";

type TimelineVariant = "default" | "outlined";
type TimelinePosition = "left" | "right" | "alternate";

interface TimelineContextValue {
  variant: TimelineVariant;
  position: TimelinePosition;
}

const TimelineContext = React.createContext<TimelineContextValue | undefined>(undefined);

function useTimelineContext() {
  const context = React.useContext(TimelineContext);
  if (!context) {
    throw new Error("Timeline components must be used within a Timeline");
  }
  return context;
}

interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: TimelineVariant;
  position?: TimelinePosition;
  children: React.ReactNode;
}

function Timeline({
  className,
  variant = "default",
  position = "left",
  children,
  ...props
}: TimelineProps) {
  return (
    <TimelineContext.Provider value={{ variant, position }}>
      <div
        className={cn(
          "relative",
          position === "alternate" && "md:grid md:grid-cols-2 md:gap-4",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "absolute top-0 bottom-0 w-0.5 bg-slate-200",
            position === "left" && "left-4 md:left-4",
            position === "right" && "right-4 md:right-4",
            position === "alternate" && "left-1/2 -translate-x-1/2 hidden md:block"
          )}
          aria-hidden="true"
        />
        {React.Children.map(children, (child, index) => {
          if (!React.isValidElement(child)) return child;
          return React.cloneElement(child as React.ReactElement<any>, {
            index,
          });
        })}
      </div>
    </TimelineContext.Provider>
  );
}

interface TimelineItemProps extends React.HTMLAttributes<HTMLDivElement> {
  index?: number;
  children: React.ReactNode;
}

const TimelineItem = React.forwardRef<HTMLDivElement, TimelineItemProps>(
  ({ className, index = 0, children, ...props }, ref) => {
    const { position } = useTimelineContext();
    const isLeft = position === "alternate" && index % 2 === 0;
    const isRight = position === "alternate" && index % 2 === 1;

    return (
      <div
        ref={ref}
        className={cn(
          "relative pl-12 pb-8 last:pb-0 md:pb-12",
          position === "right" && "pl-0 pr-12",
          position === "alternate" && "pl-12 md:pl-0 md:pb-12",
          isRight && "md:pl-12",
          isLeft && "md:pr-12 md:text-right",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TimelineItem.displayName = "TimelineItem";

interface TimelineDotProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
}

const TimelineDot = React.forwardRef<HTMLDivElement, TimelineDotProps>(
  ({ className, icon, children, ...props }, ref) => {
    const { variant, position } = useTimelineContext();

    return (
      <div
        ref={ref}
        className={cn(
          "absolute top-0 flex items-center justify-center",
          position === "left" && "left-0 md:left-0",
          position === "right" && "right-0 md:right-0",
          position === "alternate" && "left-0 md:left-auto md:top-0",
          position === "alternate" && "[&]:md:left-1/2 [&]:md:-translate-x-1/2",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-white",
            "shadow-md transition-transform duration-300 hover:scale-110",
            variant === "default" && "bg-primary-700",
            variant === "outlined" && "bg-white border-2 border-primary-700 text-primary-700",
            icon && "bg-white"
          )}
        >
          {icon || children || (
            <div className={cn(
              "w-3 h-3 rounded-full",
              variant === "default" && "bg-white",
              variant === "outlined" && "bg-primary-700"
            )} />
          )}
        </div>
      </div>
    );
  }
);
TimelineDot.displayName = "TimelineDot";

interface TimelineDateProps extends React.HTMLAttributes<HTMLDivElement> {}

const TimelineDate = React.forwardRef<HTMLDivElement, TimelineDateProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("text-sm font-medium text-primary-700 mb-1", className)}
      {...props}
    />
  )
);
TimelineDate.displayName = "TimelineDate";

interface TimelineContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const TimelineContent = React.forwardRef<HTMLDivElement, TimelineContentProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "card p-4 transition-all duration-300 hover:shadow-card-hover",
        className
      )}
      {...props}
    />
  )
);
TimelineContent.displayName = "TimelineContent";

export { Timeline, TimelineItem, TimelineDot, TimelineContent, TimelineDate };
