import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick, ref } from 'vue'
import RichTextEditor from '../../src/components/RichTextEditor.vue'

describe('RichTextEditor.vue', () => {
  let wrapper: VueWrapper<any>
  let consoleLogSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    
    wrapper = mount(RichTextEditor, {
      props: {
        modelValue: '',
        placeholder: '请输入内容...',
        showToolbar: true,
        showWordCount: true
      }
    })
  })

  afterEach(() => {
    consoleLogSpy.mockRestore()
    wrapper.unmount()
  })

  describe('初始化状态', () => {
    it('应该正确初始化 isComposing 为 false', () => {
      expect(wrapper.vm.isComposing).toBe(false)
    })

    it('应该正确初始化 isFocused 为 false', () => {
      expect(wrapper.vm.isFocused).toBe(false)
    })

    it('应该渲染工具栏（当 showToolbar 为 true 时）', () => {
      expect(wrapper.find('.toolbar').exists()).toBe(true)
    })

    it('应该渲染编辑区域', () => {
      expect(wrapper.find('.editor-content').exists()).toBe(true)
    })
  })

  describe('Composition 事件处理', () => {
    it('compositionstart 事件应该设置 isComposing 为 true', async () => {
      const editor = wrapper.find('.editor-content')
      
      expect(wrapper.vm.isComposing).toBe(false)
      
      await editor.trigger('compositionstart')
      
      expect(wrapper.vm.isComposing).toBe(true)
    })

    it('compositionupdate 事件不应该修改 isComposing', async () => {
      const editor = wrapper.find('.editor-content')
      
      await editor.trigger('compositionstart')
      expect(wrapper.vm.isComposing).toBe(true)
      
      await editor.trigger('compositionupdate', { data: 'zhong' })
      
      expect(wrapper.vm.isComposing).toBe(true)
    })

    it('compositionend 事件应该设置 isComposing 为 false', async () => {
      const editor = wrapper.find('.editor-content')
      
      await editor.trigger('compositionstart')
      expect(wrapper.vm.isComposing).toBe(true)
      
      await editor.trigger('compositionend', { data: '中国' })
      
      expect(wrapper.vm.isComposing).toBe(false)
    })

    it('应该正确触发 compositionStart 事件', async () => {
      const editor = wrapper.find('.editor-content')
      
      await editor.trigger('compositionstart', { data: '' })
      
      const emitted = wrapper.emitted('compositionStart')
      expect(emitted).toBeTruthy()
      expect(emitted?.length).toBe(1)
    })

    it('应该正确触发 compositionUpdate 事件', async () => {
      const editor = wrapper.find('.editor-content')
      
      await editor.trigger('compositionupdate', { data: 'zhong' })
      
      const emitted = wrapper.emitted('compositionUpdate')
      expect(emitted).toBeTruthy()
    })

    it('应该正确触发 compositionEnd 事件', async () => {
      const editor = wrapper.find('.editor-content')
      
      await editor.trigger('compositionend', { data: '中国' })
      
      const emitted = wrapper.emitted('compositionEnd')
      expect(emitted).toBeTruthy()
    })
  })

  describe('Input 事件处理', () => {
    it('非组合输入状态下应该调用 processContent', async () => {
      const processContentSpy = vi.spyOn(wrapper.vm, 'processContent')
      const editor = wrapper.find('.editor-content')
      
      expect(wrapper.vm.isComposing).toBe(false)
      
      await editor.trigger('input')
      
      expect(processContentSpy).toHaveBeenCalled()
    })

    it('组合输入状态下不应该调用 processContent', async () => {
      const processContentSpy = vi.spyOn(wrapper.vm, 'processContent')
      const editor = wrapper.find('.editor-content')
      
      await editor.trigger('compositionstart')
      expect(wrapper.vm.isComposing).toBe(true)
      
      await editor.trigger('input')
      
      expect(processContentSpy).not.toHaveBeenCalled()
    })

    it('组合输入结束后应该调用 processContent', async () => {
      const processContentSpy = vi.spyOn(wrapper.vm, 'processContent')
      const editor = wrapper.find('.editor-content')
      
      await editor.trigger('compositionstart')
      await editor.trigger('input')
      
      expect(processContentSpy).not.toHaveBeenCalled()
      
      await editor.trigger('compositionend', { data: '中国' })
      await nextTick()
      
      expect(processContentSpy).toHaveBeenCalled()
    })
  })

  describe('Paste 事件处理', () => {
    it('粘贴事件应该触发 processContent', async () => {
      const processContentSpy = vi.spyOn(wrapper.vm, 'processContent')
      const editor = wrapper.find('.editor-content')
      
      await editor.trigger('paste')
      await nextTick()
      
      expect(processContentSpy).toHaveBeenCalled()
    })

    it('应该正确触发 paste 事件', async () => {
      const editor = wrapper.find('.editor-content')
      
      await editor.trigger('paste')
      
      const emitted = wrapper.emitted('paste')
      expect(emitted).toBeTruthy()
    })
  })

  describe('Focus 和 Blur 事件', () => {
    it('focus 事件应该设置 isFocused 为 true', async () => {
      const editor = wrapper.find('.editor-content')
      
      expect(wrapper.vm.isFocused).toBe(false)
      
      await editor.trigger('focus')
      
      expect(wrapper.vm.isFocused).toBe(true)
    })

    it('blur 事件应该设置 isFocused 为 false', async () => {
      const editor = wrapper.find('.editor-content')
      
      await editor.trigger('focus')
      expect(wrapper.vm.isFocused).toBe(true)
      
      await editor.trigger('blur')
      
      expect(wrapper.vm.isFocused).toBe(false)
    })

    it('失焦时应该调用 processContent', async () => {
      const processContentSpy = vi.spyOn(wrapper.vm, 'processContent')
      const editor = wrapper.find('.editor-content')
      
      await editor.trigger('blur')
      
      expect(processContentSpy).toHaveBeenCalledWith(true)
    })
  })

  describe('v-model 双向绑定', () => {
    it('初始值应该正确设置', async () => {
      const testContent = '<p>测试内容</p>'
      
      const wrapperWithValue = mount(RichTextEditor, {
        props: {
          modelValue: testContent
        }
      })
      
      await nextTick()
      
      // 检查 processContent 是否被调用
      const processContentSpy = vi.spyOn(wrapperWithValue.vm, 'processContent')
      await wrapperWithValue.vm.processContent()
      
      expect(processContentSpy).toHaveBeenCalled()
      
      wrapperWithValue.unmount()
    })

    it('processContent 应该触发 update:modelValue 事件', async () => {
      const editor = wrapper.find('.editor-content')
      
      editor.element.innerHTML = '<p>测试内容</p>'
      
      await editor.trigger('input')
      
      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted).toBeTruthy()
    })

    it('processContent 应该触发 change 事件', async () => {
      const editor = wrapper.find('.editor-content')
      
      editor.element.innerHTML = '<p>测试内容</p>'
      
      await editor.trigger('input')
      
      const emitted = wrapper.emitted('change')
      expect(emitted).toBeTruthy()
    })
  })

  describe('完整场景模拟', () => {
    it('完整的中文拼音输入流程', async () => {
      const processContentSpy = vi.spyOn(wrapper.vm, 'processContent')
      const editor = wrapper.find('.editor-content')
      
      expect(wrapper.vm.isComposing).toBe(false)
      expect(processContentSpy).not.toHaveBeenCalled()
      
      await editor.trigger('compositionstart')
      expect(wrapper.vm.isComposing).toBe(true)
      
      await editor.trigger('compositionupdate', { data: 'zhong' })
      await editor.trigger('compositionupdate', { data: 'zhongg' })
      await editor.trigger('compositionupdate', { data: 'zhonggu' })
      await editor.trigger('compositionupdate', { data: 'zhongguo' })
      
      await editor.trigger('input')
      
      expect(processContentSpy).not.toHaveBeenCalled()
      
      editor.element.innerHTML = '中国'
      
      await editor.trigger('compositionend', { data: '中国' })
      await nextTick()
      
      expect(wrapper.vm.isComposing).toBe(false)
      expect(processContentSpy).toHaveBeenCalled()
    })

    it('英文输入流程', async () => {
      const processContentSpy = vi.spyOn(wrapper.vm, 'processContent')
      const editor = wrapper.find('.editor-content')
      
      expect(wrapper.vm.isComposing).toBe(false)
      
      editor.element.innerHTML = 'H'
      await editor.trigger('input')
      
      expect(processContentSpy).toHaveBeenCalledTimes(1)
      expect(wrapper.vm.isComposing).toBe(false)
      
      editor.element.innerHTML = 'He'
      await editor.trigger('input')
      
      expect(processContentSpy).toHaveBeenCalledTimes(2)
    })

    it('取消拼音输入流程', async () => {
      const processContentSpy = vi.spyOn(wrapper.vm, 'processContent')
      const editor = wrapper.find('.editor-content')
      
      await editor.trigger('compositionstart')
      expect(wrapper.vm.isComposing).toBe(true)
      
      await editor.trigger('compositionupdate', { data: 'nihao' })
      await editor.trigger('input')
      
      expect(processContentSpy).not.toHaveBeenCalled()
      
      await editor.trigger('compositionend', { data: '' })
      await nextTick()
      
      expect(wrapper.vm.isComposing).toBe(false)
      expect(processContentSpy).toHaveBeenCalled()
    })
  })

  describe('工具方法', () => {
    it('cleanHtml 应该清理危险标签', () => {
      const dangerousHtml = '<script>alert("xss")</script><p>安全内容</p>'
      const result = wrapper.vm.cleanHtml(dangerousHtml)
      
      expect(result).not.toContain('<script>')
      expect(result).toContain('<p>安全内容</p>')
    })

    it('cleanHtml 应该保留允许的标签', () => {
      const safeHtml = '<b>粗体</b><i>斜体</i><u>下划线</u>'
      const result = wrapper.vm.cleanHtml(safeHtml)
      
      expect(result).toContain('<b>粗体</b>')
      expect(result).toContain('<i>斜体</i>')
      expect(result).toContain('<u>下划线</u>')
    })

    it('cleanHtml 应该清理 javascript: 协议的链接', () => {
      const dangerousLink = '<a href="javascript:alert(1)">危险链接</a>'
      const result = wrapper.vm.cleanHtml(dangerousLink)
      
      expect(result).not.toContain('javascript:')
    })
  })

  describe('键盘快捷键', () => {
    it('Ctrl+B 应该触发粗体', async () => {
      const execCommandSpy = vi.spyOn(wrapper.vm, 'execCommand')
      const editor = wrapper.find('.editor-content')
      
      await editor.trigger('keydown', {
        ctrlKey: true,
        key: 'b'
      })
      
      expect(execCommandSpy).toHaveBeenCalledWith('bold')
    })

    it('Ctrl+I 应该触发斜体', async () => {
      const execCommandSpy = vi.spyOn(wrapper.vm, 'execCommand')
      const editor = wrapper.find('.editor-content')
      
      await editor.trigger('keydown', {
        ctrlKey: true,
        key: 'i'
      })
      
      expect(execCommandSpy).toHaveBeenCalledWith('italic')
    })

    it('Ctrl+U 应该触发下划线', async () => {
      const execCommandSpy = vi.spyOn(wrapper.vm, 'execCommand')
      const editor = wrapper.find('.editor-content')
      
      await editor.trigger('keydown', {
        ctrlKey: true,
        key: 'u'
      })
      
      expect(execCommandSpy).toHaveBeenCalledWith('underline')
    })
  })

  describe('禁用状态', () => {
    it('disabled 为 true 时应该禁用编辑', async () => {
      const disabledWrapper = mount(RichTextEditor, {
        props: {
          disabled: true
        }
      })
      
      expect(disabledWrapper.classes()).toContain('is-disabled')
      
      disabledWrapper.unmount()
    })

    it('禁用时点击工具栏按钮不应该触发操作', async () => {
      const disabledWrapper = mount(RichTextEditor, {
        props: {
          disabled: true
        }
      })
      
      const execCommandSpy = vi.spyOn(disabledWrapper.vm, 'execCommand')
      
      const boldBtn = disabledWrapper.find('.toolbar-btn')
      await boldBtn.trigger('click')
      
      expect(execCommandSpy).not.toHaveBeenCalled()
      
      disabledWrapper.unmount()
    })
  })
})
