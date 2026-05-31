
import type { ReactNode } from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  icon?: ReactNode;
  header?: ReactNode;
  onClick?: () => void;
  hover?: boolean;
}

const Card = ({ children, className = '', title, icon, header, onClick, hover = false }: CardProps) => {
  return (
    <div
      className={clsx(
        'bg-dark-card border border-dark-border rounded-xl overflow-hidden',
        hover && 'card-hover',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {(title || icon || header) && (
        <div className="border-b border-dark-border px-6 py-4">
          {(title || icon) && (
            <div className="flex items-center gap-3">
              {icon}
              {title && <h3 className="font-display text-lg font-semibold text-gold">{title}</h3>}
            </div>
          )}
          {header}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};

export default Card;
