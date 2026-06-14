import type { ReactNode } from 'react';
import Empty from '../Empty';
import { cn } from '@/lib/utils';

// 表格列配置
export interface DataTableColumn<T = Record<string, unknown>> {
  key: string;
  title: string;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  render?: (row: T, index: number) => ReactNode;
}

export interface DataTableProps<T = Record<string, unknown>> {
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey?: keyof T | ((row: T, index: number) => string | number);
  className?: string;
  tableClassName?: string;
  emptyText?: string;
  showZebra?: boolean;
}

// 默认数据类型
export type DefaultRow = Record<string, unknown>;

export default function DataTable<T extends object = DefaultRow>({
  columns,
  data,
  rowKey,
  className,
  tableClassName,
  emptyText = '暂无数据',
  showZebra = true,
}: DataTableProps<T>) {
  // 获取行 key
  const getRowKey = (row: T, index: number): string | number => {
    if (typeof rowKey === 'function') return rowKey(row, index);
    if (typeof rowKey === 'string') {
      const val = row[rowKey];
      return val !== undefined && val !== null ? String(val) : index;
    }
    return index;
  };

  // 获取单元格内容
  const getCellContent = (column: DataTableColumn<T>, row: T, index: number) => {
    if (typeof column.render === 'function') {
      return column.render(row, index);
    }
    const value = row[column.key];
    return value !== undefined && value !== null ? String(value) : '-';
  };

  // 对齐方式样式
  const alignStyles = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <div
      className={cn(
        'w-full overflow-auto rounded-lg border border-gray-200 bg-white',
        className,
      )}
    >
      {data && data.length > 0 ? (
        <table
          className={cn(
            'w-full min-w-full border-collapse text-[14px]',
            tableClassName,
          )}
        >
          {/* 表头 */}
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-4 py-3 font-semibold text-gray-700 whitespace-nowrap',
                    alignStyles[column.align || 'left'],
                  )}
                  style={{
                    width:
                      typeof column.width === 'number'
                        ? `${column.width}px`
                        : column.width,
                  }}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>

          {/* 表体 */}
          <tbody>
            {data.map((row, index) => (
              <tr
                key={getRowKey(row, index)}
                className={cn(
                  'border-b border-gray-100 last:border-b-0 transition-colors',
                  'hover:bg-[#165DFF]/5',
                  showZebra && index % 2 === 1 ? 'bg-gray-50/50' : 'bg-white',
                )}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      'px-4 py-3 text-gray-600 whitespace-nowrap',
                      alignStyles[column.align || 'left'],
                    )}
                    style={{
                      width:
                        typeof column.width === 'number'
                          ? `${column.width}px`
                          : column.width,
                    }}
                  >
                    {getCellContent(column, row, index)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="flex flex-col items-center justify-center py-16">
          <Empty />
          <p className="mt-3 text-[14px] text-gray-400">{emptyText}</p>
        </div>
      )}
    </div>
  );
}
