<template>
  <div
    class="circuit-canvas"
    @click="handleCanvasClick"
    @dragover="handleDragOver"
    @drop="handleDrop"
    ref="canvasRef"
  >
    <svg
      :width="canvasWidth"
      :height="canvasHeight"
      class="canvas-svg"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @contextmenu.prevent
    >
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e0e0e0" stroke-width="0.5" />
        </pattern>
        <linearGradient id="voltageGradient" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" style="stop-color:#0000ff;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#0080ff;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#00ff80;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#ff8000;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#ff0000;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect :width="canvasWidth" :height="canvasHeight" fill="url(#grid)" />

      <g class="wires">
        <WireComponent
          v-for="wire in wires"
          :key="wire.id"
          :wire="wire"
          :components="components"
          :simulation-result="simulationResult"
        />
      </g>

      <g class="components">
        <g
          v-for="comp in components"
          :key="comp.id"
          :transform="`translate(${comp.x}, ${comp.y}) rotate(${comp.rotation})`"
          class="component"
          :data-id="comp.id"
          :class="{
            selected: selectedComponent?.id === comp.id,
            'simulation-active': simulationResult !== null
          }"
        >
          <ComponentSymbol
            :component="comp"
            :show-voltage="simulationResult !== null"
            :node-voltages="getNodeVoltages(comp)"
          />
        </g>
      </g>

      <g v-if="isDrawingWire && wireStartPinPos" class="wire-drawing">
        <line
          :x1="wireStartPinPos.x"
          :y1="wireStartPinPos.y"
          :x2="mousePos.x"
          :y2="mousePos.y"
          stroke="#3498db"
          stroke-width="2"
          stroke-dasharray="5,5"
        />
      </g>

      <g class="pin-markers">
        <g v-for="comp in components" :key="`pins-${comp.id}`">
          <circle
            v-for="(pin, idx) in comp.pins"
            :key="pin.id"
            :cx="getPinWorldPosition(comp, idx).x"
            :cy="getPinWorldPosition(comp, idx).y"
            r="5"
            class="pin"
            :class="{
              'pin-hovered': hoveredPin?.pinId === pin.id,
              'wire-start': isWireStart(comp.id, pin.id)
            }"
            @mouseenter="handlePinHover(comp.id, pin.id)"
            @mouseleave="handlePinLeave"
            @mousedown.stop="handlePinClick(comp.id, pin.id)"
          />
        </g>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type {
  CircuitComponent,
  Wire,
  Point,
  SimulationResult,
  ComponentType
} from '../types'
import { getPinWorldPosition, getComponentDefinition } from '../utils/componentUtils'
import ComponentSymbol from './ComponentSymbol.vue'
import WireComponent from './WireComponent.vue'

interface Props {
  components: CircuitComponent[]
  wires: Wire[]
  selectedComponent: CircuitComponent | null
  isDrawingWire: boolean
  wireStart: { componentId: string; pinId: string } | null
  simulationResult: SimulationResult | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'select-component', component: CircuitComponent | null): void
  (e: 'add-component', type: ComponentType, position: Point): void
  (e: 'update-component', component: CircuitComponent): void
  (e: 'delete-component', componentId: string): void
  (e: 'start-wire', params: { componentId: string; pinId: string }): void
  (e: 'end-wire', params: { componentId: string; pinId: string; points: Point[] }): void
  (e: 'cancel-wire'): void
}>()

const canvasRef = ref<HTMLElement | null>(null)
const canvasWidth = ref(2000)
const canvasHeight = ref(1500)
const mousePos = ref<Point>({ x: 0, y: 0 })
const isDragging = ref(false)
const dragStartPos = ref<Point>({ x: 0, y: 0 })
const dragComponentId = ref<string | null>(null)
const hoveredPin = ref<{ componentId: string; pinId: string } | null>(null)
const selectedTool = ref<'select' | 'wire'>('select')

const wireStartPinPos = computed(() => {
  if (!props.wireStart) return null
  const comp = props.components.find(c => c.id === props.wireStart!.componentId)
  if (!comp) return null
  const pinIndex = comp.pins.findIndex(p => p.id === props.wireStart!.pinId)
  if (pinIndex === -1) return null
  return getPinWorldPosition(comp, pinIndex)
})

function getNodeVoltages(component: CircuitComponent): Record<string, number> {
  const voltages: Record<string, number> = {}
  if (!props.simulationResult) return voltages

  if (props.simulationResult.mode === 'transient' && props.simulationResult.transient) {
    const timeIndex = props.simulationResult.transient.timePoints.length - 1
    props.simulationResult.transient.nodeVoltages.forEach(nv => {
      voltages[nv.nodeName] = nv.values[timeIndex] || 0
    })
  }

  return voltages
}

function isWireStart(componentId: string, pinId: string): boolean {
  return props.wireStart?.componentId === componentId && props.wireStart?.pinId === pinId
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'copy'
  }
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  const componentType = event.dataTransfer?.getData('component-type') as ComponentType
  if (componentType && canvasRef.value) {
    const rect = canvasRef.value.getBoundingClientRect()
    const svgRect = canvasRef.value.querySelector('svg')?.getBoundingClientRect()
    const x = event.clientX - (svgRect?.left || rect.left)
    const y = event.clientY - (svgRect?.top || rect.top)
    emit('add-component', componentType, { x, y })
  }
}

function handleMouseDown(event: MouseEvent) {
  const target = event.target as SVGElement
  const componentGroup = target.closest('.component')
  
  if (componentGroup && selectedTool.value === 'select') {
    const componentId = componentGroup.getAttribute('data-id')
    if (componentId) {
      const comp = props.components.find(c => c.id === componentId)
      if (comp) {
        emit('select-component', comp)
        dragComponentId.value = componentId
        isDragging.value = true
        dragStartPos.value = { x: event.clientX, y: event.clientY }
      }
    }
  }
}

function handleMouseMove(event: MouseEvent) {
  const svg = canvasRef.value?.querySelector('svg')
  if (!svg) return

  const rect = svg.getBoundingClientRect()
  mousePos.value = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  }

  if (isDragging.value && dragComponentId.value) {
    const dx = event.clientX - dragStartPos.value.x
    const dy = event.clientY - dragStartPos.value.y
    
    const comp = props.components.find(c => c.id === dragComponentId.value)
    if (comp) {
      const updated = {
        ...comp,
        x: Math.round((comp.x + dx) / 20) * 20,
        y: Math.round((comp.y + dy) / 20) * 20
      }
      emit('update-component', updated)
      dragStartPos.value = { x: event.clientX, y: event.clientY }
    }
  }
}

function handleMouseUp() {
  isDragging.value = false
  dragComponentId.value = null
}

function handleCanvasClick(event: MouseEvent) {
  const target = event.target as SVGElement
  if (target.tagName === 'svg' || target.getAttribute('fill') === 'url(#grid)') {
    if (!props.isDrawingWire) {
      emit('select-component', null)
    }
  }
}

function handlePinHover(componentId: string, pinId: string) {
  hoveredPin.value = { componentId, pinId }
}

function handlePinLeave() {
  hoveredPin.value = null
}

function handlePinClick(componentId: string, pinId: string) {
  if (!props.isDrawingWire) {
    emit('start-wire', { componentId, pinId })
  } else if (hoveredPin.value && !isWireStart(componentId, pinId)) {
    emit('end-wire', {
      componentId,
      pinId,
      points: [mousePos.value]
    })
  }
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Delete' && props.selectedComponent) {
    emit('delete-component', props.selectedComponent.id)
  }
  if (event.key === 'r' && props.selectedComponent) {
    const updated = {
      ...props.selectedComponent,
      rotation: (props.selectedComponent.rotation + 90) % 360
    }
    emit('update-component', updated)
  }
  if (event.key === 'Escape') {
    if (props.isDrawingWire) {
      emit('cancel-wire')
    }
    emit('select-component', null)
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  return () => {
    window.removeEventListener('keydown', handleKeyDown)
  }
})
</script>

<style scoped>
.circuit-canvas {
  flex: 1;
  overflow: auto;
  background: white;
  position: relative;
}

.canvas-svg {
  cursor: default;
}

.component {
  cursor: move;
}

.component.selected {
  filter: drop-shadow(0 0 3px #3498db);
}

.pin {
  fill: white;
  stroke: #7f8c8d;
  stroke-width: 1;
  cursor: crosshair;
  transition: all 0.1s;
}

.pin:hover,
.pin.pin-hovered {
  fill: #3498db;
  stroke: #3498db;
  r: 7;
}

.pin.wire-start {
  fill: #e74c3c;
  stroke: #e74c3c;
  r: 6;
}
</style>
