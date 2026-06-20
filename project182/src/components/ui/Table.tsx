import * as React from "react"
import { cn } from "@/lib/utils"

export interface TableColumn<T> {
  key: keyof T | string
  header: React.ReactNode
  accessor?: keyof T | ((row: T) => React.ReactNode)
  align?: "left" | "center" | "right"
  width?: string
}

export interface TableProps<T> extends React.HTMLAttributes<HTMLDivElement> {
  columns: TableColumn<T>[]
  data: T[]
  rowKey?: keyof T | ((row: T) => string)
  hoverable?: boolean
  striped?: boolean
  emptyText?: string
  onRowClick?: (row: T, index: number) => void
}

function Table<T extends object>({
  columns,
  data,
  rowKey,
  hoverable = true,
  striped = true,
  emptyText = "暂无数据",
  onRowClick,
  className,
  ...props
}: TableProps<T>) {
  const getRowKey = (row: T, index: number): string => {
    if (rowKey) {
      if (typeof rowKey === "function") {
        return rowKey(row)
      }
      return String(row[rowKey])
    }
    return String(index)
  }

  const getCellValue = (row: T, column: TableColumn<T>): React.ReactNode => {
    if (column.accessor) {
      if (typeof column.accessor === "function") {
        return column.accessor(row)
      }
      return (row as Record<string, unknown>)[column.accessor as string] as React.ReactNode
    }
    return (row as Record<string, unknown>)[column.key as string] as React.ReactNode
  }

  const alignments: Record<NonNullable<TableColumn<T>["align"]>, string> = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }

  return (
    <div className={cn("w-full overflow-hidden rounded-2xl bg-white shadow-card", className)} {...props}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-warmGray-50">
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={cn(
                    "px-4 py-3 text-xs font-semibold text-warmGray-500 uppercase tracking-wider",
                    alignments[column.align || "left"],
                    column.width
                  )}
                  style={{ width: column.width }}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-warmGray-100">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-warmGray-400"
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={getRowKey(row, index)}
                  className={cn(
                    "transition-colors",
                    striped && index % 2 === 0 && "bg-warmGray-50/50",
                    hoverable && "hover:bg-primary-50/50",
                    onRowClick && "cursor-pointer"
                  )}
                  onClick={() => onRowClick?.(row, index)}
                >
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className={cn(
                        "px-4 py-4 whitespace-nowrap text-sm text-warmGray-700",
                        alignments[column.align || "left"]
                      )}
                    >
                      {getCellValue(row, column)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export { Table }
