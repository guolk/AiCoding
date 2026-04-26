<template>
  <div class="component-library">
    <h3>元件库</h3>
    <div class="components-grid">
      <div
        v-for="def in componentDefinitions"
        :key="def.type"
        class="component-item"
        draggable="true"
        @dragstart="handleDragStart($event, def.type)"
      >
        <svg :width="def.width" :height="def.height" viewBox="0 0 100 60">
          <g :transform="getSymbolTransform(def.type)">
            <path :d="getSymbolPath(def.type)" fill="none" stroke="#333" stroke-width="2" />
          </g>
        </svg>
        <span class="component-name">{{ def.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { componentDefinitions } from '../utils/componentUtils'
import type { ComponentType } from '../types'

const emit = defineEmits<{
  (e: 'add-component', type: ComponentType): void
}>()

function handleDragStart(event: DragEvent, type: ComponentType) {
  if (event.dataTransfer) {
    event.dataTransfer.setData('component-type', type)
    event.dataTransfer.effectAllowed = 'copy'
  }
}

function getSymbolTransform(type: ComponentType): string {
  const transforms: Record<ComponentType, string> = {
    resistor: 'translate(10, 30)',
    capacitor: 'translate(20, 30)',
    inductor: 'translate(10, 30)',
    diode: 'translate(20, 30)',
    transistor: 'translate(20, 30)',
    opamp: 'translate(10, 30)',
    voltage_source: 'translate(50, 30)',
    current_source: 'translate(50, 30)',
    ground: 'translate(50, 30)'
  }
  return transforms[type] || 'translate(0, 0)'
}

function getSymbolPath(type: ComponentType): string {
  const paths: Record<ComponentType, string> = {
    resistor: 'M-30,0 L-20,0 L-15,-5 L-5,5 L5,-5 L15,5 L25,-5 L30,0 L40,0',
    capacitor: 'M-10,0 M-10,-10 L-10,10 M10,-10 L10,10 M-10,0 L10,0',
    inductor: 'M-30,0 L-20,0 Q-15,-10 -10,0 Q-5,-10 0,0 Q5,-10 10,0 Q15,-10 20,0 L30,0',
    diode: 'M-10,0 L10,0 M10,-8 L10,8 L-10,0 Z',
    transistor: 'M-10,0 L5,0 M5,0 L15,-10 M5,0 L15,10 M5,-5 L5,5 M12,-8 L15,-10 L12,-12 M12,8 L15,10 L12,12',
    opamp: 'M-20,-20 L20,0 L-20,20 Z M-20,-10 L-10,-10 M-20,10 L-10,10 M20,0 L30,0',
    voltage_source: 'M0,-15 L0,15 M0,-10 A5,5 0 1,0 0,0 A5,5 0 1,0 0,-10 M-2,-5 L2,-5 M0,-7 L0,-3',
    current_source: 'M0,-15 L0,15 M0,-10 A5,5 0 1,0 0,0 A5,5 0 1,0 0,-10 M0,-5 L0,5 M-3,0 L0,-3 L3,0',
    ground: 'M0,-10 L0,0 M-15,0 L15,0 M-10,5 L10,5 M-5,10 L5,10'
  }
  return paths[type] || ''
}
</script>

<style scoped>
.component-library {
  width: 200px;
  background: #ecf0f1;
  border-right: 1px solid #bdc3c7;
  padding: 15px;
  overflow-y: auto;
}

.component-library h3 {
  margin-bottom: 15px;
  font-size: 1rem;
  color: #2c3e50;
}

.components-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.component-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  background: white;
  border-radius: 8px;
  cursor: grab;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.component-item:hover {
  border-color: #3498db;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.component-item:active {
  cursor: grabbing;
}

.component-name {
  font-size: 12px;
  color: #7f8c8d;
  margin-top: 5px;
}

svg {
  display: block;
}
</style>
