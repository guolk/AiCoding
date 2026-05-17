<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Heart, MessageCircle, Share2, ArrowLeftRight, BookOpen, X, Send, Image as ImageIcon, Trash2 } from 'lucide-vue-next'
import { useGardenStore } from '@/stores/garden'

const store = useGardenStore()

const activeTab = ref<'experience' | 'exchange'>('experience')
const showAddModal = ref(false)
const showDetailModal = ref<string | null>(null)
const newComment = ref('')

const form = ref({
  type: 'experience' as 'experience' | 'exchange',
  title: '',
  content: '',
  author: '园艺爱好者',
  plantType: '',
  photos: [] as string[],
  havePlant: '',
  wantPlant: '',
  location: ''
})

const photosText = computed({
  get: () => form.value.photos.join('\n'),
  set: (val: string) => {
    form.value.photos = val.split('\n').filter(u => u.trim())
  }
})

const filteredPosts = computed(() => {
  return store.posts.filter(p => p.type === activeTab.value)
})

const selectedPost = computed(() => {
  return store.posts.find(p => p.id === showDetailModal.value)
})

const openAddModal = () => {
  form.value = {
    type: activeTab.value,
    title: '',
    content: '',
    author: '园艺爱好者',
    plantType: '',
    photos: [],
    havePlant: '',
    wantPlant: '',
    location: ''
  }
  showAddModal.value = true
}

const submitPost = () => {
  if (!form.value.title || !form.value.content) {
    alert('请填写标题和内容')
    return
  }
  
  if (form.value.type === 'exchange' && (!form.value.havePlant || !form.value.wantPlant)) {
    alert('请填写想要交换的植物信息')
    return
  }
  
  store.addPost({
    type: form.value.type,
    title: form.value.title,
    content: form.value.content,
    author: form.value.author,
    plantType: form.value.plantType || undefined,
    photos: form.value.photos,
    ...(form.value.type === 'exchange' ? {
      havePlant: form.value.havePlant,
      wantPlant: form.value.wantPlant,
      location: form.value.location
    } : {})
  } as any)
  
  showAddModal.value = false
}

const submitComment = () => {
  if (newComment.value && showDetailModal.value) {
    store.addComment(showDetailModal.value, newComment.value, '我')
    newComment.value = ''
  }
}

const deletePost = (postId: string) => {
  if (confirm('确定要删除这条帖子吗？')) {
    store.deletePost(postId)
    showDetailModal.value = null
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- 顶部操作栏 -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <h1 class="text-xl font-semibold text-gray-800">园艺社群</h1>
        <div class="flex bg-gray-100 rounded-lg p-1">
          <button 
            class="px-4 py-2 rounded-md text-sm font-medium transition-colors"
            :class="activeTab === 'experience' ? 'bg-white shadow text-garden-600' : 'text-gray-500 hover:text-gray-700'"
            @click="activeTab = 'experience'"
          >
            <div class="flex items-center space-x-2">
              <BookOpen class="w-4 h-4" />
              <span>经验分享</span>
            </div>
          </button>
          <button 
            class="px-4 py-2 rounded-md text-sm font-medium transition-colors"
            :class="activeTab === 'exchange' ? 'bg-white shadow text-garden-600' : 'text-gray-500 hover:text-gray-700'"
            @click="activeTab = 'exchange'"
          >
            <div class="flex items-center space-x-2">
              <ArrowLeftRight class="w-4 h-4" />
              <span>以盆换盆</span>
            </div>
          </button>
        </div>
      </div>
      <button 
        class="flex items-center space-x-2 px-4 py-2.5 bg-garden-500 text-white rounded-xl hover:bg-garden-600 transition-colors"
        @click="openAddModal"
      >
        <Plus class="w-5 h-5" />
        <span>发布{{ activeTab === 'experience' ? '经验' : '交换' }}</span>
      </button>
    </div>

    <!-- 帖子列表 -->
    <div v-if="filteredPosts.length > 0" class="space-y-4">
      <div 
        v-for="post in filteredPosts" 
        :key="post.id"
        class="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        @click="showDetailModal = post.id"
      >
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-garden-100 rounded-full flex items-center justify-center">
              <span class="text-sm font-medium text-garden-600">{{ post.author.charAt(0) }}</span>
            </div>
            <div>
              <p class="font-medium text-gray-800">{{ post.author }}</p>
              <p class="text-xs text-gray-400">{{ post.createdAt }}</p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <span 
              v-if="post.type === 'exchange'"
              class="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium"
            >
              以盆换盆
            </span>
            <button 
              class="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-500"
              @click.stop="deletePost(post.id)"
              title="删除帖子"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <h3 class="font-semibold text-gray-800 mb-2">{{ post.title }}</h3>
        <p class="text-sm text-gray-600 mb-4 line-clamp-2">{{ post.content }}</p>
        
        <div v-if="post.type === 'exchange'" class="mb-4 p-3 bg-blue-50 rounded-lg">
          <div class="flex items-center space-x-4 text-sm">
            <div class="flex items-center space-x-2">
              <span class="text-gray-500">有：</span>
              <span class="font-medium text-gray-800">{{ (post as any).havePlant }}</span>
            </div>
            <ArrowLeftRight class="w-4 h-4 text-gray-400" />
            <div class="flex items-center space-x-2">
              <span class="text-gray-500">换：</span>
              <span class="font-medium text-gray-800">{{ (post as any).wantPlant }}</span>
            </div>
          </div>
          <p v-if="(post as any).location" class="text-xs text-gray-500 mt-2">
            位置：{{ (post as any).location }}
          </p>
        </div>
        
        <div v-if="post.photos.length > 0" class="grid grid-cols-4 gap-2 mb-4">
          <img 
            v-for="(photo, index) in post.photos.slice(0, 4)" 
            :key="index"
            :src="photo" 
            alt="配图"
            class="aspect-square object-cover rounded-lg"
          />
        </div>
        
        <div class="flex items-center space-x-6 text-sm text-gray-500">
          <button 
            class="flex items-center space-x-1 hover:text-red-500 transition-colors"
            @click.stop="store.likePost(post.id)"
          >
            <Heart class="w-4 h-4" :class="{ 'text-red-500 fill-red-500': post.likes > 0 }" />
            <span>{{ post.likes }}</span>
          </button>
          <div class="flex items-center space-x-1">
            <MessageCircle class="w-4 h-4" />
            <span>{{ post.comments.length }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="bg-white rounded-xl p-12 text-center">
      <div class="w-20 h-20 bg-garden-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <BookOpen class="w-10 h-10 text-garden-500" />
      </div>
      <h3 class="text-lg font-medium text-gray-800 mb-2">
        还没有{{ activeTab === 'experience' ? '经验分享' : '以盆换盆' }}帖子
      </h3>
      <p class="text-gray-500 mb-6">
        成为第一个分享的人吧！
      </p>
      <button 
        class="inline-flex items-center space-x-2 px-6 py-3 bg-garden-500 text-white rounded-xl hover:bg-garden-600 transition-colors"
        @click="openAddModal"
      >
        <Plus class="w-5 h-5" />
        <span>发布{{ activeTab === 'experience' ? '经验' : '交换' }}</span>
      </button>
    </div>

    <!-- 发布弹窗 -->
    <div 
      v-if="showAddModal" 
      class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      @click.self="showAddModal = false"
    >
      <div class="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 class="text-lg font-semibold">发布{{ form.type === 'experience' ? '经验分享' : '以盆换盆' }}</h3>
          <button 
            class="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            @click="showAddModal = false"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
        
        <div class="p-6 overflow-y-auto max-h-[60vh] space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">标题 *</label>
            <input 
              v-model="form.title"
              type="text" 
              :placeholder="form.type === 'experience' ? '分享你的养护经验...' : '我想交换植物...'"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-garden-500 focus:border-transparent"
            />
          </div>
          
          <div v-if="form.type === 'exchange'" class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">我有 *</label>
              <input 
                v-model="form.havePlant"
                type="text" 
                placeholder="如：姬胧月"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-garden-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">想换 *</label>
              <input 
                v-model="form.wantPlant"
                type="text" 
                placeholder="如：玉露"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-garden-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div v-if="form.type === 'exchange'">
            <label class="block text-sm font-medium text-gray-700 mb-2">所在城市</label>
            <input 
              v-model="form.location"
              type="text" 
              placeholder="如：北京市"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-garden-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">植物类型</label>
            <input 
              v-model="form.plantType"
              type="text" 
              placeholder="如：多肉、绿萝"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-garden-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">内容 *</label>
            <textarea 
              v-model="form.content"
              :placeholder="form.type === 'experience' ? '详细描述你的养护经验...' : '描述植物状态和交换要求...'"
              rows="4"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-garden-500 focus:border-transparent resize-none"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">配图链接（每行一个）</label>
            <textarea 
              v-model="photosText"
              placeholder="https://example.com/photo1.jpg"
              rows="3"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-garden-500 focus:border-transparent resize-none"
            />
          </div>
        </div>
        
        <div class="flex space-x-3 px-6 py-4 border-t border-gray-100">
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
            @click="submitPost"
          >
            发布
          </button>
        </div>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <div 
      v-if="showDetailModal && selectedPost" 
      class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      @click.self="showDetailModal = null"
    >
      <div class="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-garden-100 rounded-full flex items-center justify-center">
              <span class="text-sm font-medium text-garden-600">{{ selectedPost.author.charAt(0) }}</span>
            </div>
            <div>
              <p class="font-medium text-gray-800">{{ selectedPost.author }}</p>
              <p class="text-xs text-gray-400">{{ selectedPost.createdAt }}</p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <button 
              class="p-2 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-500"
              @click.stop="deletePost(selectedPost.id)"
              title="删除帖子"
            >
              <Trash2 class="w-4 h-4" />
            </button>
            <button 
              class="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              @click="showDetailModal = null"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div class="flex-1 overflow-y-auto p-6">
          <h2 class="text-xl font-bold text-gray-800 mb-3">{{ selectedPost.title }}</h2>
          
          <div v-if="selectedPost.type === 'exchange'" class="mb-4 p-4 bg-blue-50 rounded-xl">
            <div class="flex items-center space-x-4">
              <div class="flex-1 text-center">
                <p class="text-xs text-gray-500 mb-1">我有</p>
                <p class="font-semibold text-gray-800">{{ (selectedPost as any).havePlant }}</p>
              </div>
              <ArrowLeftRight class="w-6 h-6 text-gray-400" />
              <div class="flex-1 text-center">
                <p class="text-xs text-gray-500 mb-1">想换</p>
                <p class="font-semibold text-gray-800">{{ (selectedPost as any).wantPlant }}</p>
              </div>
            </div>
            <p v-if="(selectedPost as any).location" class="text-center text-sm text-gray-500 mt-2">
              位置：{{ (selectedPost as any).location }}
            </p>
          </div>
          
          <p class="text-gray-600 whitespace-pre-wrap mb-4">{{ selectedPost.content }}</p>
          
          <div v-if="selectedPost.photos.length > 0" class="grid grid-cols-2 gap-3 mb-4">
            <img 
              v-for="(photo, index) in selectedPost.photos" 
              :key="index"
              :src="photo" 
              alt="配图"
              class="aspect-square object-cover rounded-xl"
            />
          </div>
          
          <div class="flex items-center space-x-6 py-4 border-t border-b border-gray-100 mb-4">
            <button 
              class="flex items-center space-x-2 text-sm text-gray-500 hover:text-red-500 transition-colors"
              @click="store.likePost(selectedPost.id)"
            >
              <Heart class="w-5 h-5" :class="{ 'text-red-500 fill-red-500': selectedPost.likes > 0 }" />
              <span>{{ selectedPost.likes }} 赞</span>
            </button>
            <div class="flex items-center space-x-2 text-sm text-gray-500">
              <MessageCircle class="w-5 h-5" />
              <span>{{ selectedPost.comments.length }} 评论</span>
            </div>
          </div>
          
          <!-- 评论区 -->
          <div class="space-y-4">
            <h4 class="font-medium text-gray-800">评论</h4>
            <div v-if="selectedPost.comments.length > 0" class="space-y-3">
              <div 
                v-for="comment in selectedPost.comments" 
                :key="comment.id"
                class="p-3 bg-gray-50 rounded-lg"
              >
                <div class="flex items-center justify-between mb-1">
                  <span class="font-medium text-gray-800 text-sm">{{ comment.author }}</span>
                  <span class="text-xs text-gray-400">{{ comment.createdAt }}</span>
                </div>
                <p class="text-sm text-gray-600">{{ comment.content }}</p>
              </div>
            </div>
            <div v-else class="text-center py-4 text-gray-400 text-sm">
              暂无评论，来说两句吧
            </div>
          </div>
        </div>
        
        <div class="px-6 py-4 border-t border-gray-100">
          <div class="flex space-x-3">
            <input 
              v-model="newComment"
              type="text" 
              placeholder="发表评论..."
              class="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-garden-500 focus:border-transparent"
              @keyup.enter="submitComment"
            />
            <button 
              class="px-4 py-2.5 bg-garden-500 text-white rounded-xl hover:bg-garden-600 transition-colors"
              @click="submitComment"
            >
              <Send class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
