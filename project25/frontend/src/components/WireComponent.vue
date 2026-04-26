<template>
  <g>
    <path
      :d="wirePath"
      fill="none"
      :stroke="wireColor"
      stroke-width="3"
      :stroke-linecap="strokeLinecap"
      :stroke-linejoin="strokeLinejoin"
    />
    <path
      :d="wirePath"
      fill="none"
      stroke="transparent"
      stroke-width="10"
      class="wire-hit-area"
      @click="handleWireClick"
    />
  </g>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Wire, CircuitComponent, SimulationResult } from '../types'
import { getPinWorldPosition } from '../utils/componentUtils'

interface Props {
  wire: Wire
  components: CircuitComponent[]
  simulationResult?: SimulationResult | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'select-wire', wire: Wire): void
}>()

const startPinPos = computed(() => {
  const startComp = props.components.find(c => c.id === props.wire.startComponentId)
  if (!startComp) return null
  const pinIndex = startComp.pins.findIndex(p => p.id === props.wire.startPinId)
  if (pinIndex === -1) return null
  return getPinWorldPosition(startComp, pinIndex)
})

const endPinPos = computed(() => {
  const endComp = props.components.find(c => c.id === props.wire.endComponentId)
  if (!endComp) return null
  const pinIndex = endComp.pins.findIndex(p => p.id === props.wire.endPinId)
  if (pinIndex === -1) return null
  return getPinWorldPosition(endComp, pinIndex)
})

const wirePath = computed(() => {
  if (!startPinPos.value || !endPinPos.value) return ''

  const start = startPinPos.value
  const end = endPinPos.value

  const dx = end.x - start.x
  const dy = end.y - start.y

  if (Math.abs(dx) < 10 || Math.abs(dy) < 10) {
    return `M ${start.x} ${start.y} L ${end.x} ${end.y}`
  }

  const midX = (start.x + end.x) / 2
  const midY = (start.y + end.y) / 2

  if (Math.abs(dx) > Math.abs(dy)) {
    return `M ${start.x} ${start.y} H ${midX} V ${end.y} H ${end.x}`
  } else {
    return `M ${start.x} ${start.y} V ${midY} H ${end.x} V ${end.y}`
  }
})

const wireColor = computed(() => {
  if (!props.simulationResult) return '#2c3e50'
  
  if (props.simulationResult.mode === 'transient' && props.simulationResult.transient) {
    const timeIndex = props.simulationResult.transient.timePoints.length - 1
    const startComp = props.components.find(c => c.id === props.wire.startComponentId)
    if (startComp) {
      const startPin = startComp.pins.find(p => p.id === props.wire.startPinId)
      if (startPin) {
        const nodeVoltage = props.simulationResult.transient.nodeVoltages.find(
          nv => nv.nodeName === startPin.label || nv.nodeName.includes(startPin.label)
        )
        if (nodeVoltage) {
          const voltage = nodeVoltage.values[timeIndex] || 0
          return getCurrentColor(voltage)
        }
      }
    }
  }
  
  return '#2c3e50'
})

const strokeLinecap = 'round'
const strokeLinejoin = 'round'

function getCurrentColor(voltage: number): string {
  const absV = Math.abs(voltage)
  if (absV < 1) return '#0000ff'
  if (absV < 5) return '#0080ff'
  if (absV < 10) return '#00ff80'
  if (absV < 20) return '#ff8000'
  return '#ff0000'
}

function handleWireClick(event: Event) {
  event.stopPropagation()
  emit('select-wire', props.wire)
}
</script>

<style scoped>
.wire-hit-area {
  cursor: pointer;
}

.wire-hit-area:hover + path,
.wire-hit-area:hover {
  filter: drop-shadow(0 0 2px #3498db);
}
</style>
