<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search, BookOpen, Droplets, Sun, TrendingUp, Bug, Calendar, ChevronRight, X, Leaf } from 'lucide-vue-next'
import { useGardenStore } from '@/stores/garden'
import type { KnowledgeEntry } from '@/types'

const store = useGardenStore()
const router = useRouter()

const searchQuery = ref('')
const selectedCategory = ref('全部')
const selectedEntry = ref<KnowledgeEntry | null>(null)

const categories = computed(() => {
  const cats = new Set<string>()
  store.knowledgeBase.forEach(k => cats.add(k.category))
  return ['全部', ...Array.from(cats)]
})

const filteredEntries = computed(() => {
  let entries = store.knowledgeBase
  
  if (selectedCategory.value !== '全部') {
    entries = entries.filter(k => k.category === selectedCategory.value)
  }
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    entries = entries.filter(k => 
      k.name.toLowerCase().includes(query) ||
      k.description?.toLowerCase().includes(query)
    )
  }
  
  return entries
})
</script>

<template>
  <div class="space-y-6">
    <!-- 顶部操作栏 -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h1 class="text-xl font-semibold text-gray-800">植物养护百科</h1>
      <router-link 
        to="/knowledge/calendar"
        class="flex items-center space-x-2 px-4 py-2.5 border border-garden-200 bg-garden-50 text-garden-600 rounded-xl hover:bg-garden-100 transition-colors"
      >
        <Calendar class="w-5 h-5" />
        <span>园艺日历</span>
      </router-link>
    </div>

    <!-- 搜索和筛选 -->
    <div class="flex flex-col sm:flex-row gap-4">
      <div class="relative flex-1 max-w-md">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="搜索植物名称..."
          class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-garden-500 focus:border-transparent"
        />
      </div>
      <div class="flex items-center space-x-2 overflow-x-auto scrollbar-hide">
        <button 
          v-for="cat in categories" 
          :key="cat"
          class="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors"
          :class="selectedCategory === cat ? 'bg-garden-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
          @click="selectedCategory = cat"
        >
          {{ cat }}
        </button>
      </div>
    </div>

    <!-- 知识列表 -->
    <div v-if="filteredEntries.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div 
        v-for="entry in filteredEntries" 
        :key="entry.id"
        class="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        @click="selectedEntry = entry"
      >
        <div class="aspect-video bg-gray-100 overflow-hidden">
          <img 
            v-if="entry.imageUrl"
            :src="entry.imageUrl" 
            :alt="entry.name"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <Leaf class="w-12 h-12 text-gray-300" />
          </div>
        </div>
        <div class="p-4">
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-semibold text-gray-800">{{ entry.name }}</h3>
            <span class="px-2 py-0.5 bg-garden-50 text-garden-700 rounded text-xs">{{ entry.category }}</span>
          </div>
          <p v-if="entry.scientificName" class="text-sm text-gray-400 italic mb-2">{{ entry.scientificName }}</p>
          <p v-if="entry.description" class="text-sm text-gray-600 line-clamp-2">{{ entry.description }}</p>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="bg-white rounded-xl p-12 text-center">
      <div class="w-20 h-20 bg-garden-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <BookOpen class="w-10 h-10 text-garden-500" />
      </div>
      <h3 class="text-lg font-medium text-gray-800 mb-2">没有找到相关植物</h3>
      <p class="text-gray-500">试试其他关键词或分类</p>
    </div>

    <!-- 详情弹窗 -->
    <div 
      v-if="selectedEntry" 
      class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      @click.self="selectedEntry = null"
    >
      <div class="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div class="relative aspect-video bg-gray-100">
          <img 
            v-if="selectedEntry.imageUrl"
            :src="selectedEntry.imageUrl" 
            :alt="selectedEntry.name"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <Leaf class="w-24 h-24 text-gray-300" />
          </div>
          <button 
            class="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
            @click="selectedEntry = null"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
        
        <div class="p-6 overflow-y-auto max-h-[50vh]">
          <div class="flex items-center justify-between mb-2">
            <h2 class="text-2xl font-bold text-gray-800">{{ selectedEntry.name }}</h2>
            <span class="px-3 py-1 bg-garden-50 text-garden-700 rounded-full text-sm">{{ selectedEntry.category }}</span>
          </div>
          <p v-if="selectedEntry.scientificName" class="text-gray-500 italic mb-4">{{ selectedEntry.scientificName }}</p>
          <p v-if="selectedEntry.description" class="text-gray-600 mb-6">{{ selectedEntry.description }}</p>
          
          <div class="space-y-4">
            <div class="flex items-start space-x-4 p-4 bg-blue-50 rounded-xl">
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Droplets class="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 class="font-medium text-blue-800 mb-1">浇水频率</h4>
                <p class="text-sm text-blue-700">{{ selectedEntry.wateringFrequency }}</p>
              </div>
            </div>
            
            <div class="flex items-start space-x-4 p-4 bg-yellow-50 rounded-xl">
              <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sun class="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h4 class="font-medium text-yellow-800 mb-1">光照需求</h4>
                <p class="text-sm text-yellow-700">{{ selectedEntry.lightRequirement }}</p>
              </div>
            </div>
            
            <div class="flex items-start space-x-4 p-4 bg-green-50 rounded-xl">
              <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp class="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 class="font-medium text-green-800 mb-1">施肥要求</h4>
                <p class="text-sm text-green-700">{{ selectedEntry.fertilizerRequirement }}</p>
              </div>
            </div>
            
            <div class="flex items-start space-x-4 p-4 bg-red-50 rounded-xl">
              <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Bug class="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h4 class="font-medium text-red-800 mb-1">病虫害防治</h4>
                <p class="text-sm text-red-700">{{ selectedEntry.pestControl }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
