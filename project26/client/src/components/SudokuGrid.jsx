import React from 'react';
import Cell from './Cell';
import { getRelatedCells } from '../utils/sudoku';

function SudokuGrid({
  grid,
  initialGrid,
  notes,
  selectedCell,
  onCellClick,
  errors = [],
  correctCells = [],
  animationCells = {},
  highlightSameNumber = true
}) {
  const getHighlightedCells = () => {
    if (!selectedCell) return new Set();
    
    const { row, col } = selectedCell;
    const related = getRelatedCells(row, col);
    const highlighted = new Set(related.map(c => `${c.row}-${c.col}`));
    highlighted.add(`${row}-${col}`);
    
    return highlighted;
  };

  const getSameNumberCells = () => {
    if (!selectedCell || !highlightSameNumber) return new Set();
    
    const { row, col } = selectedCell;
    const value = grid[row][col];
    
    if (value === 0) return new Set();
    
    const sameNumbers = new Set();
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (grid[i][j] === value) {
          sameNumbers.add(`${i}-${j}`);
        }
      }
    }
    
    return sameNumbers;
  };

  const getErrorCells = () => {
    const errorSet = new Set();
    for (const error of errors) {
      errorSet.add(`${error.row}-${error.col}`);
    }
    return errorSet;
  };

  const getCorrectCells = () => {
    const correctSet = new Set();
    for (const cell of correctCells) {
      correctSet.add(`${cell.row}-${cell.col}`);
    }
    return correctSet;
  };

  const highlightedCells = getHighlightedCells();
  const sameNumberCells = getSameNumberCells();
  const errorCells = getErrorCells();
  const correctCellsSet = getCorrectCells();

  const renderCells = () => {
    const cells = [];
    
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        const key = `${i}-${j}`;
        const isSelected = selectedCell && selectedCell.row === i && selectedCell.col === j;
        const isHighlighted = highlightedCells.has(key);
        const isSameNumber = sameNumberCells.has(key);
        const isError = errorCells.has(key);
        const isCorrect = correctCellsSet.has(key);
        const isInitial = initialGrid && initialGrid[i][j] !== 0;
        const animationType = animationCells[key];
        const cellNotes = notes ? notes[i][j] : null;
        
        cells.push(
          <Cell
            key={key}
            value={grid[i][j]}
            row={i}
            col={j}
            isInitial={isInitial}
            isSelected={isSelected}
            isHighlighted={isHighlighted && !isSelected}
            isSameNumber={isSameNumber && !isSelected}
            isError={isError}
            isCorrect={isCorrect}
            notes={cellNotes}
            animationType={animationType}
            onClick={onCellClick}
          />
        );
      }
    }
    
    return cells;
  };

  return (
    <div className="sudoku-grid">
      {renderCells()}
    </div>
  );
}

export default React.memo(SudokuGrid);
