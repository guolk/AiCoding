import * as Diff from 'diff';

export type LineType = 'added' | 'removed' | 'modified' | 'unchanged' | 'empty';
export type ViewMode = 'side-by-side' | 'unified';

export interface DiffLine {
  id: string;
  type: LineType;
  leftContent: string;
  rightContent: string;
  leftLineNumber: number | null;
  rightLineNumber: number | null;
  charDiffsLeft?: CharDiff[];
  charDiffsRight?: CharDiff[];
  isCollapsed?: boolean;
  collapsedLines?: number;
  isPlaceholder?: boolean;
}

export interface CharDiff {
  value: string;
  added?: boolean;
  removed?: boolean;
}

export interface DiffResult {
  lines: DiffLine[];
  stats: {
    added: number;
    removed: number;
    modified: number;
  };
}

export function generateLineId(index: number, prefix: string = ''): string {
  return `${prefix}line-${index}-${Date.now()}`;
}

function normalizeText(text: string, ignoreWhitespace: boolean): string {
  if (!ignoreWhitespace) return text;
  return text.replace(/\s+/g, '');
}

function isSameLine(left: string, right: string, ignoreWhitespace: boolean): boolean {
  return normalizeText(left, ignoreWhitespace) === normalizeText(right, ignoreWhitespace);
}

function getCharDiffs(oldText: string, newText: string): { left: CharDiff[]; right: CharDiff[] } {
  const diffs = Diff.diffChars(oldText, newText);
  const leftDiffs: CharDiff[] = [];
  const rightDiffs: CharDiff[] = [];

  diffs.forEach(part => {
    if (part.added) {
      rightDiffs.push({ value: part.value, added: true });
    } else if (part.removed) {
      leftDiffs.push({ value: part.value, removed: true });
    } else {
      leftDiffs.push({ value: part.value });
      rightDiffs.push({ value: part.value });
    }
  });

  return { left: leftDiffs, right: rightDiffs };
}

function getLineType(
  oldValue: string | null,
  newValue: string | null,
  ignoreWhitespace: boolean
): LineType {
  if (oldValue === null && newValue !== null) return 'added';
  if (newValue === null && oldValue !== null) return 'removed';
  if (oldValue === null && newValue === null) return 'empty';
  
  if (!isSameLine(oldValue!, newValue!, ignoreWhitespace)) {
    if (oldValue && newValue) return 'modified';
    return 'unchanged';
  }
  
  return 'unchanged';
}

function normalizeLineEndings(text: string): string {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

export function computeDiff(
  oldText: string,
  newText: string,
  ignoreWhitespace: boolean = false
): DiffResult {
  const normalizedOldText = normalizeLineEndings(oldText);
  const normalizedNewText = normalizeLineEndings(newText);
  
  const diffLines: DiffLine[] = [];
  let stats = { added: 0, removed: 0, modified: 0 };
  
  const changes = Diff.diffLines(normalizedOldText, normalizedNewText);
  
  let oldLineNumber = 0;
  let newLineNumber = 0;
  let lineIndex = 0;

  changes.forEach(change => {
    const changeLines = change.value.split('\n');
    if (changeLines[changeLines.length - 1] === '') {
      changeLines.pop();
    }

    if (change.added) {
      changeLines.forEach(line => {
        newLineNumber++;
        diffLines.push({
          id: generateLineId(lineIndex),
          type: 'added',
          leftContent: '',
          rightContent: line,
          leftLineNumber: null,
          rightLineNumber: newLineNumber,
          charDiffsRight: [{ value: line, added: true }]
        });
        lineIndex++;
        stats.added++;
      });
    } else if (change.removed) {
      changeLines.forEach(line => {
        oldLineNumber++;
        diffLines.push({
          id: generateLineId(lineIndex),
          type: 'removed',
          leftContent: line,
          rightContent: '',
          leftLineNumber: oldLineNumber,
          rightLineNumber: null,
          charDiffsLeft: [{ value: line, removed: true }]
        });
        lineIndex++;
        stats.removed++;
      });
    } else {
      changeLines.forEach(line => {
        oldLineNumber++;
        newLineNumber++;
        const lineType = getLineType(line, line, ignoreWhitespace);
        
        diffLines.push({
          id: generateLineId(lineIndex),
          type: lineType,
          leftContent: line,
          rightContent: line,
          leftLineNumber: oldLineNumber,
          rightLineNumber: newLineNumber
        });
        lineIndex++;
        
        if (lineType === 'modified') stats.modified++;
      });
    }
  });

  const finalLines = processModifiedLines(diffLines, ignoreWhitespace);
  const finalStats = calculateStats(finalLines);

  return {
    lines: finalLines,
    stats: finalStats
  };
}

function processModifiedLines(lines: DiffLine[], _ignoreWhitespace: boolean): DiffLine[] {
  const result: DiffLine[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const current = lines[i];
    
    if (current.type === 'removed' && i + 1 < lines.length) {
      const next = lines[i + 1];
      if (next.type === 'added') {
        const { left, right } = getCharDiffs(current.leftContent, next.rightContent);
        const hasCharDiff = left.some(d => d.removed) || right.some(d => d.added);
        
        if (hasCharDiff) {
          result.push({
            id: generateLineId(result.length),
            type: 'modified',
            leftContent: current.leftContent,
            rightContent: next.rightContent,
            leftLineNumber: current.leftLineNumber,
            rightLineNumber: next.rightLineNumber,
            charDiffsLeft: left,
            charDiffsRight: right
          });
          i++;
          continue;
        }
      }
    }
    
    result.push(current);
  }
  
  return result;
}

function calculateStats(lines: DiffLine[]): { added: number; removed: number; modified: number } {
  let added = 0, removed = 0, modified = 0;
  
  lines.forEach(line => {
    if (line.type === 'added') added++;
    else if (line.type === 'removed') removed++;
    else if (line.type === 'modified') modified++;
  });
  
  return { added, removed, modified };
}

export function collapseUnchangedRegions(
  lines: DiffLine[],
  contextLines: number = 5
): DiffLine[] {
  const result: DiffLine[] = [];
  const totalLines = lines.length;
  
  const diffIndices = new Set<number>();
  lines.forEach((line, index) => {
    if (line.type !== 'unchanged') {
      for (let i = Math.max(0, index - contextLines); i <= Math.min(totalLines - 1, index + contextLines); i++) {
        diffIndices.add(i);
      }
    }
  });
  
  let inUnchangedSection = false;
  let unchangedStart = -1;
  
  for (let i = 0; i < totalLines; i++) {
    if (diffIndices.has(i)) {
      if (inUnchangedSection) {
        const collapsedLines = i - unchangedStart;
        result.push({
          id: generateLineId(result.length, 'collapsed-'),
          type: 'unchanged',
          leftContent: '',
          rightContent: '',
          leftLineNumber: null,
          rightLineNumber: null,
          isCollapsed: true,
          collapsedLines: collapsedLines
        });
        inUnchangedSection = false;
      }
      result.push({ ...lines[i], isCollapsed: false });
    } else {
      if (!inUnchangedSection) {
        inUnchangedSection = true;
        unchangedStart = i;
      }
    }
  }
  
  if (inUnchangedSection) {
    const collapsedLines = totalLines - unchangedStart;
    result.push({
      id: generateLineId(result.length, 'collapsed-'),
      type: 'unchanged',
      leftContent: '',
      rightContent: '',
      leftLineNumber: null,
      rightLineNumber: null,
      isCollapsed: true,
      collapsedLines: collapsedLines
    });
  }
  
  return result;
}

export function expandAllLines(
  _collapsedLines: DiffLine[],
  originalLines: DiffLine[]
): DiffLine[] {
  return originalLines.map(line => ({ ...line, isCollapsed: false }));
}

export function getLineHeight(): number {
  return 21;
}

export function estimateTotalHeight(lines: DiffLine[]): number {
  let height = 0;
  lines.forEach(line => {
    if (line.isCollapsed) {
      height += 36;
    } else {
      height += getLineHeight();
    }
  });
  return height;
}
