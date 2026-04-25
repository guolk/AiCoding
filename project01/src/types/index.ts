export interface Formula {
  id: string;
  name: string;
  category: string;
  formula: string;
  latex: string;
  description: string;
  explanation: {
    title: string;
    content: string;
  }[];
  parameters: Parameter[];
  chartType: 'line' | 'scatter' | 'bar' | 'area';
  animationType?: 'point' | 'curve' | 'wave';
  applicationScenarios: string[];
}

export interface Parameter {
  name: string;
  label: string;
  symbol: string;
  defaultValue: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  description: string;
}

export interface ChartPoint {
  x: number;
  y: number;
}

export interface MathFormula extends Formula {
  domain: {
    min: number;
    max: number;
  };
  calculate: (x: number, params: Record<string, number>) => number;
}

export interface PhysicsFormula extends Formula {
  variables: {
    name: string;
    symbol: string;
    default: number;
    unit: string;
    description: string;
  }[];
  simulate: (time: number, params: Record<string, number>) => Record<string, number>;
}

export interface NavigationItem {
  id: string;
  name: string;
  path: string;
  icon?: string;
}
