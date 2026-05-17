<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Calendar, Leaf, Sun, Snowflake, CloudRain } from 'lucide-vue-next'
import { useGardenStore } from '@/stores/garden'

const store = useGardenStore()
const router = useRouter()

const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']

const getSeasonIcon = (month: number) => {
  if (month >= 3 && month <= 5) return Leaf
  if (month >= 6 && month <= 8) return Sun
  if (month >= 9 && month <= 11) return CloudRain
  return Snowflake
}

const getSeasonColor = (month: number) => {
  if (month >= 3 && month <= 5) return 'bg-green-100 text-green-600'
  if (month >= 6 && month <= 8) return 'bg-orange-100 text-orange-600'
  if (month >= 9 && month <= 11) return 'bg-amber-100 text-amber-600'
  return 'bg-blue-100 text-blue-600'
}
</script>

<template>
  <div class="space-y-6">
    <button 
      class="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
      @click="router.back()"
    >
      <ArrowLeft class="w-5 h-5" />
      <span>返回</span>
    </button>

    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center space-x-3 mb-6">
        <div class="w-12 h-12 bg-garden-100 rounded-xl flex items-center justify-center">
          <Calendar class="w-6 h-6 text-garden-600" />
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-800">园艺日历</h1>
          <p class="text-gray-500">了解每个月适合种植和养护的植物</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div 
          v-for="entry in store.gardenCalendar" 
          :key="entry.id"
          class="border border-gray-200 rounded-xl p-5 hover:border-garden-300 transition-colors"
        >
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-lg font-semibold text-gray-800">{{ monthNames[entry.month - 1] }}</h3>
            <div :class="[getSeasonColor(entry.month), 'w-10 h-10 rounded-lg flex items-center justify-center']">
              <component :is="getSeasonIcon(entry.month)" class="w-5 h-5" />
            </div>
          </div>
          
          <h4 class="font-medium text-gray-800 mb-2">{{ entry.title }}</h4>
          <p class="text-sm text-gray-600 mb-4">{{ entry.description }}</p>
          
          <div>
            <p class="text-xs text-gray-500 mb-2">适合植物：</p>
            <div class="flex flex-wrap gap-1">
              <span 
                v-for="pt in entry.plantTypes" 
                :key="pt"
                class="px-2 py-0.5 bg-garden-50 text-garden-700 rounded text-xs"
              >
                {{ pt }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-gradient-to-r from-garden-50 to-emerald-50 border border-garden-200 rounded-xl p-6">
      <h3 class="font-semibold text-garden-800 mb-3">四季养护要点</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white/80 rounded-lg p-4">
          <div class="flex items-center space-x-2 mb-2">
            <Leaf class="w-5 h-5 text-green-500" />
            <h4 class="font-medium text-gray-800">春季</h4>
          </div>
          <ul class="text-sm text-gray-600 space-y-1">
            <li>• 适宜换盆和繁殖</li>
            <li>• 增加浇水和施肥</li>
            <li>• 注意防治病虫害</li>
          </ul>
        </div>
        <div class="bg-white/80 rounded-lg p-4">
          <div class="flex items-center space-x-2 mb-2">
            <Sun class="w-5 h-5 text-orange-500" />
            <h4 class="font-medium text-gray-800">夏季</h4>
          </div>
          <ul class="text-sm text-gray-600 space-y-1">
            <li>• 避免强光直射</li>
            <li>• 早晚浇水为宜</li>
            <li>• 保持通风降温</li>
          </ul>
        </div>
        <div class="bg-white/80 rounded-lg p-4">
          <div class="flex items-center space-x-2 mb-2">
            <CloudRain class="w-5 h-5 text-amber-500" />
            <h4 class="font-medium text-gray-800">秋季</h4>
          </div>
          <ul class="text-sm text-gray-600 space-y-1">
            <li>• 减少施肥量</li>
            <li>• 增加光照时间</li>
            <li>• 准备越冬工作</li>
          </ul>
        </div>
        <div class="bg-white/80 rounded-lg p-4">
          <div class="flex items-center space-x-2 mb-2">
            <Snowflake class="w-5 h-5 text-blue-500" />
            <h4 class="font-medium text-gray-800">冬季</h4>
          </div>
          <ul class="text-sm text-gray-600 space-y-1">
            <li>• 控制浇水频率</li>
            <li>• 注意保暖防冻</li>
            <li>• 停止施肥</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
