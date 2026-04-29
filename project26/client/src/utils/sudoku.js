export function gridToString(grid) {
  return grid.flat().map(n => n === 0 ? '.' : n).join('');
}

export function stringToGrid(str) {
  if (str.length !== 81) return null;
  const grid = [];
  for (let i = 0; i < 9; i++) {
    const row = [];
    for (let j = 0; j < 9; j++) {
      const char = str[i * 9 + j];
      row.push(char === '.' ? 0 : parseInt(char));
    }
    grid.push(row);
  }
  return grid;
}

export function deepCloneGrid(grid) {
  return grid.map(row => [...row]);
}

export function deepCloneNotes(notes) {
  return notes.map(row => row.map(cell => new Set(cell)));
}

export function createEmptyGrid() {
  return Array(9).fill(null).map(() => Array(9).fill(0));
}

export function createEmptyNotes() {
  return Array(9).fill(null).map(() => 
    Array(9).fill(null).map(() => new Set())
  );
}

export function isInSameRow(row1, row2) {
  return row1 === row2;
}

export function isInSameColumn(col1, col2) {
  return col1 === col2;
}

export function isInSameBox(row1, col1, row2, col2) {
  const box1 = Math.floor(row1 / 3) * 3 + Math.floor(col1 / 3);
  const box2 = Math.floor(row2 / 3) * 3 + Math.floor(col2 / 3);
  return box1 === box2;
}

export function getRelatedCells(row, col) {
  const cells = [];
  
  for (let i = 0; i < 9; i++) {
    if (i !== col) cells.push({ row, col: i });
    if (i !== row) cells.push({ row: i, col });
  }
  
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const r = startRow + i;
      const c = startCol + j;
      if (r !== row || c !== col) {
        if (!cells.some(cell => cell.row === r && cell.col === c)) {
          cells.push({ row: r, col: c });
        }
      }
    }
  }
  
  return cells;
}

export function validatePartial(grid) {
  for (let i = 0; i < 9; i++) {
    const rowSet = new Set();
    const colSet = new Set();
    
    for (let j = 0; j < 9; j++) {
      const rowVal = grid[i][j];
      const colVal = grid[j][i];
      
      if (rowVal !== 0) {
        if (rowSet.has(rowVal)) return { valid: false, row: i, col: j, type: 'row' };
        rowSet.add(rowVal);
      }
      
      if (colVal !== 0) {
        if (colSet.has(colVal)) return { valid: false, row: j, col: i, type: 'column' };
        colSet.add(colVal);
      }
    }
  }
  
  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      const boxSet = new Set();
      const startRow = boxRow * 3;
      const startCol = boxCol * 3;
      
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const val = grid[startRow + i][startCol + j];
          if (val !== 0) {
            if (boxSet.has(val)) {
              return { 
                valid: false, 
                row: startRow + i, 
                col: startCol + j, 
                type: 'box' 
              };
            }
            boxSet.add(val);
          }
        }
      }
    }
  }
  
  return { valid: true };
}

export function findErrors(grid) {
  const errors = [];
  
  for (let i = 0; i < 9; i++) {
    const rowMap = new Map();
    const colMap = new Map();
    
    for (let j = 0; j < 9; j++) {
      const rowVal = grid[i][j];
      const colVal = grid[j][i];
      
      if (rowVal !== 0) {
        if (rowMap.has(rowVal)) {
          errors.push({ row: i, col: j });
          errors.push(rowMap.get(rowVal));
        } else {
          rowMap.set(rowVal, { row: i, col: j });
        }
      }
      
      if (colVal !== 0) {
        if (colMap.has(colVal)) {
          errors.push({ row: j, col: i });
          errors.push(colMap.get(colVal));
        } else {
          colMap.set(colVal, { row: j, col: i });
        }
      }
    }
  }
  
  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      const boxMap = new Map();
      const startRow = boxRow * 3;
      const startCol = boxCol * 3;
      
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const val = grid[startRow + i][startCol + j];
          if (val !== 0) {
            if (boxMap.has(val)) {
              errors.push({ row: startRow + i, col: startCol + j });
              errors.push(boxMap.get(val));
            } else {
              boxMap.set(val, { row: startRow + i, col: startCol + j });
            }
          }
        }
      }
    }
  }
  
  const uniqueErrors = [];
  const seen = new Set();
  
  for (const error of errors) {
    const key = `${error.row}-${error.col}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueErrors.push(error);
    }
  }
  
  return uniqueErrors;
}

export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function parseTime(timeStr) {
  const parts = timeStr.split(':');
  if (parts.length !== 2) return 0;
  const mins = parseInt(parts[0], 10) || 0;
  const secs = parseInt(parts[1], 10) || 0;
  return mins * 60 + secs;
}

export function getNextEditableCell(grid, initialGrid, currentRow, currentCol) {
  if (!grid || !initialGrid) return null;
  
  for (let i = currentRow; i < 9; i++) {
    let startCol = (i === currentRow) ? currentCol + 1 : 0;
    for (let j = startCol; j < 9; j++) {
      if (initialGrid[i][j] === 0 && grid[i][j] === 0) {
        return { row: i, col: j };
      }
    }
  }
  
  for (let i = 0; i <= currentRow; i++) {
    let endCol = (i === currentRow) ? currentCol : 9;
    for (let j = 0; j < endCol; j++) {
      if (initialGrid[i][j] === 0 && grid[i][j] === 0) {
        return { row: i, col: j };
      }
    }
  }
  
  return null;
}
