import React from 'react';

function NumberPad({ onNumberClick, onDelete, isNoteMode, disabled }) {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="number-pad">
      {numbers.map(num => (
        <button
          key={num}
          className="num-btn"
          onClick={() => onNumberClick(num)}
          disabled={disabled}
        >
          {num}
        </button>
      ))}
      <button
        className="num-btn delete"
        onClick={onDelete}
        disabled={disabled}
      >
        ⌫
      </button>
    </div>
  );
}

export default React.memo(NumberPad);
