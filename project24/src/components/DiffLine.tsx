import React from 'react';
import { DiffLine, CharDiff, ViewMode, getLineHeight } from '../utils/diffEngine';

interface CharDiffSpanProps {
  charDiff: CharDiff;
}

const CharDiffSpan: React.FC<CharDiffSpanProps> = ({ charDiff }) => {
  let className = '';
  if (charDiff.added) className = 'char-added';
  else if (charDiff.removed) className = 'char-removed';
  
  return (
    <span className={className}>
      {charDiff.value}
    </span>
  );
};

interface DiffLineProps {
  line: DiffLine;
  viewMode: ViewMode;
  onExpandCollapsed?: () => void;
  style?: React.CSSProperties;
}

export const DiffLineComponent: React.FC<DiffLineProps> = ({
  line,
  viewMode,
  onExpandCollapsed,
  style
}) => {
  const lineClass = `line-${line.type}`;
  const lineHeight = getLineHeight();

  const renderContent = (content: string, charDiffs?: CharDiff[]) => {
    if (charDiffs && charDiffs.length > 0) {
      return charDiffs.map((charDiff, index) => (
        <CharDiffSpan key={index} charDiff={charDiff} />
      ));
    }
    return content;
  };

  if (line.isCollapsed) {
    return (
      <tr style={style} onClick={onExpandCollapsed}>
        <td colSpan={viewMode === 'side-by-side' ? 6 : 4} className="collapsed-section">
          ... 已折叠 {line.collapsedLines} 行未改变的代码 (点击展开) ...
        </td>
      </tr>
    );
  }

  if (viewMode === 'side-by-side') {
    if (line.type === 'added') {
      return (
        <tr className={lineClass} style={{ ...style, height: lineHeight }}>
          <td className="line-number"></td>
          <td className="line-type"></td>
          <td className="line-content empty-line"></td>
          <td className="line-number">{line.rightLineNumber}</td>
          <td className="line-type">+</td>
          <td className="line-content">
            {renderContent(line.rightContent, line.charDiffsRight)}
          </td>
        </tr>
      );
    }

    if (line.type === 'removed') {
      return (
        <tr className={lineClass} style={{ ...style, height: lineHeight }}>
          <td className="line-number">{line.leftLineNumber}</td>
          <td className="line-type">-</td>
          <td className="line-content">
            {renderContent(line.leftContent, line.charDiffsLeft)}
          </td>
          <td className="line-number"></td>
          <td className="line-type"></td>
          <td className="line-content empty-line"></td>
        </tr>
      );
    }

    if (line.type === 'modified') {
      return (
        <tr className={lineClass} style={{ ...style, height: lineHeight }}>
          <td className="line-number">{line.leftLineNumber}</td>
          <td className="line-type">~</td>
          <td className="line-content">
            {renderContent(line.leftContent, line.charDiffsLeft)}
          </td>
          <td className="line-number">{line.rightLineNumber}</td>
          <td className="line-type">~</td>
          <td className="line-content">
            {renderContent(line.rightContent, line.charDiffsRight)}
          </td>
        </tr>
      );
    }

    return (
      <tr className={lineClass} style={{ ...style, height: lineHeight }}>
        <td className="line-number">{line.leftLineNumber}</td>
        <td className="line-type"> </td>
        <td className="line-content">
          {line.leftContent}
        </td>
        <td className="line-number">{line.rightLineNumber}</td>
        <td className="line-type"> </td>
        <td className="line-content">
          {line.rightContent}
        </td>
      </tr>
    );
  }

  // Unified view
  if (line.type === 'added') {
    return (
      <tr className={lineClass} style={{ ...style, height: lineHeight }}>
        <td className="line-number"></td>
        <td className="line-number">{line.rightLineNumber}</td>
        <td className="line-type">+</td>
        <td className="line-content">
          {renderContent(line.rightContent, line.charDiffsRight)}
        </td>
      </tr>
    );
  }

  if (line.type === 'removed') {
    return (
      <tr className={lineClass} style={{ ...style, height: lineHeight }}>
        <td className="line-number">{line.leftLineNumber}</td>
        <td className="line-number"></td>
        <td className="line-type">-</td>
        <td className="line-content">
          {renderContent(line.leftContent, line.charDiffsLeft)}
        </td>
      </tr>
    );
  }

  if (line.type === 'modified') {
    return (
      <>
        <tr className="line-removed" style={{ ...style, height: lineHeight }}>
          <td className="line-number">{line.leftLineNumber}</td>
          <td className="line-number"></td>
          <td className="line-type">-</td>
          <td className="line-content">
            {renderContent(line.leftContent, line.charDiffsLeft)}
          </td>
        </tr>
        <tr className="line-added" style={{ ...style, height: lineHeight }}>
          <td className="line-number"></td>
          <td className="line-number">{line.rightLineNumber}</td>
          <td className="line-type">+</td>
          <td className="line-content">
            {renderContent(line.rightContent, line.charDiffsRight)}
          </td>
        </tr>
      </>
    );
  }

  return (
    <tr className={lineClass} style={{ ...style, height: lineHeight }}>
      <td className="line-number">{line.leftLineNumber}</td>
      <td className="line-number">{line.rightLineNumber}</td>
      <td className="line-type"> </td>
      <td className="line-content">
        {line.leftContent}
      </td>
    </tr>
  );
};
