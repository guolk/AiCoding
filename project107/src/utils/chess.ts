import { Chess } from 'chess.js';

export const CHESS_FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
export const CHESS_RANKS = ['1', '2', '3', '4', '5', '6', '7', '8'] as const;

export type ChessFile = typeof CHESS_FILES[number];
export type ChessRank = typeof CHESS_RANKS[number];
export type Square = `${ChessFile}${ChessRank}`;

export function isValidFEN(fen: string): boolean {
  try {
    const chess = new Chess();
    chess.load(fen);
    return true;
  } catch {
    return false;
  }
}

export function formatMove(move: string): string {
  return move.toUpperCase();
}

export function coordinatesToSquare(file: number, rank: number): Square | null {
  if (file < 0 || file > 7 || rank < 0 || rank > 7) {
    return null;
  }
  return `${CHESS_FILES[file]}${CHESS_RANKS[rank]}`;
}

export function squareToCoordinates(square: Square): { file: number; rank: number } | null {
  const fileChar = square[0] as ChessFile;
  const rankChar = square[1] as ChessRank;

  const fileIndex = CHESS_FILES.indexOf(fileChar);
  const rankIndex = CHESS_RANKS.indexOf(rankChar);

  if (fileIndex === -1 || rankIndex === -1) {
    return null;
  }

  return { file: fileIndex, rank: rankIndex };
}

export function getFileIndex(file: ChessFile): number {
  return CHESS_FILES.indexOf(file);
}

export function getRankIndex(rank: ChessRank): number {
  return CHESS_RANKS.indexOf(rank);
}
