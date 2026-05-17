<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Sun, Droplets, Thermometer, MapPin, Calendar, X } from 'lucide-vue-next'
import { useGardenStore } from '@/stores/garden'
import dayjs from 'dayjs'

const store = useGardenStore()

const showAddModal = ref(false)
const form = ref({
  location: '',
  date: dayjs().format('YYYY-MM-DD'),
  lightLevel: 50,
  humidity: 50,
  temperature: 25,
  notes: ''
})

const locations = computed(() => {
  const locs = new Set<string>()
  store.plants.forEach(p => locs.add(p.location))
  store.environmentRecords.forEach(r => locs.add(r.location))
  return Array.from(locs)
})

const latestRecordsByLocation = computed(() => {
  const latest: Record<string, typeof store.environmentRecords.value[0]> = {}
  store.environmentRecords.forEach(record => {
    if (!latest[record.location] || dayjs(record.date).isAfter(dayjs(latest[record.location].date))) {
      latest[record.location] = record
    }
  })
  return latest
})

const getSeason = () => {
  const month = dayjs().month()
  if (month >= 2 && month <= 4) return 'spring'
  if (month >= 5 && month <= 7) return 'summer'
  if (month >= 8 && month <= 10) return 'autumn'
  return 'winter'
}

const currentSeason = computed(() => getSeason())

const seasonReminders = computed(() => {
  const season = currentSeason.value
  const reminders = {
    spring: [
      { title: '增加浇水频率', desc: '气温回升，植物开始生长，适当增加浇水' },
      { title: '开始施肥', desc: '生长季开始，每月施一次稀释液肥' },
      { title: '适合换盆', desc: '春季是换盆的最佳时机，检查根系' }
    ],
    summer: [
      { title: '注意遮阳', desc: '避免强光直射，中午适当遮阳' },
      { title: '增加喷雾', desc: '高温干燥时增加空气湿度' },
      { title: '避免正午浇水', desc: '选择早晨或傍晚浇水' }
    ],
    autumn: [
      { title: '减少施肥', desc: '生长放缓，减少施肥量' },
      { title: '增加光照', desc: '阳光温和，可增加直射光' },
      { title: '准备越冬', desc: '不耐寒植物准备移入室内' }
    ],
    winter: [
      { title: '减少浇水', desc: '休眠期保持土壤微干' },
      { title: '注意保温', desc: '避免冻伤，远离冷风口' },
      { title: '停止施肥', desc: '休眠期不需要施肥' }
    ]
  }
  return reminders[season]
})

const seasonNames: Record<string, string> = {
  spring: '春季',
  summer: '夏季',
  autumn: '秋季',
  winter: '冬季'
}

const submit = () => {
  if (!form.value.location) {
    alert('请输入位置')
    return
  }
  
  store.addEnvironmentRecord({
    location: form.value.location,
    date: form.value.date,
    lightLevel: form.value.lightLevel,
    humidity: form.value.humidity,
    temperature: form.value.temperature,
    notes: form.value.notes || undefined
  })
  
  showAddModal.value = false
  form.value = {
    location: '',
    date: dayjs().format('YYYY-MM-DD'),
    lightLevel: 50,
    humidity: 50,
    temperature: 25,
    notes: ''
  }
}

const getPlantsAtLocation = (location: string) => {
  return store.plants.filter(p => p.location === location)
}
</script>

<template>
  <div class="space-y-6">
    <!-- 顶部操作栏 -->
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold text-gray-800">环境追踪</h1>
      <button 
        class="flex items-center space-x-2 px-4 py-2.5 bg-garden-500 text-white rounded-xl hover:bg-garden-600 transition-colors"
        @click="showAddModal = true"
      >
        <Plus class="w-5 h-5" />
        <span>记录环境</span>
      </button>
    </div>

    <!-- 当前季节提醒 -->
    <div class="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
      <div class="flex items-center space-x-3 mb-4">
        <div class="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
          <Calendar class="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h3 class="font-semibold text-amber-800">{{ seasonNames[currentSeason] }}养护提示</h3>
          <p class="text-sm text-amber-600">当前季节的养护建议</p>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          v-for="(reminder, index) in seasonReminders" 
          :key="index"
          class="bg-white/80 rounded-lg p-4"
        >
          <h4 class="font-medium text-amber-800 mb-1">{{ reminder.title }}</h4>
          <p class="text-sm text-amber-700">{{ reminder.desc }}</p>
        </div>
      </div>
    </div>

    <!-- 各位置环境状况 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100">
        <h3 class="font-semibold text-gray-800">位置环境状况</h3>
      </div>
      <div class="p-6">
        <div v-if="locations.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            v-for="location in locations" 
            :key="location"
            class="border border-gray-200 rounded-xl p-5 hover:border-garden-300 transition-colors"
          >
            <div class="flex items-center space-x-2 mb-4">
              <MapPin class="w-5 h-5 text-garden-500" />
              <h4 class="font-semibold text-gray-800">{{ location }}</h4>
            </div>
            
            <div v-if="latestRecordsByLocation[location]" class="space-y-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <Sun class="w-4 h-4 text-yellow-500" />
                  <span class="text-sm text-gray-600">光照</span>
                </div>
                <div class="flex items-center space-x-2">
                  <div class="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      class="h-full bg-yellow-500 rounded-full transition-all"
                      :style="{ width: latestRecordsByLocation[location].lightLevel + '%' }"
                    />
                  </div>
                  <span class="text-sm font-medium text-gray-800">{{ latestRecordsByLocation[location].lightLevel }}%</span>
                </div>
              </div>
              
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <Droplets class="w-4 h-4 text-blue-500" />
                  <span class="text-sm text-gray-600">湿度</span>
                </div>
                <div class="flex items-center space-x-2">
                  <div class="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      class="h-full bg-blue-500 rounded-full transition-all"
                      :style="{ width: latestRecordsByLocation[location].humidity + '%' }"
                    />
                  </div>
                  <span class="text-sm font-medium text-gray-800">{{ latestRecordsByLocation[location].humidity }}%</span>
                </div>
              </div>
              
              <div v-if="latestRecordsByLocation[location].temperature" class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <Thermometer class="w-4 h-4 text-red-500" />
                  <span class="text-sm text-gray-600">温度</span>
                </div>
                <span class="text-sm font-medium text-gray-800">{{ latestRecordsByLocation[location].temperature }}°C</span>
              </div>
              
              <p class="text-xs text-gray-400 mt-2">记录于 {{ latestRecordsByLocation[location].date }}</p>
            </div>
            
            <div v-else class="text-center py-4">
              <p class="text-sm text-gray-400">暂无环境记录</p>
            </div>
            
            <div class="mt-4 pt-4 border-t border-gray-100">
              <p class="text-xs text-gray-500 mb-2">此处植物：</p>
              <div class="flex flex-wrap gap-1">
                <span 
                  v-for="plant in getPlantsAtLocation(location)" 
                  :key="plant.id"
                  class="px-2 py-0.5 bg-garden-50 text-garden-700 rounded text-xs"
                >
                  {{ plant.name }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-12">
          <MapPin class="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p class="text-gray-500">还没有位置信息</p>
          <p class="text-sm text-gray-400">添加植物时设置位置，即可追踪环境数据</p>
        </div>
      </div>
    </div>

    <!-- 历史记录 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100">
        <h3 class="font-semibold text-gray-800">历史记录</h3>
      </div>
      <div v-if="store.environmentRecords.length > 0" class="divide-y divide-gray-50">
        <div 
          v-for="record in store.environmentRecords.slice().reverse().slice(0, 10)" 
          :key="record.id"
          class="px-6 py-4 flex items-center justify-between"
        >
          <div class="flex items-center space-x-4">
            <div class="w-10 h-10 bg-garden-100 rounded-lg flex items-center justify-center">
              <MapPin class="w-5 h-5 text-garden-600" />
            </div>
            <div>
              <p class="font-medium text-gray-800">{{ record.location }}</p>
              <p class="text-sm text-gray-500">{{ record.date }}</p>
            </div>
          </div>
          <div class="flex items-center space-x-6 text-sm">
            <div class="flex items-center space-x-1">
              <Sun class="w-4 h-4 text-yellow-500" />
              <span class="text-gray-600">{{ record.lightLevel }}%</span>
            </div>
            <div class="flex items-center space-x-1">
              <Droplets class="w-4 h-4 text-blue-500" />
              <span class="text-gray-600">{{ record.humidity }}%</span>
            </div>
            <div v-if="record.temperature" class="flex items-center space-x-1">
              <Thermometer class="w-4 h-4 text-red-500" />
              <span class="text-gray-600">{{ record.temperature }}°C</span>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-12">
        <p class="text-gray-500">还没有环境记录</p>
      </div>
    </div>

    <!-- 添加环境记录弹窗 -->
    <div 
      v-if="showAddModal" 
      class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      @click.self="showAddModal = false"
    >
      <div class="bg-white rounded-xl p-6 w-full max-w-md">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold">记录环境数据</h3>
          <button 
            class="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            @click="showAddModal = false"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">位置</label>
            <input 
              v-model="form.location"
              type="text" 
              placeholder="如：客厅窗边"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-garden-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">日期</label>
            <input 
              v-model="form.date"
              type="date" 
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-garden-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">光照强度 ({{ form.lightLevel }}%)</label>
            <input 
              v-model.number="form.lightLevel"
              type="range" 
              min="0" 
              max="100" 
              class="w-full"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">空气湿度 ({{ form.humidity }}%)</label>
            <input 
              v-model.number="form.humidity"
              type="range" 
              min="0" 
              max="100" 
              class="w-full"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">温度 (°C)</label>
            <input 
              v-model.number="form.temperature"
              type="number" 
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-garden-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">备注</label>
            <textarea 
              v-model="form.notes"
              placeholder="记录其他环境信息..."
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
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
