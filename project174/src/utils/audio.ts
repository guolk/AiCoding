export const formatDuration = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return '0:00';
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

export const calculateSNR = (audioBuffer: AudioBuffer): number => {
  const channelData = audioBuffer.getChannelData(0);
  let signalSum = 0;
  let noiseSum = 0;
  const threshold = 0.01;
  
  for (let i = 0; i < channelData.length; i++) {
    const sample = Math.abs(channelData[i]);
    if (sample > threshold) {
      signalSum += sample * sample;
    } else {
      noiseSum += sample * sample;
    }
  }
  
  if (noiseSum === 0) return 60;
  
  const snr = 10 * Math.log10(signalSum / noiseSum);
  return Math.max(0, Math.min(100, snr));
};

export const generateWaveformData = (
  audioBuffer: AudioBuffer,
  samples: number = 1000
): number[] => {
  const channelData = audioBuffer.getChannelData(0);
  const blockSize = Math.floor(channelData.length / samples);
  const waveformData: number[] = [];
  
  for (let i = 0; i < samples; i++) {
    let max = 0;
    const start = i * blockSize;
    
    for (let j = 0; j < blockSize; j++) {
      const sample = Math.abs(channelData[start + j]);
      if (sample > max) max = sample;
    }
    
    waveformData.push(max);
  }
  
  return waveformData;
};

export const generateSpectrogramData = (
  audioBuffer: AudioBuffer,
  fftSize: number = 2048,
  overlap: number = 0.5
): number[][] => {
  const channelData = audioBuffer.getChannelData(0);
  const hopSize = Math.floor(fftSize * (1 - overlap));
  const numFrames = Math.floor((channelData.length - fftSize) / hopSize) + 1;
  const spectrogram: number[][] = [];
  
  const window = (n: number, N: number) => {
    return 0.5 * (1 - Math.cos(2 * Math.PI * n / (N - 1)));
  };
  
  for (let i = 0; i < numFrames; i++) {
    const start = i * hopSize;
    const frame: number[] = [];
    
    for (let j = 0; j < fftSize; j++) {
      const sample = channelData[start + j] || 0;
      frame.push(sample * window(j, fftSize));
    }
    
    const fft = performFFT(frame);
    const magnitude = fft.slice(0, fftSize / 2).map(c => 
      20 * Math.log10(Math.sqrt(c.re * c.re + c.im * c.im) + 1)
    );
    
    spectrogram.push(magnitude);
  }
  
  return spectrogram;
};

const performFFT = (data: number[]): { re: number; im: number }[] => {
  const n = data.length;
  const result: { re: number; im: number }[] = [];
  
  for (let k = 0; k < n; k++) {
    let re = 0;
    let im = 0;
    
    for (let t = 0; t < n; t++) {
      const angle = -2 * Math.PI * k * t / n;
      re += data[t] * Math.cos(angle);
      im += data[t] * Math.sin(angle);
    }
    
    result.push({ re, im });
  }
  
  return result;
};

export const getFrequencyColor = (magnitude: number, min: number, max: number): string => {
  const normalized = Math.max(0, Math.min(1, (magnitude - min) / (max - min)));
  const hue = (1 - normalized) * 240;
  return `hsl(${hue}, 100%, ${50 + normalized * 30}%)`;
};

export const loadAudioBuffer = async (
  url: string,
  audioContext: AudioContext
): Promise<AudioBuffer> => {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return audioContext.decodeAudioData(arrayBuffer);
};

export const getTimeOfDay = (hour: number): string => {
  if (hour >= 4 && hour < 6) return '黎明';
  if (hour >= 6 && hour < 12) return '上午';
  if (hour >= 12 && hour < 17) return '下午';
  if (hour >= 17 && hour < 19) return '黄昏';
  if (hour >= 19 && hour < 22) return '夜晚';
  return '深夜';
};

export const getSeason = (month: number): string => {
  if (month >= 3 && month < 6) return '春季';
  if (month >= 6 && month < 9) return '夏季';
  if (month >= 9 && month < 12) return '秋季';
  return '冬季';
};
