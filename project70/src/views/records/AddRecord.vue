<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Plus, Droplets, TrendingUp, Scissors, FlaskConical, SprayCan } from 'lucide-vue-next'
import { useGardenStore } from '@/stores/garden'
import { TASK_TYPE_LABELS, TASK_TYPE_COLORS, type TaskType } from '@/types'
import dayjs from 'dayjs'

const store = useGardenStore()
const router = useRouter()

const form = ref({
  plantId: store.plants[0]?.id || '',
  type: 'water' as TaskType,
  date: dayjs().format('YYYY-MM-DD'),
  amount: '',
  result: '',
  photoUrl: '',
  notes: ''
})

const submit = () => {
  if (!form.value.plantId) {
    alert('请选择植物')
    return
  }
  
  store.addCareRecord({
    plantId: form.value.plantId,
    type: form.value.type,
    date: form.value.date,
    amount: form.value.amount || undefined,
    result: form.value.result || undefined,
    photoUrl: form.value.photoUrl || undefined,
    notes: form.value.notes || undefined
  })
  
  router.push('/records')
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
  <div class="max-w-2xl mx-auto space-y-6">
    <button 
      class="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
      @click="router.back()"
    >
      <ArrowLeft class="w-5 h-5" />
      <span>返回</span>
    </button>

    <div class="bg-white rounded-xl p-6 shadow-sm">
      <h1 class="text-xl font-bold text-gray-800 mb-6">添加养护记录</h1>
      
      <div class="space-y-6">
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
          <label class="block text-sm font-medium text-gray-700 mb-2">操作类型</label>
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
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">日期</label>
            <input 
              v-model="form.date"
              type="date" 
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-garden-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">用量</label>
            <input 
              v-model="form.amount"
              type="text" 
              placeholder="如：500ml"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-garden-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">操作结果</label>
          <input 
            v-model="form.result"
            type="text" 
            placeholder="如：生长良好"
            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-garden-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">照片链接（可选）</label>
          <input 
            v-model="form.photoUrl"
            type="text" 
            placeholder="输入图片URL"
            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-garden-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">备注</label>
          <textarea 
            v-model="form.notes"
            placeholder="记录养护细节..."
            rows="3"
            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-garden-500 focus:border-transparent resize-none"
          />
        </div>
        
        <div class="flex space-x-4">
          <button 
            type="button"
            class="flex-1 px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            @click="router.back()"
          >
            取消
          </button>
          <button 
            type="button"
            class="flex-1 px-6 py-3 bg-garden-500 text-white rounded-xl hover:bg-garden-600 transition-colors font-medium flex items-center justify-center space-x-2"
            @click="submit"
          >
            <Plus class="w-5 h-5" />
            <span>保存记录</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
