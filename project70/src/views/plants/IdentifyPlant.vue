<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Camera, Upload, Search, Check, Plus } from 'lucide-vue-next'
import { useGardenStore } from '@/stores/garden'
import type { PlantIdentification } from '@/types'

const store = useGardenStore()
const router = useRouter()

const photoUrl = ref('')
const isIdentifying = ref(false)
const identificationResult = ref<PlantIdentification | null>(null)

const identify = () => {
  if (!photoUrl.value) {
    alert('请输入照片链接')
    return
  }
  
  isIdentifying.value = true
  
  setTimeout(() => {
    identificationResult.value = store.identifyPlant(photoUrl.value)
    isIdentifying.value = false
  }, 1500)
}

const addToGarden = (suggestion: any) => {
  const newPlant = store.addPlant({
    name: suggestion.name,
    scientificName: suggestion.scientificName,
    family: suggestion.family,
    genus: suggestion.genus,
    purchaseDate: new Date().toISOString().split('T')[0],
    location: '未设置'
  })
  
  store.addPlantPhoto(newPlant.id, {
    url: photoUrl.value,
    date: new Date().toISOString().split('T')[0],
    notes: '识别照片',
    isHealthy: true
  })
  
  router.push(`/plants/${newPlant.id}`)
}
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <button 
      class="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
      @click="router.back()"
    >
      <ArrowLeft class="w-5 h-5" />
      <span>返回</span>
    </button>

    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-garden-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Camera class="w-8 h-8 text-garden-500" />
        </div>
        <h1 class="text-2xl font-bold text-gray-800 mb-2">植物识别</h1>
        <p class="text-gray-500">上传植物照片，AI 将为你识别植物种类</p>
      </div>

      <div v-if="!identificationResult" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">植物照片链接</label>
          <div class="flex space-x-3">
            <input 
              v-model="photoUrl"
              type="text" 
              placeholder="输入图片URL"
              class="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-garden-500 focus:border-transparent"
            />
            <button 
              class="px-6 py-3 bg-garden-500 text-white rounded-xl hover:bg-garden-600 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isIdentifying || !photoUrl"
              @click="identify"
            >
              <Search v-if="!isIdentifying" class="w-5 h-5" />
              <div v-else class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{{ isIdentifying ? '识别中...' : '开始识别' }}</span>
            </button>
          </div>
          <p class="text-xs text-gray-400 mt-2">提示：可以使用任意图片URL进行识别测试</p>
        </div>

        <div v-if="photoUrl" class="aspect-video bg-gray-100 rounded-xl overflow-hidden">
          <img :src="photoUrl" alt="预览" class="w-full h-full object-cover" />
        </div>
      </div>

      <div v-else class="space-y-6">
        <div class="aspect-video bg-gray-100 rounded-xl overflow-hidden mb-6">
          <img :src="identificationResult.photoUrl" alt="识别照片" class="w-full h-full object-cover" />
        </div>

        <h3 class="text-lg font-semibold text-gray-800">识别结果</h3>
        
        <div class="space-y-3">
          <div 
            v-for="(suggestion, index) in identificationResult.suggestions" 
            :key="index"
            class="p-4 border border-gray-200 rounded-xl hover:border-garden-300 transition-colors"
          >
            <div class="flex items-start justify-between">
              <div>
                <div class="flex items-center space-x-2 mb-1">
                  <span class="text-lg font-medium text-gray-800">{{ suggestion.name }}</span>
                  <span class="px-2 py-0.5 bg-garden-100 text-garden-700 rounded text-xs">
                    {{ (suggestion.probability * 100).toFixed(0) }}% 匹配
                  </span>
                </div>
                <p class="text-sm text-gray-500 italic mb-2">{{ suggestion.scientificName }}</p>
                <div v-if="suggestion.family" class="text-sm text-gray-500">
                  {{ suggestion.family }} · {{ suggestion.genus }}
                </div>
              </div>
              <button 
                class="px-4 py-2 bg-garden-500 text-white rounded-lg hover:bg-garden-600 transition-colors text-sm flex items-center space-x-1"
                @click="addToGarden(suggestion)"
              >
                <Plus class="w-4 h-4" />
                <span>添加到我的花园</span>
              </button>
            </div>
          </div>
        </div>

        <button 
          class="w-full py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
          @click="identificationResult = null; photoUrl = ''"
        >
          重新识别
        </button>
      </div>
    </div>

    <div class="bg-amber-50 border border-amber-200 rounded-xl p-4">
      <p class="text-sm text-amber-800">
        <strong>提示：</strong>植物识别功能基于 Plant.id API，实际使用时需要配置 API Key。当前为演示模式，返回模拟数据。
      </p>
    </div>
  </div>
</template>
