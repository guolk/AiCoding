<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Leaf, 
  Droplets, 
  Calendar, 
  TrendingUp,
  ChevronRight,
  Check,
  Plus
} from 'lucide-vue-next'
import { useGardenStore } from '@/stores/garden'
import { TASK_TYPE_LABELS, TASK_TYPE_COLORS } from '@/types'
import dayjs from 'dayjs'

const store = useGardenStore()
const router = useRouter()

const currentMonth = dayjs().month()
const currentSeasonReminder = computed(() => {
  const month = currentMonth + 1
  return store.gardenCalendar.find(c => c.month === month)
})

const recentPlants = computed(() => store.plants.slice(0, 4))
</script>

<template>
  <div class="space-y-6">
    <!-- 欢迎卡片 -->
    <div class="bg-gradient-to-r from-garden-500 to-garden-600 rounded-2xl p-6 text-white">
      <h1 class="text-2xl font-bold mb-2">欢迎回来，园艺爱好者！🌱</h1>
      <p class="text-garden-100 mb-4">今天也要好好照顾你的植物们哦~</p>
      <div class="flex flex-wrap gap-4">
        <div class="flex items-center space-x-2">
          <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <Leaf class="w-5 h-5" />
          </div>
          <div>
            <p class="text-sm text-garden-100">植物总数</p>
            <p class="text-xl font-bold">{{ store.plants.length }}</p>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <Droplets class="w-5 h-5" />
          </div>
          <div>
            <p class="text-sm text-garden-100">今日待办</p>
            <p class="text-xl font-bold">{{ store.todayTasks.length }}</p>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <Calendar class="w-5 h-5" />
          </div>
          <div>
            <p class="text-sm text-garden-100">养护记录</p>
            <p class="text-xl font-bold">{{ store.careRecords.length }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 今日任务 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-800">今日待办任务</h2>
        <router-link 
          to="/care" 
          class="text-garden-600 text-sm font-medium hover:underline flex items-center"
        >
          查看全部 <ChevronRight class="w-4 h-4" />
        </router-link>
      </div>
      
      <div v-if="store.todayTasks.length > 0" class="space-y-3">
        <div 
          v-for="task in store.todayTasks" 
          :key="task.id"
          class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div class="flex items-center space-x-3">
            <div :class="[TASK_TYPE_COLORS[task.type], 'w-10 h-10 rounded-lg flex items-center justify-center text-white']">
              <Droplets v-if="task.type === 'water'" class="w-5 h-5" />
              <TrendingUp v-else class="w-5 h-5" />
            </div>
            <div>
              <p class="font-medium text-gray-800">{{ TASK_TYPE_LABELS[task.type] }}</p>
              <p class="text-sm text-gray-500">{{ store.getPlantById(task.plantId)?.name }}</p>
            </div>
          </div>
          <button 
            class="px-4 py-2 bg-garden-500 text-white rounded-lg text-sm font-medium hover:bg-garden-600 transition-colors flex items-center space-x-1"
            @click="store.completeTask(task.id)"
          >
            <Check class="w-4 h-4" />
            <span>完成</span>
          </button>
        </div>
      </div>
      
      <div v-else class="text-center py-8">
        <div class="w-16 h-16 bg-garden-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Check class="w-8 h-8 text-garden-500" />
        </div>
        <p class="text-gray-500">今天没有待办任务，太棒了！🎉</p>
      </div>
    </div>

    <!-- 本月养护提示 -->
    <div v-if="currentSeasonReminder" class="bg-amber-50 border border-amber-200 rounded-xl p-6">
      <div class="flex items-start space-x-4">
        <div class="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Calendar class="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h3 class="font-semibold text-amber-800 mb-1">{{ currentSeasonReminder.title }}</h3>
          <p class="text-amber-700 text-sm">{{ currentSeasonReminder.description }}</p>
          <p class="text-amber-600 text-xs mt-2">适用植物：{{ currentSeasonReminder.plantTypes.join('、') }}</p>
        </div>
      </div>
    </div>

    <!-- 我的植物 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-800">我的植物</h2>
        <div class="flex items-center space-x-2">
          <router-link 
            to="/plants/add" 
            class="px-4 py-2 bg-garden-500 text-white rounded-lg text-sm font-medium hover:bg-garden-600 transition-colors flex items-center space-x-1"
          >
            <Plus class="w-4 h-4" />
            <span>添加植物</span>
          </router-link>
          <router-link 
            to="/plants" 
            class="text-garden-600 text-sm font-medium hover:underline flex items-center"
          >
            查看全部 <ChevronRight class="w-4 h-4" />
          </router-link>
        </div>
      </div>
      
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <router-link
          v-for="plant in recentPlants"
          :key="plant.id"
          :to="`/plants/${plant.id}`"
          class="group"
        >
          <div class="aspect-square rounded-xl overflow-hidden mb-2 bg-gray-100">
            <img 
              v-if="plant.photos.length > 0"
              :src="plant.photos[0].url" 
              :alt="plant.name"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <Leaf class="w-12 h-12 text-gray-300" />
            </div>
          </div>
          <p class="font-medium text-gray-800 truncate">{{ plant.name }}</p>
          <p class="text-sm text-gray-500 truncate">{{ plant.location }}</p>
        </router-link>
      </div>
    </div>
  </div>
</template>
