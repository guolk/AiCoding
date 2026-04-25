<template>
  <div class="article-list">
    <div class="search-bar">
      <input
        v-model="keyword"
        type="text"
        placeholder="搜索文章..."
        class="search-input"
        @keyup.enter="search"
      />
      <button class="search-btn" @click="search">搜索</button>
      <router-link to="/editor" class="write-btn">写文章</router-link>
    </div>

    <div class="tag-filter" v-if="currentTag">
      <span class="current-tag">标签: {{ currentTag }}</span>
      <button class="clear-tag" @click="clearTag">清除</button>
    </div>

    <div class="articles" v-if="articles.length > 0">
      <div
        v-for="article in articles"
        :key="article.id"
        class="article-card"
        :class="{ pinned: article.is_pinned }"
      >
        <div class="article-content-wrapper">
          <router-link :to="`/article/${article.id}`" class="article-link">
            <div class="article-header">
              <h3 class="article-title">
                <span v-if="article.is_pinned" class="pinned-badge">置顶</span>
                {{ article.title }}
              </h3>
              <div class="article-meta">
                <span class="article-date">
                  {{ formatDate(article.created_at) }}
                </span>
              </div>
            </div>
            <p class="article-summary" v-if="article.summary">
              {{ article.summary }}
            </p>
            <div class="article-tags" v-if="article.tags.length > 0">
              <router-link
                v-for="tag in article.tags"
                :key="tag.id"
                :to="`/tag/${tag.name}`"
                class="tag"
                @click.stop
              >
                #{{ tag.name }}
              </router-link>
            </div>
          </router-link>
          <div class="article-actions">
            <router-link :to="`/editor/${article.id}`" class="action-btn edit">编辑</router-link>
            <button @click="deleteArticle(article)" class="action-btn delete">删除</button>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="!loading" class="no-articles">
      <p>暂无文章</p>
    </div>

    <div v-else class="loading">
      加载中...
    </div>

    <div class="pagination" v-if="totalPages > 1">
      <button :disabled="page <= 1" @click="changePage(page - 1)">
        上一页
      </button>
      <span>第 {{ page }} 页 / 共 {{ totalPages }} 页</span>
      <button :disabled="page >= totalPages" @click="changePage(page + 1)">
        下一页
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { articleApi } from '../api'

const route = useRoute()
const router = useRouter()

const articles = ref([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const keyword = ref('')
const currentTag = ref(null)
const loading = ref(false)

const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const fetchArticles = async () => {
  loading.value = true
  try {
    const params = {
      page: page.value,
      page_size: pageSize.value
    }
    if (currentTag.value) {
      params.tag = currentTag.value
    }
    if (keyword.value) {
      params.keyword = keyword.value
    }
    
    const response = await articleApi.getArticles(params)
    articles.value = response.data.items
    total.value = response.data.total
  } catch (error) {
    console.error('获取文章列表失败:', error)
  } finally {
    loading.value = false
  }
}

const search = () => {
  page.value = 1
  fetchArticles()
}

const clearTag = () => {
  currentTag.value = null
  router.push('/')
  fetchArticles()
}

const changePage = (newPage) => {
  page.value = newPage
  fetchArticles()
}

const deleteArticle = async (article) => {
  if (!confirm(`确定要删除文章 "${article.title}" 吗？`)) {
    return
  }
  
  try {
    await articleApi.deleteArticle(article.id)
    alert('删除成功')
    fetchArticles()
  } catch (error) {
    alert('删除失败')
  }
}

onMounted(() => {
  if (route.params.tagName) {
    currentTag.value = route.params.tagName
  }
  fetchArticles()
})

watch(() => route.params.tagName, (newTag) => {
  if (newTag) {
    currentTag.value = newTag
    page.value = 1
    fetchArticles()
  }
})
</script>

<style scoped>
.article-list {
  max-width: 800px;
  margin: 0 auto;
}

.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.3s;
}

.search-input:focus {
  border-color: #007bff;
}

.search-btn {
  padding: 12px 24px;
  background: #007bff;
  color: #fff;
  border-radius: 8px;
  font-size: 16px;
  transition: background 0.3s;
}

.search-btn:hover {
  background: #0056b3;
}

.write-btn {
  padding: 12px 24px;
  background: #28a745;
  color: #fff;
  border-radius: 8px;
  font-size: 16px;
  transition: background 0.3s;
}

.write-btn:hover {
  background: #218838;
}

.tag-filter {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding: 10px 16px;
  background: #e3f2fd;
  border-radius: 8px;
}

.current-tag {
  color: #1976d2;
  font-weight: 500;
}

.clear-tag {
  color: #666;
  text-decoration: underline;
  font-size: 14px;
}

.clear-tag:hover {
  color: #007bff;
}

.articles {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.article-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s, box-shadow 0.3s;
}

.article-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.article-card.pinned {
  border-left: 4px solid #ff6b6b;
}

.article-content-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.article-link {
  flex: 1;
  display: block;
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.article-title {
  font-size: 1.25rem;
  color: #333;
  margin-bottom: 0;
}

.pinned-badge {
  display: inline-block;
  padding: 2px 8px;
  background: #ff6b6b;
  color: #fff;
  font-size: 12px;
  border-radius: 4px;
  margin-right: 8px;
}

.article-meta {
  color: #999;
  font-size: 14px;
}

.article-summary {
  color: #666;
  margin-bottom: 16px;
  line-height: 1.6;
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

.article-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

.action-btn {
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s;
  text-align: center;
}

.action-btn.edit {
  background: #e3f2fd;
  color: #1976d2;
}

.action-btn.edit:hover {
  background: #1976d2;
  color: #fff;
}

.action-btn.delete {
  background: #ffebee;
  color: #d32f2f;
  border: none;
  cursor: pointer;
}

.action-btn.delete:hover {
  background: #d32f2f;
  color: #fff;
}

.no-articles {
  text-align: center;
  padding: 60px;
  color: #999;
}
</style>
