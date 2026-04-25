<template>
  <div class="article-detail">
    <button class="back-btn" @click="$router.back()">返回</button>
    
    <div v-if="article" class="article-content">
      <header class="article-header">
        <h1 class="article-title">{{ article.title }}</h1>
        <div class="article-meta">
          <span class="article-date">
            创建于: {{ formatDate(article.created_at) }}
          </span>
          <span v-if="article.updated_at !== article.created_at" class="article-update">
            更新于: {{ formatDate(article.updated_at) }}
          </span>
          <span v-if="article.is_pinned" class="pinned-badge">置顶</span>
        </div>
        <div class="article-tags" v-if="article.tags.length > 0">
          <router-link
            v-for="tag in article.tags"
            :key="tag.id"
            :to="`/tag/${tag.name}`"
            class="tag"
          >
            #{{ tag.name }}
          </router-link>
        </div>
      </header>
      
      <div class="article-body">
        <div
          class="markdown-content"
          v-html="renderedContent"
        ></div>
      </div>
    </div>

    <div v-else-if="loading" class="loading">
      加载中...
    </div>

    <div v-else class="error">
      文章不存在或已被删除
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { articleApi } from '../api'
import { renderMarkdown } from '../utils/markdown'

const props = defineProps({
  id: {
    type: [String, Number],
    required: true
  }
})

const article = ref(null)
const loading = ref(true)

const renderedContent = computed(() => {
  if (article.value && article.value.content) {
    return renderMarkdown(article.value.content)
  }
  return ''
})

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const fetchArticle = async () => {
  loading.value = true
  try {
    const response = await articleApi.getArticle(props.id)
    article.value = response.data
  } catch (error) {
    console.error('获取文章详情失败:', error)
    article.value = null
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchArticle()
})
</script>

<style scoped>
.article-detail {
  max-width: 800px;
  margin: 0 auto;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #007bff;
  margin-bottom: 20px;
  font-size: 14px;
}

.back-btn:hover {
  text-decoration: underline;
}

.article-content {
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.article-header {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.article-title {
  font-size: 1.75rem;
  color: #333;
  margin-bottom: 16px;
  line-height: 1.4;
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  color: #999;
  font-size: 14px;
  margin-bottom: 16px;
}

.pinned-badge {
  padding: 2px 8px;
  background: #ff6b6b;
  color: #fff;
  border-radius: 4px;
}

.article-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  padding: 4px 12px;
  background: #f0f0f0;
  color: #666;
  font-size: 14px;
  border-radius: 4px;
  transition: all 0.3s;
}

.tag:hover {
  background: #007bff;
  color: #fff;
}

.article-body {
  color: #333;
  line-height: 1.8;
}

:deep(.markdown-content) {
  word-wrap: break-word;
}

:deep(.markdown-content h1),
:deep(.markdown-content h2),
:deep(.markdown-content h3),
:deep(.markdown-content h4),
:deep(.markdown-content h5),
:deep(.markdown-content h6) {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
}

:deep(.markdown-content h1) { font-size: 2em; }
:deep(.markdown-content h2) { font-size: 1.5em; }
:deep(.markdown-content h3) { font-size: 1.25em; }

:deep(.markdown-content p) {
  margin-bottom: 16px;
}

:deep(.markdown-content a) {
  color: #007bff;
  text-decoration: none;
}

:deep(.markdown-content a:hover) {
  text-decoration: underline;
}

:deep(.markdown-content code) {
  padding: 2px 6px;
  background: #f6f8fa;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.9em;
}

:deep(.markdown-content pre) {
  padding: 16px;
  background: #f6f8fa;
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: 16px;
}

:deep(.markdown-content pre code) {
  padding: 0;
  background: none;
}

:deep(.markdown-content blockquote) {
  margin: 0;
  padding: 0 1em;
  border-left: 4px solid #dfe2e5;
  color: #6a737d;
  margin-bottom: 16px;
}

:deep(.markdown-content ul),
:deep(.markdown-content ol) {
  padding-left: 2em;
  margin-bottom: 16px;
}

:deep(.markdown-content li) {
  margin-bottom: 4px;
}

:deep(.markdown-content table) {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
}

:deep(.markdown-content th),
:deep(.markdown-content td) {
  padding: 8px 12px;
  border: 1px solid #dfe2e5;
}

:deep(.markdown-content th) {
  background: #f6f8fa;
  font-weight: 600;
}

:deep(.markdown-content img) {
  max-width: 100%;
  border-radius: 8px;
}

:deep(.markdown-content hr) {
  margin: 24px 0;
  border: 0;
  border-top: 1px solid #dfe2e5;
}
</style>
