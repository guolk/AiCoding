import React, { useState } from 'react'
import styled from 'styled-components'
import { ComplexityInfo } from '../../types'

const CardContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  cursor: pointer;
`

const CardTitle = styled.h3`
  font-size: 18px;
  color: #333;
  margin: 0;
`

const ToggleButton = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #667eea;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.3s ease;
  
  &:hover {
    background: #f0f0f0;
  }
`

const CardContent = styled.div<{ isExpanded: boolean }>`
  display: ${props => props.isExpanded ? 'block' : 'none'};
  animation: fadeIn 0.3s ease;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`

const ComplexityGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 15px;
`

const ComplexityItem = styled.div`
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
`

const ComplexityLabel = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
  font-weight: 500;
`

const ComplexityValue = styled.div<{ highlight?: boolean }>`
  font-size: 18px;
  font-weight: bold;
  color: ${props => props.highlight ? '#e53e3e' : '#333'};
  font-family: 'Courier New', monospace;
`

const Description = styled.div`
  background: #f0f7ff;
  padding: 15px;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  line-height: 1.6;
  border-left: 4px solid #667eea;
`

interface ComplexityCardProps {
  title: string
  complexity: ComplexityInfo
  defaultExpanded?: boolean
}

const ComplexityCard: React.FC<ComplexityCardProps> = ({
  title,
  complexity,
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <CardContainer>
      <CardHeader onClick={() => setIsExpanded(!isExpanded)}>
        <CardTitle>{title}</CardTitle>
        <ToggleButton>
          {isExpanded ? '−' : '+'}
        </ToggleButton>
      </CardHeader>
      
      <CardContent isExpanded={isExpanded}>
        <ComplexityGrid>
          <ComplexityItem>
            <ComplexityLabel>最佳情况</ComplexityLabel>
            <ComplexityValue>{complexity.bestCase}</ComplexityValue>
          </ComplexityItem>
          
          <ComplexityItem>
            <ComplexityLabel>平均情况</ComplexityLabel>
            <ComplexityValue highlight>{complexity.averageCase}</ComplexityValue>
          </ComplexityItem>
          
          <ComplexityItem>
            <ComplexityLabel>最坏情况</ComplexityLabel>
            <ComplexityValue highlight>{complexity.worstCase}</ComplexityValue>
          </ComplexityItem>
          
          <ComplexityItem>
            <ComplexityLabel>空间复杂度</ComplexityLabel>
            <ComplexityValue>{complexity.spaceComplexity}</ComplexityValue>
          </ComplexityItem>
        </ComplexityGrid>
        
        <Description>
          {complexity.description}
        </Description>
      </CardContent>
    </CardContainer>
  )
}

export default ComplexityCard
