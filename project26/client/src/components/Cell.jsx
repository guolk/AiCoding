import React from 'react';

function Cell({
  value,
  row,
  col,
  isInitial,
  isSelected,
  isHighlighted,
  isSameNumber,
  isError,
  isCorrect,
  notes,
  isNoteMode,
  animationType,
  onClick
}) {
  const cellClasses = [
    'cell',
    isSelected ? 'selected' : '',
    isHighlighted ? 'highlighted' : '',
    isSameNumber && value !== 0 ? 'same-number' : '',
    isError ? 'error' : '',
    isCorrect ? 'correct' : '',
    isInitial ? 'initial' : value !== 0 ? 'user-input' : '',
    animationType === 'fill' ? 'animating-fill' : '',
    animationType === 'backtrack' ? 'animating-backtrack' : ''
  ].filter(Boolean).join(' ');

  const renderContent = () => {
    if (value !== 0) {
      return <span>{value}</span>;
    }
    
    if (notes && notes.size > 0) {
      return (
        <div className="note-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <span key={num} className="note">
              {notes.has(num) ? num : ''}
            </span>
          ))}
        </div>
      );
    }
    
    return null;
  };

  return (
    <div
      className={cellClasses}
      onClick={() => onClick(row, col)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick(row, col);
        }
      }}
    >
      {renderContent()}
    </div>
  );
}

export default React.memo(Cell);
