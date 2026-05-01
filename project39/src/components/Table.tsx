import { ReactNode, createContext, useContext, useState, useMemo } from 'react';

interface TableContextType {
  selectedRows: (string | number)[];
  toggleRow: (id: string | number) => void;
  toggleAll: () => void;
  allSelected: boolean;
  someSelected: boolean;
  getRowId: (row: unknown) => string | number;
}

const TableContext = createContext<TableContextType | undefined>(undefined);

function useTableContext() {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error('Table components must be used within a Table');
  }
  return context;
}

interface TableProps {
  children: ReactNode;
  getRowId?: (row: unknown) => string | number;
  selectable?: boolean;
  selectedRows?: (string | number)[];
  onSelectionChange?: (selected: (string | number)[]) => void;
  className?: string;
}

export function Table({
  children,
  getRowId = (row: unknown) => (row as { id: string | number }).id,
  selectable = false,
  selectedRows: externalSelected,
  onSelectionChange,
  className = '',
}: TableProps) {
  const [internalSelected, setInternalSelected] = useState<(string | number)[]>([]);

  const selectedRows = externalSelected ?? internalSelected;
  const setSelectedRows = onSelectionChange ?? setInternalSelected;

  const contextValue: TableContextType = {
    selectedRows,
    toggleRow: (id) => {
      const newSelected = selectedRows.includes(id)
        ? selectedRows.filter((r) => r !== id)
        : [...selectedRows, id];
      setSelectedRows(newSelected);
    },
    toggleAll: () => {
      setSelectedRows([]);
    },
    allSelected: false,
    someSelected: selectedRows.length > 0,
    getRowId,
  };

  return (
    <TableContext.Provider value={contextValue}>
      <div className={`overflow-x-auto ${className}`}>
        <table className="min-w-full divide-y divide-gray-200">{children}</table>
      </div>
    </TableContext.Provider>
  );
}

interface TableHeaderProps {
  children: ReactNode;
}

export function TableHeader({ children }: TableHeaderProps) {
  return (
    <thead className="bg-gray-50">
      <tr>{children}</tr>
    </thead>
  );
}

interface TableHeaderCellProps {
  children: ReactNode;
  selectAll?: boolean;
  className?: string;
}

export function TableHeaderCell({
  children,
  selectAll = false,
  className = '',
}: TableHeaderCellProps) {
  const { someSelected, allSelected, toggleAll, selectedRows } = useTableContext();

  if (selectAll) {
    return (
      <th
        className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12 ${className}`}
      >
        <input
          type="checkbox"
          checked={allSelected}
          ref={(el) => {
            if (el) {
              el.indeterminate = someSelected && !allSelected;
            }
          }}
          onChange={() => {
            if (someSelected) {
              toggleAll();
            }
          }}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </th>
    );
  }

  return (
    <th
      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}
    >
      {children}
    </th>
  );
}

interface TableBodyProps {
  children: ReactNode;
}

export function TableBody({ children }: TableBodyProps) {
  return (
    <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>
  );
}

interface TableRowProps {
  row: unknown;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function TableRow({ row, children, onClick, className = '' }: TableRowProps) {
  const { selectedRows, getRowId } = useTableContext();
  const id = getRowId(row);
  const isSelected = selectedRows.includes(id);

  return (
    <tr
      className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

interface TableCellProps {
  children: ReactNode;
  selectable?: boolean;
  row?: unknown;
  className?: string;
}

export function TableCell({ children, selectable = false, row, className = '' }: TableCellProps) {
  const { selectedRows, toggleRow, getRowId } = useTableContext();
  const isSelected = row ? selectedRows.includes(getRowId(row)) : false;

  if (selectable && row) {
    return (
      <td className={`px-6 py-4 whitespace-nowrap w-12 ${className}`}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            toggleRow(getRowId(row));
          }}
          onClick={(e) => e.stopPropagation()}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </td>
    );
  }

  return (
    <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${className}`}>
      {children}
    </td>
  );
}

interface TableEmptyProps {
  colSpan: number;
  message?: string;
}

export function TableEmpty({ colSpan, message = '暂无数据' }: TableEmptyProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-12 text-center text-gray-500">
        {message}
      </td>
    </tr>
  );
}

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    active: { label: '激活', className: 'bg-green-100 text-green-800' },
    inactive: { label: '禁用', className: 'bg-red-100 text-red-800' },
    pending: { label: '待审核', className: 'bg-yellow-100 text-yellow-800' },
  };

  const config = statusConfig[status] || statusConfig.inactive;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
