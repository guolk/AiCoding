const express = require('express');
const router = express.Router();
const { generatePuzzle, gridToString, stringToGrid, validatePuzzleString } = require('../sudoku/generator');
const { solveFull, getOneHint, validateSolution, validatePartial } = require('../sudoku/solver');

router.get('/generate', (req, res) => {
  try {
    const { difficulty = 'medium' } = req.query;
    const validDifficulties = ['easy', 'medium', 'hard', 'expert'];
    
    if (!validDifficulties.includes(difficulty)) {
      return res.status(400).json({ error: 'Invalid difficulty level' });
    }
    
    const result = generatePuzzle(difficulty);
    
    res.json({
      success: true,
      data: {
        puzzle: result.puzzle,
        solution: result.solution,
        difficulty: result.difficulty,
        clueCount: result.clueCount,
        puzzleString: gridToString(result.puzzle),
        solutionString: gridToString(result.solution)
      }
    });
  } catch (error) {
    console.error('Generate puzzle error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate puzzle' });
  }
});

router.post('/solve', (req, res) => {
  try {
    const { puzzle, puzzleString } = req.body;
    
    let grid;
    if (puzzleString) {
      grid = stringToGrid(puzzleString);
      if (!grid) {
        return res.status(400).json({ success: false, error: 'Invalid puzzle string' });
      }
    } else if (puzzle) {
      grid = puzzle;
    } else {
      return res.status(400).json({ success: false, error: 'Puzzle or puzzleString required' });
    }
    
    const validation = validatePartial(grid);
    if (!validation.valid) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid puzzle',
        details: validation
      });
    }
    
    const result = solveFull(grid);
    
    if (!result.success) {
      return res.status(400).json({ success: false, error: 'Puzzle has no solution' });
    }
    
    res.json({
      success: true,
      data: {
        solution: result.solution,
        solutionString: gridToString(result.solution),
        steps: result.steps
      }
    });
  } catch (error) {
    console.error('Solve puzzle error:', error);
    res.status(500).json({ success: false, error: 'Failed to solve puzzle' });
  }
});

router.post('/hint', (req, res) => {
  try {
    const { puzzle, solution, puzzleString, solutionString } = req.body;
    
    let grid;
    if (puzzleString) {
      grid = stringToGrid(puzzleString);
      if (!grid) {
        return res.status(400).json({ success: false, error: 'Invalid puzzle string' });
      }
    } else if (puzzle) {
      grid = puzzle;
    } else {
      return res.status(400).json({ success: false, error: 'Puzzle or puzzleString required' });
    }
    
    let solutionGrid = null;
    if (solutionString) {
      solutionGrid = stringToGrid(solutionString);
    } else if (solution) {
      solutionGrid = solution;
    }
    
    const validation = validatePartial(grid);
    if (!validation.valid) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid puzzle',
        details: validation
      });
    }
    
    const hint = getOneHint(grid, solutionGrid);
    
    if (!hint) {
      return res.json({ success: true, data: { hint: null, message: 'No hints available' } });
    }
    
    res.json({
      success: true,
      data: {
        hint
      }
    });
  } catch (error) {
    console.error('Get hint error:', error);
    res.status(500).json({ success: false, error: 'Failed to get hint' });
  }
});

router.post('/validate', (req, res) => {
  try {
    const { grid, gridString } = req.body;
    
    let puzzleGrid;
    if (gridString) {
      puzzleGrid = stringToGrid(gridString);
      if (!puzzleGrid) {
        return res.status(400).json({ success: false, error: 'Invalid grid string' });
      }
    } else if (grid) {
      puzzleGrid = grid;
    } else {
      return res.status(400).json({ success: false, error: 'Grid or gridString required' });
    }
    
    const partialValidation = validatePartial(puzzleGrid);
    if (!partialValidation.valid) {
      return res.json({
        success: true,
        data: {
          isComplete: false,
          isValid: false,
          errors: [partialValidation]
        }
      });
    }
    
    const hasEmpty = puzzleGrid.flat().some(n => n === 0);
    if (hasEmpty) {
      return res.json({
        success: true,
        data: {
          isComplete: false,
          isValid: true,
          message: 'Grid is valid but not complete'
        }
      });
    }
    
    const isCorrect = validateSolution(puzzleGrid);
    
    res.json({
      success: true,
      data: {
        isComplete: true,
        isValid: isCorrect,
        message: isCorrect ? 'Congratulations! Solution is correct!' : 'Solution is incorrect'
      }
    });
  } catch (error) {
    console.error('Validate puzzle error:', error);
    res.status(500).json({ success: false, error: 'Failed to validate puzzle' });
  }
});

router.post('/import', (req, res) => {
  try {
    const { puzzleString } = req.body;
    
    if (!puzzleString) {
      return res.status(400).json({ success: false, error: 'puzzleString is required' });
    }
    
    if (!validatePuzzleString(puzzleString)) {
      return res.status(400).json({ success: false, error: 'Invalid puzzle format' });
    }
    
    const grid = stringToGrid(puzzleString);
    
    const solveResult = solveFull(grid);
    
    if (!solveResult.success) {
      return res.status(400).json({ success: false, error: 'Puzzle has no valid solution' });
    }
    
    res.json({
      success: true,
      data: {
        puzzle: grid,
        puzzleString,
        solution: solveResult.solution,
        solutionString: gridToString(solveResult.solution),
        clueCount: grid.flat().filter(n => n !== 0).length
      }
    });
  } catch (error) {
    console.error('Import puzzle error:', error);
    res.status(500).json({ success: false, error: 'Failed to import puzzle' });
  }
});

module.exports = router;
