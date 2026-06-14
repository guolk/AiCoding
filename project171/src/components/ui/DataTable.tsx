import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: keyof T;
  title: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T extends object> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  className?: string;
}

type SortDirection = 'asc' | 'desc' | null;

interface SortState<T> {
  key: keyof T | null;
  direction: SortDirection;
}

export default function DataTable<T extends object>({
  columns,
  data,
  onRowClick,
  className,
}: DataTableProps<T>) {
  const [sortState, setSortState] = useState<SortState<T>>({
    key: null,
    direction: null,
  });

  const sortedData = useMemo(() => {
    if (!sortState.key || !sortState.direction) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortState.key!];
      const bVal = b[sortState.key!];

      if (aVal === bVal) return 0;

      const compare = aVal < bVal ? -1 : 1;
      return sortState.direction === 'asc' ? compare : -compare;
    });
  }, [data, sortState]);

  const handleSort = (key: keyof T) => {
    setSortState((prev) => {
      if (prev.key !== key) {
        return { key, direction: 'asc' };
      }
      if (prev.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return { key: null, direction: null };
    });
  };

  const getSortIcon = (key: keyof T, sortable?: boolean) => {
    if (!sortable) return null;

    if (sortState.key !== key) {
      return <ChevronsUpDown size={14} className="text-forest-300" />;
    }
    if (sortState.direction === 'asc') {
      return <ChevronUp size={14} className="text-terracotta-500" />;
    }
    return <ChevronDown size={14} className="text-terracotta-500" />;
  };

  return (
    <div className={cn('bg-white rounded-2xl shadow-soft overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-forest-50">
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={cn(
                    'px-6 py-4 text-left text-sm font-semibold text-forest-500 whitespace-nowrap',
                    column.sortable && 'cursor-pointer hover:bg-forest-100 transition-colors select-none',
                    column.className
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.title}
                    {getSortIcon(column.key, column.sortable)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-forest-100">
            {sortedData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  'transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-terracotta-50',
                  !onRowClick && 'hover:bg-forest-50'
                )}
              >
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className={cn(
                      'px-6 py-4 text-sm text-forest-500',
                      column.className
                    )}
                  >
                    {column.render
                      ? column.render(row[column.key], row)
                      : String(row[column.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length === 0 && (
        <div className="px-6 py-12 text-center text-forest-400">
          暂无数据
        </div>
      )}
    </div>
  );
}
