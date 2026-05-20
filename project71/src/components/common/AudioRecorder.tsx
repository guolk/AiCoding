import React, { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Play, Square, Volume2 } from 'lucide-react'
import clsx from 'clsx'

interface AudioRecorderProps {
  onRecordingComplete?: (audioBlob: Blob, duration: number) => void
  maxDuration?: number
  className?: string
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onRecordingComplete,
  maxDuration = 60,
  className = ''
}) => {
  const [isRecording, setIsRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      setPermissionGranted(true)

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)
        if (onRecordingComplete) {
          onRecordingComplete(audioBlob, duration)
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
      setDuration(0)

      timerRef.current = window.setInterval(() => {
        setDuration(prev => {
          if (prev >= maxDuration) {
            stopRecording()
            return maxDuration
          }
          return prev + 1
        })
      }, 1000)

    } catch (error) {
      console.error('Error accessing microphone:', error)
      setPermissionGranted(false)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
    }
  }

  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const speakText = () => {
    const utterance = new SpeechSynthesisUtterance('Hello, this is a sample pronunciation.')
    utterance.lang = 'en-US'
    utterance.rate = 0.8
    speechSynthesis.speak(utterance)
  }

  return (
    <div className={clsx('flex flex-col items-center gap-4 p-6', className)}>
      <div className="flex items-center gap-8 mb-4">
        <button
          onClick={speakText}
          className="flex flex-col items-center gap-2 p-4 rounded-xl bg-primary-50 hover:bg-primary-100 transition-colors"
        >
          <Volume2 className="w-8 h-8 text-primary-600" />
          <span className="text-sm font-medium text-primary-700">标准发音</span>
        </button>

        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={clsx(
            'relative flex flex-col items-center gap-2 p-6 rounded-full transition-all',
            isRecording
              ? 'bg-red-500 text-white recording-pulse'
              : 'bg-primary-500 text-white hover:bg-primary-600'
          )}
        >
          {isRecording ? (
            <MicOff className="w-10 h-10" />
          ) : (
            <Mic className="w-10 h-10" />
          )}
        </button>

        <button
          onClick={togglePlayback}
          disabled={!audioUrl}
          className={clsx(
            'flex flex-col items-center gap-2 p-4 rounded-xl transition-colors',
            audioUrl
              ? 'bg-green-50 hover:bg-green-100'
              : 'bg-gray-100 cursor-not-allowed'
          )}
        >
          {isPlaying ? (
            <Square className={clsx('w-8 h-8', audioUrl ? 'text-green-600' : 'text-gray-400')} />
          ) : (
            <Play className={clsx('w-8 h-8', audioUrl ? 'text-green-600' : 'text-gray-400')} />
          )}
          <span className={clsx('text-sm font-medium', audioUrl ? 'text-green-700' : 'text-gray-400')}>
            回放录音
          </span>
        </button>
      </div>

      <div className="text-center">
        {isRecording ? (
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-lg font-mono font-semibold text-red-600">
              录音中 {formatTime(duration)} / {formatTime(maxDuration)}
            </span>
          </div>
        ) : audioUrl ? (
          <p className="text-sm text-gray-600">
            录音完成，时长 {formatTime(duration)}
          </p>
        ) : permissionGranted === false ? (
          <p className="text-sm text-red-600">
            无法访问麦克风，请在浏览器设置中允许麦克风权限
          </p>
        ) : (
          <p className="text-sm text-gray-500">
            点击麦克风开始录音
          </p>
        )}
      </div>

      {isRecording && (
        <div className="flex items-end gap-[3px] h-16">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="w-[4px] bg-red-500 rounded-full wave-bar"
              style={{
                animationDelay: `${i * 0.05}s`,
                height: `${Math.random() * 100}%`
              }}
            />
          ))}
        </div>
      )}

      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      )}
    </div>
  )
}
