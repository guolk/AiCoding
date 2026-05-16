import React, { useState, useRef, useEffect } from 'react'
import ReactQuill from 'react-quill'
import { format } from 'date-fns'
import {
  Book,
  Camera,
  Mic,
  MapPin,
  CloudSun,
  Lock,
  Save,
  X,
  Palette,
  Tag,
  Star,
} from 'lucide-react'
import { useStore } from '../store/useStore'
import { DiaryEntry, MoodTag, PaperBackground, TemplateType } from '../types'
import { cn, generateId } from '../utils'
import MoodSelector from './MoodSelector'
import DrawingCanvas from './DrawingCanvas'
import StickerPanel from './StickerPanel'
import { stickers } from '../data/stickers'

interface DiaryEditorProps {
  diary?: DiaryEntry | null
  onClose: () => void
  onSave: () => void
}

const DiaryEditor: React.FC<DiaryEditorProps> = ({ diary, onClose, onSave }) => {
  const { addDiary, updateDiary, settings } = useStore()
  const [title, setTitle] = useState(diary?.title || '')
  const [content, setContent] = useState(diary?.content || '')
  const [date, setDate] = useState(diary?.date || format(new Date(), 'yyyy-MM-dd'))
  const [mood, setMood] = useState<MoodTag | null>(diary?.mood || null)
  const [isPrivate, setIsPrivate] = useState(diary?.isPrivate || false)
  const [isImportant, setIsImportant] = useState(diary?.isImportant || false)
  const [paperBackground, setPaperBackground] = useState<PaperBackground>(
    diary?.paperBackground || settings.defaultPaperBackground
  )
  const [template, setTemplate] = useState<TemplateType>(diary?.template || 'default')
  const [tags, setTags] = useState<string[]>(diary?.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [photos, setPhotos] = useState(diary?.photos || [])
  const [drawings, setDrawings] = useState(diary?.drawings || [])
  const [voiceNotes, setVoiceNotes] = useState(diary?.voiceNotes || [])
  const [weather, setWeather] = useState(diary?.weather || null)
  const [location, setLocation] = useState(diary?.location || null)
  const [showDrawing, setShowDrawing] = useState(false)
  const [showStickers, setShowStickers] = useState(false)
  const [stickersOnPage, setStickersOnPage] = useState(diary?.stickers || [])

  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [audioChunks, setAudioChunks] = useState<Blob[]>([])
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  useEffect(() => {
    const makeEditable = () => {
      const editors = document.querySelectorAll('.ql-editor')
      editors.forEach((editor) => {
        editor.setAttribute('contenteditable', 'true')
        editor.style.userSelect = 'text'
        editor.style.webkitUserSelect = 'text'
        editor.style.pointerEvents = 'auto'
        editor.style.cursor = 'text'
      })
      
      const containers = document.querySelectorAll('.ql-container')
      containers.forEach((container) => {
        container.style.pointerEvents = 'auto'
      })
    }

    const timer = setTimeout(makeEditable, 200)
    const timer2 = setTimeout(makeEditable, 500)
    const timer3 = setTimeout(makeEditable, 1000)

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'contenteditable') {
          const target = mutation.target as HTMLElement
          if (target.getAttribute('contenteditable') !== 'true') {
            target.setAttribute('contenteditable', 'true')
          }
        }
      })
    })

    setTimeout(() => {
      const editors = document.querySelectorAll('.ql-editor')
      editors.forEach((editor) => {
        observer.observe(editor, { attributes: true })
      })
    }, 300)

    return () => {
      clearTimeout(timer)
      clearTimeout(timer2)
      clearTimeout(timer3)
      observer.disconnect()
    }
  }, [])

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ color: [] }, { background: [] }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean'],
    ],
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setUploadingPhotos(true)
      let uploadedCount = 0
      
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onload = (event) => {
          const newPhoto = {
            id: generateId(),
            dataUrl: event.target?.result as string,
            createdAt: new Date().toISOString(),
          }
          setPhotos((prev) => [...prev, newPhoto])
          uploadedCount++
          
          if (uploadedCount === files.length) {
            setUploadingPhotos(false)
            setUploadSuccess(true)
            setTimeout(() => setUploadSuccess(false), 2000)
          }
        }
        reader.onerror = () => {
          setUploadingPhotos(false)
          alert('图片上传失败，请重试')
        }
        reader.readAsDataURL(file)
      })
      
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      mediaRecorderRef.current.ondataavailable = (e) => {
        setAudioChunks((prev) => [...prev, e.data])
      }
      mediaRecorderRef.current.start()
      setIsRecording(true)
    } catch (err) {
      alert('无法访问麦克风')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
      const reader = new FileReader()
      reader.onload = (event) => {
        const newVoiceNote = {
          id: generateId(),
          dataUrl: event.target?.result as string,
          duration: 0,
          createdAt: new Date().toISOString(),
        }
        setVoiceNotes([...voiceNotes, newVoiceNote])
        setAudioChunks([])
      }
      reader.readAsDataURL(audioBlob)
    }
  }

  const handleWeatherSelect = (condition: string) => {
    setWeather({
      condition,
      temperature: 20,
      icon: condition === '晴' ? '☀️' : condition === '多云' ? '⛅' : '🌧️',
    })
  }

  const handleLocationSelect = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          address: `${position.coords.latitude.toFixed(2)}, ${position.coords.longitude.toFixed(2)}`,
        })
      })
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const handleSave = () => {
    const diaryData = {
      date,
      title: title || '无标题',
      content,
      mood,
      isPrivate,
      photos,
      drawings,
      voiceNotes,
      weather,
      location,
      stickers: stickersOnPage,
      paperBackground,
      template,
      tags,
      isImportant,
    }

    if (diary) {
      updateDiary(diary.id, diaryData)
    } else {
      addDiary(diaryData)
    }
    onSave()
  }

  const handleDrawingSave = (dataUrl: string) => {
    const newDrawing = {
      id: generateId(),
      dataUrl,
      createdAt: new Date().toISOString(),
    }
    setDrawings([...drawings, newDrawing])
    setShowDrawing(false)
  }

  const handleAddSticker = (stickerId: string) => {
    const newSticker = {
      id: generateId(),
      stickerId,
      x: Math.random() * 50 + 25,
      y: Math.random() * 50 + 25,
      scale: 1,
      rotation: 0,
    }
    setStickersOnPage([...stickersOnPage, newSticker])
  }

  const paperBgClass = {
    grid: 'paper-grid',
    lines: 'paper-lines',
    dots: 'paper-dots',
    blank: 'paper-blank',
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" style={{ pointerEvents: 'auto' }}>
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col card-shadow" style={{ pointerEvents: 'auto' }}>
        <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-primary-50 to-pink-50">
          <div className="flex items-center gap-4">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-300"
            />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="日记标题..."
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-300 w-64"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsImportant(!isImportant)}
              className={cn(
                'p-2 rounded-lg transition-colors',
                isImportant ? 'text-yellow-500 bg-yellow-50' : 'text-gray-400 hover:bg-gray-100'
              )}
            >
              <Star size={20} fill={isImportant ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={() => setIsPrivate(!isPrivate)}
              className={cn(
                'p-2 rounded-lg transition-colors',
                isPrivate ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:bg-gray-100'
              )}
            >
              <Lock size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto relative z-20" style={{ pointerEvents: 'auto' }}>
          <div className={cn('p-6 min-h-96', paperBgClass[paperBackground])} style={{ pointerEvents: 'auto' }}>
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-wrap gap-4 mb-6">
                <MoodSelector selectedMood={mood} onSelect={setMood} />
                
                <div className="flex items-center gap-2">
                  <CloudSun size={18} className="text-gray-500" />
                  <select
                    value={weather?.condition || ''}
                    onChange={(e) => handleWeatherSelect(e.target.value)}
                    className="px-2 py-1 border rounded text-sm"
                  >
                    <option value="">选择天气</option>
                    <option value="晴">☀️ 晴</option>
                    <option value="多云">⛅ 多云</option>
                    <option value="阴">☁️ 阴</option>
                    <option value="雨">🌧️ 雨</option>
                  </select>
                </div>

                <button
                  onClick={handleLocationSelect}
                  className="flex items-center gap-1 px-3 py-1 border rounded text-sm hover:bg-gray-50"
                >
                  <MapPin size={16} className="text-gray-500" />
                  {location ? location.address.slice(0, 15) + '...' : '添加位置'}
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm flex items-center gap-1"
                  >
                    <Tag size={14} />
                    {tag}
                    <button onClick={() => handleRemoveTag(tag)} className="hover:text-primary-900">
                      ×
                    </button>
                  </span>
                ))}
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    placeholder="添加标签..."
                    className="px-2 py-1 border rounded text-sm w-24"
                  />
                  <button
                    onClick={handleAddTag}
                    className="px-2 py-1 bg-primary-500 text-white rounded text-sm"
                  >
                    +
                  </button>
                </div>
              </div>

              <div 
                style={{ position: 'relative', zIndex: 100, pointerEvents: 'auto' }}
                onClick={() => {
                  const editor = document.querySelector('.ql-editor')
                  if (editor) {
                    editor.setAttribute('contenteditable', 'true')
                    editor.focus()
                  }
                }}
              >
                <ReactQuill
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  modules={modules}
                  placeholder="开始记录你的心情和故事..."
                />
              </div>

              {photos.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                    <Camera size={16} />
                    照片 ({photos.length})
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {photos.map((photo) => (
                      <div key={photo.id} className="relative group">
                        <img
                          src={photo.dataUrl}
                          alt="photo"
                          className="w-24 h-24 object-cover rounded-lg border-2 border-transparent group-hover:border-primary-300 transition-all cursor-pointer"
                          onClick={() => window.open(photo.dataUrl, '_blank')}
                        />
                        <button
                          onClick={() => setPhotos((prev) => prev.filter((p) => p.id !== photo.id))}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm hover:bg-red-600 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-md"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {drawings.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">手绘</h4>
                  <div className="flex flex-wrap gap-2">
                    {drawings.map((drawing) => (
                      <div key={drawing.id} className="relative">
                        <img
                          src={drawing.dataUrl}
                          alt="drawing"
                          className="w-24 h-24 object-cover rounded-lg border"
                        />
                        <button
                          onClick={() => setDrawings(drawings.filter((d) => d.id !== drawing.id))}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {voiceNotes.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">语音备忘</h4>
                  <div className="flex flex-wrap gap-2">
                    {voiceNotes.map((note) => (
                      <div key={note.id} className="relative bg-gray-100 rounded-lg p-2">
                        <audio controls src={note.dataUrl} className="h-8" />
                        <button
                          onClick={() => setVoiceNotes(voiceNotes.filter((v) => v.id !== note.id))}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {stickersOnPage.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">贴纸</h4>
                  <div className="flex flex-wrap gap-4">
                    {stickersOnPage.map((s) => {
                      const sticker = stickers.find((st) => st.id === s.stickerId)
                      return sticker ? (
                        <span key={s.id} className="text-3xl">{sticker.emoji}</span>
                      ) : null
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhotos}
              className={cn(
                'flex items-center gap-2 px-4 py-2 border rounded-lg transition-all',
                uploadingPhotos
                  ? 'bg-gray-100 cursor-not-allowed text-gray-400'
                  : 'bg-white hover:bg-gray-50',
                uploadSuccess && 'bg-green-50 border-green-300 text-green-600'
              )}
            >
              <Camera size={18} className={cn(uploadingPhotos && 'animate-spin')} />
              {uploadingPhotos ? '上传中...' : uploadSuccess ? '上传成功!' : '照片'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
            />

            <button
              onClick={() => setShowDrawing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50"
            >
              <Palette size={18} />
              手绘
            </button>

            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={cn(
                'flex items-center gap-2 px-4 py-2 border rounded-lg',
                isRecording
                  ? 'bg-red-500 text-white border-red-500'
                  : 'bg-white hover:bg-gray-50'
              )}
            >
              <Mic size={18} />
              {isRecording ? '停止录音' : '语音'}
            </button>

            <button
              onClick={() => setShowStickers(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50"
            >
              <Book size={18} />
              贴纸
            </button>

            <select
              value={paperBackground}
              onChange={(e) => setPaperBackground(e.target.value as PaperBackground)}
              className="px-3 py-2 bg-white border rounded-lg"
            >
              <option value="lines">横线</option>
              <option value="grid">方格</option>
              <option value="dots">点阵</option>
              <option value="blank">空白</option>
            </select>

            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value as TemplateType)}
              className="px-3 py-2 bg-white border rounded-lg"
            >
              <option value="default">默认模板</option>
              <option value="travel">旅行日记</option>
              <option value="reading">读书笔记</option>
              <option value="mood">心情日记</option>
            </select>
          </div>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            <Save size={18} />
            保存日记
          </button>
        </div>
      </div>

      {showDrawing && (
        <DrawingCanvas
          onSave={handleDrawingSave}
          onClose={() => setShowDrawing(false)}
        />
      )}

      {showStickers && (
        <StickerPanel
          onSelectSticker={handleAddSticker}
          onClose={() => setShowStickers(false)}
        />
      )}
    </div>
  )
}

export default DiaryEditor
