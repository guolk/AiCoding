import { Chess } from 'chess.js';

export interface PGNGameInfo {
  white: string;
  black: string;
  result: string;
  date: string | null;
  pgn: string;
}

export interface ParsedPGN {
  games: PGNGameInfo[];
  raw: string;
}

const TAG_PATTERNS = {
  white: /\[White\s+"([^"]+)"\]/i,
  black: /\[Black\s+"([^"]+)"\]/i,
  result: /\[Result\s+"([^"]+)"\]/i,
  date: /\[Date\s+"([^"]+)"\]/i,
};

export function parsePGN(pgnString: string): ParsedPGN {
  const games: PGNGameInfo[] = [];
  const trimmed = pgnString.trim();

  if (!trimmed) {
    return { games: [], raw: pgnString };
  }

  const gameBlocks = trimmed.split(/\n\n+/);

  for (let i = 0; i < gameBlocks.length; i += 2) {
    if (i + 1 >= gameBlocks.length) break;

    const tagsBlock = gameBlocks[i];
    const movesBlock = gameBlocks[i + 1];

    if (!tagsBlock.startsWith('[')) continue;

    const game = extractGameInfo(tagsBlock, movesBlock);
    if (game) {
      games.push(game);
    }
  }

  if (games.length === 0) {
    const singleGame = parseSingleGame(pgnString);
    if (singleGame) {
      games.push(singleGame);
    }
  }

  return { games, raw: pgnString };
}

function extractGameInfo(tagsBlock: string, movesBlock: string): PGNGameInfo | null {
  const white = extractTag(tagsBlock, TAG_PATTERNS.white) || '?';
  const black = extractTag(tagsBlock, TAG_PATTERNS.black) || '?';
  const result = extractTag(tagsBlock, TAG_PATTERNS.result) || '*';
  const date = extractTag(tagsBlock, TAG_PATTERNS.date);
  const pgn = `${tagsBlock}\n\n${movesBlock}`;

  return { white, black, result, date, pgn };
}

function parseSingleGame(pgnString: string): PGNGameInfo | null {
  const chess = new Chess();

  try {
    chess.loadPgn(pgnString);
    const header = chess.header();

    return {
      white: header.White || '?',
      black: header.Black || '?',
      result: header.Result || '*',
      date: header.Date || null,
      pgn: pgnString,
    };
  } catch {
    return null;
  }
}

function extractTag(block: string, pattern: RegExp): string | null {
  const match = block.match(pattern);
  return match ? match[1] : null;
}

export function validatePGN(pgnString: string): boolean {
  try {
    const chess = new Chess();
    chess.loadPgn(pgnString);
    return true;
  } catch {
    return false;
  }
}

export function loadPGNToChess(pgnString: string): Chess | null {
  try {
    const chess = new Chess();
    chess.loadPgn(pgnString);
    return chess;
  } catch {
    return null;
  }
}
