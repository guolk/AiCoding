<template>
  <div class="rich-text-editor" :class="{ 'is-focused': isFocused, 'is-disabled': disabled }">
    <div class="toolbar" v-if="showToolbar && !disabled">
      <div class="toolbar-group">
        <button 
          type="button"
          class="toolbar-btn" 
          :class="{ 'is-active': isBold }"
          @click="execCommand('bold')"
          :title="$t ? $t('bold') : '粗体 (Ctrl+B)'"
        >
          <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/></svg>
        </button>
        <button 
          type="button"
          class="toolbar-btn" 
          :class="{ 'is-active': isItalic }"
          @click="execCommand('italic')"
          :title="$t ? $t('italic') : '斜体 (Ctrl+I)'"
        >
          <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"/></svg>
        </button>
        <button 
          type="button"
          class="toolbar-btn" 
          :class="{ 'is-active': isUnderline }"
          @click="execCommand('underline')"
          :title="$t ? $t('underline') : '下划线 (Ctrl+U)'"
        >
          <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/></svg>
        </button>
        <button 
          type="button"
          class="toolbar-btn" 
          :class="{ 'is-active': isStrikeThrough }"
          @click="execCommand('strikeThrough')"
          :title="$t ? $t('strikethrough') : '删除线'"
        >
          <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z"/></svg>
        </button>
      </div>
      
      <div class="toolbar-divider"></div>
      
      <div class="toolbar-group">
        <button 
          type="button"
          class="toolbar-btn" 
          @click="execCommand('justifyLeft')"
          :title="$t ? $t('alignLeft') : '左对齐'"
        >
          <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z"/></svg>
        </button>
        <button 
          type="button"
          class="toolbar-btn" 
          @click="execCommand('justifyCenter')"
          :title="$t ? $t('alignCenter') : '居中'"
        >
          <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z"/></svg>
        </button>
        <button 
          type="button"
          class="toolbar-btn" 
          @click="execCommand('justifyRight')"
          :title="$t ? $t('alignRight') : '右对齐'"
        >
          <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z"/></svg>
        </button>
      </div>
      
      <div class="toolbar-divider"></div>
      
      <div class="toolbar-group">
        <button 
          type="button"
          class="toolbar-btn" 
          @click="execCommand('insertUnorderedList')"
          :title="$t ? $t('bulletList') : '无序列表'"
        >
          <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/></svg>
        </button>
        <button 
          type="button"
          class="toolbar-btn" 
          @click="execCommand('insertOrderedList')"
          :title="$t ? $t('numberList') : '有序列表'"
        >
          <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/></svg>
        </button>
      </div>
      
      <div class="toolbar-divider"></div>
      
      <div class="toolbar-group">
        <button 
          type="button"
          class="toolbar-btn" 
          @click="insertLink"
          :title="$t ? $t('insertLink') : '插入链接'"
        >
          <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>
        </button>
        <button 
          type="button"
          class="toolbar-btn" 
          @click="insertImage"
          :title="$t ? $t('insertImage') : '插入图片'"
        >
          <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
        </button>
        <button 
          type="button"
          class="toolbar-btn" 
          @click="execCommand('removeFormat')"
          :title="$t ? $t('clearFormat') : '清除格式'"
        >
          <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M3.27 5L2 6.27l6.97 6.97L6.5 19h3l1.57-3.66L16.73 21 18 19.73 3.27 5zM6 5v.18L8.82 8h2.4l-.72 1.68 2.1 2.1L14.21 8H20V5H6z"/></svg>
        </button>
      </div>
      
      <div class="toolbar-divider"></div>
      
      <div class="toolbar-group">
        <button 
          type="button"
          class="toolbar-btn" 
          @click="execCommand('undo')"
          :title="$t ? $t('undo') : '撤销 (Ctrl+Z)'"
        >
          <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/></svg>
        </button>
        <button 
          type="button"
          class="toolbar-btn" 
          @click="execCommand('redo')"
          :title="$t ? $t('redo') : '重做 (Ctrl+Y)'"
        >
          <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/></svg>
        </button>
      </div>
    </div>
    
    <div class="editor-wrapper">
      <div
        ref="editorRef"
        class="editor-content"
        :class="{ 'is-composing': isComposing }"
        contenteditable="true"
        :placeholder="placeholder"
        :spellcheck="spellcheck"
        :disabled="disabled"
        @compositionstart="onCompositionStart"
        @compositionupdate="onCompositionUpdate"
        @compositionend="onCompositionEnd"
        @input="onInput"
        @paste="onPaste"
        @keydown="onKeydown"
        @keyup="onKeyup"
        @focus="onFocus"
        @blur="onBlur"
        @click="onClick"
      ></div>
      
      <div class="composition-indicator" v-if="isComposing">
        <span class="indicator-icon">⌨</span>
        <span class="indicator-text">{{ $t ? $t('composing') : '输入法输入中...' }}</span>
      </div>
    </div>
    
    <div class="editor-footer" v-if="showWordCount || showComposingHint">
      <div class="word-count" v-if="showWordCount">
        <span class="count-label">{{ $t ? $t('wordCount') : '字数' }}:</span>
        <span class="count-value">{{ wordCount }}</span>
        <span v-if="maxLength !== Infinity" class="count-max">/ {{ maxLength }}</span>
      </div>
      <div class="status-info">
        <span class="composing-hint" v-if="showComposingHint && isComposing">
          {{ $t ? $t('composingHint') : '拼音输入中，请选择汉字' }}
        </span>
        <span class="sync-status" v-if="syncStatus !== 'idle'">
          <span v-if="syncStatus === 'saving'">{{ $t ? $t('saving') : '保存中...' }}</span>
          <span v-if="syncStatus === 'saved'">{{ $t ? $t('saved') : '已保存' }}</span>
          <span v-if="syncStatus === 'error'">{{ $t ? $t('saveError') : '保存失败' }}</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick, shallowRef } from 'vue'

// ============ 类型定义 ============
interface EditorProps {
  modelValue?: string
  placeholder?: string
  showToolbar?: boolean
  showWordCount?: boolean
  showComposingHint?: boolean
  maxLength?: number
  disabled?: boolean
  spellcheck?: boolean
  debounceTime?: number
  allowedTags?: string[]
  allowedAttributes?: Record<string, string[]>
}

interface LinkDialogData {
  url: string
  text: string
  openInNewTab: boolean
}

// ============ Props & Emits ============
const props = withDefaults(defineProps<EditorProps>(), {
  modelValue: '',
  placeholder: '',
  showToolbar: true,
  showWordCount: true,
  showComposingHint: true,
  maxLength: Infinity,
  disabled: false,
  spellcheck: true,
  debounceTime: 100,
  allowedTags: () => [
    'a', 'b', 'strong', 'i', 'em', 'u', 's', 'strike',
    'p', 'br', 'div', 'span',
    'ul', 'ol', 'li',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'blockquote', 'pre', 'code',
    'img', 'hr',
    'table', 'thead', 'tbody', 'tr', 'th', 'td'
  ],
  allowedAttributes: () => ({
    a: ['href', 'target', 'title', 'class'],
    img: ['src', 'alt', 'title', 'width', 'height', 'class'],
    '*': ['style', 'class']
  })
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
  (e: 'input', event: Event): void
  (e: 'focus'): void
  (e: 'blur'): void
  (e: 'compositionStart', event: CompositionEvent): void
  (e: 'compositionUpdate', event: CompositionEvent): void
  (e: 'compositionEnd', event: CompositionEvent): void
  (e: 'paste', event: ClipboardEvent): void
  (e: 'error', error: Error): void
}>()

// ============ 响应式状态 ============
const editorRef = ref<HTMLElement | null>(null)
const isComposing = ref(false)
const isFocused = ref(false)
const syncStatus = ref<'idle' | 'saving' | 'saved' | 'error'>('idle')

const isBold = ref(false)
const isItalic = ref(false)
const isUnderline = ref(false)
const isStrikeThrough = ref(false)

const savedSelection = shallowRef<Range | null>(null)
const debounceTimer = ref<number | null>(null)
const lastProcessedContent = ref<string>('')

// ============ 计算属性 ============
const wordCount = computed(() => {
  if (!editorRef.value) return 0
  const text = editorRef.value.innerText || ''
  return text.replace(/\s/g, '').length
})

const isOverMaxLength = computed(() => {
  return props.maxLength !== Infinity && wordCount.value > props.maxLength
})

// ============ 核心方法 ============

const saveSelection = () => {
  const selection = window.getSelection()
  if (selection && selection.rangeCount > 0) {
    savedSelection.value = selection.getRangeAt(0).cloneRange()
  }
}

const restoreSelection = () => {
  if (savedSelection.value && editorRef.value) {
    const selection = window.getSelection()
    selection?.removeAllRanges()
    try {
      selection?.addRange(savedSelection.value)
    } catch (e) {
      console.warn('Failed to restore selection:', e)
    }
  }
}

const execCommand = (command: string, value?: string) => {
  if (!editorRef.value || props.disabled) return
  
  editorRef.value.focus()
  document.execCommand(command, false, value)
  editorRef.value.focus()
  
  updateToolbarState()
  processContent()
}

const insertLink = () => {
  if (!editorRef.value || props.disabled) return
  
  const selection = window.getSelection()
  const selectedText = selection?.toString() || ''
  
  const url = prompt('请输入链接地址:', selectedText.startsWith('http') ? selectedText : 'https://')
  if (!url) return
  
  const linkText = prompt('请输入链接文字:', selectedText || url)
  if (linkText === null) return
  
  const openInNewTab = confirm('是否在新标签页打开链接？')
  
  saveSelection()
  
  if (selectedText) {
    execCommand('createLink', url)
  } else {
    const linkHtml = `<a href="${url}" target="${openInNewTab ? '_blank' : '_self'}">${linkText}</a>`
    execCommand('insertHTML', linkHtml)
  }
  
  const links = editorRef.value.querySelectorAll('a')
  links.forEach(link => {
    if (link.href === url || link.textContent === linkText) {
      if (openInNewTab) {
        link.target = '_blank'
        link.rel = 'noopener noreferrer'
      }
    }
  })
  
  processContent()
}

const insertImage = () => {
  if (!editorRef.value || props.disabled) return
  
  const url = prompt('请输入图片地址:', 'https://')
  if (!url) return
  
  const alt = prompt('请输入图片描述（alt）:', '')
  if (alt === null) return
  
  const imgHtml = `<img src="${url}" alt="${alt}" style="max-width: 100%;" />`
  execCommand('insertHTML', imgHtml)
  
  processContent()
}

const updateToolbarState = () => {
  if (!document.queryCommandEnabled('bold')) return
  
  isBold.value = document.queryCommandState('bold')
  isItalic.value = document.queryCommandState('italic')
  isUnderline.value = document.queryCommandState('underline')
  isStrikeThrough.value = document.queryCommandState('strikeThrough')
}

const cleanHtml = (html: string): string => {
  if (!html) return ''
  
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html
  
  const sanitizeNode = (node: Node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement
      const tagName = element.tagName.toLowerCase()
      
      if (!props.allowedTags.includes(tagName)) {
        const textContent = document.createTextNode(element.textContent || '')
        element.parentNode?.replaceChild(textContent, element)
        return
      }
      
      const allowedAttrs = [
        ...(props.allowedAttributes[tagName] || []),
        ...(props.allowedAttributes['*'] || [])
      ]
      
      Array.from(element.attributes).forEach(attr => {
        if (!allowedAttrs.includes(attr.name)) {
          element.removeAttribute(attr.name)
        }
        
        if (attr.name === 'href' || attr.name === 'src') {
          const value = attr.value.toLowerCase()
          if (value.startsWith('javascript:') || value.startsWith('data:')) {
            element.removeAttribute(attr.name)
          }
        }
      })
      
      Array.from(element.childNodes).forEach(sanitizeNode)
    }
  }
  
  Array.from(tempDiv.childNodes).forEach(sanitizeNode)
  
  return tempDiv.innerHTML
}

const processContent = (immediate = false) => {
  if (!editorRef.value) return
  
  if (debounceTimer.value) {
    window.clearTimeout(debounceTimer.value)
    debounceTimer.value = null
  }
  
  const doProcess = () => {
    const rawContent = editorRef.value!.innerHTML
    const plainText = editorRef.value!.innerText || ''
    
    if (props.maxLength !== Infinity && plainText.length > props.maxLength) {
      truncateContent(props.maxLength)
      return
    }
    
    const cleanedContent = cleanHtml(rawContent)
    
    if (cleanedContent !== lastProcessedContent.value) {
      lastProcessedContent.value = cleanedContent
      
      emit('update:modelValue', cleanedContent)
      emit('change', cleanedContent)
      
      syncStatus.value = 'saving'
      setTimeout(() => {
        syncStatus.value = 'saved'
        setTimeout(() => {
          syncStatus.value = 'idle'
        }, 2000)
      }, 500)
    }
    
    updateToolbarState()
  }
  
  if (immediate || props.debounceTime === 0) {
    doProcess()
  } else {
    debounceTimer.value = window.setTimeout(doProcess, props.debounceTime)
  }
}

const truncateContent = (maxLength: number) => {
  if (!editorRef.value) return
  
  const text = editorRef.value.innerText || ''
  if (text.length <= maxLength) return
  
  saveSelection()
  
  const truncatedText = text.substring(0, maxLength)
  editorRef.value.innerText = truncatedText
  
  restoreSelection()
  
  processContent(true)
}

// ============ 事件处理 ============

const onCompositionStart = (event: CompositionEvent) => {
  console.log('[Editor] compositionstart:', event.data)
  isComposing.value = true
  emit('compositionStart', event)
}

const onCompositionUpdate = (event: CompositionEvent) => {
  console.log('[Editor] compositionupdate:', event.data)
  emit('compositionUpdate', event)
}

const onCompositionEnd = (event: CompositionEvent) => {
  console.log('[Editor] compositionend:', event.data)
  isComposing.value = false
  emit('compositionEnd', event)
  
  nextTick(() => {
    processContent(true)
  })
}

const onInput = (event: Event) => {
  console.log('[Editor] input - isComposing:', isComposing.value)
  emit('input', event)
  
  if (isComposing.value) {
    console.log('[Editor] Skipping processContent during composition')
    return
  }
  
  processContent()
}

const onPaste = (event: ClipboardEvent) => {
  console.log('[Editor] paste')
  emit('paste', event)
  
  if (props.disabled) {
    event.preventDefault()
    return
  }
  
  saveSelection()
  
  nextTick(() => {
    const images = editorRef.value?.querySelectorAll('img') || []
    images.forEach(img => {
      if (!img.style.maxWidth) {
        img.style.maxWidth = '100%'
      }
    })
    
    processContent(true)
  })
}

const onKeydown = (event: KeyboardEvent) => {
  if (props.disabled) {
    event.preventDefault()
    return
  }
  
  if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
    event.preventDefault()
    execCommand('bold')
    return
  }
  
  if ((event.ctrlKey || event.metaKey) && event.key === 'i') {
    event.preventDefault()
    execCommand('italic')
    return
  }
  
  if ((event.ctrlKey || event.metaKey) && event.key === 'u') {
    event.preventDefault()
    execCommand('underline')
    return
  }
  
  if (props.maxLength !== Infinity) {
    const selection = window.getSelection()
    const selectedText = selection?.toString() || ''
    const currentLength = wordCount.value - selectedText.length
    
    if (!event.ctrlKey && !event.metaKey && 
        event.key.length === 1 && 
        currentLength >= props.maxLength) {
      event.preventDefault()
    }
  }
}

const onKeyup = () => {
  updateToolbarState()
}

const onFocus = () => {
  isFocused.value = true
  emit('focus')
}

const onBlur = () => {
  isFocused.value = false
  emit('blur')
  
  processContent(true)
}

const onClick = () => {
  updateToolbarState()
}

// ============ 监听器 ============

watch(
  () => props.modelValue,
  (newValue) => {
    if (editorRef.value && !isFocused.value) {
      const currentContent = editorRef.value.innerHTML
      const cleanedNewValue = cleanHtml(newValue || '')
      
      if (currentContent !== cleanedNewValue && cleanedNewValue !== lastProcessedContent.value) {
        saveSelection()
        editorRef.value.innerHTML = cleanedNewValue
        lastProcessedContent.value = cleanedNewValue
        restoreSelection()
      }
    }
  },
  { immediate: true }
)

watch(
  () => props.disabled,
  (disabled) => {
    if (editorRef.value) {
      editorRef.value.contentEditable = disabled ? 'false' : 'true'
    }
  }
)

// ============ 生命周期 ============

onMounted(() => {
  if (editorRef.value) {
    if (props.modelValue) {
      editorRef.value.innerHTML = cleanHtml(props.modelValue)
      lastProcessedContent.value = editorRef.value.innerHTML
    }
    
    if (props.disabled) {
      editorRef.value.contentEditable = 'false'
    }
  }
  
  document.addEventListener('selectionchange', updateToolbarState)
})

onUnmounted(() => {
  if (debounceTimer.value) {
    window.clearTimeout(debounceTimer.value)
  }
  
  document.removeEventListener('selectionchange', updateToolbarState)
})

// ============ 暴露方法 ============

defineExpose({
  focus: () => {
    editorRef.value?.focus()
  },
  blur: () => {
    editorRef.value?.blur()
  },
  clear: () => {
    if (editorRef.value) {
      editorRef.value.innerHTML = ''
      lastProcessedContent.value = ''
      processContent(true)
    }
  },
  getHtml: () => {
    return editorRef.value?.innerHTML || ''
  },
  getText: () => {
    return editorRef.value?.innerText || ''
  },
  setHtml: (html: string) => {
    if (editorRef.value) {
      editorRef.value.innerHTML = cleanHtml(html)
      lastProcessedContent.value = editorRef.value.innerHTML
      processContent(true)
    }
  },
  insertText: (text: string) => {
    execCommand('insertText', text)
  },
  insertHtml: (html: string) => {
    execCommand('insertHTML', cleanHtml(html))
  },
  execCommand: execCommand,
  processContent: () => processContent(true)
})
</script>

<style scoped>
.rich-text-editor {
  display: flex;
  flex-direction: column;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: #303133;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.rich-text-editor:hover:not(.is-disabled) {
  border-color: #c0c4cc;
}

.rich-text-editor.is-focused:not(.is-disabled) {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.rich-text-editor.is-disabled {
  background-color: #f5f7fa;
  cursor: not-allowed;
}

/* ============ 工具栏 ============ */
.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 2px;
  padding: 8px 12px;
  border-bottom: 1px solid #ebeef5;
  background-color: #fafafa;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 2px;
}

.toolbar-divider {
  width: 1px;
  height: 20px;
  margin: 0 8px;
  background-color: #dcdfe6;
}

.toolbar-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 4px 6px;
  border: 1px solid transparent;
  border-radius: 4px;
  background-color: transparent;
  color: #606266;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.toolbar-btn:hover:not(:disabled) {
  background-color: #ecf5ff;
  color: #409eff;
}

.toolbar-btn.is-active {
  background-color: #ecf5ff;
  color: #409eff;
  border-color: #409eff;
}

.toolbar-btn:disabled {
  color: #c0c4cc;
  cursor: not-allowed;
}

/* ============ 编辑区域 ============ */
.editor-wrapper {
  position: relative;
  flex: 1;
  min-height: 200px;
}

.editor-content {
  min-height: 200px;
  padding: 12px 16px;
  outline: none;
  word-wrap: break-word;
  word-break: break-word;
  white-space: pre-wrap;
}

.editor-content:empty:before {
  content: attr(placeholder);
  color: #909399;
  pointer-events: none;
}

.editor-content.is-composing {
  caret-color: #409eff;
}

.editor-content:focus {
  outline: none;
}

.editor-content :deep(p) {
  margin: 0 0 8px 0;
}

.editor-content :deep(p:last-child) {
  margin-bottom: 0;
}

.editor-content :deep(ul),
.editor-content :deep(ol) {
  margin: 8px 0;
  padding-left: 24px;
}

.editor-content :deep(li) {
  margin: 4px 0;
}

.editor-content :deep(blockquote) {
  margin: 8px 0;
  padding: 8px 16px;
  border-left: 4px solid #409eff;
  background-color: #f5f7fa;
  color: #606266;
}

.editor-content :deep(pre) {
  margin: 8px 0;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
  overflow-x: auto;
}

.editor-content :deep(code) {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', Consolas, monospace;
  font-size: 13px;
  background-color: #f5f7fa;
  padding: 2px 4px;
  border-radius: 3px;
}

.editor-content :deep(pre code) {
  background-color: transparent;
  padding: 0;
}

.editor-content :deep(a) {
  color: #409eff;
  text-decoration: none;
}

.editor-content :deep(a:hover) {
  text-decoration: underline;
}

.editor-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}

.editor-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 8px 0;
}

.editor-content :deep(th),
.editor-content :deep(td) {
  border: 1px solid #dcdfe6;
  padding: 8px 12px;
  text-align: left;
}

.editor-content :deep(th) {
  background-color: #f5f7fa;
  font-weight: 600;
}

.editor-content :deep(hr) {
  border: none;
  border-top: 1px solid #dcdfe6;
  margin: 16px 0;
}

.editor-content :deep(h1),
.editor-content :deep(h2),
.editor-content :deep(h3),
.editor-content :deep(h4),
.editor-content :deep(h5),
.editor-content :deep(h6) {
  margin: 16px 0 8px 0;
  font-weight: 600;
  line-height: 1.4;
}

.editor-content :deep(h1) { font-size: 2em; }
.editor-content :deep(h2) { font-size: 1.5em; }
.editor-content :deep(h3) { font-size: 1.25em; }
.editor-content :deep(h4) { font-size: 1.1em; }
.editor-content :deep(h5) { font-size: 1em; }
.editor-content :deep(h6) { font-size: 0.9em; color: #606266; }

/* ============ 组合输入指示器 ============ */
.composition-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background-color: #ecf5ff;
  border-radius: 4px;
  font-size: 12px;
  color: #409eff;
  pointer-events: none;
  animation: pulse 1.5s ease-in-out infinite;
}

.indicator-icon {
  font-size: 14px;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

/* ============ 底部状态栏 ============ */
.editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  border-top: 1px solid #ebeef5;
  background-color: #fafafa;
  font-size: 12px;
  color: #909399;
}

.word-count {
  display: flex;
  align-items: center;
  gap: 4px;
}

.count-value {
  color: #409eff;
  font-weight: 500;
}

.count-max {
  color: #c0c4cc;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.composing-hint {
  color: #409eff;
  font-style: italic;
}

.sync-status {
  display: flex;
  align-items: center;
  gap: 4px;
}

.sync-status.saving {
  color: #e6a23c;
}

.sync-status.saved {
  color: #67c23a;
}

.sync-status.error {
  color: #f56c6c;
}

/* ============ 禁用状态 ============ */
.is-disabled .toolbar {
  opacity: 0.6;
  pointer-events: none;
}

.is-disabled .editor-content {
  color: #909399;
  cursor: not-allowed;
}
</style>
