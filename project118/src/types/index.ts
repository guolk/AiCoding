export interface Yarn {
  id: string;
  brand: string;
  colorCode: string;
  colorName: string;
  colorHex: string;
  weight: number;
  remainingWeight: number;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pixel {
  x: number;
  y: number;
  color: string;
  yarnId?: string;
}

export interface SymmetrySettings {
  horizontal: boolean;
  vertical: boolean;
  diagonal1: boolean;
  diagonal2: boolean;
  rotation: number;
  repeatX: number;
  repeatY: number;
}

export interface Pattern {
  id: string;
  name: string;
  description: string;
  gridWidth: number;
  gridHeight: number;
  cellSize: number;
  pixels: Pixel[];
  symmetry: SymmetrySettings;
  usedYarns: string[];
  createdAt: string;
  updatedAt: string;
}

export type ProjectType = 'knitting' | 'crochet' | 'embroidery' | 'weaving';
export type ProjectStatus = 'planning' | 'in_progress' | 'completed';

export interface ProjectYarn {
  yarnId: string;
  estimatedWeight: number;
  usedWeight: number;
}

export interface ProjectPhoto {
  url: string;
  note: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  type: ProjectType;
  patternId?: string;
  dimensions: {
    width: number;
    height: number;
    unit: 'cm' | 'in';
  };
  yarnsUsed: ProjectYarn[];
  progress: number;
  status: ProjectStatus;
  photos: ProjectPhoto[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface YarnUsage {
  id: string;
  yarnId: string;
  projectId: string;
  weightUsed: number;
  createdAt: string;
}

export interface StitchNote {
  id: string;
  name: string;
  type: string;
  instructions: string;
  tips: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProblemSolution {
  id: string;
  title: string;
  problem: string;
  solution: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface EditorSettings {
  currentColor: string;
  currentYarnId: string | null;
  tool: 'brush' | 'eraser' | 'fill' | 'picker';
  brushSize: number;
  showGrid: boolean;
  showSymmetry: boolean;
}
