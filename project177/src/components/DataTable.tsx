import { useState } from 'react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface Column<T> {
  key: keyof T | string
  title: string
  width?: string | number
  render?: (row: T, index: number) => ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  selectable?: boolean
  onRowClick?: (row: T, index: number) => void
  rowKey?: keyof T | ((row: T, index: number) => string)
}

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  selectable = false,
  onRowClick,
  rowKey,
}: DataTableProps<T>) {
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [allSelected, setAllSelected] = useState(false)

  const getRowKey = (row: T, index: number): string => {
    if (typeof rowKey === 'function') return rowKey(row, index)
    if (rowKey) return String(row[rowKey])
    return String(index)
  }

  const toggleAll = () => {
    if (allSelected) {
      setSelectedRows(new Set())
      setAllSelected(false)
    } else {
      setSelectedRows(new Set(data.map((_, i) => i)))
      setAllSelected(true)
    }
  }

  const toggleRow = (index: number) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedRows(newSelected)
    setAllSelected(newSelected.size === data.length)
  }

  return (
    <div className="overflow-x-auto border border-dark-600 bg-dark-850">
      <table className="min-w-full divide-y divide-dark-700">
        <thead>
          <tr>
            {selectable && (
              <th className="w-12 px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="w-4 h-4 bg-dark-800 border-dark-600 text-racing-green focus:ring-racing-green/50 cursor-pointer"
                />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={String(col.key)}
                style={{ width: col.width }}
                className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-dark-600 bg-dark-850"
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-dark-700">
          {data.map((row, rowIndex) => (
            <tr
              key={getRowKey(row, rowIndex)}
              onClick={() => onRowClick?.(row, rowIndex)}
              className={cn(
                'transition-colors duration-150',
                rowIndex % 2 === 0 ? 'bg-dark-850' : 'bg-dark-800',
                onRowClick && 'cursor-pointer hover:bg-dark-750',
                selectedRows.has(rowIndex) && 'bg-racing-green/5'
              )}
            >
              {selectable && (
                <td className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.has(rowIndex)}
                    onChange={(e) => {
                      e.stopPropagation()
                      toggleRow(rowIndex)
                    }}
                    className="w-4 h-4 bg-dark-800 border-dark-600 text-racing-green focus:ring-racing-green/50 cursor-pointer"
                  />
                </td>
              )}
              {columns.map((col) => (
                <td
                  key={String(col.key)}
                  style={{ width: col.width }}
                  className="px-4 py-3 text-sm text-gray-300"
                >
                  {col.render
                    ? col.render(row, rowIndex)
                    : String(row[col.key as keyof T] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="py-12 text-center text-gray-500 text-sm">
          暂无数据
        </div>
      )}
    </div>
  )
}
