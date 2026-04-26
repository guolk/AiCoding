export interface Point {
  x: number
  y: number
}

export interface Pin {
  id: string
  label: string
  offset: Point
  nodeId?: string
}

export type ComponentType = 'resistor' | 'capacitor' | 'inductor' | 'diode' | 'transistor' | 'opamp' | 'voltage_source' | 'current_source' | 'ground'

export interface CircuitComponent {
  id: string
  type: ComponentType
  name: string
  x: number
  y: number
  rotation: number
  value: string
  pins: Pin[]
  properties: Record<string, string>
}

export interface Wire {
  id: string
  startComponentId: string
  startPinId: string
  endComponentId: string
  endPinId: string
  points: Point[]
}

export interface Node {
  id: string
  name: string
  connectedPinIds: string[]
  voltage?: number
}

export type SimulationMode = 'transient' | 'ac'

export interface TransientConfig {
  startTime: number
  endTime: number
  timeStep: number
}

export interface ACConfig {
  startFreq: number
  endFreq: number
  pointsPerDecade: number
}

export interface SimulationConfig {
  mode: SimulationMode
  transient?: TransientConfig
  ac?: ACConfig
}

export interface NodeVoltage {
  nodeName: string
  values: number[]
}

export interface BranchCurrent {
  componentName: string
  values: number[]
}

export interface TransientResult {
  timePoints: number[]
  nodeVoltages: NodeVoltage[]
  branchCurrents: BranchCurrent[]
}

export interface ACResult {
  frequencies: number[]
  nodeVoltages: {
    nodeName: string
    magnitudes: number[]
    phases: number[]
  }[]
}

export interface SimulationResult {
  mode: SimulationMode
  transient?: TransientResult
  ac?: ACResult
}
