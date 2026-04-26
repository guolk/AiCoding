import { v4 as uuidv4 } from 'uuid'
import type { CircuitComponent, ComponentType, Point } from '../types'

interface ComponentDefinition {
  type: ComponentType
  name: string
  symbol: string
  defaultProperties: Record<string, string>
  pinPositions: Point[]
  pinLabels: string[]
  width: number
  height: number
}

export const componentDefinitions: ComponentDefinition[] = [
  {
    type: 'resistor',
    name: '电阻',
    symbol: 'R',
    defaultProperties: { value: '1k' },
    pinPositions: [{ x: -40, y: 0 }, { x: 40, y: 0 }],
    pinLabels: ['1', '2'],
    width: 80,
    height: 30
  },
  {
    type: 'capacitor',
    name: '电容',
    symbol: 'C',
    defaultProperties: { value: '1u' },
    pinPositions: [{ x: -30, y: 0 }, { x: 30, y: 0 }],
    pinLabels: ['1', '2'],
    width: 60,
    height: 40
  },
  {
    type: 'inductor',
    name: '电感',
    symbol: 'L',
    defaultProperties: { value: '1m' },
    pinPositions: [{ x: -40, y: 0 }, { x: 40, y: 0 }],
    pinLabels: ['1', '2'],
    width: 80,
    height: 30
  },
  {
    type: 'diode',
    name: '二极管',
    symbol: 'D',
    defaultProperties: { model: 'D1N4148' },
    pinPositions: [{ x: -30, y: 0 }, { x: 30, y: 0 }],
    pinLabels: ['A', 'K'],
    width: 60,
    height: 30
  },
  {
    type: 'transistor',
    name: '三极管',
    symbol: 'Q',
    defaultProperties: { model: 'NPN', type: 'npn' },
    pinPositions: [{ x: -30, y: 0 }, { x: 30, y: -20 }, { x: 30, y: 20 }],
    pinLabels: ['B', 'C', 'E'],
    width: 60,
    height: 50
  },
  {
    type: 'opamp',
    name: '运算放大器',
    symbol: 'U',
    defaultProperties: { model: 'LM741' },
    pinPositions: [
      { x: -40, y: -20 },
      { x: -40, y: 20 },
      { x: 40, y: 0 },
      { x: 0, y: -30 },
      { x: 0, y: 30 }
    ],
    pinLabels: ['IN-', 'IN+', 'OUT', 'VCC+', 'VCC-'],
    width: 80,
    height: 60
  },
  {
    type: 'voltage_source',
    name: '电压源',
    symbol: 'V',
    defaultProperties: { value: '5', type: 'dc' },
    pinPositions: [{ x: 0, y: -25 }, { x: 0, y: 25 }],
    pinLabels: ['+', '-'],
    width: 40,
    height: 50
  },
  {
    type: 'current_source',
    name: '电流源',
    symbol: 'I',
    defaultProperties: { value: '1m', type: 'dc' },
    pinPositions: [{ x: 0, y: -25 }, { x: 0, y: 25 }],
    pinLabels: ['+', '-'],
    width: 40,
    height: 50
  },
  {
    type: 'ground',
    name: '接地',
    symbol: 'GND',
    defaultProperties: {},
    pinPositions: [{ x: 0, y: -15 }],
    pinLabels: ['GND'],
    width: 40,
    height: 30
  }
]

export const componentCounters: Record<ComponentType, number> = {
  resistor: 0,
  capacitor: 0,
  inductor: 0,
  diode: 0,
  transistor: 0,
  opamp: 0,
  voltage_source: 0,
  current_source: 0,
  ground: 0
}

export function createComponent(type: ComponentType, x: number, y: number): CircuitComponent {
  const def = componentDefinitions.find(d => d.type === type)
  if (!def) {
    throw new Error(`Unknown component type: ${type}`)
  }

  componentCounters[type]++
  const name = `${def.symbol}${componentCounters[type]}`

  return {
    id: uuidv4(),
    type: def.type,
    name,
    x,
    y,
    rotation: 0,
    value: def.defaultProperties.value || '',
    pins: def.pinPositions.map((pos, index) => ({
      id: uuidv4(),
      label: def.pinLabels[index],
      offset: { ...pos }
    })),
    properties: { ...def.defaultProperties }
  }
}

export function getComponentDefinition(type: ComponentType): ComponentDefinition | undefined {
  return componentDefinitions.find(d => d.type === type)
}

export function rotatePoint(point: Point, angleDeg: number): Point {
  const angleRad = (angleDeg * Math.PI) / 180
  const cos = Math.cos(angleRad)
  const sin = Math.sin(angleRad)
  return {
    x: point.x * cos - point.y * sin,
    y: point.x * sin + point.y * cos
  }
}

export function getPinWorldPosition(component: CircuitComponent, pinIndex: number): Point {
  const pin = component.pins[pinIndex]
  if (!pin) return { x: 0, y: 0 }
  
  const rotatedOffset = rotatePoint(pin.offset, component.rotation)
  return {
    x: component.x + rotatedOffset.x,
    y: component.y + rotatedOffset.y
  }
}

export function parseValue(value: string): number {
  const units: Record<string, number> = {
    'p': 1e-12,
    'n': 1e-9,
    'u': 1e-6,
    'm': 1e-3,
    'k': 1e3,
    'K': 1e3,
    'M': 1e6,
    'G': 1e9
  }

  const match = value.match(/^(-?[\d.]+)([a-zA-Z]*)$/)
  if (!match) return parseFloat(value) || 0

  const num = parseFloat(match[1])
  const unit = match[2]

  if (unit && units[unit] !== undefined) {
    return num * units[unit]
  }

  return num
}

export function formatValue(value: number): string {
  if (Math.abs(value) >= 1e9) {
    return (value / 1e9).toFixed(2) + 'G'
  } else if (Math.abs(value) >= 1e6) {
    return (value / 1e6).toFixed(2) + 'M'
  } else if (Math.abs(value) >= 1e3) {
    return (value / 1e3).toFixed(2) + 'k'
  } else if (Math.abs(value) >= 1) {
    return value.toFixed(2)
  } else if (Math.abs(value) >= 1e-3) {
    return (value / 1e-3).toFixed(2) + 'm'
  } else if (Math.abs(value) >= 1e-6) {
    return (value / 1e-6).toFixed(2) + 'u'
  } else if (Math.abs(value) >= 1e-9) {
    return (value / 1e-9).toFixed(2) + 'n'
  } else {
    return (value / 1e-12).toFixed(2) + 'p'
  }
}
