import React, { useState, useEffect } from 'react'
import styled from 'styled-components'

const ControllerContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 15px;
`

const Button = styled.button<{ primary?: boolean; disabled?: boolean }>`
  padding: 10px 20px;
  background: ${props => props.primary ? '#667eea' : '#f0f0f0'};
  color: ${props => props.primary ? 'white' : '#333'};
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background: ${props => props.primary ? '#5a67d8' : '#e0e0e0'};
  }
`

const StepInfo = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
`

const StepDescription = styled.div`
  background: #f8f9fa;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  border-left: 4px solid #667eea;
`

const SpeedControl = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
`

const SpeedLabel = styled.span`
  font-size: 14px;
  color: #666;
`

const SpeedSlider = styled.input`
  width: 100px;
  cursor: pointer;
`

interface AnimationControllerProps {
  currentStep: number
  totalSteps: number
  stepDescription: string
  isPlaying: boolean
  speed: number
  onPlay: () => void
  onPause: () => void
  onStepForward: () => void
  onStepBackward: () => void
  onReset: () => void
  onSpeedChange: (speed: number) => void
  onStepChange?: (step: number) => void
}

const AnimationController: React.FC<AnimationControllerProps> = ({
  currentStep,
  totalSteps,
  stepDescription,
  isPlaying,
  speed,
  onPlay,
  onPause,
  onStepForward,
  onStepBackward,
  onReset,
  onSpeedChange,
  onStepChange,
}) => {
  const [displayStep, setDisplayStep] = useState(currentStep)

  useEffect(() => {
    setDisplayStep(currentStep)
  }, [currentStep])

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStep = parseInt(e.target.value) - 1
    setDisplayStep(newStep)
    onStepChange?.(newStep)
  }

  return (
    <ControllerContainer>
      <StepInfo>
        步骤 {currentStep + 1} / {totalSteps}
        {totalSteps > 0 && (
          <input
            type="range"
            min={1}
            max={totalSteps}
            value={displayStep + 1}
            onChange={handleSliderChange}
            style={{ marginLeft: '10px', cursor: 'pointer' }}
          />
        )}
      </StepInfo>
      
      <StepDescription>
        {stepDescription || '准备就绪，开始操作以查看动画步骤'}
      </StepDescription>

      <Controls>
        <Button onClick={onReset} disabled={totalSteps === 0}>
          ⏮ 重置
        </Button>
        <Button onClick={onStepBackward} disabled={currentStep <= 0}>
          ◀ 上一步
        </Button>
        <Button onClick={isPlaying ? onPause : onPlay} primary disabled={totalSteps === 0 || currentStep >= totalSteps - 1}>
          {isPlaying ? '⏸ 暂停' : '▶ 播放'}
        </Button>
        <Button onClick={onStepForward} disabled={currentStep >= totalSteps - 1}>
          下一步 ▶
        </Button>

        <SpeedControl>
          <SpeedLabel>速度:</SpeedLabel>
          <SpeedSlider
            type="range"
            min={1}
            max={5}
            value={speed}
            onChange={(e) => onSpeedChange(parseInt(e.target.value))}
          />
          <SpeedLabel>{speed}x</SpeedLabel>
        </SpeedControl>
      </Controls>
    </ControllerContainer>
  )
}

export default AnimationController
