import { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface DataTableColumn<T> {
  key: string
  title: string
  render?: (value: T, index: number) => ReactNode
  width?: string | number
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  loading?: boolean
  onRowClick?: (row: T, index: number) => void
}

export default function DataTable<T extends object>({
  columns,
  data,
  loading = false,
  onRowClick,
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50">
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600"
                style={{ width: column.width }}
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12">
                <div className="flex items-center justify-center gap-2 text-gray-500">
                  <Loader2 size={20} className="animate-spin" />
                  <span>加载中...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-500">
                暂无数据
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={cn(
                  'transition-colors',
                  rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/50',
                  onRowClick && 'cursor-pointer hover:bg-primary-50'
                )}
                onClick={() => onRowClick?.(row, rowIndex)}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 text-sm text-gray-700">
                    {column.render
                      ? column.render(row, rowIndex)
                      : ((row as Record<string, unknown>)[column.key] as ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
