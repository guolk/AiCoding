<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Droplets, TrendingUp, Scissors, FlaskConical, SprayCan, Search, Filter } from 'lucide-vue-next'
import { useGardenStore } from '@/stores/garden'
import { TASK_TYPE_LABELS, TASK_TYPE_COLORS, type TaskType } from '@/types'
import dayjs from 'dayjs'

const store = useGardenStore()
const router = useRouter()

const filterType = ref<TaskType | 'all'>('all')
const searchQuery = ref('')

const filteredRecords = computed(() => {
  let records = [...store.careRecords].sort((a, b) => 
    dayjs(b.date).valueOf() - dayjs(a.date).valueOf()
  )
  
  if (filterType.value !== 'all') {
    records = records.filter(r => r.type === filterType.value)
  }
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    records = records.filter(r => {
      const plant = store.getPlantById(r.plantId)
      return plant?.name.toLowerCase().includes(query) ||
             r.notes?.toLowerCase().includes(query) ||
             r.result?.toLowerCase().includes(query)
    })
  }
  
  return records
})

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
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h1 class="text-xl font-semibold text-gray-800">养护记录</h1>
      <router-link 
        to="/records/add"
        class="flex items-center space-x-2 px-4 py-2.5 bg-garden-500 text-white rounded-xl hover:bg-garden-600 transition-colors"
      >
        <Plus class="w-5 h-5" />
        <span>添加记录</span>
      </router-link>
    </div>

    <!-- 筛选栏 -->
    <div class="flex flex-col sm:flex-row gap-4">
      <div class="relative flex-1 max-w-md">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="搜索植物名称或记录内容..."
          class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-garden-500 focus:border-transparent"
        />
      </div>
      <div class="flex items-center space-x-2 overflow-x-auto scrollbar-hide">
        <button 
          class="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors"
          :class="filterType === 'all' ? 'bg-garden-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
          @click="filterType = 'all'"
        >
          全部
        </button>
        <button 
          v-for="(label, type) in TASK_TYPE_LABELS" 
          :key="type"
          class="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors"
          :class="filterType === type ? 'bg-garden-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
          @click="filterType = type as TaskType"
        >
          {{ label }}
        </button>
      </div>
    </div>

    <!-- 记录列表 -->
    <div v-if="filteredRecords.length > 0" class="space-y-4">
      <div 
        v-for="record in filteredRecords" 
        :key="record.id"
        class="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
      >
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center space-x-3">
            <div :class="[TASK_TYPE_COLORS[record.type], 'w-12 h-12 rounded-xl flex items-center justify-center text-white']">
              <component :is="getTaskIcon(record.type)" class="w-6 h-6" />
            </div>
            <div>
              <div class="flex items-center space-x-2">
                <span class="font-semibold text-gray-800">{{ TASK_TYPE_LABELS[record.type] }}</span>
                <span class="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                  {{ store.getPlantById(record.plantId)?.name }}
                </span>
              </div>
              <p class="text-sm text-gray-500">{{ record.date }}</p>
            </div>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div v-if="record.amount" class="flex items-center space-x-2">
            <span class="text-gray-500">用量：</span>
            <span class="text-gray-800">{{ record.amount }}</span>
          </div>
          <div v-if="record.result" class="flex items-center space-x-2">
            <span class="text-gray-500">结果：</span>
            <span class="text-gray-800">{{ record.result }}</span>
          </div>
        </div>
        
        <div v-if="record.notes" class="mt-3 p-3 bg-gray-50 rounded-lg">
          <p class="text-sm text-gray-600">{{ record.notes }}</p>
        </div>
        
        <div v-if="record.photoUrl" class="mt-3">
          <img :src="record.photoUrl" alt="养护照片" class="w-full max-w-xs rounded-lg" />
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="bg-white rounded-xl p-12 text-center">
      <div class="w-20 h-20 bg-garden-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Droplets class="w-10 h-10 text-garden-500" />
      </div>
      <h3 class="text-lg font-medium text-gray-800 mb-2">还没有养护记录</h3>
      <p class="text-gray-500 mb-6">开始记录你的养护操作，追踪植物的成长历程</p>
      <router-link 
        to="/records/add"
        class="inline-flex items-center space-x-2 px-6 py-3 bg-garden-500 text-white rounded-xl hover:bg-garden-600 transition-colors"
      >
        <Plus class="w-5 h-5" />
        <span>添加记录</span>
      </router-link>
    </div>
  </div>
</template>
