<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronLeft, ChevronRight, Plus, Droplets, TrendingUp, Scissors, FlaskConical, SprayCan } from 'lucide-vue-next'
import { useGardenStore } from '@/stores/garden'
import { TASK_TYPE_LABELS, TASK_TYPE_COLORS, type TaskType } from '@/types'
import dayjs from 'dayjs'

const store = useGardenStore()

const currentDate = ref(dayjs())

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const currentMonthDays = computed(() => {
  const startOfMonth = currentDate.value.startOf('month')
  const endOfMonth = currentDate.value.endOf('month')
  const startDay = startOfMonth.day()
  const daysInMonth = endOfMonth.date()
  
  const days: { date: dayjs.Dayjs; isCurrentMonth: boolean }[] = []
  
  for (let i = startDay - 1; i >= 0; i--) {
    days.push({
      date: startOfMonth.subtract(i + 1, 'day'),
      isCurrentMonth: false
    })
  }
  
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      date: startOfMonth.date(i),
      isCurrentMonth: true
    })
  }
  
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    days.push({
      date: endOfMonth.add(i, 'day'),
      isCurrentMonth: false
    })
  }
  
  return days
})

const getTasksForDate = (date: dayjs.Dayjs) => {
  return store.getTasksForDate(date.format('YYYY-MM-DD'))
}

const isToday = (date: dayjs.Dayjs) => {
  return date.isSame(dayjs(), 'day')
}

const prevMonth = () => {
  currentDate.value = currentDate.value.subtract(1, 'month')
}

const nextMonth = () => {
  currentDate.value = currentDate.value.add(1, 'month')
}

const goToToday = () => {
  currentDate.value = dayjs()
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
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-center space-x-4">
        <button 
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          @click="prevMonth"
        >
          <ChevronLeft class="w-5 h-5" />
        </button>
        <h2 class="text-xl font-semibold text-gray-800">
          {{ currentDate.format('YYYY年 M月') }}
        </h2>
        <button 
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          @click="nextMonth"
        >
          <ChevronRight class="w-5 h-5" />
        </button>
        <button 
          class="px-3 py-1.5 text-sm bg-garden-50 text-garden-600 rounded-lg hover:bg-garden-100 transition-colors"
          @click="goToToday"
        >
          今天
        </button>
      </div>
    </div>

    <!-- 日历 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <!-- 星期头部 -->
      <div class="grid grid-cols-7 border-b border-gray-100">
        <div 
          v-for="day in weekDays" 
          :key="day"
          class="py-3 text-center text-sm font-medium text-gray-500"
        >
          {{ day }}
        </div>
      </div>
      
      <!-- 日期格子 -->
      <div class="grid grid-cols-7">
        <div 
          v-for="(day, index) in currentMonthDays" 
          :key="index"
          class="min-h-[120px] p-2 border-b border-r border-gray-50"
          :class="[
            !day.isCurrentMonth ? 'bg-gray-50' : 'bg-white',
            isToday(day.date) ? 'bg-garden-50' : ''
          ]"
        >
          <div class="flex items-center justify-between mb-1">
            <span 
              class="text-sm font-medium"
              :class="[
                !day.isCurrentMonth ? 'text-gray-300' : 'text-gray-700',
                isToday(day.date) ? 'text-garden-600' : ''
              ]"
            >
              {{ day.date.date() }}
            </span>
            <div 
              v-if="isToday(day.date)"
              class="w-6 h-6 bg-garden-500 rounded-full flex items-center justify-center"
            >
              <span class="text-xs text-white font-medium">{{ day.date.date() }}</span>
            </div>
          </div>
          
          <div class="space-y-1">
            <div 
              v-for="task in getTasksForDate(day.date)" 
              :key="task.id"
              class="flex items-center space-x-1 px-2 py-1 rounded text-xs"
              :class="[TASK_TYPE_COLORS[task.type], 'text-white']"
            >
              <component :is="getTaskIcon(task.type)" class="w-3 h-3 flex-shrink-0" />
              <span class="truncate">{{ store.getPlantById(task.plantId)?.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 任务图例 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <h3 class="text-sm font-medium text-gray-700 mb-3">任务类型</h3>
      <div class="flex flex-wrap gap-3">
        <div 
          v-for="(label, type) in TASK_TYPE_LABELS" 
          :key="type"
          class="flex items-center space-x-2"
        >
          <div :class="[TASK_TYPE_COLORS[type as TaskType], 'w-4 h-4 rounded']" />
          <span class="text-sm text-gray-600">{{ label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
