import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({
  children,
  className,
  hover = false,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl shadow-card border border-gray-100 dark:bg-gray-900 dark:border-gray-800 transition-all duration-300",
        hover && "hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

Card.Header = function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div
      className={cn(
        "px-6 py-4 border-b border-gray-100 dark:border-gray-800",
        className
      )}
    >
      {children}
    </div>
  );
};

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

Card.Title = function CardTitle({ children, className }: CardTitleProps) {
  return (
    <h3 className={cn("text-lg font-semibold text-gray-900 dark:text-white", className)}>
      {children}
    </h3>
  );
};

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

Card.Body = function CardBody({ children, className }: CardBodyProps) {
  return <div className={cn("p-6", className)}>{children}</div>;
};

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

Card.Footer = function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div
      className={cn(
        "px-6 py-4 border-t border-gray-100 dark:border-gray-800",
        className
      )}
    >
      {children}
    </div>
  );
};
