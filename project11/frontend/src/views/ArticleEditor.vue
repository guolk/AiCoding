<template>
  <div class="article-editor">
    <button class="back-btn" @click="$router.back()">返回</button>
    
    <h1 class="page-title">{{ isEdit ? '编辑文章' : '写文章' }}</h1>
    
    <form @submit.prevent="submitArticle" class="editor-form">
      <div class="form-group">
        <label>标题 *</label>
        <input
          v-model="form.title"
          type="text"
          placeholder="请输入文章标题"
          required
          class="form-input"
        />
      </div>
      
      <div class="form-group">
        <label>摘要</label>
        <input
          v-model="form.summary"
          type="text"
          placeholder="文章摘要（可选）"
          class="form-input"
        />
      </div>
      
      <div class="form-group">
        <label>标签（用空格分隔）</label>
        <input
          v-model="tagInput"
          type="text"
          placeholder="例如：Vue3 前端 JavaScript"
          class="form-input"
        />
        <div class="selected-tags" v-if="form.tags.length > 0">
          <span v-for="tag in form.tags" :key="tag" class="tag-item">
            {{ tag }}
            <button type="button" @click="removeTag(tag)" class="remove-tag">×</button>
          </span>
        </div>
      </div>
      
      <div class="form-group checkbox-group">
        <label>
          <input type="checkbox" v-model="form.is_pinned" />
          置顶文章
        </label>
      </div>
      
      <div class="form-group">
        <label>内容 *（支持Markdown）</label>
        <div class="editor-container">
          <div class="editor-tabs">
            <button
              type="button"
              :class="{ active: activeTab === 'edit' }"
              @click="activeTab = 'edit'"
            >编辑</button>
            <button
              type="button"
              :class="{ active: activeTab === 'preview' }"
              @click="activeTab = 'preview'"
            >预览</button>
          </div>
          
          <div v-if="activeTab === 'edit'" class="edit-panel">
            <textarea
              v-model="form.content"
              placeholder="在这里写文章，支持Markdown格式..."
              class="editor-textarea"
              required
            ></textarea>
          </div>
          
          <div v-else class="preview-panel">
            <div
              class="markdown-content"
              v-html="renderedContent"
            ></div>
            <div v-if="!form.content" class="preview-empty">
              内容为空，无法预览
            </div>
          </div>
        </div>
      </div>
      
      <div class="form-actions">
        <button type="button" @click="$router.back()" class="btn-cancel">取消</button>
        <button type="submit" :disabled="saving" class="btn-submit">
          {{ saving ? '保存中...' : (isEdit ? '更新' : '发布') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { articleApi } from '../api'
import { renderMarkdown } from '../utils/markdown'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)
const activeTab = ref('edit')
const saving = ref(false)
const tagInput = ref('')

const form = ref({
  title: '',
  summary: '',
  content: '',
  is_pinned: false,
  tags: []
})

const renderedContent = computed(() => {
  if (form.value.content) {
    return renderMarkdown(form.value.content)
  }
  return ''
})

watch(tagInput, (newVal, oldVal) => {
  if (newVal.includes(' ') || newVal.includes('，') || newVal.includes(',')) {
    const parts = newVal.split(/[\s，,]+/).filter(t => t.trim())
    for (const tag of parts) {
      const trimmedTag = tag.trim()
      if (trimmedTag && !form.value.tags.includes(trimmedTag)) {
        form.value.tags.push(trimmedTag)
      }
    }
    tagInput.value = ''
  }
})

const removeTag = (tag) => {
  const index = form.value.tags.indexOf(tag)
  if (index > -1) {
    form.value.tags.splice(index, 1)
  }
}

const fetchArticle = async () => {
  try {
    const response = await articleApi.getArticle(route.params.id)
    const article = response.data
    form.value.title = article.title
    form.value.summary = article.summary || ''
    form.value.content = article.content
    form.value.is_pinned = article.is_pinned
    form.value.tags = article.tags.map(t => t.name)
  } catch (error) {
    alert('获取文章失败')
    router.back()
  }
}

const submitArticle = async () => {
  if (!form.value.title.trim() || !form.value.content.trim()) {
    alert('标题和内容不能为空')
    return
  }
  
  saving.value = true
  
  try {
    const data = {
      title: form.value.title,
      summary: form.value.summary,
      content: form.value.content,
      is_pinned: form.value.is_pinned,
      tags: form.value.tags
    }
    
    if (isEdit.value) {
      await articleApi.updateArticle(route.params.id, data)
      alert('更新成功！')
    } else {
      await articleApi.createArticle(data)
      alert('发布成功！')
    }
    router.push('/')
  } catch (error) {
    alert(isEdit.value ? '更新失败' : '发布失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  if (isEdit.value) {
    fetchArticle()
  }
})
</script>

<style scoped>
.article-editor {
  max-width: 900px;
  margin: 0 auto;
}

.back-btn {
  margin-bottom: 20px;
  color: #007bff;
  font-size: 14px;
}

.back-btn:hover {
  text-decoration: underline;
}

.page-title {
  font-size: 1.75rem;
  color: #333;
  margin-bottom: 30px;
}

.editor-form {
  background: #fff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.3s;
}

.form-input:focus {
  border-color: #007bff;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: normal;
}

.checkbox-group input {
  width: auto;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 20px;
  font-size: 14px;
}

.remove-tag {
  width: 16px;
  height: 16px;
  line-height: 16px;
  text-align: center;
  background: rgba(25, 118, 210, 0.1);
  border-radius: 50%;
  font-size: 14px;
  color: #1976d2;
}

.remove-tag:hover {
  background: #1976d2;
  color: #fff;
}

.editor-container {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.editor-tabs {
  display: flex;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
}

.editor-tabs button {
  padding: 10px 24px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  transition: all 0.3s;
}

.editor-tabs button.active {
  background: #fff;
  color: #007bff;
  border-bottom: 2px solid #007bff;
}

.edit-panel {
  min-height: 400px;
}

.editor-textarea {
  width: 100%;
  min-height: 400px;
  padding: 16px;
  border: none;
  resize: vertical;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 14px;
  line-height: 1.6;
  outline: none;
}

.preview-panel {
  min-height: 400px;
  padding: 20px;
  background: #fafafa;
}

.preview-empty {
  color: #999;
  text-align: center;
  padding: 40px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.btn-cancel {
  padding: 10px 24px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
  color: #666;
  font-size: 14px;
  transition: all 0.3s;
}

.btn-cancel:hover {
  border-color: #999;
}

.btn-submit {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  background: #007bff;
  color: #fff;
  font-size: 14px;
  transition: all 0.3s;
}

.btn-submit:hover:not(:disabled) {
  background: #0056b3;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

:deep(.markdown-content code) {
  padding: 2px 6px;
  background: #f6f8fa;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.9em;
}

:deep(.markdown-content pre) {
  padding: 16px;
  background: #282c34 !important;
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: 16px;
}

:deep(.markdown-content pre code) {
  padding: 0;
  background: none;
  color: #abb2bf;
}
</style>
