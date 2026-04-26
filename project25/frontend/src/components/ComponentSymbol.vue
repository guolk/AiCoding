<template>
  <g :data-id="component.id">
    <path :d="symbolPath" fill="none" stroke="#2c3e50" stroke-width="2" />
    
    <g v-if="showVoltage && nodeVoltages" class="voltage-indicators">
      <text
        v-for="(pin, idx) in component.pins"
        :key="pin.id"
        :x="pin.offset.x + 10"
        :y="pin.offset.y - 10"
        class="voltage-value"
        :fill="getVoltageColor(getPinVoltage(pin))"
      >
        {{ formatVoltage(getPinVoltage(pin)) }}
      </text>
    </g>

    <text
      class="component-label"
      :x="getLabelPosition().x"
      :y="getLabelPosition().y"
      text-anchor="middle"
      font-size="12"
      fill="#7f8c8d"
    >
      {{ component.name }}
      <tspan
        v-if="component.value"
        :dx="getLabelDx()"
        dy="14"
        class="component-value"
      >
        {{ component.value }}
      </tspan>
    </text>
  </g>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CircuitComponent, Point } from '../types'
import { getComponentDefinition } from '../utils/componentUtils'

interface Props {
  component: CircuitComponent
  showVoltage: boolean
  nodeVoltages?: Record<string, number>
}

const props = defineProps<Props>()

const symbolPath = computed(() => {
  const type = props.component.type
  const paths: Record<string, string> = {
    resistor: 'M-40,0 L-30,0 L-25,-8 L-15,8 L-5,-8 L5,8 L15,-8 L25,8 L30,0 L40,0',
    capacitor: 'M-30,0 L-10,0 M-10,-12 L-10,12 M10,-12 L10,12 M10,0 L30,0',
    inductor: 'M-40,0 L-30,0 Q-25,-12 -20,0 Q-15,-12 -10,0 Q-5,-12 0,0 Q5,-12 10,0 Q15,-12 20,0 Q25,-12 30,0 L40,0',
    diode: 'M-30,0 L-10,0 L10,0 L30,0 M-10,-8 L-10,8 L10,0 Z',
    transistor: 'M-30,0 L-5,0 M-5,0 L15,-20 M-5,0 L15,20 M-5,-8 L-5,8 M12,-17 L15,-20 L12,-23 M12,17 L15,20 L12,23',
    opamp: 'M-30,-25 L30,0 L-30,25 Z M-30,-15 L-10,-15 M-30,15 L-10,15 M30,0 L45,0 M-25,-22 L-25,22',
    voltage_source: 'M0,-25 L0,-15 M0,-15 A10,10 0 1,0 0,5 A10,10 0 1,0 0,-15 M0,5 L0,25 M-3,-5 L3,-5 M0,-8 L0,-2',
    current_source: 'M0,-25 L0,-15 M0,-15 A10,10 0 1,0 0,5 A10,10 0 1,0 0,-15 M0,5 L0,25 M0,-8 L0,2 M-4,-3 L0,-7 L4,-3',
    ground: 'M0,-15 L0,0 M-20,0 L20,0 M-15,6 L15,6 M-10,12 L10,12'
  }
  return paths[type] || ''
})

function getLabelPosition(): Point {
  const def = getComponentDefinition(props.component.type)
  if (!def) return { x: 0, y: 0 }

  const positions: Record<string, Point> = {
    resistor: { x: 0, y: -25 },
    capacitor: { x: 0, y: -25 },
    inductor: { x: 0, y: -25 },
    diode: { x: 0, y: -25 },
    transistor: { x: -20, y: -25 },
    opamp: { x: -20, y: -35 },
    voltage_source: { x: 30, y: 0 },
    current_source: { x: 30, y: 0 },
    ground: { x: 0, y: -25 }
  }

  return positions[props.component.type] || { x: 0, y: -20 }
}

function getLabelDx(): number {
  return 0
}

function getPinVoltage(pin: { id: string; label: string; offset: Point }): number {
  if (!props.nodeVoltages) return 0
  return props.nodeVoltages[pin.label] || 0
}

function getVoltageColor(voltage: number): string {
  const absV = Math.abs(voltage)
  if (absV < 1) return '#0000ff'
  if (absV < 5) return '#0080ff'
  if (absV < 10) return '#00ff80'
  if (absV < 20) return '#ff8000'
  return '#ff0000'
}

function formatVoltage(voltage: number): string {
  if (Math.abs(voltage) < 1e-3) {
    return (voltage * 1e6).toFixed(1) + 'uV'
  } else if (Math.abs(voltage) < 1) {
    return (voltage * 1e3).toFixed(1) + 'mV'
  }
  return voltage.toFixed(2) + 'V'
}
</script>

<style scoped>
.component-label {
  font-family: monospace;
  pointer-events: none;
}

.component-value {
  font-weight: bold;
}

.voltage-indicators text {
  font-family: monospace;
  font-size: 10px;
  font-weight: bold;
}
</style>
