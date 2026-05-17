<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Check, Droplets, TrendingUp, Scissors, FlaskConical, SprayCan, X, Edit2, Trash2 } from 'lucide-vue-next'
import { useGardenStore } from '@/stores/garden'
import { TASK_TYPE_LABELS, TASK_TYPE_COLORS, type TaskType } from '@/types'
import dayjs from 'dayjs'

const store = useGardenStore()

const showAddModal = ref(false)
const editingTask = ref<string | null>(null)

const form = ref({
  plantId: '',
  type: 'water' as TaskType,
  frequencyDays: 7,
  nextDueDate: dayjs().format('YYYY-MM-DD'),
  notes: ''
})

const groupedTasks = computed(() => {
  const groups: Record<string, typeof store.careTasks.value> = {}
  store.careTasks.forEach(task => {
    const plant = store.getPlantById(task.plantId)
    const plantName = plant?.name || '未命名'
    if (!groups[plantName]) {
      groups[plantName] = []
    }
    groups[plantName].push(task)
  })
  return groups
})

const openAddModal = () => {
  editingTask.value = null
  form.value = {
    plantId: store.plants[0]?.id || '',
    type: 'water',
    frequencyDays: 7,
    nextDueDate: dayjs().format('YYYY-MM-DD'),
    notes: ''
  }
  showAddModal.value = true
}

const submit = () => {
  if (!form.value.plantId) {
    alert('请选择植物')
    return
  }
  
  if (editingTask.value) {
    store.updateCareTask(editingTask.value, form.value)
  } else {
    store.addCareTask({
      ...form.value,
      enabled: true
    })
  }
  
  showAddModal.value = false
}

const deleteTask = (id: string) => {
  if (confirm('确定要删除这个养护任务吗？')) {
    store.deleteCareTask(id)
  }
}

const toggleTask = (task: any) => {
  store.updateCareTask(task.id, { enabled: !task.enabled })
}

const getTaskIcon = (type: TaskType) => {
  const icons: Record<TaskType, any> = {
    water: Droplets,
    fertilize: TrendingUp,
    repot: FlaskConical,
    prune: Scissors,
    spray: SprayCan
  }
  return icons[type]
}
</script>

<template>
  <div class="space-y-6">
    <!-- 顶部操作栏 -->
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold text-gray-800">养护任务管理</h1>
      <button 
        class="flex items-center space-x-2 px-4 py-2.5 bg-garden-500 text-white rounded-xl hover:bg-garden-600 transition-colors"
        @click="openAddModal"
      >
        <Plus class="w-5 h-5" />
        <span>添加任务</span>
      </button>
    </div>

    <!-- 今日待办 -->
    <div v-if="store.todayTasks.length > 0" class="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
      <h3 class="font-semibold text-amber-800 mb-4">今日待办</h3>
      <div class="space-y-3">
        <div 
          v-for="task in store.todayTasks" 
          :key="task.id"
          class="flex items-center justify-between p-3 bg-white/80 rounded-lg"
        >
          <div class="flex items-center space-x-3">
            <div :class="[TASK_TYPE_COLORS[task.type], 'w-8 h-8 rounded-lg flex items-center justify-center text-white']">
              <component :is="getTaskIcon(task.type)" class="w-4 h-4" />
            </div>
            <div>
              <p class="font-medium text-gray-800">{{ TASK_TYPE_LABELS[task.type] }} - {{ store.getPlantById(task.plantId)?.name }}</p>
              <p class="text-xs text-gray-500">{{ task.notes }}</p>
            </div>
          </div>
          <button 
            class="p-2 bg-garden-500 text-white rounded-lg hover:bg-garden-600 transition-colors"
            @click="store.completeTask(task.id)"
          >
            <Check class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- 任务列表 -->
    <div class="space-y-6">
      <div 
        v-for="(tasks, plantName) in groupedTasks" 
        :key="plantName"
        class="bg-white rounded-xl shadow-sm overflow-hidden"
      >
        <div class="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 class="font-semibold text-gray-800">{{ plantName }}</h3>
        </div>
        <div class="divide-y divide-gray-50">
          <div 
            v-for="task in tasks" 
            :key="task.id"
            class="px-6 py-4 flex items-center justify-between"
            :class="{ 'opacity-50': !task.enabled }"
          >
            <div class="flex items-center space-x-4">
              <button 
                class="w-6 h-6 border-2 rounded-md flex items-center justify-center transition-colors"
                :class="task.enabled ? 'border-garden-500 bg-garden-500' : 'border-gray-300'"
                @click="toggleTask(task)"
              >
                <Check v-if="task.enabled" class="w-4 h-4 text-white" />
              </button>
              <div :class="[TASK_TYPE_COLORS[task.type], 'w-10 h-10 rounded-lg flex items-center justify-center text-white']">
                <component :is="getTaskIcon(task.type)" class="w-5 h-5" />
              </div>
              <div>
                <p class="font-medium text-gray-800">{{ TASK_TYPE_LABELS[task.type] }}</p>
                <p class="text-sm text-gray-500">
                  每 {{ task.frequencyDays }} 天一次 · 下次：{{ task.nextDueDate }}
                  <span v-if="task.lastDoneDate"> · 上次：{{ task.lastDoneDate }}</span>
                </p>
                <p v-if="task.notes" class="text-xs text-gray-400 mt-1">{{ task.notes }}</p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <button 
                class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                @click="deleteTask(task.id)"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="store.careTasks.length === 0" class="bg-white rounded-xl p-12 text-center">
      <div class="w-20 h-20 bg-garden-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <TrendingUp class="w-10 h-10 text-garden-500" />
      </div>
      <h3 class="text-lg font-medium text-gray-800 mb-2">还没有养护任务</h3>
      <p class="text-gray-500 mb-6">为你的植物添加定期养护任务，让它们健康成长</p>
      <button 
        class="inline-flex items-center space-x-2 px-6 py-3 bg-garden-500 text-white rounded-xl hover:bg-garden-600 transition-colors"
        @click="openAddModal"
      >
        <Plus class="w-5 h-5" />
        <span>添加任务</span>
      </button>
    </div>

    <!-- 添加/编辑任务弹窗 -->
    <div 
      v-if="showAddModal" 
      class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      @click.self="showAddModal = false"
    >
      <div class="bg-white rounded-xl p-6 w-full max-w-md">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold">{{ editingTask ? '编辑任务' : '添加养护任务' }}</h3>
          <button 
            class="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            @click="showAddModal = false"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">选择植物</label>
            <select 
              v-model="form.plantId"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-garden-500 focus:border-transparent"
            >
              <option v-for="plant in store.plants" :key="plant.id" :value="plant.id">
                {{ plant.name }}
              </option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">任务类型</label>
            <div class="grid grid-cols-5 gap-2">
              <button 
                v-for="(label, type) in TASK_TYPE_LABELS" 
                :key="type"
                type="button"
                class="p-3 rounded-xl border-2 transition-colors flex flex-col items-center space-y-1"
                :class="form.type === type ? 'border-garden-500 bg-garden-50' : 'border-gray-200 hover:border-gray-300'"
                @click="form.type = type as TaskType"
              >
                <component :is="getTaskIcon(type as TaskType)" class="w-5 h-5" :class="form.type === type ? 'text-garden-600' : 'text-gray-400'" />
                <span class="text-xs" :class="form.type === type ? 'text-garden-600' : 'text-gray-500'">{{ label }}</span>
              </button>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">养护频率（天）</label>
            <input 
              v-model.number="form.frequencyDays"
              type="number" 
              min="1"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-garden-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">下次执行日期</label>
            <input 
              v-model="form.nextDueDate"
              type="date" 
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-garden-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">备注</label>
            <textarea 
              v-model="form.notes"
              placeholder="养护注意事项..."
              rows="2"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-garden-500 focus:border-transparent resize-none"
            />
          </div>
          
          <div class="flex space-x-3 pt-4">
            <button 
              type="button"
              class="flex-1 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              @click="showAddModal = false"
            >
              取消
            </button>
            <button 
              type="button"
              class="flex-1 px-4 py-3 bg-garden-500 text-white rounded-xl hover:bg-garden-600 transition-colors font-medium"
              @click="submit"
            >
              {{ editingTask ? '保存' : '添加' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
