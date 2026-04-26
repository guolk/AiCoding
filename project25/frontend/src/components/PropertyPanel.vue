<template>
  <div class="property-panel">
    <h3>属性面板</h3>
    
    <div v-if="selectedComponent" class="properties">
      <div class="property-group">
        <label>名称</label>
        <input
          type="text"
          :value="selectedComponent.name"
          @input="handleNameChange($event)"
          class="property-input"
        />
      </div>

      <div class="property-group">
        <label>类型</label>
        <input
          type="text"
          :value="getComponentTypeName(selectedComponent.type)"
          disabled
          class="property-input disabled"
        />
      </div>

      <div class="property-group" v-if="selectedComponent.type !== 'ground'">
        <label>值</label>
        <input
          type="text"
          :value="selectedComponent.value"
          @input="handleValueChange($event)"
          placeholder="例如: 1k, 10u, 5"
          class="property-input"
        />
      </div>

      <div class="property-group">
        <label>位置</label>
        <div class="position-inputs">
          <div class="position-item">
            <label>X</label>
            <input
              type="number"
              :value="selectedComponent.x"
              @input="handlePositionChange('x', $event)"
              class="position-input"
            />
          </div>
          <div class="position-item">
            <label>Y</label>
            <input
              type="number"
              :value="selectedComponent.y"
              @input="handlePositionChange('y', $event)"
              class="position-input"
            />
          </div>
        </div>
      </div>

      <div class="property-group">
        <label>旋转角度</label>
        <select
          :value="selectedComponent.rotation"
          @change="handleRotationChange($event)"
          class="property-select"
        >
          <option :value="0">0°</option>
          <option :value="90">90°</option>
          <option :value="180">180°</option>
          <option :value="270">270°</option>
        </select>
      </div>

      <div class="property-group" v-if="Object.keys(selectedComponent.properties).length > 0">
        <label>属性</label>
        <div class="additional-properties">
          <div
            v-for="(value, key) in selectedComponent.properties"
            :key="key"
            class="additional-property"
          >
            <label>{{ key }}</label>
            <input
              type="text"
              :value="value"
              @input="handlePropertyChange(key, $event)"
              class="property-input"
            />
          </div>
        </div>
      </div>

      <div class="actions">
        <button @click="handleRotate" class="action-btn">
          旋转 (R)
        </button>
        <button @click="handleDelete" class="action-btn delete">
          删除 (Delete)
        </button>
      </div>
    </div>

    <div v-else class="no-selection">
      <p>请选择一个元件以查看和编辑属性</p>
      <div class="help-text">
        <h4>操作提示:</h4>
        <ul>
          <li>从左侧元件库拖拽元件到画布</li>
          <li>点击元件引脚开始绘制导线</li>
          <li>按 R 键旋转选中元件</li>
          <li>按 Delete 键删除选中元件</li>
          <li>按 ESC 取消操作</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CircuitComponent, ComponentType } from '../types'

interface Props {
  selectedComponent: CircuitComponent | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update-component', component: CircuitComponent): void
  (e: 'delete-component', componentId: string): void
}>()

const componentTypeNames: Record<ComponentType, string> = {
  resistor: '电阻',
  capacitor: '电容',
  inductor: '电感',
  diode: '二极管',
  transistor: '三极管',
  opamp: '运算放大器',
  voltage_source: '电压源',
  current_source: '电流源',
  ground: '接地'
}

function getComponentTypeName(type: ComponentType): string {
  return componentTypeNames[type] || type
}

function handleNameChange(event: Event) {
  if (!props.selectedComponent) return
  const input = event.target as HTMLInputElement
  const updated = {
    ...props.selectedComponent,
    name: input.value
  }
  emit('update-component', updated)
}

function handleValueChange(event: Event) {
  if (!props.selectedComponent) return
  const input = event.target as HTMLInputElement
  const updated = {
    ...props.selectedComponent,
    value: input.value,
    properties: {
      ...props.selectedComponent.properties,
      value: input.value
    }
  }
  emit('update-component', updated)
}

function handlePositionChange(axis: 'x' | 'y', event: Event) {
  if (!props.selectedComponent) return
  const input = event.target as HTMLInputElement
  const updated = {
    ...props.selectedComponent,
    [axis]: parseFloat(input.value) || 0
  }
  emit('update-component', updated)
}

function handleRotationChange(event: Event) {
  if (!props.selectedComponent) return
  const select = event.target as HTMLSelectElement
  const updated = {
    ...props.selectedComponent,
    rotation: parseInt(select.value)
  }
  emit('update-component', updated)
}

function handlePropertyChange(key: string, event: Event) {
  if (!props.selectedComponent) return
  const input = event.target as HTMLInputElement
  const updated = {
    ...props.selectedComponent,
    properties: {
      ...props.selectedComponent.properties,
      [key]: input.value
    }
  }
  emit('update-component', updated)
}

function handleRotate() {
  if (!props.selectedComponent) return
  const updated = {
    ...props.selectedComponent,
    rotation: (props.selectedComponent.rotation + 90) % 360
  }
  emit('update-component', updated)
}

function handleDelete() {
  if (!props.selectedComponent) return
  emit('delete-component', props.selectedComponent.id)
}
</script>

<style scoped>
.property-panel {
  width: 280px;
  background: #ecf0f1;
  border-left: 1px solid #bdc3c7;
  padding: 15px;
  overflow-y: auto;
}

.property-panel h3 {
  margin-bottom: 15px;
  font-size: 1rem;
  color: #2c3e50;
}

.properties {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.property-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.property-group label {
  font-size: 12px;
  color: #7f8c8d;
  font-weight: 500;
}

.property-input {
  padding: 8px 10px;
  border: 1px solid #bdc3c7;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.property-input:focus {
  border-color: #3498db;
}

.property-input.disabled {
  background: #f5f5f5;
  color: #7f8c8d;
  cursor: not-allowed;
}

.property-select {
  padding: 8px 10px;
  border: 1px solid #bdc3c7;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  background: white;
  cursor: pointer;
}

.position-inputs {
  display: flex;
  gap: 10px;
}

.position-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.position-item label {
  font-size: 10px;
  color: #95a5a6;
}

.position-input {
  padding: 8px;
  border: 1px solid #bdc3c7;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  width: 100%;
}

.additional-properties {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.additional-property {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.additional-property label {
  font-size: 11px;
  color: #95a5a6;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.action-btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 4px;
  background: #3498db;
  color: white;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}

.action-btn:hover {
  background: #2980b9;
}

.action-btn.delete {
  background: #e74c3c;
}

.action-btn.delete:hover {
  background: #c0392b;
}

.no-selection {
  text-align: center;
  color: #7f8c8d;
  padding-top: 30px;
}

.no-selection p {
  font-size: 14px;
  margin-bottom: 30px;
}

.help-text {
  text-align: left;
  padding: 15px;
  background: white;
  border-radius: 8px;
}

.help-text h4 {
  font-size: 13px;
  color: #2c3e50;
  margin-bottom: 10px;
}

.help-text ul {
  list-style: none;
  padding: 0;
}

.help-text li {
  font-size: 12px;
  padding: 4px 0;
  color: #7f8c8d;
}
</style>
