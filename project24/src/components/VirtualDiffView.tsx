import React, { useMemo } from 'react';
import { VariableSizeList as List } from 'react-window';
import { DiffLine, ViewMode, getLineHeight } from '../utils/diffEngine';
import { DiffLineComponent } from './DiffLine';

interface VirtualDiffViewProps {
  lines: DiffLine[];
  viewMode: ViewMode;
  onExpandCollapsed?: (index: number) => void;
  height?: number;
  width?: number;
}

const COLLAPSED_LINE_HEIGHT = 36;

export const VirtualDiffView: React.FC<VirtualDiffViewProps> = ({
  lines,
  viewMode,
  onExpandCollapsed,
  height = 600,
  width
}) => {
  const listRef = React.useRef<List>(null);

  const getItemSize = useMemo(() => {
    return (index: number): number => {
      const line = lines[index];
      if (line.isCollapsed) {
        return COLLAPSED_LINE_HEIGHT;
      }
      return getLineHeight();
    };
  }, [lines]);

  const itemData = useMemo(() => {
    return { lines, viewMode, onExpandCollapsed };
  }, [lines, viewMode, onExpandCollapsed]);

  React.useEffect(() => {
    if (listRef.current) {
      listRef.current.resetAfterIndex(0);
    }
  }, [lines]);

  const RenderRow = ({
    index,
    style,
    data
  }: {
    index: number;
    style: React.CSSProperties;
    data: typeof itemData;
  }) => {
    const line = data.lines[index];
    return (
      <DiffLineComponent
        line={line}
        viewMode={data.viewMode}
        onExpandCollapsed={() => data.onExpandCollapsed?.(index)}
        style={style}
      />
    );
  };

  const totalItems = lines.length;

  if (totalItems === 0) {
    return (
      <div className="diff-view">
        <p style={{ padding: '20px', textAlign: 'center', color: '#586069' }}>
          暂无差异数据
        </p>
      </div>
    );
  }

  const tableHeader = viewMode === 'side-by-side' ? (
    <thead>
      <tr>
        <th style={{ width: '50px' }}>#</th>
        <th style={{ width: '20px' }}></th>
        <th>左侧代码</th>
        <th style={{ width: '50px' }}>#</th>
        <th style={{ width: '20px' }}></th>
        <th>右侧代码</th>
      </tr>
    </thead>
  ) : (
    <thead>
      <tr>
        <th style={{ width: '50px' }}>旧</th>
        <th style={{ width: '50px' }}>新</th>
        <th style={{ width: '20px' }}></th>
        <th>代码</th>
      </tr>
    </thead>
  );

  return (
    <div className="diff-container">
      <div className="diff-view" style={{ overflow: 'hidden' }}>
        <table className="diff-table">
          {tableHeader}
          <tbody>
            {totalItems <= 500 ? (
              lines.map((line, index) => (
                <DiffLineComponent
                  key={line.id}
                  line={line}
                  viewMode={viewMode}
                  onExpandCollapsed={() => onExpandCollapsed?.(index)}
                />
              ))
            ) : (
              <List
                ref={listRef}
                height={height}
                itemCount={totalItems}
                itemSize={getItemSize}
                width={width || '100%'}
                itemData={itemData}
                style={{ overflowX: 'auto' }}
              >
                {RenderRow}
              </List>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
