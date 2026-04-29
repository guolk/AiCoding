const DIFFICULTY_CONFIG = {
  easy: { minClues: 45, maxClues: 50, attempts: 5 },
  medium: { minClues: 35, maxClues: 44, attempts: 8 },
  hard: { minClues: 28, maxClues: 34, attempts: 12 },
  expert: { minClues: 22, maxClues: 27, attempts: 15 }
};

function createEmptyGrid() {
  return Array(9).fill(null).map(() => Array(9).fill(0));
}

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
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

function solveGrid(grid) {
  const empty = findEmpty(grid);
  if (!empty) return true;
  
  const { row, col } = empty;
  const numbers = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  
  for (const num of numbers) {
    if (isValid(grid, row, col, num)) {
      grid[row][col] = num;
      if (solveGrid(grid)) return true;
      grid[row][col] = 0;
    }
  }
  
  return false;
}

function generateFullGrid() {
  const grid = createEmptyGrid();
  solveGrid(grid);
  return grid;
}

function countSolutions(grid, limit = 2) {
  let count = 0;
  
  function backtrack(g) {
    if (count >= limit) return count;
    
    const empty = findEmpty(g);
    if (!empty) {
      count++;
      return count;
    }
    
    const { row, col } = empty;
    for (let num = 1; num <= 9; num++) {
      if (isValid(g, row, col, num)) {
        g[row][col] = num;
        backtrack(g);
        if (count >= limit) return count;
        g[row][col] = 0;
      }
    }
    return count;
  }
  
  const gridCopy = grid.map(row => [...row]);
  return backtrack(gridCopy);
}

function getCellPositions() {
  const positions = [];
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      positions.push({ row: i, col: j });
    }
  }
  return shuffle(positions);
}

function generatePuzzle(difficulty) {
  const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.medium;
  const solution = generateFullGrid();
  const puzzle = solution.map(row => [...row]);
  
  let cluesRemoved = 0;
  const positions = getCellPositions();
  const maxAttempts = config.attempts;
  let attempts = 0;
  
  for (const pos of positions) {
    if (attempts >= maxAttempts) break;
    
    const { row, col } = pos;
    const originalValue = puzzle[row][col];
    
    if (originalValue === 0) continue;
    
    puzzle[row][col] = 0;
    const solutions = countSolutions(puzzle, 2);
    
    if (solutions === 1) {
      cluesRemoved++;
      attempts = 0;
    } else {
      puzzle[row][col] = originalValue;
      attempts++;
    }
  }
  
  let clueCount = puzzle.flat().filter(n => n !== 0).length;
  
  while (clueCount > config.maxClues) {
    const positions = shuffle(getCellPositions());
    let removed = false;
    
    for (const pos of positions) {
      const { row, col } = pos;
      if (puzzle[row][col] === 0) continue;
      
      const originalValue = puzzle[row][col];
      puzzle[row][col] = 0;
      
      const solutions = countSolutions(puzzle, 2);
      if (solutions === 1) {
        clueCount--;
        removed = true;
        break;
      } else {
        puzzle[row][col] = originalValue;
      }
    }
    
    if (!removed) break;
  }
  
  return {
    puzzle,
    solution,
    difficulty,
    clueCount: puzzle.flat().filter(n => n !== 0).length
  };
}

function gridToString(grid) {
  return grid.flat().map(n => n === 0 ? '.' : n).join('');
}

function stringToGrid(str) {
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

function validatePuzzleString(str) {
  if (str.length !== 81) return false;
  if (!/^[1-9.]{81}$/.test(str)) return false;
  
  const grid = stringToGrid(str);
  if (!grid) return false;
  
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const num = grid[i][j];
      if (num === 0) continue;
      
      grid[i][j] = 0;
      if (!isValid(grid, i, j, num)) {
        grid[i][j] = num;
        return false;
      }
      grid[i][j] = num;
    }
  }
  
  return true;
}

module.exports = {
  generatePuzzle,
  gridToString,
  stringToGrid,
  validatePuzzleString,
  DIFFICULTY_CONFIG
};
