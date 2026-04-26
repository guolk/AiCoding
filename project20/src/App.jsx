import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PitchShifter } from '@soundtouchjs/core';
import './App.css';

// 主题配置
const themes = {
  light: {
    name: '浅色主题',
    bg: '#f5f5f5',
    bgLight: '#ffffff',
    text: '#333333',
    textSecondary: '#666666',
    border: '#e0e0e0',
    waveform: '#2196F3',
    waveformLight: '#BBDEFB',
    cursor: '#F44336',
    selection: 'rgba(33, 150, 243, 0.2)',
    button: '#2196F3',
    buttonHover: '#1976D2',
    spectrum: '#2196F3',
    spectrumGradient: ['#2196F3', '#03A9F4', '#00BCD4']
  },
  dark: {
    name: '深色主题',
    bg: '#121212',
    bgLight: '#1E1E1E',
    text: '#E0E0E0',
    textSecondary: '#B0B0B0',
    border: '#333333',
    waveform: '#4CAF50',
    waveformLight: '#A5D6A7',
    cursor: '#FF5722',
    selection: 'rgba(76, 175, 80, 0.2)',
    button: '#4CAF50',
    buttonHover: '#388E3C',
    spectrum: '#4CAF50',
    spectrumGradient: ['#4CAF50', '#8BC34A', '#CDDC39']
  },
  neon: {
    name: '霓虹主题',
    bg: '#0D0D0D',
    bgLight: '#1A1A1A',
    text: '#FFFFFF',
    textSecondary: '#CCCCCC',
    border: '#333333',
    waveform: '#00FFFF',
    waveformLight: '#99FFFF',
    cursor: '#FF00FF',
    selection: 'rgba(0, 255, 255, 0.2)',
    button: '#FF00FF',
    buttonHover: '#CC00CC',
    spectrum: '#00FF00',
    spectrumGradient: ['#FF00FF', '#00FFFF', '#00FF00']
  }
};

const App = () => {
  // 状态管理
  const [audioFile, setAudioFile] = useState(null);
  const [audioBuffer, setAudioBuffer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentTheme, setCurrentTheme] = useState('light');
  const [selection, setSelection] = useState(null);
  const [isLooping, setIsLooping] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [preservePitch, setPreservePitch] = useState(true);
  
  // 引用
  const audioContextRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const analyserRef = useRef(null);
  const startTimeRef = useRef(0);
  const startOffsetRef = useRef(0);
  const animationFrameRef = useRef(null);
  const waveformCanvasRef = useRef(null);
  const spectrumCanvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const pitchShifterRef = useRef(null);
  
  const theme = themes[currentTheme];
  
  // 初始化AudioContext
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      analyserRef.current.connect(audioContextRef.current.destination);
    }
    return audioContextRef.current;
  }, []);
  
  // 处理文件上传
  const handleFileUpload = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setAudioFile(file);
    setIsPlaying(false);
    setCurrentTime(0);
    setSelection(null);
    setIsLooping(false);
    
    try {
      const audioContext = initAudioContext();
      const arrayBuffer = await file.arrayBuffer();
      const buffer = await audioContext.decodeAudioData(arrayBuffer);
      
      setAudioBuffer(buffer);
      setDuration(buffer.duration);
      setIsReady(true);
    } catch (error) {
      console.error('音频解析失败:', error);
      alert('音频解析失败，请选择有效的音频文件');
    }
  }, [initAudioContext]);
  
  // 绘制波形图
  const drawWaveform = useCallback(() => {
    if (!audioBuffer || !waveformCanvasRef.current) return;
    
    const canvas = waveformCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // 清空画布
    ctx.fillStyle = theme.bgLight;
    ctx.fillRect(0, 0, width, height);
    
    // 绘制网格线
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 1;
    
    // 水平中线
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    
    // 获取音频数据
    const channelData = audioBuffer.getChannelData(0);
    const step = Math.ceil(channelData.length / width);
    
    // 绘制波形
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = theme.waveform;
    ctx.beginPath();
    
    // 为每个x像素计算对应的音频样本
    for (let i = 0; i < width; i++) {
      const start = i * step;
      const end = start + step;
      
      // 计算该区域内的最大值和最小值
      let min = 1.0;
      let max = -1.0;
      
      for (let j = start; j < end; j++) {
        const sample = channelData[j];
        if (sample < min) min = sample;
        if (sample > max) max = sample;
      }
      
      // 归一化到画布高度
      const yMin = ((1 + min) / 2) * height;
      const yMax = ((1 + max) / 2) * height;
      
      if (i === 0) {
        ctx.moveTo(i, yMax);
      } else {
        ctx.lineTo(i, yMax);
      }
      
      ctx.lineTo(i, yMin);
    }
    
    ctx.stroke();
    
    // 绘制选择区域
    if (selection) {
      const startX = (selection.start / duration) * width;
      const endX = (selection.end / duration) * width;
      
      ctx.fillStyle = theme.selection;
      ctx.fillRect(startX, 0, endX - startX, height);
      
      // 绘制选择边界
      ctx.strokeStyle = theme.waveform;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(startX, 0);
      ctx.lineTo(startX, height);
      ctx.moveTo(endX, 0);
      ctx.lineTo(endX, height);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    
    // 绘制播放位置游标
    if (audioBuffer && duration > 0) {
      const cursorX = (currentTime / duration) * width;
      
      // 游标线
      ctx.strokeStyle = theme.cursor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cursorX, 0);
      ctx.lineTo(cursorX, height);
      ctx.stroke();
      
      // 游标三角形
      ctx.fillStyle = theme.cursor;
      ctx.beginPath();
      ctx.moveTo(cursorX - 6, 0);
      ctx.lineTo(cursorX + 6, 0);
      ctx.lineTo(cursorX, 8);
      ctx.closePath();
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(cursorX - 6, height);
      ctx.lineTo(cursorX + 6, height);
      ctx.lineTo(cursorX, height - 8);
      ctx.closePath();
      ctx.fill();
    }
  }, [audioBuffer, currentTime, selection, duration, theme]);
  
  // 绘制频谱图
  const drawSpectrum = useCallback(() => {
    if (!analyserRef.current || !spectrumCanvasRef.current) return;
    
    const canvas = spectrumCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      
      analyser.getByteFrequencyData(dataArray);
      
      // 清空画布
      ctx.fillStyle = theme.bgLight;
      ctx.fillRect(0, 0, width, height);
      
      // 绘制频谱
      const barWidth = (width / bufferLength) * 2.5;
      let x = 0;
      
      // 创建渐变
      const gradient = ctx.createLinearGradient(0, height, 0, 0);
      theme.spectrumGradient.forEach((color, index) => {
        gradient.addColorStop(index / (theme.spectrumGradient.length - 1), color);
      });
      
      ctx.fillStyle = gradient;
      
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height;
        
        // 绘制柱子
        ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
        
        x += barWidth;
        if (x > width) break;
      }
    };
    
    draw();
  }, [theme]);
  
  // 辅助函数：使用 PitchShifter 播放音频
  const playWithPitchShifter = useCallback((audioContext, startPosition, shouldLoop) => {
    let bufferToPlay = audioBuffer;
    let startOffset = startPosition;
    let loopBuffer = null;
    
    // 对于循环播放，创建一个只包含选择区域的新 buffer
    if (shouldLoop && selection) {
      const startSample = Math.floor(selection.start * audioBuffer.sampleRate);
      const endSample = Math.floor(selection.end * audioBuffer.sampleRate);
      const length = endSample - startSample;
      
      if (length > 0) {
        loopBuffer = audioContext.createBuffer(
          audioBuffer.numberOfChannels,
          length,
          audioBuffer.sampleRate
        );
        
        for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
          const sourceData = audioBuffer.getChannelData(channel);
          const destData = loopBuffer.getChannelData(channel);
          for (let i = 0; i < length; i++) {
            destData[i] = sourceData[startSample + i];
          }
        }
        
        bufferToPlay = loopBuffer;
        // 调整 startOffset 相对于新 buffer
        startOffset = Math.max(0, startPosition - selection.start);
      }
    }
    
    // 创建 PitchShifter
    const shifter = new PitchShifter(audioContext, bufferToPlay, 16384);
    
    // 设置播放速度（保持音调不变）
    shifter.tempo = playbackRate;
    shifter.pitch = 1.0; // 保持原音调
    
    // 创建增益节点连接到 analyser
    const gainNode = audioContext.createGain();
    gainNode.connect(analyserRef.current);
    
    // 用于检测播放结束
    let lastPercentage = 0;
    let hasEnded = false;
    
    // 监听播放事件
    const playHandler = (detail) => {
      if (hasEnded) return;
      
      let currentTime;
      
      if (shouldLoop && selection && loopBuffer) {
        // 对于循环播放，计算相对于原始 buffer 的时间
        const loopDuration = selection.end - selection.start;
        const relativeTime = detail.percentagePlayed * loopDuration / 100;
        currentTime = selection.start + relativeTime;
        
        // 检测播放是否即将结束（接近 100%）
        if (detail.percentagePlayed >= 99.5 && lastPercentage < 99.5) {
          // 播放即将结束，需要重新开始循环
          hasEnded = true;
          shifter.off('play', playHandler);
          
          // 延迟一点重新开始，确保当前播放完成
          setTimeout(() => {
            if (pitchShifterRef.current === shifter && isLooping) {
              // 断开当前播放
              shifter.disconnect();
              
              // 重新开始循环
              startOffsetRef.current = selection.start;
              playWithPitchShifter(audioContext, selection.start, true);
            }
          }, 50);
          
          return;
        }
      } else {
        currentTime = startOffset + (detail.percentagePlayed * bufferToPlay.duration / 100);
        
        // 检测播放是否结束
        if (detail.percentagePlayed >= 99.5 && lastPercentage < 99.5) {
          hasEnded = true;
          shifter.off('play', playHandler);
          
          setTimeout(() => {
            if (pitchShifterRef.current === shifter) {
              setIsPlaying(false);
              setCurrentTime(duration);
              startOffsetRef.current = duration;
            }
          }, 50);
          
          return;
        }
      }
      
      lastPercentage = detail.percentagePlayed;
      setCurrentTime(Math.min(currentTime, duration));
    };
    
    shifter.on('play', playHandler);
    
    // 连接并开始播放
    shifter.connect(gainNode);
    
    pitchShifterRef.current = shifter;
    sourceNodeRef.current = null;
    
    setIsPlaying(true);
  }, [audioBuffer, playbackRate, selection, isLooping, duration]);
  
  // 播放/暂停控制
  const togglePlay = useCallback(() => {
    if (!audioBuffer || !audioContextRef.current) return;
    
    const audioContext = audioContextRef.current;
    
    if (isPlaying) {
      // 暂停
      if (preservePitch && pitchShifterRef.current) {
        pitchShifterRef.current.disconnect();
        pitchShifterRef.current = null;
      } else if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        sourceNodeRef.current = null;
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      // 计算当前播放位置
      const elapsed = audioContext.currentTime - startTimeRef.current;
      startOffsetRef.current = (startOffsetRef.current + elapsed * playbackRate) % duration;
      setCurrentTime(startOffsetRef.current);
      
      setIsPlaying(false);
    } else {
      // 播放
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      
      startTimeRef.current = audioContext.currentTime;
      
      // 确保从正确的位置开始播放
      if (isLooping && selection) {
        if (startOffsetRef.current < selection.start || startOffsetRef.current > selection.end) {
          startOffsetRef.current = selection.start;
        }
      }
      
      // 开始绘制频谱
      drawSpectrum();
      
      if (preservePitch) {
        // 使用 PitchShifter 保持音调不变
        playWithPitchShifter(audioContext, startOffsetRef.current, isLooping);
      } else {
        // 使用普通的 AudioBufferSourceNode（音调会变化）
        const sourceNode = audioContext.createBufferSource();
        sourceNode.buffer = audioBuffer;
        sourceNode.playbackRate.value = playbackRate;
        sourceNode.connect(analyserRef.current);
        
        // 设置循环播放
        if (isLooping && selection) {
          sourceNode.loop = true;
          sourceNode.loopStart = selection.start;
          sourceNode.loopEnd = selection.end;
        } else {
          sourceNode.loop = false;
        }
        
        // 播放结束处理
        sourceNode.onended = () => {
          if (!isLooping && sourceNodeRef.current) {
            setIsPlaying(false);
            setCurrentTime(duration);
            startOffsetRef.current = duration;
            if (animationFrameRef.current) {
              cancelAnimationFrame(animationFrameRef.current);
            }
          }
        };
        
        sourceNodeRef.current = sourceNode;
        pitchShifterRef.current = null;
        sourceNode.start(0, startOffsetRef.current);
        
        // 更新播放位置
        const updateTime = () => {
          if (isPlaying && audioContextRef.current && sourceNodeRef.current) {
            const elapsed = audioContextRef.current.currentTime - startTimeRef.current;
            let current = (startOffsetRef.current + elapsed * playbackRate);
            
            // 处理循环播放的时间更新
            if (isLooping && selection) {
              const loopDuration = selection.end - selection.start;
              if (current > selection.end) {
                const extra = current - selection.end;
                current = selection.start + (extra % loopDuration);
                startOffsetRef.current = current;
                startTimeRef.current = audioContextRef.current.currentTime;
              }
            }
            
            setCurrentTime(Math.min(current, duration));
            animationFrameRef.current = requestAnimationFrame(updateTime);
          }
        };
        
        animationFrameRef.current = requestAnimationFrame(updateTime);
        setIsPlaying(true);
      }
    }
  }, [audioBuffer, isPlaying, playbackRate, isLooping, selection, duration, drawSpectrum, preservePitch, playWithPitchShifter]);
  
  // 停止播放
  const stopPlayback = useCallback(() => {
    if (preservePitch && pitchShifterRef.current) {
      pitchShifterRef.current.disconnect();
      pitchShifterRef.current = null;
    } else if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current = null;
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    setIsPlaying(false);
    setCurrentTime(0);
    startOffsetRef.current = 0;
  }, [preservePitch]);
  
  // 跳转到指定时间位置
  const seekTo = useCallback((time) => {
    if (!audioBuffer) return;
    
    const wasPlaying = isPlaying;
    if (wasPlaying) {
      // 先停止当前播放
      if (preservePitch && pitchShifterRef.current) {
        pitchShifterRef.current.disconnect();
        pitchShifterRef.current = null;
      } else if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        sourceNodeRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      // 计算当前播放位置
      if (audioContextRef.current) {
        const audioContext = audioContextRef.current;
        const elapsed = audioContext.currentTime - startTimeRef.current;
        startOffsetRef.current = (startOffsetRef.current + elapsed * playbackRate) % duration;
      }
    }
    
    // 设置新的播放位置
    startOffsetRef.current = Math.max(0, Math.min(time, duration));
    setCurrentTime(startOffsetRef.current);
    
    // 如果之前在播放，继续播放
    if (wasPlaying) {
      togglePlay();
    }
  }, [audioBuffer, isPlaying, duration, togglePlay, preservePitch, playbackRate]);
  
  // 波形图点击事件
  const handleWaveformClick = useCallback((e) => {
    if (!audioBuffer || !waveformCanvasRef.current) return;
    
    const canvas = waveformCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const scaleX = canvas.width / rect.width;
    const time = (x * scaleX / canvas.width) * duration;
    
    seekTo(time);
  }, [audioBuffer, duration, seekTo]);
  
  // 波形图拖拽选择
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  
  const handleWaveformMouseDown = useCallback((e) => {
    if (!audioBuffer || !waveformCanvasRef.current) return;
    
    const canvas = waveformCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const scaleX = canvas.width / rect.width;
    const time = (x * scaleX / canvas.width) * duration;
    
    setIsDragging(true);
    setDragStart(time);
    setSelection({ start: time, end: time });
  }, [audioBuffer, duration]);
  
  const handleWaveformMouseMove = useCallback((e) => {
    if (!isDragging || !audioBuffer || !waveformCanvasRef.current) return;
    
    const canvas = waveformCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const scaleX = canvas.width / rect.width;
    const time = (x * scaleX / canvas.width) * duration;
    
    setSelection({
      start: Math.min(dragStart, time),
      end: Math.max(dragStart, time)
    });
  }, [isDragging, audioBuffer, duration, dragStart]);
  
  const handleWaveformMouseUp = useCallback(() => {
    if (isDragging && selection) {
      // 如果选择区域太小，清除选择
      if (selection.end - selection.start < 0.1) {
        setSelection(null);
        setIsLooping(false);
      }
    }
    setIsDragging(false);
  }, [isDragging, selection]);
  
  // 清除选择
  const clearSelection = useCallback(() => {
    const wasPlaying = isPlaying;
    
    // 如果正在播放，先停止当前播放
    if (wasPlaying) {
      if (preservePitch && pitchShifterRef.current) {
        pitchShifterRef.current.disconnect();
        pitchShifterRef.current = null;
      } else if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        sourceNodeRef.current = null;
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      // 计算当前播放位置
      if (audioContextRef.current) {
        const audioContext = audioContextRef.current;
        const elapsed = audioContext.currentTime - startTimeRef.current;
        startOffsetRef.current = (startOffsetRef.current + elapsed * playbackRate) % duration;
      }
    }
    
    setSelection(null);
    setIsLooping(false);
    
    // 如果之前在播放，重新开始播放（不循环）
    if (wasPlaying && audioBuffer && audioContextRef.current) {
      togglePlay();
    }
  }, [isPlaying, audioBuffer, duration, playbackRate, preservePitch, togglePlay]);
  
  // 格式化时间
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  };
  
  // 调整canvas尺寸以适应容器
  const resizeCanvases = useCallback(() => {
    const resize = (canvas, parentSelector) => {
      if (!canvas) return;
      const parent = canvas.closest(parentSelector);
      if (!parent) return;
      
      const dpr = window.devicePixelRatio || 1;
      const rect = parent.getBoundingClientRect();
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
    };
    
    resize(waveformCanvasRef.current, '.waveform-container');
    resize(spectrumCanvasRef.current, '.spectrum-container');
  }, []);
  
  // 绘制波形和频谱
  useEffect(() => {
    if (isReady) {
      drawWaveform();
      if (isPlaying) {
        drawSpectrum();
      }
    }
  }, [isReady, drawWaveform, drawSpectrum, isPlaying, currentTime, selection]);
  
  // 窗口大小变化时调整canvas
  useEffect(() => {
    window.addEventListener('resize', resizeCanvases);
    
    // 延迟执行以确保DOM已渲染
    const timer = setTimeout(() => {
      resizeCanvases();
      if (isReady) {
        drawWaveform();
      }
    }, 100);
    
    return () => {
      window.removeEventListener('resize', resizeCanvases);
      clearTimeout(timer);
    };
  }, [resizeCanvases, isReady, drawWaveform]);
  
  // 清理动画帧
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);
  
  // 更新播放速度
  useEffect(() => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.playbackRate.value = playbackRate;
    }
  }, [playbackRate]);
  
  return (
    <div className="app" style={{ backgroundColor: theme.bg, color: theme.text }}>
      <header className="header">
        <h1>音频波形可视化播放器</h1>
        <div className="theme-selector">
          <label htmlFor="theme-select">主题:</label>
          <select
            id="theme-select"
            value={currentTheme}
            onChange={(e) => setCurrentTheme(e.target.value)}
            style={{ backgroundColor: theme.bgLight, color: theme.text, borderColor: theme.border }}
          >
            {Object.entries(themes).map(([key, value]) => (
              <option key={key} value={key}>{value.name}</option>
            ))}
          </select>
        </div>
      </header>
      
      <main className="main">
        {/* 上传区域 */}
        <section className="upload-section">
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            id="audio-upload"
            style={{ display: 'none' }}
          />
          <label
            htmlFor="audio-upload"
            className="upload-label"
            style={{ backgroundColor: theme.button, color: '#fff' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.buttonHover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.button}
          >
            上传音频文件
          </label>
          {audioFile && (
            <div className="file-info">
              <p>已加载: {audioFile.name}</p>
              <p>时长: {formatTime(duration)}</p>
            </div>
          )}
        </section>
        
        {/* 波形图 */}
        <section className="waveform-section">
          <h2>波形图</h2>
          <div className="waveform-container">
            <canvas
              ref={waveformCanvasRef}
              onClick={handleWaveformClick}
              onMouseDown={handleWaveformMouseDown}
              onMouseMove={handleWaveformMouseMove}
              onMouseUp={handleWaveformMouseUp}
              onMouseLeave={handleWaveformMouseUp}
              className="waveform-canvas"
            />
          </div>
          <div className="time-display">
            <span>{formatTime(currentTime)}</span>
            <span> / {formatTime(duration)}</span>
          </div>
          
          {/* 播放控制 */}
          <div className="controls">
            <button
              onClick={togglePlay}
              disabled={!isReady}
              className="control-button"
              style={{ backgroundColor: theme.button, color: '#fff' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.buttonHover}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.button}
            >
              {isPlaying ? '暂停' : '播放'}
            </button>
            <button
              onClick={stopPlayback}
              disabled={!isReady}
              className="control-button"
              style={{ backgroundColor: theme.button, color: '#fff' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.buttonHover}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.button}
            >
              停止
            </button>
          </div>
          
          {/* 速度控制 */}
          <div className="speed-control">
            <label htmlFor="speed-slider">播放速度: {playbackRate}x</label>
            <input
              id="speed-slider"
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={playbackRate}
              onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
              disabled={!isReady}
            />
            <label className="pitch-preserve-label">
              <input
                type="checkbox"
                checked={preservePitch}
                onChange={(e) => setPreservePitch(e.target.checked)}
                disabled={isPlaying}
              />
              保持音调不变
            </label>
          </div>
          
          {/* 选择区域控制 */}
          {selection && (
            <div className="selection-control">
              <p>
                选择区域: {formatTime(selection.start)} - {formatTime(selection.end)}
                <span style={{ marginLeft: '10px', color: theme.textSecondary }}>
                  (时长: {formatTime(selection.end - selection.start)})
                </span>
              </p>
              <div className="selection-buttons">
                <button
                  onClick={() => setIsLooping(!isLooping)}
                  className="control-button"
                  style={{ 
                    backgroundColor: isLooping ? theme.cursor : theme.button, 
                    color: '#fff' 
                  }}
                >
                  {isLooping ? '取消循环' : '循环播放选中区域'}
                </button>
                <button
                  onClick={clearSelection}
                  className="control-button"
                  style={{ backgroundColor: theme.button, color: '#fff' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.buttonHover}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.button}
                >
                  清除选择
                </button>
              </div>
            </div>
          )}
        </section>
        
        {/* 频谱图 */}
        <section className="spectrum-section">
          <h2>频谱分析 (FFT)</h2>
          <div className="spectrum-container">
            <canvas
              ref={spectrumCanvasRef}
              className="spectrum-canvas"
            />
          </div>
        </section>
        
        {/* 说明 */}
        <section className="instructions">
          <h3>使用说明</h3>
          <ul>
            <li>点击"上传音频文件"按钮选择本地音频文件</li>
            <li>在波形图上点击可以跳转到对应时间位置</li>
            <li>在波形图上拖拽可以选择一段区域，支持循环播放</li>
            <li>播放时会显示实时的频谱分析图</li>
            <li>可以调节播放速度（0.5x 到 2x）</li>
            <li>支持切换不同的主题</li>
          </ul>
        </section>
      </main>
    </div>
  );
};

export default App;