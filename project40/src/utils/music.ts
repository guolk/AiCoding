import type { NotePitch, NoteDuration, KeySignature, Note, DifficultyLevel } from '@/types';

const NOTE_FREQUENCIES: Record<string, number> = {
  'C0': 16.35, 'C#0': 17.32, 'Db0': 17.32, 'D0': 18.35, 'D#0': 19.45, 'Eb0': 19.45,
  'E0': 20.60, 'F0': 21.83, 'F#0': 23.12, 'Gb0': 23.12, 'G0': 24.50, 'G#0': 25.96,
  'Ab0': 25.96, 'A0': 27.50, 'A#0': 29.14, 'Bb0': 29.14, 'B0': 30.87,
  'C1': 32.70, 'C#1': 34.65, 'Db1': 34.65, 'D1': 36.71, 'D#1': 38.89, 'Eb1': 38.89,
  'E1': 41.20, 'F1': 43.65, 'F#1': 46.25, 'Gb1': 46.25, 'G1': 49.00, 'G#1': 51.91,
  'Ab1': 51.91, 'A1': 55.00, 'A#1': 58.27, 'Bb1': 58.27, 'B1': 61.74,
  'C2': 65.41, 'C#2': 69.30, 'Db2': 69.30, 'D2': 73.42, 'D#2': 77.78, 'Eb2': 77.78,
  'E2': 82.41, 'F2': 87.31, 'F#2': 92.50, 'Gb2': 92.50, 'G2': 98.00, 'G#2': 103.83,
  'Ab2': 103.83, 'A2': 110.00, 'A#2': 116.54, 'Bb2': 116.54, 'B2': 123.47,
  'C3': 130.81, 'C#3': 138.59, 'Db3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'Eb3': 155.56,
  'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'Gb3': 185.00, 'G3': 196.00, 'G#3': 207.65,
  'Ab3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'Bb3': 233.08, 'B3': 246.94,
  'C4': 261.63, 'C#4': 277.18, 'Db4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'Eb4': 311.13,
  'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'Gb4': 369.99, 'G4': 392.00, 'G#4': 415.30,
  'Ab4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'Bb4': 466.16, 'B4': 493.88,
  'C5': 523.25, 'C#5': 554.37, 'Db5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'Eb5': 622.25,
  'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'Gb5': 739.99, 'G5': 783.99, 'G#5': 830.61,
  'Ab5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'Bb5': 932.33, 'B5': 987.77,
  'C6': 1046.50, 'C#6': 1108.73, 'Db6': 1108.73, 'D6': 1174.66, 'D#6': 1244.51, 'Eb6': 1244.51,
  'E6': 1318.51, 'F6': 1396.91, 'F#6': 1479.98, 'Gb6': 1479.98, 'G6': 1567.98, 'G#6': 1661.22,
  'Ab6': 1661.22, 'A6': 1760.00, 'A#6': 1864.66, 'Bb6': 1864.66, 'B6': 1975.53,
  'C7': 2093.00, 'C#7': 2217.46, 'Db7': 2217.46, 'D7': 2349.32, 'D#7': 2489.02, 'Eb7': 2489.02,
  'E7': 2637.02, 'F7': 2793.83, 'F#7': 2959.96, 'Gb7': 2959.96, 'G7': 3135.96, 'G#7': 3322.44,
  'Ab7': 3322.44, 'A7': 3520.00, 'A#7': 3729.31, 'Bb7': 3729.31, 'B7': 3951.07,
  'C8': 4186.01,
};

const NOTE_NAMES: NotePitch[] = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'];

const DURATION_VALUES: Record<NoteDuration, number> = {
  'w': 1.0,
  'h': 0.5,
  'q': 0.25,
  '8': 0.125,
  '16': 0.0625,
  '32': 0.03125,
};

const KEY_SIGNATURE_SHARPS: KeySignature[] = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#'];
const KEY_SIGNATURE_FLATS: KeySignature[] = ['C', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'];

export function getNoteFrequency(pitch: NotePitch, octave: number): number {
  const key = `${pitch}${octave}`;
  return NOTE_FREQUENCIES[key] || 440;
}

export function frequencyToNote(frequency: number): { pitch: NotePitch; octave: number; deviation: number } {
  if (frequency <= 0) {
    return { pitch: 'A', octave: 4, deviation: 0 };
  }

  const A4 = 440;
  const C0 = A4 * Math.pow(2, -4.75);
  const halfSteps = 12 * Math.log2(frequency / C0);
  const roundedHalfSteps = Math.round(halfSteps);
  const deviation = halfSteps - roundedHalfSteps;

  const octave = Math.floor(roundedHalfSteps / 12);
  const noteIndex = roundedHalfSteps % 12;

  const chromaticScale: NotePitch[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const pitch = chromaticScale[noteIndex] || 'C';

  return { pitch, octave, deviation };
}

export function getDurationInSeconds(duration: NoteDuration, tempo: number, timeSignatureTop: number = 4): number {
  const beatsPerSecond = tempo / 60;
  const beatValue = DURATION_VALUES[duration] * 4;
  return beatValue / beatsPerSecond;
}

export function getKeySignatureSharps(key: KeySignature): number {
  const index = KEY_SIGNATURE_SHARPS.indexOf(key);
  return index > 0 ? index : 0;
}

export function getKeySignatureFlats(key: KeySignature): number {
  const index = KEY_SIGNATURE_FLATS.indexOf(key);
  return index > 0 ? index : 0;
}

export function isNoteInKey(pitch: NotePitch, key: KeySignature): boolean {
  const keyNotes: Record<KeySignature, NotePitch[]> = {
    'C': ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    'G': ['G', 'A', 'B', 'C', 'D', 'E', 'F#'],
    'D': ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'],
    'A': ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#'],
    'E': ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#'],
    'B': ['B', 'C#', 'D#', 'E', 'F#', 'G#', 'A#'],
    'F#': ['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'F'],
    'C#': ['C#', 'D#', 'F', 'F#', 'G#', 'A#', 'C'],
    'F': ['F', 'G', 'A', 'Bb', 'C', 'D', 'E'],
    'Bb': ['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A'],
    'Eb': ['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'D'],
    'Ab': ['Ab', 'Bb', 'C', 'Db', 'Eb', 'F', 'G'],
    'Db': ['Db', 'Eb', 'F', 'Gb', 'Ab', 'Bb', 'C'],
    'Gb': ['Gb', 'Ab', 'Bb', 'B', 'Db', 'Eb', 'F'],
    'Cb': ['B', 'Db', 'Eb', 'E', 'Gb', 'Ab', 'Bb'],
  };

  const notes = keyNotes[key] || keyNotes['C'];
  return notes.includes(pitch) || 
         notes.some(n => {
           if (pitch === 'C#' && n === 'Db') return true;
           if (pitch === 'Db' && n === 'C#') return true;
           if (pitch === 'D#' && n === 'Eb') return true;
           if (pitch === 'Eb' && n === 'D#') return true;
           if (pitch === 'F#' && n === 'Gb') return true;
           if (pitch === 'Gb' && n === 'F#') return true;
           if (pitch === 'G#' && n === 'Ab') return true;
           if (pitch === 'Ab' && n === 'G#') return true;
           if (pitch === 'A#' && n === 'Bb') return true;
           if (pitch === 'Bb' && n === 'A#') return true;
           return false;
         });
}

export function generateUniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getDifficultyLabel(level: DifficultyLevel): string {
  const labels: Record<DifficultyLevel, string> = {
    'beginner': '基础',
    'intermediate': '进阶',
    'advanced': '高级',
  };
  return labels[level] || '未知';
}

type DifficultyColor = 'green' | 'blue' | 'red' | 'gray';

export function getDifficultyColor(level: DifficultyLevel): DifficultyColor {
  const colors: Record<DifficultyLevel, DifficultyColor> = {
    'beginner': 'green',
    'intermediate': 'blue',
    'advanced': 'red',
  };
  return colors[level] || 'gray';
}

export function createEmptyNote(pitch: NotePitch = 'C', octave: number = 4, duration: NoteDuration = 'q'): Note {
  return {
    id: generateUniqueId(),
    pitch,
    octave,
    duration,
    dotted: false,
    rest: false,
    annotations: [],
  };
}

export function calculateAccuracyPercentage(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}
