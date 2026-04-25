<template>
  <div class="admin-page">
    <h1 class="page-title">管理后台</h1>
    
    <div class="admin-tabs">
      <button
        :class="{ active: activeTab === 'articles' }"
        @click="activeTab = 'articles'"
      >文章管理</button>
      <button
        :class="{ active: activeTab === 'tags' }"
        @click="activeTab = 'tags'"
      >标签管理</button>
    </div>
    
    <div v-if="activeTab === 'articles'" class="tab-content">
      <div class="action-bar">
        <router-link to="/editor" class="btn-add">+ 写新文章</router-link>
      </div>
      
      <div v-if="loading" class="loading">加载中...</div>
      
      <div v-else-if="articles.length === 0" class="empty">
        暂无文章
      </div>
      
      <div v-else class="article-list">
        <div v-for="article in articles" :key="article.id" class="article-item">
          <div class="article-info">
            <div class="article-title">
              <span v-if="article.is_pinned" class="pinned-badge">置顶</span>
              <router-link :to="`/article/${article.id}`">{{ article.title }}</router-link>
            </div>
            <div class="article-meta">
              <span class="date">{{ formatDate(article.created_at) }}</span>
              <div class="article-tags">
                <span v-for="tag in article.tags" :key="tag.id" class="tag">
                  #{{ tag.name }}
                </span>
              </div>
            </div>
          </div>
          <div class="article-actions">
            <router-link :to="`/editor/${article.id}`" class="btn-edit">编辑</router-link>
            <button @click="deleteArticle(article)" class="btn-delete">删除</button>
          </div>
        </div>
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
    
    <div v-else class="tab-content">
      <div class="action-bar">
        <div class="new-tag-form">
          <input
            v-model="newTagName"
            type="text"
            placeholder="输入新标签名称"
            @keyup.enter="createTag"
          />
          <button @click="createTag" :disabled="creatingTag">
            {{ creatingTag ? '创建中...' : '创建标签' }}
          </button>
        </div>
      </div>
      
      <div v-if="loadingTags" class="loading">加载中...</div>
      
      <div v-else-if="tags.length === 0" class="empty">
        暂无标签
      </div>
      
      <div v-else class="tags-grid">
        <div v-for="tag in tags" :key="tag.id" class="tag-card">
          <div class="tag-info">
            <span class="tag-name">#{{ tag.name }}</span>
            <span class="tag-count">{{ tag.article_count }} 篇文章</span>
          </div>
          <button
            @click="deleteTag(tag)"
            :disabled="tag.article_count > 0"
            class="btn-delete-tag"
            :title="tag.article_count > 0 ? '存在关联文章，无法删除' : '删除标签'"
          >删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { articleApi, tagApi, default as api } from '../api'

const router = useRouter()

const activeTab = ref('articles')
const loading = ref(false)
const loadingTags = ref(false)
const creatingTag = ref(false)
const articles = ref([])
const tags = ref([])
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const newTagName = ref('')

const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

const fetchArticles = async () => {
  loading.value = true
  try {
    const response = await articleApi.getArticles({
      page: page.value,
      page_size: pageSize.value
    })
    articles.value = response.data.items
    total.value = response.data.total
  } catch (error) {
    console.error('获取文章失败:', error)
  } finally {
    loading.value = false
  }
}

const fetchTags = async () => {
  loadingTags.value = true
  try {
    const response = await tagApi.getTags()
    tags.value = response.data
  } catch (error) {
    console.error('获取标签失败:', error)
  } finally {
    loadingTags.value = false
  }
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

const createTag = async () => {
  if (!newTagName.value.trim()) {
    alert('请输入标签名称')
    return
  }
  
  creatingTag.value = true
  try {
    await api.post('/tags/', { name: newTagName.value.trim() })
    alert('创建成功')
    newTagName.value = ''
    fetchTags()
  } catch (error) {
    alert(error.response?.data?.detail || '创建失败')
  } finally {
    creatingTag.value = false
  }
}

const deleteTag = async (tag) => {
  if (tag.article_count > 0) {
    alert('该标签存在关联文章，无法删除')
    return
  }
  
  if (!confirm(`确定要删除标签 "#${tag.name}" 吗？`)) {
    return
  }
  
  try {
    await api.delete(`/tags/${tag.id}`)
    alert('删除成功')
    fetchTags()
  } catch (error) {
    alert(error.response?.data?.detail || '删除失败')
  }
}

onMounted(() => {
  fetchArticles()
  fetchTags()
})
</script>

<style scoped>
.admin-page {
  max-width: 1000px;
  margin: 0 auto;
}

.page-title {
  font-size: 1.75rem;
  color: #333;
  margin-bottom: 20px;
}

.admin-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  border-bottom: 2px solid #eee;
}

.admin-tabs button {
  padding: 12px 24px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #666;
  position: relative;
  transition: color 0.3s;
}

.admin-tabs button.active {
  color: #007bff;
}

.admin-tabs button.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: #007bff;
}

.tab-content {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.btn-add {
  padding: 10px 20px;
  background: #007bff;
  color: #fff;
  border-radius: 8px;
  font-size: 14px;
  transition: background 0.3s;
}

.btn-add:hover {
  background: #0056b3;
}

.new-tag-form {
  display: flex;
  gap: 10px;
}

.new-tag-form input {
  padding: 10px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  min-width: 200px;
  transition: border-color 0.3s;
}

.new-tag-form input:focus {
  border-color: #007bff;
}

.new-tag-form button {
  padding: 10px 20px;
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s;
}

.new-tag-form button:hover:not(:disabled) {
  background: #0056b3;
}

.new-tag-form button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading, .empty {
  text-align: center;
  padding: 40px;
  color: #999;
}

.article-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.article-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 8px;
  transition: border-color 0.3s;
}

.article-item:hover {
  border-color: #007bff;
}

.article-info {
  flex: 1;
}

.article-title {
  font-size: 16px;
  margin-bottom: 8px;
}

.article-title a {
  color: #333;
  transition: color 0.3s;
}

.article-title a:hover {
  color: #007bff;
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
  display: flex;
  align-items: center;
  gap: 16px;
}

.date {
  color: #999;
  font-size: 14px;
}

.article-tags {
  display: flex;
  gap: 6px;
}

.article-tags .tag {
  padding: 2px 8px;
  background: #f0f0f0;
  color: #666;
  font-size: 12px;
  border-radius: 4px;
}

.article-actions {
  display: flex;
  gap: 10px;
}

.btn-edit {
  padding: 6px 16px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s;
}

.btn-edit:hover {
  background: #1976d2;
  color: #fff;
}

.btn-delete {
  padding: 6px 16px;
  background: #ffebee;
  color: #d32f2f;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-delete:hover {
  background: #d32f2f;
  color: #fff;
}

.tags-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}

.tag-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 8px;
  transition: border-color 0.3s;
}

.tag-card:hover {
  border-color: #007bff;
}

.tag-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tag-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.tag-count {
  font-size: 14px;
  color: #999;
}

.btn-delete-tag {
  padding: 6px 16px;
  background: #ffebee;
  color: #d32f2f;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-delete-tag:hover:not(:disabled) {
  background: #d32f2f;
  color: #fff;
}

.btn-delete-tag:disabled {
  background: #f5f5f5;
  color: #bbb;
  cursor: not-allowed;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.pagination button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  font-size: 14px;
  transition: all 0.3s;
  cursor: pointer;
}

.pagination button:hover:not(:disabled) {
  background: #007bff;
  color: #fff;
  border-color: #007bff;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination span {
  color: #666;
  font-size: 14px;
}
</style>
