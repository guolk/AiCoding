<template>
  <div class="app">
    <header class="header">
      <h1>电路图绘制工具</h1>
      <div class="controls">
        <button @click="runSimulation" :disabled="isSimulating">
          {{ isSimulating ? '仿真中...' : '运行仿真' }}
        </button>
        <select v-model="simulationMode">
          <option value="transient">瞬态分析</option>
          <option value="ac">频率扫描</option>
        </select>
        <button @click="exportSVG">导出SVG</button>
        <button @click="saveNetlist">保存Netlist</button>
      </div>
    </header>
    <div class="main-content">
      <ComponentLibrary />
      <CircuitCanvas
        :components="components"
        :wires="wires"
        :selected-component="selectedComponent"
        :is-drawing-wire="isDrawingWire"
        :wire-start="wireStart"
        :simulation-result="simulationResult"
        @select-component="handleSelectComponent"
        @add-component="handleAddComponent"
        @update-component="handleUpdateComponent"
        @delete-component="handleDeleteComponent"
        @start-wire="handleStartWire"
        @end-wire="handleEndWire"
        @cancel-wire="handleCancelWire"
      />
      <PropertyPanel
        :selected-component="selectedComponent"
        @update-component="handleUpdateComponent"
        @delete-component="handleDeleteComponent"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type {
  CircuitComponent,
  Wire,
  ComponentType,
  Point,
  SimulationMode,
  SimulationConfig,
  SimulationResult,
  TransientConfig,
  ACConfig
} from './types'
import { createComponent } from './utils/componentUtils'
import ComponentLibrary from './components/ComponentLibrary.vue'
import CircuitCanvas from './components/CircuitCanvas.vue'
import PropertyPanel from './components/PropertyPanel.vue'

const components = ref<CircuitComponent[]>([])
const wires = ref<Wire[]>([])
const selectedComponent = ref<CircuitComponent | null>(null)
const isDrawingWire = ref(false)
const wireStart = ref<{ componentId: string; pinId: string } | null>(null)
const simulationMode = ref<SimulationMode>('transient')
const isSimulating = ref(false)
const simulationResult = ref<SimulationResult | null>(null)

function handleAddComponent(type: ComponentType, position: Point) {
  const comp = createComponent(type, position.x, position.y)
  components.value.push(comp)
}

function handleSelectComponent(component: CircuitComponent | null) {
  selectedComponent.value = component
}

function handleUpdateComponent(updated: CircuitComponent) {
  const index = components.value.findIndex(c => c.id === updated.id)
  if (index !== -1) {
    components.value[index] = { ...updated }
    if (selectedComponent.value?.id === updated.id) {
      selectedComponent.value = { ...updated }
    }
  }
}

function handleDeleteComponent(componentId: string) {
  components.value = components.value.filter(c => c.id !== componentId)
  wires.value = wires.value.filter(
    w => w.startComponentId !== componentId && w.endComponentId !== componentId
  )
  if (selectedComponent.value?.id === componentId) {
    selectedComponent.value = null
  }
}

function handleStartWire(params: { componentId: string; pinId: string }) {
  isDrawingWire.value = true
  wireStart.value = params
}

function handleEndWire(params: { componentId: string; pinId: string; points: Point[] }) {
  if (wireStart.value) {
    const newWire: Wire = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      startComponentId: wireStart.value.componentId,
      startPinId: wireStart.value.pinId,
      endComponentId: params.componentId,
      endPinId: params.pinId,
      points: params.points
    }
    wires.value.push(newWire)
  }
  isDrawingWire.value = false
  wireStart.value = null
}

function handleCancelWire() {
  isDrawingWire.value = false
  wireStart.value = null
}

async function runSimulation() {
  isSimulating.value = true
  simulationResult.value = null

  try {
    const config: SimulationConfig = {
      mode: simulationMode.value
    }

    if (simulationMode.value === 'transient') {
      config.transient = {
        startTime: 0,
        endTime: 10e-3,
        timeStep: 10e-6
      }
    } else {
      config.ac = {
        startFreq: 1,
        endFreq: 1e6,
        pointsPerDecade: 10
      }
    }

    const response = await fetch('/api/simulate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        components: components.value,
        wires: wires.value,
        config
      })
    })

    if (response.ok) {
      simulationResult.value = await response.json()
    } else {
      console.error('Simulation failed:', await response.text())
      const mockResult = generateMockSimulation(config)
      if (mockResult) {
        simulationResult.value = mockResult
      }
    }
  } catch (error) {
    console.error('Simulation error:', error)
    const mockResult = generateMockSimulation(config)
    if (mockResult) {
      simulationResult.value = mockResult
    }
  } finally {
    isSimulating.value = false
  }
}

function generateMockSimulation(config: SimulationConfig): SimulationResult | null {
  if (components.value.length === 0) {
    return null
  }

  if (config.mode === 'transient' && config.transient) {
    return generateMockTransient(config.transient)
  } else if (config.mode === 'ac' && config.ac) {
    return generateMockAC(config.ac)
  }
  return null
}

function generateMockTransient(config: TransientConfig): SimulationResult {
  const numPoints = Math.floor((config.endTime - config.startTime) / config.timeStep) + 1
  const timePoints = Array.from({ length: numPoints }, (_, i) => config.startTime + i * config.timeStep)

  const nodeVoltages: { nodeName: string; values: number[] }[] = [
    {
      nodeName: '0',
      values: Array.from({ length: numPoints }, () => 0)
    }
  ]

  const voltageSources = components.value.filter(c => c.type === 'voltage_source')
  voltageSources.forEach((_, i) => {
    const nodeName = String(i + 1)
    const values = timePoints.map(t => {
      const baseVoltage = 5
      return baseVoltage * (1 + 0.1 * Math.sin(2 * Math.PI * 100 * t))
    })
    nodeVoltages.push({ nodeName, values })
  })

  const branchCurrents: { componentName: string; values: number[] }[] = []
  const resistors = components.value.filter(c => c.type === 'resistor')
  resistors.forEach(r => {
    const values = timePoints.map(() => 5 / (parseValue(r.value) || 1000))
    branchCurrents.push({ componentName: r.name, values })
  })

  return {
    mode: 'transient',
    transient: {
      timePoints,
      nodeVoltages,
      branchCurrents
    }
  }
}

function generateMockAC(config: ACConfig): SimulationResult {
  const numDecades = Math.log10(config.endFreq / config.startFreq)
  const totalPoints = Math.floor(numDecades * config.pointsPerDecade)

  const frequencies: number[] = []
  for (let i = 0; i < totalPoints; i++) {
    const freq = config.startFreq * (10 ** (i / config.pointsPerDecade))
    if (freq <= config.endFreq) {
      frequencies.push(freq)
    }
  }
  if (frequencies[frequencies.length - 1] < config.endFreq) {
    frequencies.push(config.endFreq)
  }

  const nodeVoltages: { nodeName: string; magnitudes: number[]; phases: number[] }[] = [
    {
      nodeName: '0',
      magnitudes: Array.from({ length: frequencies.length }, () => 0),
      phases: Array.from({ length: frequencies.length }, () => 0)
    }
  ]

  const voltageSources = components.value.filter(c => c.type === 'voltage_source')
  voltageSources.forEach((_, i) => {
    const nodeName = String(i + 1)
    const magnitudes = frequencies.map(f => {
      const omega = 2 * Math.PI * f
      const baseMagnitude = 5
      const capacitors = components.value.filter(c => c.type === 'capacitor')
      const inductors = components.value.filter(c => c.type === 'inductor')

      if (capacitors.length > 0) {
        const c = parseValue(capacitors[0].value) || 1e-6
        const xc = 1 / (omega * c)
        const r = 1000
        return baseMagnitude * xc / Math.sqrt(r * r + xc * xc)
      }
      if (inductors.length > 0) {
        const l = parseValue(inductors[0].value) || 1e-3
        const xl = omega * l
        const r = 1000
        return baseMagnitude * xl / Math.sqrt(r * r + xl * xl)
      }
      return baseMagnitude
    })

    const phases = frequencies.map(f => {
      const omega = 2 * Math.PI * f
      const capacitors = components.value.filter(c => c.type === 'capacitor')
      const inductors = components.value.filter(c => c.type === 'inductor')

      if (capacitors.length > 0) {
        const r = 1000
        const c = parseValue(capacitors[0].value) || 1e-6
        const xc = 1 / (omega * c)
        return -Math.atan2(r, xc) * 180 / Math.PI
      }
      if (inductors.length > 0) {
        const r = 1000
        const l = parseValue(inductors[0].value) || 1e-3
        const xl = omega * l
        return Math.atan2(xl, r) * 180 / Math.PI
      }
      return 0
    })

    nodeVoltages.push({ nodeName, magnitudes, phases })
  })

  return {
    mode: 'ac',
    ac: {
      frequencies,
      nodeVoltages
    }
  }
}

function parseValue(value: string): number {
  const units: Record<string, number> = {
    'p': 1e-12, 'n': 1e-9, 'u': 1e-6, 'm': 1e-3,
    'k': 1e3, 'K': 1e3, 'M': 1e6, 'G': 1e9
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

async function exportSVG() {
  if (components.value.length === 0) {
    alert('请先添加元件到画布')
    return
  }

  try {
    const response = await fetch('/api/export/svg', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        components: components.value,
        wires: wires.value
      })
    })

    if (response.ok) {
      const svgData = await response.text()
      downloadFile(svgData, 'circuit.svg', 'image/svg+xml')
    } else {
      console.error('Export SVG failed:', await response.text())
      const svgData = generateMockSVG()
      downloadFile(svgData, 'circuit.svg', 'image/svg+xml')
    }
  } catch (error) {
    console.error('Export SVG error:', error)
    const svgData = generateMockSVG()
    downloadFile(svgData, 'circuit.svg', 'image/svg+xml')
  }
}

async function saveNetlist() {
  if (components.value.length === 0) {
    alert('请先添加元件到画布')
    return
  }

  try {
    const response = await fetch('/api/export/netlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        components: components.value,
        wires: wires.value
      })
    })

    if (response.ok) {
      const netlist = await response.text()
      downloadFile(netlist, 'circuit.sp', 'text/plain')
    } else {
      console.error('Save netlist failed:', await response.text())
      const netlist = generateMockNetlist()
      downloadFile(netlist, 'circuit.sp', 'text/plain')
    }
  } catch (error) {
    console.error('Save netlist error:', error)
    const netlist = generateMockNetlist()
    downloadFile(netlist, 'circuit.sp', 'text/plain')
  }
}

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function generateMockSVG(): string {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  
  components.value.forEach(comp => {
    minX = Math.min(minX, comp.x - 60)
    maxX = Math.max(maxX, comp.x + 60)
    minY = Math.min(minY, comp.y - 60)
    maxY = Math.max(maxY, comp.y + 60)
  })

  if (components.value.length === 0) {
    minX = 0; maxX = 800; minY = 0; maxY = 600
  }

  const padding = 50
  minX -= padding; maxX += padding
  minY -= padding; maxY += padding
  const width = maxX - minX
  const height = maxY - minY

  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     width="${width}" height="${height}" 
     viewBox="${minX} ${minY} ${width} ${height}">
  <defs>
    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e0e0e0" stroke-width="0.5"/>
    </pattern>
  </defs>
  <rect x="${minX}" y="${minY}" width="${width}" height="${height}" fill="url(#grid)"/>
  <text x="${minX + 20}" y="${minY + 30}" 
        font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#2c3e50">
    Circuit Diagram
  </text>
`

  const symbolPaths: Record<string, string> = {
    resistor: 'M-40,0 L-30,0 L-25,-8 L-15,8 L-5,-8 L5,8 L15,-8 L25,8 L30,0 L40,0',
    capacitor: 'M-30,0 L-10,0 M-10,-12 L-10,12 M10,-12 L10,12 M10,0 L30,0',
    inductor: 'M-40,0 L-30,0 Q-25,-12 -20,0 Q-15,-12 -10,0 Q-5,-12 0,0 Q5,-12 10,0 Q15,-12 20,0 Q25,-12 30,0 L40,0',
    diode: 'M-30,0 L-10,0 L10,0 L30,0 M-10,-8 L-10,8 L10,0 Z',
    voltage_source: 'M0,-25 L0,-15 M0,-15 A10,10 0 1,0 0,5 A10,10 0 1,0 0,-15 M0,5 L0,25 M-3,-5 L3,-5 M0,-8 L0,-2',
    current_source: 'M0,-25 L0,-15 M0,-15 A10,10 0 1,0 0,5 A10,10 0 1,0 0,-15 M0,5 L0,25 M0,-8 L0,2 M-4,-3 L0,-7 L4,-3',
    ground: 'M0,-15 L0,0 M-20,0 L20,0 M-15,6 L15,6 M-10,12 L10,12',
    transistor: 'M-30,0 L-5,0 M-5,0 L15,-20 M-5,0 L15,20 M-5,-8 L-5,8 M12,-17 L15,-20 L12,-23 M12,17 L15,20 L12,23',
    opamp: 'M-30,-25 L30,0 L-30,25 Z M-30,-15 L-10,-15 M-30,15 L-10,15 M30,0 L45,0 M-25,-22 L-25,22'
  }

  components.value.forEach(comp => {
    const path = symbolPaths[comp.type] || ''
    svg += `  <g transform="translate(${comp.x}, ${comp.y}) rotate(${comp.rotation})">
    <path d="${path}" fill="none" stroke="#2c3e50" stroke-width="2"/>
    <text x="0" y="-25" text-anchor="middle" font-family="monospace" font-size="12" fill="#7f8c8d">
      ${comp.name}
      ${comp.value ? `<tspan dx="0" dy="14" font-weight="bold">${comp.value}</tspan>` : ''}
    </text>
  </g>
`
  })

  svg += `</svg>`
  return svg
}

function generateMockNetlist(): string {
  let netlist = `* Circuit - Generated by Frontend
* Date: ${new Date().toISOString()}

`

  let nodeCounter = 0
  const pinToNode: Record<string, string> = {}
  const componentLines: string[] = []

  components.value.forEach(comp => {
    if (comp.type === 'ground') {
      comp.pins.forEach(pin => {
        pinToNode[`${comp.id}:${pin.id}`] = '0'
      })
    }
  })

  const getOrCreateNode = (compId: string, pinId: string): string => {
    const key = `${compId}:${pinId}`
    if (!pinToNode[key]) {
      nodeCounter++
      pinToNode[key] = String(nodeCounter)
    }
    return pinToNode[key]
  }

  components.value.forEach(comp => {
    const pins = comp.pins
    
    switch (comp.type) {
      case 'resistor':
        if (pins.length >= 2) {
          const n1 = getOrCreateNode(comp.id, pins[0].id)
          const n2 = getOrCreateNode(comp.id, pins[1].id)
          componentLines.push(`${comp.name.toUpperCase()} ${n1} ${n2} ${comp.value || '1k'}`)
        }
        break
      case 'capacitor':
        if (pins.length >= 2) {
          const n1 = getOrCreateNode(comp.id, pins[0].id)
          const n2 = getOrCreateNode(comp.id, pins[1].id)
          componentLines.push(`${comp.name.toUpperCase()} ${n1} ${n2} ${comp.value || '1u'}`)
        }
        break
      case 'inductor':
        if (pins.length >= 2) {
          const n1 = getOrCreateNode(comp.id, pins[0].id)
          const n2 = getOrCreateNode(comp.id, pins[1].id)
          componentLines.push(`${comp.name.toUpperCase()} ${n1} ${n2} ${comp.value || '1m'}`)
        }
        break
      case 'voltage_source':
        if (pins.length >= 2) {
          const n1 = getOrCreateNode(comp.id, pins[0].id)
          const n2 = getOrCreateNode(comp.id, pins[1].id)
          const sourceType = comp.properties?.type || 'dc'
          if (sourceType === 'dc') {
            componentLines.push(`${comp.name.toUpperCase()} ${n1} ${n2} DC ${comp.value || '5'}`)
          } else {
            componentLines.push(`${comp.name.toUpperCase()} ${n1} ${n2} AC ${comp.value || '5'} 0`)
          }
        }
        break
      case 'current_source':
        if (pins.length >= 2) {
          const n1 = getOrCreateNode(comp.id, pins[0].id)
          const n2 = getOrCreateNode(comp.id, pins[1].id)
          const sourceType = comp.properties?.type || 'dc'
          if (sourceType === 'dc') {
            componentLines.push(`${comp.name.toUpperCase()} ${n1} ${n2} DC ${comp.value || '1m'}`)
          } else {
            componentLines.push(`${comp.name.toUpperCase()} ${n1} ${n2} AC ${comp.value || '1m'} 0`)
          }
        }
        break
      case 'diode':
        if (pins.length >= 2) {
          const n1 = getOrCreateNode(comp.id, pins[0].id)
          const n2 = getOrCreateNode(comp.id, pins[1].id)
          const model = comp.properties?.model || 'D1N4148'
          componentLines.push(`${comp.name.toUpperCase()} ${n1} ${n2} ${model}`)
          componentLines.push(`.model ${model} D IS=1e-15 RS=100`)
        }
        break
    }
  })

  netlist += componentLines.join('\n')
  netlist += '\n\n.end\n'

  return netlist
}
</script>

<style scoped>
.app {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.header {
  height: 60px;
  background: #2c3e50;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header h1 {
  font-size: 1.5rem;
  font-weight: 500;
}

.controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.controls button {
  padding: 8px 16px;
  background: #3498db;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  font-size: 14px;
}

.controls button:hover {
  background: #2980b9;
}

.controls button:disabled {
  background: #95a5a6;
  cursor: not-allowed;
}

.controls select {
  padding: 8px;
  border: none;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}
</style>
