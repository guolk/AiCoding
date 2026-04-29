function createEmptyGrid() {
  return Array(9).fill(null).map(() => Array(9).fill(0));
}

function isValid(grid, row, col, num) {
  for (let x = 0; x < 9; x++) {
    if (grid[row][x] === num) return false;
    if (grid[x][col] === num) return false;
  }
  
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[startRow + i][startCol + j] === num) return false;
    }
  }
  
  return true;
}

function findEmpty(grid) {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (grid[i][j] === 0) return { row: i, col: j };
    }
  }
  return null;
}

function findAllEmpties(grid) {
  const empties = [];
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (grid[i][j] === 0) {
        empties.push({ row: i, col: j });
      }
    }
  }
  return empties;
}

function getCandidates(grid, row, col) {
  const candidates = [];
  for (let num = 1; num <= 9; num++) {
    if (isValid(grid, row, col, num)) {
      candidates.push(num);
    }
  }
  return candidates;
}

function countCandidates(grid) {
  let count = 0;
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (grid[i][j] === 0) {
        count += getCandidates(grid, i, j).length;
      }
    }
  }
  return count;
}

function findBestCell(grid) {
  const empties = findAllEmpties(grid);
  if (empties.length === 0) return null;
  
  let best = null;
  let minCandidates = 10;
  
  for (const empty of empties) {
    const candidates = getCandidates(grid, empty.row, empty.col);
    if (candidates.length < minCandidates) {
      minCandidates = candidates.length;
      best = { ...empty, candidates };
    }
  }
  
  return best;
}

function solveFull(grid) {
  const gridCopy = grid.map(row => [...row]);
  const steps = [];
  
  function backtrack(g) {
    const best = findBestCell(g);
    if (!best) return true;
    
    const { row, col, candidates } = best;
    
    for (const num of candidates) {
      if (isValid(g, row, col, num)) {
        g[row][col] = num;
        steps.push({ row, col, value: num, type: 'fill' });
        
        if (backtrack(g)) return true;
        
        g[row][col] = 0;
        steps.push({ row, col, value: 0, type: 'backtrack' });
      }
    }
    
    return false;
  }
  
  const success = backtrack(gridCopy);
  
  return {
    success,
    solution: success ? gridCopy : null,
    steps
  };
}

function getOneHint(grid, solution) {
  const empties = findAllEmpties(grid);
  if (empties.length === 0) return null;
  
  for (const empty of empties) {
    const { row, col } = empty;
    const candidates = getCandidates(grid, row, col);
    
    if (candidates.length === 1) {
      return {
        row,
        col,
        value: candidates[0],
        reason: 'Naked Single - Only one possible number'
      };
    }
  }
  
  for (const empty of empties) {
    const { row, col } = empty;
    
    for (let num = 1; num <= 9; num++) {
      if (!isValid(grid, row, col, num)) continue;
      
      let canPlaceInRow = false;
      for (let j = 0; j < 9; j++) {
        if (j === col || grid[row][j] !== 0) continue;
        if (isValid(grid, row, j, num)) {
          canPlaceInRow = true;
          break;
        }
      }
      
      if (!canPlaceInRow) {
        return {
          row,
          col,
          value: num,
          reason: 'Hidden Single in Row'
        };
      }
      
      let canPlaceInCol = false;
      for (let i = 0; i < 9; i++) {
        if (i === row || grid[i][col] !== 0) continue;
        if (isValid(grid, i, col, num)) {
          canPlaceInCol = true;
          break;
        }
      }
      
      if (!canPlaceInCol) {
        return {
          row,
          col,
          value: num,
          reason: 'Hidden Single in Column'
        };
      }
      
      const startRow = Math.floor(row / 3) * 3;
      const startCol = Math.floor(col / 3) * 3;
      let canPlaceInBox = false;
      
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const boxRow = startRow + i;
          const boxCol = startCol + j;
          if ((boxRow === row && boxCol === col) || grid[boxRow][boxCol] !== 0) continue;
          if (isValid(grid, boxRow, boxCol, num)) {
            canPlaceInBox = true;
            break;
          }
        }
        if (canPlaceInBox) break;
      }
      
      if (!canPlaceInBox) {
        return {
          row,
          col,
          value: num,
          reason: 'Hidden Single in Box'
        };
      }
    }
  }
  
  if (solution) {
    for (const empty of empties) {
      const { row, col } = empty;
      if (grid[row][col] === 0 && solution[row][col] !== 0) {
        return {
          row,
          col,
          value: solution[row][col],
          reason: 'Solution hint'
        };
      }
    }
  }
  
  return null;
}

function validateSolution(grid) {
  for (let i = 0; i < 9; i++) {
    const rowSet = new Set();
    const colSet = new Set();
    
    for (let j = 0; j < 9; j++) {
      const rowVal = grid[i][j];
      const colVal = grid[j][i];
      
      if (rowVal === 0 || rowSet.has(rowVal)) return false;
      if (colVal === 0 || colSet.has(colVal)) return false;
      
      rowSet.add(rowVal);
      colSet.add(colVal);
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
          if (val === 0 || boxSet.has(val)) return false;
          boxSet.add(val);
        }
      }
    }
  }
  
  return true;
}

function validatePartial(grid) {
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

module.exports = {
  solveFull,
  getOneHint,
  validateSolution,
  validatePartial,
  getCandidates,
  findAllEmpties
};
